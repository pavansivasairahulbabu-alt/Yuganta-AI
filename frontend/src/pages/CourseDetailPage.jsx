import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../config/api";
import { useAuth } from "../context/AuthContext";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Download, ExternalLink, FileText } from "lucide-react";

export default function CourseDetailPage() {
	const { id } = useParams();
	const { token } = useAuth();
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [activeModule, setActiveModule] = useState(null);
	const [completedVideos, setCompletedVideos] = useState(new Set());
	const [isMarkingComplete, setIsMarkingComplete] = useState(false);
	const [moduleProgress, setModuleProgress] = useState({});
	const [videoWatchPercent, setVideoWatchPercent] = useState({});
	const [videoLoadError, setVideoLoadError] = useState("");
	const [videoSourceIndex, setVideoSourceIndex] = useState(0);
	const maxAllowedPlaybackTimeRef = useRef(0);
	const selectedVideoElementRef = useRef(null);
	const lastSavedTimeRef = useRef(0);
	const resumeTimeRef = useRef(0);
	const [rightTab, setRightTab] = useState("theory");
	const [isStudyMode, setIsStudyMode] = useState(false);

	const normalizeVideoUrl = (url) => {
		if (!url || typeof url !== "string") return "";
		let cleaned = url.trim();
		cleaned = cleaned.replace(/\s+/g, "");
		if (cleaned.startsWith("//")) cleaned = `https:${cleaned}`;
		if (cleaned.startsWith("http://")) cleaned = cleaned.replace("http://", "https://");
		return cleaned;
	};

	const resolveVideoUrl = (video) => {
		return normalizeVideoUrl(video?.url || "");
	};

	const resolveVideoSources = (video) => {
		const directUrl = resolveVideoUrl(video);
		return directUrl ? [directUrl] : [];
	};

	const getVideoKey = (moduleIndex, videoIndex, video) => {
		if (!video) return "";
		// Use video._id if available, it's the most stable key.
		if (video._id) return `id:${video._id}`;

		// Fallback to legacy key format for backward compatibility
		const urlPart = resolveVideoUrl(video);
		const orderPart = Number(video?.order) || videoIndex + 1;
		return `${moduleIndex}:${orderPart}:${urlPart || (video?.title || "untitled")}`;
	};

	const selectedVideoIndex = useMemo(() => {
		if (activeModule === null || !course?.modules?.[activeModule]?.videos || !selectedVideo) {
			return -1;
		}

		// Try to find by _id first
		if (selectedVideo._id) {
			const index = course.modules[activeModule].videos.findIndex(
				(v) => v._id === selectedVideo._id
			);
			if (index !== -1) return index;
		}

		// Fallback to search by publicId or URL
		const selectedPublicId =
			typeof selectedVideo?.publicId === "string" ? selectedVideo.publicId.trim() : "";

		return course.modules[activeModule].videos.findIndex((video) => {
			if (selectedPublicId && video.publicId === selectedPublicId) return true;
			return resolveVideoUrl(video) === normalizeVideoUrl(selectedVideo?.url || "") &&
				(video?.title || "") === (selectedVideo?.title || "");
		});
	}, [course, activeModule, selectedVideo]);

	const selectedVideoKey = useMemo(() => {
		if (activeModule === null || selectedVideoIndex < 0 || !selectedVideo) return "";
		return getVideoKey(activeModule, selectedVideoIndex, selectedVideo);
	}, [activeModule, selectedVideoIndex, selectedVideo]);

	const selectedVideoWatched = selectedVideoKey ? (videoWatchPercent[selectedVideoKey] || 0) : 0;
	const selectedVideoCanComplete = selectedVideoWatched >= 75;
	const selectedVideoSources = useMemo(() => resolveVideoSources(selectedVideo), [selectedVideo]);
	const activeVideoSource = selectedVideoSources[videoSourceIndex] || "";

	const getDocumentViewerUrl = (doc) => {
		if (!doc?.url) return "";
		const extension = doc.name?.split(".").pop()?.toLowerCase();
		if (extension === "doc" || extension === "docx") {
			return `https://docs.google.com/gview?embedded=false&url=${encodeURIComponent(doc.url)}`;
		}
		return doc.url;
	};

	const formatDocumentSize = (bytes) => {
		if (!bytes) return "";
		const mb = bytes / (1024 * 1024);
		return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
	};

	useEffect(() => {
		fetchCourse();
		const hasSeenDragHint = localStorage.getItem('hasSeenDragHint');
		if (!hasSeenDragHint) {
			toast("💡 Tip: You can drag the borders between sections to resize them!", { duration: 6000, position: 'bottom-right' });
			localStorage.setItem('hasSeenDragHint', 'true');
		}
	}, [id]);


	const fetchCourse = async () => {
		try {
			const queryParams = new URLSearchParams(window.location.search);
			const shouldResume = queryParams.get("resume") === "true";

			const response = await fetch(`${API_URL}/api/courses/${id}/content`, {
				headers: {
					Authorization: token ? `Bearer ${token}` : "",
				},
			});

			if (!response.ok) {
				if (response.status === 403 || response.status === 401) {
					toast.error("Please enroll in this course to access the content.");
					window.location.href = `/course-details/${id}`;
					return;
				}
				throw new Error("Failed to fetch course details");
			}

			const data = await response.json();
			setCourse(data);
			setLoading(false);

			let defaultVideo = null;
			let defaultModuleIndex = 0;

			// Fetch progress
			let progressData = null;
			if (token) {
				const progressResponse = await fetch(`${API_URL}/api/users/progress/${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (progressResponse.ok) {
					progressData = await progressResponse.json();
					setCompletedVideos(new Set(progressData.completedVideos || []));
				}
			}

			// Decide which video to play first (either resume or first video of first module)
			if (data.modules && data.modules.length > 0) {
				if (shouldResume && progressData && progressData.lastWatchedVideoId) {
					for (let mIdx = 0; mIdx < data.modules.length; mIdx++) {
						const module = data.modules[mIdx];
						if (module.videos) {
							for (let vIdx = 0; vIdx < module.videos.length; vIdx++) {
								const video = module.videos[vIdx];
								const vKey = getVideoKey(mIdx, vIdx, video);
								if (vKey === progressData.lastWatchedVideoId || (video._id && video._id.toString() === progressData.lastWatchedVideoId)) {
									defaultVideo = video;
									defaultModuleIndex = mIdx;
									resumeTimeRef.current = progressData.lastWatchedTimestamp || 0;
									lastSavedTimeRef.current = progressData.lastWatchedTimestamp || 0;
									break;
								}
							}
						}
						if (defaultVideo) break;
					}
				}

				// Fallback to first video
				if (!defaultVideo) {
					const firstModule = data.modules[0];
					defaultModuleIndex = 0;
					if (firstModule.videos && firstModule.videos.length > 0) {
						defaultVideo = firstModule.videos[0];
					}
				}

				if (defaultVideo) {
					setVideoLoadError("");
					setVideoSourceIndex(0);
					setSelectedVideo({
						...defaultVideo,
						url: resolveVideoUrl(defaultVideo),
					});
					setActiveModule(defaultModuleIndex);
				}
			}
		} catch (error) {
			console.error("Error fetching course:", error);
			setLoading(false);
		}
	};

	const saveResumeState = async (videoKey, timestamp, videoTitle) => {
		if (!token || !videoKey) return;
		try {
			await fetch(`${API_URL}/api/users/progress/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					lastWatchedVideoId: videoKey,
					lastWatchedTimestamp: timestamp,
					lastWatchedVideoTitle: videoTitle
				}),
			});
		} catch (error) {
			console.error("Error saving resume state:", error);
		}
	};

	const handleVideoSelect = (video, moduleIndex) => {
		setVideoLoadError("");
		setVideoSourceIndex(0);
		resumeTimeRef.current = 0;
		lastSavedTimeRef.current = 0;
		setSelectedVideo({
			...video,
			url: resolveVideoUrl(video),
		});
		setActiveModule(moduleIndex);
	};

	const handleDocumentDownload = (doc) => {
		if (!doc?.url) return;
		const link = document.createElement("a");
		link.href = doc.url;
		link.download = doc.name || "lesson-resource";
		link.target = "_blank";
		link.rel = "noreferrer";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const markVideoCompleted = async () => {
		if (!selectedVideoKey || isMarkingComplete) return;
		if (!selectedVideoCanComplete) {
			toast.error("Watch at least 75% of this video to mark it complete");
			return;
		}

		if (completedVideos.has(selectedVideoKey)) return;

		setIsMarkingComplete(true);
		try {
			if (token) {
				const response = await fetch(`${API_URL}/api/users/progress/${id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						videoKey: selectedVideoKey,
						markComplete: true,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to save progress");
				}
			}

			// Update local state ONLY after successful API call or if no token (offline mode)
			const newCompletedVideos = new Set(completedVideos);
			newCompletedVideos.add(selectedVideoKey);
			setCompletedVideos(newCompletedVideos);
			toast.success("Video marked as complete");
		} catch (error) {
			console.error("Error saving video completion:", error);
			toast.error("Failed to mark video as complete. Please try again.");
		} finally {
			setIsMarkingComplete(false);
		}
	};

	const handleVideoTimeUpdate = (event) => {
		if (!selectedVideoKey) return;
		const duration = event.target.duration;
		if (!duration || Number.isNaN(duration) || duration <= 0) return;

		const currentTime = event.target.currentTime;
		maxAllowedPlaybackTimeRef.current = Math.max(maxAllowedPlaybackTimeRef.current, currentTime);

		const watched = (currentTime / duration) * 100;
		setVideoWatchPercent((prev) => ({
			...prev,
			[selectedVideoKey]: Math.max(prev[selectedVideoKey] || 0, watched),
		}));

		// Periodically save state (every 10 seconds of playback progression)
		if (Math.abs(currentTime - lastSavedTimeRef.current) >= 10) {
			lastSavedTimeRef.current = currentTime;
			saveResumeState(selectedVideoKey, currentTime, selectedVideo.title);
		}
	};

	const handleVideoPause = (event) => {
		if (!selectedVideoKey) return;
		const currentTime = event.target.currentTime;
		lastSavedTimeRef.current = currentTime;
		saveResumeState(selectedVideoKey, currentTime, selectedVideo.title);
	};

	const handleVideoEnded = () => {
		if (selectedVideoCanComplete && !completedVideos.has(selectedVideoKey)) {
			markVideoCompleted();
		}

		if (activeModule === null || selectedVideoIndex < 0) return;

		const currentModule = course.modules[activeModule];
		const nextVideoIndex = selectedVideoIndex + 1;

		if (currentModule.videos && nextVideoIndex < currentModule.videos.length) {
			const nextVideo = currentModule.videos[nextVideoIndex];
			handleVideoSelect(nextVideo, activeModule);
			toast.success("Playing next lesson...");
		} else {
			const nextModuleIndex = activeModule + 1;
			if (course.modules && nextModuleIndex < course.modules.length) {
				const nextModule = course.modules[nextModuleIndex];
				if (nextModule.videos && nextModule.videos.length > 0) {
					const nextVideo = nextModule.videos[0];
					handleVideoSelect(nextVideo, nextModuleIndex);
					toast.success(`Playing Next Module: ${nextModule.title}`);
				}
			} else {
				toast.success("Congratulations! You've finished all lessons in this course.");
			}
		}
	};

	const handleVideoSeeking = (event) => {
		const player = event.target;
		if (!player) return;
		// Allow backward seeking, but block jumping ahead of watched position.
		if (player.currentTime <= maxAllowedPlaybackTimeRef.current + 0.25) return;
		player.currentTime = maxAllowedPlaybackTimeRef.current;
	};

	const handleVideoError = () => {
		if (videoSourceIndex + 1 < selectedVideoSources.length) {
			setVideoSourceIndex((prev) => prev + 1);
			setVideoLoadError(
				`Primary source failed. Trying fallback ${videoSourceIndex + 2}/${selectedVideoSources.length}...`,
			);
			return;
		}

		setVideoLoadError(activeVideoSource || selectedVideo?.url || "Video URL is empty");
		toast.error("Video failed to load. Please re-upload this video.");
	};

	const getOverallProgress = () => {
		if (!course?.modules) return 0;
		const totalVideos = course.modules.reduce((sum, m) => sum + (m.videos?.length || 0), 0);
		return totalVideos > 0 ? (completedVideos.size / totalVideos) * 100 : 0;
	};

	useEffect(() => {
		if (!course?.modules) return;
		const nextModuleProgress = {};
		course.modules.forEach((module, moduleIndex) => {
			const moduleVideos = module?.videos || [];
			const totalVideos = moduleVideos.length;
			if (totalVideos === 0) {
				nextModuleProgress[moduleIndex] = 0;
				return;
			}

			const completedCount = moduleVideos.reduce((count, video, videoIndex) => {
				const key = getVideoKey(moduleIndex, videoIndex, video);
				return completedVideos.has(key) ? count + 1 : count;
			}, 0);

			nextModuleProgress[moduleIndex] = (completedCount / totalVideos) * 100;
		});

		setModuleProgress(nextModuleProgress);
	}, [course, completedVideos]);

	useEffect(() => {
		setVideoSourceIndex(0);
		setVideoLoadError("");
		maxAllowedPlaybackTimeRef.current = 0;
	}, [selectedVideo?.publicId, selectedVideo?.url, selectedVideo?.title]);

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
		<div className='h-[calc(100vh-64px)] flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300 overflow-hidden'>
			{/* Navigation Breadcrumb */}
			<div className='flex-none border-b border-gray-800/60 bg-[var(--bg-primary)]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)] z-10'>
				<div className='flex items-center space-x-3 text-sm font-medium'>
					<Link
						to='/'
						className='text-gray-400 hover:text-[#00BCD4] flex items-center space-x-1.5 transition-all duration-300'>
						<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
						</svg>
						<span>Home</span>
					</Link>
					<span className='text-gray-600'>/</span>
					<Link
						to='/courses'
						className='text-gray-400 hover:text-[#00BCD4] transition-all duration-300'>
						Courses
					</Link>
					<span className='text-gray-600'>/</span>
					<span className='text-[var(--text-primary)] font-semibold truncate max-w-xs md:max-w-md tracking-wide'>{course.title}</span>
				</div>
				<div className="flex items-center space-x-6">
					<button
						onClick={() => setIsStudyMode(!isStudyMode)}
						className="flex items-center space-x-2.5 bg-gray-800 hover:bg-gray-700 transition-colors pl-1.5 pr-4 py-1.5 rounded-full cursor-pointer border border-gray-800/60 shadow-sm">
						<div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isStudyMode ? 'bg-[#00BCD4]' : 'bg-[var(--bg-card)]'}`}>
							<span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${isStudyMode ? 'bg-white translate-x-4 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-gray-400 translate-x-0.5'}`} />
						</div>
						<span className="text-gray-400 font-medium text-sm">Study view</span>
					</button>
					<div className="flex flex-col items-end">
						<span className='text-xs text-gray-400 uppercase tracking-wider mb-1'>Course Progress</span>
						<span className='text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-blue-400 drop-shadow-[0_0_8px_rgba(0,188,212,0.3)]'>
							{Math.round(getOverallProgress())}% Complete
						</span>
					</div>
				</div>
			</div>

			{/* Resizable Layout */}
			<div className='flex-1 overflow-hidden bg-[var(--bg-primary)]'>
				{course.modules && course.modules.length > 0 ? (
					<PanelGroup direction="horizontal">
						{/* Left Sidebar: Modules (Hidden in Study Mode) */}
						{!isStudyMode && (
							<>
								<Panel defaultSize={25} minSize={15} className="bg-[var(--bg-card)] border-r border-gray-800/60 flex flex-col shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.5)] z-20">
									<div className="p-5 border-b border-gray-800/60 flex items-center justify-between bg-gradient-to-b from-gray-800/10 to-transparent">
										<h3 className="font-bold text-lg text-[var(--text-primary)] tracking-tight">{course.title}</h3>
										<div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 text-[#00BCD4] border border-gray-700/50">
											{completedVideos.size}/{course.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0)}
										</div>
									</div>
									<div className='flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3'>
										{course.modules
											.sort((a, b) => a.order - b.order)
											.map((module, moduleIndex) => {
												const progress = moduleProgress[moduleIndex] || 0;
												return (
													<div key={moduleIndex} className='rounded-xl overflow-hidden border border-gray-800/40 hover:border-gray-700/80 hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 bg-[var(--bg-primary)]/50'>
														<button
															onClick={() => setActiveModule(activeModule === moduleIndex ? null : moduleIndex)}
															className='w-full px-4 py-3 hover:bg-gray-800/40 flex items-center justify-between group transition-colors'>
															<div className='flex flex-col items-start'>
																<span className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors">{module.title}</span>
																<span className="text-[11px] text-gray-500 font-medium mt-0.5">{module.videos?.length || 0} videos</span>
															</div>
															<div className={`p-1.5 rounded-md transition-all duration-300 ${activeModule === moduleIndex ? "bg-[#00BCD4]/10 text-[#00BCD4]" : "text-gray-500 group-hover:bg-gray-800 group-hover:text-gray-300"}`}>
																<svg className={`w-4 h-4 transition-transform duration-300 ${activeModule === moduleIndex ? "rotate-180" : ""}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
																	<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 9l-7 7-7-7' />
																</svg>
															</div>
														</button>
														{activeModule === moduleIndex && module.videos && module.videos.length > 0 && (
															<div className='bg-[var(--bg-primary)]/30 flex flex-col border-t border-gray-800/40'>
																{module.videos.sort((a, b) => a.order - b.order).map((video, videoIndex) => {
																	const videoKey = getVideoKey(moduleIndex, videoIndex, video);
																	const isCompleted = completedVideos.has(videoKey);
																	const isSelected = normalizeVideoUrl(selectedVideo?.url || "") === resolveVideoUrl(video);
																	return (
																		<button
																			key={videoIndex}
																			onClick={() => handleVideoSelect(video, moduleIndex)}
																			className={`w-full px-4 py-3 text-left transition-all duration-300 border-l-[3px] group relative overflow-hidden ${isSelected ? "border-[#00BCD4] bg-gradient-to-r from-[#00BCD4]/10 to-transparent" : "border-transparent hover:bg-gray-800/30"}`}>
																			{isSelected && <div className="absolute inset-y-0 left-0 w-[1px] bg-[#00BCD4] shadow-[0_0_10px_#00BCD4]" />}
																			<div className='flex items-start space-x-3'>
																				{isCompleted ? (
																					<div className="mt-0.5 p-0.5 rounded-full bg-green-500/20 text-green-400 ring-1 ring-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.3)]">
																						<svg className='w-3 h-3 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
																							<path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
																						</svg>
																					</div>
																				) : (
																					<div className={`mt-0.5 p-0.5 rounded-full transition-colors ${isSelected ? "bg-[#00BCD4]/20 text-[#00BCD4] ring-1 ring-[#00BCD4]/50 shadow-[0_0_8px_rgba(0,188,212,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}>
																						<svg className='w-3 h-3 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
																							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' />
																							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
																						</svg>
																					</div>
																				)}
																				<span className={`text-xs flex-1 leading-relaxed ${isSelected ? "text-[var(--text-primary)] font-semibold" : "text-gray-400 group-hover:text-[var(--text-primary)]"}`}>{video.title}</span>
																			</div>
																		</button>
																	);
																})}
															</div>
														)}
													</div>
												)
											})}
									</div>
								</Panel>
								<PanelResizeHandle className="relative w-1.5 bg-gray-800 group hover:bg-[#00BCD4]/20 cursor-col-resize transition-all duration-300 flex items-center justify-center z-30">
									<div className="absolute h-8 w-1 rounded-full bg-gray-500 group-hover:bg-[#00BCD4] transition-colors shadow-[0_0_5px_rgba(0,188,212,0.5)] opacity-60 group-hover:opacity-100" />
								</PanelResizeHandle>
							</>
						)}

						{/* Center: Video Player */}
						<Panel defaultSize={75} minSize={30} className="flex flex-col bg-[var(--bg-secondary)] shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10">
							{selectedVideo ? (
								<PanelGroup direction="vertical">
									{/* Top Empty Space (Allows resizing from Top) */}
									<Panel defaultSize={0} collapsible minSize={0} className="bg-[var(--bg-secondary)] transition-all" />
									<PanelResizeHandle className="relative h-1.5 bg-gray-800 hover:bg-[#00BCD4]/20 cursor-row-resize transition-all duration-300 z-30" />

									{/* Top Video Section */}
									{!isStudyMode && (
										<>
											<Panel defaultSize={75} minSize={20} className="flex flex-col relative bg-black">
												<PanelGroup direction="horizontal">
													<Panel defaultSize={100} minSize={30} className="flex flex-col relative bg-black justify-center">
														<video
															key={activeVideoSource || selectedVideo.url}
															controls
															controlsList='nodownload'
															onContextMenu={(e) => e.preventDefault()}
															playsInline
															preload='metadata'
															className='w-full h-full object-contain'
															src={activeVideoSource || selectedVideo.url}
															ref={selectedVideoElementRef}
															onError={handleVideoError}
															onLoadedData={(event) => {
																if (resumeTimeRef.current > 0) {
																	event.target.currentTime = resumeTimeRef.current;
																	toast.success(`Resumed from ${Math.round(resumeTimeRef.current)}s`, { id: "resume-toast" });
																	resumeTimeRef.current = 0;
																}
																maxAllowedPlaybackTimeRef.current = event.target.currentTime || 0;
																setVideoLoadError("");
															}}
															onPause={handleVideoPause}
															onEnded={handleVideoEnded}
															onSeeking={handleVideoSeeking}
															onTimeUpdate={handleVideoTimeUpdate}>
															Your browser does not support the video tag.
														</video>
														{videoLoadError && (
															<div className='absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-6'>
																<div className='bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg max-w-lg text-center'>
																	<div className='font-bold mb-2'>Video Error</div>
																	<div className='text-sm break-all'>{videoLoadError}</div>
																</div>
															</div>
														)}
													</Panel>

													{/* Right Empty Space (Allows resizing from Right) */}
													<PanelResizeHandle className="relative w-1.5 bg-gray-800 group hover:bg-[#00BCD4]/20 cursor-col-resize transition-all duration-300 flex items-center justify-center z-20">
														<div className="absolute h-8 w-1 rounded-full bg-gray-500 group-hover:bg-[#00BCD4] transition-colors shadow-[0_0_5px_rgba(0,188,212,0.5)] opacity-60 group-hover:opacity-100" />
													</PanelResizeHandle>
													<Panel defaultSize={0} collapsible minSize={0} className="bg-[var(--bg-secondary)] transition-all" />
												</PanelGroup>
											</Panel>

											<PanelResizeHandle className="relative h-1.5 bg-gray-800 group hover:bg-[#00BCD4]/20 cursor-row-resize transition-all duration-300 flex items-center justify-center z-20">
												<div className="absolute w-8 h-1 rounded-full bg-gray-500 group-hover:bg-[#00BCD4] transition-colors shadow-[0_0_5px_rgba(0,188,212,0.5)] opacity-60 group-hover:opacity-100" />
											</PanelResizeHandle>
										</>
									)}

									{/* Bottom Info & Description Section */}
									<Panel defaultSize={25} minSize={10} className="flex flex-col bg-[var(--bg-secondary)]">
										<PanelGroup direction="vertical">
											<Panel defaultSize={100} className="flex flex-col relative">
												<PanelGroup direction="horizontal">
													{/* Left Empty Space */}
													<Panel defaultSize={0} collapsible minSize={0} className="bg-[var(--bg-secondary)] transition-all" />
													<PanelResizeHandle className="relative w-1.5 bg-gray-800 group hover:bg-[#00BCD4]/20 cursor-col-resize transition-all duration-300 flex items-center justify-center z-20">
														<div className="absolute h-8 w-1 rounded-full bg-gray-500 group-hover:bg-[#00BCD4] transition-colors shadow-[0_0_5px_rgba(0,188,212,0.5)] opacity-60 group-hover:opacity-100" />
													</PanelResizeHandle>

													<Panel defaultSize={100} minSize={20} className="flex flex-col bg-[var(--bg-primary)] shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-gray-800/40 relative">
														<div className="flex-1 overflow-y-auto custom-scrollbar relative">
															{/* Video Controls / Info Header */}
															<div className="bg-[var(--bg-card)] px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] sticky top-0 z-10">
																<div className="flex flex-col flex-1 min-w-0">
																	<h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight break-words">{selectedVideo.title}</h2>
																	<div className="text-xs font-medium text-gray-400 mt-1.5 flex flex-wrap items-center gap-2">
																		{activeModule !== null && course.modules[activeModule] && (
																			<>
																				<span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 whitespace-nowrap">Module {course.modules[activeModule].order}</span>
																				<span className="truncate">{course.modules[activeModule].title}</span>
																			</>
																		)}
																	</div>
																</div>
																<button
																	onClick={markVideoCompleted}
																	disabled={isMarkingComplete || completedVideos.has(selectedVideoKey) || !selectedVideoCanComplete}
																	className={`w-full md:w-auto shrink-0 px-4 sm:px-5 py-2.5 text-sm rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${completedVideos.has(selectedVideoKey)
																		? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default'
																		: selectedVideoCanComplete
																			? 'bg-gradient-to-r from-[#00BCD4]/10 to-blue-500/10 text-[#00BCD4] border border-[#00BCD4]/40 hover:border-[#00BCD4]/80 hover:shadow-[0_0_20px_rgba(0,188,212,0.3)] hover:-translate-y-0.5'
																			: 'bg-gray-800/50 text-gray-500 border border-gray-700/50 cursor-not-allowed'
																		}`}>
																	{isMarkingComplete ? (
																		<><svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg><span>Saving...</span></>
																	) : completedVideos.has(selectedVideoKey) ? (
																		<><svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' /></svg><span>Completed</span></>
																	) : (
																		<span>Mark Complete ({Math.min(100, Math.round(selectedVideoWatched))}%)</span>
																	)}
																</button>
															</div>

															{/* Description Content */}
															<div className="p-5 sm:p-6 break-words">
																<h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 tracking-wide">About</h3>
																<div className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap max-w-4xl">
																	{selectedVideo.description || (activeModule !== null && course.modules[activeModule]?.description) || course.description || "No description provided."}
																</div>
																{selectedVideo.documents?.length > 0 && (
																	<div className="mt-6 max-w-4xl">
																		<h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 tracking-wide">Resources</h3>
																		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
																			{selectedVideo.documents.map((doc, idx) => (
																				<div key={`${doc.url}-${idx}`} className="flex items-center justify-between gap-3 rounded-lg border border-gray-800/70 bg-[var(--bg-card)]/70 px-4 py-3">
																					<div className="flex items-center gap-3 min-w-0">
																						<div className="shrink-0 p-2 rounded-md bg-[#00BCD4]/10 text-[#00BCD4]">
																							<FileText className="w-4 h-4" />
																						</div>
																						<div className="min-w-0">
																							<p className="text-sm font-semibold text-[var(--text-primary)] truncate">{doc.name}</p>
																							{formatDocumentSize(doc.size) && (
																								<p className="text-xs text-gray-500 mt-0.5">{formatDocumentSize(doc.size)}</p>
																							)}
																						</div>
																					</div>
																					<div className="flex items-center gap-1.5 shrink-0">
																						<a
																							href={getDocumentViewerUrl(doc)}
																							target="_blank"
																							rel="noreferrer"
																							className="p-2 rounded-md text-gray-400 hover:text-[#00BCD4] hover:bg-[#00BCD4]/10 transition-colors"
																							title="View document"
																						>
																							<ExternalLink className="w-4 h-4" />
																						</a>

																					</div>
																				</div>
																			))}
																		</div>
																	</div>
																)}
															</div>
														</div>
													</Panel>

													{/* Right Empty Space */}
													<PanelResizeHandle className="relative w-1.5 bg-gray-800 group hover:bg-[#00BCD4]/20 cursor-col-resize transition-all duration-300 flex items-center justify-center z-20">
														<div className="absolute h-8 w-1 rounded-full bg-gray-500 group-hover:bg-[#00BCD4] transition-colors shadow-[0_0_5px_rgba(0,188,212,0.5)] opacity-60 group-hover:opacity-100" />
													</PanelResizeHandle>
													<Panel defaultSize={0} collapsible minSize={0} className="bg-[var(--bg-secondary)] transition-all" />
												</PanelGroup>
											</Panel>

											{/* Bottom Empty Space */}
											<PanelResizeHandle className="relative h-1.5 bg-gray-800 group hover:bg-[#00BCD4]/20 cursor-row-resize transition-all duration-300 flex items-center justify-center z-20">
												<div className="absolute w-8 h-1 rounded-full bg-gray-500 group-hover:bg-[#00BCD4] transition-colors shadow-[0_0_5px_rgba(0,188,212,0.5)] opacity-60 group-hover:opacity-100" />
											</PanelResizeHandle>
											<Panel defaultSize={0} collapsible minSize={0} className="bg-[var(--bg-secondary)] transition-all" />
										</PanelGroup>
									</Panel>
								</PanelGroup>
							) : (
								<div className='flex-1 flex items-center justify-center bg-[var(--bg-secondary)]'>
									<div className='text-center p-8'>
										<svg className='w-16 h-16 mx-auto mb-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' />
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
										</svg>
										<p className='text-gray-500 font-medium'>Select a video to start learning</p>
									</div>
								</div>
							)}
						</Panel>
					</PanelGroup>
				) : (
					<div className="h-full flex items-center justify-center">
						<div className='bg-[var(--card-bg)] rounded-xl p-12 text-center'>
							<svg className='w-20 h-20 mx-auto mb-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
							</svg>
							<h3 className='text-xl font-bold mb-2'>No Content Yet</h3>
							<p className='text-gray-400'>This course doesn't have any modules or videos yet. Check back later!</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}


