module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//用户表
	const schema = new Schema({
        // 姓名
        // 身份证号	
        // 手机号	
        // 密码	
        // 登记照地址	
        // 身份证正面	
        // 身份证反面
        // 状态		
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