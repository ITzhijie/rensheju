'use strict';
var WXBizDataCrypt = require('../../public/api/js/WXBizDataCrypt')
var BaseController = require('./base.js');

class InfoController extends BaseController {
    // '/api/getIndexInfo'
    //获取小程序首页综合信息
    async getIndexInfo(){
        var responseData = {
            code: 0,
            message: ""
        }
        var bannerData=await this.ctx.model.Detail.find({type:1}).sort({sort:-1});
        var brandData=await this.ctx.model.Brand.find().sort({sort:-1});
        var announceData=await this.ctx.model.Detail.find({type:2}).sort({updateTime:-1});

        responseData.bannerData=bannerData;
        responseData.brandData=brandData;
        responseData.announceData=announceData;

        this.ctx.body = responseData;

    }
    async getRichDetail(){
        var responseData = {
            code: 0,
            message: ""
        }
        var detailId= this.ctx.request.body.detailId;
        detailId=this.app.mongoose.Types.ObjectId(detailId);

        var detailData=await this.ctx.model.Detail.findOne({_id:detailId});

        responseData.detailData=detailData;

        this.ctx.body = responseData;

    }

    async getCarList(){
        var responseData = {
            code: 0,
            message: ""
        }
        var brandId= this.ctx.request.body.brandId;
        if(brandId){
            brandId=this.app.mongoose.Types.ObjectId(brandId);
            var findJson={brand_id:brandId,is_online:1};
        }else{
            var findJson={is_online:1};
        }

        var carLists=await this.ctx.model.Car.find(findJson);

        responseData.carLists=carLists;
        responseData.message="获取车辆列表成功";

        this.ctx.body = responseData;


    }

    async getCarDetail(){
        var responseData = {
            code: 0,
            message: ""
        }
        var carId= this.ctx.request.body.carId;
        carId=this.app.mongoose.Types.ObjectId(carId);

        var findJson1 ={
            $lookup: {
                from: 'brand',
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand'
        
              }
        }
        var findJson2 ={
            $lookup: {
                from: 'detail',
                localField: 'detail_id',
                foreignField: '_id',
                as: 'detail'
        
              }
        }
        var findJson3 ={
            $lookup: {
                from: 'detail',
                localField: 'attribute_id',
                foreignField: '_id',
                as: 'attribute'
        
              }
        }
        var Result = await this.ctx.model.Car.aggregate([
            findJson1,
            findJson2,
            findJson3,
            {
                $match:{
                    "_id": carId
                }
            }
        ]);


        console.log("Result[0]",Result[0]);
        
        responseData.carData=Result[0];
        responseData.message="获取车辆信息成功";

        this.ctx.body = responseData;

    }

    async getPartner(){
        var responseData = {
            code: 0,
            message: ""
        }
        var res=await this.ctx.model.Partner.find().sort({sort:-1});
        responseData.message="获取合作商成功";
        responseData.partnerData=res;
        this.ctx.body = responseData;

    }


    async getNotice(){
        var responseData = {
            code: 0,
            message: ""
        }
        var user_id= this.ctx.request.body.user_id;
        user_id=this.app.mongoose.Types.ObjectId(user_id);

        var findJson1 ={
            $lookup: {
                from: 'order',
                localField: 'order_id',
                foreignField: '_id',
                as: 'order'
        
            }
        }
        var findJson2 ={
            $lookup: {
                from: 'user',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
        
            }
        }

        var Result = await this.ctx.model.Notice.aggregate([
            findJson1,
            findJson2,
            {
                $match:{
                    "user_id": user_id
                }
            },
            {
                $sort:{add_time:-1}
            }
        ]);
        responseData.noticeData=Result;
        responseData.message="获取通知信息成功";

        this.ctx.body = responseData;

    }

    async getOrderDetail(){
        var responseData = {
            code: 0,
            message: ""
        }
        var user_id= this.ctx.request.body.user_id;
        user_id=this.app.mongoose.Types.ObjectId(user_id);

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
                    "user_id": user_id
                }
            }
        ]);

        //指定合作商
        responseData.userPartner={};
        if(Result.length>0){
            var userPartner= await this.ctx.model.Partner.findOne({"_id":Result[0].user[0].partner_id})

            responseData.userPartner=userPartner;
        }
        //------------------
        if(Result[0]&&Result[0].user[0].repay_id){
            var repayData=await this.ctx.model.Detail.findOne({_id:Result[0].user[0].repay_id});

            responseData.repayData=repayData;
        }



        responseData.orderInfo=Result[0]||{};
        responseData.message="获取订单信息成功";

        this.ctx.body = responseData;


    }

    async getShareData(){
        var responseData = {
            code: 0,
            message: ""
        }
        var user_id= this.ctx.request.body.user_id;
        user_id=this.app.mongoose.Types.ObjectId(user_id);

        var userInfo=await this.ctx.model.User.findOne({_id:user_id});

        //获取赠送期数，
        var periodData = await this.ctx.model.Period.find({user_id: user_id});
        //获取符合金额的车辆信息
        var findJson ={
            $lookup: {
                from: 'car',
                localField: 'car_id',
                foreignField: '_id',
                as: 'car'
            }
        }
        var findJson1 ={
            $lookup: {
                from: 'user',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
            }
        }
        var myOrder = await this.ctx.model.Order.aggregate([
            findJson,
            findJson1,
            {
                $match:{
                    "user_id": user_id
                }
            }
        ]);

        responseData.carData=[];
        if (myOrder.length>0&&myOrder[0].user[0].is_vip==1){
            var carData=await this.ctx.model.Car.find({first_price:{$gte:myOrder[0].car[0].first_price},is_online:1})
            responseData.carData=carData;

        }




        //获取我推广的订单
        var findJson2 ={
            $lookup: {
                from: 'user',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
            }
        }
        var shareOrderData = await this.ctx.model.Order.aggregate([
            findJson,
            findJson2,
            {
                $match:{
                    "share_id": user_id
                }
            }
        ]);
        responseData.periodData=periodData;
        responseData.shareOrderData=shareOrderData;
        responseData.userInfo=userInfo;

        responseData.message="获取分享页综合信息成功";userInfo

        this.ctx.body = responseData;

    }

}

module.exports = InfoController;
