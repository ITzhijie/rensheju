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


  router.get('/admin/manager', controller.admin.manager.index);
  router.get('/admin/manager/add', controller.admin.manager.add);
  router.post('/admin/manager/doAdd', controller.admin.manager.doAdd);
  router.get('/admin/manager/edit', controller.admin.manager.edit);
  router.post('/admin/manager/doEdit', controller.admin.manager.doEdit);
  router.post('/admin/manager/changepsw', controller.admin.manager.changepsw);


 //一级分类
 router.get('/admin/catefirst', controller.admin.catefirst.index);
 router.get('/admin/catefirst/add', controller.admin.catefirst.add);
 router.post('/admin/catefirst/doAdd', controller.admin.catefirst.doAdd);

 router.get('/admin/catesecond', controller.admin.catesecond.index);
 router.get('/admin/catesecond/add', controller.admin.catesecond.add);
 router.post('/admin/catesecond/doAdd', controller.admin.catesecond.doAdd);





  // 人才信息
  router.get('/admin/user', controller.admin.user.index);
  router.get('/admin/user/add', controller.admin.user.add);
  router.post('/admin/user/doAdd', controller.admin.user.doAdd);
  router.get('/admin/user/edit', controller.admin.user.edit);
  router.post('/admin/user/doEdit', controller.admin.user.doEdit);

  // 轮播图 
  router.get('/admin/banner', controller.admin.banner.index);
  router.get('/admin/banner/add', controller.admin.banner.add);
  router.post('/admin/banner/doAdd', controller.admin.banner.doAdd);
  router.get('/admin/banner/edit', controller.admin.banner.edit);
  router.post('/admin/banner/doEdit', controller.admin.banner.doEdit);

  //公告
  router.get('/admin/announcement', controller.admin.announcement.index);
  router.get('/admin/announcement/add', controller.admin.announcement.add);
  router.post('/admin/announcement/doAdd', controller.admin.announcement.doAdd);
  router.get('/admin/announcement/edit', controller.admin.announcement.edit);
  router.post('/admin/announcement/doEdit', controller.admin.announcement.doEdit);

 
  // 车辆
  router.get('/admin/car', controller.admin.car.index);
  router.get('/admin/car/add', controller.admin.car.add);
  router.post('/admin/car/doAdd', controller.admin.car.doAdd);
  router.get('/admin/car/edit', controller.admin.car.edit);
  router.post('/admin/car/doEdit', controller.admin.car.doEdit);
  router.get('/admin/car/delete', controller.admin.car.delete);

  //合作商
  router.get('/admin/partner', controller.admin.partner.index);
  router.get('/admin/partner/add', controller.admin.partner.add);
  router.post('/admin/partner/doAdd', controller.admin.partner.doAdd);
  router.get('/admin/partner/edit', controller.admin.partner.edit);
  router.post('/admin/partner/doEdit', controller.admin.partner.doEdit);

  //订单
  router.get('/admin/order', controller.admin.order.index);
  router.get('/admin/order/detail', controller.admin.order.detail);
  router.post('/admin/order/changeStatus', controller.admin.order.changeStatus);
  router.get('/admin/order/repay', controller.admin.order.repay);
  router.post('/admin/order/editRepay', controller.admin.order.editRepay);

};
