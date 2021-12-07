module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;



	const AdminSchema = new Schema({
		username: { type: String },
		password: { type: String },
		mobile: { type: String },
		email: { type: String },
		status: { type: Number, default: 1 },
		role_id: { type: Schema.Types.ObjectId },
		add_time: {
			type: Date,
			default: Date.now
		},
		update_time: {
			type: Date,
			default: Date.now
		},
		is_super: { type: Number, default: 0 }


	}, {
		versionKey: false,
		timestamps: { createdAt: 'add_time', updatedAt: 'update_time' }
	});


	return mongoose.model('Admin', AdminSchema, 'admin');
}