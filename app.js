//app.js
const apiUrl = 'https://korjo.fans-me.com/KorjoApi/GetSessionKey';
App({
    getUser: function (callback) {
        if (!wx.getStorageSync('divUserInfo')) {
            wx.login({
                success: function(res) {
                    console.log(res.code);
                    const code = res.code;
                    if (code) {
                        wx.request({
                            url: apiUrl,
                            data: {id: 1, js_code: code},
                            dataType: "json",
                            header: {
                               'content-type': 'application/x-www-form-urlencoded'
                            },
                            success: function(response) {
                               const result = JSON.parse(response.data);
                               console.log(result);
                               wx.setStorageSync('divUserInfo', result);
                               callback();
                            }
                        });
                    }
                }
            });
        } else {
            callback()
        }
    },
    loading: function() {
        if (wx.showLoading) {
            wx.showLoading({
                title: '加载中',
                mask: true
            })
        } else {
            wx.showToast({
               title: "加载中",
               icon: "loading",
               mask: true,
               duration: 100000
            });
        }
    },
    hideLoading: function() {
        if (wx.showLoading) {
            wx.hideLoading();
        } else {
            wx.hideToast()
        }
    },
    uploadBanner: function(img, callback) {
        wx.uploadFile({
            url: 'https://korjo.fans-me.com/KorjoApi/AdminUpload',
            filePath: img,
            name: 'file',
            formData: {
                path: "korjo",
                type: "image"
            },
            success: function(res) {
                callback(res.data);
            }
        })
    },
    globalData: {
        domain: "https://korjo.fans-me.com",
        btns:[{
            btn: "邮箱",
            icon: "email",
            active: ""
        },{
            btn: "性别",
            icon: "gender",
            active: ""
        },{
            btn: "年龄",
            icon: "age",
            active: ""
        },{
            btn: "备注",
            icon: "note",
            active: ""
        }],
        choices:[{
            btn: "文本问题",
            icon: "q",
            active: "",
            type: 3
        },{
            btn: "文本问题",
            icon: "q",
            active: "",
            type: 3
        },{
            btn: "单选题",
            icon: "radio",
            active: "",
            type: 1
        },{
            btn: "单选题",
            icon: "radio",
            active: "",
            type: 1
        },{
            btn: "多选题",
            icon: "checkbox",
            active: "",
            type: 2
        },{
            btn: "多选题",
            icon: "checkbox",
            active: "",
            type: 2
        }]
    }
})
