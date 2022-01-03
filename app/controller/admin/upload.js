'use strict';
var sd=require('silly-datetime');

var BaseController = require('./base.js');

class Controller extends BaseController {

    //上传分配考场表格
	async uploadAllocate() {
        const { ctx } = this;

        var bodydata = this.ctx.request.query;
        console.log('bodydata=====');
        console.log(bodydata);
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
        //{ $sample: { size: N } }
        // 1.校验格式
        if (data[0][0]!="考点名"||data[0][2]!="考点地址"||data[1][0]!="考场号"||data[1][1]!="座位号") {
            this.ctx.body={
                code:2,
                msg:"您上传的表格格式与模板不一致，无法解析数据，请检查文件格式。"
            }
            return
        }
        // 2.遍历考场信息 查询考点+考场 没有就储存  
        // 3.遍历座位号 随机获取一名考生信息  判断是否有信息 如有 则分配考场座位
        //   判断该考场座次号是否被分配 未分配才可分配

        let room_name=data[0][1];
        let room_addr=data[0][3];

        for (let i = 2; i < data.length; i++) {
            if (data[i][0]) {
                
                
                var seatArr=data[i];
                var room_num=data[i][0];
                for (let k = 1; k < seatArr.length; k++) {
                    //判断座位是否已经被分配
                    var isAllocate = await this.ctx.model.Examinee.find({
                        exam_id:exam_id,
                        classify_id:classify_id,
                        room_status: 1,
                        verify_status:1,
                        pay_status:1,
                        room_name: room_name,
                        room_num:room_num,
                        seat_num:seatArr[k],
                    });
                    if (isAllocate.length==0) {
                        var examineeLists = await this.ctx.model.Examinee.aggregate([
                            {
                                $lookup: {
                                    from: 'exam',
                                    localField: 'exam_id',
                                    foreignField: '_id',
                                    as: 'exam'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'classify',
                                    localField: 'classify_id',                
                                    foreignField: '_id',
                                    as: 'classify'
                                }
                            },
                            {
                                $match: {
                                    exam_id:exam_id,
                                    classify_id:classify_id,
                                    room_status: 0,
                                    verify_status:1,
                                    pay_status:1
                                }
                            },
                            { $sample: { size: 1 } }
                        ]);
                        if (examineeLists.length==1) {
                            //储存已被分配的考场信息
                            var roomRes = await this.ctx.model.Examroom.find({
                                exam_id:exam_id,
                                classify_id:classify_id,
                                room_name: room_name,
                                room_addr: room_addr,
                                room_num: data[i][0]
                            });
                            if (roomRes.length == 0) {
                                new this.ctx.model.Examroom({
                                    exam_id:exam_id,
                                    classify_id:classify_id,
                                    room_name: room_name,
                                    room_addr: room_addr,
                                    room_num: data[i][0],
                                    seats_num: data[i].length - 1
                                }).save();
                            }
            

                            //准考证号生成规则 考试年份exam_year+专业号+考场号+座位号
                            var code = Math.floor(Math.random() * 10000);
                            if (code < 1000) {code += 1000};
                            var exam_card=examineeLists[0].exam[0].exam_year
                            +examineeLists[0].classify[0].classify_code
                            +code+room_num+seatArr[k];
                            
                            //下载日期 当天的第二天
                            var dateStr1=new Date().getTime()+24*60*60*1000;
                            var dateStr2=sd.format(dateStr1,'YYYY-MM-DD');
                            var dateStr3=dateStr2+" 00:00";
    
                            await this.ctx.model.Examinee.updateOne({ "_id": examineeLists[0]._id }, {
                                room_status:1,
                                room_name:room_name,
                                room_addr:room_addr,
                                room_num:room_num,
                                seat_num:seatArr[k],
                                exam_card:exam_card,
                                downcard_date:new Date(dateStr3)
                            })
                        }
                    }
                    
                    
                }
            }
        }
        // 4.判断是否分配完成
        var noAllocateLists = await this.ctx.model.Examinee.aggregate([
            {
                $match: {
                    exam_id:exam_id,
                    classify_id:classify_id,
                    room_status: 0,
                    verify_status:1,
                    pay_status:1
                }
            }
        ]);
        if (noAllocateLists.length==0) {
            //分配完毕
            await this.ctx.model.Classify.updateOne({ "_id": classify_id }, {
                room_status:1  
            })
            this.ctx.body ={
                code:0,
                msg:"导入完成，所有考生已分配完毕！"
            };
        }else{
            this.ctx.body ={
                code:0,
                msg:"导入成功,尚有考生未分配座位，请继续分配。"
            };
        }
        

	}

    //上传成绩表格
    async uploadScore(){
        const { ctx } = this;

        var bodydata = this.ctx.request.query;
        console.log('bodydata=====');
        console.log(bodydata);
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

        //1.获取科目id
        var subjectLists = await this.ctx.model.Subject.find({classify_id:classify_id});

        //2.校验格式
        var title=data[0];//title数组

        for (let i = 0; i < subjectLists.length; i++) {
            if (title[5+i] != subjectLists[i].subject_name) {
                this.ctx.body={
                    code:2,
                    msg:"您上传的表格格式与模板不一致，无法解析数据，请检查文件格式。"
                }
                return
            }
        }
        
        if (title[0]!="序号"||title[1]!="姓名"||title[2]!="手机号"||title[3]!="身份证号"||title[4]!="准考证号") {
            this.ctx.body={
                code:3,
                msg:"您上传的表格格式与模板不一致，无法解析数据，请检查文件格式。"
            }
            return
        }

        /*
        * 遍历考生信息 
        * 查询考生id 
        * 遍历科目 将分数储存进数据库 修改考生分数发布状态
        * 查询是否所有的考生都发布分数 若所有的考生均发布
        * 
        *
        */
        for (let i = 1; i < data.length; i++) {
            var examineeArr=data[i];
            var examineeInfo = await this.ctx.model.Examinee.find({
                classify_id:classify_id,
                uname:examineeArr[1],
                idcode:examineeArr[3]
            });
            console.log("================examineeInfo");
            console.log(examineeInfo);
            
            if (examineeInfo.length>0) {
                for (let k = 0; k < subjectLists.length; k++) {

                    var isScore = await this.ctx.model.Score.find({
                        examinee_id:examineeInfo[0]._id,
                        subject_id:subjectLists[k]._id,
                    });
                    if (isScore.length==0) {
                        new this.ctx.model.Score({
                            examinee_id:examineeInfo[0]._id,
                            subject_id:subjectLists[k]._id,
                            core:examineeArr[5+k]||0,
                        }).save();
    
                        await this.ctx.model.Examinee.updateOne({ "_id": examineeInfo[0]._id }, {
                            result_status:1
                        })
                    }else{
                        await this.ctx.model.Score.updateOne({ "_id": isScore[0]._id }, {
                            core:examineeArr[5+k]||0,
                        })
                    }

                    

                }
            }

        }

        var noScoreLists = await this.ctx.model.Examinee.aggregate([
            {
                $match: {
                    exam_id:exam_id,
                    classify_id:classify_id,
                    room_status: 1,
                    verify_status:1,
                    pay_status:1,
                    result_status:0
                }
            }
        ]);

        if (noScoreLists.length==0) {
            //分配完毕
            await this.ctx.model.Classify.updateOne({ "_id": classify_id }, {
                score_status:1  
            })
            this.ctx.body ={
                code:0,
                msg:"导入完成，所有考生成绩已发布！"
            };
        }else{
            this.ctx.body ={
                code:0,
                msg:"导入成功,尚有考生发布成绩，请继续发布。"
            };
        }


    }



}

module.exports = Controller;
