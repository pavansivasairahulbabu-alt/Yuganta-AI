import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import LeadCaptureForm from "../components/LeadCaptureForm";
import CoursesNavbar from "../components/CoursesNavbar";
import API_URL from "../config/api";

export default function CourseDetailsPage() {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const [showLeadForm, setShowLeadForm] = useState(false);
	const [leadType, setLeadType] = useState("Brochure"); // "Brochure" or "Enrollment"
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCourse = async () => {
			try {
				const response = await fetch(
					`${API_URL}/api/courses/${courseId}`,
				);
				if (response.ok) {
					const data = await response.json();
					setCourse(data);
				} else {
					console.error("Course not found");
					toast.error("Course not found");
				}
			} catch (error) {
				console.error("Error fetching course:", error);
				toast.error("Error loading course details");
			} finally {
				setLoading(false);
			}
		};

		if (courseId) {
			fetchCourse();
		}
	}, [courseId]);

	const handleAction = (type) => {
		setLeadType(type);
		setShowLeadForm(true);
	};

	const handleDownload = () => {
		if (course && course.brochureLink) {
			// Trim whitespace to avoid empty link issues
			let linkUrl = course.brochureLink.trim();

			if (!linkUrl) {
				toast.error("Brochure link is empty. Please contact support.");
				return;
			}

			// Create a clean, professional filename from course title
			const cleanFileName = course.title
				? course.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
				: 'Course_Brochure';

			// For Cloudinary URLs, add download parameter to URL for better browser handling
			if (linkUrl.includes('cloudinary.com') && linkUrl.toLowerCase().endsWith('.pdf')) {
				// Remove fl_attachment if it exists
				linkUrl = linkUrl.replace('/fl_attachment/', '/');
				linkUrl = linkUrl.replace('fl_attachment/', '');

				// Ensure it uses /raw/upload/ for PDF files, not /image/upload/
				if (linkUrl.includes('/image/upload/')) {
					linkUrl = linkUrl.replace('/image/upload/', '/raw/upload/');
				}

				// Add download flag with custom filename to the URL
				if (!linkUrl.includes('?')) {
					linkUrl += `?attachment=true&filename=${cleanFileName}.pdf`;
				}
			}

			// Use fetch to download with custom filename
			fetch(linkUrl)
				.then(response => response.blob())
				.then(blob => {
					const url = window.URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = `${cleanFileName}.pdf`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					window.URL.revokeObjectURL(url);
					toast.success("Download started!");
				})
				.catch(error => {
					console.error("Download error:", error);
					// Fallback to direct link
					const link = document.createElement("a");
					link.href = linkUrl;
					link.download = `${cleanFileName}.pdf`;
					link.target = "_blank";
					link.rel = "noopener noreferrer";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				});
		} else {
			// Fallback if no link provided
			toast.error("Brochure has not been added yet.");
		}
	};

	if (loading) {
		return (
			<>
				<CoursesNavbar />
				<div className='min-h-screen bg-[var(--bg-color)] flex items-center justify-center text-[var(--text-color)] transition-colors duration-300'>
					Loading...
				</div>
			</>
		);
	}

	if (!course) {
		return (
			<>
				<CoursesNavbar />
				<div className='min-h-screen bg-[var(--bg-color)] flex items-center justify-center text-[var(--text-color)] transition-colors duration-300'>
					Course not found
				</div>
			</>
		);
	}


	return (
		<>
			<CoursesNavbar />
			<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300'>
				{/* Fixed Back Button */}
				<div className='fixed top-24 left-4 z-30'>
					<button
						onClick={() => navigate("/courses")}
						className='flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-color)] bg-[var(--card-bg)]/90 backdrop-blur-md px-4 py-2 rounded-lg border border-[var(--border-color)] transition-all group'>
						<span className='group-hover:-translate-x-1 transition-transform'>
							←
						</span>
						Back to Courses
					</button>
				</div>

				{/* Hero Section */}
				<section className='relative overflow-hidden py-20 px-4 pt-32 bg-[var(--card-bg)] border-b border-[var(--border-color)]'>
					<div className='max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
						<div>
							<div className='inline-block px-3 py-1 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-medium text-blue-600'>
								{course.level || "All Levels"} Program
							</div>
							<h1 className='text-5xl md:text-6xl font-bold leading-tight mb-6 text-[var(--text-color)]'>
								{course.title}
							</h1>
							<p className='text-xl text-[var(--text-muted)] mb-8 max-w-lg'>
								{course.description.substring(0, 150)}...
							</p>

							<div className='flex flex-wrap gap-4 mb-8 text-[var(--text-muted)]'>
								<div className='flex items-center gap-2'>
									<span className='text-blue-500'>★</span>
								{course.rating > 0
									? `${course.rating} Ratings`
									: "Not released yet"}
							</div>
								<div className='flex items-center gap-2'>
									<span className='text-blue-500'>👥</span>
								{course.students > 0
									? `${course.students} Enrolled`
									: "Not released yet"}
							</div>
								<div className='flex items-center gap-2'>
									<span className='text-blue-500'>🕒</span>{" "}
								{course.duration || "Self-Paced"}
							</div>
						</div>

						<div className='flex flex-col sm:flex-row gap-4'>
							<button
								onClick={() => handleAction("Enrollment")}
									className='bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all'>
								Enroll Now
							</button>
							<button
								onClick={() => handleAction("Brochure")}
									className='bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all'>
								Download Brochure
							</button>
						</div>
					</div>

					{/* Stats Card / Graphics */}
					<div className='relative hidden lg:block'>
						<div className='bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border-color)] relative z-10 text-center transition-all duration-300'>
							<div className='relative rounded-2xl overflow-hidden mb-6 shadow-lg group'>
								{course.thumbnail && course.thumbnail.trim() ? (
									<>
										<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'></div>
										<img
											src={course.thumbnail}
											alt={course.title}
											className='w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500'
											onError={(e) => {
												e.target.style.display = "none";
												const fallback =
													document.createElement(
														"div",
													);
												fallback.className =
													"w-full h-64 bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center text-6xl border border-white/10";
												fallback.textContent = "📚";
												e.target.parentNode.appendChild(
													fallback,
												);
											}}
										/>
									</>
								) : (
									<div className='w-full h-64 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center text-6xl border border-[var(--border-color)]'>
										📚
									</div>
								)}
							</div>

							<h3 className='text-2xl font-bold mb-6 text-[var(--text-color)]'>
								Program Highlights
							</h3>
							<ul className='space-y-4 text-left mb-6'>
								<li className='flex items-center gap-4 text-[var(--text-muted)]'>
									<span className='flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500'>
										✓
									</span>
									<span>
										{course.modules?.length || 0}{" "}
										Comprehensive Modules
									</span>
								</li>
								<li className='flex items-center gap-4 text-[var(--text-muted)]'>
									<span className='flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500'>
										✓
									</span>
									<span>
										Industry Recognized Certification
									</span>
								</li>
								<li className='flex items-center gap-4 text-[var(--text-muted)]'>
									<span className='flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500'>
										✓
									</span>
									<span>
										{course.instructor
											? `Mentored by ${course.instructor}`
											: "Expert Mentorship"}
									</span>
								</li>
							</ul>
						</div>

						{/* Decorative blobs */}
						<div className='absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]'></div>
						<div className='absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]'></div>
					</div>
				</div>
			</section>

			{/* Description Section */}
			<section className='py-20 px-4 bg-[var(--bg-color)] transition-colors duration-300'>
				<div className='max-w-4xl mx-auto'>
					<h2 className='text-3xl font-bold mb-8 text-center text-[var(--text-color)]'>
						About the Program
					</h2>
					<div className='text-lg text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap'>
						{course.description}
					</div>

					{/* Modules Preview */}
					{course.modules && course.modules.length > 0 && (
						<div className='mt-16'>
							<h3 className='text-2xl font-bold mb-8 text-center text-[var(--text-color)]'>
								Curriculum
							</h3>
							<div className='space-y-4'>
								{course.modules.map((module, idx) => (
									<div
										key={idx}
										className='bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-xl transition-colors'>
										<div className='flex items-center gap-4'>
											<span className='bg-blue-500/10 text-blue-500 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold'>
												{idx + 1}
											</span>
											<div>
												<h4 className='font-bold text-[var(--text-color)] text-lg'>
													{module.title}
												</h4>
												{module.description && (
													<p className='text-[var(--text-muted)] text-sm mt-1'>
														{module.description}
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</section>

			{/* Sticky Bottom Bar for Mobile */}
			<div className='md:hidden fixed bottom-0 left-0 w-full bg-[var(--card-bg)]/95 backdrop-blur-lg border-t border-[var(--border-color)] p-4 z-40 flex gap-2'>
				<button
					onClick={() => handleAction("Enrollment")}
					className='flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold'>
					Enroll Now
				</button>
				<button
					onClick={() => handleAction("Brochure")}
					className='flex-1 bg-transparent border border-blue-500 text-blue-500 py-3 rounded-lg font-bold'>
					Brochure
				</button>
			</div>

			{/* Modal */}
			{showLeadForm && (
				<LeadCaptureForm
					courseId={courseId}
					courseName={course.title}
					type={leadType}
					onClose={() => setShowLeadForm(false)}
					onDownload={handleDownload}
				/>
			)}
			</div>
		</>
	);
}
