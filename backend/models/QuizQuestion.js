import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
	{
		key: {
			type: String,
			enum: ["A", "B", "C", "D"],
			required: true,
		},
		text: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ _id: false },
);

const quizQuestionSchema = new mongoose.Schema({
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
	topic: {
		type: String,
		default: "",
		trim: true,
		index: true,
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
	code: { type: String, default: "", trim: true },
	options: {
		type: [optionSchema],
		validate: {
			validator: (value) => Array.isArray(value) && value.length === 4,
			message: "A question must have exactly four options.",
		},
		required: true,
	},
	correctAnswer: {
		type: String,
		enum: ["A", "B", "C", "D"],
		required: true,
	},
	explanation: {
		type: String,
		required: true,
		trim: true,
	},
	difficulty: {
		type: String,
		enum: ["Easy", "Medium", "Hard"],
		default: "Easy",
		index: true,
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

quizQuestionSchema.pre("save", function () {
	this.updatedAt = new Date();
});

quizQuestionSchema.index({ courseId: 1, moduleId: 1, difficulty: 1 });

const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);

export default QuizQuestion;
