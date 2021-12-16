module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//科目表
	const schema = new Schema({

        // 所属专业分类
        classify_id: { type: Schema.Types.ObjectId },
        // 科目名称	
        subject_name: { type: String },
        // 考试日期
        exam_date: { type: Date },
        // 开始时间	
        start_time: { type: String },
        // 结束时间	
        end_time: { type: String },

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


	return mongoose.model('Subject', schema, 'subject');
}