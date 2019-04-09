// pages/authorize/index.js
Page({
  bindGetUserInfo(e){
    console.log(e.detail.userInfo);
    if(!e.detail.userInfo){
      return;
    }
    //拿到并保存userInfo
    wx.setStorageSync('userInfo', e.detail.userInfo);
    //登录
    this.login();
  }, 
  login(){
    let token = wx.getStorageSync('token');
    if(token){
      console.log("有token");
      wx.request({
        url: 'https://api.it120.cc/tz/user/check-token',
        data:{
          token:token
        },
        success:this.bindToken.bind(this)
      })
      return;
    }
    console.log("没有token");
    wx.login({
      success: this.bindWXLogin.bind(this)
    })
  },
  bindToken(res){
    console.log(res);
    if (res.data.code != 0) {
      wx.removeStorageSync('token')
      this.login();
    } else {
      // 回到原来的地方放
      wx.navigateBack();
    }
  },
  bindWXLogin(res){
    console.log(res.code);
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/tz/user/wxapp/login',
      data:{code:res.code,
        AppID: 'wxccb4d27dd5e44bc0'},
      success: function (res) {
        console.log(res)
        if (res.data.code == 10000) {
          // 去注册
          console.log('没有注册！')
          that.registerUser();
          return;
        }
        if (res.data.code != 0) {
          console.log('登录错误！')
          // 登录错误
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '无法登录，请重试',
            showCancel: false
          })
          return;
        }
        wx.setStorageSync('token', res.data.data.token)
        wx.setStorageSync('uid', res.data.data.uid)
        // 回到原来的地方放
        wx.navigateBack();
      }
    })
  },
  registerUser(){
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function (res) {
            var iv = res.iv;
            var encryptedData = res.encryptedData;
            // 下面开始调用注册接口
            wx.request({
              url: 'https://api.it120.cc/tz/user/wxapp/register/complex',
              data: { code: code, encryptedData: encryptedData, iv: iv }, // 设置请求的 参数
              success: (res) => {
                console.log("res");
                console.log(res);
                wx.hideLoading();
                that.login();
              }
            })
          }
        })
      }
    })
  }
})