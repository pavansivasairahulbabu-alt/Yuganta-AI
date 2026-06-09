import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  Trash2, Pencil, CheckSquare, Square, AlertCircle, Loader2, 
  X, Eye, Calendar, Clock, Film, UploadCloud, ShieldAlert, Play
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import api from "../config/axios";

export default function AdminVideoManage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  // Table filters & paging states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("uploadDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Selected videos for bulk operations
  const [selectedIds, setSelectedIds] = useState([]);

  // Preview Video modal state
  const [previewVideo, setPreviewVideo] = useState(null);

  // Edit Video modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editTagInput, setEditTagInput] = useState("");
  
  // Course Association states
  const [courseId, setCourseId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [videoOrder, setVideoOrder] = useState("");
  
  // Edit replacements
  const [newThumbFile, setNewThumbFile] = useState(null);
  const [editThumbUrl, setEditThumbUrl] = useState("");
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);
  const thumbInputRef = useRef(null);

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    }
    setLoading(false);
  }, [navigate]);

  // Fetch categories for filtering and dropdowns
  const { data: categories = [] } = useQuery({
    queryKey: ["video-categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
    enabled: !loading,
  });

  // Fetch courses for assignment
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const res = await api.get("/courses");
      return res.data;
    },
    enabled: !loading,
  });

  // Fetch videos list
  const { data: videoData = { videos: [], pagination: { totalPages: 1, totalVideos: 0 } }, isLoading } = useQuery({
    queryKey: ["admin-videos", search, category, sortBy, sortOrder, page],
    queryFn: async () => {
      const res = await api.get("/videos", {
        params: {
          page,
          limit,
          search,
          category,
          sortBy,
          sortOrder,
        }
      });
      return res.data;
    },
    enabled: !loading,
  });

  const { videos, pagination } = videoData;

  // Mutation: Update Video details
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/videos/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-videos"]);
      toast.success("Video updated successfully!");
      closeEditModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update video metadata");
    }
  });

  // Mutation: Delete single video
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/videos/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-videos"]);
      toast.success("Video deleted successfully!");
      setSelectedIds(prev => prev.filter(x => x !== deleteMutation.variables));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete video");
    }
  });

  // Mutation: Bulk Delete videos
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const res = await api.post("/videos/bulk-delete", { ids });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["admin-videos"]);
      toast.success(data.message || "Selected videos deleted successfully!");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete selected videos");
    }
  });

  // ==========================================
  // BULK & SELECTION HELPERS
  // ==========================================
  const toggleSelectAll = () => {
    if (selectedIds.length === videos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(videos.map(v => v._id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you absolutely sure you want to delete ${selectedIds.length} video(s)? This will permanently remove their cloud files.`)) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const handleDeleteOne = (id, title) => {
    if (window.confirm(`Are you sure you want to delete the video "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // ==========================================
  // EDIT MODAL WORKFLOWS
  // ==========================================
  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDesc(video.description || "");
    setEditCategory(video.category);
    setEditTags(video.tags || []);
    setEditThumbUrl(video.thumbnailUrl || "");
    setNewThumbFile(null);
    setThumbProgress(0);

    let foundCourseId = "";
    let foundModuleName = "";
    let foundOrder = "";
    
    if (courses && courses.length > 0) {
      for (const course of courses) {
        if (course.modules) {
          for (const module of course.modules) {
            if (module.videos) {
              const v = module.videos.find(vid => vid.url === video.videoUrl || vid.title === video.title);
              if (v) {
                foundCourseId = course._id;
                foundModuleName = module.title;
                foundOrder = v.order || "";
                break;
              }
            }
          }
        }
        if (foundCourseId) break;
      }
    }

    setCourseId(foundCourseId);
    setModuleName(foundModuleName);
    setVideoOrder(foundOrder);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingVideo(null);
    setIsEditModalOpen(false);
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = editTagInput.trim().replace(/,/g, "");
      if (cleaned && !editTags.includes(cleaned)) {
        setEditTags([...editTags, cleaned]);
        setEditTagInput("");
      }
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setEditTags(editTags.filter((_, idx) => idx !== indexToRemove));
  };

  const uploadThumbnailReplacement = async (file) => {
    setIsUploadingThumb(true);
    setThumbProgress(0);
    try {
      const presignResponse = await api.post("/videos/presign", {
        fileName: file.name,
        fileType: file.type,
        purpose: "thumbnail",
      });

      const { uploadUrl, downloadUrl, isMock } = presignResponse.data;

      if (isMock) {
        for (let p = 0; p <= 100; p += 20) {
          setThumbProgress(p);
          await new Promise((r) => setTimeout(r, 100));
        }
        setIsUploadingThumb(false);
        setEditThumbUrl(downloadUrl);
        toast.success("Thumbnail replaced (Simulation Mode)");
        return;
      }

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (ev) => {
          setThumbProgress(Math.round((ev.loaded * 100) / ev.total));
        },
      });

      setIsUploadingThumb(false);
      setEditThumbUrl(downloadUrl);
      toast.success("Thumbnail replaced successfully!");
    } catch (err) {
      console.error(err);
      setIsUploadingThumb(false);
      setThumbProgress(0);
      toast.error("Thumbnail upload failed");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return toast.error("Title is required");
    if (!editCategory) return toast.error("Category is required");

    try {
      let finalThumbUrl = editThumbUrl;

      if (newThumbFile) {
        // Trigger upload before saving metadata
        await uploadThumbnailReplacement(newThumbFile);
      }

      const payload = {
        title: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory,
        tags: editTags,
        thumbnailUrl: finalThumbUrl,
      };

      updateMutation.mutate({ id: editingVideo._id, payload });
    } catch (err) {
      console.error(err);
    }
  };

  // Helper formatting
  const formatDuration = (secs) => {
    if (!secs) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#A855F7] animate-spin mx-auto mb-4" />
          <p className="text-[#C7C3D6]">Loading Videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 pb-12 transition-colors duration-300">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[rgba(139,92,246,0.15)] pb-6">
          <div>
            <p className="text-xs text-[#9A93B5] font-semibold uppercase tracking-wider">Video Assets</p>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Manage Videos</h1>
            <p className="text-[#C7C3D6] text-sm mt-1">Review video metadata, views, sizes, and cloud media objects</p>
          </div>
          
          <button
            onClick={() => navigate("/admin/video-upload")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white hover:opacity-90 font-semibold shadow-lg transition-transform hover:-translate-y-0.5 duration-200"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload Video</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-2xl p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#C7C3D6]" />
            <input
              type="text"
              placeholder="Search by title, description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.2)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-3 w-4 h-4 text-[#C7C3D6]" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.2)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => toggleSort("uploadDate")}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                sortBy === "uploadDate" 
                  ? "bg-[rgba(139,92,246,0.15)] text-[#C084FC] border-[#A855F7]" 
                  : "bg-transparent text-[#C7C3D6] border-[rgba(139,92,246,0.2)]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Sort Date</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => toggleSort("views")}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                sortBy === "views" 
                  ? "bg-[rgba(139,92,246,0.15)] text-[#C084FC] border-[#A855F7]" 
                  : "bg-transparent text-[#C7C3D6] border-[rgba(139,92,246,0.2)]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Sort Views</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Selected bar for bulk delete */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl animate-fade-in text-[#F87171] text-sm font-semibold">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{selectedIds.length} video(s) selected for administration</span>
            </div>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#EF4444] text-white hover:bg-[#DC2626] rounded-xl font-bold transition-all shadow-md text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete</span>
            </button>
          </div>
        )}

        {/* Videos Table */}
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.1)] rounded-3xl text-center">
            <Film className="w-16 h-16 text-[#A855F7]/40 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white">No videos matched</h3>
            <p className="text-[#C7C3D6] text-sm mt-2 max-w-md">Try modifying your search text, category filter selection, or publish a new video.</p>
          </div>
        ) : (
          <div className="bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.03)] text-xs text-[#9A93B5] uppercase font-bold tracking-wider">
                    <th className="py-4 px-6 w-10">
                      <button onClick={toggleSelectAll} className="p-1 rounded text-white hover:bg-[rgba(139,92,246,0.15)] transition-colors">
                        {selectedIds.length === videos.length ? (
                          <CheckSquare className="w-4 h-4 text-[#A855F7]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#9A93B5]" />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 w-40">Preview</th>
                    <th className="py-4 px-4">Title & Details</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Views</th>
                    <th className="py-4 px-4">File Size</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(139,92,246,0.1)] text-sm">
                  {videos.map((video) => {
                    const isSelected = selectedIds.includes(video._id);
                    return (
                      <tr 
                        key={video._id}
                        className={`hover:bg-[rgba(139,92,246,0.06)] transition-colors ${
                          isSelected ? "bg-[rgba(139,92,246,0.04)]" : ""
                        }`}
                      >
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => toggleSelectOne(video._id)}
                            className="p-1 rounded text-white hover:bg-[rgba(139,92,246,0.15)] transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#A855F7]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#9A93B5]" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div 
                            onClick={() => setPreviewVideo(video)}
                            className="relative aspect-video w-32 bg-black rounded-lg overflow-hidden border border-[rgba(139,92,246,0.15)] group cursor-pointer"
                          >
                            <img
                              src={video.thumbnailUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300"}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                              <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                                <Play className="w-4 h-4 text-white fill-current" />
                              </div>
                            </div>
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono font-bold flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDuration(video.duration)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <h4 className="font-bold text-white truncate hover:text-[#C084FC] transition-colors" title={video.title}>
                            {video.title}
                          </h4>
                          <p className="text-xs text-[#9A93B5] truncate mt-0.5 leading-relaxed">
                            {video.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-[#C7C3D6] mt-2 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(video.uploadDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[rgba(139,92,246,0.15)] text-[#C084FC] border border-[rgba(139,92,246,0.25)]">
                            {video.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-white">
                          {video.views.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-[#C7C3D6] font-mono text-xs">
                          {formatSize(video.fileSize)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewVideo(video)}
                              className="p-2 rounded-lg text-[#C7C3D6] hover:text-[#10B981] hover:bg-[rgba(16,185,129,0.1)] transition-colors"
                              title="Preview Video"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(video)}
                              className="p-2 rounded-lg text-[#C7C3D6] hover:text-[#A855F7] hover:bg-[rgba(139,92,246,0.1)] transition-colors"
                              title="Edit Video"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOne(video._id, video.title)}
                              className="p-2 rounded-lg text-[#C7C3D6] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                              title="Delete Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.02)]">
                <div className="text-xs text-[#9A93B5] font-semibold">
                  Page <span className="text-white">{page}</span> of <span className="text-white">{pagination.totalPages}</span> ({pagination.totalVideos} total videos)
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-[rgba(139,92,246,0.2)] text-[#C7C3D6] hover:bg-[rgba(139,92,246,0.1)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={page === pagination.totalPages}
                    className="p-1.5 rounded-lg border border-[rgba(139,92,246,0.2)] text-[#C7C3D6] hover:bg-[rgba(139,92,246,0.1)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Edit Video Overlay Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#130E26] border border-[rgba(139,92,246,0.3)] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 p-2 text-[#C7C3D6] hover:text-white rounded-lg hover:bg-[rgba(139,92,246,0.1)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Pencil className="w-6 h-6 text-[#A855F7]" />
                <span>Edit Video Metadata</span>
              </h2>
              <p className="text-sm text-[#C7C3D6]">Modify metadata or replace thumbnail preview for this video asset.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form columns */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.15)] rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-[#C084FC] flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span>Curriculum Course Association</span>
                  </h3>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#C7C3D6]">Select Course (Optional)</label>
                    <select
                      value={courseId}
                      onChange={(e) => {
                        setCourseId(e.target.value);
                        setModuleName("");
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.9)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                    >
                      <option value="">No Course (Standalone Video)</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {courseId && (
                    <div className="space-y-3 animate-fade-in pt-2 border-t border-[rgba(139,92,246,0.1)]">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#C7C3D6]">Module Name</label>
                        <input
                          type="text"
                          value={moduleName}
                          onChange={(e) => setModuleName(e.target.value)}
                          placeholder="e.g. Introduction to React"
                          className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.9)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                          required={!!courseId}
                        />
                        {courses.find(c => c._id === courseId)?.modules?.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-2">
                            {courses.find(c => c._id === courseId).modules.map((mod, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setModuleName(mod.title)}
                                className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${moduleName === mod.title ? 'bg-[rgba(139,92,246,0.2)] border-[#A855F7] text-white' : 'border-[rgba(139,92,246,0.2)] text-[#C7C3D6] hover:bg-[rgba(139,92,246,0.1)]'}`}
                              >
                                {mod.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#C7C3D6]">Video Order / Position</label>
                        <input
                          type="number"
                          value={videoOrder}
                          onChange={(e) => setVideoOrder(e.target.value)}
                          placeholder="Leave empty to auto-append"
                          className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.9)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white">Tags (Press Enter or comma to add)</label>
                  <input
                    type="text"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="e.g. cloud, aws, devops"
                    className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                  />
                  {editTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {editTags.map((tag, idx) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[rgba(139,92,246,0.15)] text-[#C084FC]">
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(idx)} className="hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white">Description</label>
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm resize-none"
                  />
                </div>
              </div>

              {/* Media management column */}
              <div className="space-y-4 flex flex-col justify-between">
                
                {/* Thumbnail selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">Thumbnail Preview</label>
                  <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-[rgba(139,92,246,0.2)]">
                    <img
                      src={newThumbFile ? URL.createObjectURL(newThumbFile) : editThumbUrl}
                      alt="Thumbnail Replacement Preview"
                      className="w-full h-full object-cover"
                    />
                    
                    <button
                      type="button"
                      onClick={() => thumbInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity cursor-pointer duration-200"
                    >
                      <UploadCloud className="w-5 h-5" />
                      <span>Replace Image</span>
                    </button>
                  </div>
                  
                  <input
                    type="file"
                    ref={thumbInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setNewThumbFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />

                  {isUploadingThumb && (
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div className="bg-[#A855F7] h-1.5 rounded-full" style={{ width: `${thumbProgress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-[#C7C3D6]">
                        <span>Uploading...</span>
                        <span>{thumbProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video playback preview if configured */}
                <div className="p-4 bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.15)] rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Play className="w-4 h-4 text-[#A855F7]" />
                    <span>Media URL (Published)</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#9A93B5] break-all truncate select-all" title={editingVideo.videoUrl}>
                    {editingVideo.videoUrl}
                  </p>
                  
                  <div className="flex justify-between text-[10px] text-[#C7C3D6] pt-1">
                    <span>Duration: {formatDuration(editingVideo.duration)}</span>
                    <span>File size: {formatSize(editingVideo.fileSize)}</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-xl text-[#C7C3D6] hover:bg-[rgba(139,92,246,0.1)] transition-colors text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending || isUploadingThumb}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-semibold shadow-md hover:opacity-95 transition-opacity text-sm flex items-center gap-1.5"
                  >
                    {updateMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Play Video Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#130E26] border border-[rgba(139,92,246,0.3)] rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-4 right-4 p-2 text-[#C7C3D6] hover:text-white rounded-lg hover:bg-[rgba(139,92,246,0.1)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-10">
              <h2 className="text-xl font-bold text-white truncate">{previewVideo.title}</h2>
              <p className="text-xs text-[#9A93B5] flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[rgba(139,92,246,0.1)] text-[#C084FC] font-semibold">{previewVideo.category}</span>
                <span>•</span>
                <span>Size: {formatSize(previewVideo.fileSize)}</span>
                <span>•</span>
                <span>Duration: {formatDuration(previewVideo.duration)}</span>
              </p>
            </div>

            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-[rgba(139,92,246,0.2)] shadow-inner">
              <video
                src={previewVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={previewVideo.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="bg-[rgba(26,21,44,0.4)] border border-[rgba(139,92,246,0.08)] rounded-xl p-4 text-sm">
              <h4 className="font-semibold text-white mb-1">Description:</h4>
              <p className="text-[#C7C3D6] text-xs leading-relaxed max-h-24 overflow-y-auto pr-2">
                {previewVideo.description || "No description provided."}
              </p>
            </div>
            
            <div className="flex justify-between items-center pt-2 gap-4">
              <p className="text-[10px] font-mono text-[#9A93B5] select-all truncate max-w-xl" title={previewVideo.videoUrl}>
                URL: {previewVideo.videoUrl}
              </p>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="px-5 py-2 rounded-xl border border-[rgba(139,92,246,0.3)] text-[#C7C3D6] hover:bg-[rgba(139,92,246,0.1)] transition-colors text-sm font-semibold shrink-0"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
