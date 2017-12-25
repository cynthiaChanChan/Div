const commonFun = require('../../utils/util.js');
const app = getApp();
const listUrl = "https://korjo.fans-me.com/korjoApi/GetDiyActivityListByPublic";
const userPulicList = "https://korjo.fans-me.com/korjoApi/GetDiyActivityListByOtherUserID";
Page({
    data: {
        isHintHidden: true,
        isNullHidden: true
    },
    onLoad: function(options) {
        const that = this;
        if (options.userid) {
            //查看用户公开的活动
            wx.setNavigationBarTitle({
                title: '该用户公开的活动',
                success: function(res) {
                    // success
                    that.getuserPulicList(options.userid);
                }
            })
            that.setData({
                user: true
            })

        } else {
            //所有公开活动
            app.getUser(this.requestRegistered);
            that.setData({
                user: false
            })
        }
    },
    getuserPulicList: function(userid) {
        const that = this;
        let isNullHidden = true;
        app.loading();
        commonFun.getRequest(userPulicList, {userid}, function(response) {
            const resultList = response.data;
            const items = [];
            if (resultList.length > 0) {
                for (let result of resultList) {
                    const dataObj = JSON.parse(result.datajson);
                    items.push({id: result.id, userid: result.userid, dataObj});
                }
            } else {
                isNullHidden = false;
            }
            that.setData({
                items,
                isNullHidden
            })
            app.hideLoading();
        })
    },
    requestRegistered: function() {
        const that = this;
        let isNullHidden = true;
        app.loading();
        commonFun.getRequest(listUrl, {ispublic: 1}, function(response) {
            const resultList = response.data;
            const items = [];
            if (resultList.length > 0) {
                for (let result of resultList) {
                    const dataObj = JSON.parse(result.datajson);
                    items.push({id: result.id, userid: result.userid, dataObj});
                }
            } else {
                isNullHidden = false;
            }
            that.setData({
                items,
                isNullHidden
            })
            app.hideLoading();
        })
    },
    goUserList: function(e) {
        wx.redirectTo({
            url: "../all/all?userid=" + e.currentTarget.dataset.userid
        })
    },
    getAcceptance: function(e) {
        const index = e.currentTarget.dataset.index;
        const listsArray = this.data.listsArray;
        const hidden = listsArray[index].isHidden;
        listsArray[index].isHidden = !hidden;
        this.setData({
            listsArray: listsArray
        })
    },
    goResult: function(e) {
        const that = this;
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "../result/result?id=" + id + "&share=true"
        })
    },
    goTimeline: function(e) {
        wx.redirectTo({
            url: "../timeline/timeline"
        })
    },
    add: function(e) {
        wx.redirectTo({
            url: "../create/create"
        })
    }
})
