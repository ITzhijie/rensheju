'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    // 批量上传页面
    async index() {

        let examLists = await this.ctx.model.Exam.find();
        let classifyLists= await this.ctx.model.Classify.find();



        

        await this.ctx.render('admin/batch/index', {examLists,classifyLists});
    }

    //批量上传考生信息
    async batchExaminee() {
        let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";

        if (!exam_id||!classify_id) {
            this.ctx.body={
                code:1,
                msg:"您暂无权限执行此操作"
            }
            return
        }

        var data=await this.service.tools.parseExcel(this.ctx);
    
        console.log('=========data==========');
        console.log(data);

        if (data[0][0]!="序号"||data[0][1]!="姓名"||data[0][2]!="手机号"||data[0][3]!="身份证号") {
            this.ctx.body={
                code:2,
                msg:"您上传的表格格式与模板不一致，无法解析数据，请检查文件格式。"
            }
            return
        }

        //1 遍历表格信息。查询考生有没有注册过，没有就注册  初始化密码为身份证后6位
        //2 查询考生是否报名过，没有就生成报名信息，有就更新审核和缴费状态
        //
        //注意：批量导入用户 详情是否有问题  考生信息是否有问题
        //用户表与考生表添加【是否为批量导入】【批量导入人】字段
        //
        let classifyInfo= await this.ctx.model.Classify.findOne({
            _id:classify_id
        });

        let totalNum=data.length-1;
        let successNum=0;
        for (let i = 1; i < data.length; i++) {

            var reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;    //11位手机号码正则
            if (!reg_tel.test(data[i][2])||data[i][3].length!=18) {
                continue
            }

            //1 遍历表格信息。查询考生有没有注册过，没有就注册  初始化密码为身份证后6位

            let user_id;

            var idcodeRes = await this.ctx.model.User.find({
                idcode:data[i][3],
            });
            var phoneRes = await this.ctx.model.User.find({
                phone:data[i][2],
            });


            //都有就不注册 查询考生信息 有就更新 没有就生成
            if (idcodeRes.length>0 && phoneRes.length>0) {
                let ures = await this.ctx.model.User.find({
                    uname:data[i][1],
                    phone:data[i][2],
                    idcode:data[i][3]
                });
                if (ures.length==1) {
                    user_id=ures[0]._id;

                    let examineeRes = await this.ctx.model.Examinee.find({
                        classify_id:classify_id,
                        user_id:user_id,
                        verify_status:{$lt:2}
                    });
                    if (examineeRes.length==0) {

                        await new this.ctx.model.Examinee({
                            organ_id:this.ctx.session.adminInfo.organ_id,
                            exam_id:exam_id,
                            classify_id:classify_id,
                            user_id:user_id,
                            uname:data[i][1],
                            phone:data[i][2],
                            idcode:data[i][3],
                            apply_time:new Date(),
                            verify_status:1,
                            verify_admin:this.ctx.session.adminInfo._id,
                            verify_time:new Date(),
                            pay_status:1,
                            pay_time:new Date(),
                            pay_fee:classifyInfo.apply_fee,
                            is_batch:1,
                            batch_id:this.ctx.session.adminInfo._id
                        }).save();

                    }else{
                        await this.ctx.model.Examinee.updateOne({ "_id": examineeRes[0]._id }, {
                            uname:data[i][1],
                            phone:data[i][2],
                            idcode:data[i][3],
                            verify_status:1,
                            verify_admin:this.ctx.session.adminInfo._id,
                            verify_time:new Date(),
                            pay_status:1,
                            pay_time:new Date(),
                            pay_fee:classifyInfo.apply_fee,
                            is_batch:1,
                            batch_id:this.ctx.session.adminInfo._id
                        });
                    }
                    successNum++;

                }
            }

            //都没有就注册新用户 同时生成报考信息信息

            if (idcodeRes.length==0 && phoneRes.length==0) {
                var pwd = await this.service.tools.md5(data[i][2].substr(5,6));
                var newUserData =await new this.ctx.model.User({
                    uname:data[i][1],
                    phone:data[i][2],
                    idcode:data[i][3],
                    pwd:pwd,
                    is_batch:1,
                    batch_id:this.ctx.session.adminInfo._id
                }).save();

                user_id=newUserData._id;

                await new this.ctx.model.Examinee({
                    organ_id:this.ctx.session.adminInfo.organ_id,
                    exam_id:exam_id,
                    classify_id:classify_id,
                    user_id:user_id,
                    uname:data[i][1],
                    phone:data[i][2],
                    idcode:data[i][3],
                    apply_time:new Date(),
                    verify_status:1,
                    verify_admin:this.ctx.session.adminInfo._id,
                    verify_time:new Date(),
                    pay_status:1,
                    pay_time:new Date(),
                    pay_fee:classifyInfo.apply_fee,
                    is_batch:1,
                    batch_id:this.ctx.session.adminInfo._id
                }).save();

                successNum++;

            }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
        }


        this.ctx.body ={
            code:0,
            msg:"导入完成！总数量："+totalNum+"，成功导入数量："+successNum
        };


        
    }

    
}

module.exports = Controller;
