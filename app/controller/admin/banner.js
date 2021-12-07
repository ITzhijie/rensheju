'use strict';

var BaseController = require('./base.js');

class BannerController extends BaseController {
    async index() {
        var result = await this.ctx.model.Detail.find({type:1}).sort({sort:-1});
        console.log(result);
    
        await this.ctx.render('admin/banner/index', {
          lists: result
        });


    }
    async add() {
        
        await this.ctx.render('admin/banner/add', {});

    }

    async doAdd() {
        var bannerData=this.ctx.request.body;
        console.log(bannerData);
        

        var banner = new this.ctx.model.Detail(bannerData);

        banner.save();
        await this.success('/admin/banner', '增加轮播图成功');


    }

    async edit() {
        var id = this.ctx.request.query.id;

        var Result = await this.ctx.model.Detail.find({ "_id": id });
        await this.ctx.render('admin/banner/edit', {
    
          bannerResult: Result[0]
        });
    }


    async doEdit() {
        var id = this.ctx.request.body.id;
        // var password=this.ctx.request.body.password;
        var editData = this.ctx.request.body;

        await this.ctx.model.Detail.updateOne({ "_id": id }, editData)
        await this.success('/admin/banner', '修改轮播图成功')

    }

}

module.exports = BannerController;
