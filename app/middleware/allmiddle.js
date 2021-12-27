
var url = require('url');

module.exports = options => {
    return async function allmiddle(ctx, next) {
        /*
         1、用户没有登录跳转到登录页面
         2、只有登录以后才可以访问后台管理系统
        */
        console.log("========中间件===allmiddle======================");

        ctx.state.csrf = ctx.csrf;   //全局变量

        if(ctx.request.header['referer']){
            ctx.state.prevPage = ctx.request.header['referer'].split(ctx.request.header.host)[1];
            console.log(ctx.state.prevPage)
            
        }
        
        var pathname = url.parse(ctx.request.url).pathname;
        console.log(pathname)
        ctx.state.curPathname=pathname;//储存当前的路径

        var config = await ctx.model.Config.findOne();
        ctx.state.config=config;
        var links = await ctx.model.Link.find();
        ctx.state.links=links;
        console.log(links);
        
        await next();
    };
};