'use strict';

const Controller = require('egg').Controller;
const XLSX = require('node-xlsx');
const path = require('path');
const fs = require('fs');

const pump = require('mz-modules/pump');

class HomeController extends Controller {
  async index() {
    await this.ctx.render('admin/main/excel', {});
  }


  async importExcel() {

    // const stream = await this.ctx.getFileStream();
    // let file=this.ctx.request.files[0];
    // // var obj=XLSX.parse(fs.readFileSync(file.filepath));
    // // console.log(obj);
    // console.log(file);

    // fs.readFileSync(file.filename,'utf-8',function(err,data){
    //   console.log(data);
    // })

    // this.ctx.body = { "message": '添加成功',code:0};

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
    var lists=XLSX.parse("app"+pathStr);
    console.log(lists);
    console.log(lists[0].data[0]);


    this.ctx.body = { "message": '添加成功',code:0, "filepath":pathStr };


  }


}

module.exports = HomeController;
