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


  
  router.get('/home/index', controller.admin.home.index);//首页

  router.post('/import', controller.home.importExcel);
  router.get('/export', controller.home.exportExcel);


 
};
