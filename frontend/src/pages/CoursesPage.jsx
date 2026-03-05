import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";

export default function CoursesPage() {
	const [selectedTab, setSelectedTab] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [courses, setCourses] = useState([]);
	const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [enrolling, setEnrolling] = useState({});
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		fetchCourses();
		if (isAuthenticated) {
			fetchEnrolledCourses();
		}
	}, [isAuthenticated]);

	const fetchCourses = async () => {
		try {
			const response = await fetch(`${API_URL}/api/courses`);
			const data = await response.json();
			setCourses(data);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching courses:", error);
			setLoading(false);
		}
	};

	const fetchEnrolledCourses = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await fetch(`${API_URL}/api/users/enrolled`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.status === 401) {
				return; // Token expired, user needs to login
			}

			if (response.ok) {
				const data = await response.json();
				// Extract course IDs from enrolled courses
				const enrolledIds = data.map((enrollment) => enrollment.courseId?._id || enrollment._id);
				setEnrolledCourseIds(enrolledIds);
			}
		} catch (error) {
			console.error("Error fetching enrolled courses:", error);
		}
	};

	const handleEnroll = async (courseId) => {
		if (!isAuthenticated) {
			toast.error("Please login to enroll in courses");
			navigate("/login");
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) {
			toast.error("Please login to enroll in courses");
			navigate("/login");
			return;
		}

		setEnrolling({ ...enrolling, [courseId]: true });

		try {
			const response = await fetch(
				`${API_URL}/api/users/enroll/${courseId}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const data = await response.json();

			if (response.ok) {
				toast.success("Successfully enrolled in course!");
				// Update enrolled courses list
				setEnrolledCourseIds([...enrolledCourseIds, courseId]);
				setTimeout(() => navigate("/my-learning"), 1000);
			} else {
				if (response.status === 401 || data.message === "Please login") {
					toast.error("Session expired. Please login again");
					localStorage.removeItem("token");
					localStorage.removeItem("user");
					setTimeout(() => navigate("/login"), 1500);
				} else {
					toast.error(data.message || "Enrollment failed");
				}
			}
		} catch (error) {
			console.error("Error enrolling:", error);
			toast.error("Error enrolling in course");
		} finally {
			setEnrolling({ ...enrolling, [courseId]: false });
		}
	};

	// Filter courses based on search query
	const filteredCourses = courses.filter((course) =>
		course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(course.instructor && course.instructor.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Animated images for the slider
	const sliderImages = [
		"https://images.unsplash.com/photo-1551434678-e076c223a692?w=400",
		"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
		"https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400",
		"https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400",
		"https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400",
	];

	return (
		<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-20 transition-colors duration-300'>
			{/* Hero Section */}
			<section className='px-4 md:px-6 py-12 md:py-16 relative overflow-hidden'>
				<div className='max-w-7xl mx-auto'>
					<div className='flex flex-col lg:flex-row items-center justify-between gap-12'>
						{/* Left Content */}
						<div className='flex-1'>
							<h1 className='text-4xl md:text-6xl font-bold mb-6'>
								<span className='bg-gradient-to-r from-[#2373f3] via-[#549ffb] to-[#6caffb] bg-clip-text text-transparent'>
									Courses
								</span>
							</h1>

							<p className='text-gray-500 text-lg mb-12 max-w-xl'>
								Kickstart your AI career with foundational
								tracks and skill-specific short courses, all
								taught by leading experts in the field.
							</p>

							{/* Statistics */}
							<div className='flex flex-wrap gap-6 md:gap-12 mb-12'>
								<div>
									<div className='text-3xl md:text-4xl font-bold mb-2'>
										100+
									</div>
									<div className='text-gray-400'>
										Enrollments
									</div>
								</div>
								<div>
									<div className='text-4xl font-bold mb-2'>
										4.1
									</div>
									<div className='text-gray-400'>
										Average Rating
									</div>
								</div>
								<div>
									<div className='text-4xl font-bold mb-2'>
										5+
									</div>
									<div className='text-gray-400'>Courses</div>
								</div>
							</div>
						</div>

						{/* Right Side - Animated Image Grid */}
						<div className='flex-1 relative h-[300px] md:h-[500px] w-full max-w-lg'>
							<ImageSlider images={sliderImages} />
						</div>
					</div>
				</div>
			</section>

			{/* Search and Filters Section */}
			<section className='px-4 md:px-6 py-8'>
				<div className='max-w-7xl mx-auto'>
					{/* Search Bar */}
					<div className='mb-6'>
						<div className='relative max-w-md'>
							<input
								type='text'
								placeholder='Search Course'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 pl-10 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300'
							/>
							<svg
								className='absolute left-3 top-3.5 w-5 h-5 text-gray-500'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
								/>
							</svg>
						</div>
					</div>

					{/* Tabs */}
					<div className='flex flex-wrap space-x-4 md:space-x-8 mb-8 border-b border-[rgba(139,92,246,0.2)]'>
						<button
							onClick={() => setSelectedTab("all")}
							className={`pb-3 px-2 font-medium transition ${selectedTab === "all"
								? "text-[var(--text-color)] border-b-2 border-[#8B5CF6]"
								: "text-[var(--text-muted)] hover:text-[var(--text-color)]"
								}`}>
							All
						</button>
						<button
							onClick={() => setSelectedTab("courses")}
							className={`pb-3 px-2 font-medium transition ${selectedTab === "courses"
								? "text-[var(--text-color)] border-b-2 border-[#8B5CF6]"
								: "text-[var(--text-muted)] hover:text-[var(--text-color)]"
								}`}>
							Courses
						</button>
						<button
							onClick={() => setSelectedTab("learning-path")}
							className={`pb-3 px-2 font-medium transition ${selectedTab === "learning-path"
								? "text-[var(--text-color)] border-b-2 border-[#8B5CF6]"
								: "text-[var(--text-muted)] hover:text-[var(--text-color)]"
								}`}>
							Learning Path
						</button>
					</div>

					{/* Courses Grid with Sidebar */}
					<div className='flex flex-col lg:flex-row gap-8'>
						{/* Sidebar Filters */}
						<aside className='lg:w-64 flex-shrink-0'>
							<div className='bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-lg p-4 md:p-6 transition-colors duration-300'>
								<div className='flex justify-between items-center mb-6'>
									<h3 className='font-semibold text-lg'>
										All Filters
									</h3>
									<button className='text-[#A855F7] text-sm hover:text-[#EC4899] transition duration-300'>
										Clear All
									</button>
								</div>

								<div className='mb-6'>
									<h4 className='font-medium mb-3'>
										Sort By
									</h4>
									<div className='space-y-2'>
										<label className='flex items-center'>
											<input
												type='radio'
												name='sort'
												className='mr-2'
												defaultChecked
											/>
											<span className='text-sm'>All</span>
										</label>
										<label className='flex items-center'>
											<input
												type='radio'
												name='sort'
												className='mr-2'
											/>
											<span className='text-sm'>
												Most Popular
											</span>
										</label>
										<label className='flex items-center'>
											<input
												type='radio'
												name='sort'
												className='mr-2'
											/>
											<span className='text-sm'>
												Highest Rated
											</span>
										</label>
									</div>
								</div>
							</div>
						</aside>

						{/* Courses Grid */}
						<div className='flex-1'>
							{loading ? (
								<div className='text-center py-12'>
									<div className='text-white text-lg'>Loading courses...</div>
								</div>
							) : filteredCourses.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
									<div className="relative w-40 h-40 mb-6">
										<div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-ping"></div>
										<div className="relative z-10 w-full h-full bg-[var(--card-bg)] border-2 border-purple-500/50 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 transition-colors duration-300">
											<svg className="w-20 h-20 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
											</svg>
										</div>
									</div>
									<h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-3">No Courses Found</h3>
									<p className="text-gray-400 text-lg max-w-md mx-auto">
										We are currently updating our course catalog. Please check back later for new exciting content!
									</p>
								</div>
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
									{filteredCourses.map((course) => (
										<div
											key={course._id}
											className='bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg overflow-hidden hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)] hover:border-[rgba(139,92,246,0.4)] transition-all duration-300 group'>
											{/* Video/Thumbnail Section */}
											<div className='relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900'>
												{course.videoUrl ? (
													<video
														className='w-full h-full object-cover'
														muted
														loop
														playsInline
														onMouseEnter={(e) => e.target.play()}
														onMouseLeave={(e) => {
															e.target.pause();
															e.target.currentTime = 0;
														}}>
														<source src={course.videoUrl} type='video/mp4' />
													</video>
												) : course.thumbnail ? (
													<img
														src={course.thumbnail}
														alt={course.title}
														className='w-full h-full object-cover'
													/>
												) : (
													<div className='w-full h-full flex items-center justify-center text-6xl'>
														📚
													</div>
												)}
												{/* Duration Badge */}
												<div className='absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs'>
													{course.duration || "Self-paced"}
												</div>
											</div>

											{/* Course Info */}
											<div className='p-5'>
												{/* Duration and Lessons */}
												<div className='flex items-center gap-4 text-gray-400 text-sm mb-3'>
													<span>{course.duration || "Self-paced"}</span>
													<span>•</span>
													<span>{course.modules?.length || course.lessons || 0} Lessons</span>
												</div>

												{/* Title */}
												<Link to={`/course-details/${course._id}`}>
													<h3 className='font-bold text-lg mb-3 text-[var(--text-color)] line-clamp-2 min-h-[3.5rem] hover:text-[#A855F7] transition-colors'>
														{course.title}
													</h3>
												</Link>

												{/* Rating and Students */}
												<div className='flex items-center justify-between mb-4'>
													<div className='flex items-center gap-2 text-sm'>
														<span className='text-gray-400'>👤</span>
														<span className='text-gray-300'>{course.students || 0}</span>
													</div>
													<div className='flex items-center gap-1'>
														<span className='text-yellow-400'>★</span>
														<span className='text-gray-300 text-sm'>
															{course.rating ? course.rating.toFixed(1) : '4.5'}
														</span>
													</div>
												</div>

												{/* Enroll Button */}
												{(() => {
													const isEnrolled = enrolledCourseIds.includes(course._id);
													return (
														<Link
															to={isEnrolled ? "/my-learning" : `/course-details/${course._id}`}
															className={`block w-full text-center py-3 rounded-lg font-semibold transition duration-300 ${
																isEnrolled
																	? "bg-blue-500 text-white hover:bg-blue-600"
																	: "border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white"
															}`}
														>
															{isEnrolled ? "Resume Learning" : "View Roadmap"}
														</Link>
													);
												})()}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
// Image Slider Component with Animation
function ImageSlider({ images }) {
	const [positions, setPositions] = useState(() =>
		images.map((_, index) => ({
			x: Math.random() * 60,
			y: Math.random() * 60,
			rotation: Math.random() * 20 - 10,
			scale: 0.8 + Math.random() * 0.4,
			delay: index * 0.2,
		}))
	);

	useEffect(() => {
		// Animate positions
		const interval = setInterval(() => {
			setPositions((prev) =>
				prev.map((pos) => ({
					...pos,
					x: Math.random() * 60,
					y: Math.random() * 60,
					rotation: Math.random() * 20 - 10,
				}))
			);
		}, 3000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className='relative w-full h-full'>
			{images.map((img, index) => (
				<div
					key={index}
					className='absolute w-48 h-32 rounded-lg overflow-hidden shadow-2xl transition-all duration-1000 ease-in-out'
					style={{
						left: `${positions[index]?.x || 0}%`,
						top: `${positions[index]?.y || 0}%`,
						transform: `rotate(${positions[index]?.rotation || 0
							}deg) scale(${positions[index]?.scale || 1})`,
						transitionDelay: `${positions[index]?.delay || 0}s`,
						zIndex: index,
					}}>
					<img
						src={img}
						alt={`Course ${index + 1}`}
						className='w-full h-full object-cover'
					/>
				</div>
			))}
		</div>
	);
}
