//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    swiperCurrent:0,
    activeCategoryId:0,
    scrollTop:0,
    hasNoCoupons:true,
    goods: [],
    curPage: 1,
    pageSize: 20,
    searchText:'',
    loadingMoreHidden:true
  },
  onLoad(){
    //网络请求
    wx.request({ //轮播图
      url: 'https://api.it120.cc/tz/banner/list',
      success:this.bindLoopViewData.bind(this)
    }),
    wx.request({ //分类
      url: 'https://api.it120.cc/tz/shop/goods/category/all',
      success:this.bindKindsTitleNameData.bind(this)
    }),
    wx.request({ // 公告
      url: 'https://api.it120.cc/tz/notice/list',
      data: { pageSize: 5 },
      success:this.bindNoticeData.bind(this)
    }),
    wx.request({ // 优惠券
      url: 'https://api.it120.cc/tz/discounts/coupons',
      data: {
        type: ''
      },
      success: this.bindCouponsData.bind(this)
    })
  },
  //网络请求接受处理数据

  bindLoopViewData(res){
    console.log(res);
    this.setData({
      banners:res.data.data
    })
  },
  bindKindsTitleNameData(res){
    console.log(res);
    var categories  = [{id:0,name:"全部"}];
    if (res.data.code == 0){
      for (var i = 0; i < res.data.data.length; i++) {
        categories.push(res.data.data[i]);
      }
    }
    console.log(categories);
    this.setData({
      categories: categories
    })
    // 加载底部商品列表
    this.getGoodsList(0);

  },
  bindNoticeData(res){
    console.log(res.data);
    if (res.data.code == 0) {
      this.setData({
        noticeList: res.data.data
      });
    }
  },
  bindCouponsData(res){
    console.log(res.data);
    if (res.data.code == 0) {
      this.setData({
        hasNoCoupons: false,
        coupons: res.data.data
      });
    }
  },
  getGoodsList(categoryId, append){ 

    wx.showLoading({
      "mask": true
    })
    wx.request({
      url: 'https://api.it120.cc/tz/shop/goods/list',
      data: {
        categoryId: categoryId,
        nameLike: this.data.searchText,
        page: this.data.curPage,
        pageSize: this.data.pageSize
      },
      success:this.bindGoodsListData.bind(this)
    })
  },
  bindGoodsListData(res){
    wx.hideLoading();
    if(res.data.code == 404 || res.data.code == 700){
      let newData = { loadingMoreHidden: false }
      this.setData(newData);
      return
    }
    let goods = [];
    if (this.data.curPage == 1){
      goods = [];
    }else{
      goods = this.data.goods
    }

    for (var i = 0; i < res.data.data.length; i++) {
      goods.push(res.data.data[i]);
    }
    console.log(goods);

    this.setData({
      loadingMoreHidden: true,
      goods: goods,
    });
  },
  //UI交互
  selectKind(e){
    console.log(e.currentTarget.id);
    this.setData({
      activeCategoryId:e.currentTarget.id,
      curPage: 1
    })
    // 加载底部商品列表
    this.getGoodsList(e.currentTarget.id);
  },
  tapBanner(e){
    if (e.currentTarget.dataset.id == 0) return;

    var ID = e.currentTarget.id;
    var dataID = e.currentTarget.dataset.id;
    console.log(dataID);
    wx.navigateTo({
      url: "/pages/good-detail/index?id=" + dataID
    })
  },
  listenerSearchInput(e){
    this.setData({
      searchText:e.detail.value
    })
  },
  toSearch(e){
    this.setData({
      curPage: 1
    });
    // 加载底部商品列表
    this.getGoodsList(this.data.activeCategoryId);
  },
  gitCoupon(e){
    wx.request({
      url: 'https://api.it120.cc/tz/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: wx.getStorageSync('token')
      },
      success:this.bindGitCunponData.bind(this)
    })
  },
  bindGitCunponData(res){
    console.log(res);
    
    if (res.data.code == 20001 || res.data.code == 20002) {
      wx.showModal({
        title: '错误',
        content: '来晚了',
        showCancel: false
      })
      return;
    }
    if (res.data.code == 20003) {
      wx.showModal({
        title: '错误',
        content: '你领过了，别贪心哦~',
        showCancel: false
      })
      return;
    }
    if (res.data.code == 30001) {
      wx.showModal({
        title: '错误',
        content: '您的积分不足',
        showCancel: false
      })
      return;
    }
    if (res.data.code == 20004) {
      wx.showModal({
        title: '错误',
        content: '已过期~',
        showCancel: false
      })
      return;
    }
    if (res.data.code == 0) {
      wx.showToast({
        title: '领取成功，赶紧去下单吧~',
        icon: 'success',
        duration: 2000
      })
    } else {
      wx.showModal({
        title: '错误',
        content: res.data.msg,
        showCancel: false
      })
    }
  },
  toDetailsTap(e){
    console.log(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: "/pages/good-detail/index?id=" + e.currentTarget.dataset.id
    })
  },
  onReachBottom () {
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(this.data.activeCategoryId, true)
  },
  onPullDownRefresh (e) {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId)
  },
  onPageScroll(e){
    console.log(e)
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  }

})
