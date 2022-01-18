module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//科目表
	const schema = new Schema({
		// 所属机构	
		organ_id: { type: Schema.Types.ObjectId },
        // 所属考试
        exam_id: { type: Schema.Types.ObjectId },
        // 科目名称
        classify_name: { type: String },
        // 科目代码
        classify_code: { type: String },
        // 报名开始时间	
        apply_start:  { type: Date },
        // 报名结束时间	
        apply_end: { type: Date },
        // 考试开始时间	
        exam_start:  { type: Date },
        // 考试结束时间	
        exam_end: { type: Date },
        // 缴费截止时间
        pay_end: { type: Date },
        // 报名费用
        apply_fee: { type: Number },
        // 附件要求	
        annex:{ type: String },
        
        // 考场分配状态
        room_status: { type: Number, default: 0 },
        // 分数上传状态
        score_status: { type: Number, default: 0 },

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