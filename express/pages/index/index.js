//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    orderNum:'',
    num:123,
    ary:'',
  },
  //页面加载时触发的函数，可忽略
  onLoad: function () {
  },
  getNum:function(e){
    //为了方式当前对象状态发生变化，因此先将当前对象保存一份
    var that = this;
    that.setData({
       orderNum: e.detail.value
       });
  },
  getOrderInfo:function(){
    wx.showLoading({
      title: '正在查询...',
    })
    var that = this;
    var orderNum = that.data.orderNum;
    wx.request({
      url: 'https://www.itlaobing.com/express/api/distinguish', // 仅为示例，并非真实的接口地址
      //此处用于向服务器传递参数
      data: {
        num:orderNum
      },
      method:"post",
      dataType:'json',
      header: {
        //此请求头只适用于get请求
        // 'content-type': 'application/json' // 默认值
        'content-type':'application/x-www-form-urlencoded'
      },
      success(res) {
        var result = res.data;
        var length = result.Shippers.length;
        //判断返回的公司又几家，如果大于1家，则显示所有的快递公司，供用户选择
        if(length>1){
          //
          wx.hideLoading();
          var shippers = result.Shippers;
          var itemList = [];
          for (var i = 0; i < length; i++) {
            itemList[i] = shippers[i].ShipperName
          }
          wx.showActionSheet({
            itemList: itemList,
            success(res) {
              //当点击选项以后的回调函数，返回值是数组下标，通过下标可以获取快递公司名称
              //获得点击项目的索引
              var index = res.tapIndex;
              var companyName = itemList[index];
              //向服务器发送请求，获得快递公司的编号
              wx.request({
                url: 'https://www.itlaobing.com/express/api/company', // 仅为示例，并非真实的接口地址
                method:"post",
                dataType:"json",
                data: {
                  name: companyName
                },
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success(res) {
                  //读取快递公司标号号
                  var com = res.data.companyNum;
                  var nu = that.data.orderNum;
                  //发送请求，查询快递物流信息
                  wx.request({
                    url: 'https://www.itlaobing.com/express/api/trace', 
                    method: "post",
                    dataType: "json",
                    data: {
                      nu: that.data.orderNum,
                      com: com
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    success(res) {
                      var temp = res.data.Traces;
                      if(temp.length>0){
                        that.setData({
                          ary: temp
                        });
                      }else{
                        wx.showModal({
                          title: '提示',
                          content: res.data.Reason,
                          success(res) {
                            if (res.confirm) {
                              console.log('用户点击确定')
                            } else if (res.cancel) {
                              console.log('用户点击取消')
                            }
                          }
                        })
                      }
                    }
                  })
                }
              })
            },
            fail(res) {
              console.log(res.errMsg)
            }
          })
        }else{
          wx.hideLoading();
           //如果只有1家公司
           //1.在服务器返回的数据中直接拿到公司编号
           //2.拿到输入的快递单号，查询数据
          var shipper = res.data.Shippers[0];
          var companyCode = shipper.ShipperCode;
          
          var nu = that.data.orderNum;
            // console.log(companyCode);
            // console.log(nu);
            // console.log(ary);
          //发送请求，查询快递物流信息
          wx.request({
            url: 'https://www.itlaobing.com/express/api/trace',
            method: "post",
            dataType: "json",
            data: {
              nu: that.data.orderNum,
              com: companyCode
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success(res) {
              var temp = res.data.Traces;
              that.setData({
                ary: temp
              });
            }
          })



        }
      }
    })

  }
})
