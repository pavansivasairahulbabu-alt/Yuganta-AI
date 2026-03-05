import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const mentorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	expertise: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		default: null,
		minlength: 6,
	},
	bio: {
		type: String,
		required: true,
	},
	photo: {
		type: String,
		required: true,
		trim: true,
	},
	company: {
		type: String,
		required: true,
		trim: true,
		default: "",
	},
	avatar: {
		type: String,
		default: "",
	},
	active: {
		type: Boolean,
		default: true,
	},
	approved: {
		type: Boolean,
		default: false,
	},
	resetToken: String,
	resetTokenExpiry: Date,
	assignedSessions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "MentorshipSession",
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model("Mentor", mentorSchema);
