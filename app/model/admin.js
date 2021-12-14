module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//管理员
	const schema = new Schema({
		// 用户名	
		username: { type: String },
		// 密码	
		password: { type: String },
		// 手机号	
		mobile: { type: String },
		// 邮箱	
		email: { type: String },
		// 状态	
		status: { type: Number, default: 1 },
		// 所属机构	
		organ_id: { type: Schema.Types.ObjectId },
		// 是否是平台管理员 
		is_super: { type: Number, default: 0 },
		// 是否是超级管理员 
		very_super: { type: Number, default: 0 },

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


	return mongoose.model('Admin', schema, 'admin');
}