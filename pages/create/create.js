//index.js
//获取应用实例
const app = getApp()
const commonFun = require('../../utils/util.js');
const bannersUrl = "/korjoApi/GetDiyBanners";
const getUrl = "/korjoApi/GetDiyActivityInfo";
const saveUrl = "/KorjoApi/SaveDiyActivity";
const mapApi = "https://maps.google.cn/maps/api/geocode/json";
Page({
    data: {
      domain: app.globalData.domain,
      btns: app.globalData.btns,
      choices: app.globalData.choices,
      isCanvasShow: "none",
      wordNum: "填写",
      isJoin: false,
     	isLightboxHidden: true,
      isHintHidden: true,
      hostPhone: "",
      locationInfo: {
          address: "",
          latitude: "",
          longitude: ""
      }
    },
    onLoad: function(options) {
        //编辑旧活动
        this.id = options.id;
        if (this.id) {
            this.getResultData(this.id);
        } else {
          //创建活动
          //获取之前填的数据
          this.creationData = wx.getStorageSync("creationData");
          if (this.creationData) {
              this.setData({
                  gatheringTitle: this.creationData.title,
                  locationInfo: this.creationData.locationInfo,
                  banner: this.creationData.banner,
                  host: this.creationData.host,
                  hostPhone: this.creationData.hostPhone
              })
          } else {
              this.creationData = {}
          }
          this.fetchStorageData();
          this.getDate();
          this.getTime();
        }
        //获取海报图片
        this.conformBannerType();
  	},
    getResultData: function(id) {
      const that = this;
      wx.setNavigationBarTitle({
          title: '编辑活动',
          success: function(res) {
            app.loading();
            commonFun.getRequest(that.data.domain + getUrl, {id}, function(response) {
              const res = JSON.parse(response.data.datajson);
              //活动文字详情
              wx.setStorageSync("div_detail", res.detail || {inputText: "", wordNum: "字数：0/500"});
              //相关图片
              wx.setStorageSync("div_pics", res.pics || []);
              wx.setStorageSync("qs", res.qs);
              if (res.qs) {
                const btns = that.data.btns;
                const choices = that.data.choices;
                for (let ii = 0, max = res.qs.defaultQuestions.length; ii < max; ii += 1) {
                  btns[res.qs.defaultQuestions[ii].index].active = "active";
                }
                for (let idx = 0, max = res.qs.questions.length; idx < max; idx += 1) {
                  choices[res.qs.questions[idx].index].active = "active";
                }
                wx.setStorageSync("registrationWays", {
                  btns: btns,
                  choices: choices
                })
              }
              that.setData({
                banner: res.banner,
                gatheringTitle: res.title,
                locationInfo: {
                  name: res.name,
                  address: res.address,
                  latitude: res.latitude,
                  longitude: res.longitude
                },
                beDate: res.beDate,
                beTime: res.beTime,
                enDate: res.enDate,
                enTime: res.enTime,
                host: res.host,
                hostPhone: res.hostPhone,
                isPublic: Number(response.data.ispublic),
                isJoin: Number(response.data.ispublic) == 1 ? true : false
              })
              that.creationData = {
                banner: res.banner,
                title: res.title,
                locationInfo: {
                  name: res.name,
                  address: res.address,
                  latitude: res.latitude,
                  longitude: res.longitude
                },
                host: res.host,
                hostPhone: res.hostPhone
              }
              that.fetchStorageData();
              app.hideLoading();
            })
          }
      })
    },
    onShow: function() {
        this.fetchStorageData();
    },
    fetchStorageData: function() {
        const pics = wx.getStorageSync("div_pics");
        let wordNum = this.data.wordNum;
        let qsLength = 0;
        const keptInput = wx.getStorageSync("div_detail");
        if (keptInput) {
            wordNum = keptInput.wordNum;
        }
        const qs = wx.getStorageSync("qs");
        let questionsL = 0;
        let defaultQuestionsL = 0;
        if (qs) {
          if (qs.questions) {
            questionsL = qs.questions.length;
          }
          if (qs.defaultQuestions) {
            defaultQuestionsL = qs.defaultQuestions.length;
          }
          qsLength = questionsL + defaultQuestionsL;
        }
        this.setData({
            qs,
            qsLength,
            wordNum,
            pics,
            imgNumHint: `已上传${pics.length}张图片`
        })
    },
    getDate: function() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const beDate = String(year) + "-" + commonFun.formatNumber(month) + "-" + commonFun.formatNumber(day);
      this.setData({
          beDate,
          beStart: String(year) + "-01-01",
          beEnd: String(year + 1) + "-12-31",
          enDate: beDate,
          enStart: String(year) + "-01-01",
          enEnd: String(year + 1) + "-12-31"
      })
    },
    getTime: function() {
      const date = new Date();
      const hour = date.getHours() + 1;
      const beTime = commonFun.formatNumber(hour) + ":00";
      const enTime = commonFun.formatNumber(hour + 1) + ":00";
      this.setData({
        beTime,
        enTime
      })
    },
    chooseBeDate: function(e) {
      this.setData({
        beDate: e.detail.value
      })
    },
    chooseBeTime: function(e) {
      this.setData({
        beTime: e.detail.value
      })
    },
    chooseEnDate: function(e) {
      this.setData({
        enDate: e.detail.value
      })
    },
    chooseEnTime: function(e) {
      this.setData({
        enTime: e.detail.value
      })
    },
    getImg: function(e) {
      this.setData({
        isLightboxHidden: false
      })
    },
  	conformBannerType: function(e) {
      const that = this;
      const imgFolder = [{
        id: 1,
        type: "show",
        title: "演出/展会/赛事",
        icon: "down-arrow",
        hidden: false
      },{
        id: 2,
        type: "holiday",
        title: "婚礼/生日/庆祝",
        icon: "down-arrow",
        hidden: false
      },{
        id: 3,
        type: "party",
        title: "会议/聚会",
        icon: "down-arrow",
        hidden: false
      },{
        id: 4,
        type: "travel",
        title: "旅游/户外",
        icon: "down-arrow",
        hidden: false
      }];
      for (let item of imgFolder) {
        this.requestBanners(item.type, (result) => {
            item.banners = result;
            that.setData({
              imgFolder
            })
            app.hideLoading();
        })
      }
  	},
    requestBanners: function(folder, callback) {
      app.loading();
      const data = {
        dir_name: folder
      }
      commonFun.getRequest(`${this.data.domain}${bannersUrl}`, data, (res)=> {
          callback(res.data);
      })
    },
    chooseImg: function(e) {
      const dataset = e.currentTarget.dataset;
      this.setData({
        isLightboxHidden: true,
        banner: this.data.domain + this.data.imgFolder[dataset.index].banners[dataset.idx]
      })
      this.creationData.banner = this.data.banner;
      wx.setStorageSync("creationData", this.creationData);
    },
  	closeImgs: function() {
  		this.setData({
  			isLightboxHidden: true
  		})
  	},
    toggleImgs: function(e) {
      const imgFolder = this.data.imgFolder;
      const index = e.currentTarget.dataset.index;
      const hidden = imgFolder[index].hidden;
      if (hidden) {
         imgFolder[index].hidden = false;
         imgFolder[index].icon = "down-arrow";
      } else {
         imgFolder[index].hidden = true;
         imgFolder[index].icon = "up-arrow"
      }
      this.setData({
        imgFolder
      })
    },
    chooseLocation: function(e) {
        const that = this;
        const hintText = "将自动获取您的地理位置为活动地点\n您也可以通过点击地图右上方的搜索图标来修改";
        this.setData({
            isHintHidden: false,
            hintText
        })
        setTimeout(that.conformLocation, 1500);
    },
    conformLocation: function() {
      const that = this;
      app.loading();
      wx.chooseLocation({
          success: function(result) {
              wx.hideToast();
              const locationInfo = {
                  name: result.name,
                  address: result.address,
                  latitude: result.latitude,
                  longitude: result.longitude
              }
              that.creationData.locationInfo = locationInfo;
              wx.setStorageSync("creationData", that.creationData);
              that.setData({
                  locationInfo,
                  isHintHidden: true
              })
          },
          complete: function(res) {
              wx.hideToast();
              if (res.errMsg.indexOf("cancel") > -1) {
              } else if (res.errMsg.indexOf("fail") > -1) {
                  //如果是定位失败
                  const hintText = "无法定位您当前的位置，请确认\n已经允许微信使用定位服务。检查方法如下：\n请到手机系统【设置】->【隐私】->【定位】\n服务中打开位置服务，并允许微信使用定位服务。"
                  that.setData({
                      isHintHidden: false,
                      hintText
                  })
              }
          }
      })
    },
    goDetail: function() {
        wx.navigateTo({
            url: "../detail/detail"
        })
    },
    goImg: function() {
        wx.navigateTo({
            url: "../img/img"
        })
    },
    titleInput: function(e) {
        this.creationData.title = e.detail.value;
        wx.setStorageSync("creationData", this.creationData);
        this.setData({
            gatheringTitle: e.detail.value
        })
    },
    hostInput: function(e) {
        this.creationData.host = e.detail.value;
        wx.setStorageSync("creationData", this.creationData);
        this.setData({
            host: e.detail.value
        })
    },
    hostPhoneInput: function(e) {
        this.creationData.hostPhone = e.detail.value;
        wx.setStorageSync("creationData", this.creationData);
        this.setData({
            hostPhone: e.detail.value
        })
    },
    chooseWays: function(e) {
        wx.navigateTo({
            url: "../ways/ways"
        })
    },
    upLoadImg: function() {
        const that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                that.setData({
                    banner: tempFilePaths[0],
                    isLightboxHidden: true
                })
                that.creationData.banner = that.data.banner;
                wx.setStorageSync("creationData", that.creationData);
            }
        })
    },
    checkIsActive: function() {
        const banner = this.data.banner;
        const address = this.data.locationInfo ? this.data.locationInfo.address : "";
        const title = this.data.gatheringTitle;
        const host = this.data.host;
        if (!banner || !address || !title || !host) {
            if (!banner) {
                this.showHint("活动海报未提供")
            } else if (!title) {
                this.showHint("活动名称未填写")
            } else if (!address) {
                this.showHint("活动地点未提供")
            } else if (!host) {
                this.showHint("活动主办方未填写")
            }

            return false;
        } else {
            return true;
        }
    },
    showHint: function(hintText) {
        this.setData({
            isHintHidden: false,
            hintText: hintText
        })
        setTimeout(this.hideHint, 1500);
    },
    goTimeline: function() {
        wx.redirectTo({
            url: "../timeline/timeline"
        })
    },
    join: function(e) {
        this.setData({
            isJoin: e.detail.value
        })
    },
    getCity: function(lat, lng, callback) {
        commonFun.getRequest(mapApi, {
            project: "mapapi-177608",
            key: "AIzaSyAMIfzJ5gooZ2SrXXADxaQBJmHMtjpXbAQ",
            latlng: lat + "," + lng
        }, (response) => {
            callback(response.data.results);
        })
    },
    createShareImg: function(data) {
        const that = this;
        this.setData({
           isCanvasShow: "block"
        })
        //获取屏幕宽度，用于分享图canvas
        const ctx = wx.createCanvasContext('shareImg');
        ctx.drawImage(that.data.banner, 0, 0, that.windowWidth, that.windowWidth / 1.5);
        ctx.setFillStyle('#67bcdb');
        ctx.fillRect(0, that.windowWidth / 1.5, that.windowWidth, that.data.canvasHeight - (that.windowWidth / 1.5));
        ctx.setFillStyle('#ffffff');
        ctx.setFontSize(18);
        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle')
        ctx.fillText(`${that.data.enDate} ${that.data.enTime}:00 结束`, that.windowWidth / 2, that.data.canvasHeight - (that.data.canvasHeight - (that.windowWidth / 1.5)) / 2);
        ctx.draw();
        setTimeout(()=> {
          that.getShareImg(data, (shareImg) => {
              data.shareImg = shareImg;
              that.sendRequest(data);
              console.log(shareImg)
          })
        }, 100);
    },
    getShareImg: function(data, callback) {
        const that = this;
        wx.canvasToTempFilePath({
            canvasId: 'shareImg',
            success: function(res) {
                app.uploadBanner(res.tempFilePath, function(result) {
                  const shareImg = that.data.domain + result;
                  callback(shareImg);
                  console.log("success: ", shareImg)
                })
            },
            fail: function(res) {
                console.log("fail: ", that.data.banner)
                callback(that.data.banner);
            }
        })
    },
    save: function() {
        // 是否满足提交条件
        if (!this.checkIsActive()) {
           return;
        }
        const that = this;
        const beginTime = commonFun.formatDate(`${this.data.beDate} ${this.data.beTime}:00`);
        const endTime = commonFun.formatDate(`${this.data.enDate} ${this.data.enTime}:00`);
        const now = new Date().getTime();
        if (now > endTime.getTime()) {
            const hintText = "结束时间需大于当前时间";
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
            return;
        }
        if (beginTime.getTime() > endTime.getTime()) {
            const hintText = "开始时间需小于结束时间";
            this.setData({
                isHintHidden: false,
                hintText
            })
            setTimeout(this.hideHint, 1500);
            return;
        }
        app.loading();
        let banner = this.data.banner;
        let pics = this.data.pics;
        //如果banner是临时图片，上传banner
        if (this.data.banner.indexOf(this.data.domain) === -1) {
            app.uploadBanner(this.data.banner, function(result) {
                banner = that.data.domain + result;
                that.makeData(banner);
            });
        } else {
            that.makeData(banner);
        }
    },
    makeData: function(banner) {
        const that = this;
        const locationInfo = that.data.locationInfo;
        const data = {
            banner: banner,
            title: that.data.gatheringTitle,
            name: locationInfo.name,
            address: locationInfo.address,
            latitude: locationInfo.latitude,
            longitude: locationInfo.longitude,
            beDate: that.data.beDate,
            beTime: that.data.beTime,
            enDate: that.data.enDate,
            enTime: that.data.enTime,
            host: that.data.host,
            hostPhone: that.data.hostPhone,
            detail: wx.getStorageSync("div_detail"),
            pics: that.data.pics,
            qs: that.data.qs
        }
        const creationData = {
            title: that.data.gatheringTitle,
            locationInfo: locationInfo,
            banner: banner,
            host: that.data.host,
            hostPhone: that.data.hostPhone,

        }
        wx.setStorageSync("creationData", creationData);
        if (that.data.isJoin) {
          // 如果是公开活动，通过google map获取城市
          that.getCity(locationInfo.latitude,locationInfo.longitude, (res) => {
              if (res.length > 0) {
                  const addressData = res[0].address_components;
                  if (addressData[addressData.length - 2].short_name != "CN") {
                      data.city = addressData[addressData.length - 2].long_name;
                  } else {
                      // 国内城市
                      for (let v of addressData) {
                          if (v.types.indexOf("locality") > -1) {
                              data.city = v.long_name;
                          }
                      }
                  }
              } else {
                  data.city = locationInfo.address;
              }
              that.saveData(data);
          })

        } else {
            that.saveData(data);
        }
    },
    saveData: function(data) {
        const that = this;
        //canvas 宽度为图片宽，若canvas宽带小于图片会模糊
        that.windowWidth = 410;
        that.setData({
          windowWidth: that.windowWidth,
          canvasHeight: that.windowWidth * 4 / 5
        });
        //需要下载图片后drawImage, 否则手机做不成
        wx.downloadFile({
          url: that.data.banner,
          success: function(response) {
            if (response.statusCode == 200) {
              that.setData({
                banner: response.tempFilePath
              })
              that.createShareImg(data);

            }
          }
        })
    },
    sendRequest: function(data) {
        const that = this;
        app.getUser(function() {
            const dataJson = {
                userid: wx.getStorageSync('divUserInfo').openid,
                ispublic: that.data.isJoin ? 1 : 0,
                end_date: `${that.data.enDate} ${that.data.enTime}:00`,
                dataJson: JSON.stringify(data)
            }
            if (that.id) {
              //修改活动
              dataJson.id = that.id;
              wx.request({
                  url: that.data.domain + saveUrl,
                  data: {dataJson: JSON.stringify(dataJson)},
                  method: 'POST',
                  header: {
                      'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function(response) {
                    // 清空详情与相关图片
                      wx.setStorageSync("div_pics", "");
                      wx.setStorageSync("div_detail", "");
                      wx.setStorageSync("qs", "");
                      const result =  response.data;
                      wx.redirectTo({
                          url: "../result/result?id=" + that.id
                      })
                  }
              });
            } else {
              //创建活动
              wx.request({
                  url: that.data.domain + saveUrl,
                  data: {dataJson: JSON.stringify(dataJson)},
                  method: 'POST',
                  header: {
                      'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function(response) {
                    // 清空详情与相关图片
                      wx.setStorageSync("div_pics", "");
                      wx.setStorageSync("div_detail", "");
                      wx.setStorageSync("qs", "");
                      const result =  response.data;
                      const id = JSON.parse(result.replace(/[()]/g,'')).data;
                      wx.redirectTo({
                          url: "../result/result?id=" + id
                      })
                  }
              });
            }

        })
    },
    hideHint: function() {
        this.setData({
            isHintHidden: true
        })
    }
})
