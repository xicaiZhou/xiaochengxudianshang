// pages/good-detail/index.js
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    autoplay:true,
    interval:3000,
    duration: 1000,
    swiperCurrent: 0,  
    goodsDetail:{},
    selectSizePrice:0,
    hasMoreSelect:false,
    selectSize:'选择:',
    orderID:0,
    shopNum:0,
    hideShopPopup:true,
    goodNum:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    console.log(e.id);
    var orderID = e.id;
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
    this.setData({
      orderID: orderID
    })
    wx.request({
      url: 'https://api.it120.cc/tz/shop/goods/detail',
      data: { id: orderID},
      success:this.bindgoodDetailData.bind(this)
    })
  },
  bindgoodDetailData(res){
    var that = this;
    console.log("商品详情",res);
    var selectSizeTemp = "";
    if (res.data.data.properties) {
      for (var i = 0; i < res.data.data.properties.length; i++) {
        selectSizeTemp = selectSizeTemp + " " + res.data.data.properties[i].name;
      }
      that.setData({
        hasMoreSelect: true,
        selectSize: that.data.selectSize + selectSizeTemp,
        selectSizePrice: res.data.data.basicInfo.minPrice,
        totalScoreToPay: res.data.data.basicInfo.minScore
      });
    }
    that.setData({
      goodsDetail:res.data.data,
      selectSizePrice: res.data.data.basicInfo.minPrice,
      totalScoreToPay: res.data.data.basicInfo.minScore,
      buyNumMax: res.data.data.basicInfo.stores,
      buyNumber: (res.data.data.basicInfo.stores > 0) ? 1 : 0
    })
    WxParse.wxParse('article', 'html', res.data.data.content, that, 5);

    //如果有视频
    if (res.data.data.basicInfo.videoId) {
      // 根据视频id取到视频连接
      that.getVideoSrc(res.data.data.basicInfo.videoId);
    }
    that.reputation(that.data.orderID);
  },
  
  getVideoSrc(id){
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/tz/media/video/detail',
      data: {
        videoId: id
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            videoMp4Src: res.data.data.fdMp4
          });
        }
      }
    })
  },
  reputation(orderID) { // 评论
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/tz/shop/goods/reputation',
      data: {
        goodsId: orderID
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 0) {
          that.setData({
            reputation: res.data.data
          });
        }
      }
    })
  },
  //UI交互
  bindGuiGeTap(){
    this.setData({
      hideShopPopup: false
    }) 
  },
  hideShopPopup(){
    this.setData({
      hideShopPopup: true
    }) 
  },
  onPageScroll(e) {
    this.hideShopPopup();
  },
  noHide(){
    this.bindGuiGeTap();
  }
})