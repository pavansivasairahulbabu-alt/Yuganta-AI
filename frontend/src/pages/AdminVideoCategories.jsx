import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderPlus, Pencil, Trash2, X, Plus, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import api from "../config/axios";
import { useTheme } from "../context/ThemeContext";

export default function AdminVideoCategories() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    }
    setLoading(false);
  }, [navigate]);

  // Fetch categories using React Query
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["video-categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
    enabled: !loading,
  });

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: async (newCat) => {
      const res = await api.post("/categories", newCat);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["video-categories"]);
      toast.success("Category created successfully!");
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create category");
    },
  });

  // Update Category Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const res = await api.put(`/categories/${id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["video-categories"]);
      toast.success("Category updated successfully!");
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update category");
    },
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["video-categories"]);
      toast.success("Category deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete category");
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, updatedData: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClick = (id, name, videoCount) => {
    if (videoCount > 0) {
      toast.error(`Cannot delete "${name}". It contains ${videoCount} video(s).`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#A855F7] animate-spin mx-auto mb-4" />
          <p className="text-[#C7C3D6]">Loading Categories...</p>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark-theme";

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 pb-12 transition-colors duration-300">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[rgba(139,92,246,0.15)] pb-6">
          <div>
            <p className="text-xs text-[#9A93B5] font-semibold uppercase tracking-wider">Video Hub</p>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Categories Management</h1>
            <p className="text-[#C7C3D6] text-sm mt-1">Organize video library with structural categories</p>
          </div>
          
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white hover:opacity-90 font-semibold shadow-lg transition-transform hover:-translate-y-0.5 duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[rgba(139,92,246,0.05)] border border-dashed border-[rgba(139,92,246,0.2)] rounded-3xl text-center">
            <FolderPlus className="w-16 h-16 text-[#A855F7]/50 mb-4" />
            <h3 className="text-xl font-bold text-white">No categories found</h3>
            <p className="text-[#C7C3D6] text-sm mt-2 max-w-sm">Create categories to structure your video content and improve library filtering.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 px-5 py-2 rounded-xl bg-[rgba(139,92,246,0.15)] text-[#A855F7] border border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.25)] font-semibold transition-colors"
            >
              Add First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="group relative bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.2)] hover:border-[rgba(139,92,246,0.5)] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(139,92,246,0.15)] text-[#C084FC] border border-[rgba(139,92,246,0.25)]">
                      {cat.videoCount} {cat.videoCount === 1 ? "video" : "videos"}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="p-2 rounded-lg text-[#C7C3D6] hover:text-[#A855F7] hover:bg-[rgba(139,92,246,0.1)] transition-colors"
                        title="Edit Category"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat._id, cat.name, cat.videoCount)}
                        className={`p-2 rounded-lg transition-colors ${
                          cat.videoCount > 0 
                            ? "text-gray-600 cursor-not-allowed" 
                            : "text-[#C7C3D6] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]"
                        }`}
                        title={cat.videoCount > 0 ? "Cannot delete category containing videos" : "Delete Category"}
                        disabled={cat.videoCount > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-4 tracking-tight group-hover:text-[#C084FC] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[#9A93B5] text-xs font-medium mt-1 font-mono">slug: {cat.slug}</p>
                  
                  <p className="text-[#C7C3D6] text-sm mt-3 line-clamp-3 leading-relaxed">
                    {cat.description || "No description provided for this category."}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-[rgba(139,92,246,0.1)] flex justify-between items-center text-xs text-[#9A93B5]">
                  <span>Created: {new Date(cat.createdAt).toLocaleDateString()}</span>
                  <span>ID: ...{cat._id.slice(-6)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over or Modal Dialog for Add/Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#130E26] border border-[rgba(139,92,246,0.3)] rounded-2xl p-6 shadow-2xl space-y-6">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 p-2 text-[#C7C3D6] hover:text-white rounded-lg hover:bg-[rgba(139,92,246,0.1)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-6 h-6 text-[#A855F7]" />
                <span>{editingCategory ? "Edit Category" : "Add Category"}</span>
              </h2>
              <p className="text-sm text-[#C7C3D6]">
                {editingCategory 
                  ? "Update name and details for this category" 
                  : "Create a new category to group your video uploads"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-white">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.3)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-white">Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe what videos fall under this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.3)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] transition-all text-sm resize-none"
                />
              </div>

              {editingCategory && editingCategory.videoCount > 0 && (
                <div className="flex gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Warning: Editing this category's name will automatically update the category metadata of the{" "}
                    <strong>{editingCategory.videoCount}</strong> assigned video(s).
                  </span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-[#C7C3D6] hover:bg-[rgba(139,92,246,0.1)] transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-semibold shadow-md hover:opacity-95 transition-opacity text-sm flex items-center gap-1.5"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
