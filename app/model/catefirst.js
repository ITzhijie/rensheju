module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;



	const CatefirstSchema = new Schema({
		catename: { type: String },
		sort: { type: Number, default: 1 },
        imgurl: { type: String },

		add_time: {
			type: Date,
			default: Date.now
		},
		update_time: {
			type: Date,
			default: Date.now
		},


	}, {
		versionKey: false,
		timestamps: { createdAt: 'add_time', updatedAt: 'update_time' }
	});


	return mongoose.model('Catefirst', CatefirstSchema, 'catefirst');
}