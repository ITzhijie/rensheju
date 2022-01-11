'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    // 待审核列表
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
        var pageSize = 10;
        var allLists =  await this.ctx.model.Examinee.aggregate([
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

    //审核详情
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

    //审核操作
    async doVerify(){
        let data =this.ctx.request.query;
        let info=await this.ctx.model.Examinee.findOne({"_id": data.id});
        if(data.verify_status==1){
            await this.ctx.model.Examinee.updateOne({ "_id": data.id }, {
                verify_status:data.verify_status,
                verify_admin:this.ctx.session.adminInfo._id,
                verify_time:new Date()
            })
            await this.ctx.service.tools.sendMsg(info.phone,1,info.uname);

        }
        if(data.verify_status==2){
            await this.ctx.model.Examinee.updateOne({ "_id": data.id }, {
                verify_status:data.verify_status,
                verify_reason:data.verify_reason,
                verify_admin:this.ctx.session.adminInfo._id,
                verify_time:new Date()
            })
            await this.ctx.service.tools.sendMsg(info.phone,2,info.uname);

        }
        console.log("======backpage======");
        console.log(data.backpage);

        var backpage=data.backpage.replace(/@@/g,"&");
        console.log(backpage);

        this.ctx.redirect(backpage);

    }
    
    //已审核页面
    async verifyed() {
        
        let exam_id =this.ctx.request.query.exam_id?this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id =this.ctx.request.query.classify_id?this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";
        let verify_status =+this.ctx.request.query.verify_status;
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
        let findJson3 = {
            $lookup: {
                from: 'admin',
                localField: 'verify_admin',                
                foreignField: '_id',
                as: 'admin'
            }
        }

        let matchJson = {
            $match: {
                
            }
        }
        if (verify_status) {
            console.log("verify_status============1");
            console.log(verify_status);

            matchJson = {
                $match: {
                    "verify_status":verify_status
                }
            }
        }else{
            console.log("verify_status============2");
            console.log(verify_status);
            matchJson = {
                $match: {
                    "verify_status":{$gt:0}
                }
            }
        }
        console.log("verify_status============3");
            console.log(verify_status);
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
        var pageSize = 10;
        var allLists =  await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            findJson3,
            matchJson
        ]);
        var totalNum=allLists.length;
        if(page>Math.ceil(totalNum / pageSize)){
            page=Math.ceil(totalNum / pageSize)
        }
        if(page<=0){
            page=1;
        }
        
        var lists = await this.ctx.model.Examinee.aggregate([
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
        console.log("=================lists===========");
        console.log(exam_id);
        console.log(classify_id);
        
        console.log(lists);
        

        await this.ctx.render('admin/apply/verifyed', {lists,exam_id,examLists,classify_id,classifyLists,verify_status,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            totalNum:totalNum
        });
    }

    //审核详情
    async verifyedDetail() {
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

        await this.ctx.render('admin/apply/verifyedDetail', {examineeInfo:examinees[0]});
    }

    //缴费管理 payLists
    async payLists(){
         
        let exam_id =this.ctx.request.query.exam_id?this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id =this.ctx.request.query.classify_id?this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";
        let pay_status =this.ctx.request.query.pay_status;
        let keyword =this.ctx.request.query.keyword||"";

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
        let findJson3 = {
            $lookup: {
                from: 'admin',
                localField: 'verify_admin',                
                foreignField: '_id',
                as: 'admin'
            }
        }

        console.log('pay_status=======');
        console.log(pay_status);
        
        if (pay_status===undefined) {
            pay_status=3;
        }
        let matchJson = {
            $match: {
                "verify_status":1,
                $or: [
                    { "uname": { "$regex": keyword } },
                    { "phone": { "$regex": keyword } }
                ]
            }
        }
        console.log('pay_status=======');
        console.log(pay_status);
        if (pay_status==0||pay_status==1) {
            matchJson.$match.pay_status=+pay_status;
        }
        
        if (exam_id) {
            matchJson.$match.exam_id=exam_id;
        }
        if (classify_id) {
            matchJson.$match.classify_id=classify_id;
        }


        if (this.ctx.session.adminInfo.is_super == 1) {
            examLists = await this.ctx.model.Exam.find();
            
        } else {
            let admin_organ_id=this.ctx.session.adminInfo.organ_id;
            examLists = await this.ctx.model.Exam.find({organ_id:admin_organ_id});

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
        var pageSize = 10;
        var allLists =  await this.ctx.model.Examinee.aggregate([
            findJson1,
            findJson2,
            findJson3,
            matchJson
        ]);
        var totalNum=allLists.length;
        if(page>Math.ceil(totalNum / pageSize)){
            page=Math.ceil(totalNum / pageSize)
        }
        if(page<=0){
            page=1;
        }
        
        var lists = await this.ctx.model.Examinee.aggregate([
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
        console.log("=================lists===========");
        console.log(exam_id);
        console.log(classify_id);
        
        console.log(lists);
        

        await this.ctx.render('admin/apply/payLists', {lists,exam_id,examLists,classify_id,classifyLists,pay_status,keyword,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            totalNum:totalNum
        });
    }

    //缴费详情  payDetail
    async payDetail(){
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

        await this.ctx.render('admin/apply/payDetail', {examineeInfo:examinees[0]});
    }
}

module.exports = Controller;
