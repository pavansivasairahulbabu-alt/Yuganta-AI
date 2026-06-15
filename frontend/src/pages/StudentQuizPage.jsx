import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, ClipboardList, Loader2, XCircle } from "lucide-react";
import API_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

export default function StudentQuizPage() {
	const { courseId, quizId } = useParams();
	const navigate = useNavigate();
	const { token } = useAuth();
	const [quiz, setQuiz] = useState(null);
	const [loading, setLoading] = useState(true);
	const [started, setStarted] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [answers, setAnswers] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState(null);

	useEffect(() => {
		if (!token) {
			navigate("/login");
			return;
		}
		fetchQuiz();
	}, [quizId, token]);

	const fetchQuiz = async () => {
		try {
			const res = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				toast.error(data.message || "Quiz is not available yet");
				navigate(`/courses/${courseId}`);
				return;
			}
			setQuiz(data);
		} catch (error) {
			toast.error("Failed to load quiz");
		} finally {
			setLoading(false);
		}
	};

	const activeQuestion = quiz?.questions?.[activeIndex];
	const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);
	const attemptsRemaining = quiz?.attemptsRemaining ?? 3;
	const maxAttempts = quiz?.maxAttempts ?? 3;

	const submitQuiz = async () => {
		if (!quiz?.questions?.length) return;
		if (attemptsRemaining <= 0) {
			toast.error("You have used all attempts for this quiz");
			return;
		}
		if (answeredCount < quiz.questions.length) {
			const confirmSubmit = window.confirm("Some questions are unanswered. Submit anyway?");
			if (!confirmSubmit) return;
		}
		setSubmitting(true);
		try {
			const payload = {
				answers: quiz.questions.map((question) => ({
					questionId: question._id,
					selectedAnswer: answers[question._id] || "",
				})),
			};
			const res = await fetch(`${API_URL}/api/quizzes/${quizId}/submit`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify(payload),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.message || "Failed to submit quiz");
			setResult(data);
			toast.success("Quiz submitted");
		} catch (error) {
			toast.error(error.message || "Failed to submit quiz");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#101010] flex items-center justify-center">
				<Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
			</div>
		);
	}

	if (!quiz) return null;

	return (
		<div className="min-h-[calc(100dvh-64px)] bg-[#101010] text-white">
			<div className="grid min-h-[calc(100dvh-64px)] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
				<aside className="hidden lg:flex flex-col border-r border-white/10 bg-[#171717]">
					<div className="p-5 border-b border-white/10">
						<Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
							<ArrowLeft className="w-4 h-4" /> Back to course
						</Link>
						<h1 className="mt-5 text-lg font-extrabold leading-tight">{quiz.moduleTitle}</h1>
						<p className="text-sm text-gray-500 mt-1">{answeredCount}/{quiz.questions.length} answered</p>
						<p className="text-sm text-orange-400 mt-2">{attemptsRemaining}/{maxAttempts} attempts left</p>
					</div>
					<div className="p-4 space-y-2 overflow-y-auto">
						{quiz.questions.map((question, index) => (
							<button
								key={question._id}
								onClick={() => {
									setStarted(true);
									setActiveIndex(index);
								}}
								className={`w-full rounded-xl px-4 py-3 text-left transition border ${
									activeIndex === index
										? "border-orange-500 bg-orange-500/10 text-white"
										: "border-white/10 bg-white/[0.03] text-gray-400 hover:text-white"
								}`}
							>
								<div className="flex items-center justify-between gap-3">
									<span className="font-bold text-sm">Question {index + 1}</span>
									<span className={`h-2.5 w-2.5 rounded-full ${answers[question._id] ? "bg-green-500" : "bg-gray-600"}`} />
								</div>
								<p className="text-xs truncate mt-1">{question.title}</p>
							</button>
						))}
					</div>
				</aside>

				<main className="p-4 md:p-8 overflow-y-auto">
					{result ? (
						<ResultView result={result} courseId={courseId} />
					) : !started ? (
						<div className="min-h-[calc(100dvh-130px)] flex items-center justify-center">
							<div className="max-w-xl text-center">
								<div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-orange-500/15 border border-orange-500/40 flex items-center justify-center">
									<ClipboardList className="w-10 h-10 text-orange-400" />
								</div>
								<h2 className="text-2xl md:text-3xl font-extrabold">Ready For Quiz On {quiz.moduleTitle}?</h2>
								<p className="mt-3 text-gray-500">Let's get started and see how much you've learned</p>
								<div className="mt-8 rounded-2xl border border-white/10 bg-[#202020] p-5 text-left">
									<h3 className="font-bold mb-4">Instructions</h3>
									<ul className="space-y-3 text-sm text-gray-400 list-disc pl-5">
										<li>This quiz consists of {quiz.questions.length} question{quiz.questions.length === 1 ? "" : "s"}</li>
										<li>Each question has multiple options, but only one correct answer</li>
										<li>There is no negative marking for incorrect answers or unanswered questions</li>
										<li>You can attempt this quiz up to {maxAttempts} times. Your best score is kept.</li>
									</ul>
								</div>
								{quiz.bestAttempt && (
									<div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
										Best Score: {quiz.bestAttempt.score}/{quiz.bestAttempt.totalMarks} ({quiz.bestAttempt.percentage}%)
									</div>
								)}
								<button disabled={attemptsRemaining <= 0} onClick={() => setStarted(true)} className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
									{attemptsRemaining <= 0 ? "No Attempts Left" : "Start Now"}
								</button>
							</div>
						</div>
					) : (
						<div className="max-w-4xl mx-auto">
							<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div>
									<p className="text-sm text-orange-400 font-bold">Question {activeIndex + 1} of {quiz.questions.length}</p>
									<h1 className="text-2xl md:text-3xl font-extrabold mt-1">{quiz.title}</h1>
									<p className="text-sm text-gray-500 mt-2">Attempts left: {attemptsRemaining}/{maxAttempts}</p>
								</div>
								<div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">{answeredCount}/{quiz.questions.length} answered</div>
							</div>

							<div className="rounded-2xl border border-white/10 bg-[#171717] p-5 md:p-7">
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="text-xs uppercase tracking-widest text-gray-500">{activeQuestion.difficulty} • {activeQuestion.topic || "General"}</p>
										<h2 className="mt-3 text-xl md:text-2xl font-bold leading-snug">{activeQuestion.title}</h2>
										{activeQuestion.description && <p className="mt-3 text-gray-400">{activeQuestion.description}</p>}
									</div>
								</div>

								<div className="mt-8 grid grid-cols-1 gap-3">
									{activeQuestion.options.map((option) => {
										const selected = answers[activeQuestion._id] === option.key;
										return (
											<button
												key={option.key}
												onClick={() => setAnswers((prev) => ({ ...prev, [activeQuestion._id]: option.key }))}
												className={`rounded-2xl border px-5 py-4 text-left transition ${
													selected
														? "border-orange-500 bg-orange-500/12 text-white"
														: "border-white/10 bg-white/[0.03] text-gray-300 hover:border-orange-500/50 hover:text-white"
												}`}
											>
												<span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-bold">{option.key}</span>
												{option.text}
											</button>
										);
									})}
								</div>
							</div>

							<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
								<button
									onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
									disabled={activeIndex === 0}
									className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-gray-300 disabled:opacity-40"
								>
									Previous
								</button>
								{activeIndex < quiz.questions.length - 1 ? (
									<button onClick={() => setActiveIndex((prev) => prev + 1)} className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-500">Next</button>
								) : (
									<button onClick={submitQuiz} disabled={submitting} className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-500 disabled:opacity-60">
										{submitting ? "Submitting..." : "Submit Quiz"}
									</button>
								)}
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

function ResultView({ result, courseId }) {
	const mistakes = (result.answers || []).filter((answer) => !answer.isCorrect);
	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="rounded-2xl border border-white/10 bg-[#171717] p-6 md:p-8">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<p className="text-sm text-orange-400 font-bold uppercase tracking-widest">Quiz Result</p>
						<h1 className="text-3xl md:text-4xl font-extrabold mt-2">Score: {result.score}/{result.totalMarks}</h1>
						<p className="text-gray-400 mt-2">Percentage: {result.percentage}%</p>
						{result.bestAttempt && (
							<p className="text-green-400 mt-2">Best Score: {result.bestAttempt.score}/{result.bestAttempt.totalMarks} ({result.bestAttempt.percentage}%)</p>
						)}
						<p className="text-gray-500 mt-2">Attempts used: {result.attemptCount}/{result.maxAttempts}</p>
					</div>
					<div className={`rounded-2xl px-5 py-4 border ${result.status === "Passed" ? "border-green-500/40 bg-green-500/10 text-green-400" : "border-red-500/40 bg-red-500/10 text-red-400"}`}>
						{result.status === "Passed" ? <CheckCircle2 className="w-8 h-8 mb-2" /> : <XCircle className="w-8 h-8 mb-2" />}
						<p className="font-extrabold">Status: {result.status}</p>
					</div>
				</div>
				<div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
					<SummaryCard label="Correct Answers" value={result.correctCount} />
					<SummaryCard label="Incorrect Answers" value={result.incorrectCount} />
					<SummaryCard label="Accuracy" value={`${result.accuracyPercentage}%`} />
				</div>
				{result.topicsNeedingImprovement?.length > 0 && (
					<div className="mt-6">
						<p className="text-sm text-gray-500 mb-2">Topics needing improvement</p>
						<div className="flex flex-wrap gap-2">
							{result.topicsNeedingImprovement.map((topic) => (
								<span key={topic} className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm text-orange-300">{topic}</span>
							))}
						</div>
					</div>
				)}
			</div>

			<div className="rounded-2xl border border-white/10 bg-[#171717] p-6 md:p-8">
				<h2 className="text-2xl font-extrabold mb-5">Mistake Review</h2>
				{mistakes.length === 0 ? (
					<p className="text-green-400 font-semibold">Perfect. No incorrect answers.</p>
				) : (
					<div className="space-y-4">
						{mistakes.map((answer) => (
							<div key={answer.questionId} className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
								<h3 className="font-bold text-lg">{answer.questionTitle}</h3>
								<p className="mt-3 text-red-300">Your Answer: {answer.selectedAnswerText || "Not answered"} - Incorrect</p>
								<p className="mt-2 text-green-300">Correct Answer: {answer.correctAnswerText} - Correct</p>
								<div className="mt-4 rounded-xl bg-black/25 border border-white/10 p-4">
									<p className="text-sm text-gray-500 mb-1">Explanation</p>
									<p className="text-gray-300 leading-relaxed">{answer.explanation}</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<Link to={`/courses/${courseId}`} className="inline-flex rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-500">
				Back to Course
			</Link>
		</div>
	);
}

function SummaryCard({ label, value }) {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
			<p className="text-2xl font-extrabold">{value}</p>
			<p className="text-sm text-gray-500 mt-1">{label}</p>
		</div>
	);
}
