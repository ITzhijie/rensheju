'use strict';

var BaseController = require('./base.js');

class BrandController extends BaseController {
    async index() {
        var result = await this.ctx.model.Brand.find().sort({sort:-1});
        console.log(result);
    
        await this.ctx.render('admin/brand/index', {
          lists: result
        });


    }
    async add() {
        
        await this.ctx.render('admin/brand/add', {});

    }

    async doAdd() {
        var bannerData=this.ctx.request.body;
        console.log(bannerData);
        bannerData.sort=parseInt(bannerData.sort);

        var Brand = new this.ctx.model.Brand(bannerData);

        Brand.save();
        await this.success('/admin/brand', '增加品牌成功');


    }



}

module.exports = BrandController;
