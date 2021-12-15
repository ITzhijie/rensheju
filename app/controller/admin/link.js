'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    async index() {

        var result = await this.ctx.model.Link.find().sort({sort:-1});
        console.log(result);

        await this.ctx.render('admin/link/index', {
            lists: result
        });

    }

    async add() {
        await this.ctx.render('admin/link/add', {});
    }

    async doAdd() {

		var addResult = this.ctx.request.body;

		var res = new this.ctx.model.Link(addResult);

        res.save();
        await this.success('/admin/link', '增加链接成功');

    }
    

    async edit() {

		//获取编辑的数据

		var id = this.ctx.request.query.id;

		var data = await this.ctx.model.Link.find({ "_id": id });

		await this.ctx.render('admin/link/edit', {
			data: data[0]
		});
	}

    async doEdit() {

        let editData=this.ctx.request.body;
      
		await this.ctx.model.Link.updateOne({ "_id": editData.id }, editData)

		await this.success('/admin/link', '修改链接信息成功')

	}

}

module.exports = Controller;
