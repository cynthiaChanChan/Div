//index.js
//获取应用实例
const app = getApp()
const commonFun = require('../../utils/util.js');
const getUrl = "/korjoApi/GetDiyActivityInfo";
Page({
    data: {
        domain: app.globalData.domain,
        isHintHidden: true
    },
    onLoad: function(options) {
        const that = this;
        this.id = options.id;
        app.loading();
        this.enrollData = wx.getStorageSync("enrollData") || {};
        this.setData({
            nameInput: that.enrollData.name || "",
            phoneInput: that.enrollData.phone || ""
        })
        //获取自定义的报名问题
        commonFun.getRequest(this.data.domain + getUrl, {id: options.id}, function(response) {
            const result = JSON.parse(response.data.datajson);
            const qs = result.qs;
            if (qs) {
                const customQuestions = that.customQuestions(qs);
                that.setData({
                    customQuestions
                })
            }
            app.hideLoading();
        })
  	},
    customQuestions: function(qs) {
        const customQuestions = []
        if (qs.defaultQuestions.length > 0) {
            for (let q of qs.defaultQuestions) {
                let h2 = q.placeholder;
                if (q.required) {
                    h2 += " *"
                }
                customQuestions.push({
                    questionTitle: h2,
                    required : q.required,
                    type: 3
                })
            }
        }
        if (qs.questions.length > 0) {
            for (let q of qs.questions) {
                let h3 =  q.questionTitle
                if (q.required) {
                    h3 += " *"
                }
                customQuestions.push({
                    questionTitle: h3,
                    required : q.required,
                    radios: q.radios,
                    type: q.type
                })
            }
        }
        return customQuestions;
    },
    clear: function(e) {
        this.setData({
            inputText: "",
            wordNum: `字数：0/500`
        })
    },
    radioChange: function(e) {
        const idx = e.currentTarget.dataset.idx;
        const customQuestions = this.data.customQuestions;
        customQuestions[idx].answer = e.detail.value;
        this.customQuestions = customQuestions;

    },
    checkboxChange: function(e) {
        const idx = e.currentTarget.dataset.idx;
        const customQuestions = this.data.customQuestions;
        customQuestions[idx].answer = e.detail.value;
        this.customQuestions = customQuestions;
    },
    nameInput: function(e) {
        this.enrollData.name = e.detail.value;
        this.setData({
            nameInput: e.detail.value
        })
    },
    phoneInput: function(e) {
        this.enrollData.phone = e.detail.value;
        this.setData({
            phoneInput: e.detail.value
        })
    },
    phoneBlur: function(e) {
        const phone = e.detail.value;
        this.validatePhone(phone);
        
    },
    validatePhone: function(phone) {
        const phoneRe = /^[0-9]{11}$/;
        const result = phoneRe.test(phone);
        let hintText = "手机号格式错误"
        if (!result && phone) {
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
            return true;
        }
    },
    validateAnswer: function(email) {
        const emailRe = /^[\w.%+\-]+@[\w.\-]+\.[A-Za-z]{2,6}$/;
        const result = emailRe.test(email);
        let hintText = "邮箱格式错误";
        if (email && !result) {
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
            this.invalidEmail = true;
            return true;
        } else {
            this.invalidEmail = false;
        }
    },
    answerInput: function(e) {
        const idx = e.currentTarget.dataset.idx;
        const customQuestions = this.data.customQuestions;
        customQuestions[idx].answer = e.detail.value.trim();
        this.customQuestions = customQuestions;
    },
    answerBlur: function(e) {
        const value = e.detail.value;
        const idx = e.currentTarget.dataset.idx;
        const customQuestions = this.data.customQuestions;
        if (customQuestions[idx].questionTitle.indexOf("邮箱") === 0) {
            this.validateAnswer(value);
        }
    },
    save: function(e) {
        const that = this;
        const data = this.data;
        if (this.validatePhone(this.data.phoneInput)) {
            return;
        } else if (this.checkEmpty()) {
            return;
        } else if (this.invalidEmail) {
            let hintText = "邮箱格式错误";            
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
            return;
        }  
        app.getUser(function() {
            const dataJson = {
                username: data.nameInput,
                phone: data.phoneInput,
                activity_id: Number(that.id),
                userid: wx.getStorageSync('divUserInfo').openid,
                datajson: JSON.stringify(that.customQuestions)
            }
            wx.request({
                url: "https://korjo.fans-me.com/korjoApi/SaveDiyActivityUser",
                data: {dataJson: JSON.stringify(dataJson)},
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: function(response) {
                    wx.setStorageSync("enrollData", {
                        name: that.enrollData.name,
                        phone: that.enrollData.phone
                    })
                    const msg = JSON.parse(response.data.replace(/[()]/g,'')).msg;
                    let title = "提交成功";
                    if (msg == "用户已经存在") {
                        title = "您已经报名";
                    }
                    wx.showToast({
                        title: title,
                        icon: "success",
                        duration: 1500
                    });
                    setTimeout(() => {
                        wx.redirectTo({
                            url: "../result/result?id=" + that.id + "&share=true"
                        })
                    }, 1500);
                }
            })
        })
        
    },
    hideHint: function() {
        this.setData({
            isHintHidden: true
        })
    },
    checkEmpty: function() {
        const name = this.data.nameInput.trim();
        const phone = this.data.phoneInput.trim();
        const customQuestions = this.data.customQuestions;
        let otherEmpetyArray = [];
        if (customQuestions) {
            otherEmpetyArray = customQuestions.filter((item) => {
                return item.required && !item.answer;
            });
        }
        let hintText = "";
        if (!name && !phone) {        
            hintText = "请填写姓名与电话";
        } else if (!name) {
            hintText = "请填写姓名";
        } else if (!phone) {
            hintText = "请填写电话";
        } else if (otherEmpetyArray.length > 0) {
            for (let i of otherEmpetyArray) {
                if (i.radios && i.radios.length > 0) {
                    hintText += "请选择" + i.questionTitle + "\n";
                } else {
                    hintText += "请填写" + i.questionTitle + "\n";
                }
            }
            hintText = hintText.replace(/\*/g, "");
        }
        if (hintText) {
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
            return true;
        }
    }
})
