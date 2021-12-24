'use strict';

var BaseController = require('./base.js');

class Controller extends BaseController {
    
    async varifying() {
        await this.ctx.render('admin/apply/varifying', {});
    }

}

module.exports = Controller;
