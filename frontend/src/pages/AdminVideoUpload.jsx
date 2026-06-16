import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UploadCloud, Film, Image as ImageIcon, FileText, X, AlertTriangle, Loader2, Play, CheckCircle, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import api from "../config/axios";

export default function AdminVideoUpload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [videoOrder, setVideoOrder] = useState("");

  // Drag menu states
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  // Media states
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoSize, setVideoSize] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoKey, setVideoKey] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailKey, setThumbnailKey] = useState("");
  const [documentFiles, setDocumentFiles] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  // Upload progress states
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [documentProgress, setDocumentProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);

  // Drag and drop states
  const [isVideoDragActive, setIsVideoDragActive] = useState(false);
  const [isThumbDragActive, setIsThumbDragActive] = useState(false);
  const [isDocDragActive, setIsDocDragActive] = useState(false);

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    }
    setLoading(false);
  }, [navigate]);

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["video-categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
    enabled: !loading,
  });

  // Fetch courses for dropdown
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const res = await api.get("/courses");
      return res.data;
    },
    enabled: !loading,
  });

  // Handle Draggable Category Menu
  const handleMenuMouseDown = (e) => {
    if (e.target.closest("button")) return; // Don't drag if clicking buttons
    setIsDraggingMenu(true);
    setDragOffset({
      x: e.clientX - menuPosition.x,
      y: e.clientY - menuPosition.y,
    });
  };

  useEffect(() => {
    if (!isDraggingMenu) return;

    const handleMouseMove = (e) => {
      setMenuPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDraggingMenu(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingMenu, dragOffset]);

  // Handle Tags
  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/,/g, "");
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper: Format duration (seconds -> MM:SS)
  const formatDuration = (secs) => {
    if (isNaN(secs) || secs === 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper: Format bytes -> MB
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Video metadata loading (duration)
  const handleVideoFileSelection = (file) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file (MP4, MOV, AVI)");
      return;
    }

    // Validation: max size 200MB
    if (file.size > 200 * 1024 * 1024) {
      toast.error("Video size exceeds 200MB limit");
      return;
    }

    setVideoFile(file);
    setVideoSize(file.size);
    setVideoUrl("");
    setVideoProgress(0);

    // Extract video duration using hidden video element
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.src = URL.createObjectURL(file);
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      setVideoDuration(videoEl.duration);
    };
  };

  // Thumbnail file selection
  const handleThumbFileSelection = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    // Validation: max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail size exceeds 5MB limit");
      return;
    }

    setThumbnailFile(file);
    setThumbnailUrl("");
    setThumbnailProgress(0);
  };

  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const isAllowedDocument = (file) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return allowedDocumentTypes.includes(file.type) || ["pdf", "doc", "docx", "txt"].includes(extension);
  };

  const handleDocumentSelection = (files) => {
    const selected = Array.from(files || []);
    if (selected.length === 0) return;

    const validFiles = [];
    selected.forEach((file) => {
      if (!isAllowedDocument(file)) {
        toast.error(`${file.name} is not a supported document`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 25MB document limit`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setDocumentFiles((prev) => [...prev, ...validFiles]);
      setUploadedDocuments([]);
      setDocumentProgress(0);
    }
  };

  const removeDocumentFile = (indexToRemove) => {
    setDocumentFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ==========================================
  // CLOUDFLARE R2 UPLOAD WORKFLOW (Backend Proxy)
  // ==========================================
  const uploadAsset = async (file, purpose, setProgress, setIsUploading) => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Convert file to Base64 for transmission
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = reader.result.split(',')[1]; // Remove data:image/png;base64, prefix

            // Upload through backend API endpoint
            const uploadResponse = await api.post("/videos/upload", {
              fileName: file.name,
              fileType: file.type,
              purpose,
              fileData: base64Data,
            }, {
              onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percent);
              },
            });

            const { downloadUrl, key, isMock } = uploadResponse.data;

            const label = purpose === "video" ? "Video" : purpose === "thumbnail" ? "Thumbnail" : "Document";
            if (isMock) {
              toast.success(`${label} uploaded (Simulation Mode)`);
            } else {
              toast.success(`${label} uploaded successfully to R2!`);
            }

            setIsUploading(false);
            resolve({ downloadUrl, key });
          } catch (error) {
            console.error(`${purpose} upload error:`, error);
            setIsUploading(false);
            setProgress(0);
            toast.error(`Failed to upload ${purpose}. Please try again.`);
            reject(error);
          }
        };

        reader.onerror = () => {
          setIsUploading(false);
          setProgress(0);
          toast.error(`Failed to read ${purpose} file`);
          reject(new Error(`Failed to read ${purpose} file`));
        };

        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error(`${purpose} upload error:`, error);
      setIsUploading(false);
      setProgress(0);
      toast.error(`Failed to upload ${purpose}. Please try again.`);
      throw error;
    }
  };

  // Save Video Metadata Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/videos", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Video metadata saved and published successfully!");
      navigate("/admin/video-manage");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save video metadata");
    },
  });

  const handleUploadAndSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Video title is required");
    if (!category) return toast.error("Category selection is required");
    if (!courseId) return toast.error("Please select a course to attach the video to");
    if (!moduleName.trim()) return toast.error("Please specify a module name");
    if (!videoOrder) return toast.error("Please specify a video order number");
    if (!videoFile && !videoUrl) return toast.error("Please upload or provide a video file");
    if (!thumbnailFile && !thumbnailUrl) return toast.error("Please upload or provide a thumbnail image");

    try {
      let finalVideoUrl = videoUrl;
      let finalVideoKey = videoKey;
      let finalThumbnailUrl = thumbnailUrl;
      let finalThumbnailKey = thumbnailKey;
      let finalDocuments = uploadedDocuments;

      // 1. Upload Video if a new file is chosen
      if (videoFile) {
        const videoRes = await uploadAsset(videoFile, "video", setVideoProgress, setIsUploadingVideo);
        finalVideoUrl = videoRes.downloadUrl;
        finalVideoKey = videoRes.key;
        setVideoUrl(finalVideoUrl);
        setVideoKey(finalVideoKey);
      }

      // 2. Upload Thumbnail if a new file is chosen
      if (thumbnailFile) {
        const thumbRes = await uploadAsset(thumbnailFile, "thumbnail", setThumbnailProgress, setIsUploadingThumbnail);
        finalThumbnailUrl = thumbRes.downloadUrl;
        finalThumbnailKey = thumbRes.key;
        setThumbnailUrl(finalThumbnailUrl);
        setThumbnailKey(finalThumbnailKey);
      }

      // 3. Upload supporting documents if selected
      if (documentFiles.length > 0) {
        setIsUploadingDocuments(true);
        const uploaded = [];
        for (let i = 0; i < documentFiles.length; i += 1) {
          const file = documentFiles[i];
          const docRes = await uploadAsset(file, "document", setDocumentProgress, setIsUploadingDocuments);
          uploaded.push({
            name: file.name,
            url: docRes.downloadUrl,
            key: docRes.key,
            type: file.type,
            size: file.size,
          });
          setDocumentProgress(Math.round(((i + 1) / documentFiles.length) * 100));
        }
        finalDocuments = uploaded;
        setUploadedDocuments(uploaded);
        setIsUploadingDocuments(false);
      }

      // 4. Save details to MongoDB
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        thumbnailUrl: finalThumbnailUrl,
        videoUrl: finalVideoUrl,
        duration: Math.round(videoDuration),
        fileSize: videoSize,
        documents: finalDocuments,
        courseId,
        moduleName: moduleName.trim(),
        videoOrder: Number(videoOrder),
      };

      saveMutation.mutate(payload);

    } catch (err) {
      console.error("Submission pipeline failed:", err);
    }
  };

  if (loading || loadingCats || loadingCourses) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#A855F7] animate-spin mx-auto mb-4" />
          <p className="text-[#C7C3D6]">Initializing Uploader...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 pb-12 transition-colors duration-300">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-8">
        {/* Header Block */}
        <div className="border-b border-[rgba(139,92,246,0.15)] pb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9A93B5] font-semibold uppercase tracking-wider">Storage Control</p>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Upload New Video</h1>
            <p className="text-[#C7C3D6] text-sm mt-1">Publish metadata to database and media assets directly to Cloudflare R2</p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleUploadAndSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Form details */}
          <div className="lg:col-span-2 space-y-6 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-[rgba(139,92,246,0.1)]">
              <Film className="w-5 h-5 text-[#A855F7]" />
              <span>Video Metadata</span>
            </h2>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white">Video Title</label>
              <input
                type="text"
                placeholder="e.g. Introduction to Neural Networks"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                required
              />
            </div>

            {/* Course & Module Association */}
            <div className="p-5 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.03)] space-y-4">
              <h3 className="text-sm font-bold text-[#C084FC] uppercase tracking-wide">Course Association</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Selection */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white">Select Course</label>
                  <select
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      setModuleName(""); // reset module name on course change
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id} className="bg-[#1a152c]">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Video Order / Position */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white">Video Order / Position</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={videoOrder}
                    onChange={(e) => setVideoOrder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                    required={!!courseId}
                  />
                </div>
              </div>

              {/* Module Name Selection / Entry */}
              {courseId && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">Module Name</label>
                  <input
                    type="text"
                    placeholder="Enter new module name or select one below..."
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                    required={!!courseId}
                  />
                  {/* List of existing modules as quick buttons */}
                  {(() => {
                    const selectedCourse = courses.find((c) => c._id === courseId);
                    const existingModules = selectedCourse?.modules || [];
                    if (existingModules.length > 0) {
                      return (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] text-[#9A93B5] block font-medium">Quick-select existing module:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {existingModules.map((m) => (
                              <button
                                key={m._id || m.title}
                                type="button"
                                onClick={() => setModuleName(m.title)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                  moduleName === m.title
                                    ? "bg-[#A855F7] border-[#A855F7] text-white"
                                    : "bg-[rgba(26,21,44,0.5)] border-[rgba(139,92,246,0.15)] text-[#C7C3D6] hover:border-[#A855F7]"
                                }`}
                              >
                                {m.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-white">Category Selection</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] hover:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm text-left flex justify-between items-center transition-all"
                >
                  <span>{category || "Click to open category menu..."}</span>
                  <span className="text-[#9A93B5]">📂</span>
                </button>
                {category && (
                  <div className="text-xs text-[#A855F7] font-semibold flex items-center gap-2 pt-1">
                    <CheckCircle className="w-4 h-4" />
                    Selected: <span className="text-white">{category}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-white">Tags (Press Enter or comma to add)</label>
                <input
                  type="text"
                  placeholder="e.g. artificial intelligence, deep learning"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                />
              </div>
            </div>

            {/* Tags Badge List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag, idx) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(139,92,246,0.15)] text-[#C084FC] border border-[rgba(139,92,246,0.25)]"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="p-0.5 rounded-full hover:bg-[rgba(139,92,246,0.3)] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white">Description</label>
              <textarea
                rows={5}
                placeholder="Write a clear summary explaining this video's contents, key takeaways, and outline..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm resize-none"
              />
            </div>
          </div>

          {/* Right Column: Files Drag and Drop uploads */}
          <div className="space-y-6">

            {/* Video File Area */}
            <div className="bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-[rgba(139,92,246,0.1)]">
                <Film className="w-4 h-4 text-[#A855F7]" />
                <span>Upload Video Asset</span>
              </h3>

              {videoFile ? (
                <div className="space-y-3 bg-[rgba(26,21,44,0.5)] border border-[rgba(139,92,246,0.2)] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-semibold truncate max-w-[150px]">{videoFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setVideoFile(null); setVideoProgress(0); }}
                      className="text-[#9A93B5] hover:text-white"
                      disabled={isUploadingVideo}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between text-xs text-[#C7C3D6] font-semibold">
                    <span>Size: {formatBytes(videoSize)}</span>
                    <span>Duration: {formatDuration(videoDuration)}</span>
                  </div>

                  {isUploadingVideo && (
                    <div className="space-y-1.5 pt-2">
                      <div className="w-full bg-[rgba(139,92,246,0.1)] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#C7C3D6]">
                        <span>Uploading...</span>
                        <span>{videoProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsVideoDragActive(true); }}
                  onDragLeave={() => setIsVideoDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsVideoDragActive(false);
                    if (e.dataTransfer.files?.[0]) handleVideoFileSelection(e.dataTransfer.files[0]);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${isVideoDragActive
                    ? "border-[#A855F7] bg-[rgba(139,92,246,0.1)]"
                    : "border-[rgba(139,92,246,0.25)] hover:border-[#A855F7] hover:bg-[rgba(139,92,246,0.02)]"
                    }`}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <UploadCloud className="w-10 h-10 mx-auto text-[#9A93B5] group-hover:scale-105 transition-transform" />
                  <p className="text-xs font-semibold text-white mt-3">Drag & drop video or click</p>
                  <p className="text-[10px] text-[#9A93B5] mt-1">MP4, MOV, AVI up to 200MB</p>

                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleVideoFileSelection(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Image Area */}
            <div className="bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-[rgba(139,92,246,0.1)]">
                <ImageIcon className="w-4 h-4 text-[#A855F7]" />
                <span>Upload Video Thumbnail</span>
              </h3>

              {thumbnailFile ? (
                <div className="space-y-3 bg-[rgba(26,21,44,0.5)] border border-[rgba(139,92,246,0.2)] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-semibold truncate max-w-[150px]">{thumbnailFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setThumbnailFile(null); setThumbnailProgress(0); }}
                      className="text-[#9A93B5] hover:text-white"
                      disabled={isUploadingThumbnail}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Local Thumbnail Preview */}
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-[rgba(139,92,246,0.1)]">
                    <img
                      src={URL.createObjectURL(thumbnailFile)}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isUploadingThumbnail && (
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full bg-[rgba(139,92,246,0.1)] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${thumbnailProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#C7C3D6]">
                        <span>Uploading...</span>
                        <span>{thumbnailProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsThumbDragActive(true); }}
                  onDragLeave={() => setIsThumbDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsThumbDragActive(false);
                    if (e.dataTransfer.files?.[0]) handleThumbFileSelection(e.dataTransfer.files[0]);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${isThumbDragActive
                    ? "border-[#A855F7] bg-[rgba(139,92,246,0.1)]"
                    : "border-[rgba(139,92,246,0.25)] hover:border-[#A855F7] hover:bg-[rgba(139,92,246,0.02)]"
                    }`}
                  onClick={() => thumbInputRef.current?.click()}
                >
                  <UploadCloud className="w-10 h-10 mx-auto text-[#9A93B5] group-hover:scale-105 transition-transform" />
                  <p className="text-xs font-semibold text-white mt-3">Drag & drop thumbnail or click</p>
                  <p className="text-[10px] text-[#9A93B5] mt-1">PNG, JPG, WEBP up to 5MB</p>

                  <input
                    type="file"
                    ref={thumbInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleThumbFileSelection(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Supporting Documents Area */}
            <div className="bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-[rgba(139,92,246,0.1)]">
                <FileText className="w-4 h-4 text-[#A855F7]" />
                <span>Attach Documents</span>
              </h3>

              {documentFiles.length > 0 && (
                <div className="space-y-2">
                  {documentFiles.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="flex items-center justify-between gap-3 bg-[rgba(26,21,44,0.5)] border border-[rgba(139,92,246,0.2)] rounded-xl p-3">
                      <div className="min-w-0">
                        <p className="text-xs text-white font-semibold truncate">{file.name}</p>
                        <p className="text-[10px] text-[#9A93B5]">{formatBytes(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocumentFile(idx)}
                        className="text-[#9A93B5] hover:text-white shrink-0"
                        disabled={isUploadingDocuments}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDocDragActive(true); }}
                onDragLeave={() => setIsDocDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDocDragActive(false);
                  handleDocumentSelection(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${isDocDragActive
                  ? "border-[#A855F7] bg-[rgba(139,92,246,0.1)]"
                  : "border-[rgba(139,92,246,0.25)] hover:border-[#A855F7] hover:bg-[rgba(139,92,246,0.02)]"
                  }`}
                onClick={() => docInputRef.current?.click()}
              >
                <UploadCloud className="w-9 h-9 mx-auto text-[#9A93B5]" />
                <p className="text-xs font-semibold text-white mt-3">Attach PDF, DOC, DOCX or TXT</p>
                <p className="text-[10px] text-[#9A93B5] mt-1">Multiple files, up to 25MB each</p>
                <input
                  type="file"
                  ref={docInputRef}
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  multiple
                  onChange={(e) => handleDocumentSelection(e.target.files)}
                  className="hidden"
                />
              </div>

              {isUploadingDocuments && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-[rgba(139,92,246,0.1)] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${documentProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#C7C3D6]">
                    <span>Uploading documents...</span>
                    <span>{documentProgress}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Block */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={
                  isUploadingVideo ||
                  isUploadingThumbnail ||
                  isUploadingDocuments ||
                  saveMutation.isPending
                }
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white hover:opacity-95 font-bold shadow-lg transition-transform active:scale-[0.98] duration-150"
              >
                {(isUploadingVideo || isUploadingThumbnail || isUploadingDocuments || saveMutation.isPending) ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing & Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Upload & Publish Video</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/video-manage")}
                className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-2xl border border-[rgba(139,92,246,0.3)] text-[#C7C3D6] hover:bg-[rgba(139,92,246,0.1)] transition-colors text-sm font-semibold"
              >
                Cancel and Return
              </button>
            </div>

          </div>
        </form>

        {/* Draggable Category Menu */}
        {isCategoryMenuOpen && (
          <div
            ref={menuRef}
            className="fixed z-50 min-w-[400px] bg-[rgba(30,27,51,0.95)] border border-[rgba(139,92,246,0.3)] rounded-2xl shadow-2xl backdrop-blur-xl"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              cursor: isDraggingMenu ? "grabbing" : "grab",
            }}
          >
            {/* Draggable Header */}
            <div
              onMouseDown={handleMenuMouseDown}
              className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(139,92,246,0.2)] bg-gradient-to-r from-[rgba(139,92,246,0.1)] to-[rgba(236,72,153,0.05)] rounded-t-2xl cursor-grab active:cursor-grabbing transition-colors"
            >
              <GripVertical className="w-5 h-5 text-[#A855F7]" />
              <h3 className="text-sm font-bold text-white flex-1">Select Video Category</h3>
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen(false)}
                className="p-1 hover:bg-[rgba(139,92,246,0.2)] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#C7C3D6]" />
              </button>
            </div>

            {/* Categories Grid */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {loadingCats ? (
                <div className="text-center py-8 text-[#9A93B5]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-[#9A93B5]">
                  <p className="text-xs">No categories available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.name);
                        setIsCategoryMenuOpen(false);
                        toast.success(`Category selected: ${cat.name}`);
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 flex items-center justify-between group ${category === cat.name
                        ? "bg-gradient-to-r from-[#A855F7] to-[#EC4899] border-[#A855F7] text-white shadow-lg"
                        : "bg-[rgba(26,21,44,0.6)] border-[rgba(139,92,246,0.2)] text-[#C7C3D6] hover:border-[#A855F7] hover:bg-[rgba(139,92,246,0.2)]"
                        }`}
                    >
                      <span>{cat.name}</span>
                      {category === cat.name && <CheckCircle className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="px-4 py-3 border-t border-[rgba(139,92,246,0.2)] bg-[rgba(26,21,44,0.3)] rounded-b-2xl text-xs text-[#9A93B5]">
              {category ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-[#A855F7]" />
                  <span>Selected: <span className="text-white font-semibold">{category}</span></span>
                </div>
              ) : (
                <span>👆 Click a category to select it</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
