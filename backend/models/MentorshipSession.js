import mongoose from "mongoose";

const mentorshipSessionSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	instructorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Instructor",
		default: null,
	},
	mentorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Mentor",
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},
	time: {
		type: String,
		required: true,
	},
	notes: {
		type: String,
		default: "",
	},
	meetingLink: {
		type: String,
		default: "",
	},
	status: {
		type: String,
		enum: [
			"upcoming",          // legacy
			"completed",
			"cancelled",
			"rejected",
			"rescheduled",
			"pending",           // new
			"mentor_assigned",   // new
			"scheduled"          // new
		],
		default: "upcoming",
	},
	bookedDate: {
		type: Date,
		default: Date.now,
	},
	rejectionReason: {
		type: String,
		default: "",
	},
	rescheduleReason: {
		type: String,
		default: "",
	},
	originalDate: {
		type: String,
		default: "",
	},
	originalTime: {
		type: String,
		default: "",
	},
}, {
	timestamps: true,
});

export default mongoose.model("MentorshipSession", mentorshipSessionSchema);
