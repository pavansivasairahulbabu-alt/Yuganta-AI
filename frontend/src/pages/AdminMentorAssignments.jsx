import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, CheckCircle, AlertCircle, Zap, ChevronDown } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";

export default function AdminMentorAssignments() {
  const navigate = useNavigate();
  const [mentorAssignments, setMentorAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all, assigned, unassigned

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    } else {
      fetchMentorAssignments();
    }
  }, [navigate]);

  const fetchMentorAssignments = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // Fetch all users (assignedInstructor is already populated by backend)
      const usersRes = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersRes.status === 401) {
        handleLogout();
        return;
      }

      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const users = await usersRes.json();

      // Map users to their assigned instructors
      // Note: assignedInstructor is already populated by the backend
      const assignments = users.map((user) => {
        const assignedInstructor = user.assignedInstructor;
        // Check if assignedInstructor exists and is an object (populated)
        const isAssigned = assignedInstructor && typeof assignedInstructor === 'object' && assignedInstructor._id;
        
        return {
          userId: user._id,
          userName: user.fullName,
          userEmail: user.email,
          mentorId: isAssigned ? assignedInstructor._id : null,
          mentorName: isAssigned ? assignedInstructor.name : "Not Assigned",
          mentorExpertise: isAssigned ? assignedInstructor.expertise : "-",
          mentorEmail: isAssigned ? assignedInstructor.email : "-",
          isAssigned: isAssigned,
        };
      });

      setMentorAssignments(assignments);
    } catch (error) {
      console.error("Fetch mentor assignments error:", error);
      toast.error("Failed to fetch mentor assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    let filtered = mentorAssignments;

    // Apply filter
    if (filterBy === "assigned") {
      filtered = filtered.filter((a) => a.isAssigned);
    } else if (filterBy === "unassigned") {
      filtered = filtered.filter((a) => !a.isAssigned);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.userName.toLowerCase().includes(query) ||
          a.userEmail.toLowerCase().includes(query) ||
          a.mentorName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [mentorAssignments, filterBy, searchQuery]);

  // Group by mentor (only assigned students)
  const mentorGroups = useMemo(() => {
    const groups = {};
    mentorAssignments
      .filter((assignment) => assignment.isAssigned) // Only include assigned students
      .forEach((assignment) => {
        const mentorKey = assignment.mentorId;
        if (!groups[mentorKey]) {
          groups[mentorKey] = {
            mentorId: assignment.mentorId,
            mentorName: assignment.mentorName,
            mentorExpertise: assignment.mentorExpertise,
            mentorEmail: assignment.mentorEmail,
            students: [],
          };
        }
        groups[mentorKey].students.push(assignment);
      });
    return Object.values(groups);
  }, [mentorAssignments]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: mentorAssignments.length,
      assigned: mentorAssignments.filter((a) => a.isAssigned).length,
      unassigned: mentorAssignments.filter((a) => !a.isAssigned).length,
      activeMentors: mentorGroups.filter((g) => g.mentorId).length,
    };
  }, [mentorAssignments, mentorGroups]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-28 pb-16">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#8B5CF6] to-[#EC4899] rounded-full"></div>
            <p className="text-sm font-semibold text-[#A855F7]">Admin Panel</p>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            Mentor Assignments
          </h1>
          <p className="text-[#9A93B5] text-lg">
            View mentor-student assignments and track engagement across your platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl p-6 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.4)]">
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-[#A855F7] font-bold uppercase tracking-wider">Total Students</p>
            </div>
            <div className="text-4xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl p-6 shadow-[0_8px_32px_rgba(34,197,94,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-[0_0_16px_rgba(34,197,94,0.4)]">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Assigned</p>
            </div>
            <div className="text-4xl font-bold text-white">{stats.assigned}</div>
          </div>
          <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl p-6 shadow-[0_8px_32px_rgba(234,179,8,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-[0_0_16px_rgba(234,179,8,0.4)]">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Unassigned</p>
            </div>
            <div className="text-4xl font-bold text-white">{stats.unassigned}</div>
          </div>
          <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl p-6 shadow-[0_8px_32px_rgba(236,72,153,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center shadow-[0_0_16px_rgba(236,72,153,0.4)]">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-[#EC4899] font-bold uppercase tracking-wider">Active Mentors</p>
            </div>
            <div className="text-4xl font-bold text-white">{stats.activeMentors}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin"></div>
            <p className="text-sm text-[#9A93B5] font-medium">Loading mentor assignments...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Search and Filter */}
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl p-6 space-y-4 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search by student name, email, or mentor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-xl px-5 py-3 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all"
                />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-xl px-5 py-3 text-[var(--text-color)] focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all">
                  <option value="all">All</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            </div>

            {/* View by Mentor - CLEAR MENTOR ASSIGNMENTS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-4xl">👨‍🏫</span>
                  Active Mentor Assignments
                </h2>
                <div className="text-sm text-[#9A93B5] bg-[rgba(139,92,246,0.1)] px-4 py-2 rounded-lg border border-[rgba(139,92,246,0.2)]">
                  {stats.activeMentors} mentors • {stats.assigned} students assigned
                </div>
              </div>

              {/* ASSIGNED STUDENTS - with mentors */}
              {mentorGroups.filter((g) => g.mentorId).length > 0 ? (
                <div className="space-y-4">
                  {mentorGroups
                    .filter((g) => g.mentorId)
                    .map((group, idx) => (
                      <div
                        key={group.mentorId}
                        className="rounded-2xl overflow-hidden border bg-gradient-to-br from-[#8B5CF6]/10 via-[#EC4899]/5 to-transparent border-[rgba(139,92,246,0.3)] shadow-[0_8px_32px_rgba(139,92,246,0.15)]">
                        {/* Mentor Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-[#8B5CF6]/30 to-[#EC4899]/30 border-b border-[rgba(139,92,246,0.2)]">
                          <div className="flex items-center justify-between gap-6 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.5)] text-2xl">
                                  {group.mentorName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs text-[#A855F7] uppercase tracking-widest font-bold mb-1">MENTOR</p>
                                  <h3 className="text-3xl font-bold text-white">{group.mentorName}</h3>
                                  <p className="text-sm font-semibold text-[#EC4899] mt-1">{group.mentorExpertise}</p>
                                  <p className="text-xs text-[#9A93B5] mt-1">📧 {group.mentorEmail}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl font-bold text-green-400">{group.students.length}</div>
                              <p className="text-xs text-[#9A93B5] mt-1 uppercase tracking-wider">
                                {group.students.length === 1 ? "Student" : "Students"}
                              </p>
                              <p className="text-xs text-green-300 mt-2">Assigned Below ↓</p>
                            </div>
                          </div>
                        </div>

                        {/* Students List Header */}
                        <div className="px-8 py-3 bg-[rgba(139,92,246,0.1)] border-b border-[rgba(139,92,246,0.15)]">
                          <p className="text-xs uppercase tracking-widest font-bold text-[#A855F7]">
                            📚 Students Mentored by {group.mentorName}
                          </p>
                        </div>

                        {/* Students List */}
                        <div className="divide-y divide-[rgba(139,92,246,0.1)] bg-[var(--card-bg)]">
                          {group.students.map((assignment, studentIdx) => (
                            <div
                              key={assignment.userId}
                              className="px-8 py-5 flex items-center justify-between hover:bg-[rgba(139,92,246,0.05)] transition group">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl font-bold text-[#8B5CF6]/50 w-8 text-center">
                                    {studentIdx + 1}
                                  </div>
                                  <div className="w-1 h-10 bg-gradient-to-b from-[#8B5CF6] to-[#EC4899] rounded-full opacity-30 group-hover:opacity-70 transition"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-white text-lg truncate">{assignment.userName}</p>
                                  <p className="text-sm text-[#9A93B5] truncate">📧 {assignment.userEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-xs text-[#A855F7] uppercase tracking-wider">Assigned to</p>
                                  <p className="text-sm font-bold text-green-400">→ {group.mentorName}</p>
                                </div>
                                <span className="px-4 py-2 rounded-full text-xs font-bold bg-green-500/30 text-green-300 border-2 border-green-500/50 whitespace-nowrap">
                                  ✓ ASSIGNED
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
                  <p className="text-[#9A93B5]">No mentors have been assigned students yet</p>
                </div>
              )}
            </div>

            {/* UNASSIGNED STUDENTS - SEPARATE SECTION */}
            {stats.unassigned > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="text-4xl">⚠️</span>
                    Students Awaiting Mentor Assignment
                  </h2>
                  <div className="text-sm text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                    {stats.unassigned} {stats.unassigned === 1 ? "student needs" : "students need"} a mentor
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border bg-[var(--card-bg)] border-[var(--border-primary)] shadow-[0_8px_32px_rgba(234,179,8,0.15)]">
                  <div className="px-8 py-5 bg-gradient-to-r from-yellow-600/30 to-red-600/30 border-b border-[rgba(234,179,8,0.2)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-xl shadow-[0_0_16px_rgba(234,179,8,0.4)]">
                        ⚠️
                      </div>
                      <div>
                        <p className="text-sm font-bold text-yellow-200 uppercase tracking-wider">Action Required</p>
                        <p className="text-xs text-[#C7C3D6]">These students are waiting to be assigned a mentor</p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-[rgba(234,179,8,0.15)]">
                    {mentorAssignments
                      .filter((a) => !a.isAssigned)
                      .map((assignment, studentIdx) => (
                        <div
                          key={assignment.userId}
                          className="px-8 py-5 flex items-center justify-between hover:bg-[rgba(234,179,8,0.05)] transition">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="text-lg font-bold text-yellow-500 w-8 text-center">
                              {studentIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-lg truncate">{assignment.userName}</p>
                              <p className="text-sm text-[#9A93B5] truncate">📧 {assignment.userEmail}</p>
                            </div>
                          </div>
                          <div className="ml-4 flex items-center gap-4 flex-shrink-0">
                            <button
                              onClick={() => {
                                // Navigate to assign page
                                window.location.href = '/admin/assign-instructors';
                              }}
                              className="px-6 py-2.5 rounded-xl border-2 border-[#8B5CF6] text-[#8B5CF6] bg-transparent hover:bg-[#8B5CF6]/10 hover:shadow-[0_0_24px_rgba(139,92,246,0.3)] font-bold transition-all text-sm whitespace-nowrap">
                              Assign Mentor Now
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Detailed List View */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Students & Their Mentors</h2>
              {filteredAssignments.length === 0 ? (
                <div className="bg-[rgba(22,11,46,0.4)] backdrop-blur-xl border border-[rgba(139,92,246,0.2)] rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
                  <p className="text-[#9A93B5]">No results found</p>
                </div>
              ) : (
                <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
                  <div className="divide-y divide-[rgba(139,92,246,0.1)]">
                    {filteredAssignments.map((assignment) => (
                      <div
                        key={assignment.userId}
                        className="px-6 py-4 flex items-center justify-between hover:bg-[rgba(139,92,246,0.05)] transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate text-white">{assignment.userName}</p>
                          <p className="text-sm text-[#9A93B5]">{assignment.userEmail}</p>
                        </div>
                        <div className="flex-1 text-right min-w-0 px-4">
                          {assignment.isAssigned ? (
                            <div>
                              <p className="text-xs text-[#A855F7] uppercase tracking-wider">Assigned to</p>
                              <p className="font-bold text-green-400 truncate">→ {assignment.mentorName}</p>
                              <p className="text-sm text-[#9A93B5]">{assignment.mentorExpertise}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs text-yellow-300 uppercase tracking-wider">Status</p>
                              <p className="text-sm text-yellow-400 font-bold">⚠ Needs Mentor</p>
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            assignment.isAssigned
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}>
                          {assignment.isAssigned ? "✓ Assigned" : "⚠ Unassigned"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
