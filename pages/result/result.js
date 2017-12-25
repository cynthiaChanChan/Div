//index.js
//获取应用实例
const app = getApp()
const commonFun = require('../../utils/util.js');
const getUrl = "/korjoApi/GetDiyActivityInfo";
const userList = "/korjoApi/GetUserListByDiyActivity";
Page({
    data: {
        isHintHidden: true,
        isFormHidden: true,
        notShare: true,
        domain: app.globalData.domain,
        activeIndex: 0,
        sameUser: false,
        lists: [{
            title: "活动细节",
            active: "active"
        },{
            title: "活动详情",
            active: ""
        },{
            title: "相关图片",
            active: ""
        }]
    },
    onLoad: function(options) {
        const that = this;
        this.id = options.id;
        that.share = options.share;
        if (that.share) {
            that.setData({
                notShare: false
            })
        }
        app.loading();
        commonFun.getRequest(this.data.domain + getUrl, {id: options.id}, function(response) {
            const res = JSON.parse(response.data.datajson);
            commonFun.getRequest(that.data.domain + userList, {activity_id: options.id}, function(resData) {
                //如果不是当前微信号的用户，隐藏编辑活动按钮
                let sameUser = that.data.sameUser;
                if (response.data.userid == wx.getStorageSync("divUserInfo").openid) {
                  sameUser = true;
                  console.log(res)
                }
                that.setData({
                    result: {
                        res,
                        userList: resData.data,
                        userid: response.data.userid
                    },
                    sameUser,
                    hasEditBtn: sameUser ? "has" : ""
                });
                app.hideLoading();
            })
        })
  	},
    checkList: function(e) {
        const index = e.currentTarget.dataset.index;
        const lists = this.data.lists;
        lists[this.data.activeIndex].active = "";
        lists[index].active = "active";
        this.setData({
            lists,
            activeIndex: index
        })
    },
    openLocation: function(e) {
        const result = this.data.result;
        wx.openLocation({
            latitude: result.res.latitude,
            longitude: result.res.longitude,
            scale: 16,
            name: result.res.name,
            address: result.res.address
        })
    },
    goAll: function(e) {
        wx.redirectTo({
            url: "../all/all"
        })
    },
    goCreate: function(e) {
        wx.redirectTo({
            url: `../create/create?id=${this.id}`
        })
    },
    goUserList: function(e) {
        wx.redirectTo({
            url: "../all/all?userid=" + e.currentTarget.dataset.userid
        })
    },
    onShareAppMessage: function(res) {
        const that = this;
        return {
            title: "邀您参与" + that.data.result.res.title,
            path: "/pages/result/result?id=" + that.id + "&share=true",
            imageUrl: that.data.result.res.shareImg || that.data.result.res.banner,
            success: function(res) {
            },
            fail: function(res) {
            // 转发失败
            }
        }
    },
    call: function() {
        wx.makePhoneCall({
           phoneNumber: this.data.result.res.hostPhone
        })
    },
    goTimeline: function() {
        wx.redirectTo({
            url: "../timeline/timeline"
        })
    },
    create: function() {
        const that = this;
        const result = this.data.result;
        const now = new Date().getTime();
        const endTime = commonFun.formatDate(`${result.res.enDate} ${result.res.enTime}:00`);
        if (endTime.getTime() <= now) {
            const hintText = "活动时间已结束，无法报名";
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
        } else {
            wx.navigateTo({
                url: "../enroll/enroll?id=" + this.id
            })
        }
    },
    hideHint: function() {
        this.setData({
            isHintHidden: true
        })
    }

})
