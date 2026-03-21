import mongoose from "mongoose";

const ALLOWED_CONTACT_TIME_SLOTS = [
	"9:00 AM - 12:00 PM",
	"1:30 PM - 4:30 PM",
	"6:00 PM - 9:00 PM",
];

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
		enum: [...ALLOWED_CONTACT_TIME_SLOTS, ""],
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
		enum: ["new", "contacted", "enrolled", "closed", "New", "Contacted", "Enrolled", "Closed"],
		default: "new",
		set: (value) => String(value || "new").trim().toLowerCase(),
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
