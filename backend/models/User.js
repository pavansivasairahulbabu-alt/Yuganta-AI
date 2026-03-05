import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
	fullName: {
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
		required: true,
		minlength: 6,
	},
	enrolledCourses: [
		{
			courseId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
			enrolledAt: {
				type: Date,
				default: Date.now,
			},
			progress: {
				type: Number,
				default: 0,
			},
			completed: {
				type: Boolean,
				default: false,
			},
		},
	],
	assignedInstructor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Instructor",
		default: null,
	},
	assignedMentor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Mentor",
		default: null,
	},
	avatar: {
		type: String,
		default: "",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
