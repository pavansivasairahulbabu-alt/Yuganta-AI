import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Quiz from "../models/Quiz.js";
import QuizQuestion from "../models/QuizQuestion.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const MAX_QUIZ_ATTEMPTS = 3;

const summarizeAttempts = (attempts = []) => {
	const sorted = [...attempts].sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate));
	const bestAttempt = attempts.reduce((best, attempt) => {
		if (!best) return attempt;
		if (attempt.score > best.score) return attempt;
		if (attempt.score === best.score && attempt.percentage > best.percentage) return attempt;
		return best;
	}, null);

	return {
		attemptCount: attempts.length,
		attemptsRemaining: Math.max(0, MAX_QUIZ_ATTEMPTS - attempts.length),
		latestAttempt: sorted[0] || null,
		bestAttempt,
		maxAttempts: MAX_QUIZ_ATTEMPTS,
	};
};

const verifyAdmin = (req, res, next) => {
	const token = req.header("Authorization")?.replace("Bearer ", "");
	if (!token) return res.status(401).json({ message: "No token, authorization denied" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (decoded.role !== "admin") {
			return res.status(403).json({ message: "Access denied - admin role required" });
		}
		req.admin = decoded;
		next();
	} catch (error) {
		res.status(401).json({ message: "Token is not valid" });
	}
};

const getModuleId = (moduleObj, index) => moduleObj?._id?.toString() || `module-${index + 1}`;

const getCourseVideoKey = (moduleIndex, videoIndex, video) => {
	if (!video) return "";
	if (video._id) return `id:${video._id.toString()}`;
	const urlPart = video.url || "";
	const orderPart = Number(video.order) || videoIndex + 1;
	return `${moduleIndex}:${orderPart}:${urlPart || (video.title || "untitled")}`;
};

const findCourseModule = (course, moduleId) => {
	const modules = course?.modules || [];
	const index = modules.findIndex((moduleObj, moduleIndex) => getModuleId(moduleObj, moduleIndex) === moduleId);
	return index === -1 ? { moduleObj: null, moduleIndex: -1 } : { moduleObj: modules[index], moduleIndex: index };
};

const isModuleCompleted = (course, moduleId, completedVideos = []) => {
	const { moduleObj, moduleIndex } = findCourseModule(course, moduleId);
	if (!moduleObj || moduleIndex < 0) return false;
	const videos = moduleObj.videos || [];
	if (videos.length === 0) return false;
	const completed = new Set(completedVideos || []);
	return videos.every((video, videoIndex) => completed.has(getCourseVideoKey(moduleIndex, videoIndex, video)));
};

const sanitizeQuiz = (quiz, attemptSummary = null) => ({
	_id: quiz._id,
	courseId: quiz.courseId,
	moduleId: quiz.moduleId,
	moduleTitle: quiz.moduleTitle,
	title: quiz.title,
	description: quiz.description,
	status: quiz.status,
	passPercentage: quiz.passPercentage,
	totalQuestions: quiz.questionIds?.length || 0,
	...(attemptSummary || {}),
	questions: (quiz.questionIds || []).map((question) => ({
		_id: question._id,
		title: question.title,
		description: question.description,
		options: question.options,
		difficulty: question.difficulty,
		topic: question.topic,
	})),
});

const normalizeQuestionPayload = (payload = {}) => ({
	courseId: payload.courseId,
	moduleId: String(payload.moduleId || ""),
	moduleTitle: String(payload.moduleTitle || "").trim(),
	topic: String(payload.topic || "").trim(),
	title: String(payload.title || "").trim(),
	description: String(payload.description || "").trim(),
	options: ["A", "B", "C", "D"].map((key) => ({
		key,
		text: String(payload.options?.[key] ?? payload.options?.find?.((opt) => opt.key === key)?.text ?? "").trim(),
	})),
	correctAnswer: String(payload.correctAnswer || "").trim().toUpperCase(),
	explanation: String(payload.explanation || "").trim(),
	difficulty: String(payload.difficulty || "Easy").trim(),
});

const validateQuestionPayload = (question) => {
	if (!mongoose.Types.ObjectId.isValid(question.courseId)) return "Valid course is required";
	if (!question.moduleId) return "Module is required";
	if (!question.moduleTitle) return "Module title is required";
	if (!question.title) return "Question title is required";
	if (!["A", "B", "C", "D"].includes(question.correctAnswer)) return "Correct answer must be A, B, C, or D";
	if (!question.explanation) return "Detailed explanation is required";
	if (!["Easy", "Medium", "Hard"].includes(question.difficulty)) return "Difficulty must be Easy, Medium, or Hard";
	if (question.options.some((option) => !option.text)) return "All four options are required";
	return "";
};

// Admin: question bank
router.get("/admin/question-bank", verifyAdmin, async (req, res) => {
	try {
		const { courseId, moduleId, topic, difficulty } = req.query;
		const query = {};
		if (courseId && mongoose.Types.ObjectId.isValid(courseId)) query.courseId = courseId;
		if (moduleId) query.moduleId = moduleId;
		if (topic) query.topic = new RegExp(String(topic), "i");
		if (difficulty) query.difficulty = difficulty;

		const questions = await QuizQuestion.find(query).sort({ createdAt: -1 }).lean();
		res.json(questions);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.post("/admin/question-bank", verifyAdmin, async (req, res) => {
	try {
		const payload = normalizeQuestionPayload(req.body);
		const validationError = validateQuestionPayload(payload);
		if (validationError) return res.status(400).json({ message: validationError });

		const question = await QuizQuestion.create(payload);
		res.status(201).json(question);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.put("/admin/question-bank/:id", verifyAdmin, async (req, res) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({ message: "Invalid question id" });
		}
		const existing = await QuizQuestion.findById(req.params.id);
		if (!existing) return res.status(404).json({ message: "Question not found" });

		const payload = normalizeQuestionPayload({ ...existing.toObject(), ...req.body });
		const validationError = validateQuestionPayload(payload);
		if (validationError) return res.status(400).json({ message: validationError });

		Object.assign(existing, payload);
		await existing.save();
		res.json(existing);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.delete("/admin/question-bank/:id", verifyAdmin, async (req, res) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({ message: "Invalid question id" });
		}
		await Quiz.updateMany({}, { $pull: { questionIds: req.params.id } });
		await QuizQuestion.findByIdAndDelete(req.params.id);
		res.json({ message: "Question deleted" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// Admin: quizzes
router.get("/admin/quizzes", verifyAdmin, async (req, res) => {
	try {
		const { courseId, moduleId, status } = req.query;
		const query = {};
		if (courseId && mongoose.Types.ObjectId.isValid(courseId)) query.courseId = courseId;
		if (moduleId) query.moduleId = moduleId;
		if (status) query.status = status;

		const quizzes = await Quiz.find(query)
			.populate("questionIds")
			.sort({ updatedAt: -1 })
			.lean();
		res.json(quizzes);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.post("/admin/quizzes", verifyAdmin, async (req, res) => {
	try {
		const { courseId, moduleId, title, description = "", status = "draft", questionIds = [], passPercentage = 60 } = req.body;
		if (!mongoose.Types.ObjectId.isValid(courseId)) return res.status(400).json({ message: "Valid course is required" });
		if (!moduleId) return res.status(400).json({ message: "Module is required" });

		const course = await Course.findById(courseId).lean();
		if (!course) return res.status(404).json({ message: "Course not found" });
		const { moduleObj } = findCourseModule(course, String(moduleId));
		if (!moduleObj) return res.status(404).json({ message: "Module not found" });

		const uniqueQuestionIds = [...new Set(questionIds.filter((id) => mongoose.Types.ObjectId.isValid(id)).map(String))];
		if (status === "published" && uniqueQuestionIds.length < 1) {
			return res.status(400).json({ message: "A published quiz must contain at least 1 question" });
		}

		const quiz = await Quiz.create({
			courseId,
			moduleId: String(moduleId),
			moduleTitle: moduleObj.title,
			title: title || `Quiz - ${moduleObj.title}`,
			description,
			status,
			questionIds: uniqueQuestionIds,
			passPercentage,
		});
		await quiz.populate("questionIds");
		res.status(201).json(quiz);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ message: "A quiz already exists for this module" });
		}
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.put("/admin/quizzes/:id", verifyAdmin, async (req, res) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid quiz id" });
		const quiz = await Quiz.findById(req.params.id);
		if (!quiz) return res.status(404).json({ message: "Quiz not found" });

		const nextQuestionIds = req.body.questionIds
			? [...new Set(req.body.questionIds.filter((id) => mongoose.Types.ObjectId.isValid(id)).map(String))]
			: quiz.questionIds;
		const nextStatus = req.body.status || quiz.status;
		if (nextStatus === "published" && nextQuestionIds.length < 1) {
			return res.status(400).json({ message: "A published quiz must contain at least 1 question" });
		}

		quiz.title = req.body.title ?? quiz.title;
		quiz.description = req.body.description ?? quiz.description;
		quiz.status = nextStatus;
		quiz.passPercentage = req.body.passPercentage ?? quiz.passPercentage;
		quiz.questionIds = nextQuestionIds;
		await quiz.save();
		await quiz.populate("questionIds");
		res.json(quiz);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.delete("/admin/quizzes/:id", verifyAdmin, async (req, res) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid quiz id" });
		await Quiz.findByIdAndDelete(req.params.id);
		res.json({ message: "Quiz deleted" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.post("/admin/quizzes/:id/questions", verifyAdmin, async (req, res) => {
	try {
		const quiz = await Quiz.findById(req.params.id);
		if (!quiz) return res.status(404).json({ message: "Quiz not found" });

		let questionId = req.body.questionId;
		if (!questionId) {
			const payload = normalizeQuestionPayload({
				...req.body,
				courseId: quiz.courseId,
				moduleId: quiz.moduleId,
				moduleTitle: quiz.moduleTitle,
			});
			const validationError = validateQuestionPayload(payload);
			if (validationError) return res.status(400).json({ message: validationError });
			const question = await QuizQuestion.create(payload);
			questionId = question._id;
		}

		if (!mongoose.Types.ObjectId.isValid(questionId)) return res.status(400).json({ message: "Invalid question id" });
		if (!quiz.questionIds.map(String).includes(String(questionId))) {
			quiz.questionIds.push(questionId);
		}
		await quiz.save();
		await quiz.populate("questionIds");
		res.json(quiz);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.delete("/admin/quizzes/:id/questions/:questionId", verifyAdmin, async (req, res) => {
	try {
		const quiz = await Quiz.findById(req.params.id);
		if (!quiz) return res.status(404).json({ message: "Quiz not found" });
		quiz.questionIds = quiz.questionIds.filter((id) => id.toString() !== req.params.questionId);
		if (quiz.status === "published") quiz.status = "draft";
		await quiz.save();
		await quiz.populate("questionIds");
		res.json(quiz);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.get("/admin/quiz-attempts", verifyAdmin, async (req, res) => {
	try {
		const { courseId, moduleId, quizId, userId } = req.query;
		const query = {};
		if (courseId && mongoose.Types.ObjectId.isValid(courseId)) query.courseId = courseId;
		if (moduleId) query.moduleId = moduleId;
		if (quizId && mongoose.Types.ObjectId.isValid(quizId)) query.quizId = quizId;
		if (userId && mongoose.Types.ObjectId.isValid(userId)) query.userId = userId;

		const attempts = await QuizAttempt.find(query).sort({ attemptDate: -1 }).lean();
		const totalAttempts = attempts.length;
		const averageScore = totalAttempts
			? Number((attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts).toFixed(2))
			: 0;
		const bestAttemptMap = new Map();
		for (const attempt of attempts) {
			const key = `${attempt.userId}:${attempt.quizId}`;
			const current = bestAttemptMap.get(key);
			if (!current || attempt.score > current.score || (attempt.score === current.score && attempt.percentage > current.percentage)) {
				bestAttemptMap.set(key, attempt);
			}
		}
		const bestAttempts = [...bestAttemptMap.values()];
		const averageBestScore = bestAttempts.length
			? Number((bestAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / bestAttempts.length).toFixed(2))
			: 0;
		const passed = attempts.filter((attempt) => attempt.status === "Passed").length;
		const moduleStatsMap = new Map();

		for (const attempt of attempts) {
			const key = attempt.moduleId;
			if (!moduleStatsMap.has(key)) {
				moduleStatsMap.set(key, { moduleId: key, moduleName: attempt.moduleName, attempts: 0, averageScore: 0, completed: 0 });
			}
			const stat = moduleStatsMap.get(key);
			stat.attempts += 1;
			stat.averageScore += attempt.score;
			stat.completed += 1;
		}

		const moduleStats = [...moduleStatsMap.values()].map((stat) => ({
			...stat,
			averageScore: Number((stat.averageScore / stat.attempts).toFixed(2)),
		}));

		res.json({
			attempts,
			summary: {
				totalAttempts,
				averageScore,
				bestAttempts,
				averageBestScore,
				passRate: totalAttempts ? Math.round((passed / totalAttempts) * 100) : 0,
				moduleStats,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// Student: availability, quiz taking, submission
router.get("/course/:courseId", protect, async (req, res) => {
	try {
		const { courseId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(courseId)) return res.status(400).json({ message: "Invalid course id" });

		const course = await Course.findById(courseId).lean();
		const user = await User.findById(req.user._id).select("enrolledCourses fullName").lean();
		if (!course || !user) return res.status(404).json({ message: "Course or user not found" });

		const enrollment = (user.enrolledCourses || []).find((item) => item.courseId?.toString() === courseId);
		if (!enrollment) return res.status(403).json({ message: "Please enroll in this course to access quizzes" });

		const quizzes = await Quiz.find({ courseId, status: "published" }).populate("questionIds").lean();
		const attempts = await QuizAttempt.find({ userId: req.user._id, courseId }).sort({ attemptDate: -1 }).lean();
		const attemptsByQuiz = new Map();
		for (const attempt of attempts) {
			const key = attempt.quizId.toString();
			if (!attemptsByQuiz.has(key)) attemptsByQuiz.set(key, []);
			attemptsByQuiz.get(key).push(attempt);
		}

		const modules = (course.modules || []).map((moduleObj, moduleIndex) => {
			const moduleId = getModuleId(moduleObj, moduleIndex);
			const completed = isModuleCompleted(course, moduleId, enrollment.completedVideos);
			const quiz = quizzes.find((item) => item.moduleId === moduleId);
			const attemptSummary = quiz ? summarizeAttempts(attemptsByQuiz.get(quiz._id.toString()) || []) : null;
			return {
				moduleId,
				moduleTitle: moduleObj.title,
				completed,
				quiz: quiz
					? {
							_id: quiz._id,
							title: quiz.title,
							description: quiz.description,
							totalQuestions: quiz.questionIds?.length || 0,
							available: completed,
							...attemptSummary,
						}
					: null,
			};
		});

		res.json({ courseId, courseTitle: course.title, modules });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.get("/:quizId", protect, async (req, res) => {
	try {
		const quiz = await Quiz.findById(req.params.quizId).populate("questionIds").lean();
		if (!quiz || quiz.status !== "published") return res.status(404).json({ message: "Quiz not found" });

		const course = await Course.findById(quiz.courseId).lean();
		const user = await User.findById(req.user._id).select("enrolledCourses").lean();
		const enrollment = user?.enrolledCourses?.find((item) => item.courseId?.toString() === quiz.courseId.toString());
		if (!enrollment) return res.status(403).json({ message: "Please enroll in this course to access this quiz" });
		if (!isModuleCompleted(course, quiz.moduleId, enrollment.completedVideos)) {
			return res.status(403).json({ message: "Complete this module before taking the quiz" });
		}

		const attempts = await QuizAttempt.find({ userId: req.user._id, quizId: quiz._id }).sort({ attemptDate: -1 }).lean();
		res.json(sanitizeQuiz(quiz, summarizeAttempts(attempts)));
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.post("/:quizId/submit", protect, async (req, res) => {
	try {
		const quiz = await Quiz.findById(req.params.quizId).populate("questionIds");
		if (!quiz || quiz.status !== "published") return res.status(404).json({ message: "Quiz not found" });
		if ((quiz.questionIds || []).length < 1) return res.status(400).json({ message: "Quiz is not ready for submission" });

		const course = await Course.findById(quiz.courseId).lean();
		const user = await User.findById(req.user._id).select("fullName enrolledCourses").lean();
		const enrollment = user?.enrolledCourses?.find((item) => item.courseId?.toString() === quiz.courseId.toString());
		if (!enrollment) return res.status(403).json({ message: "Please enroll in this course to submit this quiz" });
		if (!isModuleCompleted(course, quiz.moduleId, enrollment.completedVideos)) {
			return res.status(403).json({ message: "Complete this module before submitting the quiz" });
		}

		const previousAttempts = await QuizAttempt.find({ userId: req.user._id, quizId: quiz._id }).sort({ attemptDate: -1 }).lean();
		if (previousAttempts.length >= MAX_QUIZ_ATTEMPTS) {
			return res.status(403).json({
				message: "You have used all 3 attempts for this quiz",
				...summarizeAttempts(previousAttempts),
			});
		}

		const answerMap = new Map((req.body.answers || []).map((answer) => [String(answer.questionId), String(answer.selectedAnswer || "").toUpperCase()]));
		let score = 0;
		const reviewedAnswers = quiz.questionIds.map((question) => {
			const selectedAnswer = answerMap.get(question._id.toString()) || "";
			const selectedOption = question.options.find((option) => option.key === selectedAnswer);
			const correctOption = question.options.find((option) => option.key === question.correctAnswer);
			const isCorrect = selectedAnswer === question.correctAnswer;
			if (isCorrect) score += 1;
			return {
				questionId: question._id,
				questionTitle: question.title,
				topic: question.topic || "General",
				selectedAnswer,
				selectedAnswerText: selectedOption?.text || "",
				correctAnswer: question.correctAnswer,
				correctAnswerText: correctOption?.text || "",
				isCorrect,
				explanation: question.explanation,
			};
		});

		const totalMarks = quiz.questionIds.length;
		const percentage = Math.round((score / totalMarks) * 100);
		const incorrectCount = totalMarks - score;
		const status = percentage >= quiz.passPercentage ? "Passed" : "Failed";
		const weakTopicCounts = new Map();
		for (const answer of reviewedAnswers.filter((item) => !item.isCorrect)) {
			weakTopicCounts.set(answer.topic, (weakTopicCounts.get(answer.topic) || 0) + 1);
		}
		const topicsNeedingImprovement = [...weakTopicCounts.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([topic]) => topic)
			.slice(0, 5);

		const attempt = await QuizAttempt.create({
			userId: req.user._id,
			studentName: user.fullName,
			courseId: quiz.courseId,
			courseTitle: course.title,
			moduleId: quiz.moduleId,
			moduleName: quiz.moduleTitle,
			quizId: quiz._id,
			quizTitle: quiz.title,
			answers: reviewedAnswers,
			score,
			totalMarks,
			percentage,
			status,
			correctCount: score,
			incorrectCount,
			accuracyPercentage: percentage,
			topicsNeedingImprovement,
		});

		res.json({
			...attempt.toObject(),
			...summarizeAttempts([attempt.toObject(), ...previousAttempts]),
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

export default router;
