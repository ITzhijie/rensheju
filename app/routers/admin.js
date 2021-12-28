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

 
  router.get('/admin/user', controller.admin.user.index);
  router.get('/admin/user/edit', controller.admin.user.edit);
  router.post('/admin/user/doEdit', controller.admin.user.doEdit);


  router.get('/admin/organ', controller.admin.organ.index);
  router.get('/admin/organ/add', controller.admin.organ.add);
  router.post('/admin/organ/doAdd', controller.admin.organ.doAdd);

  router.get('/admin/link', controller.admin.link.index);
  router.get('/admin/link/add', controller.admin.link.add);
  router.post('/admin/link/doAdd', controller.admin.link.doAdd);
  router.get('/admin/link/edit', controller.admin.link.edit);
  router.post('/admin/link/doEdit', controller.admin.link.doEdit);

  router.get('/admin/config', controller.admin.config.index);
  router.post('/admin/config/doEdit', controller.admin.config.doEdit);

  router.get('/admin/exam', controller.admin.exam.index);
  router.get('/admin/exam/add', controller.admin.exam.add);
  router.post('/admin/exam/doAdd', controller.admin.exam.doAdd);
  router.get('/admin/exam/edit', controller.admin.exam.edit);
  router.post('/admin/exam/doEdit', controller.admin.exam.doEdit);
  router.post('/admin/exam/changeStatus', controller.admin.exam.changeStatus);

  router.get('/admin/classify', controller.admin.classify.index);
  router.get('/admin/classify/add', controller.admin.classify.add);
  router.post('/admin/classify/doAdd', controller.admin.classify.doAdd);
  router.get('/admin/classify/edit', controller.admin.classify.edit);
  router.post('/admin/classify/doEdit', controller.admin.classify.doEdit);
  router.post('/admin/classify/getClassifyLists', controller.admin.classify.getClassifyLists);


  
  router.get('/admin/manager', controller.admin.manager.index);
  router.get('/admin/manager/add', controller.admin.manager.add);
  router.post('/admin/manager/doAdd', controller.admin.manager.doAdd);
  router.get('/admin/manager/edit', controller.admin.manager.edit);
  router.post('/admin/manager/doEdit', controller.admin.manager.doEdit);
  router.post('/admin/manager/changepsw', controller.admin.manager.changepsw);

  router.get('/admin/apply/verifying', controller.admin.apply.verifying);
  router.get('/admin/apply/verifyPage', controller.admin.apply.verifyPage);
  router.get('/admin/apply/doVerify', controller.admin.apply.doVerify);
  router.get('/admin/apply/verifyed', controller.admin.apply.verifyed);
  router.get('/admin/apply/verifyedDetail', controller.admin.apply.verifyedDetail);

  router.get('/admin/apply/payLists', controller.admin.apply.payLists);//缴费管理
  router.get('/admin/apply/payDetail', controller.admin.apply.payDetail);//缴费详情

  router.get('/admin/allocate/allocating', controller.admin.allocate.allocating);//待分配
  router.get('/admin/allocate/allocated', controller.admin.allocate.allocated);//已分配
  router.get('/admin/allocate/endLists', controller.admin.allocate.endLists);//已结束

  
};
