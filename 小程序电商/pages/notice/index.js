// pages/notice/index.js
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('公告id：'+options.id)
    wx.request({
      url: 'https://api.it120.cc/tz/notice/detail?id=161',
      data: { id: options.id},
      success:this.bindData.bind(this)
    })
  },
  bindData(res){
    console.log('公告详情', res.data.data);
    this.setData({
      notice:res.data.data
    });
    WxParse.wxParse('article', 'html', res.data.data.content, this, 5);

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})