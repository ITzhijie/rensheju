'use strict';
const path = require('path');
const fs = require('fs');

const pump = require('mz-modules/pump');

const Controller = require('egg').Controller;
const url = require('url');

class BaseController extends Controller {


    //上传图片
    async uploadFile() {
        console.log("uploadFile");
        console.log( url.parse(this.ctx.request.url));

        let parts = this.ctx.multipart({ autoFields: true });
        let files = {};
        let stream;
        let pathStr='';
        while ((stream = await parts()) != null) {
            console.log(stream);

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
                pathStr+=files.file
            }else{
                pathStr+=","+files.file

            }

        }
        console.log("files222222222222----------------");
        console.log(pathStr);

        this.ctx.body = { "message": '添加成功',code:0, "data":pathStr };



    }




}

module.exports = BaseController;