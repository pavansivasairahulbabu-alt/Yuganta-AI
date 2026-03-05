import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API_URL from "../config/api";

export default function CourseDetailPage() {
	const { id } = useParams();
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [activeModule, setActiveModule] = useState(null);
	const [completedVideos, setCompletedVideos] = useState(new Set());
	const [moduleProgress, setModuleProgress] = useState({});

	useEffect(() => {
		fetchCourse();
	}, [id]);


	const fetchCourse = async () => {
		try {
			const response = await fetch(`${API_URL}/api/courses/${id}`);
			const data = await response.json();
			setCourse(data);
			setLoading(false);

			// Set first video as default if modules exist
			if (data.modules && data.modules.length > 0) {
				const firstModule = data.modules[0];
				setActiveModule(0);
				if (firstModule.videos && firstModule.videos.length > 0) {
					setSelectedVideo(firstModule.videos[0]);
				}
			}
		} catch (error) {
			console.error("Error fetching course:", error);
			setLoading(false);
		}
	};

	const handleVideoSelect = (video, moduleIndex) => {
		setSelectedVideo(video);
		setActiveModule(moduleIndex);
	};

	const markVideoCompleted = (videoUrl, moduleIndex) => {
		const videoKey = `${moduleIndex}-${videoUrl}`;
		if (!completedVideos.has(videoKey)) {
			const newCompletedVideos = new Set(completedVideos);
			newCompletedVideos.add(videoKey);
			setCompletedVideos(newCompletedVideos);
			
			// Update module progress
			if (course.modules[moduleIndex]) {
				const totalVideos = course.modules[moduleIndex].videos?.length || 0;
				const completedInModule = Array.from(newCompletedVideos)
					.filter(key => key.startsWith(`${moduleIndex}-`)).length;
				const progress = totalVideos > 0 ? (completedInModule / totalVideos) * 100 : 0;
				setModuleProgress({ ...moduleProgress, [moduleIndex]: progress });
			}
		}
	};

	const getOverallProgress = () => {
		if (!course?.modules) return 0;
		const totalVideos = course.modules.reduce((sum, m) => sum + (m.videos?.length || 0), 0);
		return totalVideos > 0 ? (completedVideos.size / totalVideos) * 100 : 0;
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center transition-colors duration-300'>
				<div className='text-[var(--text-color)] text-xl'>Loading course...</div>
			</div>
		);
	}

	if (!course) {
		return (
			<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center transition-colors duration-300'>
				<div className='text-[var(--text-color)] text-xl'>Course not found</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-20 transition-colors duration-300'>
			{/* Navigation Breadcrumb */}
			<div className='fixed top-20 left-0 right-0 z-50 bg-[var(--bg-color)]/85 backdrop-blur-sm border-b border-[var(--border-color)] transition-colors duration-300'>
				<div className='max-w-7xl mx-auto px-6 py-4'>
					<div className='flex items-center space-x-2 text-sm'>
						<Link 
							to='/' 
							className='text-[var(--text-muted)] flex items-center space-x-1'>
							<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
							</svg>
							<span>Home</span>
						</Link>
						<span className='text-[var(--text-muted)]'>/</span>
						<Link 
							to='/courses' 
							className='text-[var(--text-muted)]'>
							Courses
						</Link>
						<span className='text-[var(--text-muted)]'>/</span>
						<span className='text-[var(--text-color)] font-semibold truncate max-w-md'>{course.title}</span>
					</div>
				</div>
			</div>

			{/* Course Header */}
			<div className='bg-[var(--card-bg)] border-b border-[var(--border-color)] transition-colors duration-300'>
				<div className='max-w-7xl mx-auto px-6 py-10'>
					<div className='max-w-3xl'>
						{course.level && (
							<p className='text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2'>
								{course.level}
							</p>
						)}
						<h1 className='text-4xl font-bold mb-3 text-[var(--text-color)]'>
							{course.title}
						</h1>
						<p className='text-base sm:text-lg text-[var(--text-muted)] leading-relaxed'>
							{course.description}
						</p>
						<div className='mt-5 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]'>
							<div className='flex items-center space-x-2'>
								<svg
									className='w-5 h-5'
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
								<span>{course.duration}</span>
							</div>
							<div className='flex items-center space-x-2'>
								<svg
									className='w-5 h-5'
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
								<span>{course.modules?.length || 0} Modules</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Course Content */}
			<div className='max-w-7xl mx-auto px-6 py-8'>
				{course.modules && course.modules.length > 0 ? (
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Video Player */}
						<div className='lg:col-span-2'>
						{/* Overall Progress Bar */}
						<div className='bg-[var(--card-bg)] rounded-xl p-6 mb-6 transition-colors duration-300 border border-[var(--border-color)]'>
							<div className='flex items-center justify-between mb-3'>
								<h3 className='text-lg font-bold text-[var(--text-color)]'>Overall Progress</h3>
								<span className='text-sm font-semibold text-[#00BCD4]'>
									{Math.round(getOverallProgress())}% Complete
								</span>
							</div>
							<div className='w-full bg-gray-700 rounded-full h-3 overflow-hidden'>
								<div 
									className='h-full bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] rounded-full transition-all duration-500 ease-out'
									style={{ width: `${getOverallProgress()}%` }}
								/>
							</div>
							<div className='mt-2 text-xs text-[var(--text-muted)]'>
								{completedVideos.size} of {course.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0)} videos completed
							</div>
						</div>

						<div className='bg-[var(--card-bg)] rounded-xl overflow-hidden transition-colors duration-300 border border-[var(--border-color)]'>
							{selectedVideo ? (
								<div>
									<div className='relative bg-black aspect-video'>
										<video
											key={selectedVideo.url}
											controls
											className='w-full h-full'
											src={selectedVideo.url}
											onEnded={() => markVideoCompleted(selectedVideo.url, activeModule)}>
												Your browser does not support the video tag.
											</video>
										</div>
										<div className='p-6'>
										<div className='flex items-start justify-between mb-4'>
											<h2 className='text-2xl font-bold text-[var(--text-color)] flex-1'>
												{selectedVideo.title}
											</h2>
											<button
												onClick={() => markVideoCompleted(selectedVideo.url, activeModule)}
												className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
													completedVideos.has(`${activeModule}-${selectedVideo.url}`)
														? 'bg-green-500/20 text-green-400 border border-green-500/40'
														: 'bg-[#00BCD4]/10 text-[#00BCD4] border border-[#00BCD4]/40 hover:bg-[#00BCD4]/20'
												}`}>
												{completedVideos.has(`${activeModule}-${selectedVideo.url}`) ? (
													<span className='flex items-center space-x-1'>
														<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
															<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
														</svg>
														<span>Completed</span>
													</span>
												) : (
													'Mark Complete'
												)}
											</button>
										</div>
										{selectedVideo.description && (
											<p className='text-[var(--text-muted)] mb-4'>
												{selectedVideo.description}
											</p>
										)}
										{selectedVideo.duration && (
											<div className='text-sm text-[var(--text-muted)]'>
													Duration: {selectedVideo.duration}
												</div>
											)}
										</div>
									</div>
								) : (
									<div className='aspect-video bg-gray-900 flex items-center justify-center'>
										<div className='text-center'>
											<svg
												className='w-20 h-20 mx-auto mb-4 text-gray-600'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
												/>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
												/>
											</svg>
											<p className='text-gray-500'>
												Select a video from the modules to start
												learning
											</p>
										</div>
									</div>
								)}
							</div>

							{/* Module Content Below Video */}
							{activeModule !== null && course.modules[activeModule] && (
								<div className='mt-6 bg-[var(--card-bg)] rounded-xl p-6 transition-colors duration-300 border border-[var(--border-color)]'>
									<div className='mb-4'>
										<h3 className='text-xl font-bold text-[#00BCD4] mb-2'>
											Module {course.modules[activeModule].order}: {course.modules[activeModule].title}
										</h3>
										{course.modules[activeModule].description && (
											<p className='text-[var(--text-muted)] leading-relaxed'>
												{course.modules[activeModule].description}
											</p>
										)}
									</div>
									<div className='border-t border-[var(--border-color)] pt-4 mt-4'>
										<div className='grid grid-cols-2 gap-4'>
											<div>
												<p className='text-[var(--text-muted)] text-sm'>Videos in this module</p>
												<p className='text-2xl font-bold text-[var(--text-color)]'>
													{course.modules[activeModule].videos?.length || 0}
												</p>
											</div>
											<div>
												<p className='text-[var(--text-muted)] text-sm'>Current video</p>
												<p className='text-sm font-medium text-[#00BCD4] truncate'>
													{selectedVideo?.title || "No video selected"}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Modules Sidebar */}
						<div className='lg:col-span-1'>
							<div className='bg-[var(--card-bg)] rounded-xl p-6 transition-colors duration-300 border border-[var(--border-color)] sticky top-24'>
								<h3 className='text-xl font-bold mb-4 text-[var(--text-color)]'>
									Course Content
								</h3>
								<div className='space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar'>
									{course.modules
										.sort((a, b) => a.order - b.order)
										.map((module, moduleIndex) => {
											const progress = moduleProgress[moduleIndex] || 0;
											return (
											<div
												key={moduleIndex}
												className='border border-[var(--border-color)] rounded-lg overflow-hidden hover:border-[#00BCD4] transition-colors duration-200'>
												<button
													onClick={() =>
														setActiveModule(
															activeModule === moduleIndex
																? null
																: moduleIndex
														)
													}
													className='w-full px-4 py-3 bg-[var(--card-bg-secondary)] hover:bg-[var(--card-bg-hover)] flex items-center justify-between transition-colors duration-200'>
													<div className='text-left flex-1'>
														<div className='font-semibold text-[var(--text-color)] flex items-center space-x-2'>
															<span>Module {module.order}: {module.title}</span>
															{progress === 100 && (
																<svg className='w-5 h-5 text-green-400' fill='currentColor' viewBox='0 0 20 20'>
																	<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
																</svg>
															)}
														</div>
														<div className='text-xs text-[var(--text-muted)] mt-1'>
															{module.videos?.length || 0} video(s)
														</div>
														{/* Progress Bar for Module */}
														<div className='mt-2 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden'>
															<div 
																className='h-full bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] rounded-full transition-all duration-500'
																style={{ width: `${progress}%` }}
															/>
														</div>
													</div>
													<svg
														className={`w-5 h-5 transition-transform text-[var(--text-muted)] ${
															activeModule === moduleIndex
																? "rotate-180"
																: ""
															}`}
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M19 9l-7 7-7-7'
														/>
													</svg>
												</button>
												{activeModule === moduleIndex &&
													module.videos &&
													module.videos.length > 0 && (
														<div className='bg-[var(--bg-secondary)]'>
															{module.videos
																.sort(
																	(a, b) =>
																		a.order - b.order
																)
																.map((video, videoIndex) => {
																	const isCompleted = completedVideos.has(`${moduleIndex}-${video.url}`);
																	return (
																	<button
																		key={videoIndex}
																		onClick={() =>
																			handleVideoSelect(
																				video,
																				moduleIndex
																			)
																		}
																		className={`w-full px-4 py-3 text-left hover:bg-[var(--card-bg-hover)] transition-colors duration-200 border-l-4 ${
																			selectedVideo?.url === video.url
																				? "border-[#00BCD4] bg-[var(--card-bg-hover)]"
																				: "border-transparent"
																			}`}>
																		<div className='flex items-start space-x-3'>
																			{isCompleted ? (
																				<svg className='w-5 h-5 mt-0.5 flex-shrink-0 text-green-400' fill='currentColor' viewBox='0 0 20 20'>
																					<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
																				</svg>
																			) : (
																				<svg
																					className='w-5 h-5 mt-0.5 flex-shrink-0 text-[#00BCD4]'
																					fill='none'
																					stroke='currentColor'
																					viewBox='0 0 24 24'>
																					<path
																						strokeLinecap='round'
																						strokeLinejoin='round'
																						strokeWidth={2}
																						d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
																					/>
																					<path
																						strokeLinecap='round'
																						strokeLinejoin='round'
																						strokeWidth={2}
																						d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
																					/>
																				</svg>
																			)}
																			<div className='flex-1'>
																				<div className='text-sm font-medium text-[var(--text-color)]'>
																					{video.title}
																				</div>
																				{video.duration && (
																					<div className='text-xs text-[var(--text-muted)] mt-1 flex items-center space-x-2'>
																						<span>{video.duration}</span>
																						{isCompleted && (
																							<span className='text-green-400 text-xs'>✓ Completed</span>
																						)}
																					</div>
																				)}
																			</div>
																		</div>
																	</button>
																);})}
														</div>
													)}
											</div>
											);})}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className='bg-[var(--card-bg)] rounded-xl p-12 text-center transition-colors duration-300'>
						<svg
							className='w-20 h-20 mx-auto mb-4 text-gray-600'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
							/>
						</svg>
						<h3 className='text-xl font-bold mb-2'>No Content Yet</h3>
						<p className='text-gray-400'>
							This course doesn't have any modules or videos yet. Check
							back later!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
