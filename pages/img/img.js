//index.js
//获取应用实例
const app = getApp()
const commonFun = require('../../utils/util.js');
Page({
    data: {
        domain: app.globalData.domain,
        pics: [],
        isHintHidden: true
    },
    onLoad: function() {
        const pics = wx.getStorageSync("div_pics");
        this.setData({
            pics: pics || []
        })
    	
  	},
    upLoadImg: function() {
        const that = this;
        let pics = this.data.pics;
        wx.chooseImage({
            count: 3, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                pics = pics.concat(tempFilePaths);
                that.setData({
                    pics
                })
            }
        })
    },
    delete: function(e) {
        const index = e.currentTarget.dataset.index;
        const pics = this.data.pics;
        const remainPics = [];
        for (let i = 0, max = pics.length; i < max; i += 1) {
            if (i != index ) {
                remainPics.push(pics[i]);
            }
        }
        this.setData({
            pics: remainPics
        })
    },
    cancel: function() {
        wx.navigateBack({
          delta: 1
        })
    },
    preview: function(e) {
        const index = e.currentTarget.dataset.index;
        wx.previewImage({
            current: this.data.pics[index], // 当前显示图片的http链接
            urls: this.data.pics // 需要预览的图片http链接列表
        })
    },
    conform: function(e) {
        const pics = this.data.pics;
        const picsL = pics.length;
        const that = this;
        if (picsL === 0) {
            const hintText = "图片未添加";
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
        } else {
            //上传活动相关图片pics(过滤已经上传的)
            app.loading();
            const unLoadedPics = pics.filter((pic) => {
                return pic.indexOf("korjo") == -1;
            })
            const loadedPics = pics.filter((pic) => {
                return pic.indexOf("korjo") > -1;
            })
            if (unLoadedPics.length === 0) {
                that.goCreate(loadedPics)
            } else {
                app.uploadBanner(unLoadedPics[0], function(res1) {
                  unLoadedPics[0] = that.data.domain + res1;
                  if (unLoadedPics.length === 1) {
                     that.goCreate(unLoadedPics.concat(loadedPics));
                  }
                  if (unLoadedPics.length > 1) {
                    app.uploadBanner(unLoadedPics[1], function(res2) {
                        unLoadedPics[1] = that.data.domain + res2;
                        if (unLoadedPics.length === 2) {
                             that.goCreate(unLoadedPics.concat(loadedPics));
                        }
                        if (unLoadedPics.length > 2) {
                          app.uploadBanner(unLoadedPics[2], function(res3) {
                            unLoadedPics[2] = that.data.domain + res3;
                            that.goCreate(unLoadedPics.concat(loadedPics));                 
                          });
                        }
                    });
                  }
                });
            }
            
        }
    },
    goCreate: function(pics) {
        wx.setStorageSync('div_pics', pics);
        wx.navigateBack({
          delta: 1
        })
    },
    hideHint: function() {
        this.setData({
            isHintHidden: true
        })
    }
})
