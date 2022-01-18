module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//专业表
	const schema = new Schema({

        // 所属科目分类
        classify_id: { type: Schema.Types.ObjectId },
        // 专业名称	
        subject_name: { type: String },
        // 考试日期
        exam_date: { type: Date },
        // 开始时间-结束时间	
        exam_time: { type: String },
		//合格分数
		pass_mark: { type: Number, default: 60 },
       
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