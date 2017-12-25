//index.js
//获取应用实例
const app = getApp()
const commonFun = require('../../utils/util.js');
Page({
    data: {
        wordNum: "字数：0/500",
        isHintHidden: true
    },
    onLoad: function() {
        const wordNum = this.data.wordNum;
        const keptInput = wx.getStorageSync("div_detail");
        if (keptInput) {
            this.setData({
                inputText: keptInput.inputText,
                wordNum: keptInput.wordNum
            })
        }
  	},
    clear: function(e) {
        this.setData({
            inputText: "",
            wordNum: `字数：0/500`
        })
    },
    inputText: function(e) {
        let buttonActive = "";
        this.setData({
            wordNum: `字数：${e.detail.value.length}/500`,
            inputText: e.detail.value
        })
    },
    textBlur: function(e) {
        if (!e.detail.value.trim()) {
            this.setData({
                buttonActive: ""
            })
        }
    },
    save: function() {
        wx.setStorageSync("div_detail", {
            inputText: this.data.inputText,
            wordNum: this.data.wordNum
        });
        wx.navigateBack({
            delta: 1
        })
    }
})
