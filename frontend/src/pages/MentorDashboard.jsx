import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMentor } from "../context/MentorContext";
import toast from "react-hot-toast";
import API_URL from "../config/api";
import { useTheme } from "../context/ThemeContext";

export default function MentorDashboard() {
	const [mentorshipSessions, setMentorshipSessions] = useState([]);
	const [editingMeetingLink, setEditingMeetingLink] = useState(null);
	const [meetingLinkInput, setMeetingLinkInput] = useState("");
	const [showRescheduleModal, setShowRescheduleModal] = useState(false);
	const [rescheduleSessionId, setRescheduleSessionId] = useState(null);
	const [rescheduleData, setRescheduleData] = useState({
		newDate: "",
		newTime: "",
		reason: ""
	});
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectSessionId, setRejectSessionId] = useState(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [loading, setLoading] = useState(true);
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
	const [rejectSubmitting, setRejectSubmitting] = useState(false);
	const [completingId, setCompletingId] = useState(null);

	const { mentor, logout, isAuthenticated } = useMentor();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/mentor/login", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		if (mentor) {
			fetchMentorshipSessions();
		}
	}, [mentor]);

	const fetchMentorshipSessions = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("mentorToken");
			if (!token || !mentor) return;

			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/mentor/${mentor._id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error("Failed to fetch sessions");
			const data = await response.json();
			setMentorshipSessions(data);
		} catch (error) {
			console.error("Error fetching sessions:", error);
			toast.error("Failed to load sessions");
		} finally {
			setLoading(false);
		}
	};

	const handleAddMeetingLink = async (sessionId) => {
		try {
			const token = localStorage.getItem("mentorToken");
			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/${sessionId}/add-meet-link`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ meetingLink: meetingLinkInput }),
				}
			);

			if (!response.ok) throw new Error("Failed to update meeting link");
			const updatedSession = await response.json();
			setMentorshipSessions((prev) =>
				prev.map((s) => (s._id === sessionId ? updatedSession : s))
			);
			setEditingMeetingLink(null);
			setMeetingLinkInput("");
			toast.success("Meeting link added successfully");
		} catch (error) {
			console.error("Error adding meeting link:", error);
			toast.error("Failed to add meeting link");
		}
	};

	const handleReschedule = async () => {
		try {
			setRescheduleSubmitting(true);
			const token = localStorage.getItem("mentorToken");
			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/${rescheduleSessionId}/reschedule`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						newDate: rescheduleData.newDate,
						newTime: rescheduleData.newTime,
						reason: rescheduleData.reason,
					}),
				}
			);

			if (!response.ok) throw new Error("Failed to reschedule");
			const updatedSession = await response.json();
			setMentorshipSessions((prev) =>
				prev.map((s) => (s._id === rescheduleSessionId ? updatedSession : s))
			);
			setShowRescheduleModal(false);
			setRescheduleSessionId(null);
			setRescheduleData({ newDate: "", newTime: "", reason: "" });
			toast.success("Session rescheduled successfully");
		} catch (error) {
			console.error("Error rescheduling:", error);
			toast.error("Failed to reschedule session");
		} finally {
			setRescheduleSubmitting(false);
		}
	};

	const handleRejectSession = async () => {
		try {
			setRejectSubmitting(true);
			const token = localStorage.getItem("mentorToken");
			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/${rejectSessionId}/reject`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ reason: rejectionReason }),
				}
			);

			if (!response.ok) throw new Error("Failed to reject session");
			const updatedSession = await response.json();
			setMentorshipSessions((prev) =>
				prev.map((s) => (s._id === rejectSessionId ? updatedSession : s))
			);
			setShowRejectModal(false);
			setRejectSessionId(null);
			setRejectionReason("");
			toast.success("Session rejected");
		} catch (error) {
			console.error("Error rejecting:", error);
			toast.error("Failed to reject session");
		} finally {
			setRejectSubmitting(false);
		}
	};

	const handleCompleteSession = async (sessionId) => {
		try {
			setCompletingId(sessionId);
			const token = localStorage.getItem("mentorToken");
			const response = await fetch(
				`${API_URL}/api/mentorship-sessions/${sessionId}/complete`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error("Failed to complete session");
			const updatedSession = await response.json();
			setMentorshipSessions((prev) =>
				prev.map((s) => (s._id === sessionId ? updatedSession : s))
			);
			toast.success("Session marked as completed");
		} catch (error) {
			console.error("Error completing session:", error);
			toast.error("Failed to complete session");
		} finally {
			setCompletingId(null);
		}
	};

	const upcomingSessions = mentorshipSessions.filter((s) =>
		["upcoming", "pending", "mentor_assigned", "scheduled", "rescheduled"].includes(s.status)
	);
	const completedSessions = mentorshipSessions.filter(
		(s) => s.status === "completed"
	);
	const rejectedSessions = mentorshipSessions.filter(
		(s) => s.status === "rejected"
	);

	const handleLogout = () => {
		logout();
		navigate("/mentor/login");
	};

	if (!mentor) {
		return null;
	}

	return (
		<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]'>
			{/* Header */}
			<header className='sticky top-0 z-40 bg-[var(--nav-bg)]/95 backdrop-blur-md border-b border-[var(--border-primary)] shadow-[0_4px_16px_rgba(139,92,246,0.1)]'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between'>
					<Link 
						to='/mentor/dashboard'
						className='flex items-center space-x-3 hover:opacity-80 transition-opacity group'
					>
						<img 
							src='/yuganta-logo.png' 
							alt='yuganta AI' 
							className='w-10 h-10 transition-transform group-hover:scale-110'
						/>
						<div className='text-xl font-bold tracking-tight'>
							<span className='text-white'>Yuganta</span>
							<span className='bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent'>AI</span>
						</div>
					</Link>
					<div className='w-px h-6 bg-[rgba(139,92,246,0.2)]'></div>
					<span className='text-sm text-[#C7C3D6] font-medium'>
						Mentor Dashboard
					</span>

					<div className='flex items-center space-x-4'>
						<button
							onClick={toggleTheme}
							className='px-3 py-2 border border-[#3B82F6] rounded-lg hover:bg-[rgba(59,130,246,0.1)] transition-all duration-200 text-sm'
							aria-label='Toggle Theme'
							title={theme === "dark-theme" ? "Dark Mode" : "Light Mode"}
						>
							<span className='w-5 h-5 flex items-center justify-center'>
								{theme === "dark-theme" ? (
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										className='w-5 h-5 text-white'
										strokeWidth={2}
									>
										<circle cx='12' cy='12' r='5' fill='white' />
										<line x1='12' y1='1' x2='12' y2='4' stroke='white' />
										<line x1='12' y1='20' x2='12' y2='23' stroke='white' />
										<line x1='4.22' y1='4.22' x2='5.64' y2='5.64' stroke='white' />
										<line x1='18.36' y1='18.36' x2='19.78' y2='19.78' stroke='white' />
										<line x1='1' y1='12' x2='4' y2='12' stroke='white' />
										<line x1='20' y1='12' x2='23' y2='12' stroke='white' />
										<line x1='4.22' y1='19.78' x2='5.64' y2='18.36' stroke='white' />
										<line x1='18.36' y1='5.64' x2='19.78' y2='4.22' stroke='white' />
									</svg>
								) : (
									<svg
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 24 24'
										fill='black'
										className='w-5 h-5'
									>
										<path d='M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z' />
									</svg>
								)}
							</span>
						</button>
						<div className='flex items-center space-x-3 px-4 py-2 bg-[rgba(139,92,246,0.1)] rounded-lg border border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.15)] transition duration-300'>
							<div
								className={
									(theme === "light-theme"
										? "bg-gray-200 text-gray-800"
										: "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white") +
									" w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-[0_4px_12px_rgba(139,92,246,0.4)]"
								}
							>
								{mentor.name?.charAt(0).toUpperCase() || mentor.email?.charAt(0).toUpperCase()}
							</div>
							<div className='text-sm font-medium text-[#C7C3D6]'>{mentor.name || mentor.email}</div>
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
								{upcomingSessions.length}
							</div>
							<svg className='w-8 h-8 text-[#A855F7] opacity-50' fill='currentColor' viewBox='0 0 20 20'>
								<path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd'/>
							</svg>
						</div>
						<div className='text-[#C7C3D6] font-medium'>Upcoming Sessions</div>
					</div>
					<div className='bg-gradient-to-br from-[rgba(34,197,94,0.15)] to-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.25)] rounded-2xl p-6 text-white hover:shadow-[0_8px_32px_rgba(34,197,94,0.2)] hover:-translate-y-1 transition-all duration-300'>
						<div className='flex items-center justify-between mb-2'>
							<div className='text-3xl font-bold text-transparent bg-gradient-to-r from-[#22C55E] to-[#16A34A] bg-clip-text'>
								{completedSessions.length}
							</div>
							<svg className='w-8 h-8 text-[#22C55E] opacity-50' fill='currentColor' viewBox='0 0 20 20'>
								<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd'/>
							</svg>
						</div>
						<div className='text-[#C7C3D6] font-medium'>Completed Sessions</div>
					</div>
					<div className='bg-gradient-to-br from-[rgba(239,68,68,0.15)] to-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.25)] rounded-2xl p-6 text-white hover:shadow-[0_8px_32px_rgba(239,68,68,0.2)] hover:-translate-y-1 transition-all duration-300'>
						<div className='flex items-center justify-between mb-2'>
							<div className='text-3xl font-bold text-transparent bg-gradient-to-r from-[#EF4444] to-[#DC2626] bg-clip-text'>
								{rejectedSessions.length}
							</div>
							<svg className='w-8 h-8 text-[#EF4444] opacity-50' fill='currentColor' viewBox='0 0 20 20'>
								<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd'/>
							</svg>
						</div>
						<div className='text-[#C7C3D6] font-medium'>Rejected Sessions</div>
					</div>
				</div>

				{/* Session Management */}
				<div className='bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)]'>
					<div className='flex items-center justify-between mb-8'>
						<div>
							<h2 className='text-2xl font-bold text-white mb-1'>
								Upcoming Sessions
							</h2>
							<p className='text-[#C7C3D6] text-sm'>Manage your scheduled mentorship sessions with students</p>
						</div>
					</div>

					{/* Sessions Table */}
					{loading ? (
						<div className='text-center py-12'>
							<div className='inline-block w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin'></div>
							<p className='text-[#C7C3D6] mt-4'>Loading sessions...</p>
						</div>
					) : upcomingSessions.length === 0 ? (
														<div className='text-center py-12'>
							<svg className='w-16 h-16 mx-auto text-[#9A93B5] opacity-50 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
							</svg>
							<p className='text-[#C7C3D6] text-lg'>No upcoming sessions</p>
							<p className='text-[#9A93B5] text-sm mt-2'>Your scheduled sessions will appear here</p>
						</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='w-full text-left text-[#C7C3D6]'>
								<thead className='border-b border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)]'>
									<tr>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>Session</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>Date & Time</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>Status</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>Actions</th>
									</tr>
								</thead>
								<tbody>
									{upcomingSessions.map((session) => (
										<tr
											key={session._id}
											className='border-b border-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.05)] transition-colors duration-200'>
											<td className='py-5 px-6'>
												<div>
													<div className='font-semibold text-white mb-1'>
														{session.title}
													</div>
													{session.notes && (
														<div className='text-xs text-[#9A93B5] mt-1'>
															{session.notes.substring(0, 50)}{session.notes.length > 50 ? '...' : ''}
														</div>
													)}
												</div>
											</td>
											<td className='py-5 px-6'>
												<div className='text-white font-medium'>{session.date}</div>
												<div className='text-xs text-[#9A93B5] mt-1'>{session.time}</div>
											</td>
											<td className='py-5 px-6'>
												<span className='px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300'>
													{session.status}
												</span>
											</td>
											<td className='py-5 px-6'>
												<div className='flex flex-col space-y-2'>
													{!session.meetingLink ? (
														editingMeetingLink === session._id ? (
															<div className='flex gap-2'>
																<input
																	type='url'
																	placeholder='Meeting link (Google Meet, Zoom, etc.)'
																	value={meetingLinkInput}
																	onChange={(e) =>
																		setMeetingLinkInput(e.target.value)
																	}
																	className='flex-1 px-3 py-1.5 bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white text-sm placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7]'
																/>
																<button
																	onClick={() =>
																		handleAddMeetingLink(session._id)
																	}
																	className={
																		(theme === "light-theme"
																			? "bg-blue-600 hover:bg-blue-700 text-[#ffffff]"
																			: "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#A855F7] hover:to-[#EC4899] text-white") +
																		" px-3 py-1.5 rounded-lg transition-all duration-300 text-sm font-semibold shadow-[0_2px_8px_rgba(139,92,246,0.3)]"
																	}
																>
																	Save
																</button>
																<button
																	onClick={() => {
																		setEditingMeetingLink(null);
																		setMeetingLinkInput('');
																	}}
																	className='px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg transition text-sm'>
																	Cancel
																</button>
															</div>
														) : (
															<button
																onClick={() =>
																	setEditingMeetingLink(session._id)
																}
																className={
																	(theme === "light-theme"
																		? "bg-blue-600 hover:bg-blue-700 text-[#ffffff]"
																		: "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#A855F7] hover:to-[#EC4899] text-white") +
																	" px-4 py-2 rounded-lg transition-all duration-300 text-sm font-semibold shadow-[0_2px_8px_rgba(139,92,246,0.3)] w-full"
																}
															>
																+ Add Meeting Link
															</button>
														)
													) : (
														<a
															href={session.meetingLink}
															target='_blank'
															rel='noopener noreferrer'
															className='px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-center text-sm font-semibold'>
															Join Meeting
														</a>
													)}

													<div className='flex gap-2'>
														<button
															onClick={() => {
																setRescheduleSessionId(session._id);
																setShowRescheduleModal(true);
															}}
															disabled={rescheduleSubmitting}
															className='flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm font-medium'>
															Reschedule
														</button>

														<button
															onClick={() => {
																setRejectSessionId(session._id);
																setShowRejectModal(true);
															}}
															disabled={rejectSubmitting}
															className='flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm font-medium'>
															Reject
														</button>
													</div>

													<button
														onClick={() =>
															handleCompleteSession(session._id)
														}
														disabled={completingId === session._id}
														className='px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm font-medium'>
														Mark Complete
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

				{/* Completed Sessions */}
				{completedSessions.length > 0 && (
					<div className='bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(34,197,94,0.1)] mt-8'>
						<div className='mb-6'>
							<h2 className='text-2xl font-bold text-white mb-1'>
								Completed Sessions
							</h2>
							<p className='text-[#C7C3D6] text-sm'>Review your past mentorship sessions</p>
						</div>
						<div className='overflow-x-auto'>
							<table className='w-full text-left text-[#C7C3D6]'>
								<thead className='border-b border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)]'>
									<tr>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>Session</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>Date & Time</th>
										<th className='pb-4 px-6 text-white font-semibold text-sm uppercase tracking-wide'>Status</th>
									</tr>
								</thead>
								<tbody>
									{completedSessions.map((session) => (
										<tr
											key={session._id}
											className='border-b border-[rgba(34,197,94,0.1)] hover:bg-[rgba(34,197,94,0.05)] transition-colors duration-200'>
											<td className='py-5 px-6'>
												<div className='font-semibold text-white'>
													{session.title}
												</div>
												{session.notes && (
													<div className='text-xs text-[#9A93B5] mt-1'>
														{session.notes.substring(0, 50)}{session.notes.length > 50 ? '...' : ''}
													</div>
												)}
											</td>
											<td className='py-5 px-6'>
												<div className='text-white font-medium'>{session.date}</div>
												<div className='text-xs text-[#9A93B5] mt-1'>{session.time}</div>
											</td>
											<td className='py-5 px-6'>
												<span className='px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300'>
													Completed
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Reschedule Modal */}
				{showRescheduleModal && (
					<div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4'>
						<div className='bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-8 w-full max-w-md shadow-[0_16px_64px_rgba(139,92,246,0.3)]'>
							<h2 className='text-2xl font-bold text-white mb-6 flex items-center'>
								<svg className='w-6 h-6 mr-2 text-[#A855F7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
								</svg>
								Reschedule Session
							</h2>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-[#C7C3D6] mb-2'>New Date</label>
									<input
										type='date'
										value={rescheduleData.newDate}
										onChange={(e) =>
											setRescheduleData({
												...rescheduleData,
												newDate: e.target.value,
											})
										}
										className='w-full px-4 py-3 bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white focus:outline-none focus:border-[#A855F7] transition'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-[#C7C3D6] mb-2'>New Time</label>
									<input
										type='time'
										value={rescheduleData.newTime}
										onChange={(e) =>
											setRescheduleData({
												...rescheduleData,
												newTime: e.target.value,
											})
										}
										className='w-full px-4 py-3 bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white focus:outline-none focus:border-[#A855F7] transition'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-[#C7C3D6] mb-2'>Reason</label>
									<textarea
										placeholder='Reason for rescheduling'
										value={rescheduleData.reason}
										onChange={(e) =>
											setRescheduleData({
												...rescheduleData,
												reason: e.target.value,
											})
										}
										rows='3'
										className='w-full px-4 py-3 bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition'
									/>
								</div>
							</div>
							<div className='flex gap-3 mt-6'>
								<button
									onClick={handleReschedule}
									disabled={rescheduleSubmitting}
									className='flex-1 px-4 py-3 bg-pink-500 text-white hover:bg-pink-500 dark:bg-pink-500 rounded-lg transition font-semibold shadow-[0_4px_16px_rgba(139,92,246,0.3)]'>
									Confirm Reschedule
								</button>
								<button
									onClick={() => {
										setShowRescheduleModal(false);
										setRescheduleSessionId(null);
										setRescheduleData({
											newDate: '',
											newTime: '',
											reason: '',
										});
									}}
									className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition font-semibold'>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Reject Modal */}
				{showRejectModal && (
					<div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4'>
						<div className='bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-8 w-full max-w-md shadow-[0_16px_64px_rgba(239,68,68,0.3)]'>
							<h2 className='text-2xl font-bold text-white mb-6 flex items-center'>
								<svg className='w-6 h-6 mr-2 text-[#EF4444]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
								</svg>
								Reject Session
							</h2>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-[#C7C3D6] mb-2'>Rejection Reason</label>
									<textarea
										placeholder='Please provide a reason for rejection'
										value={rejectionReason}
										onChange={(e) => setRejectionReason(e.target.value)}
										rows='4'
										className='w-full px-4 py-3 bg-[var(--card-bg)] border border-[rgba(239,68,68,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#EF4444] transition'
									/>
								</div>
							</div>
							<div className='flex gap-3 mt-6'>
								<button
									onClick={handleRejectSession}
									disabled={rejectSubmitting}
									className='flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold shadow-[0_4px_16px_rgba(239,68,68,0.3)]'>
									Confirm Rejection
								</button>
								<button
									onClick={() => {
										setShowRejectModal(false);
										setRejectSessionId(null);
										setRejectionReason('');
									}}
									className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition font-semibold'>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
