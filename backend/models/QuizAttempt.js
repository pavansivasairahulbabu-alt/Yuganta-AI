import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
	{
		questionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "QuizQuestion",
			required: true,
		},
		questionTitle: {
			type: String,
			required: true,
		},
		questionCode: {
			type: String,
			default: "",
		},
		topic: {
			type: String,
			default: "",
		},
		selectedAnswer: {
			type: String,
			enum: ["A", "B", "C", "D", ""],
			default: "",
		},
		selectedAnswerText: {
			type: String,
			default: "",
		},
		correctAnswer: {
			type: String,
			enum: ["A", "B", "C", "D"],
			required: true,
		},
		correctAnswerText: {
			type: String,
			required: true,
		},
		isCorrect: {
			type: Boolean,
			required: true,
		},
		explanation: {
			type: String,
			default: "",
		},
	},
	{ _id: false },
);

const quizAttemptSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	studentName: {
		type: String,
		required: true,
		trim: true,
	},
	courseId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Course",
		required: true,
		index: true,
	},
	courseTitle: {
		type: String,
		required: true,
	},
	moduleId: {
		type: String,
		required: true,
		index: true,
	},
	moduleName: {
		type: String,
		required: true,
	},
	quizId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Quiz",
		required: true,
		index: true,
	},
	quizTitle: {
		type: String,
		required: true,
	},
	answers: {
		type: [answerSchema],
		default: [],
	},
	score: {
		type: Number,
		required: true,
	},
	totalMarks: {
		type: Number,
		default: 10,
	},
	percentage: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		enum: ["Passed", "Failed"],
		required: true,
	},
	correctCount: {
		type: Number,
		required: true,
	},
	incorrectCount: {
		type: Number,
		required: true,
	},
	accuracyPercentage: {
		type: Number,
		required: true,
	},
	topicsNeedingImprovement: {
		type: [String],
		default: [],
	},
	attemptDate: {
		type: Date,
		default: Date.now,
		index: true,
	},
});

quizAttemptSchema.index({ userId: 1, quizId: 1, attemptDate: -1 });
quizAttemptSchema.index({ courseId: 1, moduleId: 1, attemptDate: -1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
