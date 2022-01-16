module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//用户表
	const schema = new Schema({
		// 姓名
		uname: { type: String },
		// 身份证号	
		idcode: { type: String },
		// 手机号	
		phone: { type: String },
		// 密码	
		pwd: { type: String },
		// 登记照地址	
		photo: { type: String },
		// 身份证正面	
		idcard_z: { type: String },
		// 身份证反面
		idcard_f: { type: String },
		// 状态		
		status: { type: Number, default: 1 },
		// 是否是批量导入
		is_batch: { type: Number, default: 0 },
		// 批量导入人
		batch_id: { type: Schema.Types.ObjectId },
	   
		add_time: {
			type: Date,
			default: Date.now
		},
		update_time: {
			type: Date,
			default: Date.now
		}
	}, {
		versionKey: false,
		timestamps: { createdAt: 'add_time', updatedAt: 'update_time' }
	});


	return mongoose.model('User', schema, 'user');
}