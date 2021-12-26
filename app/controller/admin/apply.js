'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    
    async verifying() {

        let exam_id =this.ctx.request.query.exam_id?this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id =this.ctx.request.query.classify_id?this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";

        let examLists,classifyLists;
     
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
                "verify_status":0,
            }
        }
        if (exam_id) {
            matchJson.$match.exam_id=exam_id;
        }
        if (classify_id) {
            matchJson.$match.classify_id=classify_id;
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

        var page = this.ctx.request.query.page || 1;
        var pageSize = 1;
        var allLists =  await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            matchJson
        ]);
        var totalNum=allLists.length;
        var lists = await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            matchJson,
            {
                $sort: { add_time: -1 }
            },
            { "$skip":(page - 1) * pageSize }, 
            { "$limit":pageSize }
        ]);
        console.log("=================lists===========");
        console.log(exam_id);
        console.log(classify_id);
        
        console.log(lists);
        

        await this.ctx.render('admin/apply/verifying', {lists,exam_id,examLists,classify_id,classifyLists,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            totalNum:totalNum
        });
    }
    async verifyPage() {
        let examinee_id =this.app.mongoose.Types.ObjectId(this.ctx.request.query.id);
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
                "_id":examinee_id,
            }
        }
        var examinees = await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            matchJson
        ]);

        await this.ctx.render('admin/apply/verifyPage', {examineeInfo:examinees[0]});
    }
}

module.exports = Controller;
