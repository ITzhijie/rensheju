'use strict';

var BaseController = require('./base.js');


class Controller extends BaseController {
    async index() {
        await this.ctx.render('admin/main/index', {});
    }
    async welcome() {
        await this.ctx.render('admin/main/welcome', {});
    }
}

module.exports = Controller;