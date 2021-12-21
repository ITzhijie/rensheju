module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;


	//报名考生表
	const schema = new Schema({
        user_id:{ type: Schema.Types.ObjectId },
        // 姓名
        uname: { type: String },
        // 身份证号	
        idcode: { type: String },
        // 手机号	
        phone: { type: String },
        // 登记照地址	
        photo: { type: String },
        // 身份证正面	
        idcard_z: { type: String },
        // 身份证反面
        idcard_f: { type: String },
	
        // 报名考试
        exam_id: { type: Schema.Types.ObjectId },
        // 报名专业
        classify_id: { type: Schema.Types.ObjectId },
        // 报名时间
        apply_time: { type: Date },
        // 报名附件
        apply_annex: { type: String },
        
        // 审核状态 0待审核  1审核通过 2审核不通过
        verify_status: { type: Number, default: 0 },
        // 审核不通过原因
        verify_reason: { type: String },
        // 审核人
        verify_admin: { type: Schema.Types.ObjectId },
        // 审核时间
        verify_time: { type: Date },
        // 是否缴费
        pay_status: { type: Number, default: 0 },
        // 缴费时间
        pay_time: { type: Date },
        // 缴费金额
        pay_fee: { type: Number },
        // 是否分配考场
        room_status: { type: Number, default: 0 },
        // 考点名称
        room_name: { type: String },
        // 考点地址
        room_addr: { type: String },
        // 考场号
        room_num: { type: String },
        // 座位号
        seat_num: { type: String },
        
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


	return mongoose.model('Examinee', schema, 'examinee');
}