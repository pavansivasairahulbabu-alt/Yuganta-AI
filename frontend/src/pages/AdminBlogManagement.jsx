import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";

export default function AdminBlogManagement() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "GenAI",
    tags: [],
    readTime: 5,
    featured: false,
    thumbnail: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const categories = [
    "GenAI",
    "Machine Learning",
    "Deep Learning",
    "AI Agents",
    "Data Science",
    "Python",
    "Cloud Computing",
    "Interview Prep",
    "Career",
  ];

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    } else {
      fetchBlogs();
    }
  }, [navigate]);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to fetch blogs");
      }

      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error("Fetch blogs error:", error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      toast.loading("Uploading image...");
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      setFormData({ ...formData, thumbnail: data.url });
      setImagePreview(data.url);
      toast.dismiss();
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.dismiss();
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.excerpt || !formData.content || !formData.author || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      
      const submitData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        tags: formData.tags,
        readTime: parseInt(formData.readTime) || 5,
        featured: Boolean(formData.featured),
        thumbnail: formData.thumbnail || "",
      };

      const url = editingBlog
        ? `${API_URL}/api/admin/blogs/${editingBlog._id}`
        : `${API_URL}/api/admin/blogs`;

      const response = await fetch(url, {
        method: editingBlog ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save blog");
      }

      const data = await response.json();
      
      if (editingBlog) {
        setBlogs(blogs.map((b) => (b._id === data._id ? data : b)));
        toast.success("Blog updated successfully!");
      } else {
        setBlogs([data, ...blogs]);
        toast.success("Blog created successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Save blog error:", error);
      toast.error(error.message || "Failed to save blog");
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      category: blog.category,
      tags: blog.tags || [],
      readTime: blog.readTime || 5,
      featured: blog.featured,
      thumbnail: blog.thumbnail || "",
    });
    setImagePreview(blog.thumbnail || "");
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete blog");

      setBlogs(blogs.filter((b) => b._id !== id));
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Delete blog error:", error);
      toast.error("Failed to delete blog");
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/blogs/${id}/toggle-featured`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to toggle featured");

      const updatedBlog = await response.json();
      setBlogs(blogs.map((b) => (b._id === id ? updatedBlog : b)));
      toast.success(`Blog ${updatedBlog.featured ? "featured" : "unfeatured"} successfully`);
    } catch (error) {
      console.error("Toggle featured error:", error);
      toast.error("Failed to toggle featured status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      category: "GenAI",
      tags: [],
      readTime: 5,
      featured: false,
      thumbnail: "",
    });
    setImagePreview("");
    setEditingBlog(null);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 md:pt-28 pb-16">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-sm text-[#A855F7] hover:text-white transition-colors mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider">Content Management</p>
            <h1 className="text-4xl md:text-5xl font-bold">Blog Management</h1>
            <p className="text-[#C7C3D6] mt-2">Create and manage blog posts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white rounded-lg font-bold px-6 py-3 transition-all duration-300 shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-100 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Blog
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.25)] rounded-2xl p-6">
            <p className="text-sm text-[#C7C3D6] font-semibold">Total Blogs</p>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text">{blogs.length}</div>
          </div>
          <div className="bg-gradient-to-br from-[rgba(168,85,247,0.15)] to-[rgba(168,85,247,0.05)] border border-[rgba(168,85,247,0.25)] rounded-2xl p-6">
            <p className="text-sm text-[#C7C3D6] font-semibold">Featured</p>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#A855F7] to-[#D946EF] bg-clip-text">
              {blogs.filter((b) => b.featured).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[rgba(236,72,153,0.15)] to-[rgba(236,72,153,0.05)] border border-[rgba(236,72,153,0.25)] rounded-2xl p-6">
            <p className="text-sm text-[#C7C3D6] font-semibold">Total Views</p>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#EC4899] to-[#A855F7] bg-clip-text">
              {blogs.reduce((sum, b) => sum + (b.views || 0), 0)}
            </div>
          </div>
        </div>

        {/* Blog List */}
        <div className="bg-[var(--card-bg)] border border-[rgba(139,92,246,0.2)] rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">All Blogs</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <svg className="w-8 h-8 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-[#C7C3D6] mt-3">Loading...</p>
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-center py-12 text-[#9A93B5]">No blogs yet. Create one to get started.</p>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div key={blog._id} className="bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.1)] rounded-xl p-6 hover:bg-[rgba(139,92,246,0.08)] transition">
                  <div className="flex items-start gap-4">
                    {blog.thumbnail && (
                      <img src={blog.thumbnail} alt={blog.title} className="w-24 h-24 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{blog.title}</h3>
                          <p className="text-[#C7C3D6] text-sm mb-3 line-clamp-2">{blog.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-[#9A93B5]">
                            <span className="px-2 py-1 bg-[rgba(139,92,246,0.2)] rounded">{blog.category}</span>
                            <span>By {blog.author}</span>
                            <span>{blog.readTime}</span>
                            <span>{blog.views || 0} views</span>
                            {blog.featured && (
                              <span className="px-2 py-1 bg-[rgba(236,72,153,0.2)] text-[#EC4899] rounded">⭐ Featured</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFeatured(blog._id)}
                            className="px-3 py-2 rounded-lg bg-transparent border border-[#A855F7] text-[#A855F7] hover:bg-[rgba(139,92,246,0.1)] transition text-sm">
                            {blog.featured ? "Unfeature" : "Feature"}
                          </button>
                          <button
                            onClick={() => handleEdit(blog)}
                            className="px-3 py-2 rounded-lg bg-transparent border border-[#8B5CF6] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] transition text-sm">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="px-3 py-2 rounded-lg bg-transparent border border-[#EC4899] text-[#EC4899] hover:bg-[rgba(236,72,153,0.1)] transition text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">{editingBlog ? "Edit Blog" : "Create New Blog"}</h2>
              <button onClick={resetForm} className="text-[#9A93B5] hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Excerpt *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] resize-none"
                  placeholder="Short description (shown in blog list)"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] resize-none"
                  placeholder="Full blog content (supports markdown)"
                  rows="10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Author *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    placeholder="Author name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    required>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    placeholder="e.g., 5 min read"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Thumbnail Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#8B5CF6] file:text-white file:cursor-pointer hover:file:bg-[#A855F7]"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    className="flex-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#A855F7] transition">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-[rgba(139,92,246,0.2)] text-[#A855F7] rounded-full text-sm flex items-center gap-2">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded border-[var(--border-color)] bg-[var(--card-bg)] text-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-[#C7C3D6]">
                  Mark as Featured Blog
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white rounded-lg font-bold px-6 py-3 transition-all duration-300">
                  {editingBlog ? "Update Blog" : "Create Blog"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-[#EC4899] text-[#EC4899] rounded-lg hover:bg-[rgba(236,72,153,0.1)] transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
