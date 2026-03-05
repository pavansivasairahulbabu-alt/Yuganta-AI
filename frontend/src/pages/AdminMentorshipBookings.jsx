import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";
import { useTheme } from "../context/ThemeContext";

export default function AdminMentorshipBookings() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigningFor, setAssigningFor] = useState(null); // session id
  const [topicFilter, setTopicFilter] = useState("");

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const [sessRes, mentorsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/mentorship-sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/admin/mentors`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!sessRes.ok) throw new Error("Failed to fetch sessions");
      if (!mentorsRes.ok) throw new Error("Failed to fetch mentors");
      const [sessData, mentorData] = await Promise.all([
        sessRes.json(),
        mentorsRes.json(),
      ]);
      setSessions(sessData);
      setMentors(mentorData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = sessions;
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.userId?.fullName?.toLowerCase().includes(q) ||
          s.title?.toLowerCase().includes(q) ||
          s.mentorId?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sessions, statusFilter, search]);

  const mentorsForTopic = useMemo(() => {
    const topic = topicFilter.trim().toLowerCase();
    if (!topic) return mentors;
    return mentors.filter((m) =>
      (m.expertise || "").toLowerCase().includes(topic)
    );
  }, [mentors, topicFilter]);

  const handleAssign = async (sessionId, mentorId) => {
    try {
      // Prevent duplicate assignment if status already changed
      const target = sessions.find((x) => x._id === sessionId);
      if (target && target.status !== "pending") {
        toast.error("This session is no longer pending");
        setAssigningFor(null);
        return;
      }
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${API_URL}/api/admin/mentorship-sessions/${sessionId}/assign-mentor`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mentorId }),
        }
      );
      if (!res.ok) throw new Error("Assign failed");
      const data = await res.json();
      // Update local state
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? data.session : s))
      );
      setAssigningFor(null);
      toast.success("Mentor assigned");
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign mentor");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 md:pt-28 pb-16">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Mentorship Bookings</h1>
          <p className="text-[#C7C3D6]">Manually assign mentors and manage status</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder="Search by user, topic, or mentor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:border-[#8B5CF6]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-color)]"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="mentor_assigned">Mentor Assigned</option>
            <option value="scheduled">Scheduled</option>
            <option value="upcoming">Upcoming (legacy)</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[rgba(139,92,246,0.2)]">
          <table className="w-full text-left">
            <thead className="bg-[rgba(139,92,246,0.08)] text-sm text-[#C7C3D6]">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Topic</th>
                <th className="px-6 py-3">Date & Time</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Assigned Mentor</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(139,92,246,0.1)]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-[#9A93B5]">
                    Loading bookings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-[#9A93B5]">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-[rgba(139,92,246,0.05)]">
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">
                        {s.userId?.fullName || "-"}
                      </div>
                      <div className="text-xs text-[#9A93B5]">{s.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{s.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{s.date}</div>
                      <div className="text-xs text-[#9A93B5]">{s.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs border border-[rgba(139,92,246,0.3)]">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.mentorId ? (
                        <div>
                          <div className="text-white font-medium">{s.mentorId.name}</div>
                          <div className="text-xs text-[#9A93B5]">
                            {s.mentorId.expertise}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#9A93B5] text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {s.status === "pending" ? (
                        <button
                          onClick={() => {
                            // Guard to prevent duplicate open if status changed meanwhile
                            if (s.status !== "pending") return;
                            setAssigningFor(s._id);
                            setTopicFilter(s.title || "");
                          }}
                          className="px-4 py-2 rounded-lg border border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                        >
                          Assign Mentor
                        </button>
                      ) : s.status === "mentor_assigned" ? (
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2 rounded-lg border border-[#8B5CF6]/40 text-[#8B5CF6]/60 cursor-not-allowed"
                        >
                          Assigned
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {assigningFor && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div
              className={`rounded-2xl w-full max-w-2xl p-6 border ${
                theme === "light-theme"
                  ? "bg-white border-[rgba(0,0,0,0.1)] text-gray-800"
                  : "bg-[#0B0614] border-[rgba(139,92,246,0.3)] text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Assign Mentor</h3>
                <button
                  onClick={() => setAssigningFor(null)}
                  className={`${
                    theme === "light-theme"
                      ? "text-gray-600 hover:text-gray-800"
                      : "text-[#9A93B5] hover:text-white"
                  }`}
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-3 mb-4">
                <input
                  placeholder="Filter by topic expertise"
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm focus:outline-none ${
                    theme === "light-theme"
                      ? "bg-white border border-[rgba(0,0,0,0.1)] text-gray-800 placeholder-gray-400 focus:border-[#8B5CF6]"
                      : "bg-[rgba(11,6,20,0.5)] border border-[rgba(139,92,246,0.3)] text-white placeholder-[#9A93B5] focus:border-[#8B5CF6]"
                  }`}
                />
              </div>
              <div
                className={`max-h-80 overflow-y-auto divide-y ${
                  theme === "light-theme" ? "divide-gray-200" : "divide-[rgba(139,92,246,0.1)]"
                }`}
              >
                {mentorsForTopic.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <div className="font-semibold">{m.name}</div>
                      <div className={`text-xs ${theme === "light-theme" ? "text-gray-500" : "text-[#9A93B5]"}`}>{m.expertise}</div>
                    </div>
                    <button
                      onClick={() => handleAssign(assigningFor, m._id)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white"
                    >
                      Assign
                    </button>
                  </div>
                ))}
                {mentorsForTopic.length === 0 && (
                  <div
                    className={`text-sm py-8 text-center ${
                      theme === "light-theme" ? "text-gray-500" : "text-[#9A93B5]"
                    }`}
                  >
                    No mentors match this topic filter
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
