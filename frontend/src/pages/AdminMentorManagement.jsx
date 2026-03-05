import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";

export default function AdminMentorManagement() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [form, setForm] = useState({ name: "", expertise: "", email: "", bio: "", photo: "", company: "" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    } else {
      fetchMentors();
    }
  }, [navigate]);

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/mentors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to fetch mentors");
      }

      const data = await response.json();
      setMentors(data);
    } catch (error) {
      console.error("Fetch mentors error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const active = mentors.filter((m) => m.active).length;
    const approved = mentors.filter((m) => m.approved).length;
    const total = mentors.length;
    return { active, approved, total };
  }, [mentors]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.expertise || !form.email || !form.bio || !form.photo || !form.company) {
      toast.error("All fields are required: name, expertise, email, bio, photo, company");
      return;
    }
    
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/mentors`, {
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
        throw new Error(errorData.message || "Failed to add mentor");
      }

      const data = await response.json();
      setMentors((prev) => [data.mentor || data, ...prev]);
      setForm({ name: "", expertise: "", email: "", bio: "", photo: "", company: "" });
      toast.success("Mentor created successfully! They can now setup their password using the forgot password link.");
    } catch (error) {
      console.error("Add error:", error);
      toast.error(error.message || "Failed to add mentor");
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error("Mentor ID is missing");
      toast.error("Invalid mentor ID");
      return;
    }

    if (!confirm("Are you sure you want to delete this mentor?")) return;

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/mentors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete mentor");
      }

      setMentors((prev) => prev.filter((m) => m._id !== id));
      toast.success("Mentor deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete mentor");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    if (!id) {
      console.error("Mentor ID is missing");
      toast.error("Invalid mentor ID");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("adminToken");
      const toggleEndpoint = currentActive ? "deactivate" : "activate";
      const response = await fetch(
        `${API_URL}/api/admin/mentors/${id}/${toggleEndpoint}`,
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
        throw new Error(errorData.message || "Failed to update mentor status");
      }

      const data = await response.json();
      const updated = data.mentor || data;
      setMentors((prev) => prev.map((m) => (m._id === id ? updated : m)));
      toast.success(`Mentor ${currentActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update mentor status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 md:pt-28 pb-16">
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
          <h1 className="text-4xl md:text-5xl font-bold">Mentor Management</h1>
          <p className="text-[#C7C3D6] mt-2">Add, manage, and organize mentors for your platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.25)] rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#C7C3D6] font-semibold">Total Mentors</p>
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
            <div className='text-4xl font-bold text-transparent bg-gradient-to-r from-[#A855F7] to-[#D946EF] bg-clip-text'>{stats.active}</div>
          </div>
          <div className="bg-gradient-to-br from-[rgba(236,72,153,0.15)] to-[rgba(236,72,153,0.05)] border border-[rgba(236,72,153,0.25)] rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(236,72,153,0.2)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#C7C3D6] font-semibold">Inactive</p>
              <svg className='w-6 h-6 text-[#9A93B5] opacity-50' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M13.477 14.89A6 6 0 015.11 2.527a6 6 0 008.367 8.368z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='text-4xl font-bold text-transparent bg-gradient-to-r from-[#9A93B5] to-[#A855F7] bg-clip-text'>{stats.total - stats.active}</div>
          </div>
        </div>

        {/* Add Form */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Add New Mentor</h2>
            <p className="text-[#C7C3D6] text-sm">Create a new mentor account for your platform</p>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            <input
              value={form.photo}
              onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300"
              placeholder="Photo URL"
              required
            />
            <input
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300"
              placeholder="Bio"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white rounded-lg font-bold px-6 py-3.5 transition-all duration-300 shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-100 whitespace-nowrap group flex items-center justify-center gap-2">
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
            <h2 className="text-2xl font-bold text-white mb-1">All Mentors</h2>
            <p className="text-[#C7C3D6] text-sm">{mentors.length} mentor{mentors.length !== 1 ? 's' : ''} on platform</p>
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
              {mentors.length === 0 ? (
                <p className="text-center py-12 text-[#9A93B5]">No mentors yet. Add one above to get started.</p>
              ) : (
                mentors.map((item) => (
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
