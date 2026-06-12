import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import API_URL from "../config/api";

export default function MyLearningPage() {
	const [enrolledCourses, setEnrolledCourses] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTab, setSelectedTab] = useState("all");
	const [loading, setLoading] = useState(true);
	const { user, token, enrolledCourses: authEnrolledCourses, refreshUser } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// If AuthContext has enrolled courses available, use them immediately
		if (Array.isArray(authEnrolledCourses) && authEnrolledCourses.length > 0) {
			const courses = authEnrolledCourses
				.map(enrollment => ({
					...enrollment.courseId,
					enrollmentId: enrollment._id,
					progress: enrollment.progress,
					completed: enrollment.completed,
					enrolledAt: enrollment.enrolledAt,
					lastWatchedVideoId: enrollment.lastWatchedVideoId,
					lastWatchedTimestamp: enrollment.lastWatchedTimestamp,
					lastWatchedVideoTitle: enrollment.lastWatchedVideoTitle,
				}))
				.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

			setEnrolledCourses(courses);
			setLoading(false);
			return;
		}

		if (user && token) {
			fetchEnrolledCourses();
		}
	}, [user, token, authEnrolledCourses]);

	const fetchEnrolledCourses = async () => {
		try {
			// Fetch only the logged-in user's enrolled courses
			const response = await fetch(`${API_URL}/api/users/enrolled`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.status === 401) {
				toast.error("Session expired. Please login again");
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				navigate("/login");
				return;
			}

			const data = await response.json();

			// Extract course data from enrollment objects
			const courses = data
				.map(enrollment => ({
					...enrollment.courseId,
					enrollmentId: enrollment._id,
					progress: enrollment.progress,
					completed: enrollment.completed,
					enrolledAt: enrollment.enrolledAt,
					lastWatchedVideoId: enrollment.lastWatchedVideoId,
					lastWatchedTimestamp: enrollment.lastWatchedTimestamp,
					lastWatchedVideoTitle: enrollment.lastWatchedVideoTitle,
				}))
				.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

			setEnrolledCourses(courses);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching courses:", error);
			setLoading(false);
		}
	};

	const featuredCourse = enrolledCourses[0];

	// Calculate total hours and courses for each learning path
	const calculateCourseStats = (course) => {
		const totalVideos = course.modules?.reduce(
			(sum, m) => sum + (m.videos?.length || 0),
			0
		) || 0;
		const totalHours = course.duration || "30 Hours";
		return { totalVideos, totalHours };
	};

	// Calculate progress for a course
	const calculateProgress = (course) => {
		// Use actual progress from enrollment data if available
		return course.progress || 0;
	};

	// Helper to get the correct course thumbnail
	const getCourseThumbnail = (course) => {
		return course?.thumbnail;
	};

	// Filter courses based on search and selected tab
	const getFilteredCourses = () => {
		const query = searchQuery.toLowerCase().trim();

		// First filter by selected tab
		let list = enrolledCourses;
		if (selectedTab !== "all") {
			list = list.filter((course) => {
				const progress = course.progress || 0;
				if (selectedTab === "completed") return course.completed === true;
				if (selectedTab === "in-progress") return !course.completed && progress > 0;
				if (selectedTab === "yet-to-start") return progress === 0;
				return true;
			});
		}

		// Then filter by search query (only within enrolled courses)
		if (query) {
			list = list.filter(course => {
				const title = (course.title || "").toLowerCase();
				return title.includes(query);
			});
		}

		return list;
	};

	const filteredCourses = getFilteredCourses();

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-20 transition-colors duration-300'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
				{/* Welcome & Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
					<div>
						<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-[var(--text-primary)]">
							Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-blue-500">{user?.fullName?.split(' ')[0] || 'Learner'}</span> 👋
						</h1>
						<p className="text-gray-400 text-lg">Ready to conquer your next milestone?</p>
					</div>
					
					{/* Search */}
					<div className="relative w-full md:w-80 group">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<svg className="w-5 h-5 text-gray-500 group-focus-within:text-[#00BCD4] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type='text'
							placeholder='Search your programs...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full bg-[var(--card-bg)] border border-gray-800/60 focus:border-[#00BCD4]/50 focus:ring-1 focus:ring-[#00BCD4]/50 rounded-2xl pl-11 pr-4 py-3 text-sm transition-all shadow-sm outline-none text-[var(--text-primary)] placeholder-gray-500'
						/>
					</div>
				</div>

				{/* Filters/Tabs */}
				<div className="flex space-x-3 mb-10 overflow-x-auto pb-2 custom-scrollbar">
					{[
						{ id: 'all', label: 'All Programs' },
						{ id: 'in-progress', label: 'In Progress' },
						{ id: 'yet-to-start', label: 'Yet to Start' },
						{ id: 'completed', label: 'Completed' }
					].map(tab => (
						<button
							key={tab.id}
							onClick={() => setSelectedTab(tab.id)}
							className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap border ${
								selectedTab === tab.id 
									? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] shadow-md' 
									: 'bg-[var(--card-bg)] border-gray-800/60 text-gray-400 hover:text-[var(--text-primary)] hover:border-gray-600/80 hover:bg-gray-800/20'
							}`}>
							{tab.label}
						</button>
					))}
				</div>

				{/* Featured Continue Learning (Only on 'All' tab and no search) */}
				{featuredCourse && !searchQuery && selectedTab === 'all' && featuredCourse.progress > 0 && !featuredCourse.completed && (
					<div className="mb-12">
						<h2 className="text-lg font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
							<svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							Jump Back In
						</h2>
						<div className="bg-[var(--card-bg)] rounded-3xl border border-gray-800/60 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-gray-700/80 transition-colors flex flex-col md:flex-row group relative">
							<div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
								{getCourseThumbnail(featuredCourse) ? (
									<img src={getCourseThumbnail(featuredCourse)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={featuredCourse.title} />
								) : (
									<div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
										<div className="text-5xl">🎓</div>
									</div>
								)}
								<div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 md:from-black/90 to-transparent md:to-black/30 pointer-events-none" />
							</div>
							
							<div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center relative bg-[var(--card-bg)]/50 backdrop-blur-xl">
								<div className="flex items-center justify-between mb-3">
									<span className="text-xs font-bold tracking-wider uppercase text-[#00BCD4]">Continue Learning</span>
									<span className="text-sm font-bold text-gray-300">{calculateProgress(featuredCourse)}%</span>
								</div>
								
								<h3 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-2 line-clamp-2">{featuredCourse.title}</h3>
								
								{featuredCourse.lastWatchedVideoTitle && (
									<p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse"></span>
										Up next: <span className="text-gray-300 font-medium truncate">{featuredCourse.lastWatchedVideoTitle}</span>
									</p>
								)}
								
								<div className="w-full bg-gray-800/60 rounded-full h-1.5 mb-6 overflow-hidden">
									<div className="h-full bg-gradient-to-r from-[#00BCD4] to-blue-500 rounded-full relative" style={{ width: `${calculateProgress(featuredCourse)}%` }}>
										<div className="absolute inset-0 bg-white/20 w-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
									</div>
								</div>
								
								<div className="flex items-center gap-4 mt-auto">
									<Link to={`/courses/${featuredCourse._id}${featuredCourse.lastWatchedVideoId ? "?resume=true" : ""}`} className="px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
										Resume <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
									</Link>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'>
					{filteredCourses.length > 0 ? (
						filteredCourses.map((course) => {
							const progress = calculateProgress(course);
							const stats = calculateCourseStats(course);
							return (
								<Link
									key={course._id}
									to={`/courses/${course._id}${course.lastWatchedVideoId ? "?resume=true" : ""}`}
									className='group flex flex-col bg-[var(--card-bg)] rounded-[24px] border border-gray-800/50 overflow-hidden hover:border-[#00BCD4]/40 hover:shadow-[0_12px_40px_rgba(0,188,212,0.15)] transition-all duration-300 transform hover:-translate-y-1'>
									
									<div className="relative h-48 sm:h-52 overflow-hidden bg-gray-900">
										{getCourseThumbnail(course) ? (
											<img src={getCourseThumbnail(course)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={course.title} />
										) : (
											<div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
												<span className="text-4xl opacity-50">📚</span>
											</div>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
										
										{/* Status Badge */}
										{course.completed ? (
											<div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
												<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Completed
											</div>
										) : progress === 0 ? (
											<div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md text-gray-100 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-gray-700/50">
												Not Started
											</div>
										) : (
											<div className="absolute top-4 left-4 bg-[#00BCD4]/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-lg">
												In Progress
											</div>
										)}

										{/* Progress Bar inside image bottom */}
										<div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-900/50 backdrop-blur-sm">
											<div className="h-full bg-gradient-to-r from-[#00BCD4] to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
										</div>
									</div>
									
									<div className="p-5 flex flex-col flex-1">
										<h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-[#00BCD4] transition-colors">{course.title}</h3>
										
										<div className="flex items-center gap-3 text-xs text-gray-400 font-medium mb-4">
											<span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> {stats.totalVideos} Videos</span>
											<span className="w-1 h-1 rounded-full bg-gray-600"></span>
											<span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> {stats.totalHours}</span>
										</div>

										<div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/40">
											<div className="flex flex-col">
												<span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Overall Progress</span>
												<span className="text-sm font-extrabold text-[var(--text-primary)]">{progress}%</span>
											</div>
											
											<div className="w-10 h-10 rounded-full bg-gray-800/80 border border-gray-700/50 flex items-center justify-center text-gray-300 group-hover:bg-[#00BCD4] group-hover:border-[#00BCD4] group-hover:text-white transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(0,188,212,0.4)]">
												<svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
													<path d="M4 4l12 6-12 6z" />
												</svg>
											</div>
										</div>
									</div>
								</Link>
							);
						})
					) : (
						<div className='col-span-full py-20 text-center bg-[var(--card-bg)] rounded-3xl border border-dashed border-gray-800/60'>
							<div className='w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6'>
								<svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
							</div>
							<h3 className='text-2xl font-bold mb-2 text-[var(--text-primary)]'>
								{searchQuery ? "No matching programs found" : "Your learning journey awaits"}
							</h3>
							<p className='text-gray-400 max-w-md mx-auto mb-8'>
								{searchQuery
									? `We couldn't find any enrolled programs matching "${searchQuery}". Try a different keyword.`
									: "You haven't enrolled in any programs yet. Discover our world-class curriculum and start learning today."}
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
								{searchQuery ? (
									<button onClick={() => setSearchQuery("")} className='px-8 py-3 bg-gray-800 text-[var(--text-primary)] rounded-xl font-bold hover:bg-gray-700 transition'>
										Clear Search
									</button>
								) : (
									<Link to='/courses' className='px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-bold hover:opacity-90 transition shadow-lg'>
										Browse Catalog
									</Link>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

