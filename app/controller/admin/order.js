'use strict';

var BaseController = require('./base.js');
var md5 = require('md5');//引入md5加密
var xml2js = require('xml2js');	//引入xml解析模块
const fs = require('fs');

class OrderController extends BaseController {
    async index() {
        var keyword = this.ctx.request.query.keyword||"";
        console.log(keyword);
        var findJson1 ={
            $lookup: {
                from: 'user',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
        
              }
        }
        var findJson2 ={
            $lookup: {
                from: 'car',
                localField: 'car_id',
                foreignField: '_id',
                as: 'car'
        
              }
        }
        var findJson3 ={
            $lookup: {
                from: 'user',
                localField: 'share_id',
                foreignField: '_id',
                as: 'share'
        
              }
        }

        var Result = await this.ctx.model.Order.aggregate([
            findJson1,
            findJson2,
            findJson3,
            {
                $match:{
                    $or:[
                        { "out_trade_no": { "$regex": keyword } },
                    ]
                }
            },
            {
                $sort:{add_time:-1}
            }
        ]);

        await this.ctx.render('admin/order/index', {
          lists: Result,
          keyword:keyword
        });


    }

    async detail(){
        var last_prevPage= this.ctx.request.query.last_prevPage||this.ctx.state.prevPage;
        var id = this.ctx.request.query.id;
        id=this.app.mongoose.Types.ObjectId(id);
        var findJson1 ={
            $lookup: {
                from: 'user',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
        
              }
        }
        var findJson2 ={
            $lookup: {
                from: 'car',
                localField: 'car_id',
                foreignField: '_id',
                as: 'car'
        
              }
        }
        var findJson3 ={
            $lookup: {
                from: 'user',
                localField: 'share_id',
                foreignField: '_id',
                as: 'share'
        
              }
        }


        var Result = await this.ctx.model.Order.aggregate([
            findJson1,
            findJson2,
            findJson3,
            {
                $match:{
                    "_id": id
                }
            }
        ]);

        var partnerData = await this.ctx.model.Partner.find().sort({"sort":-1});

        var periodData = await this.ctx.model.Period.find({user_id: Result[0].user_id});
        var periodShareData = await this.ctx.model.Period.find({user_id: Result[0].share_id});

        //指定合作商
        var userPartner= await this.ctx.model.Partner.findOne({"_id":Result[0].user[0].partner_id})

        await this.ctx.render('admin/order/detail', {
          orderData: Result[0],
          partnerData:partnerData,
          periodData:periodData,
          periodShareData:periodShareData,
          userPartner:userPartner,
          last_prevPage:last_prevPage
        });
    }

    async repay(){
        var prevPage= this.ctx.state.prevPage;
        var last_prevPage= this.ctx.request.query.last_prevPage;
        console.log(last_prevPage);
        
        var repay_id = this.ctx.request.query.repay_id;
        var user_id = this.ctx.request.query.user_id;
        user_id=this.app.mongoose.Types.ObjectId(user_id);

        if(!repay_id){
            var repay = new this.ctx.model.Detail({
                type:5,
            });
            var repayInfo=await repay.save();
            await this.ctx.model.User.updateOne({"_id":user_id},{repay_id:repayInfo._id})
        }

        var userInfo=await this.ctx.model.User.aggregate([
            {
                $lookup: {
                    from: 'detail',
                    localField: 'repay_id',
                    foreignField: '_id',
                    as: 'repay'
                  }
            },
            {
                $match:{
                    "_id": user_id
                }
            }
        ])

        var orderInfo=await this.ctx.model.Order.aggregate([
            {
                $lookup: {
                    from: 'car',
                    localField: 'car_id',
                    foreignField: '_id',
                    as: 'car'
                  }
            },
            {
                $match:{
                    "user_id": user_id
                }
            }
        ])
        var periodData = await this.ctx.model.Period.find({user_id:user_id});
        await this.ctx.render('admin/order/repay', {
            userInfo:userInfo[0],
            orderInfo:orderInfo[0],
            periodData:periodData,
            prevPage:prevPage,
            last_prevPage:last_prevPage
        });







    }

    async editRepay(){
        var prevPage= this.ctx.request.body.prevPage;
        var last_prevPage= this.ctx.request.body.last_prevPage;

        console.log(last_prevPage);
        
        var content = this.ctx.request.body.content;
        var id = this.ctx.request.body.id;
        id=this.app.mongoose.Types.ObjectId(id);
        
        console.log(content);
        console.log(id);
        

        await this.ctx.model.Detail.updateOne({ "_id": id }, {"content":content})

        await this.success(prevPage+"&last_prevPage="+last_prevPage, '修改还款计划成功')

    }

    async changeStatus(){
        var status=this.ctx.request.body.status;
        var order_id=this.ctx.request.body.order_id;
        var user_id=this.ctx.request.body.user_id;
        var openid=this.ctx.request.body.openid;
        var last_prevPage=this.ctx.request.body.last_prevPage;

        console.log(status);
        if(status==2){
            var noreason=this.ctx.request.body.noreason;
            //不通过 改变订单状态 储存通知 发送订阅通知 操作退款
            await this.ctx.model.Order.updateOne({"_id":order_id},{"status":status});
            var noticeData={
                order_id:order_id,
                user_id:user_id,
                type:1,
                content:noreason
            }
            var notice = new this.ctx.model.Notice(noticeData);

            notice.save();

            this.service.api.sendTemplateMsg(openid,"不通过","您的征信审核不通过，定金将稍后退还",1)

            //退款---------------------------------------
            // var appid='wx05b238a92bcb87e3';
            // var mch_id='1581972881';//商户号
            // var nonce_str=randomStr();//随机字符串
            // var out_trade_no=this.ctx.request.body.out_trade_no;
            // var out_refund_no=new Date().getTime();
            // var total_fee=this.ctx.request.body.total_fee;
            // var refund_fee=total_fee;

            // var sign=createSign({
            //     appid:appid,
            //     mch_id:mch_id,
            //     nonce_str:nonce_str,
            //     out_trade_no:out_trade_no,
            //     out_refund_no:out_refund_no,
            //     total_fee:total_fee,
            //     refund_fee:refund_fee
            // })

            // var formData = "<xml>";
            // formData += "<appid>"+appid+"</appid>";
            // formData += "<mch_id>"+mch_id+"</mch_id>";
            // formData += "<nonce_str>"+nonce_str+"</nonce_str>";
            // formData += "<out_trade_no>"+out_trade_no+"</out_trade_no>";
            // formData += "<out_refund_no>"+out_refund_no+"</out_refund_no>";
            // formData += "<total_fee>"+total_fee+"</total_fee>";
            // formData += "<refund_fee>"+refund_fee+"</refund_fee>";
            // formData += "<sign>"+sign+"</sign>";
            // formData += "</xml>";

            // console.log(formData);
            

            // //退款接口
            // try {
            //     var refundRes=await this.ctx.curl('https://api.mch.weixin.qq.com/secapi/pay/refund',{
            //         method:"POST",
            //         dataType:"xml",
            //         headers: {"content-type": "application/json"},
            //         data:formData,
            //         body:formData,
            //         agentOptions:{
            //             pfx:fs.readFileSync('./apiclient_cert.p12'),//微信商户平台证书,
            //             passphrase:mch_id//商家id
            //         }
            //     });
            //     console.log("退款成功");
            //     var refundResStr = refundRes.data.toString();
            //     console.log(refundResStr);
            // } catch (error) {
            //     console.log("退款失败");

            //     console.log(error);
            // }





        }

        if(status==3){
            //通过 改变订单状态 储存通知 发送订阅通知 
            await this.ctx.model.Order.updateOne({"_id":order_id},{"status":status});
            var noticeData={
                order_id:order_id,
                user_id:user_id,
                type:1,
                content:"您的征信良好，审核通过，稍后会有客户经理与您联系办理线下提车事宜。"
            }
            var notice = new this.ctx.model.Notice(noticeData);

            notice.save();

            this.service.api.sendTemplateMsg(openid,"审核通过","客户经理将与您联系办理线下提车事宜。",1)


        }
        if(status==4){
            //更新状态  自己以及赠送人增加期数  并发送通知
            var partner_id=this.ctx.request.body.partner_id;
            partner_id=this.app.mongoose.Types.ObjectId(partner_id);

            await this.ctx.model.User.updateOne({"_id":user_id},{"is_vip":1,"partner_id":partner_id});

            await this.ctx.model.Order.updateOne({"_id":order_id},{"status":status});
            var noticeData1={
                order_id:order_id,
                user_id:user_id,
                type:1,
                content:"您已成功提车，俱乐部已赠送给您6个月分期，赶紧进入推广中心分享，获取更多免费分期吧。"
            }
            var notice1 = new this.ctx.model.Notice(noticeData1);
            notice1.save();

            var periodData1={
                order_id:order_id,
                user_id:user_id,
                type:1,
                period:6
            }
            var period1 = new this.ctx.model.Period(periodData1);
            period1.save();

            this.service.api.sendTemplateMsg(openid,"成功提车","俱乐部已赠送给您6个月分期。",1);

            //分享人逻辑 储存通知  发送邀请成功消息 增加赠送期数
            var share_id=this.ctx.request.body.share_id;
            console.log("share_id----------");

            console.log(share_id);
            
            if(share_id){
                share_id=this.app.mongoose.Types.ObjectId(share_id);
                var shareUser=await this.ctx.model.User.findOne({"_id":share_id});

                var periodData=await this.ctx.model.Period.find({user_id:share_id});
                console.log("periodData----------------------");
                console.log(periodData);
                
                if(periodData.length>=5){
                    console.log("不增加赠送期数");
                    var periodData2={
                        order_id:order_id,
                        user_id:share_id,
                        type:2,
                        period:0,
                        is_send:0
                    }
                    var period2 = new this.ctx.model.Period(periodData2);
                    period2.save();
                }else{
                    var periodData3={
                        order_id:order_id,
                        user_id:share_id,
                        type:2,
                        period:5+periodData.length,
                    }
                    var period3 = new this.ctx.model.Period(periodData3);
                    period3.save();


                }

                var noticeData2={
                    order_id:order_id,
                    user_id:share_id,
                    type:2,
                    content:"您已成功推广,已获得相应奖励，请到会员中心查看"
                }
                var notice2 = new this.ctx.model.Notice(noticeData2);
                notice2.save();

                this.service.api.sendTemplateMsg(shareUser.openid,"邀请成功","恭喜您成功邀请一单。",2)

            }


        }


        await this.success('/admin/order/detail?id=' + order_id + '&last_prevPage=' + last_prevPage, '操作成功');

        


    }



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
        + '&out_trade_no=' + obj.out_trade_no
        + '&out_refund_no=' + obj.out_refund_no
        + '&total_fee=' + obj.total_fee
        + '&refund_fee=' + obj.refund_fee;
    var stringSignTemp = stringA + '&key=xindongfangqichexinlingshou55555';
    stringSignTemp = md5(stringSignTemp);
    var signValue = stringSignTemp.toUpperCase();
    console.log( signValue );
    return signValue
}
// appid:appid,
// mch_id:mch_id,
// nonce_str:nonce_str,
// out_trade_no:out_trade_no,
// out_refund_no:out_refund_no,
// total_fee:total_fee,
// refund_fee:refund_fee

module.exports = OrderController;
