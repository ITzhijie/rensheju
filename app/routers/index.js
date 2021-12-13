'use strict';


module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.admin.home.index);
  router.get('/register', controller.admin.home.register);
  router.get('/forget', controller.admin.home.forget);
  router.get('/index', controller.admin.home.index);

  router.post('/import', controller.home.importExcel);
  router.get('/export', controller.home.exportExcel);


 
};
