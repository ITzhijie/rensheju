'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/import', controller.home.importExcel);

  // 引入路由配置文件
  // require('./routers/index')(app);
  require('./routers/admin')(app);
  require('./routers/api')(app);


  //用户输错路由 跳转至首页 301 永久重定向  302 临时重定向
  // router.get('*', auth,controller.home.index);
  router.redirect("/*","/",302);

};
