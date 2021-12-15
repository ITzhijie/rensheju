
var url = require('url');

module.exports = options => {
    return async function adminauth(ctx, next) {
        /*
         1、用户没有登录跳转到登录页面
         2、只有登录以后才可以访问后台管理系统
        */
        console.log("========中间件===adminauth======================");

        var pathname = url.parse(ctx.request.url).pathname;
        // console.log(pathname)
        ctx.state.curPathname=pathname;//储存当前的路径


        if (ctx.session.adminInfo) {
            ctx.state.adminInfo = ctx.session.adminInfo;

            await next();
        } else {

            //排除不需要做权限判断的页面  /admin/verify?mt=0.7466881301614958
            var passPath=[
                '/admin/login',
                '/admin/doLogin',
                '/admin/verify'
            ];
            if (passPath.indexOf(pathname)>=0) {
                await next();
            } else {
                ctx.redirect('/admin/login');
            }
        }

    };
};