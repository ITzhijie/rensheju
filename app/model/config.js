module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//配置表
	const schema = new Schema({
        // logo
        logo_url: { type: String },
        // 底1
        bottom01:{ type: String },
        // 底2
        bottom02:{ type: String },
        // 底3
        bottom03:{ type: String },
		// 准考证注意事项
		attention:{ type: String },
		
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


	return mongoose.model('Config', schema, 'config');
}