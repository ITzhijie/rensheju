module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//专业表
	const schema = new Schema({

        // 所属考生
        examinee_id: { type: Schema.Types.ObjectId },
        // 所属专业
        subject_id: { type: Schema.Types.ObjectId },
        // 考试日期
        core: { type: Number, default: 0 },
      
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


	return mongoose.model('Score', schema, 'score');
}