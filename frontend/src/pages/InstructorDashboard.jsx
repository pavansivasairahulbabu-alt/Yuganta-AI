import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useInstructor } from "../context/InstructorContext";
import VideoUpload from "../components/VideoUpload";
import API_URL from "../config/api";

export default function InstructorDashboard() {
	const [courses, setCourses] = useState([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingCourse, setEditingCourse] = useState(null);
	const [showModuleModal, setShowModuleModal] = useState(false);
	const [currentCourseForModule, setCurrentCourseForModule] = useState(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		instructor: "",
		duration: "",
		level: "Beginner",
		price: "Free",
		thumbnail: "",
		category: "AI & ML",
		videoUrl: "",
		videoPublicId: "",
		brochureLink: "",
		modules: [],
	});
	const [moduleData, setModuleData] = useState({
		title: "",
		description: "",
		order: 1,
		videos: [],
	});
	const [videoData, setVideoData] = useState({
		title: "",
		url: "",
		publicId: "",
		duration: "",
		description: "",
		order: 1,
	});
	const [showAddVideoToModule, setShowAddVideoToModule] = useState(false);
	const [mentorshipSessions, setMentorshipSessions] = useState([]);
	const [editingMeetingLink, setEditingMeetingLink] = useState(null);
	const [meetingLinkInput, setMeetingLinkInput] = useState("");
	const [rejectSessionId, setRejectSessionId] = useState(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rescheduleSessionId, setRescheduleSessionId] = useState(null);
	const [showRescheduleModal, setShowRescheduleModal] = useState(false);
	const [rescheduleData, setRescheduleData] = useState({
		newDate: "",
		newTime: "",
		reason: "",
	});

	const { instructor, logout, isAuthenticated } = useInstructor();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/instructor", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		fetchCourses();
		fetchMentorshipSessions();
	}, [instructor]);

	const fetchCourses = async () => {
		try {
			const token = localStorage.getItem("instructorToken");
			if (!token || !instructor) return;

			// Fetch only the logged-in instructor's courses
			const response = await fetch(
				`${API_URL}/api/courses/instructor/${instructor._id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			setCourses(data);
		} catch (error) {
			console.error("Error fetching courses:", error);
		}
	};

	const fetchMentorshipSessions = async () => {
		try {
			const token = localStorage.getItem("instructorToken");
			if (!token || !instructor) return;

			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/instructor`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			setMentorshipSessions(data);
		} catch (error) {
			console.error("Error fetching mentorship sessions:", error);
		}
	};

	const handleUpdateMeetingLink = async (sessionId) => {
		try {
			const token = localStorage.getItem("instructorToken");
			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/${sessionId}/meeting-link`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ meetingLink: meetingLinkInput }),
				},
			);

			if (response.ok) {
				setEditingMeetingLink(null);
				setMeetingLinkInput("");
				fetchMentorshipSessions(); // Refresh the list
				alert("Meeting link updated successfully!");
			}
		} catch (error) {
			console.error("Error updating meeting link:", error);
			alert("Failed to update meeting link");
		}
	};

	const handleOpenReject = (sessionId) => {
		setRejectSessionId(sessionId);
		setRejectionReason("");
		setShowRejectModal(true);
	};

	const handleRejectSession = async () => {
		if (!rejectionReason || rejectionReason.trim() === "") {
			alert("Please provide a reason for rejection");
			return;
		}

		try {
			const token = localStorage.getItem("instructorToken");
			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/${rejectSessionId}/reject`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ reason: rejectionReason }),
				},
			);

			if (response.ok) {
				setShowRejectModal(false);
				setRejectSessionId(null);
				setRejectionReason("");
				fetchMentorshipSessions();
			} else {
				const data = await response.json();
				alert(data.message || "Failed to reject session");
			}
		} catch (error) {
			console.error("Error rejecting session:", error);
			alert("Failed to reject session");
		}
	};

	const handleOpenReschedule = (sessionId) => {
		setRescheduleSessionId(sessionId);
		setShowRescheduleModal(true);
		setRescheduleData({ newDate: "", newTime: "", reason: "" });
	};

	const handleRescheduleSession = async () => {
		if (!rescheduleData.newDate || !rescheduleData.newTime) {
			alert("Please select both date and time");
			return;
		}

		try {
			const token = localStorage.getItem("instructorToken");
			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/${rescheduleSessionId}/reschedule`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(rescheduleData),
				},
			);

			if (response.ok) {
				setShowRescheduleModal(false);
				setRescheduleSessionId(null);
				setRescheduleData({ newDate: "", newTime: "", reason: "" });
				fetchMentorshipSessions();
				alert(
					"Session rescheduled successfully. The student will be notified.",
				);
			} else {
				const data = await response.json();
				alert(data.message || "Failed to reschedule session");
			}
		} catch (error) {
			console.error("Error rescheduling session:", error);
			alert("Failed to reschedule session");
		}
	};

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleModuleInputChange = (e) => {
		setModuleData({
			...moduleData,
			[e.target.name]: e.target.value,
		});
	};

	const handleVideoInputChange = (e) => {
		setVideoData({
			...videoData,
			[e.target.name]: e.target.value,
		});
	};

	const [files, setFiles] = useState({
		thumbnail: null,
		brochure: null,
	});

	const handleFileChange = (e) => {
		setFiles({
			...files,
			[e.target.name]: e.target.files[0],
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const url = editingCourse
				? `${API_URL}/api/courses/instructor/${editingCourse._id}`
				: `${API_URL}/api/courses/instructor/create`;

			const token = localStorage.getItem("instructorToken");

			const courseFormData = new FormData();
			// Append simple fields
			courseFormData.append("title", formData.title);
			courseFormData.append("description", formData.description);
			// Auto-fill instructor name from logged-in instructor
			courseFormData.append(
				"instructor",
				formData.instructor ||
					instructor?.name ||
					instructor?.email ||
					"Instructor",
			);
			courseFormData.append("duration", formData.duration);
			courseFormData.append("level", formData.level);
			courseFormData.append("price", formData.price);
			courseFormData.append("category", formData.category);
			courseFormData.append("videoUrl", formData.videoUrl || "");
			courseFormData.append(
				"videoPublicId",
				formData.videoPublicId || "",
			);

			// Append complex fields (FormData only accepts strings/blobs)
			courseFormData.append("modules", JSON.stringify(formData.modules));

			// Append existing URLs if no new file (backend handles this logic but good to keep consistency)
			if (!files.thumbnail && formData.thumbnail)
				courseFormData.append("thumbnail", formData.thumbnail);
			if (!files.brochure && formData.brochureLink)
				courseFormData.append("brochureLink", formData.brochureLink);

			// Append files
			if (files.thumbnail) {
				courseFormData.append("thumbnail", files.thumbnail);
			}
			if (files.brochure) {
				courseFormData.append("brochure", files.brochure);
			}

			// Note: Don't set Content-Type header manually for FormData, browser does it with boundary
			const response = await fetch(url, {
				method: editingCourse ? "PUT" : "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: courseFormData,
			});

			if (response.ok) {
				setShowAddModal(false);
				setEditingCourse(null);
				resetFormData();
				fetchCourses();
				alert(
					editingCourse
						? "Course updated successfully!"
						: "Course created successfully!",
				);
			} else {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Unknown error" }));
				console.error("Server error:", errorData);
				alert(
					`Error: ${errorData.message}${errorData.error ? " - " + errorData.error : ""}`,
				);
			}
		} catch (error) {
			console.error("Error saving course:", error);
			alert(`Failed to save course: ${error.message}`);
		}
	};

	const resetFormData = () => {
		setFormData({
			title: "",
			description: "",
			instructor: instructor?.name || instructor?.email || "",
			duration: "",
			level: "Beginner",
			price: "Free",
			thumbnail: "",
			category: "AI & ML",
			videoUrl: "",
			videoPublicId: "",
			brochureLink: "",
			modules: [],
		});
		setFiles({ thumbnail: null, brochure: null });
	};

	const handleEdit = (course) => {
		setEditingCourse(course);
		setFormData({
			title: course.title,
			description: course.description,
			instructor: course.instructor,
			duration: course.duration,
			level: course.level,
			price: course.price,
			thumbnail: course.thumbnail,
			category: course.category,
			videoUrl: course.videoUrl || "",
			videoPublicId: course.videoPublicId || "",
			brochureLink: course.brochureLink || "",
			modules: course.modules || [],
		});
		setFiles({ thumbnail: null, brochure: null });
		setShowAddModal(true);
	};

	const handleDelete = async (courseId) => {
		if (!window.confirm("Are you sure you want to delete this course?")) {
			return;
		}

		try {
			const token = localStorage.getItem("instructorToken");
			const response = await fetch(
				`${API_URL}/api/courses/instructor/${courseId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (response.ok) {
				fetchCourses();
			}
		} catch (error) {
			console.error("Error deleting course:", error);
		}
	};

	const handleAddModule = () => {
		const newModule = {
			...moduleData,
			order: (formData.modules?.length || 0) + 1,
		};
		setFormData({
			...formData,
			modules: [...(formData.modules || []), newModule],
		});
		setModuleData({
			title: "",
			description: "",
			order: 1,
			videos: [],
		});
		setShowModuleModal(false);
	};

	const handleAddVideoToModule = () => {
		const updatedModules = [...formData.modules];
		const moduleIndex = updatedModules.findIndex(
			(m) => m.order === currentCourseForModule,
		);
		if (moduleIndex !== -1) {
			const newVideo = {
				...videoData,
				order: (updatedModules[moduleIndex].videos?.length || 0) + 1,
			};
			updatedModules[moduleIndex].videos = [
				...(updatedModules[moduleIndex].videos || []),
				newVideo,
			];
			setFormData({
				...formData,
				modules: updatedModules,
			});
			setVideoData({
				title: "",
				url: "",
				publicId: "",
				duration: "",
				description: "",
				order: 1,
			});
			setShowAddVideoToModule(false);
			setCurrentCourseForModule(null);
		}
	};

	const handleRemoveModule = (moduleOrder) => {
		setFormData({
			...formData,
			modules: formData.modules.filter((m) => m.order !== moduleOrder),
		});
	};

	const handleRemoveVideoFromModule = (moduleOrder, videoOrder) => {
		const updatedModules = formData.modules.map((module) => {
			if (module.order === moduleOrder) {
				return {
					...module,
					videos: module.videos.filter((v) => v.order !== videoOrder),
				};
			}
			return module;
		});
		setFormData({
			...formData,
			modules: updatedModules,
		});
	};

	const handleLogout = () => {
		logout();
		navigate("/instructor");
	};

	if (!instructor) {
		return null;
	}

	return (
		<div className='min-h-screen bg-[#0B0614]'>
			{/* Header */}
			<header className='bg-[rgba(22,11,46,0.8)] backdrop-blur-xl border-b border-[rgba(139,92,246,0.2)] text-white px-6 py-5 sticky top-0 z-50 shadow-[0_8px_32px_rgba(139,92,246,0.2)]'>
				<div className='max-w-7xl mx-auto flex items-center justify-between'>
					<div className='flex items-center space-x-6'>
						<Link
							to='/'
							className='flex items-center space-x-3 hover:opacity-80 transition duration-300 group'>
							<img
								src='/yuganta-logo.png'
								alt='Yuganta AI'
								className='w-10 h-10 transition-transform group-hover:scale-110'
							/>
							<div className='text-xl font-bold tracking-tight'>
								<span className='text-white'>Yuganta</span>
								<span className='bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent'>
									AI
								</span>
							</div>
						</Link>
						<div className='w-px h-6 bg-[rgba(139,92,246,0.2)]'></div>
						<span className='text-sm text-[#C7C3D6] font-medium'>
							Instructor Dashboard
						</span>
					</div>

					<div className='flex items-center space-x-6'>
						<div className='flex items-center space-x-3 px-4 py-2 bg-[rgba(139,92,246,0.1)] rounded-lg border border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.15)] transition duration-300'>
							<div className='w-9 h-9 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-[0_4px_12px_rgba(139,92,246,0.4)]'>
								{instructor.email.charAt(0).toUpperCase()}
							</div>
							<div className='text-sm font-medium text-[#C7C3D6]'>
								{instructor.email}
							</div>
						</div>
						<button
							onClick={handleLogout}
							className='px-5 py-2.5 bg-transparent border border-[#EC4899] text-[#EC4899] hover:bg-[rgba(236,72,153,0.1)] rounded-lg transition duration-300 text-sm font-semibold hover:shadow-[0_0_16px_rgba(236,72,153,0.3)]'>
							Logout
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className='max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12'>
				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
					<div className='bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.25)] rounded-2xl p-6 text-white hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)] hover:-translate-y-1 transition-all duration-300'>
						<div className='flex items-center justify-between mb-2'>
							<div className='text-3xl font-bold text-transparent bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text'>
								{courses.length}
							</div>
							<svg
								className='w-8 h-8 text-[#A855F7] opacity-50'
								fill='currentColor'
								viewBox='0 0 20 20'>
								<path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' />
								<path
									fillRule='evenodd'
									d='M4 5a2 2 0 012-2 1 1 0 010 2H4a1 1 0 010-2zm10 0a1 1 0 010 2h-2a1 1 0 010-2h2zm-8 4a2 2 0 012-2 1 1 0 010 2H6a1 1 0 010-2zm10 0a1 1 0 010 2h-2a1 1 0 010-2h2zm-8 4a2 2 0 012-2 1 1 0 010 2h-2a1 1 0 010-2zm10 0a1 1 0 010 2h-2a1 1 0 010-2h2z'
									clipRule='evenodd'
								/>
							</svg>
						</div>
						<div className='text-[#C7C3D6] font-medium'>
							Total Courses
						</div>
					</div>
					<div className='bg-gradient-to-br from-[rgba(168,85,247,0.15)] to-[rgba(168,85,247,0.05)] border border-[rgba(168,85,247,0.25)] rounded-2xl p-6 text-white hover:shadow-[0_8px_32px_rgba(168,85,247,0.2)] hover:-translate-y-1 transition-all duration-300'>
						<div className='flex items-center justify-between mb-2'>
							<div className='text-3xl font-bold text-transparent bg-gradient-to-r from-[#A855F7] to-[#D946EF] bg-clip-text'>
								{courses.reduce(
									(sum, course) =>
										sum + (course.modules?.length || 0),
									0,
								)}
							</div>
							<svg
								className='w-8 h-8 text-[#A855F7] opacity-50'
								fill='currentColor'
								viewBox='0 0 20 20'>
								<path d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z' />
							</svg>
						</div>
						<div className='text-[#C7C3D6] font-medium'>
							Total Modules
						</div>
					</div>
					<div className='bg-gradient-to-br from-[rgba(236,72,153,0.15)] to-[rgba(236,72,153,0.05)] border border-[rgba(236,72,153,0.25)] rounded-2xl p-6 text-white hover:shadow-[0_8px_32px_rgba(236,72,153,0.2)] hover:-translate-y-1 transition-all duration-300'>
						<div className='flex items-center justify-between mb-2'>
							<div className='text-3xl font-bold text-transparent bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text'>
								{courses.reduce(
									(sum, course) =>
										sum +
										(course.modules?.reduce(
											(s, m) =>
												s + (m.videos?.length || 0),
											0,
										) || 0),
									0,
								)}
							</div>
							<svg
								className='w-8 h-8 text-[#EC4899] opacity-50'
								fill='currentColor'
								viewBox='0 0 20 20'>
								<path d='M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2v4h8V8H6z' />
							</svg>
						</div>
						<div className='text-[#C7C3D6] font-medium'>
							Total Videos
						</div>
					</div>
				</div>

				{/* Course Management */}
				<div className='bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(139,92,246,0.2)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)]'>
					<div className='flex items-center justify-between mb-8'>
						<div>
							<h2 className='text-2xl font-bold text-white mb-1'>
								Manage Courses & Modules
							</h2>
							<p className='text-[#C7C3D6] text-sm'>
								Create, edit, and manage your course content
								including modules and videos
							</p>
						</div>
						<button
							onClick={() => {
								resetFormData();
								setFormData({
									title: "",
									description: "",
									instructor: instructor?.name || "",
									duration: "",
									level: "Beginner",
									price: "Free",
									thumbnail: "",
									category: "AI & ML",
									videoUrl: "",
									videoPublicId: "",
									brochureLink: "",
									modules: [],
								});
								setShowAddModal(true);
							}}
							className='px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white rounded-lg transition-all duration-300 font-semibold shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-100 flex items-center space-x-2 group'>
							<svg
								className='w-5 h-5 group-hover:rotate-90 transition-transform duration-300'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2.5}
									d='M12 4v16m8-8H4'
								/>
							</svg>
							<span>Add Course</span>
						</button>
					</div>

					{/* Courses Table */}
					{courses.length === 0 ? (
						<div className='text-center py-16 border-2 border-dashed border-[rgba(139,92,246,0.2)] rounded-xl'>
							<svg
								className='w-20 h-20 mx-auto text-[#A855F7] opacity-50 mb-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={1.5}
									d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
								/>
							</svg>
							<h3 className='text-xl font-bold text-white mb-2'>
								No Courses Yet
							</h3>
							<p className='text-[#C7C3D6] mb-6'>
								Create your first course to start teaching
							</p>
							<button
								onClick={() => {
									resetFormData();
									setFormData({
										title: "",
										description: "",
										instructor: instructor?.name || "",
										duration: "",
										level: "Beginner",
										price: "Free",
										thumbnail: "",
										category: "AI & ML",
										videoUrl: "",
										videoPublicId: "",
										brochureLink: "",
										modules: [],
									});
									setShowAddModal(true);
								}}
								className='px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white rounded-lg transition-all duration-300 font-semibold shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)] inline-flex items-center space-x-2'>
								<svg
									className='w-5 h-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2.5}
										d='M12 4v16m8-8H4'
									/>
								</svg>
								<span>Create Your First Course</span>
							</button>
						</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='w-full text-left text-[#C7C3D6]'>
								<thead className='border-b border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)]'>
									<tr>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>
											Course
										</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>
											Level
										</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>
											Modules
										</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>
											Students
										</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>
											Price
										</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{courses.map((course) => (
										<tr
											key={course._id}
											className='border-b border-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.05)] transition-colors duration-200'>
											<td className='py-5 px-6'>
												<div className='flex items-center space-x-4'>
													<img
														src={
															course.thumbnail ||
															"https://via.placeholder.com/60"
														}
														alt={course.title}
														className='w-14 h-14 rounded-lg object-cover border border-[rgba(139,92,246,0.2)] shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
													/>
													<div>
														<div className='font-semibold text-white'>
															{course.title}
														</div>
														<div className='text-xs text-[#9A93B5] mt-1'>
															{course.category}
														</div>
													</div>
												</div>
											</td>
											<td className='py-4 px-4'>
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														course.level === "Beginner"
															? "bg-green-500/20 text-green-300 border border-green-500/30"
															: course.level ===
																  "Intermediate"
																? "bg-[rgba(168,85,247,0.2)] text-[#A855F7] border border-[rgba(168,85,247,0.3)]"
																: "bg-[rgba(236,72,153,0.2)] text-[#EC4899] border border-[rgba(236,72,153,0.3)]"
													}`}>
													{course.level}
												</span>
											</td>
											<td className='py-4 px-4'>
												<div className='flex items-center space-x-2'>
													<svg
														className='w-4 h-4 text-[#A855F7]'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
														/>
													</svg>
													<span className='text-white font-medium'>
														{course.modules?.length || 0}
													</span>
												</div>
											</td>
											<td className='py-4 px-4'>
												<div className='flex items-center space-x-2'>
													<svg
														className='w-4 h-4 text-[#EC4899]'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
														/>
													</svg>
													<span className='text-white font-medium'>
														{course.students || 0}
													</span>
												</div>
											</td>
											<td className='py-4 px-4'>
												<span className='px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30'>
													{course.price === "Free"
														? "Free"
														: `$${course.price}`}
												</span>
											</td>
											<td className='py-4 px-4'>
												<div className='flex space-x-2'>
													<button
														onClick={() =>
															handleEdit(course)
														}
														className='p-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#A855F7] hover:to-[#EC4899] rounded-lg transition-all duration-300 shadow-[0_2px_8px_rgba(139,92,246,0.3)] group'
														title='Edit course and manage modules'>
														<svg
															className='w-4 h-4 text-white group-hover:scale-110 transition-transform'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
															/>
														</svg>
												</button>
												<button
													onClick={() =>
														handleDelete(course._id)
													}
													className='p-2 bg-red-600 hover:bg-red-700 rounded-lg transition duration-200'>
													<svg
														className='w-4 h-4 text-white'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Mentorship Sessions Section */}
			<div className='bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(139,92,246,0.2)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)] mt-10'>
				<div className='flex items-center justify-between mb-8'>
						<div>
							<h2 className='text-2xl font-bold text-white mb-1'>
								My Mentorship Sessions
							</h2>
							<p className='text-[#C7C3D6] text-sm'>
								View and manage your upcoming mentorship
								sessions
							</p>
						</div>
					</div>

					{mentorshipSessions.length === 0 ? (
						<div className='text-center py-12'>
							<svg
								className='w-16 h-16 mx-auto text-[#A855F7] opacity-50 mb-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={1.5}
									d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
								/>
							</svg>
							<p className='text-[#C7C3D6] text-lg'>
								No mentorship sessions yet
							</p>
							<p className='text-[#9183A8] text-sm mt-2'>
								Students will book sessions with you from the
								mentorship page
							</p>
						</div>
					) : (
						<div className='space-y-4'>
							{mentorshipSessions.map((session) => (
								<div
									key={session._id}
									className='bg-gradient-to-r from-[rgba(139,92,246,0.1)] to-[rgba(168,85,247,0.05)] border border-[rgba(139,92,246,0.2)] rounded-xl p-6 hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] transition-all duration-300'>
									<div className='grid md:grid-cols-2 gap-6'>
										{/* Session Info */}
										<div>
											<h3 className='text-xl font-bold text-white mb-4'>
												{session.title}
											</h3>
											<div className='space-y-3'>
												<div className='flex items-center text-[#C7C3D6]'>
													<svg
														className='w-5 h-5 mr-3 text-[#A855F7]'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
														/>
													</svg>
													<span className='font-medium'>
														Student:{" "}
													</span>
													<span className='ml-2'>
														{session.userId
															?.fullName ||
															"Unknown"}
													</span>
												</div>
												<div className='flex items-center text-[#C7C3D6]'>
													<svg
														className='w-5 h-5 mr-3 text-[#A855F7]'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
														/>
													</svg>
													<span className='font-medium'>
														Date:{" "}
													</span>
													<span className='ml-2'>
														{session.date}
													</span>
												</div>
												<div className='flex items-center text-[#C7C3D6]'>
													<svg
														className='w-5 h-5 mr-3 text-[#A855F7]'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
														/>
													</svg>
													<span className='font-medium'>
														Time:{" "}
													</span>
													<span className='ml-2'>
														{session.time}
													</span>
												</div>
												{session.notes && (
													<div className='flex items-start text-[#C7C3D6]'>
														<svg
															className='w-5 h-5 mr-3 mt-0.5 text-[#A855F7]'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
															/>
														</svg>
														<div>
															<span className='font-medium block'>
																Notes:{" "}
															</span>
															<span className='text-sm'>
																{session.notes}
															</span>
														</div>
													</div>
												)}
											</div>
										</div>

										{/* Meeting Link Section */}
										<div className='bg-[rgba(11,6,20,0.6)] rounded-lg p-5 border border-[rgba(139,92,246,0.15)]'>
											<div className='flex items-center justify-between mb-4'>
												<h4 className='text-lg font-semibold text-white flex items-center'>
													<svg
														className='w-5 h-5 mr-2 text-[#EC4899]'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
														/>
													</svg>
													Meeting Link
												</h4>
											</div>

											{editingMeetingLink ===
											session._id ? (
												<div className='space-y-3'>
													<input
														type='url'
														value={meetingLinkInput}
														onChange={(e) =>
															setMeetingLinkInput(
																e.target.value,
															)
														}
														placeholder='https://meet.google.com/xxx-xxxx-xxx'
														className='w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9183A8] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
													/>
													<div className='flex space-x-2'>
														<button
															onClick={() =>
																handleUpdateMeetingLink(
																	session._id,
																)
															}
															className='flex-1 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white rounded-lg transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_16px_rgba(139,92,246,0.4)]'>
															Save
														</button>
														<button
															onClick={() => {
																setEditingMeetingLink(
																	null,
																);
																setMeetingLinkInput(
																	"",
																);
															}}
															className='flex-1 px-4 py-2.5 bg-transparent border border-[#EC4899] text-[#EC4899] hover:bg-[rgba(236,72,153,0.1)] rounded-lg transition duration-300 font-semibold'>
															Cancel
														</button>
													</div>
												</div>
											) : (
												<div>
													{session.meetingLink ? (
														<div className='space-y-3'>
															<div className='flex items-center space-x-2 text-[#C7C3D6] bg-[rgba(139,92,246,0.05)] px-4 py-3 rounded-lg border border-[rgba(139,92,246,0.1)]'>
																<svg
																	className='w-4 h-4 text-green-400 flex-shrink-0'
																	fill='none'
																	stroke='currentColor'
																	viewBox='0 0 24 24'>
																	<path
																		strokeLinecap='round'
																		strokeLinejoin='round'
																		strokeWidth={
																			2
																		}
																		d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
																	/>
																</svg>
																<span className='text-sm flex-1 truncate font-mono'>
																	{
																		session.meetingLink
																	}
																</span>
																<a
																	href={
																		session.meetingLink
																	}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='flex-shrink-0 p-1.5 bg-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.3)] rounded transition'>
																	<svg
																		className='w-4 h-4 text-[#A855F7]'
																		fill='none'
																		stroke='currentColor'
																		viewBox='0 0 24 24'>
																		<path
																			strokeLinecap='round'
																			strokeLinejoin='round'
																			strokeWidth={
																				2
																			}
																			d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
																		/>
																	</svg>
																</a>
															</div>
															<button
																onClick={() => {
																	setEditingMeetingLink(
																		session._id,
																	);
																	setMeetingLinkInput(
																		session.meetingLink,
																	);
																}}
																className='w-full px-4 py-2 bg-[rgba(139,92,246,0.15)] hover:bg-[rgba(139,92,246,0.25)] text-[#A855F7] rounded-lg transition duration-300 text-sm font-semibold border border-[rgba(139,92,246,0.2)]'>
																Update Link
															</button>
														</div>
													) : (
														<div className='space-y-3'>
															<div className='flex items-center justify-center py-4 text-[#9183A8] border border-dashed border-[rgba(139,92,246,0.2)] rounded-lg'>
																<svg
																	className='w-5 h-5 mr-2'
																	fill='none'
																	stroke='currentColor'
																	viewBox='0 0 24 24'>
																	<path
																		strokeLinecap='round'
																		strokeLinejoin='round'
																		strokeWidth={
																			2
																		}
																		d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
																	/>
																</svg>
																<span className='text-sm'>
																	No meeting
																	link added
																	yet
																</span>
															</div>
															<button
																onClick={() => {
																	setEditingMeetingLink(
																		session._id,
																	);
																	setMeetingLinkInput(
																		"",
																	);
																}}
																className='w-full px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#A855F7] hover:to-[#EC4899] text-white rounded-lg transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_16px_rgba(139,92,246,0.4)] flex items-center justify-center group'>
																<svg
																	className='w-5 h-5 mr-2 group-hover:scale-110 transition-transform'
																	fill='none'
																	stroke='currentColor'
																	viewBox='0 0 24 24'>
																	<path
																		strokeLinecap='round'
																		strokeLinejoin='round'
																		strokeWidth={
																			2
																		}
																		d='M12 4v16m8-8H4'
																	/>
																</svg>
																Add Meeting Link
															</button>
														</div>
													)}
												</div>
											)}
										</div>
									</div>

									{/* Action Buttons */}
									{session.status === "upcoming" && (
										<div className='mt-6 pt-6 border-t border-[rgba(139,92,246,0.2)]'>
											<div className='flex gap-3'>
												<button
													onClick={() =>
														handleOpenReschedule(
															session._id,
														)
													}
													className='flex-1 px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-lg transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)] flex items-center justify-center group'>
													<svg
														className='w-5 h-5 mr-2 group-hover:rotate-12 transition-transform'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
														/>
													</svg>
													Reschedule
												</button>
												<button
													onClick={() =>
														handleOpenReject(
															session._id,
														)
													}
													className='flex-1 px-4 py-3 bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center group'>
													<svg
														className='w-5 h-5 mr-2 group-hover:scale-110 transition-transform'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M6 18L18 6M6 6l12 12'
														/>
													</svg>
													Reject
												</button>
											</div>
										</div>
									)}

									{/* Status Badges */}
									{session.status === "rejected" && (
										<div className='mt-6 pt-6 border-t border-[rgba(139,92,246,0.2)]'>
											<div className='bg-red-500/20 border border-red-500/40 rounded-lg p-4'>
												<div className='flex items-center gap-2 text-red-300'>
													<svg
														className='w-5 h-5'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M6 18L18 6M6 6l12 12'
														/>
													</svg>
													<span className='font-semibold'>
														Session Rejected
													</span>
												</div>
												{session.rejectionReason && (
													<p className='text-sm text-red-200 mt-2'>
														Reason:{" "}
														{
															session.rejectionReason
														}
													</p>
												)}
											</div>
										</div>
									)}

									{session.status === "rescheduled" && (
										<div className='mt-6 pt-6 border-t border-[rgba(139,92,246,0.2)]'>
											<div className='bg-blue-500/20 border border-blue-500/40 rounded-lg p-4'>
												<div className='flex items-center gap-2 text-blue-300'>
													<svg
														className='w-5 h-5'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
														/>
													</svg>
													<span className='font-semibold'>
														Session Rescheduled
													</span>
												</div>
												{session.originalDate &&
													session.originalTime && (
														<p className='text-sm text-blue-200 mt-2'>
															Original:{" "}
															{
																session.originalDate
															}{" "}
															at{" "}
															{
																session.originalTime
															}
														</p>
													)}
												{session.rescheduleReason && (
													<p className='text-sm text-blue-200 mt-1'>
														Reason:{" "}
														{
															session.rescheduleReason
														}
													</p>
												)}
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Reschedule Modal */}
			{showRescheduleModal && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4'>
					<div className='bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-2xl shadow-[0_8px_64px_rgba(139,92,246,0.3)] p-6 md:p-8 max-w-lg w-full'>
						<div className='mb-6'>
							<h3 className='text-2xl md:text-3xl font-bold text-white mb-2'>
								Reschedule Session
							</h3>
							<p className='text-sm text-[#C7C3D6]'>
								Choose a new date and time for this session
							</p>
						</div>

						<div className='space-y-5'>
							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									New Date{" "}
									<span className='text-[#EC4899]'>*</span>
								</label>
								<input
									type='date'
									value={rescheduleData.newDate}
									onChange={(e) =>
										setRescheduleData({
											...rescheduleData,
											newDate: e.target.value,
										})
									}
									className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
									required
								/>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									New Time{" "}
									<span className='text-[#EC4899]'>*</span>
								</label>
								<select
									value={rescheduleData.newTime}
									onChange={(e) =>
										setRescheduleData({
											...rescheduleData,
											newTime: e.target.value,
										})
									}
									className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all appearance-none cursor-pointer'>
									<option value=''>Select Time</option>
									<option value='3:00pm'>3:00pm</option>
									<option value='3:30pm'>3:30pm</option>
									<option value='4:00pm'>4:00pm</option>
									<option value='6:00pm'>6:00pm</option>
									<option value='6:30pm'>6:30pm</option>
									<option value='7:00pm'>7:00pm</option>
									<option value='7:30pm'>7:30pm</option>
									<option value='8:00pm'>8:00pm</option>
									<option value='8:30pm'>8:30pm</option>
									<option value='9:00pm'>9:00pm</option>
									<option value='9:30pm'>9:30pm</option>
								</select>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Reason (Optional)
								</label>
								<textarea
									value={rescheduleData.reason}
									onChange={(e) =>
										setRescheduleData({
											...rescheduleData,
											reason: e.target.value,
										})
									}
									placeholder='Explain why you need to reschedule...'
									className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent resize-none transition-all'
									rows='3'></textarea>
							</div>

							<div className='flex flex-col sm:flex-row gap-3 pt-4'>
								<button
									onClick={handleRescheduleSession}
									className='flex-1 px-6 py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-xl transition-all duration-300 font-bold text-lg shadow-[0_8px_24px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-100'>
									Confirm Reschedule
								</button>
								<button
									onClick={() => {
										setShowRescheduleModal(false);
										setRescheduleSessionId(null);
										setRescheduleData({
											newDate: "",
											newTime: "",
											reason: "",
										});
									}}
									className='px-6 py-4 bg-transparent border-2 border-[rgba(139,92,246,0.3)] hover:border-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] text-white rounded-xl transition-all duration-300 font-semibold'>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Rejection Modal */}
			{showRejectModal && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4'>
					<div className='bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(236,72,153,0.3)] rounded-2xl shadow-[0_8px_64px_rgba(236,72,153,0.3)] p-6 md:p-8 max-w-lg w-full'>
						<div className='mb-6'>
							<div className='flex items-center gap-3 mb-2'>
								<div className='w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center'>
									<svg
										className='w-6 h-6 text-red-400'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</div>
								<h3 className='text-2xl md:text-3xl font-bold text-white'>
									Reject Session
								</h3>
							</div>
							<p className='text-sm text-[#C7C3D6]'>
								Please provide a reason for rejecting this
								session. The student will be notified.
							</p>
						</div>

						<div className='space-y-5'>
							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Rejection Reason{" "}
									<span className='text-[#EC4899]'>*</span>
								</label>
								<textarea
									value={rejectionReason}
									onChange={(e) =>
										setRejectionReason(e.target.value)
									}
									placeholder='Explain why you are rejecting this session...'
									className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(236,72,153,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#EC4899] focus:border-transparent resize-none transition-all'
									rows='4'
									required></textarea>
							</div>

							<div className='bg-red-500/10 border border-red-500/30 rounded-lg p-4'>
								<div className='flex items-start gap-2'>
									<svg
										className='w-5 h-5 text-red-400 mt-0.5 flex-shrink-0'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
										/>
									</svg>
									<p className='text-sm text-red-300'>
										This action cannot be undone. The
										student will be notified and the session
										will be cancelled.
									</p>
								</div>
							</div>

							<div className='flex flex-col sm:flex-row gap-3 pt-4'>
								<button
									onClick={handleRejectSession}
									className='flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 font-bold text-lg shadow-[0_8px_24px_rgba(220,38,38,0.4)] hover:shadow-[0_12px_32px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-100'>
									Confirm Rejection
								</button>
								<button
									onClick={() => {
										setShowRejectModal(false);
										setRejectSessionId(null);
										setRejectionReason("");
									}}
									className='px-6 py-4 bg-transparent border-2 border-[rgba(139,92,246,0.3)] hover:border-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] text-white rounded-xl transition-all duration-300 font-semibold'>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Add/Edit Course Modal */}
			{showAddModal && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
					<div className='bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-2xl shadow-[0_8px_64px_rgba(139,92,246,0.3)] p-6 md:p-8 max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto custom-scrollbar'>
						<div className='flex items-center justify-between mb-8'>
							<div>
								<h3 className='text-2xl md:text-3xl font-bold text-white mb-2'>
									{editingCourse
										? "Edit Course"
										: "Create New Course"}
								</h3>
								<p className='text-sm text-[#C7C3D6]'>
									{editingCourse
										? "Update course information and content"
										: "Build engaging content for your students"}
								</p>
							</div>
							<button
								onClick={() => {
									setShowAddModal(false);
									setEditingCourse(null);
									resetFormData();
								}}
								className='text-[#C7C3D6] hover:text-white hover:bg-[rgba(139,92,246,0.2)] p-2 rounded-lg transition-all duration-200'>
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						<form onSubmit={handleSubmit} className='space-y-6'>
							{/* Basic Information */}
							<div className='bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.15)] rounded-xl p-6'>
								<h4 className='text-lg font-semibold text-white mb-4 flex items-center'>
									<svg
										className='w-5 h-5 mr-2 text-[#A855F7]'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
									Basic Information
								</h4>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<label className='block text-white mb-2 text-sm font-medium'>
											Course Title{" "}
											<span className='text-[#EC4899]'>
												*
											</span>
										</label>
										<input
											type='text'
											name='title'
											value={formData.title}
											onChange={handleInputChange}
											placeholder='e.g., Advanced Machine Learning'
											className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
											required
										/>
									</div>

									<div>
										<label className='block text-white mb-2 text-sm font-medium'>
											Instructor
										</label>
										<input
											type='text'
											name='instructor'
											value={formData.instructor}
											onChange={handleInputChange}
											disabled
											className='w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-lg text-[#C7C3D6] cursor-not-allowed'
											required
										/>
									</div>
								</div>

								<div className='mt-4'>
									<label className='block text-white mb-2 text-sm font-medium'>
										Description{" "}
										<span className='text-[#EC4899]'>
											*
										</span>
									</label>
									<textarea
										name='description'
										value={formData.description}
										onChange={handleInputChange}
										placeholder='Describe what students will learn in this course...'
										className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all resize-none'
										rows='4'
										required></textarea>
								</div>
							</div>

							{/* Course Details */}
							<div className='bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.15)] rounded-xl p-6'>
								<h4 className='text-lg font-semibold text-white mb-4 flex items-center'>
									<svg
										className='w-5 h-5 mr-2 text-[#A855F7]'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
										/>
									</svg>
									Course Details
								</h4>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
									<div>
										<label className='block text-white mb-2 text-sm font-medium'>
											Duration{" "}
											<span className='text-[#EC4899]'>
												*
											</span>
										</label>
										<input
											type='text'
											name='duration'
											value={formData.duration}
											onChange={handleInputChange}
											placeholder='e.g., 6 weeks'
											className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
											required
										/>
									</div>

									<div>
										<label className='block text-white mb-2 text-sm font-medium'>
											Level{" "}
											<span className='text-[#EC4899]'>
												*
											</span>
										</label>
										<select
											name='level'
											value={formData.level}
											onChange={handleInputChange}
											className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all appearance-none cursor-pointer'>
											<option value='Beginner'>
												Beginner
											</option>
											<option value='Intermediate'>
												Intermediate
											</option>
											<option value='Advanced'>
												Advanced
											</option>
										</select>
									</div>

									<div>
										<label className='block text-white mb-2 text-sm font-medium'>
											Price{" "}
											<span className='text-[#EC4899]'>
												*
											</span>
										</label>
										<input
											type='text'
											name='price'
											value={formData.price}
											onChange={handleInputChange}
											placeholder='Free or $99'
											className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
											required
										/>
									</div>

									<div>
										<label className='block text-white mb-2 text-sm font-medium'>
											Category{" "}
											<span className='text-[#EC4899]'>
												*
											</span>
										</label>
										<input
											type='text'
											name='category'
											value={formData.category}
											onChange={handleInputChange}
											placeholder='AI & ML'
											className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
											required
										/>
									</div>
								</div>

								<div className='mt-4'>
									<label className='block text-white mb-2 text-sm font-medium'>
										Thumbnail Image
									</label>
									<div className='flex flex-col gap-2'>
										{formData.thumbnail &&
											typeof formData.thumbnail ===
												"string" && (
												<div className='text-xs text-gray-400 mb-1'>
													Current:{" "}
													<a
														href={
															formData.thumbnail
														}
														target='_blank'
														rel='noreferrer'
														className='text-[#A855F7] hover:underline'>
														View Image
													</a>
												</div>
											)}
										<input
											type='file'
											name='thumbnail'
											accept='image/*'
											onChange={handleFileChange}
											className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[rgba(139,92,246,0.2)] file:text-[#A855F7] hover:file:bg-[rgba(139,92,246,0.3)]'
										/>
									</div>
								</div>

								<div className='mt-4'>
									<label className='block text-white mb-2 text-sm font-medium'>
										Brochure (PDF)
									</label>
									<div className='flex flex-col gap-2'>
										{formData.brochureLink && (
											<div className='text-xs text-gray-400 mb-1'>
												Current:{" "}
												<a
													href={formData.brochureLink}
													target='_blank'
													rel='noreferrer'
													className='text-[#A855F7] hover:underline'>
													View Brochure
												</a>
											</div>
										)}
										<input
											type='file'
											name='brochure'
											accept='.pdf'
											onChange={handleFileChange}
											className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[rgba(139,92,246,0.2)] file:text-[#A855F7] hover:file:bg-[rgba(139,92,246,0.3)]'
										/>
									</div>
								</div>
							</div>

							{/* Modules Section */}
							<div className='bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.15)] rounded-xl p-6'>
								<div className='flex items-center justify-between mb-5'>
									<h4 className='text-lg font-semibold text-white flex items-center'>
										<svg
											className='w-5 h-5 mr-2 text-[#A855F7]'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
											/>
										</svg>
										Course Modules
									</h4>
									<button
										type='button'
										onClick={() => setShowModuleModal(true)}
										className='px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white rounded-lg transition-all duration-300 text-sm font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] flex items-center space-x-2'>
										<svg
											className='w-4 h-4'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2.5}
												d='M12 4v16m8-8H4'
											/>
										</svg>
										<span>Add Module</span>
									</button>
								</div>

								{formData.modules &&
								formData.modules.length > 0 ? (
									<div className='space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar'>
										{formData.modules.map((module, idx) => (
											<div
												key={idx}
												className='bg-[#0B0614] border border-[rgba(139,92,246,0.2)] rounded-lg p-4 hover:border-[rgba(139,92,246,0.4)] transition-all'>
												<div className='flex items-start justify-between'>
													<div className='flex-1'>
														<h5 className='text-white font-semibold mb-2 flex items-center'>
															<span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-xs font-bold mr-2'>
																{module.order}
															</span>
															{module.title}
														</h5>
														<p className='text-[#C7C3D6] text-sm mb-3'>
															{module.description}
														</p>
														<div className='flex items-center space-x-2 text-sm text-[#A855F7]'>
															<svg
																className='w-4 h-4'
																fill='none'
																stroke='currentColor'
																viewBox='0 0 24 24'>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	strokeWidth={
																		2
																	}
																	d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
																/>
															</svg>
															<span>
																{module.videos
																	?.length ||
																	0}{" "}
																video(s)
															</span>
														</div>
														{module.videos &&
															module.videos
																.length > 0 && (
																<div className='mt-3 ml-8 space-y-2'>
																	{module.videos.map(
																		(
																			video,
																			vIdx,
																		) => (
																			<div
																				key={
																					vIdx
																				}
																				className='flex items-center justify-between text-sm bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.15)] p-3 rounded-lg'>
																				<div className='flex items-center space-x-3 flex-1'>
																					<span className='text-[#A855F7] font-medium'>
																						{
																							video.order
																						}
																						.
																					</span>
																					<span className='text-white'>
																						{
																							video.title
																						}
																					</span>
																				</div>
																				<button
																					type='button'
																					onClick={() =>
																						handleRemoveVideoFromModule(
																							module.order,
																							video.order,
																						)
																					}
																					className='text-[#EC4899] hover:text-white hover:bg-[rgba(236,72,153,0.2)] p-1.5 rounded transition-all'>
																					<svg
																						className='w-4 h-4'
																						fill='none'
																						stroke='currentColor'
																						viewBox='0 0 24 24'>
																						<path
																							strokeLinecap='round'
																							strokeLinejoin='round'
																							strokeWidth={
																								2
																							}
																							d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
																						/>
																					</svg>
																				</button>
																			</div>
																		),
																	)}
																</div>
															)}
													</div>
													<div className='flex space-x-2 ml-4'>
														<button
															type='button'
															onClick={() => {
																setCurrentCourseForModule(
																	module.order,
																);
																setShowAddVideoToModule(
																	true,
																);
															}}
															className='px-3 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-lg text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(59,130,246,0.3)]'>
															+ Video
														</button>
														<button
															type='button'
															onClick={() =>
																handleRemoveModule(
																	module.order,
																)
															}
															className='px-3 py-2 bg-transparent border border-[#EC4899] text-[#EC4899] hover:bg-[rgba(236,72,153,0.1)] rounded-lg text-xs font-semibold transition-all'>
															Remove
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className='text-center py-12 border-2 border-dashed border-[rgba(139,92,246,0.2)] rounded-xl'>
										<svg
											className='w-16 h-16 mx-auto text-[#9A93B5] mb-4'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={1.5}
												d='M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
											/>
										</svg>
										<p className='text-[#C7C3D6] mb-2'>
											No modules added yet
										</p>
										<p className='text-sm text-[#9A93B5]'>
											Click "Add Module" to create your
											first module
										</p>
									</div>
								)}
							</div>

							<div className='flex flex-col sm:flex-row gap-3 pt-4'>
								<button
									type='submit'
									className='flex-1 px-6 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white rounded-xl transition-all duration-300 font-bold text-lg shadow-[0_8px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_12px_32px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-100'>
									{editingCourse
										? "Update Course"
										: "Create Course"}
								</button>
								<button
									type='button'
									onClick={() => {
										setShowAddModal(false);
										setEditingCourse(null);
										resetFormData();
									}}
									className='px-6 py-4 bg-transparent border-2 border-[rgba(139,92,246,0.3)] hover:border-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] text-white rounded-xl transition-all duration-300 font-semibold'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Add Module Modal */}
			{showModuleModal && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto'>
					<div className='bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-2xl shadow-[0_8px_64px_rgba(139,92,246,0.3)] p-6 md:p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto custom-scrollbar'>
						<div className='mb-6'>
							<h3 className='text-2xl md:text-3xl font-bold text-white mb-2'>
								Add Module
							</h3>
							<p className='text-sm text-[#C7C3D6]'>
								Create a new module for your course
							</p>
						</div>
						<div className='space-y-5'>
							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Module Title{" "}
									<span className='text-[#EC4899]'>*</span>
								</label>
								<input
									type='text'
									name='title'
									value={moduleData.title}
									onChange={handleModuleInputChange}
									placeholder='e.g., Introduction to Machine Learning'
									className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
									required
								/>
							</div>
							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Description
								</label>
								<textarea
									name='description'
									value={moduleData.description}
									onChange={handleModuleInputChange}
									placeholder='Describe what students will learn in this module...'
									className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent resize-none transition-all'
									rows='4'></textarea>
								<p className='text-xs text-[#9A93B5] mt-2'>
									Provide a clear description to help students
									understand the module content
								</p>
							</div>

							<div className='flex flex-col sm:flex-row gap-3 pt-4'>
								<button
									onClick={handleAddModule}
									className='flex-1 px-6 py-4 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white rounded-xl transition-all duration-300 font-bold text-lg shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-100'>
									Create Module
								</button>
								<button
									onClick={() => {
										setShowModuleModal(false);
										setModuleData({
											title: "",
											description: "",
											order: 1,
											videos: [],
										});
									}}
									className='px-6 py-4 bg-transparent border-2 border-[rgba(139,92,246,0.3)] hover:border-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] text-white rounded-xl transition-all duration-300 font-semibold'>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Add Video to Module Modal */}
			{showAddVideoToModule && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4 overflow-y-auto'>
					<div className='bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-2xl shadow-[0_8px_64px_rgba(139,92,246,0.3)] p-6 md:p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto custom-scrollbar'>
						<div className='mb-6'>
							<h3 className='text-2xl md:text-3xl font-bold text-white mb-2'>
								Add Video to Module
							</h3>
							<p className='text-sm text-[#C7C3D6]'>
								Upload a video or provide a video URL
							</p>
						</div>
						<div className='space-y-5'>
							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Video Title{" "}
									<span className='text-[#EC4899]'>*</span>
								</label>
								<input
									type='text'
									name='title'
									value={videoData.title}
									onChange={handleVideoInputChange}
									placeholder='e.g., Introduction to the Course'
									className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
									required
								/>
							</div>
							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Description
								</label>
								<textarea
									name='description'
									value={videoData.description}
									onChange={handleVideoInputChange}
									placeholder='Describe the video content...'
									className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent resize-none transition-all'
									rows='3'></textarea>
							</div>

							{/* Video Source Selection */}
							<div className='bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)] rounded-xl p-5'>
								<label className=' text-white mb-3 text-sm font-medium flex items-center'>
									<svg
										className='w-5 h-5 mr-2 text-[#A855F7]'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
										/>
									</svg>
									Video Source{" "}
									<span className='text-[#EC4899] ml-1'>
										*
									</span>
								</label>

								{/* Toggle between Upload and URL */}
								<div className='flex gap-2 mb-4'>
									<button
										type='button'
										onClick={() =>
											setVideoData({
												...videoData,
												uploadMethod: "upload",
												url: "",
												publicId: "",
											})
										}
										className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
											(videoData.uploadMethod ||
												"upload") === "upload"
												? "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
												: "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] text-[#C7C3D6] hover:text-white"
										}`}>
										Upload Video
									</button>
									<button
										type='button'
										onClick={() =>
											setVideoData({
												...videoData,
												uploadMethod: "url",
												publicId: "",
											})
										}
										className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
											videoData.uploadMethod === "url"
												? "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
												: "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] text-[#C7C3D6] hover:text-white"
										}`}>
										Video URL
									</button>
								</div>

								{/* Video Upload or URL Input */}
								{videoData.uploadMethod === "url" ? (
									<div>
										<input
											type='url'
											placeholder='https://example.com/video.mp4 or YouTube/Vimeo URL'
											value={videoData.url || ""}
											onChange={(e) =>
												setVideoData({
													...videoData,
													url: e.target.value,
												})
											}
											className='w-full px-4 py-3 bg-[#0B0614] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all'
										/>
										<p className='text-xs text-[#9A93B5] mt-2'>
											Paste a direct video link, YouTube
											URL, or Vimeo URL
										</p>
									</div>
								) : (
									<VideoUpload
										existingVideo={videoData.url}
										onUploadSuccess={(
											uploadedVideoData,
										) => {
											setVideoData({
												...videoData,
												url: uploadedVideoData.url,
												publicId:
													uploadedVideoData.publicId,
												duration:
													uploadedVideoData.duration ||
													"",
											});
										}}
									/>
								)}
							</div>

							<div className='flex flex-col sm:flex-row gap-3 pt-4'>
								<button
									onClick={handleAddVideoToModule}
									disabled={
										!videoData.url || !videoData.title
									}
									className='flex-1 px-6 py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 font-bold text-lg shadow-[0_8px_24px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.5)] disabled:shadow-none disabled:cursor-not-allowed hover:scale-105 active:scale-100 disabled:hover:scale-100'>
									Add Video
								</button>
								<button
									onClick={() => {
										setShowAddVideoToModule(false);
										setCurrentCourseForModule(null);
										setVideoData({
											title: "",
											url: "",
											publicId: "",
											duration: "",
											description: "",
											order: 1,
										});
									}}
									className='px-6 py-4 bg-transparent border-2 border-[rgba(139,92,246,0.3)] hover:border-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] text-white rounded-xl transition-all duration-300 font-semibold'>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
