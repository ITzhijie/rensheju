'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    async index() {
        let exam_id = this.ctx.request.query.exam_id || "";
        let examLists=[];
        let findJson = {
            $lookup: {
                from: 'exam',
                localField: 'exam_id',
                foreignField: '_id',
                as: 'exam'
            }
        }
        

        let matchJson={};
        if (this.ctx.session.adminInfo.is_super == 1) {
            examLists = await this.ctx.model.Exam.find();
            if(exam_id){
                matchJson = {
                    $match: {
                        "exam_id":this.app.mongoose.Types.ObjectId(exam_id)
                    }
                }
            }else{
                matchJson = {
                    $match: {
                        
                    }
                }
            }
            
        } else {
            let admin_organ_id=this.ctx.session.adminInfo.organ_id;
            examLists = await this.ctx.model.Exam.find({organ_id:admin_organ_id});
            if (exam_id) {
                matchJson = {
                    $match: {
                        "exam_id":this.app.mongoose.Types.ObjectId(exam_id)
                    }
                }
            }else{
                matchJson = {
                    $match: {
                        "organ_id":this.app.mongoose.Types.ObjectId(admin_organ_id)
                    }
                }
            }
            
        }

        var lists = await this.ctx.model.Classify.aggregate([
            findJson,
            matchJson,
            {
                $sort: { add_time: -1 }
            }
        ]);
        console.log("lists=========++++++++++");
        console.log(lists);
        await this.ctx.render('admin/classify/index', {
            lists,exam_id,examLists
        });

    }

    async add() {
        var examLists=[];
        if (this.ctx.session.adminInfo.is_super == 1) {
            examLists = await this.ctx.model.Exam.find();
        } else {
            let organ_id=this.ctx.session.adminInfo.organ_id;
            examLists = await this.ctx.model.Exam.find({organ_id:organ_id});
        }
        

        await this.ctx.render('admin/classify/add', {examLists});
    }

    async doAdd() {
        /*
        * 1.储存专业信息 返回专业id
        * 2.储存科目信息 JSON.parse转义 遍历储存
        */
        const {ctx}=this;
        var addResult = this.ctx.request.body;
        console.log("====1111111111=====addResult==========");
        
        let subjectArr=JSON.parse(addResult.subjectArr);
        addResult.apply_start=new Date(addResult.apply_start+" 00:00");
        addResult.apply_end=new Date(addResult.apply_end+" 23:59");
        addResult.pay_end=new Date(addResult.pay_end+" 23:59");
        addResult.exam_start=new Date(subjectArr[0].exam_date+" 00:00");
        addResult.exam_end=new Date(subjectArr[subjectArr.length-1].exam_date+" 23:59");

        let examData=await this.ctx.model.Exam.findOne({_id:addResult.exam_id});
        addResult.organ_id=examData.organ_id;
        var res =await new this.ctx.model.Classify(addResult).save();

        subjectArr.forEach(function(v){
            v.classify_id=res._id;
            v.exam_date=new Date(v.exam_date);
            new ctx.model.Subject(v).save();
        })

        await this.success('/admin/classify', '增加专业成功');
   
    }


    async edit() {

        //获取编辑的数据

        var id = this.ctx.request.query.id;

        var data = await this.ctx.model.Classify.find({ "_id": id });

        var examLists=await this.ctx.model.Exam.find({organ_id:data[0].organ_id});
        // if (this.ctx.session.adminInfo.is_super == 1) {
        //     examLists = await this.ctx.model.Exam.find();
        // } else {
        //     let organ_id=this.ctx.session.adminInfo.organ_id;
        //     examLists = await this.ctx.model.Exam.find({organ_id:organ_id});
        // }
        var subjectData=await this.ctx.model.Subject.find({classify_id:id});
        var subjectStr=JSON.stringify(subjectData);

        await this.ctx.render('admin/classify/edit', {
            data: data[0],
            examLists,
            subjectStr,
            subjectData
        });
    }

    async doEdit() {

        const {ctx}=this;
        var editData = this.ctx.request.body;
        console.log("====1111111111=====editData==========");
        
        let subjectArr=JSON.parse(editData.subjectArr);
        console.log(subjectArr);
        

        editData.apply_start=new Date(editData.apply_start+" 00:00");
        editData.apply_end=new Date(editData.apply_end+" 23:59");
        editData.pay_end=new Date(editData.pay_end+" 23:59");
      
        editData.exam_start=new Date(subjectArr[0].exam_date+" 00:00");
        editData.exam_end=new Date(subjectArr[subjectArr.length-1].exam_date+" 23:59");

        await this.ctx.model.Classify.updateOne({ "_id": editData.id }, editData);

        await this.ctx.model.Subject.deleteMany({ "classify_id": this.app.mongoose.Types.ObjectId(editData.id) });
        subjectArr.forEach(function(v){
            v.classify_id=editData.id;
            v.exam_date=new Date(v.exam_date);
            new ctx.model.Subject(v).save();
        })



        await this.success('/admin/classify', '修改考试专业成功')

    }


    

}

module.exports = Controller;
