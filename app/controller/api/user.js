'use strict';
var WXBizDataCrypt = require('../../public/api/js/WXBizDataCrypt')
var BaseController = require('./base.js');
var md5 = require('md5');//引入md5加密
var xml2js = require('xml2js');	//引入xml解析模块
const fs = require('fs');

const pump = require('mz-modules/pump');
class UserController extends BaseController {

    async getLogin() {
        var responseData = {
            code: 0,
            message: ""
        }
        var loginCode = this.ctx.request.query.code;

        var result = await this.ctx.curl('https://api.weixin.qq.com/sns/jscode2session?appid=wx05b238a92bcb87e3&secret=8fcabf13abb7d0d628f1be868530f896&js_code=' + loginCode + '&grant_type=authorization_code');
        var res = result.data.toString();
        console.log("111111111111111111");

        console.log(res);

        if (JSON.parse(res).errcode == 40029) {
            responseData.code = 1;
            responseData.message = "code无效";
            this.ctx.body = responseData;
        } else {
            /*
            *获取到openid  检索用户信息
            *如果有用户信息则返回用户信息,同时返回用户openid
            *如果没有用户信息 则返回空对象，同时返回用户openid
            */
            console.log("2222222222222");

            console.log(res);
            console.log("3333333333333");

            var openid = JSON.parse(res).openid;
            var session_key = JSON.parse(res).session_key;

            console.log(openid);

            var userData = await this.ctx.model.User.findOne({ "openid": openid });
            if(!userData){
                var newUser = new this.ctx.model.User({openid:openid});

                userData=await newUser.save();
            }
            console.log(userData);
            responseData.code = 0;
            responseData.message = "获取信息成功";
            responseData.userInfo = userData;
            responseData.openid = openid;
            responseData.session_key = session_key;

            this.ctx.body = responseData;
        }


    }

    async phoneLogin() {
        var responseData = {
            code: 0,
            message: ""
        }
        var openid = this.ctx.request.body.openid;
        var inputName = this.ctx.request.body.inputName;
        console.log("inputName-------------");
        console.log(inputName);
        

        var session_key = this.ctx.request.body.session_key;
        var encryptedData = this.ctx.request.body.encryptedData;
        var iv = this.ctx.request.body.iv;
        var appid = "wx05b238a92bcb87e3";
        var pc = new WXBizDataCrypt(appid, session_key)

        var data = pc.decryptData(encryptedData, iv)

        console.log('解密后 data: ', data)

        // 获取到手机号后 查询是否有手机号用户
        //有 就更新openid  没有就创建用户 并返回用户信息
        var phone = data.phoneNumber;

        await this.ctx.model.User.updateOne({ openid: openid },{ "phone": phone ,username:inputName}); 

        var userInfo = await this.ctx.model.User.findOne({ "phone": phone });
        console.log("userInfo", userInfo);

        responseData.message = "手机号登录成功";
        responseData.code = 0;
        responseData.userInfo = userInfo;

        this.ctx.body = responseData;

    }

    async saveInfo(){
        var responseData = {
            code: 0,
            message: ""
        }

        var updateData = this.ctx.request.body;
        updateData.id=this.app.mongoose.Types.ObjectId(updateData.id);

        console.log(updateData);
        
        await this.ctx.model.User.updateOne({ "_id": updateData.id }, updateData);

        var res=await this.ctx.model.User.findOne({"_id":updateData.id});

        responseData.userInfo=res;
        responseData.message="更新个人信息成功";


        this.ctx.body=responseData;


    }

    async getQRCode(){
        console.log("getQRCode");

        var responseData = {
            code: 0,
            message: ""
        }
        var scene = this.ctx.request.body.shareid;
        console.log(scene);
        
        var page = this.ctx.request.body.page;
        var access_token = "";
        var ctx=this.ctx;

        var tokenResult = await this.ctx.curl('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx05b238a92bcb87e3&secret=8fcabf13abb7d0d628f1be868530f896');
        tokenResult = tokenResult.data.toString();
        console.log("tokenResult", tokenResult);

        if (tokenResult) {
            access_token = JSON.parse(tokenResult).access_token;
            console.log("access_token", access_token);

            var formData={
                scene:scene,
                page:page
            }
            console.log("1111111111111111111111111111");

            try {
                var qrData=await this.ctx.curl('https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='+access_token,{
                    method:"POST",
                    dataType:"base64",
                    headers: {"content-type": "application/json"},
                    // encoding:"base64",
                    data:formData,
                    body:formData
                });
                console.log("22222222222222222222222222222222222");
                console.log(qrData);
                
                qrData = qrData.data.toString("base64");
                // console.log("qrData", qrData);

                var dataBuffer =new Buffer(qrData,'base64');
                var num=new Date().getTime();
                await fs.writeFile("app/public/api/qrcodes/"+num+".png", dataBuffer, function(err) {
 
                
                });
                responseData.data="/public/api/qrcodes/"+num+".png";

                console.log( "保存成功！" );
                responseData.message="获取小程序码成功"
                ctx.body=responseData;


            } catch (error) {
                console.log("33333333333333333");
                
                console.log(error);
                
                responseData.code=2;
                responseData.message="获取小程序码失败"
                ctx.body=responseData;

            }

            





        }



    }

    async createPay(){
        var responseData = {
            code: 0,
            message: ""
        }
        var openid= this.ctx.request.body.openid;
        var appid='wx05b238a92bcb87e3';
        var mch_id='1581972881';//商户号
        var nonce_str=randomStr();//随机字符串
        var body='新零售预购定金';//商品描述
        var out_trade_no=new Date().getTime();//商户订单号
        var total_fee=200000;//标价金额 单位为分
        var spbill_create_ip=this.ctx.request.ip;//终端IP
        console.log("ip:"+this.ctx.request.ip);
        
        var notify_url='https://www.kdsou.com/kdchange/service_bak/notify.php';//通知地址
        var trade_type='JSAPI';//交易类型
        //第一次签名
        var sign=createSign({
            appid:appid,
            body:body,
            mch_id:mch_id,
            nonce_str:nonce_str,
            notify_url:notify_url,
            openid:openid,
            out_trade_no:out_trade_no,
            spbill_create_ip:spbill_create_ip,
            total_fee:total_fee,
            trade_type:trade_type
        })
    
        var formData = "<xml>";
            formData += "<appid>"+appid+"</appid>";
            formData += "<body>"+body+"</body>";
            formData += "<mch_id>"+mch_id+"</mch_id>";
            formData += "<nonce_str>"+nonce_str+"</nonce_str>";
            formData += "<notify_url>"+notify_url+"</notify_url>";
            formData += "<openid>"+openid+"</openid>";
            formData += "<out_trade_no>"+out_trade_no+"</out_trade_no>";
            formData += "<spbill_create_ip>"+spbill_create_ip+"</spbill_create_ip>";
            formData += "<total_fee>"+total_fee+"</total_fee>";
            formData += "<trade_type>"+trade_type+"</trade_type>";
            formData += "<sign>"+sign+"</sign>";
            formData += "</xml>";
    
            console.log("统一下单接口-----------------1");


        //统一下单接口
        try {
            var sendOrder=await this.ctx.curl('https://api.mch.weixin.qq.com/pay/unifiedorder',{
                method:"POST",
                dataType:"xml",
                headers: {"content-type": "application/json"},
                data:formData,
                body:formData
            });
        } catch (error) {
        console.log(error);
            
        }

        console.log("统一下单接口-----------------2");
        
        console.log(sendOrder);
        var sendOrderRes = sendOrder.data.toString();
        console.log(sendOrderRes);
        var _this=this;
        xml2js.parseString(sendOrderRes, function (error, result) {
            console.log(result, 'xml解析成惊悚字符串')
            var reData = result.xml;
            var resData = {
                timeStamp: new Date().getTime(),
                nonceStr: reData.nonce_str[0],
                package: 'prepay_id='+reData.prepay_id[0],
                // paySign: reData.sign[0]
            }
            //第二次签名
            resData.paySign=getPaySign(appid, resData.timeStamp, resData.nonceStr, resData.package)


            responseData.message="成功调起支付";
            responseData.data=resData;
            responseData.out_trade_no=out_trade_no;

            _this.ctx.body = responseData;

        })


    }

    async orderquery(){
        var responseData = {
            code: 0,
            message: ""
        }
        var out_trade_no=this.ctx.request.body.out_trade_no;
        var openid=this.ctx.request.body.openid;
        var car_id=this.ctx.request.body.carId;
        var user_id=this.ctx.request.body.user_id;
        var share_id=this.ctx.request.body.share_id;

        var orderData={
            openid:openid,
            car_id:car_id,
            user_id:user_id,
        }
        if(share_id){
            orderData.share_id=share_id;
        }

        console.log("out_trade_no=============");

        console.log(out_trade_no);

        var appid='wx05b238a92bcb87e3';
        var mch_id='1581972881';//商户号
        var nonce_str=randomStr();//随机字符串
        var spbill_create_ip=this.ctx.request.ip;//终端IP
        var trade_type='JSAPI';//交易类型
        var sign=createSign2({
            appid:appid,
            // body:body,
            mch_id:mch_id,
            nonce_str:nonce_str,
            // notify_url:notify_url,
            // openid:openid,
            out_trade_no:out_trade_no,
            // spbill_create_ip:spbill_create_ip,
            // total_fee:total_fee,
            // trade_type:trade_type
        })

        var formData = "<xml>";
            formData += "<appid>"+appid+"</appid>";
            // formData += "<body>"+body+"</body>";
            formData += "<mch_id>"+mch_id+"</mch_id>";
            formData += "<nonce_str>"+nonce_str+"</nonce_str>";
            // formData += "<notify_url>"+notify_url+"</notify_url>";
            // formData += "<openid>"+openid+"</openid>";
            formData += "<out_trade_no>"+out_trade_no+"</out_trade_no>";
            // formData += "<spbill_create_ip>"+spbill_create_ip+"</spbill_create_ip>";
            // formData += "<total_fee>"+total_fee+"</total_fee>";
            // formData += "<trade_type>"+trade_type+"</trade_type>";
            formData += "<sign>"+sign+"</sign>";
            formData += "</xml>";

        try {
            var orderInfo=await this.ctx.curl('https://api.mch.weixin.qq.com/pay/orderquery',{
                method:"POST",
                dataType:"xml",
                headers: {"content-type": "application/json"},
                data:formData,
                body:formData
            });
        } catch (error) {
            console.log(error);
        }

        var orderInfoRes = orderInfo.data.toString();
        console.log("orderInfoRes==========");

        console.log(orderInfoRes);

        var _this=this;
        await xml2js.parseString(orderInfoRes, function (error, result) {
            console.log(result);
            orderData.total_fee=result.xml.total_fee[0];
            orderData.transaction_id=result.xml.transaction_id[0];
            orderData.out_trade_no=result.xml.out_trade_no[0];
            orderData.time_end=result.xml.time_end[0];
            orderData.trade_state_desc=result.xml.trade_state_desc[0];
            console.log("orderData==========");
            console.log(orderData);


        });
        var newOrder = new this.ctx.model.Order(orderData);

        var newOrderRes=await newOrder.save();
        responseData.orderInfo=newOrderRes;
        responseData.message="创建订单成功";

        this.ctx.body=responseData;

    }

}

function getPaySign(appId,timeStamp,nonceStr,packageStr) {
    var stringA = 'appId=' + appId +
        '&nonceStr=' + nonceStr +
        '&package=' + packageStr +
        '&signType=MD5' +
        '&timeStamp=' + timeStamp

    var stringSignTemp = stringA + '&key=xindongfangqichexinlingshou55555'
    var sign = md5(stringSignTemp).toUpperCase();
    return sign
}

function randomStr() {
    //产生一个随机字符串
    var str = "";
    var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (var i = 1; i <= 32; i++) {
        var random = Math.floor(Math.random() * arr.length);
        str += arr[random];
    }
    return str;
}

function createSign(obj) {	//签名算法（把所有的非空的参数，按字典顺序组合起来+key,然后md5加密，再把加密结果都转成大写的即可）
    var stringA = 'appid=' + obj.appid
        + '&body=' + obj.body
        + '&mch_id=' + obj.mch_id
        + '&nonce_str=' + obj.nonce_str
        + '&notify_url=' + obj.notify_url
        + '&openid=' + obj.openid
        + '&out_trade_no=' + obj.out_trade_no
        + '&spbill_create_ip=' + obj.spbill_create_ip
        + '&total_fee=' + obj.total_fee
        + '&trade_type=' + obj.trade_type;
    var stringSignTemp = stringA + '&key=xindongfangqichexinlingshou55555';
    stringSignTemp = md5(stringSignTemp);
    var signValue = stringSignTemp.toUpperCase();
    console.log( signValue );
    return signValue
}

function createSign2(obj) {	//签名算法（把所有的非空的参数，按字典顺序组合起来+key,然后md5加密，再把加密结果都转成大写的即可）
    var stringA = 'appid=' + obj.appid
        // + '&body=' + obj.body
        + '&mch_id=' + obj.mch_id
        + '&nonce_str=' + obj.nonce_str
        // + '&notify_url=' + obj.notify_url
        // + '&openid=' + obj.openid
        + '&out_trade_no=' + obj.out_trade_no;
        // + '&spbill_create_ip=' + obj.spbill_create_ip
        // + '&total_fee=' + obj.total_fee
        // + '&trade_type=' + obj.trade_type;
    var stringSignTemp = stringA + '&key=xindongfangqichexinlingshou55555';
    stringSignTemp = md5(stringSignTemp);
    var signValue = stringSignTemp.toUpperCase();
    console.log( signValue );
    return signValue
}

module.exports = UserController;
