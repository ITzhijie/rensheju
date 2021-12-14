'use strict';


module.exports = app => {
  const { router, controller } = app;

  //验证码
  router.get('/admin/verify', controller.admin.base.verify);
  //公共删除方法goback###############################
  router.get('/admin/delete', controller.admin.base.delete);
  //返回上一页
  router.get('/admin/goback', controller.admin.base.goback);

  // 公共改变状态方法#####################
  router.get('/admin/changeStatus', controller.admin.base.changeStatus);
  // 公共改变数字方法###################
  router.get('/admin/editNum', controller.admin.base.editNum);
  //上传图片
  router.post('/admin/uploadImg', controller.admin.base.uploadImg);
  //wangEditor上传图片
  router.post('/admin/wangUpload', controller.admin.base.wangUpload);

  router.get('/admin', controller.admin.main.index);
  router.get('/admin/welcome', controller.admin.main.welcome);


  router.get('/admin/login', controller.admin.login.index);
  router.post('/admin/doLogin', controller.admin.login.doLogin);
  router.get('/admin/loginOut', controller.admin.login.loginOut);


  router.get('/admin/organ', controller.admin.organ.index);
  router.get('/admin/organ/add', controller.admin.organ.add);
  router.post('/admin/organ/doAdd', controller.admin.organ.doAdd);
  router.get('/admin/organ/edit', controller.admin.organ.edit);
  router.post('/admin/organ/doEdit', controller.admin.organ.doEdit);

  router.get('/admin/manager', controller.admin.manager.index);
  router.get('/admin/manager/add', controller.admin.manager.add);
  router.post('/admin/manager/doAdd', controller.admin.manager.doAdd);
  router.get('/admin/manager/edit', controller.admin.manager.edit);
  router.post('/admin/manager/doEdit', controller.admin.manager.doEdit);
  router.post('/admin/manager/changepsw', controller.admin.manager.changepsw);


};
