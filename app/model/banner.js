module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;



	const BannerSchema = new Schema({

		sort: { type: Number, default: 1 },

		catefirst_id: { type: Schema.Types.ObjectId },
		article_id: { type: Schema.Types.ObjectId },

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


	return mongoose.model('Banner', BannerSchema, 'banner');
}