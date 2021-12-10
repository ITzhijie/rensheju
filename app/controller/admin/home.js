'use strict';

var BaseController = require('./base.js');


class HomeController extends BaseController {
    async index() {
  
        await this.ctx.render('index/login', {});
    }

    async register(){
        await this.ctx.render('index/register', {});

    }
    
    async forget(){
        await this.ctx.render('index/forget', {});

    }
}

module.exports = HomeController;