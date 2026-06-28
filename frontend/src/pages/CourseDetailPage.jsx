import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../config/api";
import { useAuth } from "../context/AuthContext";
import { FileText, CheckCircle2, PlayCircle, LayoutDashboard, Loader2, AlertTriangle, ChevronDown, ChevronUp, BookOpen, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import SecurePDFViewer from "../components/SecurePDFViewer";

const sortByOrder = (items = []) =>
	[...items].sort((left, right) => (Number(left?.order) || 0) - (Number(right?.order) || 0));

const sortModulesWithVideos = (modules = []) =>
	sortByOrder(modules).map((module) => ({
		...module,
		videos: sortByOrder(module?.videos || []),
	}));

export default function CourseDetailPage() {
	const { id } = useParams();
	const { token } = useAuth();
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [activeModule, setActiveModule] = useState(null);
	const [completedVideos, setCompletedVideos] = useState(new Set());
	const [moduleQuizzes, setModuleQuizzes] = useState([]);
	const [isMarkingComplete, setIsMarkingComplete] = useState(false);
	const [moduleProgress, setModuleProgress] = useState({});
	const [videoWatchPercent, setVideoWatchPercent] = useState({});
	const [videoLoadError, setVideoLoadError] = useState("");
	const [videoSourceIndex, setVideoSourceIndex] = useState(0);
	const maxAllowedPlaybackTimeRef = useRef(0);
	const selectedVideoElementRef = useRef(null);
	const lastSavedTimeRef = useRef(0);
	const resumeTimeRef = useRef(0);
	const [isStudyMode, setIsStudyMode] = useState(false);
	const [leftPanelWidth, setLeftPanelWidth] = useState(300);
	const [isResizingLeftPanel, setIsResizingLeftPanel] = useState(false);
	const layoutRef = useRef(null);
	const [mobilePanelTab, setMobilePanelTab] = useState("content");

	// New state for handling the secure PDF modal
	const [viewingDocument, setViewingDocument] = useState(null);
	const orderedModules = useMemo(() => sortModulesWithVideos(course?.modules || []), [course]);

	const normalizeVideoUrl = (url) => {
		if (!url || typeof url !== "string") return "";
		let cleaned = url.trim();
		cleaned = cleaned.replace(/\s+/g, "");
		if (cleaned.startsWith("//")) cleaned = `https:${cleaned}`;
		if (cleaned.startsWith("http://")) cleaned = cleaned.replace("http://", "https://");
		return cleaned;
	};

	const resolveVideoUrl = (video) => normalizeVideoUrl(video?.url || "");
	const resolveVideoSources = (video) => resolveVideoUrl(video) ? [resolveVideoUrl(video)] : [];

	const getVideoKey = (moduleIndex, videoIndex, video) => {
		if (!video) return "";
		if (video._id) return `id:${video._id}`;
		const urlPart = resolveVideoUrl(video);
		const orderPart = Number(video?.order) || videoIndex + 1;
		return `${moduleIndex}:${orderPart}:${urlPart || (video?.title || "untitled")}`;
	};

	const getModuleId = (module, moduleIndex) => module?._id?.toString() || `module-${moduleIndex + 1}`;
	const getModuleQuiz = (module, moduleIndex) => {
		const moduleId = getModuleId(module, moduleIndex);
		return moduleQuizzes.find((item) => item.moduleId === moduleId)?.quiz || null;
	};
	const isModuleComplete = (module, moduleIndex) => {
		const videos = module?.videos || [];
		if (videos.length === 0) return false;
		return videos.every((video, videoIndex) => completedVideos.has(getVideoKey(moduleIndex, videoIndex, video)));
	};

	const courseVideoSequence = useMemo(
		() =>
			orderedModules.flatMap((module, moduleIndex) =>
				(module?.videos || []).map((video, videoIndex) => ({
					module,
					moduleIndex,
					video,
					videoIndex,
					sequenceIndex: 0,
				})),
			).map((entry, sequenceIndex) => ({
				...entry,
				sequenceIndex,
			})),
		[orderedModules],
	);

	const selectedVideoLocation = useMemo(() => {
		if (!selectedVideo || courseVideoSequence.length === 0) return null;
		const selectedUrl = normalizeVideoUrl(selectedVideo?.url || "");
		const selectedPublicId = typeof selectedVideo?.publicId === "string" ? selectedVideo.publicId.trim() : "";
		return (
			courseVideoSequence.find((entry) => {
				const { video } = entry;
				if (!video) return false;
				if (selectedVideo._id && video._id && String(video._id) === String(selectedVideo._id)) return true;
				if (selectedPublicId && video.publicId === selectedPublicId) return true;
				return resolveVideoUrl(video) === selectedUrl && (video?.title || "") === (selectedVideo?.title || "");
			}) || null
		);
	}, [courseVideoSequence, selectedVideo]);

	const selectedVideoIndex = selectedVideoLocation?.videoIndex ?? -1;
	const selectedVideoKey = useMemo(() => {
		if (!selectedVideoLocation || !selectedVideo) return "";
		return getVideoKey(selectedVideoLocation.moduleIndex, selectedVideoLocation.videoIndex, selectedVideoLocation.video);
	}, [selectedVideoLocation, selectedVideo]);

	const selectedVideoWatched = selectedVideoKey ? (videoWatchPercent[selectedVideoKey] || 0) : 0;
	const selectedVideoCanComplete = selectedVideoWatched >= 75;
	const selectedVideoSources = useMemo(() => resolveVideoSources(selectedVideo), [selectedVideo]);
	const activeVideoSource = selectedVideoSources[videoSourceIndex] || "";

	const formatDocumentSize = (bytes) => {
		if (!bytes) return "";
		const mb = bytes / (1024 * 1024);
		return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
	};

	useEffect(() => {
		fetchCourse();
	}, [id]);

	const fetchCourse = async () => {
		try {
			const queryParams = new URLSearchParams(window.location.search);
			const shouldResume = queryParams.get("resume") === "true";

			const response = await fetch(`${API_URL}/api/courses/${id}/content`, {
				headers: { Authorization: token ? `Bearer ${token}` : "" },
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
			const orderedCourse = {
				...data,
				modules: sortModulesWithVideos(data.modules || []),
			};
			setCourse(orderedCourse);
			setLoading(false);

			let defaultVideo = null;
			let defaultModuleIndex = 0;
			let progressData = null;

			if (token) {
				const progressResponse = await fetch(`${API_URL}/api/users/progress/${id}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (progressResponse.ok) {
					progressData = await progressResponse.json();
					setCompletedVideos(new Set(progressData.completedVideos || []));
				}

				const quizResponse = await fetch(`${API_URL}/api/quizzes/course/${id}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (quizResponse.ok) {
					const quizData = await quizResponse.json();
					setModuleQuizzes(Array.isArray(quizData.modules) ? quizData.modules : []);
				}
			}

			if (orderedCourse.modules && orderedCourse.modules.length > 0) {
				if (shouldResume && progressData && progressData.lastWatchedVideoId) {
					for (let mIdx = 0; mIdx < orderedCourse.modules.length; mIdx++) {
						const module = orderedCourse.modules[mIdx];
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

				if (!defaultVideo) {
					const firstModule = orderedCourse.modules[0];
					defaultModuleIndex = 0;
					if (firstModule.videos && firstModule.videos.length > 0) {
						defaultVideo = firstModule.videos[0];
					}
				}

				if (defaultVideo) {
					setVideoLoadError("");
					setVideoSourceIndex(0);
					setSelectedVideo({ ...defaultVideo, url: resolveVideoUrl(defaultVideo) });
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
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
		setSelectedVideo({ ...video, url: resolveVideoUrl(video) });
		setActiveModule(moduleIndex);
	};

	const seekVideoBy = (seconds) => {
		const player = selectedVideoElementRef.current;
		if (!player) return;
		const duration = Number(player.duration);
		if (!Number.isFinite(duration) || duration <= 0) return;
		const nextTime = Math.min(duration, Math.max(0, player.currentTime + seconds));
		player.currentTime = nextTime;
	};

	const navigateVideoByOffset = (direction) => {
		if (!selectedVideoLocation || courseVideoSequence.length === 0) return;
		const nextSequenceIndex = selectedVideoLocation.sequenceIndex + direction;
		if (nextSequenceIndex < 0 || nextSequenceIndex >= courseVideoSequence.length) {
			toast.info(direction > 0 ? "You are already on the last video" : "You are already on the first video");
			return;
		}
		const nextLocation = courseVideoSequence[nextSequenceIndex];
		handleVideoSelect(nextLocation.video, nextLocation.moduleIndex);
		if (direction > 0 && nextLocation.moduleIndex !== selectedVideoLocation.moduleIndex) {
			toast.success(`Starting Next Module: ${nextLocation.module?.title || "Next Module"}`);
		}
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
					headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
					body: JSON.stringify({ videoKey: selectedVideoKey, markComplete: true }),
				});
				if (!response.ok) throw new Error("Failed to save progress");
			}
			const newCompletedVideos = new Set(completedVideos);
			newCompletedVideos.add(selectedVideoKey);
			setCompletedVideos(newCompletedVideos);
			toast.success("Video completed!");
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
			handleVideoSelect(currentModule.videos[nextVideoIndex], activeModule);
		} else {
			const nextModuleIndex = activeModule + 1;
			if (course.modules && nextModuleIndex < course.modules.length) {
				const nextModule = course.modules[nextModuleIndex];
				if (nextModule.videos && nextModule.videos.length > 0) {
					handleVideoSelect(nextModule.videos[0], nextModuleIndex);
					toast.success(`Starting Next Module: ${nextModule.title}`);
				}
			} else {
				toast.success("You've finished all lessons in this course! 🎉");
			}
		}
	};

	const handleVideoSeeking = (event) => {
		if (!event?.target) return;
		// Seeking is allowed so learners can fast-forward, rewind, and review freely.
	};

	const handleVideoError = () => {
		if (videoSourceIndex + 1 < selectedVideoSources.length) {
			setVideoSourceIndex((prev) => prev + 1);
			setVideoLoadError(`Primary source failed. Trying fallback ${videoSourceIndex + 2}/${selectedVideoSources.length}...`);
			return;
		}
		setVideoLoadError(activeVideoSource || selectedVideo?.url || "Video URL is empty");
		toast.error("Video failed to load. Please try again later.");
	};

	const overallProgress = useMemo(() => {
		if (!course?.modules) return 0;
		const totalVideos = course.modules.reduce((sum, m) => sum + (m.videos?.length || 0), 0);
		return totalVideos > 0 ? (completedVideos.size / totalVideos) * 100 : 0;
	}, [course, completedVideos]);

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

	useEffect(() => {
		if (isStudyMode || !isResizingLeftPanel) return;

		const handlePointerMove = (event) => {
			const layoutNode = layoutRef.current;
			if (!layoutNode) return;

			const rect = layoutNode.getBoundingClientRect();
			const containerWidth = rect.width;
			const rightPanelWidth = window.innerWidth >= 1280 ? 380 : 320;
			const minLeftWidth = 240;
			const maxLeftWidth = Math.max(minLeftWidth, Math.min(520, containerWidth - rightPanelWidth - 420));
			const nextWidth = event.clientX - rect.left;
			const clampedWidth = Math.min(maxLeftWidth, Math.max(minLeftWidth, nextWidth));

			setLeftPanelWidth(clampedWidth);
		};

		const handlePointerUp = () => {
			setIsResizingLeftPanel(false);
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("pointercancel", handlePointerUp);

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("pointercancel", handlePointerUp);
		};
	}, [isResizingLeftPanel, isStudyMode]);

	useEffect(() => {
		if (!isResizingLeftPanel) return;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		return () => {
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isResizingLeftPanel]);

	useEffect(() => {
		if (isStudyMode && mobilePanelTab === "content") {
			setMobilePanelTab("overview");
		}
	}, [isStudyMode, mobilePanelTab]);

	if (loading) {
		return (
			<div className='min-h-screen bg-[var(--bg-primary)] flex items-center justify-center'>
				<Loader2 className="w-10 h-10 text-[#00BCD4] animate-spin" />
			</div>
		);
	}

	if (!course) {
		return (
			<div className='min-h-screen bg-[var(--bg-primary)] flex items-center justify-center'>
				<div className='text-center space-y-4'>
					<LayoutDashboard className="w-16 h-16 text-gray-500 mx-auto" />
					<div className='text-[var(--text-color)] text-xl font-light'>Course not found or access denied.</div>
					<Link to="/courses" className="inline-block mt-4 px-6 py-2 bg-[var(--bg-card)] border border-gray-500/20 rounded-full text-[#00BCD4]">Browse Courses</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-[calc(100dvh-64px)] lg:h-[calc(100dvh-64px)] flex flex-col bg-[var(--bg-primary)] text-[var(--text-color)] font-sans overflow-hidden'>

			{/* Top Navigation Bar */}
			<div className='flex-none bg-[var(--bg-card)] border-b border-gray-500/20 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 z-20'>
				<div className='flex items-center space-x-3 text-sm font-medium min-w-0'>
					<Link to='/courses' className='flex items-center space-x-2 text-[var(--text-primary)] hover:text-[#00BCD4] transition-colors'>
						<LayoutDashboard className='w-4 h-4' />
						<span className="hidden sm:inline">Courses</span>
					</Link>
					<span className='text-gray-500'>/</span>
					<span className='text-[var(--text-primary)] font-bold truncate max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg'>
						{course.title}
					</span>
				</div>

				<div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
					{/* Focus Mode Toggle */}
					<div className="flex items-center space-x-2 md:space-x-3 bg-[var(--bg-primary)] border border-gray-500/20 px-3 py-1.5 rounded-full cursor-pointer hover:border-gray-500/40 transition-colors shrink-0" onClick={() => setIsStudyMode(!isStudyMode)}>
						<span className="hidden md:inline text-xs font-semibold text-gray-500">Study Mode</span>
						<div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${isStudyMode ? 'bg-[#00BCD4]' : 'bg-gray-500/30'}`}>
							<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isStudyMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
						</div>
					</div>

					{/* Progress Indicator */}
					<div className="flex flex-col items-end min-w-[92px] sm:min-w-[100px] md:min-w-[120px]">
						<div className="flex items-center justify-between w-full mb-1">
							<span className='text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest'>Progress</span>
							<span className='text-xs font-bold text-[#00BCD4]'>{Math.round(overallProgress)}%</span>
						</div>
						<div className="w-full h-1.5 bg-gray-500/20 rounded-full overflow-hidden">
							<div className="h-full bg-[#00BCD4] transition-all duration-700 ease-out" style={{ width: `${overallProgress}%` }} />
						</div>
					</div>
				</div>
			</div>

			{/* STRICT CSS GRID LAYOUT - Prevents overlapping perfectly */}
			<div
				ref={layoutRef}
				style={{ "--left-panel-width": `${leftPanelWidth}px` }}
				className={`flex-1 min-h-0 overflow-y-auto lg:overflow-hidden grid transition-all duration-300 ${isStudyMode
					? 'grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]'
					: 'grid-cols-1 lg:[grid-template-columns:var(--left-panel-width)_8px_minmax(0,1fr)_320px] xl:[grid-template-columns:var(--left-panel-width)_8px_minmax(0,1fr)_380px]'
					}`}>

				{/* COLUMN 1: LEFT SIDEBAR (Modules) */}
				{!isStudyMode && (
					<div className="hidden lg:flex flex-col bg-[var(--bg-secondary)] border-r border-gray-500/20 h-full overflow-hidden">
						<div className="p-5 border-b border-gray-500/10 shrink-0">
							<h3 className="font-extrabold text-base text-[var(--text-primary)] leading-tight">{course.title}</h3>
							<p className="text-[11px] text-[var(--text-color)] opacity-60 mt-1.5 font-medium">{completedVideos.size} / {course.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0)} Lessons</p>
						</div>

						<div className='flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2'>
							{course.modules.map((module, moduleIndex) => {
								const isActiveModule = activeModule === moduleIndex;
								return (
									<div key={moduleIndex} className={`rounded-xl overflow-hidden transition-all duration-200 ${isActiveModule ? 'bg-[#00BCD4]/10 border border-[#00BCD4]/30' : 'bg-[var(--bg-card)] border border-gray-500/10 hover:border-gray-500/30'}`}>
										<button
											onClick={() => setActiveModule(isActiveModule ? null : moduleIndex)}
											className='w-full px-4 py-3 flex items-center justify-between'>
											<div className='flex flex-col items-start text-left pr-2'>
												<span className={`font-bold text-sm leading-tight ${isActiveModule ? 'text-[#00BCD4]' : 'text-[var(--text-primary)]'}`}>
													{module.title}
												</span>
											</div>
											{isActiveModule ? <ChevronUp className="w-4 h-4 text-[#00BCD4] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
										</button>

										{isActiveModule && (
											<div className='flex flex-col pb-2 px-2'>
												{module.videos && module.videos.length > 0 && module.videos.map((video, videoIndex) => {
													const videoKey = getVideoKey(moduleIndex, videoIndex, video);
													const isCompleted = completedVideos.has(videoKey);
													const isSelected = normalizeVideoUrl(selectedVideo?.url || "") === resolveVideoUrl(video);

													return (
														<button
															key={videoIndex}
															onClick={() => handleVideoSelect(video, moduleIndex)}
															className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center space-x-3 mb-1 ${isSelected ? "bg-[var(--bg-primary)] shadow-sm border border-[#00BCD4]/20" : "hover:bg-gray-500/5"}`}>

															<div className="shrink-0">
																{isCompleted ? (
																	<CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-[#00BCD4]' : 'text-green-500'}`} />
																) : isSelected ? (
																	<div className="w-4 h-4 rounded-full border-2 border-[#00BCD4] flex items-center justify-center">
																		<div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4]" />
																	</div>
																) : (
																	<PlayCircle className="w-4 h-4 text-gray-500" />
																)}
															</div>

															<div className="flex-1 min-w-0">
																<p className={`text-[13px] truncate leading-tight ${isSelected ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-color)] opacity-80"}`}>
																	{video.title}
																</p>
																{video.duration && (
																	<p className="text-[10px] text-gray-500 mt-0.5">{video.duration}</p>
																)}
															</div>
														</button>
													);
												})}
												<ModuleQuizLink courseId={id} module={module} moduleIndex={moduleIndex} quiz={getModuleQuiz(module, moduleIndex)} unlocked={isModuleComplete(module, moduleIndex)} />
											</div>
										)}
									</div>
								)
							})}
						</div>
					</div>
				)}

				{!isStudyMode && (
					<div
						role="separator"
						aria-orientation="vertical"
						aria-label="Resize course sidebar"
						onPointerDown={(event) => {
							event.preventDefault();
							setIsResizingLeftPanel(true);
						}}
						className="hidden lg:flex items-center justify-center w-2 h-full relative cursor-col-resize bg-transparent group"
					>
						<div className="h-full w-px bg-gray-500/15 group-hover:bg-[#00BCD4]/50 transition-colors" />
						<div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 rounded-full bg-gray-500/35 group-hover:bg-[#00BCD4] shadow-[0_0_8px_rgba(0,188,212,0.35)] transition-colors" />
					</div>
				)}

				{/* COLUMN 2: CENTER VIDEO PLAYER */}
				<div className="flex flex-col h-full min-h-0 bg-black relative shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 w-full overflow-hidden">
					{selectedVideo ? (
						<>
							<div className="flex flex-col gap-3 border-b border-white/10 bg-black/90 px-3 sm:px-4 py-3">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<button
										onClick={() => navigateVideoByOffset(-1)}
										disabled={!selectedVideoLocation || selectedVideoLocation.sequenceIndex === 0}
										className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
									>
										<ChevronLeft className="w-4 h-4" />
										Previous Video
									</button>
									<div className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-white/50 text-center sm:flex-1">
										{selectedVideoLocation ? `Video ${selectedVideoLocation.sequenceIndex + 1} of ${courseVideoSequence.length}` : "Lesson Navigation"}
									</div>
									<button
										onClick={() => navigateVideoByOffset(1)}
										disabled={!selectedVideoLocation || selectedVideoLocation.sequenceIndex >= courseVideoSequence.length - 1}
										className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00BCD4]/30 bg-[#00BCD4]/10 px-4 py-2 text-xs sm:text-sm font-semibold text-[#00BCD4] transition hover:bg-[#00BCD4]/20 disabled:cursor-not-allowed disabled:opacity-40"
									>
										Next Video
										<ChevronRight className="w-4 h-4" />
									</button>
								</div>
								<div className="flex flex-wrap items-center justify-center gap-2">
									<button
										onClick={() => seekVideoBy(-10)}
										className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/10"
									>
										-10s
									</button>
									<button
										onClick={() => seekVideoBy(10)}
										className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/10"
									>
										+10s
									</button>
								</div>
							</div>
							<video
								key={activeVideoSource || selectedVideo.url}
								controls
								controlsList='nodownload'
								onContextMenu={(e) => e.preventDefault()}
								playsInline
								preload='metadata'
								className='w-full aspect-video lg:aspect-auto lg:flex-1 lg:min-h-0 object-contain bg-black'
								src={activeVideoSource || selectedVideo.url}
								ref={selectedVideoElementRef}
								onError={handleVideoError}
								onLoadedData={(event) => {
									if (resumeTimeRef.current > 0) {
										event.target.currentTime = resumeTimeRef.current;
										resumeTimeRef.current = 0;
									}
									maxAllowedPlaybackTimeRef.current = event.target.currentTime || 0;
									setVideoLoadError("");
								}}
								onPause={handleVideoPause}
								onEnded={handleVideoEnded}
								onSeeking={handleVideoSeeking}
								onTimeUpdate={handleVideoTimeUpdate}
							/>
							{videoLoadError && (
								<div className='absolute inset-0 flex items-center justify-center bg-black/90 p-6 z-20'>
									<div className='bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl text-center max-w-sm'>
										<AlertTriangle className="w-10 h-10 mx-auto mb-3" />
										<div className='font-bold mb-2'>Media Error</div>
										<div className='text-xs break-all'>{videoLoadError}</div>
									</div>
								</div>
							)}
						</>
					) : (
						<div className='flex-1 flex items-center justify-center bg-[var(--bg-primary)] h-full min-h-[280px]'>
							<div className='text-center p-6 sm:p-8'>
								<PlayCircle className='w-14 h-14 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4' />
								<h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Ready to Learn?</h3>
								<p className='text-gray-500 text-sm mt-2'>Select a lesson from the sidebar.</p>
							</div>
						</div>
					)}
				</div>

				{/* MOBILE CONTENT SHEET */}
				<div className="lg:hidden px-4 pb-6 pt-4 space-y-4">
					<div className="rounded-2xl border border-gray-500/20 bg-[var(--bg-card)] overflow-hidden">
						{isStudyMode && (
							<div className="px-4 pt-4">
								<div className="inline-flex items-center gap-2 rounded-full border border-[#00BCD4]/30 bg-[#00BCD4]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00BCD4]">
									<span className="h-2 w-2 rounded-full bg-[#00BCD4]" />
									Study mode
								</div>
							</div>
						)}
						<div className={`grid border-b border-gray-500/20 ${isStudyMode ? "grid-cols-2" : "grid-cols-3"}`}>
							{(isStudyMode
								? [
										{ id: "overview", label: "Overview" },
										{ id: "resources", label: "Resources" },
									]
								: [
										{ id: "content", label: "Content" },
										{ id: "overview", label: "Overview" },
										{ id: "resources", label: "Resources" },
									]).map((tab) => (
								<button
									key={tab.id}
									onClick={() => setMobilePanelTab(tab.id)}
									className={`py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${mobilePanelTab === tab.id ? "text-[#00BCD4] bg-white/5" : "text-gray-500 hover:text-[var(--text-primary)]"}`}
								>
									{tab.label}
								</button>
							))}
						</div>

						<div className="p-4 sm:p-5">
							{!isStudyMode && mobilePanelTab === "content" && (
								<div className="space-y-4">
									<div>
										<p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Course Content</p>
										<h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-tight">{course.title}</h3>
										<p className="text-xs text-gray-500 mt-1">{completedVideos.size} / {course.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0)} lessons</p>
									</div>

									<div className="space-y-2">
										{course.modules.map((module, moduleIndex) => {
											const isActiveModule = activeModule === moduleIndex;
											return (
												<div key={`mobile-${moduleIndex}`} className={`rounded-xl overflow-hidden border ${isActiveModule ? 'border-[#00BCD4]/40 bg-[#00BCD4]/10' : 'border-gray-500/10 bg-[var(--bg-primary)]'}`}>
													<button
														onClick={() => setActiveModule(isActiveModule ? null : moduleIndex)}
														className="w-full px-4 py-3 flex items-center justify-between text-left"
													>
														<div className="min-w-0 pr-3">
															<p className={`text-sm font-bold truncate ${isActiveModule ? 'text-[#00BCD4]' : 'text-[var(--text-primary)]'}`}>{module.title}</p>
															<p className="text-[10px] text-gray-500 mt-0.5">{module.videos?.length || 0} lessons</p>
														</div>
														{isActiveModule ? <ChevronUp className="w-4 h-4 text-[#00BCD4] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
													</button>

													{isActiveModule && (
														<div className="px-2 pb-2">
															{module.videos?.length > 0 && module.videos.map((video, videoIndex) => {
																const videoKey = getVideoKey(moduleIndex, videoIndex, video);
																const isCompleted = completedVideos.has(videoKey);
																const isSelected = normalizeVideoUrl(selectedVideo?.url || "") === resolveVideoUrl(video);

																return (
																	<button
																		key={`mobile-video-${videoIndex}`}
																		onClick={() => handleVideoSelect(video, moduleIndex)}
																		className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 mb-1 ${isSelected ? "bg-[var(--bg-card)] border border-[#00BCD4]/25" : "hover:bg-white/5"}`}
																	>
																		{isCompleted ? (
																			<CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-[#00BCD4]' : 'text-green-500'}`} />
																		) : (
																			<PlayCircle className="w-4 h-4 text-gray-500 shrink-0" />
																		)}
																		<div className="min-w-0 flex-1">
																			<p className={`text-sm truncate ${isSelected ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-color)]"}`}>{video.title}</p>
																			{video.duration && <p className="text-[10px] text-gray-500 mt-0.5">{video.duration}</p>}
																		</div>
																	</button>
																);
															})}
															<ModuleQuizLink courseId={id} module={module} moduleIndex={moduleIndex} quiz={getModuleQuiz(module, moduleIndex)} unlocked={isModuleComplete(module, moduleIndex)} />
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}

							{mobilePanelTab === "overview" && (
								<div className="space-y-4">
									<div>
										<p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Overview</p>
										<h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-tight">{selectedVideo?.title || course.title}</h3>
									</div>
									<p className="text-sm text-[var(--text-color)] opacity-80 leading-relaxed whitespace-pre-wrap">
										{selectedVideo?.description || course.description || "No description provided for this lesson."}
									</p>
								</div>
							)}

							{mobilePanelTab === "resources" && (
								<div className="space-y-4">
									<div>
										<p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Resources</p>
										<h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-tight">{selectedVideo?.title || course.title}</h3>
									</div>
									{selectedVideo?.documents?.length > 0 ? (
										<div className="space-y-3">
											{selectedVideo.documents.map((doc, idx) => (
												<div key={`mobile-doc-${idx}`} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-500/20 bg-[var(--bg-primary)]">
													<div className="min-w-0">
														<p className="text-sm font-semibold text-[var(--text-primary)] truncate">{doc.name}</p>
														{formatDocumentSize(doc.size) && <p className="text-[10px] text-gray-500 mt-0.5">{formatDocumentSize(doc.size)}</p>}
													</div>
													<button
														onClick={() => setViewingDocument(doc)}
														className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#00BCD4] to-blue-500"
													>
														View
													</button>
												</div>
											))}
										</div>
									) : (
										<p className="text-sm text-gray-500">No resources attached to this lesson.</p>
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={markVideoCompleted}
							disabled={isMarkingComplete || completedVideos.has(selectedVideoKey) || !selectedVideoCanComplete}
							className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 text-sm ${completedVideos.has(selectedVideoKey)
								? 'bg-green-500/10 text-green-500 border border-green-500/30'
								: selectedVideoCanComplete
									? 'bg-[#00BCD4] text-white'
									: 'bg-[var(--bg-card)] text-gray-500 border border-gray-500/20 cursor-not-allowed'
								}`}
						>
							{isMarkingComplete ? (
								<><Loader2 className='animate-spin h-4 w-4' /><span>Saving...</span></>
							) : completedVideos.has(selectedVideoKey) ? (
								<><CheckCircle2 className='w-4 h-4' /><span>Completed</span></>
							) : (
								<><span>Mark as Completed</span><span className="opacity-70 text-[10px]">({Math.min(100, Math.round(selectedVideoWatched))}%)</span></>
							)}
						</button>
					</div>
				</div>

				{/* COLUMN 3: RIGHT SIDEBAR (Stacked Overview & Resources) */}
				<div className="hidden lg:flex flex-col bg-[var(--bg-primary)] border-l border-gray-500/20 h-full overflow-hidden min-h-0">
					{selectedVideo ? (
						<div className="flex flex-col h-full">

							{/* Scrollable Content Area */}
							<div className="flex-1 overflow-y-auto custom-scrollbar p-6">

								{/* Header Info */}
								<div className="mb-6 border-b border-gray-500/10 pb-6">
									<div className="flex items-center space-x-2 mb-2.5">
										{activeModule !== null && course.modules[activeModule] && (
											<span className="text-[10px] font-bold uppercase tracking-wider bg-gray-500/10 px-2 py-0.5 rounded text-gray-500">
												Module {course.modules[activeModule].order}
											</span>
										)}
										<span className="text-[10px] font-bold uppercase tracking-wider text-[#00BCD4]">
											Now Playing
										</span>
									</div>
									<h2 className="text-xl font-extrabold text-[var(--text-primary)] leading-snug">{selectedVideo.title}</h2>
								</div>

								{/* Stacked Overview Section */}
								<div className="mb-8">
									<h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
										<BookOpen className="w-4 h-4 text-[#00BCD4]" />
										Overview
									</h3>
									<p className="text-[13px] text-[var(--text-color)] opacity-80 leading-relaxed whitespace-pre-wrap">
										{selectedVideo.description || (activeModule !== null && course.modules[activeModule]?.description) || course.description || "No description provided for this lesson."}
									</p>
								</div>

								{/* Stacked Resources Section */}
								{selectedVideo.documents?.length > 0 && (
									<div className="mb-6">
										<h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
											<FileText className="w-4 h-4 text-[#00BCD4]" />
											Resources
											<span className="ml-1 bg-gray-500/20 text-[var(--text-primary)] px-1.5 py-0.5 rounded-full text-[10px]">{selectedVideo.documents.length}</span>
										</h3>
										<div className="flex flex-col gap-2.5">
											{selectedVideo.documents.map((doc, idx) => (
												<div key={`${doc.url}-${idx}`} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-500/20 bg-[var(--bg-card)] hover:border-[#00BCD4]/50 transition-colors group">
													<div className="flex items-center gap-3 min-w-0">
														<div className="p-2 rounded-lg bg-[#00BCD4]/10 text-[#00BCD4]">
															<FileText className="w-4 h-4" />
														</div>
														<div className="min-w-0">
															<p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{doc.name}</p>
															{formatDocumentSize(doc.size) && (
																<p className="text-[10px] text-gray-500 mt-0.5">{formatDocumentSize(doc.size)}</p>
															)}
														</div>
													</div>
													<div className="flex flex-col gap-1 shrink-0">
														<button
															onClick={() => setViewingDocument(doc)}
															className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#00BCD4] to-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
														>
															View Securely
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Sticky Bottom Action Bar */}
							<div className="p-5 border-t border-gray-500/20 bg-[var(--bg-primary)] shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
								<button
									onClick={markVideoCompleted}
									disabled={isMarkingComplete || completedVideos.has(selectedVideoKey) || !selectedVideoCanComplete}
									className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 text-sm ${completedVideos.has(selectedVideoKey)
										? 'bg-green-500/10 text-green-500 border border-green-500/30 cursor-default'
										: selectedVideoCanComplete
											? 'bg-[#00BCD4] text-white hover:bg-cyan-500 shadow-md hover:-translate-y-0.5'
											: 'bg-[var(--bg-card)] text-gray-500 border border-gray-500/20 cursor-not-allowed'
										}`}>
									{isMarkingComplete ? (
										<><Loader2 className='animate-spin h-4 w-4' /><span>Saving...</span></>
									) : completedVideos.has(selectedVideoKey) ? (
										<><CheckCircle2 className='w-4 h-4' /><span>Completed</span></>
									) : (
										<>
											<span>Mark as Completed</span>
											{!selectedVideoCanComplete && <span className="opacity-70 text-[10px]">({Math.min(100, Math.round(selectedVideoWatched))}%)</span>}
										</>
									)}
								</button>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-center h-full text-center p-6">
							<p className="text-gray-500 text-sm">Select a video to view details and resources.</p>
						</div>
					)}
				</div>
			</div>

			{/* Scrollbar Styles */}
			<style dangerouslySetInnerHTML={{
				__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 188, 212, 0.5); }
            `}} />

			{/* SECURE PDF MODAL */}
			{viewingDocument && (
				<SecurePDFViewer
					document={viewingDocument}
					courseId={id}
					token={token}
					onClose={() => setViewingDocument(null)}
				/>
			)}
		</div>
	);
}

// function ModuleQuizLink({ courseId, module, moduleIndex, quiz, unlocked }) {
// 	if (!quiz) {
// 		return (
// 			<div className="mt-2 rounded-lg border border-gray-500/10 bg-[var(--bg-primary)]/60 p-3 text-left">
// 				<div className="flex items-center gap-3">
// 					<ClipboardList className="w-4 h-4 text-gray-500 shrink-0" />
// 					<div className="min-w-0">
// 						<p className="text-[13px] font-bold text-[var(--text-color)] opacity-70">Module Quiz</p>
// 						<p className="text-[10px] text-gray-500 mt-0.5">Not published yet</p>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	}

// 	const bestAttempt = quiz.bestAttempt;
// 	const moduleTitle = module?.title || `Module ${moduleIndex + 1}`;

// 	if (!unlocked) {
// 		return (
// 			<div className="mt-2 rounded-lg border border-gray-500/10 bg-[var(--bg-primary)]/60 p-3 text-left opacity-70">
// 				<div className="flex items-center gap-3">
// 					<ClipboardList className="w-4 h-4 text-gray-500 shrink-0" />
// 					<div className="min-w-0">
// 						<p className="text-[13px] font-bold text-[var(--text-color)] truncate">{quiz.title || `${moduleTitle} Quiz`}</p>
// 						<p className="text-[10px] text-gray-500 mt-0.5">Complete all lessons to unlock</p>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<Link
// 			to={`/courses/${courseId}/quiz/${quiz._id}`}
// 			className="mt-2 rounded-lg border border-orange-500/25 bg-orange-500/10 p-3 text-left transition-all hover:border-orange-500/60 hover:bg-orange-500/15 flex items-center gap-3"
// 		>
// 			<ClipboardList className="w-4 h-4 text-orange-400 shrink-0" />
// 			<div className="min-w-0 flex-1">
// 				<p className="text-[13px] font-bold text-orange-300 truncate">{quiz.title || `${moduleTitle} Quiz`}</p>
// 				<p className="text-[10px] text-orange-200/70 mt-0.5">
// 					{bestAttempt
// 						? `Best: ${bestAttempt.score}/${bestAttempt.totalMarks} • Attempts left: ${quiz.attemptsRemaining ?? 0}`
// 						: `${quiz.totalQuestions || 0} questions • ${quiz.maxAttempts || 3} attempts`}
// 				</p>
// 			</div>
// 		</Link>
// 	);
// }
function ModuleQuizLink({ courseId, module, moduleIndex, quiz, unlocked }) {
	if (!quiz) {
		return (
			<div className="mt-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]/60 p-3 text-left">
				<div className="flex items-center gap-3">
					<ClipboardList className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
					<div className="min-w-0">
						<p className="text-[13px] font-bold text-[var(--text-color)] opacity-70">Module Quiz</p>
						<p className="text-[10px] text-[var(--text-muted)] mt-0.5">Not published yet</p>
					</div>
				</div>
			</div>
		);
	}

	const bestAttempt = quiz.bestAttempt;
	const moduleTitle = module?.title || `Module ${moduleIndex + 1}`;

	if (!unlocked) {
		return (
			<div className="mt-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]/60 p-3 text-left opacity-70">
				<div className="flex items-center gap-3">
					<ClipboardList className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
					<div className="min-w-0">
						<p className="text-[13px] font-bold text-[var(--text-color)] truncate">{quiz.title || `${moduleTitle} Quiz`}</p>
						<p className="text-[10px] text-[var(--text-muted)] mt-0.5">Complete all lessons to unlock</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<Link
			to={`/courses/${courseId}/quiz/${quiz._id}`}
			className="mt-2 rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 p-3 text-left transition-all hover:border-[#3B82F6]/60 hover:bg-[#3B82F6]/15 flex items-center gap-3"
		>
			<ClipboardList className="w-4 h-4 text-[#3B82F6] shrink-0" />
			<div className="min-w-0 flex-1">
				<p className="text-[13px] font-bold text-[var(--text-color)] truncate">{quiz.title || `${moduleTitle} Quiz`}</p>
				<p className="text-[11px] text-[var(--text-muted)] mt-0.5">
					{bestAttempt
						? `Best: ${bestAttempt.score}/${bestAttempt.totalMarks} • Attempts left: ${quiz.attemptsRemaining ?? 0}`
						: `${quiz.totalQuestions || 0} questions • ${quiz.maxAttempts || 3} attempts`}
				</p>
			</div>
		</Link>
	);
}
