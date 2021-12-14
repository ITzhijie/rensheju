module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//链接表
	const schema = new Schema({

        // 链接名称
        link_name: { type: String },
        // 链接地址
        link_url: { type: String },
        // 排序	
        sort: { type: Number, default: 0 },
        
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


	return mongoose.model('Link', schema, 'link');
}