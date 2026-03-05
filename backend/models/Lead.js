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

// Ensure a user can only download brochure once per course (optional, per requirements)
// leadSchema.index({ phone: 1, courseId: 1, type: 1 }, { unique: true });

export default mongoose.model("Lead", leadSchema);
