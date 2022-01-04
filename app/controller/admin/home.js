'use strict';
const sm3 = require('sm3');

var BaseController = require('./base.js');


class Controller extends BaseController {
    //登录
    async login() {
        this.ctx.session.userInfo = null;
        await this.ctx.render('index/login', {});
    }
    
    async loginout() {
        this.ctx.session.userInfo = null;
        await this.ctx.render('index/login', {});
    }
    async doLogin() {
        var phone=this.ctx.request.body.phone;
        var pwd= await this.service.tools.md5(this.ctx.request.body.pwd);

        var res = await this.ctx.model.User.findOne({phone:phone});
        if(!res){
            this.ctx.body={
                code:1,
                msg:"该手机号尚未注册"
            }
            return
        }
        
        if(res.status==0){
            this.ctx.body={
                code:2,
                msg:"您的账号已被禁用"
            }
            return   
        }
        if(pwd!=res.pwd){
            this.ctx.body={
                code:3,
                msg:"密码错误"
            }
            return   
        }
        console.log('===========登录=======');
        console.log(res);
        

        this.ctx.session.userInfo = res;
        this.ctx.body={
            code:0,
            msg:"登录成功"
        }
        
    }

    //注册页面
    async register(){
        this.ctx.session.userInfo = null;
        await this.ctx.render('index/register', {});

    }

    //注册
    async doRegister(){
        let repData={
            code:0,
            msg:"",
        }
        var registData = this.ctx.request.body;

        //首先判断用户code是否正确
        var coderes = await this.ctx.model.Code.findOne({phone:registData.phone});
        console.log('首先判断用户code是否正确=========');
        
        console.log(coderes);

        console.log(coderes.code==registData.code);
        console.log(coderes.code);
        console.log(registData);
        
        console.log(new Date().getTime()-coderes.add_time.getTime()<1800000);
        
        
        if (coderes&&coderes.code==registData.code&&new Date().getTime()-coderes.add_time.getTime()<1800000) {
            await this.ctx.model.Code.deleteMany({ "phone":registData.phone });
            
        }else{
            repData={
                code:1,
                msg:"验证码错误或失效，请重试",
            }
            this.ctx.body=repData;
            return
        }
        
        var res1 = await this.ctx.model.User.findOne({phone:registData.phone});
        if (res1) {
            repData={
                code:2,
                msg:"该手机号已经注册，请直接登录",
            }
            this.ctx.body=repData;
            return
        }
        var res2 = await this.ctx.model.User.findOne({idcode:registData.idcode});
        if (res2) {
            repData={
                code:3,
                msg:"该身份证已经绑定尾号为"+res2.phone.substr(7,4)+"的手机，请用该手机号登录，若非您本人绑定，请到人社局处理。",
            }
            this.ctx.body=repData;
            return
        }


        //注册新用户
        
        registData.pwd = await this.service.tools.md5(registData.pwd);

        var newData =await new this.ctx.model.User(registData).save();

        this.ctx.session.userInfo = newData;

        repData={
            code:0,
            msg:"注册成功",
            data:newData
        }
        this.ctx.body=repData;

    }
    
    //补充图片信息
    async addphoto(){
        var userInfo=this.ctx.session.userInfo;
        if(!userInfo.photo||!userInfo.idcard_z||!userInfo.idcard_f){
            await this.ctx.render('index/addphoto', {});
        }else{
            var lists = await this.ctx.model.Exam.find({ "status": 1 });

            await this.ctx.render('index/index', {lists});
        }
        
    }
    
    async doAddphoto() {
        console.log('=====doAddphoto========');
        console.log(this.ctx.request.body);
        
        var photo=this.ctx.request.body.photo;
        var idcard_z=this.ctx.request.body.idcard_z;
        var idcard_f=this.ctx.request.body.idcard_f;
        if (!photo||!idcard_z||!idcard_f) {
            this.ctx.body={
                code:1,
                msg:"证件信息不完整，请重新上传"
            }
            return
        }
        let userInfo=this.ctx.session.userInfo;

        await this.ctx.model.User.updateOne({ "_id": userInfo._id }, this.ctx.request.body);
        userInfo.photo=photo;
        userInfo.idcard_z=idcard_z;
        userInfo.idcard_f=idcard_f;

        this.ctx.session.userInfo = userInfo;
        this.ctx.body={
            code:0,
            msg:"更新成功"
        }
        
    }

    //忘记密码页面
    async forget(){
        await this.ctx.render('index/forget', {});

    }

    //重置密码 doForget

    async doForget(){
        let repData={
            code:0,
            msg:"",
        }
        var registData = this.ctx.request.body;

        //首先判断用户code是否正确
        var coderes = await this.ctx.model.Code.findOne({phone:registData.phone});
        if (coderes&&coderes.code==registData.code&&new Date().getTime()-coderes.add_time.getTime()<1800000) {
            await this.ctx.model.Code.deleteMany({ "phone":registData.phone });
            
        }else{
            repData={
                code:1,
                msg:"验证码错误或失效，请重试",
            }
            this.ctx.body=repData;
            return
        }
        
        var res1 = await this.ctx.model.User.findOne({
            uname:registData.uname,
            phone:registData.phone,
            idcode:registData.idcode,
        });
        if (!res1) {
            repData={
                code:2,
                msg:"未找到相应用户信息，请检查姓名、手机号、身份证信息是否正确",
            }
            this.ctx.body=repData;
            return
        }



        //更新密码
        
        registData.pwd = await this.service.tools.md5(registData.pwd);

        await this.ctx.model.User.updateOne({ "_id": res1._id }, {pwd:registData.pwd});

        
        repData={
            code:0,
            msg:"更新密码成功"
        }
        this.ctx.body=repData;

    }



    //发送信息
    async sendCode(){
        var phone = this.ctx.request.body.phone;
        var code = Math.floor(Math.random() * 10000);
        if (code < 1000) {code += 1000};

        var data=await this.ctx.service.tools.sendMsg(phone,0,code);

        console.log(data);
        if(data.result=="0"){
            await new this.ctx.model.Code({
                phone,
                code
            }).save();
        }

        this.ctx.body={
            code:data.result,
            msg:data.description,
            data:data
        }

    }

    //首页 考试报名
    async index(){

        var lists = await this.ctx.model.Exam.find({ "status": 1 });

        await this.ctx.render('index/index', {lists});

    }
    
    //我的报名
    async myApply(){
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
                            
                        }
                    },
                ],
                as: "scorelists"
            },

        };
        var findJson4 = {
            $lookup: {
                from: "subject",
                let: { classify_id: "$classify_id" },
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
                ],
                as: "subject"
            },

        };
        var lists = await this.ctx.model.Examinee.aggregate([
            {
                $lookup: {
                    from: 'exam',
                    localField: 'exam_id',
                    foreignField: '_id',
                    as: 'exam'
                }
            },{
                $lookup: {
                    from: 'classify',
                    localField: 'classify_id',
                    foreignField: '_id',
                    as: 'classify'
                }
            },
            findJson3,
            findJson4,
            {
                $match: {
                    "user_id":this.app.mongoose.Types.ObjectId(this.ctx.session.userInfo._id)
                }
            },
            {
                $sort: { apply_time: -1 }
            }
        ]);
        console.log(lists);
        let nowDate=new Date();
        
        await this.ctx.render('index/myApply', {lists,nowDate});

    }
    //我的资料 

    async myInfo(){
        
        await this.ctx.render('index/myInfo', {});

    }
    //考试公告 
    async examInfo(){
        var id = this.ctx.request.query.id;

        var data = await this.ctx.model.Exam.findOne({ "_id": id });
        var classifyLists = await this.ctx.model.Classify.find({ "exam_id": data._id });

        await this.ctx.render('index/examInfo', {data,classifyLists});

    }
    //选择专业 exam_name
    async classifyLists(){
        var id = this.ctx.request.query.id;
        var exam_name = this.ctx.request.query.exam_name;

        var classifyLists = await this.ctx.model.Classify.find({ "exam_id": id });

        await this.ctx.render('index/classifyLists', {classifyLists,exam_name});

    }

    //确认 
    async confirm(){
        var classify_id = this.ctx.request.query.id;
        
        var lists = await this.ctx.model.Classify.aggregate([
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
                    "_id":this.app.mongoose.Types.ObjectId(classify_id)
                }
            }
        ]);
        console.log(lists);
        
        await this.ctx.render('index/confirm', {classifyData:lists[0]});

    }
    
    // 确认提交
    async doConfirm() {
        var data=this.ctx.request.body;
        var userInfo=this.ctx.session.userInfo;
        var examineeData={
            user_id:userInfo._id,
            uname:userInfo.uname,
            idcode:userInfo.idcode,
            phone:userInfo.phone,
            photo:userInfo.photo,
            idcard_z:userInfo.idcard_z,
            idcard_f:userInfo.idcard_f,
            organ_id:data.organ_id,
            exam_id:data.exam_id,
            classify_id:data.classify_id,
            apply_annex:data.apply_annex,
            apply_time:new Date(),
        };

        var res = await this.ctx.model.Examinee.findOne({
            user_id:userInfo._id,
            classify_id:data.classify_id,
            verify_status:1
        });
        if(res){
            this.ctx.body={
                code:1,
                msg:"您已经报名过该考试，请在【我的报名】中查看"
            }
            return
        }


        await new this.ctx.model.Examinee(examineeData).save();
        
        this.ctx.body={
            code:0,
            msg:"报名成功"
        }
        
    }

    async getScoreInfo(){
        var examinee_id=this.ctx.request.body.examinee_id;

        var examinee = await this.ctx.model.Examinee.findOne({
            "_id":examinee_id
        });
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
                            
                        }
                    },
                ],
                as: "scorelists"
            },

        };
        var findJson4 = {
            $lookup: {
                from: "subject",
                let: { classify_id: "$classify_id" },
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
                ],
                as: "subject"
            },

        };
        var datas = await this.ctx.model.Examinee.aggregate([
            {
                $lookup: {
                    from: 'exam',
                    localField: 'exam_id',
                    foreignField: '_id',
                    as: 'exam'
                }
            },{
                $lookup: {
                    from: 'classify',
                    localField: 'classify_id',
                    foreignField: '_id',
                    as: 'classify'
                }
            },
            findJson3,
            findJson4,
            {
                $match: {
                    "_id":this.app.mongoose.Types.ObjectId(examinee_id)
                }
            }
        ]);

        this.ctx.body={
            code:0,
            msg:"获取成绩成功",
            data:datas[0]
        }
    }

    async changePayStatus(){
        var examinee_id=this.ctx.request.body.examinee_id;
        var fee=this.ctx.request.body.fee;

        await this.ctx.model.Examinee.updateOne({ "_id": examinee_id }, {
            pay_status:1,
            pay_time:new Date(),
            pay_fee:fee
        });
        this.ctx.body={
            code:0,
            msg:"缴费成功"
        }
    }

}

module.exports = Controller;