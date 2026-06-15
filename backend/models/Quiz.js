import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
	courseId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Course",
		required: true,
		index: true,
	},
	moduleId: {
		type: String,
		required: true,
		index: true,
	},
	moduleTitle: {
		type: String,
		required: true,
		trim: true,
	},
	title: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		default: "",
		trim: true,
	},
	questionIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "QuizQuestion",
		},
	],
	status: {
		type: String,
		enum: ["draft", "published"],
		default: "draft",
		index: true,
	},
	passPercentage: {
		type: Number,
		default: 60,
		min: 0,
		max: 100,
	},
	publishedAt: {
		type: Date,
		default: null,
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

quizSchema.pre("save", function () {
	this.updatedAt = new Date();
	if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
		this.publishedAt = new Date();
	}
});

quizSchema.index({ courseId: 1, moduleId: 1 }, { unique: true });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
