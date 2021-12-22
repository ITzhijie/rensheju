'use strict';


module.exports = app => {
  const { router, controller } = app;
  //上传图片
  router.post('/home/uploadImg', controller.admin.base.uploadImg);
  router.get('/', controller.admin.home.login);
  router.post('/doLogin', controller.admin.home.doLogin);

  router.get('/register', controller.admin.home.register);
  router.post('/doRegister', controller.admin.home.doRegister);

  router.get('/forget', controller.admin.home.forget);
  router.post('/sendCode', controller.admin.home.sendCode);


  router.get('/home/addphoto', controller.admin.home.addphoto);
  router.post('/home/doAddphoto', controller.admin.home.doAddphoto);


  router.get('/home/loginout', controller.admin.home.loginout);//退出
  
  router.get('/home/index', controller.admin.home.index);//首页 考试报名
  router.get('/home/myApply', controller.admin.home.myApply);//我的报名
  router.get('/home/myInfo', controller.admin.home.myInfo);//我的资料
  router.get('/home/examInfo', controller.admin.home.examInfo);//考试公告
  router.get('/home/classifyLists', controller.admin.home.classifyLists);//选择专业
  router.get('/home/confirm', controller.admin.home.confirm);//确认资料
  router.post('/home/doConfirm', controller.admin.home.doConfirm);//提交报名资料

  

  router.post('/import', controller.home.importExcel);
  router.get('/export', controller.home.exportExcel);


 
};
