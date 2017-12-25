//index.js
//获取应用实例
const app = getApp()
const commonFun = require('../../utils/util.js');
Page({
    data: {
        wordNum: "字数：0/500",
        isHintHidden: true,
        questions: [],
        defaultQuestions: [],
        btns: app.globalData.btns,
        choices: app.globalData.choices
    },
    onLoad: function() {
        const qs = wx.getStorageSync("qs");
        const registrationWays = wx.getStorageSync("registrationWays");
        if (qs) {
            this.setData({
                questions: qs.questions,
                defaultQuestions: qs.defaultQuestions,
                btns: registrationWays.btns,
                choices: registrationWays.choices
            })
        }

  	},
    clickBtn: function(e) {
        const index = e.currentTarget.dataset.index;
        const defaultQuestions = this.data.defaultQuestions;
        const btns = this.data.btns;
        if (btns[index].active) {
            btns[index].active = ""
        } else {
            btns[index].active = "active";
        }
        if (btns[index].active) {
            defaultQuestions.push({
                index,
                placeholder: btns[index].btn
            })
        } else {
            for (let item of defaultQuestions) {
                if (item.index == index) {
                    defaultQuestions.splice(defaultQuestions.indexOf(item), 1);
                }
            }
        }
        this.setData({
            btns,
            defaultQuestions
        })
    },
    clickChoice: function(e) {
        const index = e.currentTarget.dataset.index;
        const type = e.currentTarget.dataset.type;
        const choices = this.data.choices;
        const questions = this.data.questions;
        let radios = [];
        if (choices[index].active) {
            choices[index].active = "";
        } else {
            if (questions.length > 0) {
                if (this.checkIsEmpty(questions)) {
                    return;
                }
            }
            choices[index].active = "active";
        }
        if (choices[index].active) {
            let placeholder = ""
            if (type == 1) {
                placeholder = "输入单选标题(15字以内)";
                radios = [{
                    value: ""
                    }, {
                    value: ""
                }]
            } else if (type == 2) {
                placeholder = "输入多选标题(15字以内)";
                radios = [{
                    value: ""
                    }, {
                    value: ""
                }]
            } else if (type == 3) {
                placeholder = "输入文本问题标题(15字以内)";
            }
            questions.push({
                index,
                type,
                placeholder,
                questionTitle: "",
                icon: "type" + type,
                radios
            });
        } else {
            for (let item of questions) {
                if (item.index == index) {
                    questions.splice(questions.indexOf(item), 1);
                }
            }
        }
        this.setData({
            choices,
            questions
        })
    },
    checkIsEmpty: function(questions) {
        const lastOne = questions[questions.length - 1];
        if (!lastOne.questionTitle || !lastOne.questionTitle.trim()) {
            const hintText = "请先输入上个问题的标题";
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
            return true;
        } else if (lastOne.type != 3) {
            const emptyRadios = lastOne.radios.filter((item) => {
                return item.value.trim() == ""
            })
            if (emptyRadios.length > 0) {
                const hintText = "请先输入上个问题的选项";
                this.setData({
                    isHintHidden: false,
                    hintText
                })
                setTimeout(this.hideHint, 1500);
                return true;
            }
        }
    },
    titleInput: function(e) {
        const idx = e.currentTarget.dataset.idx;
        const questions = this.data.questions;
        questions[idx].questionTitle = e.detail.value;
        this.setData({
            questions
        })
    },
    answerInput: function(e) {
        const index = e.currentTarget.dataset.index;
        const idx = e.currentTarget.dataset.idx;
        const questions = this.data.questions;
        questions[idx].radios[index].value = e.detail.value;
        this.setData({
            questions
        })
    },
    switchChange: function(e) {
        const idx = e.currentTarget.dataset.idx;
        const questions = this.data.questions;
        if (!e.detail.value) {
          questions[idx].required = false;
        } else {
          questions[idx].required = true;
        }
        this.setData({
            questions
        })
    },
    switchChange2: function(e) {
        const index = e.currentTarget.dataset.index;
        const defaultQuestions = this.data.defaultQuestions;
        if (!e.detail.value) {
          defaultQuestions[index].required = false;
        } else {
          defaultQuestions[index].required = true;
        }
        this.setData({
            defaultQuestions
        })
    },
    addRadio: function(e) {
        const questions = this.data.questions;
        const idx = e.currentTarget.dataset.idx;
        questions[idx].radios.push({
            value: ""
        });
        this.setData({
            questions
        })
    },
    deleteRadio: function(e) {
        const questions = this.data.questions;
        const idx = e.currentTarget.dataset.idx;
        const index = e.currentTarget.dataset.index;
        questions[idx].radios.splice(index, 1);
        this.setData({
            questions
        })
    },
    hideHint: function() {
        this.setData({
            isHintHidden: true
        })
    },
    save: function() {
        const that = this;
        const defaultQuestions = this.data.defaultQuestions;
        const questions = this.data.questions
        if (questions.length > 0) {
            if (this.checkIsEmpty(questions)) {
                return;
            }
        }
        const qs = {
            defaultQuestions,
            questions
        }
        wx.setStorageSync("qs", qs);
        wx.setStorageSync("registrationWays", {
            btns: that.data.btns,
            choices: that.data.choices
        });
        wx.navigateBack({
            delta: 1
        })
    }
})
