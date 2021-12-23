'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
	async index() {

		//查询管理员表并管理角色表
		var result = await this.ctx.model.Organ.find();
		

		await this.ctx.render('admin/organ/index', {
			lists: result
		});

	}


	async add() {
		await this.ctx.render('admin/organ/add', {});

	}

	async doAdd() {
		// console.log(this.ctx.request.body);

		var addResult = this.ctx.request.body;

		//判断当前用户是否存在

		var adminResult = await this.ctx.model.Organ.find({ "organ_name": addResult.organ_name });


		if (adminResult.length > 0) {

			await this.error('/admin/manager/add', '此机构已经存在');
		} else {

			var res = new this.ctx.model.Organ(addResult);

			res.save();
			await this.success('/admin/organ', '增加机构成功');


		}





	}






}

module.exports = Controller;
