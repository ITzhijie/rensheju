module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//机构表
	const schema = new Schema({
        // 机构名称	
        // 机构电话	
        // 机构地址	
        // 机构联系人		
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


	return mongoose.model('Organization', schema, 'organization');
}