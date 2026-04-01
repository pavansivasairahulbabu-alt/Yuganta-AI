import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";

export default function AdminCourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    thumbnail: "",
    price: "Free",
    isFree: true,
    instructor: "",
    instructorId: "",
    modules: [],
  });
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [expandedModuleIndex, setExpandedModuleIndex] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState({});
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDescription, setNewVideoDescription] = useState("");
  const [newVideoFile, setNewVideoFile] = useState(null);

  const categories = [
    "DSA",
    "Python",
    "GenAI",
    "Data Science",
    "Machine Learning",
    "Web Development",
    "Cloud Computing",
    "Interview Prep",
  ];

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    } else {
      fetchCourses();
      fetchInstructors();
    }
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Fetch courses error:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/instructors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch instructors");

      const data = await response.json();
      setInstructors(data);
    } catch (error) {
      console.error("Fetch instructors error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
      setFormData({ ...formData, thumbnail: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      thumbnail: course.thumbnail,
      price: course.price,
      isFree: course.isFree,
      instructor: course.instructor,
      instructorId: course.instructorId?._id || "",
      modules: course.modules || [],
    });
    setThumbnailPreview(course.thumbnail);
    setShowEditModal(true);
  };

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }

    const newModule = {
      title: newModuleTitle,
      description: newModuleDescription,
      order: formData.modules.length + 1,
      videos: [],
    };

    setFormData({
      ...formData,
      modules: [...formData.modules, newModule],
    });

    setNewModuleTitle("");
    setNewModuleDescription("");
    setShowAddModuleForm(false);
    toast.success("Module added");
  };

  const handleRemoveModule = (index) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: updatedModules });
    toast.success("Module removed");
  };

  const handleAddVideoToModule = async (moduleIndex) => {
    if (!newVideoTitle.trim() || !newVideoFile) {
      toast.error("Please enter video title and select a file");
      return;
    }

    try {
      toast.loading("Uploading video...");
      setUploadingVideo({ ...uploadingVideo, [moduleIndex]: true });

      const formDataForUpload = new FormData();
      formDataForUpload.append("video", newVideoFile);

      const token = localStorage.getItem("adminToken");
      const uploadRes = await fetch(`${API_URL}/api/admin/upload-video`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataForUpload,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Video upload failed");
      }

      // Add video to module
      const updatedModules = [...formData.modules];
      updatedModules[moduleIndex].videos = updatedModules[moduleIndex].videos || [];
      updatedModules[moduleIndex].videos.push({
        title: newVideoTitle,
        url: uploadData.url,
        publicId: uploadData.publicId,
        duration: uploadData.duration || "",
        description: newVideoDescription,
        _id: Date.now().toString(),
      });

      setFormData({ ...formData, modules: updatedModules });

      toast.dismiss();
      toast.success("Video added successfully");
      setNewVideoTitle("");
      setNewVideoDescription("");
      setNewVideoFile(null);
      setExpandedModuleIndex(null);
    } catch (error) {
      toast.dismiss();
      console.error("Video upload error:", error);
      toast.error(error.message || "Failed to upload video");
    } finally {
      setUploadingVideo({ ...uploadingVideo, [moduleIndex]: false });
    }
  };

  const handleRemoveVideo = (moduleIndex, videoIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].videos = (updatedModules[moduleIndex].videos || []).filter(
      (_, i) => i !== videoIndex
    );
    setFormData({ ...formData, modules: updatedModules });
    toast.success("Video removed");
  };

  const handleSaveCourse = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      toast.loading("Saving course...");
      const token = localStorage.getItem("adminToken");
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        thumbnail: formData.thumbnail,
        price: formData.price,
        isFree: formData.isFree,
        instructor: formData.instructor,
        instructorId: formData.instructorId,
        modules: formData.modules,
      };

      console.log("📝 Sending update payload:", payload);

      const response = await fetch(`${API_URL}/api/admin/courses/${editingCourse._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("❌ Update error:", responseData);
        throw new Error(responseData.message || "Failed to update course");
      }

      toast.dismiss();
      toast.success("Course updated successfully");
      setShowEditModal(false);
      fetchCourses();
    } catch (error) {
      toast.dismiss();
      console.error("Save course error:", error);
      toast.error(error.message || "Failed to save course");
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      return;
    }

    try {
      toast.loading("Deleting course...");
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast.dismiss();
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.dismiss();
      console.error("Delete course error:", error);
      toast.error("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <svg className='w-12 h-12 text-[#A855F7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
            </svg>
          </div>
          <p className="text-[#C7C3D6]">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 md:pt-28 pb-16">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider">Management</p>
          <h1 className="text-5xl md:text-6xl font-bold">Course Management</h1>
          <p className="text-[#C7C3D6] mt-3 text-lg">
            Manage all courses: edit details, modules, content, thumbnail, and instructors
          </p>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:outline-none focus:border-[#A855F7] transition-colors"
            >
              <option value="All" className="bg-[var(--bg-card)] text-[var(--text-color)]">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[var(--bg-card)] text-[var(--text-color)]">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#A855F7]">Course Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#A855F7]">Instructor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#A855F7]">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#A855F7]">Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#A855F7]">Modules</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#A855F7]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course._id} className="border-b border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.05)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {course.thumbnail && (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-white max-w-xs truncate">{course.title}</p>
                            <p className="text-xs text-[#9A93B5] max-w-xs truncate">{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="text-white font-medium">{course.instructor || "N/A"}</p>
                          {course.instructorId && (
                            <p className="text-xs text-[#9A93B5]">{course.instructorId.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-[rgba(168,85,247,0.2)] border border-[#A855F7] text-[#A855F7] rounded-full text-xs font-semibold">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-[rgba(59,130,246,0.2)] border border-[#3B82F6] text-[#3B82F6] rounded-full text-xs font-semibold">
                          {course.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#C7C3D6]">
                        {course.modules?.length || 0} modules
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(course)}
                            className="px-4 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-lg font-semibold transition-colors text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id, course.title)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#9A93B5]">
                      No courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[rgba(139,92,246,0.3)] shadow-[0_20px_60px_rgba(139,92,246,0.3)]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[rgba(139,92,246,0.3)] px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Course</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#9A93B5] hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#A855F7] mb-4">Basic Information</h3>

                <div>
                  <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors"
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors resize-none h-24"
                    placeholder="Enter course description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:outline-none focus:border-[#A855F7] transition-colors"
                    >
                      <option value="" className="bg-[var(--bg-card)] text-[var(--text-color)]">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[var(--bg-card)] text-[var(--text-color)]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:outline-none focus:border-[#A855F7] transition-colors"
                    >
                      <option value="Beginner" className="bg-[var(--bg-card)] text-[var(--text-color)]">Beginner</option>
                      <option value="Intermediate" className="bg-[var(--bg-card)] text-[var(--text-color)]">Intermediate</option>
                      <option value="Advanced" className="bg-[var(--bg-card)] text-[var(--text-color)]">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Instructor</label>
                    <select
                      value={formData.instructorId}
                      onChange={(e) => {
                        const instructor = instructors.find((i) => i._id === e.target.value);
                        setFormData({
                          ...formData,
                          instructorId: e.target.value,
                          instructor: instructor?.name || "",
                        });
                      }}
                      className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:outline-none focus:border-[#A855F7] transition-colors"
                    >
                      <option value="" className="bg-[var(--bg-card)] text-[var(--text-color)]">Select instructor</option>
                      {instructors.map((instructor) => (
                        <option key={instructor._id} value={instructor._id} className="bg-[var(--bg-card)] text-[var(--text-color)]">
                          {instructor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4 border-t border-[rgba(139,92,246,0.2)] pt-6">
                <h3 className="text-lg font-semibold text-[#A855F7] mb-4">Pricing</h3>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) =>
                        setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? "Free" : "" })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-white font-medium">Free Course</span>
                  </label>
                </div>

                {!formData.isFree && (
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors"
                    placeholder="Enter price (e.g., ₹999)"
                  />
                )}
              </div>

              {/* Thumbnail Section */}
              <div className="space-y-4 border-t border-[rgba(139,92,246,0.2)] pt-6">
                <h3 className="text-lg font-semibold text-[#A855F7] mb-4">Thumbnail</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Upload Thumbnail</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-dashed border-[rgba(139,92,246,0.3)] rounded-lg text-white cursor-pointer"
                    />
                  </div>

                  {thumbnailPreview && (
                    <div>
                      <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Preview</label>
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-40 object-cover rounded-lg border border-[rgba(139,92,246,0.3)]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modules Section */}
              <div className="space-y-4 border-t border-[rgba(139,92,246,0.2)] pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#A855F7]">Modules ({formData.modules.length})</h3>
                  <button
                    onClick={() => setShowAddModuleForm(!showAddModuleForm)}
                    className="px-4 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    {showAddModuleForm ? "Cancel" : "+ Add Module"}
                  </button>
                </div>

                {showAddModuleForm && (
                  <div className="bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg p-4 space-y-4">
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="Module title"
                      className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7]"
                    />
                    <textarea
                      value={newModuleDescription}
                      onChange={(e) => setNewModuleDescription(e.target.value)}
                      placeholder="Module description (optional)"
                      className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] resize-none h-20"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddModule}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        Add Module
                      </button>
                      <button
                        onClick={() => setShowAddModuleForm(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Modules List */}
                <div className="space-y-2">
                  {formData.modules.map((module, index) => (
                    <div
                      key={index}
                      className="bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg overflow-hidden"
                    >
                      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-[rgba(139,92,246,0.15)] transition-colors" onClick={() => setExpandedModuleIndex(expandedModuleIndex === index ? null : index)}>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{module.title}</p>
                          {module.description && (
                            <p className="text-sm text-[#9A93B5]">{module.description}</p>
                          )}
                          <p className="text-xs text-[#A855F7] mt-1">
                            {module.videos?.length || 0} videos
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveModule(index);
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors text-sm"
                          >
                            Remove
                          </button>
                          <svg className={`w-5 h-5 text-white transition-transform ${expandedModuleIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>

                      {/* Videos Section - Visible when expanded */}
                      {expandedModuleIndex === index && (
                        <div className="border-t border-[rgba(139,92,246,0.3)] p-4 space-y-4 bg-[rgba(139,92,246,0.05)]">
                          {/* Video List */}
                          {module.videos && module.videos.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-[#A855F7]">Videos in this module:</p>
                              {module.videos.map((video, videoIndex) => (
                                <div key={videoIndex} className="bg-[rgba(139,92,246,0.1)] p-3 rounded flex items-center justify-between">
                                  <div className="flex-1 text-sm">
                                    <p className="text-white font-medium">{video.title}</p>
                                    {video.description && <p className="text-[#9A93B5]">{video.description}</p>}
                                    {video.duration && <p className="text-xs text-[#9A93B5]">Duration: {video.duration}s</p>}
                                  </div>
                                  <button
                                    onClick={() => handleRemoveVideo(index, videoIndex)}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Video Form */}
                          <div className="border-t border-[rgba(139,92,246,0.3)] pt-4 space-y-3">
                            <p className="text-sm font-semibold text-[#A855F7]">Add Video to Module</p>
                            <input
                              type="text"
                              value={expandedModuleIndex === index ? newVideoTitle : ""}
                              onChange={(e) => setNewVideoTitle(e.target.value)}
                              placeholder="Video title"
                              className="w-full px-3 py-2 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] text-sm"
                            />
                            <textarea
                              value={expandedModuleIndex === index ? newVideoDescription : ""}
                              onChange={(e) => setNewVideoDescription(e.target.value)}
                              placeholder="Video description (optional)"
                              className="w-full px-3 py-2 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] text-sm resize-none h-16"
                            />
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
                              className="w-full px-3 py-2 bg-[rgba(139,92,246,0.1)] border border-dashed border-[rgba(139,92,246,0.3)] rounded text-white text-sm cursor-pointer"
                            />
                            {newVideoFile && (
                              <p className="text-xs text-[#A855F7]">Selected: {newVideoFile.name}</p>
                            )}
                            <button
                              onClick={() => handleAddVideoToModule(index)}
                              disabled={uploadingVideo[index]}
                              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded font-semibold transition-colors text-sm"
                            >
                              {uploadingVideo[index] ? "Uploading..." : "Add Video"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4 border-t border-[rgba(139,92,246,0.2)] pt-6">
                <button
                  onClick={handleSaveCourse}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300"
                >
                  Save Course
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] text-white rounded-lg font-semibold hover:bg-[rgba(139,92,246,0.2)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
