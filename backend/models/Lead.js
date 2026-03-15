import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
	},
	phone: {
		type: String,
		required: true,
		trim: true,
	},
	courseId: {
		type: String, // Can be ID or slug
		required: true,
	},
	courseName: {
		type: String,
		required: true,
	},
	discussionTopic: {
		type: String,
		default: "",
		trim: true,
	},
	preferredContactMode: {
		type: String,
		enum: ["Call", "WhatsApp", "Email", "Meet", ""],
		default: "",
	},
	preferredContactTime: {
		type: String,
		default: "",
		trim: true,
	},
	leadSource: {
		type: String,
		default: "",
		trim: true,
	},
	status: {
		type: String,
		enum: ["New", "Contacted", "Enrolled", "Closed"],
		default: "New",
	},
	type: {
		type: String, // "Brochure" or "Enrollment"
		default: "Brochure",
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

leadSchema.index({ date: -1 });
leadSchema.index({ status: 1, date: -1 });
leadSchema.index({ courseId: 1, type: 1, date: -1 });
leadSchema.index({ email: 1, status: 1 });

export default mongoose.model("Lead", leadSchema);
