'use strict';

var BaseController = require('./base.js');

class ManagerController extends BaseController {
    async index() {

        //查询管理员表并管理角色表
        var result = await this.ctx.model.Config.find();
        console.log(result);

        await this.ctx.render('admin/config/index', {
            data: result[0]
        });

    }
    
    async doEdit() {

        let editData=this.ctx.request.body;
      
		await this.ctx.model.Config.updateOne({ "_id": editData.id }, editData)

		await this.success('/admin/config', '修改配置信息成功')

	}


}

module.exports = ManagerController;
