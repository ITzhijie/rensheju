'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    async index() {
        let keyword = this.ctx.request.query.keyword || "";
        let findJson1 = {
            $lookup: {
                from: 'organ',
                localField: 'organ_id',
                foreignField: '_id',
                as: 'organ'
            }
        }
        let findJson2 = {
            $lookup: {
                from: 'admin',
                localField: 'admin_id',                
                foreignField: '_id',
                as: 'admin'
            }
        }

        let matchJson;
        if (this.ctx.session.adminInfo.is_super == 1) {
            matchJson = {
                $match: {
                    $or: [
                        { "exam_name": { "$regex": keyword } },
                        { "exam_year": { "$regex": keyword } },
                        { "title": { "$regex": keyword } }
                    ]
                }
            }
        } else {
            let organ_id=this.ctx.session.adminInfo.organ_id;
            matchJson = {
                $match: {
                    "organ_id": this.app.mongoose.Types.ObjectId(organ_id),
                    $or: [
                        { "exam_name": { "$regex": keyword } },
                        { "exam_year": { "$regex": keyword } },
                        { "title": { "$regex": keyword } }
                    ]
                }
            }
        }

        var lists = await this.ctx.model.Exam.aggregate([
            findJson1,
            findJson2,
            matchJson,
            {
                $sort: { add_time: -1 }
            }
        ]);
        console.log(lists);

        await this.ctx.render('admin/exam/index', {
            lists,keyword
        });

    }

    async add() {
        await this.ctx.render('admin/exam/add', {});
    }

    async doAdd() {

        var addResult = this.ctx.request.body;
        addResult.organ_id = this.ctx.session.adminInfo.organ_id;
        addResult.admin_id = this.ctx.session.adminInfo._id;


        var res = new this.ctx.model.Exam(addResult);

        res.save();
        await this.success('/admin/exam', '????????????????????????');

    }


    async edit() {

        //?????????????????????

        var id = this.ctx.request.query.id;

        var data = await this.ctx.model.Exam.find({ "_id": id });

        await this.ctx.render('admin/exam/edit', {
            data: data[0]
        });
    }

    async doEdit() {

        let editData = this.ctx.request.body;
        console.log(editData);

        await this.ctx.model.Exam.updateOne({ "_id": editData.id }, editData)

        await this.success('/admin/exam', '????????????????????????')

    }


    async changeStatus() {

        let id = this.ctx.request.body.id;
        let curStatus = this.ctx.request.body.curStatus;
        let newStatus=curStatus==0?1:0;

        await this.ctx.model.Exam.updateOne({ "_id": id }, {"status":newStatus})
        let responseData = {
            code: "00",
            msg: "??????????????????"
        }
        this.ctx.body = responseData;
    }
    

}

module.exports = Controller;
