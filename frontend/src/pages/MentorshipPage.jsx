import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

const navItems = [
  { key: "my-mentorships", label: "My Mentorships" },
  { key: "upcoming", label: "Upcoming Sessions" },
  { key: "completed", label: "Completed Sessions" },
  { key: "cancelled", label: "Cancelled / Rescheduled Sessions" },
];

export default function MentorshipPage() {
  const [activeTab, setActiveTab] = useState("my-mentorships");
  const [sessionData, setSessionData] = useState([]);
  const [assignedInstructor, setAssignedInstructor] = useState(null);
  const [assignedMentor, setAssignedMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAssignedInstructor();
    fetchAssignedMentor();
    fetchSessionData();
  }, []);

  const fetchAssignedInstructor = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/users/assigned-instructor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const instructor = await response.json();
        setAssignedInstructor(instructor);
      }
    } catch (error) {
      console.error("Error fetching instructor:", error);
    }
  };

  const fetchAssignedMentor = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/users/assigned-mentor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const mentor = await response.json();
        setAssignedMentor(mentor);
      }
    } catch (error) {
      console.error("Error fetching mentor:", error);
    }
  };

  const fetchSessionData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/mentorship-sessions/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const sessions = await response.json();
        // Transform backend data to match frontend structure
        const transformedSessions = sessions.map((session) => ({
          id: session._id,
          title: session.title,
          mentor: session.instructorId?.name || "Industry Mentor",
          mentorExpertise: session.instructorId?.expertise,
          status: session.status,
          date: session.date,
          time: session.time,
          notes: session.notes,
          meetingLink: session.meetingLink,
          bookedDate: new Date(session.bookedDate).toLocaleDateString(),
          rejectionReason: session.rejectionReason,
          rescheduleReason: session.rescheduleReason,
          originalDate: session.originalDate,
          originalTime: session.originalTime,
        }));
        setSessionData(transformedSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const active = ["upcoming", "pending", "mentor_assigned", "scheduled", "rescheduled"];
    const upcoming = sessionData.filter((s) => active.includes(s.status)).length;
    const completed = sessionData.filter((s) => s.status === "completed").length;
    const cancelled = sessionData.filter((s) => s.status === "cancelled" || s.status === "rejected" || s.status === "rescheduled").length;
    return { upcoming, completed, cancelled };
  }, [sessionData]);

  const filteredSessions = useMemo(() => {
    if (activeTab === "my-mentorships") return sessionData;
    if (activeTab === "upcoming") {
      const active = ["upcoming", "pending", "mentor_assigned", "scheduled", "rescheduled"];
      return sessionData.filter((s) => active.includes(s.status));
    }
    return sessionData.filter((s) => s.status === activeTab);
  }, [activeTab, sessionData]);

  const renderEmptyState = () => (
    <div className="bg-[var(--card-bg)] border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4 transition-colors duration-300">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">😐</div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No sessions scheduled today</h3>
        <p className="text-gray-400 max-w-md">
          You will see your upcoming, completed, and rescheduled sessions here once they are booked.
        </p>
      </div>
      <Link
        to="/mentorships/book"
        className="px-5 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition">
        Book Session
      </Link>
    </div>
  );

  const renderSessionCard = (session) => (
    <div
      key={session.id}
      className="bg-[var(--card-bg)] border border-white/5 rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{session.status}</p>
          <h3 className="text-xl font-semibold">{session.title}</h3>
          <p className="text-sm text-gray-400">with {session.mentor}</p>
        </div>
        <div className="text-right text-sm text-gray-300">
          <div>{session.date}</div>
          <div>{session.time}</div>
        </div>
      </div>
      <p className="text-sm text-gray-400">{session.notes}</p>

      {/* Rejection Badge */}
      {session.status === 'rejected' && session.rejectionReason && (
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-2 border-red-500/50 rounded-xl p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-red-300 mb-2 flex items-center gap-2">
                <span>Session Rejected by Instructor</span>
              </p>
              <div className="bg-red-950/40 rounded-lg p-3 border border-red-500/30">
                <p className="text-xs uppercase tracking-wider text-red-400/80 font-semibold mb-1">Reason</p>
                <p className="text-sm text-red-100 leading-relaxed">{session.rejectionReason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Badge */}
      {session.status === 'rescheduled' && (
        <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-2 border-blue-500/50 rounded-xl p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-blue-300 mb-2 flex items-center gap-2">
                <span>Session Rescheduled</span>
              </p>
              <div className="bg-blue-950/40 rounded-lg p-3 border border-blue-500/30 space-y-2">
                {session.originalDate && session.originalTime && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-400/80 font-semibold mb-1">Original Schedule</p>
                    <p className="text-sm text-blue-100">{session.originalDate} at {session.originalTime}</p>
                  </div>
                )}
                {session.rescheduleReason && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-400/80 font-semibold mb-1">Reason</p>
                    <p className="text-sm text-blue-100 leading-relaxed">{session.rescheduleReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setSelectedSession(session);
            setShowDetailsModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition">
          Join / Details
        </button>
        <button className="px-4 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] hover:bg-[var(--card-bg-hover)] transition">
          Reschedule
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-20 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 w-full bg-[var(--card-bg)] border border-white/5 rounded-2xl p-4 h-fit transition-colors duration-300">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition border border-transparent flex items-center gap-3 ${isActive
                    ? "bg-white text-black"
                    : "text-gray-200 hover:bg-white/5 border-white/5"
                    }`}>
                  <span className="text-lg">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
              <Link to="/my-learning" className="hover:text-white">Enrolled Programs</Link>
              <span className="mx-1">›</span>
              <span className="hover:text-white">Course Listing</span>
              <span className="mx-1">›</span>
              <span className="text-white">My Mentorships</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold">My Mentorship Progress</h1>
              <Link
                to="/mentorships/book"
                className="px-5 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition shrink-0 text-center md:text-left">
                Book Session
              </Link>
            </div>
          </div>

          {/* Assigned Instructor Card */}
          {assignedInstructor && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 transition-colors duration-300">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Assigned Instructor</p>
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--text-color)] mb-2">{assignedInstructor.name}</h2>
                  <p className="text-[var(--text-muted)] font-semibold text-lg mb-3">{assignedInstructor.expertise}</p>
                  {assignedInstructor.bio && (
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed">{assignedInstructor.bio}</p>
                  )}
                  <div className="mt-4">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">Contact</p>
                    <a href={`mailto:${assignedInstructor.email}`} className="text-blue-600 hover:text-blue-700 transition text-sm">
                      {assignedInstructor.email}
                    </a>
                  </div>
                </div>
                {assignedInstructor.avatar && (
                  <div className="flex-shrink-0">
                    <img
                      src={assignedInstructor.avatar}
                      alt={assignedInstructor.name}
                      className="w-24 h-24 rounded-xl object-cover border border-[var(--border-color)]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assigned Mentor Card */}
          {assignedMentor ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 transition-colors duration-300">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Assigned Mentor</p>
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--text-color)] mb-2">{assignedMentor.name}</h2>
                  <p className="text-[var(--text-muted)] font-semibold text-lg mb-3">{assignedMentor.expertise}</p>
                  {assignedMentor.bio && (
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed">{assignedMentor.bio}</p>
                  )}
                  <div className="mt-4">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">Contact</p>
                    <a href={`mailto:${assignedMentor.email}`} className="text-blue-600 hover:text-blue-700 transition text-sm">
                      {assignedMentor.email}
                    </a>
                  </div>
                </div>
                {assignedMentor.avatar && (
                  <div className="flex-shrink-0">
                    <img
                      src={assignedMentor.avatar}
                      alt={assignedMentor.name}
                      className="w-24 h-24 rounded-xl object-cover border border-[var(--border-color)]"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            !assignedInstructor && (
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 transition-colors duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-2">Mentor Assignment Status</p>
                    <h3 className="text-2xl font-bold text-[var(--text-color)] mb-2">No Mentor Assigned Yet</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-4">
                      An admin will assign you a mentor soon. You'll receive a notification once your mentor is assigned.
                    </p>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                      ⏱️ Pending Assignment
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--card-bg)] border border-white/5 rounded-2xl p-6 space-y-2 transition-colors duration-300">
              <p className="text-gray-400 text-sm">Upcoming Sessions</p>
              <div className="flex items-center gap-2 text-4xl font-bold">{stats.upcoming}</div>
            </div>
            <div className="bg-[var(--card-bg)] border border-white/5 rounded-2xl p-6 space-y-2 transition-colors duration-300">
              <p className="text-gray-400 text-sm">Completed Sessions</p>
              <div className="flex items-center gap-2 text-4xl font-bold">{stats.completed}</div>
            </div>
            <div className="bg-[var(--card-bg)] border border-white/5 rounded-2xl p-6 space-y-2 transition-colors duration-300">
              <p className="text-gray-400 text-sm">Cancelled / Rescheduled</p>
              <div className="flex items-center gap-2 text-4xl font-bold">{stats.cancelled}</div>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => renderSessionCard(session))}
            </div>
          )}
        </main>
      </div>

      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[var(--card-bg)] border border-white/10 rounded-2xl max-w-3xl w-full p-6 md:p-8 relative my-8 max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10 bg-[var(--card-bg)] rounded-full p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">{selectedSession.status}</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{selectedSession.title}</h2>
                <p className="text-gray-400 text-sm">with {selectedSession.mentor}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Date</p>
                  <p className="text-base font-semibold">{selectedSession.date}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Time</p>
                  <p className="text-base font-semibold">{selectedSession.time}</p>
                </div>
              </div>

              {selectedSession.notes && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">Session Notes</p>
                  <p className="text-gray-300 text-sm">{selectedSession.notes}</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-semibold text-blue-300">Meeting Link</p>
                </div>
                {selectedSession.meetingLink ? (
                  <a
                    href={selectedSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/10 hover:bg-white/20 rounded-lg p-3 transition group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1">Click to join the meeting</p>
                        <p className="text-blue-300 font-mono text-xs truncate group-hover:text-blue-200">
                          {selectedSession.meetingLink}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ) : (
                  <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3 text-yellow-400">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">
                      Your instructor will add the meeting link soon. Please check back later.
                    </p>
                  </div>
                )}
              </div>

              {/* Rejection Details */}
              {selectedSession.status === 'rejected' && selectedSession.rejectionReason && (
                <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border-2 border-red-500/60 rounded-xl p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-red-200 mb-2">
                        Session Rejected by Instructor
                      </p>
                      <div className="bg-red-950/50 rounded-lg p-3 border border-red-500/40">
                        <p className="text-xs uppercase tracking-wider text-red-300/90 font-semibold mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-50 leading-relaxed">{selectedSession.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reschedule Details */}
              {selectedSession.status === 'rescheduled' && (
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border-2 border-blue-500/60 rounded-xl p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-blue-200 mb-2">
                        Session Rescheduled
                      </p>
                      <div className="bg-blue-950/50 rounded-lg p-3 border border-blue-500/40 space-y-2">
                        {selectedSession.originalDate && selectedSession.originalTime && (
                          <div>
                            <p className="text-xs uppercase tracking-wider text-blue-300/90 font-semibold mb-1">Original Schedule</p>
                            <p className="text-sm text-blue-50">{selectedSession.originalDate} at {selectedSession.originalTime}</p>
                          </div>
                        )}
                        {selectedSession.rescheduleReason && (
                          <div>
                            <p className="text-xs uppercase tracking-wider text-blue-300/90 font-semibold mb-1">Reschedule Reason</p>
                            <p className="text-sm text-blue-50 leading-relaxed">{selectedSession.rescheduleReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Booked On</p>
                <p className="text-gray-300 text-sm">{selectedSession.bookedDate || "N/A"}</p>
              </div>

              <div className="flex gap-3 pt-4">
                {selectedSession.meetingLink ? (
                  <a
                    href={selectedSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition text-center">
                    Join Meeting Now
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 bg-gray-600 text-gray-400 rounded-lg font-semibold cursor-not-allowed text-center">
                    Waiting for Meeting Link
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 border border-white/10 rounded-lg text-gray-200 hover:bg-white/5 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
