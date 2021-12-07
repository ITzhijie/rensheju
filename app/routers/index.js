'use strict';


module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);
  router.post('/import', controller.home.importExcel);
  router.get('/export', controller.home.exportExcel);


 
};
