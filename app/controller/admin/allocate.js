'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    //待分配
    async allocating() {
        let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";

        let page = this.ctx.request.query.page||1;

        let res=await this.ctx.service.getData.getAllocating(exam_id,classify_id,page);

        await this.ctx.render('admin/allocate/allocating', res);
		

    }
    
    //分配页面 
    async allocatePage(){
        let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";

        console.log(exam_id);
        console.log(classify_id);

        let page = this.ctx.request.query.page||1;

        let lists=await this.ctx.service.getData.getAllocatingExaminee(exam_id,classify_id,page);
        console.log("分配页面lists=========");
        console.log(lists);

        await this.ctx.render('admin/allocate/allocatePage', {lists});
    }

    //已分配
    async allocated() {
        // 少于考试结束时间 exam_end  room_status 分配状态为1
        let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";

        let examLists, classifyLists;

        let findJson1 = {
            $lookup: {
                from: 'exam',
                localField: 'exam_id',
                foreignField: '_id',
                as: 'exam'
            }
        }

        var findJson2 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status: 1,
                            pay_status: 1,
                            room_status: 1,
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
                room_status: 1,
                exam_end: { $gt: new Date() }
            }
        }
        if (exam_id) {
            matchJson.$match.exam_id = exam_id;
        }
        if (classify_id) {
            matchJson.$match._id = classify_id;
        }
        if (this.ctx.session.adminInfo.is_super == 1) {
            examLists = await this.ctx.model.Exam.find();
            //classifyLists = await this.ctx.model.Classify.find();

        } else {
            let admin_organ_id = this.ctx.session.adminInfo.organ_id;
            examLists = await this.ctx.model.Exam.find({ organ_id: admin_organ_id });
            //classifyLists = await this.ctx.model.Classify.find({organ_id:admin_organ_id});

            matchJson.$match.organ_id = this.app.mongoose.Types.ObjectId(admin_organ_id);


        }
        if (exam_id) {
            classifyLists = await this.ctx.model.Classify.find({ exam_id: exam_id });
        } else {
            if (this.ctx.session.adminInfo.is_super == 1) {
                classifyLists = await this.ctx.model.Classify.find();

            } else {
                let admin_organ_id = this.ctx.session.adminInfo.organ_id;
                classifyLists = await this.ctx.model.Classify.find({
                    organ_id: admin_organ_id
                });
            }

        }

        var page = this.ctx.request.query.page || 1;
        var pageSize = 10;
        var allLists = await this.ctx.model.Classify.aggregate([
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
        var lists = await this.ctx.model.Classify.aggregate([
            findJson1,
            findJson2,
            matchJson,
            {
                $sort: { add_time: -1 }
            },
            { "$skip": (page - 1) * pageSize },
            { "$limit": pageSize }
        ]);
        console.log("lists=========++++++++++");
        console.log(lists);

        await this.ctx.render('admin/allocate/allocated', {

            lists, exam_id, examLists, classify_id, classifyLists,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            totalNum: totalNum
        });
       

	}

    //已结束
    async endLists() {
        // 大于考试结束时间 exam_end  room_status 分配状态为1
        let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";

        let examLists, classifyLists;

        let findJson1 = {
            $lookup: {
                from: 'exam',
                localField: 'exam_id',
                foreignField: '_id',
                as: 'exam'
            }
        }

        var findJson2 = {
            $lookup: {
                from: "examinee",
                let: { classify_id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            verify_status: 1,
                            pay_status: 1,
                            room_status: 1,
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
                room_status: 1,
                exam_end: { $lt: new Date() }
            }
        }
        if (exam_id) {
            matchJson.$match.exam_id = exam_id;
        }
        if (classify_id) {
            matchJson.$match._id = classify_id;
        }
        if (this.ctx.session.adminInfo.is_super == 1) {
            examLists = await this.ctx.model.Exam.find();
            //classifyLists = await this.ctx.model.Classify.find();

        } else {
            let admin_organ_id = this.ctx.session.adminInfo.organ_id;
            examLists = await this.ctx.model.Exam.find({ organ_id: admin_organ_id });
            //classifyLists = await this.ctx.model.Classify.find({organ_id:admin_organ_id});

            matchJson.$match.organ_id = this.app.mongoose.Types.ObjectId(admin_organ_id);


        }
        if (exam_id) {
            classifyLists = await this.ctx.model.Classify.find({ exam_id: exam_id });
        } else {
            if (this.ctx.session.adminInfo.is_super == 1) {
                classifyLists = await this.ctx.model.Classify.find();

            } else {
                let admin_organ_id = this.ctx.session.adminInfo.organ_id;
                classifyLists = await this.ctx.model.Classify.find({
                    organ_id: admin_organ_id
                });
            }

        }

        var page = this.ctx.request.query.page || 1;
        var pageSize = 10;
        var allLists = await this.ctx.model.Classify.aggregate([
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
        var lists = await this.ctx.model.Classify.aggregate([
            findJson1,
            findJson2,
            matchJson,
            {
                $sort: { add_time: -1 }
            },
            { "$skip": (page - 1) * pageSize },
            { "$limit": pageSize }
        ]);
        console.log("lists=========++++++++++");
        console.log(lists);

        await this.ctx.render('admin/allocate/endLists', {

            lists, exam_id, examLists, classify_id, classifyLists,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            totalNum: totalNum
        });
   

	}



}

module.exports = Controller;
