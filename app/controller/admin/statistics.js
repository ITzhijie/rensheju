'use strict';
const fs = require('fs');

var BaseController = require('./base.js');

class Controller extends BaseController {
	async dataDetail() {

		let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";


        let res=await this.ctx.service.getData.getDataDetail(exam_id,classify_id);

        await this.ctx.render('admin/statistics/dataDetail', res);
	

	}

    

    async downDataDetails() {

		let exam_id = this.ctx.request.query.exam_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.exam_id) : "";
        let classify_id = this.ctx.request.query.classify_id ? this.app.mongoose.Types.ObjectId(this.ctx.request.query.classify_id) : "";


        let res=await this.ctx.service.getData.getDataDetail(exam_id,classify_id);

        var title = ['序号','考试名称','科目名称','报考人数','待审核人数','审核通过人数','缴费人数','未缴费人数'];

        console.log('========title========');
        console.log(title);

        var classifyLists=res.lists;
        var results=[];
        for (let i = 0; i < classifyLists.length; i++) {
            var obj={
                "index":i+1,
                "exam_name":classifyLists[i].exam[0].exam_name,
                "classify_name":classifyLists[i].classify_name,
                "examinee_all":classifyLists[i].examinee_all.length,
                "examinee_verifying":classifyLists[i].examinee_verifying.length,
                "examinee_verifyed":classifyLists[i].examinee_verifyed.length,
                "examinee_payed":classifyLists[i].examinee_payed.length,
                "examinee_nopay":classifyLists[i].examinee_nopay.length,
                
            }
            results.push(obj);
        }
        console.log(results);
        
        

        var filename="报考数据统计表";
        //由于各列数据长度不同，可以设置一下列宽
        const options = {'!cols': [{ wch: 5 }, { wch: 20}, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 } ]};
        
        var filePath=await this.service.tools.buildExcel(title,results,options,filename);

        this.ctx.attachment(filePath);
        this.ctx.set("Content-Type", "application/octet-stream");
        this.ctx.body =fs.createReadStream(filePath);
        fs.unlink(filePath,function(err){
            console.log("文件删除了");
        });

	}


}

module.exports = Controller;
