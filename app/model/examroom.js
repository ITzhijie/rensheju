module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//考场表
	const schema = new Schema({
 	
        // 报名考试
        exam_id: { type: Schema.Types.ObjectId },
        // 报名科目
        classify_id: { type: Schema.Types.ObjectId },
        
        // 考点名称
        room_name: { type: String },
        // 考点地址
        room_addr: { type: String },
        // 考场号
        room_num: { type: String },
        // 座位号个数
        seats_num: { type: Number },

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


	return mongoose.model('Examroom', schema, 'examroom');
}