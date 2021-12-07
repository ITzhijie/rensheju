'use strict';

const Service = require('egg').Service;

class ApiService extends Service {
    async sendTemplateMsg(openid,phrase,thing,type) {
        //type 1 审核通知 2 邀请成功通知
        //phrase1 审核状态
        //thing2 备注
        var access_token = "";

        var tokenResult = await this.ctx.curl('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx05b238a92bcb87e3&secret=8fcabf13abb7d0d628f1be868530f896');
        tokenResult = tokenResult.data.toString();
        console.log("tokenResult", tokenResult);

        if (tokenResult) {
            access_token = JSON.parse(tokenResult).access_token;
            console.log("access_token", access_token);

            if(type==1){
                var formData = {
                    "touser": openid,
                    "template_id": "eOmJkSaRxR7F3Vjqe7Ycy9zvhD-1Ijeg58tHilm42B4",
                    "page": "pages/index/index",
                    "data": {
                        "phrase2": {
                            "value": phrase
                        },
                        "thing3": {
                            "value": thing
                        }
                    }
                }
            }else if(type==2){
                var formData = {
                    "touser": openid,
                    "template_id": "CQCnPdfFZKYyttFn7xvDY80IS3XZ3yjyhtIwATxBP6A",
                    "page": "pages/index/index",
                    "data": {
                        "name1": {
                            "value": phrase
                        },
                        "thing3": {
                            "value": thing
                        }
                    }
                }
            }


            var sendMsg=await this.ctx.curl('https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token='+access_token,{
                method:"POST",
                dataType:"json",
                headers: {"content-type": "application/json"},
                data:formData
            });
            console.log("sendMsg",sendMsg);


            console.log( "模板消息发送成功" );


        }

    }
}

module.exports = ApiService;
