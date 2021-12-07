'use strict';


module.exports = app => {
  const { router, controller } = app;
    router.post('/api/uploadFile', controller.api.base.uploadFile);

    router.get('/api/getLogin', controller.api.user.getLogin);
    router.post('/api/phoneLogin', controller.api.user.phoneLogin);
    router.post('/api/saveInfo', controller.api.user.saveInfo);
    router.post('/api/createPay', controller.api.user.createPay);
    router.post('/api/orderquery', controller.api.user.orderquery);

    
    router.post('/api/getIndexInfo', controller.api.info.getIndexInfo);
    router.post('/api/getRichDetail', controller.api.info.getRichDetail);
    router.post('/api/getCarList', controller.api.info.getCarList);
    router.post('/api/getCarDetail', controller.api.info.getCarDetail);
    router.post( '/api/getPartner', controller.api.info.getPartner);

    router.post( '/api/getNotice', controller.api.info.getNotice);
    router.post( '/api/getOrderDetail', controller.api.info.getOrderDetail);
    router.post( '/api/getShareData', controller.api.info.getShareData);

    router.post( '/api/getQRCode', controller.api.user.getQRCode);

    
};
