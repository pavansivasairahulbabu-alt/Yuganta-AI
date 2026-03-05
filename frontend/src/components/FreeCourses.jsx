import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import API_URL from "../config/api";

export default function FreeCourses() {
	const [headerRef, headerVisible] = useScrollAnimation();
	const navigate = useNavigate();
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchCourses();
	}, []);

	const fetchCourses = async () => {
		try {
			const response = await fetch(`${API_URL}/api/courses`);
			if (response.ok) {
				const data = await response.json();
				setCourses(data);
			}
		} catch (error) {
			console.error("Error fetching courses:", error);
		} finally {
			setLoading(false);
		}
	};

	const getCourseIcon = (category) => {
		const icons = {
			"AI & ML": "🤖",
			"Data Science": "📊",
			"Web Development": "💻",
			"Mobile Development": "📱",
			Design: "🎨",
			Business: "💼",
		};
		return icons[category] || "📚";
	};

	return (
		<section
			id='free-courses'
			className='py-12 md:py-24 px-4 md:px-6 bg-[var(--bg-color)] text-[var(--text-color)] relative overflow-hidden transition-colors duration-300'>
			{/* Decorative background elements with animation */}
			<div className='absolute top-0 left-0 w-96 h-96 bg-[#8B5CF6] opacity-5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 animate-[float_6s_ease-in-out_infinite]'></div>
			<div className='absolute bottom-0 right-0 w-96 h-96 bg-[#EC4899] opacity-5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 animate-[float_8s_ease-in-out_infinite_2s]'></div>

			{/* Animated moving objects */}
			<div className='absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] opacity-10 rounded-full blur-2xl animate-[pulse_4s_ease-in-out_infinite]'></div>
			<div className='absolute top-1/3 right-20 w-28 h-28 bg-gradient-to-br from-[#F59E0B] to-[#D97706] opacity-8 rounded-full blur-3xl animate-[float_7s_ease-in-out_infinite]'></div>
			<div className='absolute bottom-1/3 left-1/4 w-24 h-24 bg-gradient-to-br from-[#10B981] to-[#059669] opacity-10 rounded-full blur-2xl animate-[pulse_5s_ease-in-out_infinite_1s]'></div>
			<div className='absolute bottom-20 right-1/4 w-32 h-32 bg-gradient-to-br from-[#EF4444] to-[#DC2626] opacity-8 rounded-full blur-3xl animate-[float_9s_ease-in-out_infinite_3s]'></div>
			<div className='absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] opacity-12 rounded-full blur-xl animate-[pulse_6s_ease-in-out_infinite_2s]'></div>

			<div className='max-w-7xl mx-auto relative z-10'>
				{loading ? (
					<div className='text-center py-12'>
						<div className='text-white text-lg'>Loading courses...</div>
					</div>
				) : courses.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
						<div className="relative w-40 h-40 mb-6">
							<div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-ping"></div>
							<div className="relative z-10 w-full h-full bg-[var(--card-bg)] border-2 border-purple-500/50 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 transition-colors duration-300">
								<svg className="w-20 h-20 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
								</svg>
							</div>
						</div>
						<h3 className="text-3xl font-bold bg-gradient-to-r from-[var(--text-color)] to-[var(--text-muted)] bg-clip-text text-transparent mb-3">No Courses Found</h3>
						<p className="text-gray-400 text-lg max-w-md mx-auto">
							We are currently updating our course catalog. Please check back later for new exciting content!
						</p>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
						{courses.map((course, idx) => (
							<div
								key={course.id || course._id}
								className={`bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl shadow-[0_8px_32px_rgba(139,92,246,0.15)] overflow-hidden hover:shadow-[0_16px_48px_rgba(139,92,246,0.3)] hover:-translate-y-2 transition-all duration-300 group ${idx === 0
									? 'animate-stagger-1'
									: idx === 1
										? 'animate-stagger-2'
										: 'animate-stagger-3'
									}`}>
								{/* Course Image/Icon */}
								<div className='bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 h-40 md:h-48 flex items-center justify-center text-5xl md:text-6xl relative border-b border-[rgba(139,92,246,0.1)]'>
									{course.thumbnail ? (
										<img
											src={course.thumbnail}
											alt={course.title}
											className='w-full h-full object-cover'
										/>
									) : (
										<span>{getCourseIcon(course.category || "AI & ML")}</span>
									)}
								</div>

								{/* Course Content */}
								<div className='p-4 md:p-6'>
									<div className='flex items-center justify-between mb-3'>
										<span className='text-xs md:text-sm text-[#9A93B5]'>
											{course.duration || "Self-paced"}
										</span>
									</div>

									<h3 className='text-lg md:text-xl font-bold mb-2 text-[var(--text-color)] min-h-[50px] md:min-h-[60px] group-hover:text-[#A855F7] transition-colors duration-300'>
										{course.title}
									</h3>

									<p className='text-sm text-[var(--text-muted)] mb-3'>
										by {course.instructor || "Yuganta AI Team"}
									</p>

									<div className='flex items-center justify-between mb-4'>
										<div className='flex items-center text-[var(--text-muted)]'>
											<div className='flex text-[#EC4899] mr-2'>
												{"★".repeat(Math.round(course.rating || 4.5))}
												{"☆".repeat(5 - Math.round(course.rating || 4.5))}
											</div>
											<span className='text-sm'>
												({course.rating ? course.rating.toFixed(1) : '4.5'})
											</span>
										</div>
										<span className='text-xs text-[#9A93B5]'>
											{course.students || 0} Students
										</span>
									</div>

									{/* Roadmap Button */}
									<button
										onClick={(e) => {
											e.stopPropagation();
											navigate(`/course-details/${course._id}`);
										}}
										className='w-full px-4 py-2 rounded-xl font-semibold transition-all duration-200 border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white'>
										View Roadmap
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
