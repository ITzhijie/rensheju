'use strict';

var BaseController = require('./base.js');

class AnnouncementController extends BaseController {
    async index() {

        var keyword = this.ctx.request.query.keyword||"";
        console.log(keyword);

        var page = this.ctx.request.query.page || 1;
        var pageSize = 10;


        var findJson = {
            type:2,
            $or: [
                { "title": { "$regex": keyword } }
            ]
        }
        var totalNum = await this.ctx.model.Detail.find(findJson).countDocuments();
        console.log("totalNum:"+totalNum)

        var result = await this.ctx.model.Detail.find(findJson).sort({"updateTime":-1}).skip((page - 1) * pageSize).limit(pageSize);
        console.log(result);

        await this.ctx.render('admin/announcement/index', {
            lists: result,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            keyword:keyword,
            totalNum:totalNum
        });


    }
    async add() {
        
        await this.ctx.render('admin/announcement/add', {});

    }

    async doAdd() {
        var bannerData=this.ctx.request.body;
        console.log(bannerData);
        

        var banner = new this.ctx.model.Detail(bannerData);

        banner.save();
        await this.success('/admin/announcement', '增加公告成功');


    }

    async edit() {
        var id = this.ctx.request.query.id;

        var Result = await this.ctx.model.Detail.find({ "_id": id });
        await this.ctx.render('admin/announcement/edit', {
    
          bannerResult: Result[0]
        });
    }


    async doEdit() {
        var id = this.ctx.request.body.id;
        // var password=this.ctx.request.body.password;
        var editData = this.ctx.request.body;

        await this.ctx.model.Detail.updateOne({ "_id": id }, editData)
        await this.success('/admin/announcement', '修改公告成功')

    }

}

module.exports = AnnouncementController;
