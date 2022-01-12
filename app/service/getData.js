'use strict';

var svgCaptcha = require('svg-captcha');//引入验证
var md5 = require('md5');//引入md5加密
var sd = require('silly-datetime');
var path=require('path');
const mkdirp = require('mz-modules/mkdirp');
const XLSX = require('node-xlsx');
const pump = require('mz-modules/pump');
const fs = require('fs');
const sm3 = require('sm3');
const Service = require('egg').Service;



class ToolsService extends Service {

    //获取待分配考试数据
    async getAllocating(exam_id,classify_id,page){
        // 超过缴费结束时间pay_end  room_status 分配状态为0
        // let exam_id =exam_id?this.app.mongoose.Types.ObjectId(exam_id) : "";
        // let classify_id =classify_id?this.app.mongoose.Types.ObjectId(classify_id) : "";
        // var page = page || 1;
        var pageSize = 10;
        let examLists,classifyLists;
     
        let findJson = {
            $lookup: {
                from: 'exam',
                localField: 'exam_id',
                foreignField: '_id',
                as: 'exam'
            }
        }
        var findJson1 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status:1,
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$classify_id", "$$classify_id"] }
                                    ]
                            },
                            // $or: [
                            //     { "brand_name": { "$regex": keyword } },
                            // ]
                        }
                    },
                    // { $group: { _id: "$pay_status", total: { $sum: "$num" } } }
                ],
                as: "examinee_verifyed"
            },

        };
        var findJson2 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status:1,
                            pay_status:1,
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$classify_id", "$$classify_id"] }
                                    ]
                            },
                            // $or: [
                            //     { "brand_name": { "$regex": keyword } },
                            // ]
                        }
                    },
                    // { $group: { _id: "$pay_status", total: { $sum: "$num" } } }
                ],
                as: "examinee_payed"
            },

        };
        var findJson3 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status:1,
                            pay_status:1,
                            room_status:1,
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$classify_id", "$$classify_id"] }
                                    ]
                            },
                            // $or: [
                            //     { "brand_name": { "$regex": keyword } },
                            // ]
                        }
                    },
                    // { $group: { _id: "$pay_status", total: { $sum: "$num" } } }
                ],
                as: "examinee_roomed"
            },

        };

        let matchJson = {
            $match: {
                room_status:0,
                pay_end:{$lt:new Date()}
            }
        }
        if (exam_id) {
            matchJson.$match.exam_id=exam_id;
        }
        if (classify_id) {
            matchJson.$match._id=classify_id;
        }
        if (this.ctx.session.adminInfo.is_super == 1) {
            examLists = await this.ctx.model.Exam.find();
            //classifyLists = await this.ctx.model.Classify.find();
            
        } else {
            let admin_organ_id=this.ctx.session.adminInfo.organ_id;
            examLists = await this.ctx.model.Exam.find({organ_id:admin_organ_id});
            //classifyLists = await this.ctx.model.Classify.find({organ_id:admin_organ_id});

            matchJson.$match.organ_id=this.app.mongoose.Types.ObjectId(admin_organ_id);
            
            
        }
        if (exam_id) {
            classifyLists= await this.ctx.model.Classify.find({exam_id:exam_id});
        }else{
            if (this.ctx.session.adminInfo.is_super == 1) {
                classifyLists= await this.ctx.model.Classify.find();
                
            }else{
                let admin_organ_id=this.ctx.session.adminInfo.organ_id;
                classifyLists= await this.ctx.model.Classify.find({
                    organ_id:admin_organ_id
                });
            }
            
        }

        
        var allLists =  await this.ctx.model.Classify.aggregate([
            findJson,
            findJson1,
            findJson2,
            matchJson
        ]);
        var totalNum=allLists.length;
        if(page>Math.ceil(totalNum / pageSize)){
            page=Math.ceil(totalNum / pageSize)
        }
        if(page<=0){
            page=1;
        }
        var lists = await this.ctx.model.Classify.aggregate([
            findJson,
            findJson1,
            findJson2,
            findJson3,
            matchJson,
            {
                $sort: { add_time: -1 }
            },
            { "$skip":(page - 1) * pageSize }, 
            { "$limit":pageSize }
        ]);
        console.log("lists=========++++++++++");
        console.log(lists);

        return {
            lists,exam_id,examLists,classify_id,classifyLists,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            totalNum:totalNum
        }
    }

    //获取待分配考生数据
    async getAllocatingExaminee(exam_id,classify_id,page,room_status){
        var pageSize = 5;

        let findJson1 = {
            $lookup: {
                from: 'exam',
                localField: 'exam_id',
                foreignField: '_id',
                as: 'exam'
            }
        }
        let findJson2 = {
            $lookup: {
                from: 'classify',
                localField: 'classify_id',                
                foreignField: '_id',
                as: 'classify'
            }
        }
        let matchJson = {
            $match: {
                verify_status:1,
                pay_status:1,
            }
        }

        if (exam_id) {
            matchJson.$match.exam_id=exam_id;
        }
        if (classify_id) {
            matchJson.$match.classify_id=classify_id;
        }

        if (room_status) {
            matchJson.$match.room_status=room_status;
        }
        var allLists = await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            matchJson
        ]);
        var totalNum = allLists.length;
        if (page > Math.ceil(totalNum / pageSize)) {
            page = Math.ceil(totalNum / pageSize)
        }
        if (page <= 0) {
            page = 1;
        }
        var lists = await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            matchJson,
            {
                $sort: { room_status: 1 }
            },
            { "$skip": (page - 1) * pageSize },
            { "$limit": pageSize }
        ]);
        return {
            lists,exam_id,classify_id,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            totalNum:totalNum
        };




    }

    //获取考生分数
    async getscoreExaminee(exam_id,classify_id,page){
        var pageSize = 5;

        let findJson1 = {
            $lookup: {
                from: 'exam',
                localField: 'exam_id',
                foreignField: '_id',
                as: 'exam'
            }
        }
        let findJson2 = {
            $lookup: {
                from: 'classify',
                localField: 'classify_id',                
                foreignField: '_id',
                as: 'classify'
            }
        }

        var findJson3 = {
            $lookup: {
                from: "score",
                let: { examinee_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$examinee_id", "$$examinee_id"] }
                                    ]
                            },
                            // $or: [
                            //     { "brand_name": { "$regex": keyword } },
                            // ]
                        }
                    },
                    // { $group: { _id: "$pay_status", total: { $sum: "$num" } } }
                ],
                as: "scorelists"
            },

        };

        let matchJson = {
            $match: {
                verify_status:1,
                pay_status:1,
                room_status:1
            }
        }

        if (exam_id) {
            matchJson.$match.exam_id=exam_id;
        }
        if (classify_id) {
            matchJson.$match.classify_id=classify_id;
        }

      
        var allLists = await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            findJson3,
            matchJson
        ]);
        var totalNum = allLists.length;
        if (page > Math.ceil(totalNum / pageSize)) {
            page = Math.ceil(totalNum / pageSize)
        }
        if (page <= 0) {
            page = 1;
        }
        var lists = await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            findJson3,
            matchJson,
            {
                $sort: { room_status: 1 }
            },
            { "$skip": (page - 1) * pageSize },
            { "$limit": pageSize }
        ]);
        return {
            lists,exam_id,classify_id,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            totalNum:totalNum
        };



    }

    //获取数据中心详情
    async getDataDetail(exam_id,classify_id){
        let examLists,classifyLists;
     
        let findJson = {
            $lookup: {
                from: 'exam',
                localField: 'exam_id',
                foreignField: '_id',
                as: 'exam'
            }
        }
        //所有考生
        var findJson1 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$classify_id", "$$classify_id"] }
                                    ]
                            },
                        }
                    },
                    //{$distinct:{user_id:1}}
                    // { $group: { _id: "$verify_status", total: { $sum: "$num" } } }
                ],
                //distinct:"user_id",
                as: "examinee_all"
            },
        };
        //待审核人数
        var findJson2 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status:0,
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$classify_id", "$$classify_id"] }
                                    ]
                            },
                            
                        }
                    },
                    // { $group: { _id: "$verify_status", total: { $sum: "$num" } } }
                ],
                as: "examinee_verifying"
            },
        };
        //审核通过人数
        var findJson3 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status:1,
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$classify_id", "$$classify_id"] }
                                    ]
                            },
                            
                        }
                    },
                    // { $group: { _id: "$verify_status", total: { $sum: "$num" } } }
                ],
                as: "examinee_verifyed"
            },
        };
        //缴费人数
        var findJson4 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status:1,
                            pay_status:1,
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$classify_id", "$$classify_id"] }
                                    ]
                            },
                            
                        }
                    },
                    // { $group: { _id: "$pay_status", total: { $sum: "$num" } } }
                ],
                as: "examinee_payed"
            },
        };
        //未缴费人数
        var findJson5 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status:1,
                            pay_status:0,
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$classify_id", "$$classify_id"] }
                                    ]
                            },
                            
                        }
                    },
                    // { $group: { _id: "$pay_status", total: { $sum: "$num" } } }
                ],
                as: "examinee_nopay"
            },
        };
        

        let matchJson = {
            $match: {
                
            }
        }
        if (exam_id) {
            matchJson.$match.exam_id=exam_id;
        }
        if (classify_id) {
            matchJson.$match._id=classify_id;
        }
        if (this.ctx.session.adminInfo.is_super == 1) {
            examLists = await this.ctx.model.Exam.find();
            //classifyLists = await this.ctx.model.Classify.find();
            
        } else {
            let admin_organ_id=this.ctx.session.adminInfo.organ_id;
            examLists = await this.ctx.model.Exam.find({organ_id:admin_organ_id});
            //classifyLists = await this.ctx.model.Classify.find({organ_id:admin_organ_id});

            matchJson.$match.organ_id=this.app.mongoose.Types.ObjectId(admin_organ_id);
            
            
        }
        if (exam_id) {
            classifyLists= await this.ctx.model.Classify.find({exam_id:exam_id});
        }else{
            if (this.ctx.session.adminInfo.is_super == 1) {
                classifyLists= await this.ctx.model.Classify.find();
                
            }else{
                let admin_organ_id=this.ctx.session.adminInfo.organ_id;
                classifyLists= await this.ctx.model.Classify.find({
                    organ_id:admin_organ_id
                });
            }
            
        }

        
        
     
        var lists = await this.ctx.model.Classify.aggregate([
            findJson,
            findJson1,
            findJson2,
            findJson3,
            findJson4,
            findJson5,
            matchJson,
            {
                $sort: { add_time: -1 }
            }
        ]);
        console.log("lists=========++++++++++");
        console.log(lists);
        
        return {
            lists,exam_id,examLists,classify_id,classifyLists,
        }
    }
}

module.exports = ToolsService;
