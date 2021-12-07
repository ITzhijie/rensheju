'use strict';

var BaseController = require('./base.js');

class CarController extends BaseController {
    async index() {
        var keyword = this.ctx.request.query.keyword||"";
        console.log(keyword);
        var findJson1 = {
            $lookup: {
                from: "brand",
                let: { brand_id: "$brand_id" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr: {
                                $and:
                                    [
                                        { $eq: ["$_id", "$$brand_id"] }
                                    ]
                            },
                            $or: [
                                { "brand_name": { "$regex": keyword } },
                            ]
                        }
                    }
                ],
                as: "brand"
            },

        };

        var findJson01 ={
            $lookup: {
                from: 'brand',
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand'
        
              }
        }
        var findJson2 ={
            $lookup: {
                from: 'detail',
                localField: 'detail_id',
                foreignField: '_id',
                as: 'detail'
        
              }
        }
        var findJson3 ={
            $lookup: {
                from: 'detail',
                localField: 'attribute_id',
                foreignField: '_id',
                as: 'attribute'
        
              }
        }


        var result1 = await this.ctx.model.Car.aggregate([
            findJson1,
            findJson2,
            findJson3,
            {
                $match:{
                    is_online:1,
                    "brand": { $ne: [] },
                    // $or:[
                    //     { "car_name": { "$regex": keyword } },
                    //     {"car_type":{ "$regex": keyword } }
                    // ]
                }
            },
            {
                $sort:{sort:-1}
            }
        ]);

        console.log(result1);

        var result2 = await this.ctx.model.Car.aggregate([
            findJson01,
            findJson2,
            findJson3,
            {
                $match:{
                    is_online:1,
                    $or:[
                        { "car_name": { "$regex": keyword } },
                        {"car_type":{ "$regex": keyword } }
                    ]
                }
            },
            {
                $sort:{sort:-1}
            }
        ]);


        console.log(result2);

        var arr = result1.concat(result2); //两个数组对象合并
        var result = []; //盛放去重后数据的新数组
        console.log("-----------------------------------");



        for (let i = 0; i < arr.length; i++) {
            let flag = true;
            for (let k = 0; k < result.length; k++) {
                if(arr[i]._id.toString()==result[k]._id.toString()){
                    flag = false;

                }

            }
            if(flag){ //判断是否重复
                result.push(arr[i]); //不重复的放入新数组。  新数组的内容会继续进行上边的循环。
            }
        }





        console.log(result);
    
        await this.ctx.render('admin/car/index', {
          lists: result,
          keyword:keyword
        });


    }
    async add() {

        var brandRes=await this.ctx.model.Brand.find();
        
        await this.ctx.render('admin/car/add', {
            brandRes:brandRes
        });

    }

    async doAdd() {
        // 储存汽车详情
        // 储存配置信息
        // 转化brand_id
        var carData=this.ctx.request.body;
        console.log(carData);



        var detailcontent = new this.ctx.model.Detail({
            type:3,
            content:carData.detailcontent
        });
        var detailInfo=await detailcontent.save();
        console.log("detailInfo");
        console.log(detailInfo);

        var attributecontent = new this.ctx.model.Detail({
            type:4,
            content:carData.attributecontent
        });
        var attributeInfo=await attributecontent.save();
        console.log("attributeInfo");
        console.log(attributeInfo);

        carData.detail_id=detailInfo._id;
        carData.attribute_id=attributeInfo._id;

        carData.brand_id=this.app.mongoose.Types.ObjectId(carData.brand_id);


        var car = new this.ctx.model.Car(carData);

        car.save();
        await this.success('/admin/car', '增加车辆信息成功');


    }

    async edit() {
        var id = this.ctx.request.query.id;
        id=this.app.mongoose.Types.ObjectId(id);
        var findJson1 ={
            $lookup: {
                from: 'brand',
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand'
        
              }
        }
        var findJson2 ={
            $lookup: {
                from: 'detail',
                localField: 'detail_id',
                foreignField: '_id',
                as: 'detail'
        
              }
        }
        var findJson3 ={
            $lookup: {
                from: 'detail',
                localField: 'attribute_id',
                foreignField: '_id',
                as: 'attribute'
        
              }
        }


        var Result = await this.ctx.model.Car.aggregate([
            findJson1,
            findJson2,
            findJson3,
            {
                $match:{
                    "_id": id
                }
            }
        ]);
        console.log(id);

        console.log(Result);
        

        var brandRes=await this.ctx.model.Brand.find();

        await this.ctx.render('admin/car/edit', {
          carResult: Result[0],
          brandRes:brandRes
        });
    }


    async doEdit() {
        var id = this.ctx.request.body.id;
        // var password=this.ctx.request.body.password;
        var editData = this.ctx.request.body;
        editData.brand_id=this.app.mongoose.Types.ObjectId(editData.brand_id);
        editData.detail_id=this.app.mongoose.Types.ObjectId(editData.detail_id);
        editData.attribute_id=this.app.mongoose.Types.ObjectId(editData.attribute_id);

        //更新详情
        //更新配置
        //更新车辆信息
        await this.ctx.model.Detail.updateOne({ "_id": editData.detail_id }, {content:editData.detailcontent});
        await this.ctx.model.Detail.updateOne({ "_id": editData.attribute_id }, {content:editData.attributecontent});


        await this.ctx.model.Car.updateOne({ "_id": id }, editData);
        await this.success('/admin/car', '修改车辆信息成功');

    }

    async delete(){
        var id = this.ctx.request.query.id;
        id=this.app.mongoose.Types.ObjectId(id);
        await this.ctx.model.Car.updateOne({ "_id": id }, {is_online:0});
        await this.success('/admin/car', '删除车辆信息成功');
    }

}

module.exports = CarController;
