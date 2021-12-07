'use strict';

var BaseController = require('./base.js');

class CatesecondController extends BaseController {
    async index() {
        //var result = await this.ctx.model.Catesecond.find().sort({sort:-1});

        var catefirst_id = this.ctx.request.query.catefirst_id;
        var lists = await this.ctx.model.Catesecond.aggregate([{

            $lookup: {
            from: 'catefirst',
            localField: 'catefirst_id',
            foreignField: '_id',
            as: 'catefirst'

            }
        },
        {
            $sort:{"sort":-1}
        }])

        console.log(lists[0].catefirst);



        var catefirst=await this.ctx.model.Catefirst.find();
        console.log(catefirst);

    
        await this.ctx.render('admin/catesecond/index', {
          lists,catefirst

        });


    }
    async add() {
        var catefirst=await this.ctx.model.Catefirst.find();
        console.log(catefirst);
        
        await this.ctx.render('admin/catesecond/add', {catefirst});

    }

    async doAdd() {
        var catefirstData=this.ctx.request.body;
        console.log(catefirstData);
        catefirstData.sort=parseInt(catefirstData.sort);

        var Cate = new this.ctx.model.Catesecond(catefirstData);

        Cate.save();
        await this.success('/admin/catesecond', '增加二级分类成功');


    }



}

module.exports = CatesecondController;
