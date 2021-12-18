module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//专业表
	const schema = new Schema({
		// 所属机构	
		organ_id: { type: Schema.Types.ObjectId },
        // 所属考试
        exam_id: { type: Schema.Types.ObjectId },
        // 专业名称
        classify_name: { type: String },
        // 专业代码
        classify_code: { type: String },
        // 报名开始时间	
        apply_start:  { type: Date },
        // 报名结束时间	
        apply_end: { type: Date },
        // 缴费截止时间
        pay_end: { type: Date },
        // 报名费用
        apply_fee: { type: Number },
        // 附件要求	
        annex:{ type: String },

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


	return mongoose.model('Classify', schema, 'classify');
}