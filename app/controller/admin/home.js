'use strict';

var BaseController = require('./base.js');


class HomeController extends BaseController {
    async index() {
        var aa ={"bz":"建设地点：湖北省仙桃市沙嘴街道   工程名称：场内转土\n 起运地：仙桃，经由地：仙桃，达到地：仙桃,车辆类型：专用车,车船牌照号：鄂M08698,车船吨位：12","sfzmc":"雷蕾","djxh":"10114290000028858600","sl":"0.03","skr":"雷蕾","ghf_yhmc":"湖北仙桃农商银行新城分理处","jsp_nsrsbh":"","zgswskfj_dm":"14290043800","jmsbz":"N","fpdm":"","hjse":"17.48","ghfdz":"仙桃市沙嘴街道新城大道北侧（辅助用房3号楼）","nsrmc":"仙桃市宝鸿渣土清运有限公司","qdfp":"N","kpr":"自助17","ghfnsrmc":"湖北龙扬建设工程有限公司","fplb":"01","fhr":"雷蕾","xhflxdh":"15907227707","nsrsbh":"91429004055428573R","ghf_yhzh":"82010000001177735","jshj_dx":"陆佰元整","hsje":"600.0","sphmjk":"342906211200001519","je":"600.0","dksquuid":"CFA9F26B8FA0C3E59F160C2713252296","jsp_nsrmc":"","fphm":""};
        // aa=JSON.stringify(aa);
        // console.log(aa);

        var bz=aa.bz;
        bz=bz.replace(/\n/g,"@@");

        await this.ctx.render('index/login', {bz});
    }

}

module.exports = HomeController;