'use strict';

const fs = require('fs');

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

        let data=await this.ctx.service.getData.getAllocatingExaminee(exam_id,classify_id,page);
        console.log("分配页面data=========");
        console.log(data);

        await this.ctx.render('admin/allocate/allocatePage', data);
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
    
    async allocatedDetail(){
        let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";
        let room_name=this.ctx.request.query.room_name;
        let room_num=this.ctx.request.query.room_num;

        console.log(exam_id);
        console.log(classify_id);



        var rooms = await this.ctx.model.Examroom.find({
            exam_id: exam_id,
            classify_id: classify_id
        });
        if (!room_name) {
            room_name=rooms[0].room_name;
            room_num=rooms[0].room_num;
        }

        var roomNameArr = [];//所有考点列表
        for (let i = 0; i < rooms.length; i++) {
            if (roomNameArr.indexOf(rooms[i].room_name) < 0) {
                roomNameArr.push(rooms[i].room_name);
            }
        }
        var rooms2 = await this.ctx.model.Examroom.find({
            exam_id: exam_id,
            classify_id: classify_id,
            room_name:room_name
        });
        var roomNumArr=[];//所有考场号列表
        for (let i = 0; i < rooms2.length; i++) {
            if (roomNumArr.indexOf(rooms2[i].room_num) < 0) {
                roomNumArr.push(rooms2[i].room_num);
            }
        }

        //查询考场所有考生信息
        var lists = await this.ctx.model.Examinee.find({
            exam_id: exam_id,
            classify_id: classify_id,
            room_name:room_name,
            room_num:room_num
        });

        // let page = this.ctx.request.query.page||1;
        // let data=await this.ctx.service.getData.getAllocatingExaminee(exam_id,classify_id,page,1);
        // console.log("分配页面data=========");
        // console.log(data);

        await this.ctx.render('admin/allocate/allocatedDetail', {
            lists,exam_id,classify_id,room_name,room_num,roomNameArr,roomNumArr
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

    async scoreDetail(){
        let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";

        let page = this.ctx.request.query.page||1;

        let data=await this.ctx.service.getData.getscoreExaminee(exam_id,classify_id,page);
        console.log("分配页面data=========");
        console.log(data);


        //获取上传文件名称
        var classifyInfo = await this.ctx.model.Classify.aggregate([
            {
                $lookup: {
                    from: 'exam',
                    localField: 'exam_id',
                    foreignField: '_id',
                    as: 'exam'
                }
            },
            {
                $match: {
                    "_id":classify_id
                }
            }
        ]);
        var filename=classifyInfo[0].exam[0].exam_name+classifyInfo[0].exam[0].exam_year+"（"+classifyInfo[0].classify_name+")成绩模板";
        data.filename=filename;

        var subjectLists = await this.ctx.model.Subject.find({classify_id:classify_id});
        data.subjectLists=subjectLists;

        await this.ctx.render('admin/allocate/scoreDetail', data);


    }

    async downScoreExaminees(){
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";
        var subjectLists = await this.ctx.model.Subject.find({classify_id:classify_id});
        var title = ['序号','姓名','手机号','身份证号','准考证号'];
        for (let i = 0; i < subjectLists.length; i++) {
            title.push(subjectLists[i].subject_name);
        }
        console.log('========title========');
        console.log(title);
        
       
        var examineeLists = await this.ctx.model.Examinee.find({
            classify_id:classify_id,
            room_status:1,
            verify_status:1,
            pay_status:1
        });

        var results=[];
        for (let i = 0; i < examineeLists.length; i++) {
            var obj={
                "index":i+1,
                "uname":examineeLists[i].uname,
                "phone":examineeLists[i].phone,
                "idcode":examineeLists[i].idcode,
                "exam_card":examineeLists[i].exam_card
            }
            results.push(obj);
        }
        console.log(results);
        
        var classifyInfo = await this.ctx.model.Classify.aggregate([
            {
                $lookup: {
                    from: 'exam',
                    localField: 'exam_id',
                    foreignField: '_id',
                    as: 'exam'
                }
            },
            {
                $match: {
                    "_id":classify_id
                }
            }
        ]);

        var filename=classifyInfo[0].exam[0].exam_name+classifyInfo[0].exam[0].exam_year+"（"+classifyInfo[0].classify_name+")成绩模板";
        //由于各列数据长度不同，可以设置一下列宽
        const options = {'!cols': [{ wch: 5 }, { wch: 10}, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ]};
        
        var filePath=await this.service.tools.buildExcel(title,results,options,filename);

        this.ctx.attachment(filePath);
        this.ctx.set("Content-Type", "application/octet-stream");
        this.ctx.body =fs.createReadStream(filePath);
        fs.unlink(filePath,function(err){
            console.log("文件删除了");
        });

    }

}

module.exports = Controller;
