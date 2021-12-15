'use strict';

var BaseController = require('./base.js');


class Controller extends BaseController {
    async login() {
  
        await this.ctx.render('index/login', {});
    }

    async register(){
        await this.ctx.render('index/register', {});

    }
    
    async forget(){
        await this.ctx.render('index/forget', {});

    }

    async index(){
        await this.ctx.render('index/index', {});

    }


    
}

module.exports = Controller;