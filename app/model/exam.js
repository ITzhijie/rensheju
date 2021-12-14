module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//考试表
	const schema = new Schema({

        // 考试名称	
        exam_name: { type: String },
        // 考试年份
        exam_year: { type: String },
        // 公告标题
        title: { type: String },
        // 公告内容
        content: { type: String },
        // 发布状态
        status: { type: Number, default: 0 },
        // 创建机构
        organ_id: { type: Schema.Types.ObjectId },
        // 创建人
        admin_id: { type: Schema.Types.ObjectId },
        
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


	return mongoose.model('Exam', schema, 'exam');
}