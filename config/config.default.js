/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1575532380011_5302';

  //上传文件储存途径
  config.uploadDir='app/public/admin/upload';

  config.multipart={
    mode:'stream',
    whitelist:[
      ".jpg",".jpeg",".png",".xlsx",".xls",".mp4"
    ]
  }

  config.session = {
    key: 'SESSION_ID',
    maxAge: 24 * 3600 * 1000, // 1 天
    httpOnly: true,
    encrypt: true,
    renew:true //演唱会话有效期
  };
  // add your middleware config here
  config.middleware = ['allmiddle','adminauth','indexauth'];
  config.adminauth={
    match:'/admin'
  }
  
  config.indexauth={
    match:'/home'
  }

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    },
  };
  config.security={
    csrf:{
      // enable:false,
      ignore:ctx=>{

        if(ctx.request.url.indexOf("/")==0){
          return true;
        }
        return false;
      }
    }
  }
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  exports.mongoose = {
    client: {
      url: 'mongodb://admin:123456@127.0.0.1:27017/rsj',
      options: {
        useNewUrlParser:true ,
        authSource:'admin',
        useUnifiedTopology: true
      },

    },
  };
  return {
    ...config,
    ...userConfig,
  };
};
