module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//机构表
	const schema = new Schema({
		// 机构名称
		organ_name: { type: String },
		// 机构电话	
		organ_phone: { type: String },
		// 机构地址	
		organ_addr: { type: String },
		// 机构联系人
		organ_person: { type: String },
		// 是否是超级管理机构	
		is_super: { type: Number, default: 0 },
		
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


	return mongoose.model('Organ', schema, 'organ');
}