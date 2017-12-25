//index.js
//获取应用实例
const app = getApp()

Page({
  	data: {

  	},
    // onLoad: function() {
    //   wx.redirectTo({
    //     url: "../create/create?id=9"
    //   })
    // },
  	goCreate: function() {
  		wx.navigateTo({
  			url: "../create/create"
  		})
  	},
  	goTimeline: function() {
  		wx.navigateTo({
  			url: "../timeline/timeline"
  		})
  	},
    goAll: function() {
      wx.navigateTo({
        url: "../all/all"
      })
    }
})
