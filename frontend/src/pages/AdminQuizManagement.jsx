import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BarChart3, BookOpen, CheckCircle2, FileQuestion, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import api from "../config/axios";

const emptyQuestionForm = {
	title: "",
	description: "",
	topic: "",
	difficulty: "Easy",
	options: { A: "", B: "", C: "", D: "" },
	correctAnswer: "A",
	explanation: "",
};

const getModuleId = (moduleObj, index) => moduleObj?._id || `module-${index + 1}`;
export default function AdminQuizManagement() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [courses, setCourses] = useState([]);
	const [selectedCourseId, setSelectedCourseId] = useState("");
	const [selectedModuleId, setSelectedModuleId] = useState("");
	const [quizzes, setQuizzes] = useState([]);
	const [questionBank, setQuestionBank] = useState([]);
	const [attemptData, setAttemptData] = useState({ attempts: [], summary: null });
	const [quizForm, setQuizForm] = useState({ title: "", description: "", passPercentage: 60 });
	const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
	const [editingQuestionId, setEditingQuestionId] = useState("");
	const [saving, setSaving] = useState(false);
	const [filter, setFilter] = useState({ courseId: "", status: "All" });

	useEffect(() => {
		const authed = localStorage.getItem("adminAuthed") === "true";
		const token = localStorage.getItem("adminToken");
		if (!authed || !token) {
			navigate("/admin/login", { replace: true });
			return;
		}
		setLoading(false);
		fetchCourses();
		fetchAttempts();
	}, [navigate]);

	const selectedCourse = useMemo(
		() => courses.find((course) => course._id === selectedCourseId),
		[courses, selectedCourseId],
	);

	const selectedModule = useMemo(
		() => (selectedCourse?.modules || []).find((moduleObj, index) => getModuleId(moduleObj, index) === selectedModuleId),
		[selectedCourse, selectedModuleId],
	);

	const activeQuiz = quizzes.find((quiz) => quiz.moduleId === selectedModuleId);
	const activeQuestionIds = new Set((activeQuiz?.questionIds || []).map((question) => String(question._id || question)));
	const filteredAttempts = useMemo(() => {
		return (attemptData.attempts || []).filter((attempt) => {
			const matchesCourse = filter.courseId === "" || attempt.courseId === filter.courseId;
			const matchesStatus = filter.status === "All" || attempt.status === filter.status;
			return matchesCourse && matchesStatus;
		});
	}, [attemptData.attempts, filter]);
	const difficultyCounts = (activeQuiz?.questionIds || []).reduce(
		(counts, question) => {
			const difficulty = question.difficulty || "Easy";
			return { ...counts, [difficulty]: (counts[difficulty] || 0) + 1 };
		},
		{ Easy: 0, Medium: 0, Hard: 0 },
	);

	useEffect(() => {
		if (!selectedCourseId) return;
		setSelectedModuleId("");
		setQuizzes([]);
		setQuestionBank([]);
		fetchQuizzes(selectedCourseId);
	}, [selectedCourseId]);

	useEffect(() => {
		if (!selectedCourseId || !selectedModuleId) return;
		fetchQuestionBank();
		const quiz = quizzes.find((item) => item.moduleId === selectedModuleId);
		setQuizForm({
			title: quiz?.title || `Quiz - ${selectedModule?.title || "Module"}`,
			description: quiz?.description || "",
			passPercentage: quiz?.passPercentage || 60,
		});
		setQuestionForm(emptyQuestionForm);
		setEditingQuestionId("");
	}, [selectedCourseId, selectedModuleId, quizzes]);

	const fetchCourses = async () => {
		try {
			const res = await api.get("/courses");
			setCourses(Array.isArray(res.data) ? res.data : []);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to load courses");
		}
	};

	const fetchQuizzes = async (courseId = selectedCourseId) => {
		if (!courseId) return;
		try {
			const res = await api.get(`/quizzes?courseId=${courseId}`);
			setQuizzes(Array.isArray(res.data) ? res.data : []);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to load quizzes");
		}
	};

	const fetchQuestionBank = async () => {
		try {
			const params = new URLSearchParams({ courseId: selectedCourseId, moduleId: selectedModuleId });
			const res = await api.get(`/question-bank?${params.toString()}`);
			setQuestionBank(Array.isArray(res.data) ? res.data : []);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to load question bank");
		}
	};

	const fetchAttempts = async () => {
		try {
			const res = await api.get("/quiz-attempts");
			setAttemptData(res.data || { attempts: [], summary: null });
		} catch {
			setAttemptData({ attempts: [], summary: null });
		}
	};

	const ensureQuiz = async () => {
		if (activeQuiz) return activeQuiz;
		if (!selectedCourseId || !selectedModuleId) {
			toast.error("Select a course and module first");
			return null;
		}
		const res = await api.post("/quizzes", {
			courseId: selectedCourseId,
			moduleId: selectedModuleId,
			title: quizForm.title || `Quiz - ${selectedModule?.title || "Module"}`,
			description: quizForm.description,
			passPercentage: Number(quizForm.passPercentage) || 60,
			status: "draft",
			questionIds: [],
		});
		await fetchQuizzes(selectedCourseId);
		return res.data;
	};

	const saveQuizMeta = async () => {
		setSaving(true);
		try {
			const quiz = await ensureQuiz();
			if (!quiz) return;
			await api.put(`/quizzes/${quiz._id}`, {
				title: quizForm.title,
				description: quizForm.description,
				passPercentage: Number(quizForm.passPercentage) || 60,
				status: quiz.status,
				questionIds: (quiz.questionIds || []).map((question) => question._id || question),
			});
			await fetchQuizzes(selectedCourseId);
			toast.success("Quiz draft saved");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to save quiz");
		} finally {
			setSaving(false);
		}
	};

	const publishQuiz = async () => {
		if (!activeQuiz) {
			toast.error("Create and save a quiz first");
			return;
		}
		try {
			await api.put(`/quizzes/${activeQuiz._id}`, {
				...quizForm,
				status: "published",
				questionIds: activeQuiz.questionIds.map((question) => question._id),
			});
			await fetchQuizzes(selectedCourseId);
			toast.success("Quiz published");
		} catch (error) {
			toast.error(error.response?.data?.message || "Publishing requires at least 1 question");
		}
	};

	const saveQuestion = async () => {
		if (!selectedCourseId || !selectedModuleId) {
			toast.error("Select a course and module first");
			return;
		}
		setSaving(true);
		try {
			const quiz = await ensureQuiz();
			if (!quiz) return;
			const payload = {
				...questionForm,
				courseId: selectedCourseId,
				moduleId: selectedModuleId,
				moduleTitle: selectedModule?.title || "",
			};

			let questionId = editingQuestionId;
			if (editingQuestionId) {
				await api.put(`/question-bank/${editingQuestionId}`, payload);
			} else {
				const questionRes = await api.post("/question-bank", payload);
				questionId = questionRes.data._id;
			}

			await api.post(`/quizzes/${quiz._id}/questions`, { questionId });
			setQuestionForm(emptyQuestionForm);
			setEditingQuestionId("");
			await Promise.all([fetchQuizzes(selectedCourseId), fetchQuestionBank()]);
			toast.success(editingQuestionId ? "Question updated" : "Question added");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to save question");
		} finally {
			setSaving(false);
		}
	};

	const editQuestion = (question) => {
		setEditingQuestionId(question._id);
		setQuestionForm({
			title: question.title || "",
			description: question.description || "",
			topic: question.topic || "",
			difficulty: question.difficulty || "Easy",
			options: {
				A: question.options?.find((option) => option.key === "A")?.text || "",
				B: question.options?.find((option) => option.key === "B")?.text || "",
				C: question.options?.find((option) => option.key === "C")?.text || "",
				D: question.options?.find((option) => option.key === "D")?.text || "",
			},
			correctAnswer: question.correctAnswer || "A",
			explanation: question.explanation || "",
		});
	};

	const attachExistingQuestion = async (questionId) => {
		try {
			const quiz = await ensureQuiz();
			if (!quiz) return;
			await api.post(`/quizzes/${quiz._id}/questions`, { questionId });
			await fetchQuizzes(selectedCourseId);
			toast.success("Question reused in this quiz");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to reuse question");
		}
	};

	const removeFromQuiz = async (questionId) => {
		if (!activeQuiz) return;
		try {
			await api.delete(`/quizzes/${activeQuiz._id}/questions/${questionId}`);
			await fetchQuizzes(selectedCourseId);
			toast.success("Question removed from quiz");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to remove question");
		}
	};

	const deleteQuestion = async (questionId) => {
		try {
			await api.delete(`/question-bank/${questionId}`);
			await Promise.all([fetchQuizzes(selectedCourseId), fetchQuestionBank()]);
			toast.success("Question deleted from bank");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to delete question");
		}
	};

	if (loading) return <div className="min-h-screen bg-[var(--bg-primary)]" />;

	return (
		<div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-color)]">
			<AdminNavbar />
			<main className="pt-24 px-4 md:px-6 pb-10 max-w-7xl mx-auto space-y-6">
				<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
					<div>
						<p className="text-sm text-[#A855F7] font-bold uppercase tracking-widest">Admin Controlled</p>
						<h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-color)]">Module Quiz Management</h1>
						<p className="text-[var(--text-muted)] mt-2">Create module quizzes, manage reusable questions, publish with 1 to n questions, and monitor student performance from MongoDB attempts.</p>
					</div>
					<div className="grid grid-cols-3 gap-3 text-center">
						<Metric label="Attempts" value={attemptData.summary?.totalAttempts || 0} />
						<Metric label="Avg Score" value={attemptData.summary?.averageScore || 0} />
						<Metric label="Avg Best" value={attemptData.summary?.averageBestScore || 0} />
					</div>
				</div>

				<section className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
					<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 space-y-4">
						<h2 className="font-bold text-xl flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#A855F7]" /> Scope</h2>
						<label className="block text-sm font-semibold">
							Course
							<select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="mt-2 w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-3">
								<option value="">Select course</option>
								{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
							</select>
						</label>
						<label className="block text-sm font-semibold">
							Module
							<select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} disabled={!selectedCourse} className="mt-2 w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-3 disabled:opacity-50">
								<option value="">Select module</option>
								{(selectedCourse?.modules || []).map((moduleObj, index) => (
									<option key={getModuleId(moduleObj, index)} value={getModuleId(moduleObj, index)}>{moduleObj.title}</option>
								))}
							</select>
						</label>

						<div className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4">
							<p className="text-sm text-[var(--text-muted)]">Current Quiz</p>
							<p className="font-bold mt-1">{activeQuiz?.title || "No quiz yet"}</p>
							<p className="text-xs text-[var(--text-muted)] mt-1">{activeQuiz?.status || "draft"} • {activeQuiz?.questionIds?.length || 0} questions</p>
						</div>
					</div>

					<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 space-y-5">
						<div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-3">
							<input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="Quiz title" className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3" />
							<input type="number" min="0" max="100" value={quizForm.passPercentage} onChange={(e) => setQuizForm({ ...quizForm, passPercentage: e.target.value })} className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3" />
						</div>
						<textarea value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} placeholder="Quiz description or instructions" rows={2} className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3" />
						<div className="flex flex-wrap gap-3">
							<button onClick={saveQuizMeta} disabled={saving || !selectedModuleId} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] font-semibold disabled:opacity-50"><Save className="w-4 h-4" /> Save Draft</button>
							<button onClick={publishQuiz} disabled={!activeQuiz || saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white font-semibold disabled:opacity-50"><Send className="w-4 h-4" /> Publish</button>
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6">
					<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5">
						<h2 className="font-bold text-xl flex items-center gap-2 mb-4"><Plus className="w-5 h-5 text-[#A855F7]" /> {editingQuestionId ? "Edit Question" : "Add Question"}</h2>
						<div className="space-y-3">
							<input value={questionForm.title} onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })} placeholder="Question title" className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3" />
							<textarea value={questionForm.description} onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })} placeholder="Question description (optional)" rows={2} className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{["A", "B", "C", "D"].map((key) => (
									<input key={key} value={questionForm.options[key]} onChange={(e) => setQuestionForm({ ...questionForm, options: { ...questionForm.options, [key]: e.target.value } })} placeholder={`Option ${key}`} className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3" />
								))}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<input value={questionForm.topic} onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })} placeholder="Topic" className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3" />
								<select value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })} className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3">
									<option>Easy</option><option>Medium</option><option>Hard</option>
								</select>
								<select value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3">
									<option>A</option><option>B</option><option>C</option><option>D</option>
								</select>
							</div>
							<textarea value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} placeholder="Detailed explanation for the correct answer" rows={3} className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3" />
							<div className="flex gap-3">
								<button onClick={saveQuestion} disabled={saving || !selectedModuleId} className="px-5 py-3 rounded-xl bg-[#A855F7] text-white font-bold disabled:opacity-50">{editingQuestionId ? "Update Question" : "Add to Quiz"}</button>
								{editingQuestionId && <button onClick={() => { setEditingQuestionId(""); setQuestionForm(emptyQuestionForm); }} className="px-5 py-3 rounded-xl border border-[var(--border-primary)]">Cancel</button>}
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
							<h2 className="font-bold text-xl flex items-center gap-2"><FileQuestion className="w-5 h-5 text-[#A855F7]" /> Quiz Questions</h2>
							<div className="flex flex-wrap gap-2">
								<DifficultyPill label="Easy" value={difficultyCounts.Easy} />
								<DifficultyPill label="Medium" value={difficultyCounts.Medium} />
								<DifficultyPill label="Hard" value={difficultyCounts.Hard} />
							</div>
						</div>
						<div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
							{(activeQuiz?.questionIds || []).length === 0 ? (
								<p className="text-sm text-[var(--text-muted)]">No questions added yet.</p>
							) : activeQuiz.questionIds.map((question, index) => (
								<QuestionCard key={question._id} question={question} index={index} active onEdit={editQuestion} onRemove={() => removeFromQuiz(question._id)} />
							))}
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
					<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5">
						<h2 className="font-bold text-xl flex items-center gap-2 mb-4"><FileQuestion className="w-5 h-5 text-[#A855F7]" /> Question Bank</h2>
						<div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
							{questionBank.length === 0 ? (
								<p className="text-sm text-[var(--text-muted)]">No bank questions for this module yet.</p>
							) : questionBank.map((question, index) => (
								<QuestionCard
									key={question._id}
									question={question}
									index={index}
									onEdit={editQuestion}
									onAttach={() => attachExistingQuestion(question._id)}
									onDelete={() => deleteQuestion(question._id)}
									attached={activeQuestionIds.has(question._id)}
								/>
							))}
						</div>
					</div>

					<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5">
						<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
							<h2 className="font-bold text-xl flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#A855F7]" /> Student Performance</h2>
							<div className="flex flex-col sm:flex-row gap-3">
								<select
									value={filter.courseId}
									onChange={(e) => setFilter({ ...filter, courseId: e.target.value })}
									className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-2 text-sm"
								>
									<option value="">All Courses</option>
									{courses.map((course) => (
										<option key={course._id} value={course._id}>{course.title}</option>
									))}
								</select>

								<select
									value={filter.status}
									onChange={(e) => setFilter({ ...filter, status: e.target.value })}
									className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-2 text-sm"
								>
									<option value="All">All Results</option>
									<option value="Passed">Passed</option>
									<option value="Failed">Failed</option>
								</select>
							</div>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="text-left text-[var(--text-muted)]">
									<tr>
										<th className="py-3">Student</th>
										<th>Module</th>
										<th>Score</th>
										<th>Status</th>
										<th>Date</th>
									</tr>
								</thead>
								<tbody>
									{filteredAttempts.length > 0 ? (
										filteredAttempts.map((attempt) => (
											<tr key={attempt._id} className="border-t border-[var(--border-primary)]">
												<td className="py-3 font-semibold">{attempt.studentName}</td>
												<td>{attempt.moduleName}</td>
												<td>{attempt.score}/{attempt.totalMarks} ({attempt.percentage}%)</td>
												<td><span className={attempt.status === "Passed" ? "text-green-500" : "text-red-500"}>{attempt.status}</span></td>
												<td>{new Date(attempt.attemptDate).toLocaleDateString()}</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan="5" className="py-4 text-center text-[var(--text-muted)]">
												No attempts found for these filters.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

function Metric({ label, value }) {
	return (
		<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] px-4 py-3 min-w-[96px]">
			<p className="text-lg font-extrabold">{value}</p>
			<p className="text-xs text-[var(--text-muted)]">{label}</p>
		</div>
	);
}

function DifficultyPill({ label, value }) {
	const colorClass =
		label === "Hard"
			? "border-red-500/40 text-red-400 bg-red-500/10"
			: label === "Medium"
				? "border-yellow-500/40 text-yellow-400 bg-yellow-500/10"
				: "border-green-500/40 text-green-400 bg-green-500/10";

	return (
		<span className={`rounded-full border px-3 py-1 text-xs font-bold ${colorClass}`}>
			{label}: {value}
		</span>
	);
}

function QuestionCard({ question, index, active = false, attached = false, onEdit, onAttach, onRemove, onDelete }) {
	return (
		<div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-xs text-[var(--text-muted)]">Q{index + 1} • {question.difficulty} • {question.topic || "General"}</p>
					<h3 className="font-bold mt-1">{question.title}</h3>
				</div>
				{active && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
			</div>
			<div className="mt-3 flex flex-wrap gap-2">
				<button onClick={() => onEdit(question)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-primary)]">Edit</button>
				{onAttach && <button onClick={onAttach} disabled={attached} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#A855F7] text-white disabled:opacity-50">{attached ? "Attached" : "Reuse"}</button>}
				{onRemove && <button onClick={onRemove} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/40 text-red-400">Remove</button>}
				{onDelete && <button onClick={onDelete} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/40 text-red-400"><Trash2 className="w-3 h-3 inline" /> Delete</button>}
			</div>
		</div>
	);
}
