import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const instructorSchema = new mongoose.Schema({
	name: {
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
	expertise: {
		type: String,
		default: "",
		trim: true,
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
	courses: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Hash password before saving (only if password is provided/modified)
instructorSchema.pre("save", async function (next) {
	if (this.password && this.isModified("password")) {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	}
	next();
});

// Method to compare passwords
instructorSchema.methods.comparePassword = async function (password) {
	if (!this.password) return false;
	return await bcrypt.compare(password, this.password);
};

export default mongoose.model("Instructor", instructorSchema);
