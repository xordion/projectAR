//index.js
import * as THREE from '../../libs/three.weapp.min.js'
// import { OrbitControls } from '../../jsm/loaders/OrbitControls'
//获取应用实例
const app = getApp()

Page({
  originTouchPos: { x: 0, y: 0 },
  oldTouchPos: { x: 0, y: 0 },
  newTouchPos: { x: 0, y: 0 },
  firstDir: '',

  originTime: 0,
  oldTime: 0,
  newTime: 0,

  ax: 0,
  ay: 0,
  time: 0,

  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showCamera: false,
    xRotation: 0,
    yRotation: 0,
    dx: 0,
    dy: 0,

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.getLocation()
    // console.log(element.$('.userInfo'))
    // window.addEventListener('deviceorientation', handleFunc, false);

    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              this.getLocation()
            }
          })
        }
      }
    })


    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  showAR(){
    console.log('ar show')
    this.setData({
      showCamera: true
    })
    this.ctx = wx.createCameraContext()

    wx.startGyroscope({
      interval: 'game',
      success:(response)=>{
        // console.log(response)
        wx.onGyroscopeChange((res)=> {//陀螺仪{x,y,z}
        let angleFormat = (rad)=>{
          return rad *180 / Math.PI /(1000/20)
        }
          // let x = angleFormat(res.x), 
          // y=angleFormat(res.y), 
          // z=angleFormat(res.z)
          // if(Math.abs(x)>=90 || Math.abs(y)>=90 || Math.abs(z)>=90){
          //   console.info(new Date(), x,y,z);
          // }
          this.setData({
            yRotation: this.data.yRotation + angleFormat(res.x)
          })
        })
      }
    })

    wx.onCompassChange((res) => {//罗盘
      // console.info('campass' + JSON.stringify(res))
      // campass{ "direction": 82.44266510009766, "accuracy": 11.603374481201172 }
      this.setData({
        xRotation: res.direction
      })
    })

    // wx.startDeviceMotionListening({
    //   interval: "game",
    //   success: (res) => {
    //     // console.log(res)
    //     wx.onDeviceMotionChange(response => {
    //       console.log(response)
    //       this.setData({
    //         // xRotation: -response.alpha,
    //         yRotation: response.beta-90
    //       })
    //     })
    //   }
    // })

  },

  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res)=>{
        console.log(res)
      },
      fail: (e) => {
        console.log(e)
      }
    })
  },

  // touchStart(e){
  //   console.log('start',e.changedTouches[0])
  // },

  // touchMove(e) {
  //   console.log('move',e.changedTouches[0])
  // },
  // touchEnd(e) {
  //   console.log('end',e.changedTouches[0])
  // },

  touchStart (evt) {
    this.firstDir = '';
    evt = evt.changedTouches[0];
    // console.log(evt)
    // debugger
    this.originTouchPos.x = this.oldTouchPos.x = this.newTouchPos.x = evt.clientX;
    this.originTouchPos.y = this.oldTouchPos.y = this.newTouchPos.y = evt.clientY;
    this.originTime = this.oldTime = this.newTime = Date.now();
    // this.ax = this.ay = 0;
    // this.setData({
    //   dx : 0,
    //   dy : 0
    // })
    // this.stage.on('touchmove', this.onTouchMove);
    // this.stage.on('touchend', this.onTouchEnd);
    // this.trigger(this.START);
  },

  touchMove (evt) {
    evt = evt.changedTouches[0];
    this.newTouchPos.x = evt.clientX;
    this.newTouchPos.y = evt.clientY;
    this.newTime = Date.now();
    this.checkGesture();
    this.oldTouchPos.x = this.newTouchPos.x;
    this.oldTouchPos.y = this.newTouchPos.y;
    this.oldTime = this.newTime;
    return false;
  },

  touchEnd () {
    this.newTime = Date.now();
    var _time = (this.newTime - this.oldTime) / 1000;
    // this.trigger(this.END, {
    //   dx: this.dx,
    //   dy: this.dy,
    //   ax: this.time * 2 > _time ? this.ax : 0,
    //   ay: this.time * 2 > _time ? this.ay : 0,
    //   dir: this.firstDir
    // });
    // this.stage.off('touchmove', this.onTouchMove);
    // this.stage.off('touchend', this.onTouchEnd);
    return false;
  },

  checkGesture() {
    this.setData({
      dx: this.fixed2(this.newTouchPos.x - this.originTouchPos.x),
      dy: this.fixed2(this.newTouchPos.y - this.originTouchPos.y)
    })
    this.ax = this.fixed2(this.newTouchPos.x - this.oldTouchPos.x);
    this.ay = this.fixed2(this.newTouchPos.y - this.oldTouchPos.y);
    this.time = (this.newTime - this.oldTime) / 1000;

    if (this.firstDir == '') {
      if (Math.abs(this.ax) > Math.abs(this.ay)) {
        this.firstDir = 'x';
      } else if (Math.abs(this.ax) < Math.abs(this.ay)) {
        this.firstDir = 'y';
      }
    }
    // console.log(this.data.dx, this.data.dy,this.ax,this.ay)

    // this.trigger(this.MOVE, {
    //   dx: this.dx,
    //   dy: this.dy,
    //   ax: this.ax,
    //   ay: this.ay,
    //   dir: this.firstDir
    // });
  },

  fixed2(num) {
    return Math.floor(num * 100) / 100;
  }



  // handleFunc(evnet) {
  //   var alpha = event.alpha;
  //   var beta = event.beta;
  //   var gamma = event.gamma;
  // }


})
