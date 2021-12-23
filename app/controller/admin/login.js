'use strict';

var BaseController = require('./base.js');


class Controller extends BaseController {
    async index() {
        await this.ctx.render('admin/login', {});
    }
    async doLogin() {
        // console.log(this.ctx.request.body);

        var mobile = this.ctx.request.body.mobile;
        var password = await this.service.tools.md5(this.ctx.request.body.password);
        var code = this.ctx.request.body.code;

        if (true||code.toUpperCase() == this.ctx.session.code.toUpperCase()) {
            if (mobile == "" || password == "") {
                await this.error('/admin/login', '手机号或密码不能为空！');
            }

            var result = await this.ctx.model.Admin.find({ "mobile": mobile, "password": password });

            if (result.length > 0) {
                if (result[0].status == 0) {
                    await this.error('/admin/login', '该账号已被限制登录');

                } else {
                    //登录成功

                    // 1、保存用户信息
                    this.ctx.session.adminInfo = result[0];

                    //2、跳转到用户中心
                    this.ctx.redirect('/admin');
                }


            } else {
                await this.error('/admin/login', '手机号或者密码不正确');
            }



        } else {
            await this.error('/admin/login', '验证码错误！');
        }


    }

    //退出
    async loginOut() {
        this.ctx.session.adminInfo = null;
        this.ctx.redirect('/admin/login');
    }
}

module.exports = Controller;