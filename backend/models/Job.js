import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
	},
	company: {
		type: String,
		required: true,
		trim: true,
	},
	location: {
		type: String,
		required: true,
		trim: true,
	},
	type: {
		type: String,
		required: true,
		enum: ["Full-Time", "Contract", "Internship"],
		default: "Full-Time",
	},
	experience: {
		type: String,
		required: true,
		enum: ["Fresher", "1 - 3 yr.", "3 - 6 yr.", "6+ yr."],
		default: "Fresher",
	},
	salary: {
		type: String,
		required: true,
		enum: ["0-3 LPA", "3-6 LPA", "6-10 LPA", "10+ LPA"],
		default: "0-3 LPA",
	},
	logo: {
		type: String,
		default: "",
	},
	jobLink: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		default: "",
	},
	active: {
		type: Boolean,
		default: true,
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
jobSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

export default mongoose.model("Job", jobSchema);
