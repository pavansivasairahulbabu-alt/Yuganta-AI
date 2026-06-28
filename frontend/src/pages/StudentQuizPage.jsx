import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, ClipboardList, Loader2, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import API_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const markdownComponents = {
	p: ({ children }) => <p className="whitespace-pre-wrap leading-relaxed">{children}</p>,
	ul: ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>,
	ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5">{children}</ol>,
	li: ({ children }) => <li className="whitespace-pre-wrap leading-relaxed">{children}</li>,
	code: ({ inline, children, ...props }) =>
		inline ? (
			<code className="rounded bg-[var(--bg-primary)] px-1.5 py-0.5 font-mono text-[0.95em] text-[var(--text-color)]" {...props}>
				{children}
			</code>
		) : (
			<code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--text-color)]">
				{children}
			</code>
		),
	pre: ({ children }) => (
		<pre className="overflow-x-auto rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 text-sm leading-relaxed text-[var(--text-color)]">
			{children}
		</pre>
	),
};

function QuizText({ content, className = "" }) {
	const text = String(content || "").trim();
	if (!text) return null;

	return (
		<div className={className}>
			<ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
		</div>
	);
}

function CodeBlock({ content, className = "" }) {
	const code = String(content || "").trim();
	if (!code) return null;

	return (
		<div className={`${className} rounded-2xl border border-[#3B82F6]/20 bg-slate-950/95 text-slate-100 shadow-inner`}>
			<div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
				<p className="text-xs font-bold uppercase tracking-widest text-slate-300">Code Snippet</p>
				<span className="text-[11px] text-slate-400">Responsive</span>
			</div>
			<pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 text-sm leading-relaxed">
				<code className="font-mono">{code}</code>
			</pre>
		</div>
	);
}

function formatAnswerLabel(answerKey, answerText) {
	const key = String(answerKey || "").trim().toUpperCase();
	const text = String(answerText || "").trim();
	if (!key && !text) return "Not answered";
	if (!key) return text || "Not answered";
	if (!text) return key;
	return `${key} - ${text}`;
}

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
			<div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
				<Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
			</div>
		);
	}

	if (!quiz) return null;

	return (
		<div className="min-h-[calc(100dvh-64px)] bg-[var(--bg-primary)] text-[var(--text-color)]">
			<div className="grid min-h-[calc(100dvh-64px)] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
				<aside className="hidden lg:flex flex-col border-r border-[var(--border-primary)] bg-[var(--card-bg)]">
					<div className="p-5 border-b border-[var(--border-primary)]">
						<Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-color)]">
							<ArrowLeft className="w-4 h-4" /> Back to course
						</Link>
						<h1 className="mt-5 text-lg font-extrabold leading-tight text-[var(--text-color)]">{quiz.moduleTitle}</h1>
						<p className="text-sm text-[var(--text-muted)] mt-1">
							{answeredCount}/{quiz.questions.length} answered
						</p>
						<p className="text-sm text-[#3B82F6] mt-2">
							{attemptsRemaining}/{maxAttempts} attempts left
						</p>
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
										? "border-[#3B82F6] bg-[#3B82F6]/10 text-[var(--text-color)]"
										: "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-color)]"
								}`}
							>
								<div className="flex items-center justify-between gap-3">
									<span className="font-bold text-sm">Question {index + 1}</span>
									<span className={`h-2.5 w-2.5 rounded-full ${answers[question._id] ? "bg-green-500" : "bg-[var(--text-muted)]/30"}`} />
								</div>
								<p className="text-xs truncate mt-1 text-[var(--text-muted)]">{question.title}</p>
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
								<div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/40 flex items-center justify-center">
									<ClipboardList className="w-10 h-10 text-[#3B82F6]" />
								</div>
								<h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-color)]">Ready For Quiz On {quiz.moduleTitle}?</h2>
								<p className="mt-3 text-[var(--text-muted)]">Let's get started and see how much you've learned</p>
								<div className="mt-8 rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 text-left">
									<h3 className="font-bold text-[var(--text-color)] mb-4">Instructions</h3>
									<ul className="space-y-3 text-sm text-[var(--text-muted)] list-disc pl-5">
										<li>This quiz consists of {quiz.questions.length} question{quiz.questions.length === 1 ? "" : "s"}</li>
										<li>Each question has multiple options, but only one correct answer</li>
										<li>There is no negative marking for incorrect answers or unanswered questions</li>
										<li>You can attempt this quiz up to {maxAttempts} times. Your best score is kept.</li>
									</ul>
								</div>
								{quiz.bestAttempt && (
									<div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-500">
										Best Score: {quiz.bestAttempt.score}/{quiz.bestAttempt.totalMarks} ({quiz.bestAttempt.percentage}%)
									</div>
								)}
								<button
									disabled={attemptsRemaining <= 0}
									onClick={() => setStarted(true)}
									className="mt-6 rounded-xl bg-[#3B82F6] px-6 py-3 font-bold text-white hover:bg-[#2563EB] transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{attemptsRemaining <= 0 ? "No Attempts Left" : "Start Now"}
								</button>
							</div>
						</div>
					) : (
						<div className="max-w-4xl mx-auto">
							<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div>
									<p className="text-sm text-[#3B82F6] font-bold">
										Question {activeIndex + 1} of {quiz.questions.length}
									</p>
									<h1 className="text-2xl md:text-3xl font-extrabold mt-1 text-[var(--text-color)]">{quiz.title}</h1>
									<p className="text-sm text-[var(--text-muted)] mt-2">
										Attempts left: {attemptsRemaining}/{maxAttempts}
									</p>
								</div>
								<div className="rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-muted)]">
									{answeredCount}/{quiz.questions.length} answered
								</div>
							</div>

							<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 md:p-7">
								<div className="flex items-start justify-between gap-4">
									<div className="w-full">
										<p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
											{activeQuestion.difficulty} - {activeQuestion.topic || "General"}
										</p>
										<div className="mt-3 text-xl md:text-2xl font-bold leading-snug text-[var(--text-color)]">
											<QuizText content={activeQuestion.title} />
										</div>
										{activeQuestion.description && (
											<div className="mt-3 text-[var(--text-muted)]">
												<QuizText content={activeQuestion.description} />
											</div>
										)}
										{activeQuestion.code && (
											<div className="mt-4">
												<CodeBlock content={activeQuestion.code} />
											</div>
										)}
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
														? "border-[#3B82F6] bg-[#3B82F6]/12 text-[var(--text-color)]"
														: "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[#3B82F6]/50 hover:text-[var(--text-color)]"
												}`}
											>
												<span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-primary)] font-bold text-[var(--text-color)]">
													{option.key}
												</span>
												<div className="inline-block align-top">
													<QuizText content={option.text} />
												</div>
											</button>
										);
									})}
								</div>
							</div>

							<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
								<button
									onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
									disabled={activeIndex === 0}
									className="rounded-xl border border-[var(--border-primary)] px-5 py-3 font-semibold text-[var(--text-muted)] bg-[var(--bg-secondary)] disabled:opacity-40 hover:text-[var(--text-color)]"
								>
									Previous
								</button>
								{activeIndex < quiz.questions.length - 1 ? (
									<button
										onClick={() => setActiveIndex((prev) => prev + 1)}
										className="rounded-xl bg-[#3B82F6] px-5 py-3 font-bold text-white hover:bg-[#2563EB]"
									>
										Next
									</button>
								) : (
									<button
										onClick={submitQuiz}
										disabled={submitting}
										className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-500 disabled:opacity-60"
									>
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
	const reviewedAnswers = result.answers || [];

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 md:p-8">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<p className="text-sm text-[#3B82F6] font-bold uppercase tracking-widest">Quiz Result</p>
						<h1 className="text-3xl md:text-4xl font-extrabold mt-2 text-[var(--text-color)]">
							Score: {result.score}/{result.totalMarks}
						</h1>
						<p className="text-[var(--text-muted)] mt-2">Percentage: {result.percentage}%</p>
						{result.bestAttempt && (
							<p className="text-green-500 mt-2">
								Best Score: {result.bestAttempt.score}/{result.bestAttempt.totalMarks} ({result.bestAttempt.percentage}%)
							</p>
						)}
						<p className="text-[var(--text-muted)] mt-2">Attempts used: {result.attemptCount}/{result.maxAttempts}</p>
					</div>
					<div
						className={`rounded-2xl px-5 py-4 border ${
							result.status === "Passed"
								? "border-green-500/40 bg-green-500/10 text-green-500"
								: "border-red-500/40 bg-red-500/10 text-red-500"
						}`}
					>
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
						<p className="text-sm text-[var(--text-muted)] mb-2">Topics needing improvement</p>
						<div className="flex flex-wrap gap-2">
							{result.topicsNeedingImprovement.map((topic) => (
								<span key={topic} className="rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-sm text-[#3B82F6]">
									{topic}
								</span>
							))}
						</div>
					</div>
				)}
			</div>

			<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 md:p-8">
				<h2 className="text-2xl font-extrabold text-[var(--text-color)] mb-5">Quiz Review</h2>
				{reviewedAnswers.length === 0 ? (
					<p className="text-[var(--text-muted)] font-semibold">No review data is available for this attempt.</p>
				) : (
					<div className="space-y-4">
						{reviewedAnswers.map((answer, index) => (
							<div
								key={answer.questionId}
								className={`rounded-2xl border p-5 ${
									answer.isCorrect ? "border-green-500/20 bg-green-500/[0.04]" : "border-red-500/20 bg-red-500/[0.04]"
								}`}
							>
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
									<div className="min-w-0">
										<p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Question {index + 1}</p>
										<div className="mt-2 font-bold text-lg text-[var(--text-color)]">
											<QuizText content={answer.questionTitle} />
										</div>
									</div>
									<span
										className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
											answer.isCorrect ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"
										}`}
									>
										{answer.isCorrect ? "Correct" : "Incorrect"}
									</span>
								</div>

								<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
									<div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
										<p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Selected Answer</p>
										<p className="mt-2 text-[var(--text-color)] leading-relaxed">
											{formatAnswerLabel(answer.selectedAnswer, answer.selectedAnswerText)}
										</p>
									</div>
									<div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
										<p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Correct Answer</p>
										<p className="mt-2 text-green-400 leading-relaxed">
											{formatAnswerLabel(answer.correctAnswer, answer.correctAnswerText)}
										</p>
									</div>
								</div>

								<div className="mt-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4">
									<p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Explanation</p>
									<div className="text-[var(--text-color)] leading-relaxed">
										<QuizText content={answer.explanation} />
									</div>
								</div>
								{answer.questionCode && (
									<div className="mt-4">
										<CodeBlock content={answer.questionCode} />
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			<Link to={`/courses/${courseId}`} className="inline-flex rounded-xl bg-[#3B82F6] px-5 py-3 font-bold text-white hover:bg-[#2563EB]">
				Back to Course
			</Link>
		</div>
	);
}

function SummaryCard({ label, value }) {
	return (
		<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
			<p className="text-2xl font-extrabold text-[var(--text-color)]">{value}</p>
			<p className="text-sm text-[var(--text-muted)] mt-1">{label}</p>
		</div>
	);
}
