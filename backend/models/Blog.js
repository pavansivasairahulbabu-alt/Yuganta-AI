import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
	},
	slug: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	excerpt: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
		enum: [
			"GenAI",
			"Machine Learning",
			"Deep Learning",
			"AI Agents",
			"Data Science",
			"Python",
			"Cloud Computing",
			"Interview Prep",
			"Career",
		],
	},
	tags: [{
		type: String,
	}],
	thumbnail: {
		type: String,
		default: "",
	},
	readTime: {
		type: String,
		default: "5 min read",
	},
	featured: {
		type: Boolean,
		default: false,
	},
	views: {
		type: Number,
		default: 0,
	},
	likes: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Update the updatedAt timestamp before saving
blogSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

export default mongoose.model("Blog", blogSchema);
