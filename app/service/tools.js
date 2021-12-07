'use strict';

var svgCaptcha = require('svg-captcha');//引入验证
var md5 = require('md5');//引入md5加密
var sd = require('silly-datetime');
var path=require('path');
const mkdirp = require('mz-modules/mkdirp');

const Service = require('egg').Service;

class ToolsService extends Service {
    //生成验证码
    async captcha() {
        const { ctx } = this;
        var captcha = svgCaptcha.create({
            size: 4,
            fontSize: 50,
            width: 100,
            height: 40,
            background: "#cc9966"
        });

        ctx.session.code = captcha.text;
        console.log(ctx.session.code);
        return captcha;

    }
    async md5(str) {

        return md5(str);

    }
    async getTime() {

        var d = new Date();

        return d.getTime();

    }

    async  getUploadFile(filename) {

        // 1、获取当前日期     20180920
        var day = sd.format(new Date(), 'YYYYMMDD');
        //2、创建图片保存的路径
        var dir = path.join(this.config.uploadDir, day);
        await mkdirp(dir);
        var d = await this.getTime();   /*毫秒数*/

        //返回图片保存的路径
        var uploadDir = path.join(dir, d + path.extname(filename));
        // app\public\admin\upload\20180914\1536895331444.png
        return {
            uploadDir: uploadDir,
            saveDir: uploadDir.slice(3).replace(/\\/g, '/')
        }
    }


}

module.exports = ToolsService;
