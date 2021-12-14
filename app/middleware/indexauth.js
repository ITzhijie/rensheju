
var url = require('url');

module.exports = options => {
    return async function indexauth(ctx, next) {

        console.log("========中间件indexauth======================");

        ctx.state.csrf = ctx.csrf;   //全局变量

        ctx.state.prevPage = ctx.request.header['referer'];
        

        var pathname = url.parse(ctx.request.url).pathname;
        
        ctx.state.curPathname=pathname;//储存当前的路径

        if (ctx.session.userInfo) {
            ctx.state.userInfo = ctx.session.userInfo;

            await next();
        } else {

            //排除不需要做权限判断的页面  
            var passPath=[];
            if (passPath.indexOf(pathname)>=0) {
                await next();
            } else {
                ctx.redirect('/login');
            }
        }

    };
};