
var url = require('url');

module.exports = options => {
    return async function allmiddle(ctx, next) {
        /*
         1、用户没有登录跳转到登录页面
         2、只有登录以后才可以访问后台管理系统
        */
        console.log("========中间件===allmiddle======================");

        ctx.state.csrf = ctx.csrf;   //全局变量

        ctx.state.prevPage = ctx.request.header['referer'];
        
        var pathname = url.parse(ctx.request.url).pathname;
        // console.log(pathname)
        ctx.state.curPathname=pathname;//储存当前的路径

        var config = await ctx.model.Config.findOne();
        ctx.state.config=config;

        await next();
    };
};