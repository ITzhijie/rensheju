'use strict';

var BaseController = require('./base.js');

class CatefirstController extends BaseController {
    async index() {
        var result = await this.ctx.model.Catefirst.find().sort({sort:-1});
        console.log(result);
    
        await this.ctx.render('admin/catefirst/index', {
          lists: result
        });


    }
    async add() {
        
        await this.ctx.render('admin/catefirst/add', {});

    }

    async doAdd() {
        var catefirstData=this.ctx.request.body;
        console.log(catefirstData);
        catefirstData.sort=parseInt(catefirstData.sort);

        var Cate = new this.ctx.model.Catefirst(catefirstData);

        Cate.save();
        await this.success('/admin/catefirst', '增加一级分类成功');


    }



}

module.exports = CatefirstController;
