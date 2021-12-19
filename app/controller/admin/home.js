'use strict';

var BaseController = require('./base.js');


class Controller extends BaseController {
    //登录
    async login() {
        this.ctx.session.adminInfo = null;
        await this.ctx.render('index/login', {});
    }

    async doLogin() {
        var phone=this.ctx.request.body.phone;
        var pwd= await this.service.tools.md5(this.ctx.request.body.pwd);

        var res = await this.ctx.model.User.findOne({phone:phone});
        if(!res){
            this.ctx.body={
                code:1,
                msg:"该手机号尚未注册"
            }
            return
        }
        
        if(res.status==0){
            this.ctx.body={
                code:2,
                msg:"该用户已被禁用"
            }
            return   
        }
        if(pwd!=res.pwd){
            this.ctx.body={
                code:3,
                msg:"密码错误"
            }
            return   
        }
        console.log('===========登录=======');
        console.log(res);
        

        this.ctx.session.userInfo = res;
        this.ctx.body={
            code:0,
            msg:"登录成功"
        }
        
    }

    //注册页面
    async register(){
        this.ctx.session.adminInfo = null;
        await this.ctx.render('index/register', {});

    }

    //注册
    async doRegister(){
        let repData={
            code:0,
            msg:"",
        }
        var registData = this.ctx.request.body;

        //首先判断用户code是否正确
        var coderes = await this.ctx.model.Code.findOne({phone:registData.phone});
        if (coderes&&coderes.code==registData.code&&new Date().getTime()-coderes.add_time.getTime()<1800000) {
            
        }else{
            repData={
                code:1,
                msg:"验证码错误或失效，请重试",
            }
            this.ctx.body=repData;
            return
        }
        
        var res1 = await this.ctx.model.User.findOne({phone:registData.phone});
        if (res1) {
            repData={
                code:2,
                msg:"该手机号已经注册，请直接登录",
            }
            this.ctx.body=repData;
            return
        }
        var res2 = await this.ctx.model.User.findOne({idcode:registData.idcode});
        if (res2) {
            repData={
                code:3,
                msg:"该身份证已经绑定尾号为"+res2.phone+"的手机，请用该手机号登录，若非您本人绑定，请到人社局处理。",
            }
            this.ctx.body=repData;
            return
        }


        //注册新用户
        
        registData.pwd = await this.service.tools.md5(registData.pwd);

        var newData =await new this.ctx.model.User(registData).save();

        this.ctx.session.userInfo = newData;

        repData={
            code:0,
            msg:"注册成功",
            data:newData
        }
        this.ctx.body=repData;

    }
    
    //补充图片信息
    async addphoto(){
        var userInfo=this.ctx.session.userInfo;
        if(!userInfo.photo||!userInfo.idcard_z||!userInfo.idcard_f){
            await this.ctx.render('index/addphoto', {});
        }else{
            await this.ctx.render('index/index', {});
        }
        
    }
    
    async doAddphoto() {
        console.log('=====doAddphoto========');
        console.log(this.ctx.request.body);
        
        var photo=this.ctx.request.body.photo;
        var idcard_z=this.ctx.request.body.idcard_z;
        var idcard_f=this.ctx.request.body.idcard_f;
        if (!photo||!idcard_z||!idcard_f) {
            this.ctx.body={
                code:1,
                msg:"证件信息不完整，请重新上传"
            }
            return
        }
        let userInfo=this.ctx.session.userInfo;

        await this.ctx.model.User.updateOne({ "_id": userInfo._id }, this.ctx.request.body);
        userInfo.photo=photo;
        userInfo.idcard_z=idcard_z;
        userInfo.idcard_f=idcard_f;

        this.ctx.session.userInfo = userInfo;
        this.ctx.body={
            code:0,
            msg:"更新成功"
        }
        
    }

    //忘记密码页面
    async forget(){
        await this.ctx.render('index/forget', {});

    }
    //发送信息
    async sendCode(){
        var phone = this.ctx.request.body.phone;
        var code = Math.floor(Math.random() * 10000);
        if (code < 1000) {code += 1000}



        await this.ctx.render('index/register', {});


    }

    //首页
    async index(){
        await this.ctx.render('index/index', {});

    }
    

    
}

module.exports = Controller;