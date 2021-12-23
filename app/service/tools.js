'use strict';

var svgCaptcha = require('svg-captcha');//引入验证
var md5 = require('md5');//引入md5加密
var sd = require('silly-datetime');
var path=require('path');
const mkdirp = require('mz-modules/mkdirp');
const XLSX = require('node-xlsx');
const pump = require('mz-modules/pump');
const fs = require('fs');
const sm3 = require('sm3');
const Service = require('egg').Service;

class ToolsService extends Service {
    //生成验证码
    async captcha() {
        const { ctx } = this;
        var captcha = svgCaptcha.create({
            size: 4,
            fontSize: 50,
            width: 100,
            height: 40,
            background: "#cc9966"
        });

        ctx.session.code = captcha.text;
        console.log(ctx.session.code);
        return captcha;

    }
    async md5(str) {

        return md5(str);

    }
    async getTime() {

        var d = new Date();

        return d.getTime();

    }

    //储存文件名称
    async  getUploadFile(filename) {

        // 1、获取当前日期     20180920
        var day = sd.format(new Date(), 'YYYYMMDD');
        //2、创建图片保存的路径
        var dir = path.join(this.config.uploadDir, day);
        await mkdirp(dir);
        var d = await this.getTime();   /*毫秒数*/

        //返回图片保存的路径
        var uploadDir = path.join(dir, d + path.extname(filename));
        // app\public\admin\upload\20180914\1536895331444.png
        return {
            uploadDir: uploadDir,
            saveDir: uploadDir.slice(3).replace(/\\/g, '/')
        }
    }

    //发送验证码  sendMsg
    async sendMsg(){
        let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        let maxPos = chars.length;
        var requestId = '';
        for (let i = 0; i < 6; i++) {
            requestId += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        requestId=new Date().getTime()+requestId;

        var spCode="265309";
        var appKey="xn_ksy";
        var appSecret="d9409d6c396732451b1a9391dc141a06";

        var contentData={
            "messageContent": "验证码为2233，有效期为30分钟。",
            "serialNumber": requestId,
            "templateId": "2431012153320",
            "userNumber": "18607135858",
        }
        var contentStr="messageContent="+contentData.messageContent
                        +"&serialNumber="+contentData.serialNumber
                        +"&templateId="+contentData.templateId
                        +"&userNumber="+contentData.userNumber;

        var content=encodeURIComponent(contentStr);

        var signStr=spCode+appKey+appSecret+content+requestId;
        var sign=sm3(signStr);
        console.log("====sign=====");
        console.log(sign);

        
        let res = await this.ctx.curl("https://api.ums86.com/api/sms/send", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "x-app-key": appKey,
                "x-request-id": requestId,
                "x-sign": sign,
                "x-sp-code": spCode
            },
            data: {
                MessageContent:"验证码为5566，有效期为30分钟。",
                UserNumber:"18607135858",
                templateId:"2431012153320",
                SerialNumber:requestId,
                extendAccessNum: ""
            },
            dataType: 'json',
            timeout:30000
        });
        return res


    }

    // 导入表格 解析excel.xlsx
    async parseExcel(ctx) {
            
        let parts = ctx.multipart({ autoFields: true });
        let files = {};
        let stream;
        let pathStr='';
        while ((stream = await parts()) != null) {
            // console.log(stream);

            if (!stream.filename) {
                break;
            }
            let fieldname = stream.fieldname;  //file表单的名字

            //上传图片的目录
            let dir = await this.getUploadFile(stream.filename);
            let target = dir.uploadDir;
            let writeStream = fs.createWriteStream(target);

            await pump(stream, writeStream);

            files = Object.assign(files, {
                [fieldname]: dir.saveDir
            })
            console.log(files);
            if(pathStr==""){
                pathStr+=files.myfile
            }else{
                pathStr+=","+files.myfile

            }

        }
        console.log("files222222222222----------------");
        console.log(files);
        var lists=XLSX.parse("app"+pathStr);
        console.log(lists);
        console.log(lists[0].data[0]);
        fs.unlink("app"+pathStr,function(err){
            console.log("文件删除了");

        });
        return lists[0].data

    }

    //生成表格
    async buildExcel(titleArr,dataArr){
        var data = [];
        data.push(titleArr);
        //再把每一行数据加进去
        dataArr.forEach(function(result){
            data.push(Object.values(result));
        });
        //由于各列数据长度不同，可以设置一下列宽
        const options = {'!cols': [{ wch: 10 }, { wch: 5 }, { wch: 15 }, { wch: 20 } ]};
        //生成表格
        var buffer = XLSX.build([{name:'sheet1',data:data }], options);
        var filePath = 'app/public/admin/download/text1.xlsx';
        fs.writeFileSync(filePath,buffer,{'flag':'w'});//

        return filePath;
    }


}

module.exports = ToolsService;
