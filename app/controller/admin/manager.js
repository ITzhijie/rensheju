'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
	async index() {
		let findJson = {
			$lookup: {
				from: 'organ',
				localField: 'organ_id',
				foreignField: '_id',
				as: 'organ'
			}
		}
		var lists = await this.ctx.model.Admin.aggregate([
            findJson
        ]);

		await this.ctx.render('admin/manager/index', {
			lists
		});

	}


	async add() {
		var organResults = await this.ctx.model.Organ.find();
		console.log(organResults);
		await this.ctx.render('admin/manager/add', {
			organResults
		});

	}

	async doAdd() {
		// console.log(this.ctx.request.body);

		var addResult = this.ctx.request.body;
		var mobile = this.ctx.request.body.mobile;
		var password = mobile.substr(mobile.length - 6);

		addResult.password = await this.service.tools.md5(password);


		//判断当前用户是否存在

		var adminResult = await this.ctx.model.Admin.find({ "mobile": addResult.mobile });


		if (adminResult.length > 0) {

			await this.error('/admin/manager/add', '此管理员已经存在');
		} else {
			//初始化平台id
			if(addResult.organ_id=="61b8ac448a2a3e4a135d589e"){
				addResult.is_super=1;
			}

			var admin = new this.ctx.model.Admin(addResult);

			admin.save();
			await this.success('/admin/manager', '增加管理员成功');


		}

	}


	async edit() {

		//获取编辑的数据

		var id = this.ctx.request.query.id;

		var adminResult = await this.ctx.model.Admin.find({ "_id": id });

		// console.log(adminResult);

		//获取角色
		var organResults = await this.ctx.model.Organ.find();

		await this.ctx.render('admin/manager/edit', {

			adminResult: adminResult[0],

			organResults: organResults
		});
	}


	async doEdit() {


		var id = this.ctx.request.body.id;
		var mobile = this.ctx.request.body.mobile;
		var username = this.ctx.request.body.username;
		var organ_id = this.ctx.request.body.organ_id;
		var is_super=0;
		if(organ_id=="61b8ac448a2a3e4a135d589e"){
			is_super=1;
		}

		await this.ctx.model.Admin.updateOne({ "_id": id }, {
			mobile,
			organ_id,
			username,
			is_super
		})

		await this.success('/admin/manager', '修改用户信息成功')




	}

	async changepsw() {
		var newpsw = await this.service.tools.md5(this.ctx.request.body.newpsw);
		var id = this.ctx.request.body.userid;
		var result = await this.ctx.model.Admin.updateOne({ "_id": id }, { "password": newpsw });
		this.ctx.body = { "message": '修改成功', code: 0 };
	}


}

module.exports = Controller;
