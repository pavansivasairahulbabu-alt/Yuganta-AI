import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";

export default function AdminInstructorManagement() {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [form, setForm] = useState({ name: "", expertise: "", email: "", bio: "", photo: "", company: "", experience: "" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    } else {
      fetchInstructors();
    }
  }, [navigate]);

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/instructors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to fetch instructors");
      }

      const data = await response.json();
      setInstructors(data);
    } catch (error) {
      console.error("Fetch instructors error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const active = instructors.filter((i) => i.active).length;
    const approved = instructors.filter((i) => i.approved).length;
    const total = instructors.length;
    return { active, approved, total };
  }, [instructors]);

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);
    setPhotoUploading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(`${API_URL}/api/admin/upload-instructor-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((f) => ({ ...f, photo: data.url }));
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error("Photo upload failed. Try again.");
      setPhotoPreview("");
      setForm((f) => ({ ...f, photo: "" }));
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.expertise || !form.email || !form.bio || !form.photo || !form.company) {
      toast.error("All fields are required: name, expertise, email, bio, photo, company");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/instructors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add instructor");
      }

      const data = await response.json();
      setInstructors((prev) => [data.instructor || data, ...prev]);
      setForm({ name: "", expertise: "", email: "", bio: "", photo: "", company: "", experience: "" });
      setPhotoPreview("");
      toast.success("Instructor created successfully! They can now set their password using the forgot password link.");
    } catch (error) {
      console.error("Add error:", error);
      toast.error(error.message || "Failed to add instructor");
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error("Instructor ID is missing");
      toast.error("Invalid instructor ID");
      return;
    }

    if (!confirm("Are you sure you want to delete this instructor?")) return;

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/instructors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete instructor");
      }

      setInstructors((prev) => prev.filter((i) => i._id !== id));
      toast.success("Instructor deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete instructor");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    if (!id) {
      console.error("Instructor ID is missing");
      toast.error("Invalid instructor ID");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        handleLogout();
        return;
      }

      const toggleEndpoint = currentActive ? "deactivate" : "activate";
      const response = await fetch(
        `${API_URL}/api/admin/instructors/${id}/${toggleEndpoint}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update");
      }

      const updated = await response.json();
      setInstructors((prev) => prev.map((i) => (i._id === id ? updated : i)));
      toast.success(`Instructor ${currentActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update instructor status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 md:pt-28 pb-16">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-[#C7C3D6]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-32 md:pt-28 pb-16">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-[#A855F7] hover:text-white transition-colors mb-4 flex items-center gap-2">
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Back to Dashboard
          </button>
          <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider">Management</p>
          <h1 className="text-4xl md:text-5xl font-bold">Instructor Management</h1>
          <p className="text-[#C7C3D6] mt-2">Add, manage, and organize instructors for your courses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.25)] rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#C7C3D6] font-semibold">Total Instructors</p>
              <svg className='w-6 h-6 text-[#A855F7] opacity-50' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM16 15v2h2v-2zM4 15v2H2v-2z' />
              </svg>
            </div>
            <div className='text-4xl font-bold text-transparent bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text'>{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-[rgba(168,85,247,0.15)] to-[rgba(168,85,247,0.05)] border border-[rgba(168,85,247,0.25)] rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(168,85,247,0.2)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#C7C3D6] font-semibold">Active</p>
              <svg className='w-6 h-6 text-[#A855F7] opacity-50' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.648a3.066 3.066 0 01-3.062 3.062H9.231A9.065 9.065 0 007.000 16.89a9.065 9.065 0 00-2.231.274H4.267a3.066 3.066 0 01-3.062-3.062V6.517a3.066 3.066 0 012.812-3.062zM9 12a1 1 0 11-2 0 1 1 0 012 0z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='text-3xl font-bold text-[#A855F7]'>{stats.active}</div>
          </div>
          <div className="bg-gradient-to-br from-[rgba(236,72,153,0.15)] to-[rgba(236,72,153,0.05)] border border-[rgba(236,72,153,0.25)] rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(236,72,153,0.2)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#C7C3D6] font-semibold">Approved</p>
              <svg className='w-6 h-6 text-[#EC4899] opacity-50' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='text-3xl font-bold text-[#EC4899]'>{stats.approved}</div>
          </div>
        </div>

        {/* Add New Instructor */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
          <h2 className="text-2xl font-bold text-white mb-6">Add Instructor</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300"
              placeholder="Full Name"
              required
            />
            <input
              value={form.expertise}
              onChange={(e) => setForm((f) => ({ ...f, expertise: e.target.value }))}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300"
              placeholder="Expertise/Subject"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300"
              placeholder="Email Address"
              required
            />
            <input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300"
              placeholder="Company"
              required
            />
            {/* Photo Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#C7C3D6] mb-2">Instructor Photo</label>
              <div
                onClick={() => document.getElementById("instructor-photo-input").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) handlePhotoUpload(file);
                }}
                className={`relative flex items-center gap-5 cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 px-6 py-5 group
                  ${photoPreview
                    ? "border-[#8B5CF6] bg-[rgba(139,92,246,0.08)]"
                    : "border-[var(--border-primary)] hover:border-[#8B5CF6] hover:bg-[rgba(139,92,246,0.05)]"
                  }`}
              >
                <input
                  id="instructor-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />
                {/* Preview or placeholder */}
                {photoPreview ? (
                  <div className="relative shrink-0">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                    />
                    {photoUploading && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <svg className="w-6 h-6 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-[rgba(139,92,246,0.2)] to-[rgba(236,72,153,0.2)] border-2 border-dashed border-[rgba(139,92,246,0.4)] flex items-center justify-center group-hover:from-[rgba(139,92,246,0.3)] group-hover:to-[rgba(236,72,153,0.3)] transition-all duration-300">
                    <svg className="w-8 h-8 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {photoUploading ? (
                    <p className="text-sm font-semibold text-[#A855F7]">Uploading photo...</p>
                  ) : photoPreview ? (
                    <>
                      <p className="text-sm font-semibold text-[#A855F7]">Photo uploaded successfully</p>
                      <p className="text-xs text-[#9A93B5] mt-0.5">Click or drag to replace</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[var(--text-color)] group-hover:text-[#A855F7] transition-colors">Upload instructor photo</p>
                      <p className="text-xs text-[#9A93B5] mt-0.5">Click to browse or drag & drop · JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
                {photoPreview && !photoUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoPreview("");
                      setForm((f) => ({ ...f, photo: "" }));
                    }}
                    className="shrink-0 w-8 h-8 rounded-full bg-[rgba(236,72,153,0.15)] hover:bg-[rgba(236,72,153,0.3)] text-[#EC4899] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <input
              value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300"
              placeholder="Experience (e.g. 5+ years in Web Dev)"
            />
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300 resize-none"
              placeholder="Bio — short description about the instructor"
              required
            />
            <button
              type="submit"
              disabled={photoUploading}
              className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white rounded-lg font-bold px-6 py-3.5 transition-all duration-300 shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-100 whitespace-nowrap group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <svg className='w-5 h-5 group-hover:rotate-90 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 4v16m8-8H4' />
              </svg>
              Add
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">All Instructors</h2>
            <p className="text-[#C7C3D6] text-sm">{instructors.length} instructor{instructors.length !== 1 ? 's' : ''} on platform</p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <svg className='w-8 h-8 text-[#A855F7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
              </div>
              <p className="text-[#C7C3D6] mt-3">Loading...</p>
            </div>
          ) : (
            <div className="space-y-0">
              {instructors.length === 0 ? (
                <p className="text-center py-12 text-[#9A93B5]">No instructors yet. Add one above to get started.</p>
              ) : (
                instructors.map((item) => (
                  <div key={item._id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[rgba(139,92,246,0.05)] px-4 rounded-lg transition duration-300">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-white truncate">{item.name}</p>
                      <p className="text-sm text-[#A855F7] font-medium">{item.expertise}</p>
                      <p className="text-sm text-[#C7C3D6]">{item.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        item.active 
                          ? "bg-[rgba(34,197,94,0.2)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]" 
                          : "bg-[rgba(156,163,175,0.2)] text-[#d1d5db] border border-[rgba(156,163,175,0.3)]"
                      }`}>
                        {item.active ? "✓ Active" : "○ Inactive"}
                      </span>
                      <button
                        onClick={() => handleToggleActive(item._id, item.active)}
                        disabled={actionLoading[item._id]}
                        className="px-4 py-2 rounded-lg bg-transparent border border-[#8B5CF6] text-[#A855F7] hover:bg-[rgba(139,92,246,0.1)] font-semibold transition-all duration-300 text-sm hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {actionLoading[item._id] ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : null}
                        {item.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={actionLoading[item._id]}
                        className="px-4 py-2 rounded-lg bg-transparent border border-[#EC4899] text-[#EC4899] hover:bg-[rgba(236,72,153,0.1)] font-semibold transition-all duration-300 text-sm hover:shadow-[0_0_12px_rgba(236,72,153,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {actionLoading[item._id] ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : null}
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
