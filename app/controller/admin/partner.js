'use strict';

var BaseController = require('./base.js');

class PartnerController extends BaseController {
    async index() {

        var keyword = this.ctx.request.query.keyword||"";
        console.log(keyword);

        var page = this.ctx.request.query.page || 1;
        var pageSize = 10;


        var findJson = {
            $or: [
                { "partner_name": { "$regex": keyword } },
                { "phone": { "$regex": keyword } },
                { "link_name": { "$regex": keyword } },
                { "link_phone": { "$regex": keyword } },
                { "prov": { "$regex": keyword } },
                { "city": { "$regex": keyword } },
                { "area": { "$regex": keyword } },
                { "address": { "$regex": keyword } },


            ]
        }
        var totalNum = await this.ctx.model.Partner.find(findJson).countDocuments();
        console.log("totalNum:"+totalNum)

        var result = await this.ctx.model.Partner.find(findJson).sort({"sort":-1}).skip((page - 1) * pageSize).limit(pageSize);
        console.log(result);

        await this.ctx.render('admin/partner/index', {
            lists: result,
            totalPages: Math.ceil(totalNum / pageSize),
            page: page,
            keyword:keyword,
            totalNum:totalNum
        });


    }
    async add() {
        
        await this.ctx.render('admin/partner/add', {});

    }

    async doAdd() {
        var addData=this.ctx.request.body;
        console.log(addData);
        

        var partner = new this.ctx.model.Partner(addData);

        partner.save();
        await this.success('/admin/partner', '增加合作商成功');


    }

    async edit() {
        var id = this.ctx.request.query.id;

        var Result = await this.ctx.model.Partner.find({ "_id": id });
        await this.ctx.render('admin/partner/edit', {
    
            partnerResult: Result[0]
        });
    }


    async doEdit() {
        var id = this.ctx.request.body.id;
        // var password=this.ctx.request.body.password;
        var editData = this.ctx.request.body;

        await this.ctx.model.Partner.updateOne({ "_id": id }, editData)
        await this.success('/admin/partner', '修改合作商成功')

    }

}

module.exports = PartnerController;
