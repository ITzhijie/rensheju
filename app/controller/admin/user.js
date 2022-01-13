'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    async index() {

        var keyword = this.ctx.request.query.keyword||"";
        console.log(keyword);

        var page = this.ctx.request.query.page || 1;
        var pageSize = 10;


        var findJson = {
            $or: [
                { "uname": { "$regex": keyword } },
                { "idcode": { "$regex": keyword } },
                { "phone": { "$regex": keyword } }
            ]
        }
        var totalNum = await this.ctx.model.User.find(findJson).countDocuments();
        console.log("totalNum:"+totalNum)

        var result = await this.ctx.model.User.find(findJson).sort({"add_time":-1}).skip((page - 1) * pageSize).limit(pageSize);
        console.log(result);

        await this.ctx.render('admin/user/index', {
            lists: result,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            keyword:keyword,
            totalNum:totalNum
        });



    }

    async edit() {
        var id = this.ctx.request.query.id;

		var data = await this.ctx.model.User.findOne({ "_id": id });

		await this.ctx.render('admin/user/edit', {
			data
		});
    }


    async doEdit() {
        var editData = this.ctx.request.body;
	
		await this.ctx.model.User.updateOne({ "_id": editData.id }, editData);

		await this.success('/admin/user', '修改用户信息成功')

    }

}

module.exports = Controller;
