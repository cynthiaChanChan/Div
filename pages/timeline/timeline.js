const commonFun = require('../../utils/util.js');
const app = getApp();
const listUrl = "https://korjo.fans-me.com/KorjoApi/GetDiyActivityListByUserID";
const registeredUrl = "https://korjo.fans-me.com/korjoApi/GetUserActivityByUserID";
Page({
    data: {
        isLightboxHidden: true,
        listsArray: [],
        isHintHidden: true,
        isNullHidden: true,
        activeIndex: 0,
        types: [{
            title: "我发布的活动",
            active: "active"
        },{
            title: "我报名的活动",
            active: ""
        }]
    },
    onLoad: function(options) {
        app.getUser(this.requestGatherData);
        app.getUser(this.requestRegistered);
    },
    checkType: function(e) {
        const index = e.currentTarget.dataset.index;
        const types = this.data.types;
        types[this.data.activeIndex].active = "";
        types[index].active = "active";
        this.setData({
            types,
            activeIndex: index
        })
    },
    requestRegistered: function() {
        const that = this;
        let isNullHidden = true;
        commonFun.getRequest(registeredUrl, {userid: wx.getStorageSync('divUserInfo').openid}, function(response) {
            const resultList = response.data;
            const items = [];
            if (resultList.length > 0) {
                for (let result of resultList) {
                    const dataObj = JSON.parse(result.datajson);
                    items.push({id: result.activity_id, dataObj});
                }
            } else {
                isNullHidden = false;
            }
            that.setData({
                items,
                isNullHidden
            })
        })
    },
    requestGatherData: function() {
        const that = this;
        let isHintHidden = true;
        app.loading();
        commonFun.getRequest(listUrl, {userid: wx.getStorageSync('divUserInfo').openid}, function(response) {
            const resultList = response.data;
            const listsArray = [];
            if (resultList.length > 0) {
                for (let result of resultList) {
                    const dataObj = JSON.parse(result.datajson);
                    if (result.userList.length > 0) {
                        for (let i of result.userList) {
                            if (i.datajson) {
                                i.datajson = JSON.parse(i.datajson);
                            }
                        }
                    }
                    listsArray.push({id: result.id, dataObj, userList: result.userList, isHidden: true});

                }

            } else {
                isHintHidden = false;
            }
            that.setData({
                isHintHidden: isHintHidden,
                listsArray: listsArray
            })
            app.hideLoading();
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
        wx.redirectTo({
            url: "../result/result?id=" + id
        })
    },
    add: function(e) {
        wx.redirectTo({
            url: "../create/create"
        })
    },
    goAll: function(e) {
        wx.redirectTo({
            url: "../all/all"
        })
    },
    showEnrollData: function(e) {
        const index = e.currentTarget.dataset.index;
        const idx = e.currentTarget.dataset.idx;
        const customQuestions = this.data.listsArray[index].userList[idx];
        for (let i of customQuestions.datajson) {
            if (typeof(i.answer) == "string" && i.type != 3) {
                i.radios[i.answer].checked = true;
            } else if (typeof(i.answer) != "string" && i.type != 3) {
                for (let y of i.answer) {
                    i.radios[y].checked = true;
                }
            }

        }
        this.setData({
            isLightboxHidden: false,
            customQuestions
        })
    },
    closeImgs: function(e) {
        this.setData({
            isLightboxHidden: true
        })
    }
})
