import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Clock, User, Link as LinkIcon, CheckCircle, AlertCircle, Video } from "lucide-react";
import API_URL from "../config/api";

export default function MyMentorshipSessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("upcoming");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const tokenInner = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/mentorship-sessions/user`, {
          headers: { Authorization: `Bearer ${tokenInner}` },
        });
        if (response.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // Filter sessions by status
  const filteredSessions = useMemo(() => {
    if (filterStatus === "upcoming") {
      const active = ["upcoming", "pending", "mentor_assigned", "scheduled", "rescheduled"];
      return sessions.filter((s) => active.includes(s.status));
    }
    return sessions.filter((session) => session.status === filterStatus);
  }, [sessions, filterStatus]);

  const handleCancel = async (sessionId) => {
    const confirmed = window.confirm("Cancel this session? This action cannot be undone.");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/mentorship-sessions/${sessionId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to cancel session");
      }
      const updated = await res.json();
      setSessions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      toast.success("Session cancelled");
      // If user is on 'completed' tab, leave it; otherwise, keep selection
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Error cancelling session");
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: sessions.length,
      upcoming: sessions.filter((s) =>
        ["upcoming", "pending", "mentor_assigned", "scheduled", "rescheduled"].includes(s.status)
      ).length,
      completed: sessions.filter((s) => s.status === "completed").length,
      withMeetLink: sessions.filter((s) => s.meetingLink).length,
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0614] via-[#160B2E] to-[#1a0f3a] text-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <svg className='w-12 h-12 text-[#A855F7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
            </svg>
          </div>
          <p className="text-[#C7C3D6]">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0614] via-[#160B2E] to-[#1a0f3a] text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">My Mentorship Sessions</h1>
          <p className="text-[#C7C3D6] mt-3 text-lg">View your booked sessions and access meet links</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5 border border-[rgba(168,85,247,0.2)] rounded-2xl p-6 shadow-[0_4px_16px_rgba(168,85,247,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-[#A855F7] font-bold uppercase tracking-wider">Total Sessions</p>
            </div>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6 shadow-[0_4px_16px_rgba(59,130,246,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Upcoming</p>
            </div>
            <p className="text-4xl font-bold text-white">{stats.upcoming}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 shadow-[0_4px_16px_rgba(34,197,94,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Completed</p>
            </div>
            <p className="text-4xl font-bold text-white">{stats.completed}</p>
          </div>

          <div className="bg-gradient-to-br from-[#EC4899]/10 to-[#EC4899]/5 border border-[rgba(236,72,153,0.2)] rounded-2xl p-6 shadow-[0_4px_16px_rgba(236,72,153,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-[#EC4899] font-bold uppercase tracking-wider">Meet Links Ready</p>
            </div>
            <p className="text-4xl font-bold text-white">{stats.withMeetLink}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 flex-wrap">
          {["upcoming", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === status
                  ? "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white shadow-[0_0_16px_rgba(168,85,247,0.4)]"
                  : "bg-[rgba(168,85,247,0.1)] text-[#C7C3D6] hover:bg-[rgba(168,85,247,0.2)]"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(168,85,247,0.2)] rounded-2xl p-12 text-center shadow-[0_8px_32px_rgba(168,85,247,0.1)]">
              <AlertCircle className="w-12 h-12 text-[#A855F7] mx-auto mb-3 opacity-50" />
              <p className="text-[#C7C3D6] text-lg">No {filterStatus} sessions</p>
              <button
                onClick={() => navigate("/mentorship")}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white rounded-lg font-semibold hover:shadow-[0_0_16px_rgba(168,85,247,0.4)] transition-all"
              >
                Book a Session
              </button>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session._id}
                className="bg-gradient-to-br from-[#12091F] to-[#0B0614] border border-[rgba(168,85,247,0.2)] rounded-2xl p-6 shadow-[0_8px_32px_rgba(168,85,247,0.1)] hover:shadow-[0_12px_48px_rgba(168,85,247,0.2)] transition-all"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Session Details */}
                  <div className="md:col-span-1">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-[#9A93B5] font-semibold mb-2">Session Topic</p>
                        <h3 className="text-xl font-bold text-white">{session.title}</h3>
                      </div>

                      {session.mentorId && (
                        <div>
                          <p className="text-sm text-[#9A93B5] font-semibold mb-2">Your Mentor</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{session.mentorId.name}</p>
                              <p className="text-xs text-[#9A93B5]">{session.mentorId.expertise}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {session.notes && (
                        <div>
                          <p className="text-sm text-[#9A93B5] font-semibold mb-2">Notes</p>
                          <p className="text-[#C7C3D6] text-sm">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date/Time Info */}
                  <div className="md:col-span-1">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-[rgba(168,85,247,0.1)] rounded-xl border border-[rgba(168,85,247,0.2)]">
                        <Calendar className="w-5 h-5 text-[#A855F7] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[#9A93B5] font-semibold">Date</p>
                          <p className="font-semibold text-white">{session.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-[rgba(168,85,247,0.1)] rounded-xl border border-[rgba(168,85,247,0.2)]">
                        <Clock className="w-5 h-5 text-[#A855F7] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[#9A93B5] font-semibold">Time</p>
                          <p className="font-semibold text-white">{session.time}</p>
                        </div>
                      </div>

                      <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                        session.status === "upcoming"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : session.status === "completed"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}>
                        {session.status}
                      </div>
                    </div>
                  </div>

                  {/* Meet Link / Actions Section */}
                  <div className="md:col-span-1">
                    <div className="h-full flex flex-col justify-between">
                      {session.meetingLink ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-green-300 font-semibold">Meet Link Ready</span>
                          </div>
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-2 group"
                          >
                            <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Join Meeting
                          </a>
                          <p className="text-xs text-[#9A93B5] text-center mt-2">
                            Mentor has shared the meeting link
                          </p>
                          {["upcoming","pending","mentor_assigned","scheduled","rescheduled"].includes(session.status) && (
                            <button
                              type="button"
                              onClick={() => handleCancel(session._id)}
                              className="w-full px-4 py-2 rounded-lg border border-red-500 text-red-400 hover:bg-red-500/10 font-semibold transition"
                            >
                              Cancel Session
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 p-4 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.2)] rounded-lg">
                          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto" />
                          <div className="text-center">
                            <p className="text-sm font-semibold text-yellow-300">Awaiting Meet Link</p>
                            <p className="text-xs text-[#C7C3D6] mt-1">
                              Your mentor will share the meet link soon
                            </p>
                          </div>
                          {["upcoming","pending","mentor_assigned","scheduled","rescheduled"].includes(session.status) && (
                            <button
                              type="button"
                              onClick={() => handleCancel(session._id)}
                              className="w-full px-4 py-2 rounded-lg border border-red-500 text-red-400 hover:bg-red-500/10 font-semibold transition"
                            >
                              Cancel Session
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
