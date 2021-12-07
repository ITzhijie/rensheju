'use strict';

var BaseController = require('./base.js');

class ManagerController extends BaseController {
  async index() {

    //查询管理员表并管理角色表
    var result = await this.ctx.model.Admin.find();
    console.log(result);

    await this.ctx.render('admin/manager/index', {
      lists: result
    });

  }


  async add() {
    await this.ctx.render('admin/manager/add', {


    });

  }

  async doAdd() {
    // console.log(this.ctx.request.body);

    var addResult = this.ctx.request.body;
    var mobile = this.ctx.request.body.mobile;
    var password = mobile.substr(mobile.length - 6);

    addResult.password = await this.service.tools.md5(password);


    //判断当前用户是否存在

    var adminResult = await this.ctx.model.Admin.find({ "mobile": addResult.mobile });


    if (adminResult.length > 0) {

      await this.error('/admin/manager/add', '此管理员已经存在');
    } else {

      var admin = new this.ctx.model.Admin(addResult);

      admin.save();
      await this.success('/admin/manager', '增加用户成功');


    }





  }


  async edit() {

    //获取编辑的数据

    var id = this.ctx.request.query.id;

    var adminResult = await this.ctx.model.Admin.find({ "_id": id });

    // console.log(adminResult);

    //获取角色
    var roleResults = await this.ctx.model.Role.find();

    await this.ctx.render('admin/manager/edit', {

      adminResult: adminResult[0],

      roleResults: roleResults
    });
  }


  async doEdit() {

    // console.log(this.ctx.request.body);

    var id = this.ctx.request.body.id;
    // var password=this.ctx.request.body.password;
    var mobile = this.ctx.request.body.mobile;
    var username = this.ctx.request.body.username;
    var role_id = this.ctx.request.body.role_id;
    await this.ctx.model.Admin.updateOne({ "_id": id }, {
      mobile,
      role_id,
      username
    })
    // if(password){
    //   //修改密码
    //   // password=await this.service.tools.md5(password);
    //   await this.ctx.model.Admin.updateOne({"_id":id},{
    //     password,
    //     mobile,
    //     email,
    //     role_id
    //   })

    // }else{

    //   //不修改密码
    //   await this.ctx.model.Admin.updateOne({"_id":id},{
    //     mobile,
    //     email,
    //     role_id
    //   })

    // }


    await this.success('/admin/manager', '修改用户信息成功')




  }

  async changepsw() {
    var newpsw = await this.service.tools.md5(this.ctx.request.body.newpsw);
    var id=this.ctx.request.body.userid;
    var result = await this.ctx.model.Admin.updateOne({"_id":id},{"password":newpsw});
    this.ctx.body = { "message": '修改成功',code:0 };
  }


}

module.exports = ManagerController;
