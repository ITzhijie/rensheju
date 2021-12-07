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
    var data=await this.service.tools.parseExcel(this.ctx);
    
    console.log('=========data==========');
    console.log(data);
    

    this.ctx.body =data;
    


  }

  async exportExcel(){
    var title = ['姓名','性别','联系电话','身份证号'];
    var results = [
      {
        'name':'张三',
        'gender':'女',
        'mobile':'18888888888',
        'idcard':'110000000000000000'
      },
        {
        'name':'李四2',
        'gender':'男',
        'mobile':'18888888888',
        'idcard':'110000000000000000'
      },
        {
        'name':'王五2',
        'gender':'女',
        'mobile':'18888888888',
        'idcard':'110000000000000000'
      }
    ];


    var filePath=await this.service.tools.buildExcel(title,results);


    this.ctx.body =fs.createReadStream(filePath);
    
  }


}

module.exports = HomeController;
