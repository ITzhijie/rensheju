module.exports = app => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;



	const ArticleSchema = new Schema({
		imgurl: { type: String },
		title: { type: String },
		detail: { type: String },

        is_online: { type: Number, default: 1 },
		is_banner: { type: Number, default: 0 },
		sort: { type: Number, default: 1 },

		catefirst_id: { type: Schema.Types.ObjectId },
		catesecond_id: { type: Schema.Types.ObjectId },

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


	return mongoose.model('Article', ArticleSchema, 'article');
}