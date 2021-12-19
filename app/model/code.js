module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//验证码表
	const schema = new Schema({
        // logo
        phone: { type: String },
        // 底1
        code:{ type: String },
   
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


	return mongoose.model('Code', schema, 'code');
}