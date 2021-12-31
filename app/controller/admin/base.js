'use strict';
const path = require('path');
const fs = require('fs');

const pump = require('mz-modules/pump');

const Controller = require('egg').Controller;

class BaseController extends Controller {
    async success(redirectUrl, message) {
        await this.ctx.render('admin/public/success', {
            redirectUrl: redirectUrl,
            message: message || "操作成功！"
        });

    }
    async error(redirectUrl, message) {
        await this.ctx.render('admin/public/error', {
            redirectUrl: redirectUrl,
            message: message || "操作失败！"
        });

    }

    async verify(redirectUrl) {
        var captcha = await this.service.tools.captcha();
        this.ctx.response.type = 'image/svg+xml';
        this.ctx.body = captcha.data;

    }
    async goback(){
        console.log(this.ctx.state.prevPage);
        var prevPage=this.ctx.request.query.prevPage
        this.ctx.redirect(prevPage);
    }
    async delete() {

        /*
        1、获取要删除的数据库表   model

        2、获取要删除数据的id   _id

        3、执行删除

        4、返回到以前的页面           ctx.request.headers['referer']   (上一页的地址)
        */

        var model = this.ctx.request.query.model;   //Role

        var id = this.ctx.request.query.id;

        await this.ctx.model[model].deleteOne({ "_id": id });            //注意写法

        this.ctx.redirect(this.ctx.state.prevPage);


    }

    //改变状态的方法  Api接口
    async  changeStatus() {
        var model = this.ctx.request.query.model; /*数据库表 Model*/
        var attr = this.ctx.request.query.attr; /*更新的属性 如:status is_best */
        var id = this.ctx.request.query.id; /*更新的 id*/

        var result = await this.ctx.model[model].find({ "_id": id });

        if (result.length > 0) {
            if (result[0][attr] == 1) {
                var json = {/*es6 属性名表达式*/
                    [attr]: 0
                }
            } else {
                var json = {
                    [attr]: 1
                }
            }

            //执行更新操作
            var updateResult = await this.ctx.model[model].updateOne({ "_id": id }, json);

            if (updateResult) {
                this.ctx.body = { "message": '更新成功', "success": true };
            } else {
                this.ctx.body = { "message": '更新失败', "success": false };
            }

        } else {
            //接口
            this.ctx.body = { "message": '更新失败,参数错误', "success": false };
        }
    }

    //改变数量的方法
    async  editNum() {
        var model = this.ctx.request.query.model; /*数据库表 Model*/
        var attr = this.ctx.request.query.attr; /*更新的属性 如:sort */
        var id = this.ctx.request.query.id; /*更新的 id*/
        var num = this.ctx.request.query.num; /*数量*/

        var result = await this.ctx.model[model].find({ "_id": id });

        if (result.length > 0) {

            var json = {/*es6 属性名表达式*/

                [attr]: num
            }

            //执行更新操作
            var updateResult = await this.ctx.model[model].updateOne({ "_id": id }, json);

            if (updateResult) {
                this.ctx.body = { "message": '更新成功', "success": true };
            } else {
                this.ctx.body = { "message": '更新失败', "success": false };
            }
        } else {
            //接口
            this.ctx.body = { "message": '更新失败,参数错误', "success": false };
        }


    }

    //上传图片
    async uploadImg() {
        let parts = this.ctx.multipart({ autoFields: true });
        let files = {};
        let stream;
        let pathStr='';
        while ((stream = await parts()) != null) {
            // console.log(stream);

            if (!stream.filename) {
                break;
            }
            let fieldname = stream.fieldname;  //file表单的名字

            //上传图片的目录
            let dir = await this.service.tools.getUploadFile(stream.filename);
            let target = dir.uploadDir;
            let writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: dir.saveDir
            })
            console.log(files);
            if(pathStr==""){
                pathStr+=files.myfile
            }else{
                pathStr+=","+files.myfile

            }

        }
        console.log("files222222222222----------------");
        console.log(files);

        this.ctx.body = { "message": '添加成功',code:0, "filepath":pathStr };



    }
    //wangEditor上传图片
    async wangUpload() {
        let parts = this.ctx.multipart({ autoFields: true });
        let files = {};
        let stream;
        let pathStr='';
        let pathArr=[];

        let baseUrl=this.ctx.request.header.origin;
        while ((stream = await parts()) != null) {
            // console.log(stream);

            if (!stream.filename) {
                break;
            }
            let fieldname = stream.fieldname;  //file表单的名字

            //上传图片的目录
            let dir = await this.service.tools.getUploadFile(stream.filename);
            let target = dir.uploadDir;
            let writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);
            console.log("files00000000002----------------");

            console.log(files);

            pathArr.push(baseUrl+dir.saveDir)

        }

        console.log(pathArr);

        this.ctx.body = { "errno": 0, "data":pathArr };



    }

    //下载模板
    async downFiles(){
        var filename = this.ctx.request.query.filename; 
        var filePath = 'app/public/admin/download/'+filename;

        this.ctx.attachment(filePath);
        this.ctx.set("Content-Type", "application/octet-stream");
        this.ctx.body =fs.createReadStream(filePath);
        
    }

}

module.exports = BaseController;