'use strict';

var BaseController = require('./base.js');

class UserController extends BaseController {
    async index() {

        var keyword = this.ctx.request.query.keyword||"";
        console.log(keyword);

        var page = this.ctx.request.query.page || 1;
        var pageSize = 10;


        var findJson = {
            $or: [
                { "nickname": { "$regex": keyword } },
                { "username": { "$regex": keyword } },
                { "prov": { "$regex": keyword } },
                { "city": { "$regex": keyword } },
                { "area": { "$regex": keyword } },


            ],
            "username":{$ne:""},
            "phone":{$ne:""}
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
    async add() {


    }

    async doAdd() {

    }

    async edit() {

    }


    async doEdit() {


    }

}

module.exports = UserController;
