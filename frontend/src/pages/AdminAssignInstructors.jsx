import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, BookOpen, Check, ChevronDown, Sparkles, AlertCircle } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";

export default function AdminAssignMentors() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchMentorQuery, setSearchMentorQuery] = useState("");

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // Fetch mentors from registered mentors
      const mentorsRes = await fetch(`${API_URL}/api/admin/mentors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (mentorsRes.status === 401) {
        handleLogout();
        return;
      }

      if (!mentorsRes.ok) throw new Error("Failed to fetch mentors");
      const mentorsData = await mentorsRes.json();
      setMentors(mentorsData.filter((m) => m.active));

      // Fetch users
      const usersRes = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignMentor = async () => {
    if (!selectedUser || !selectedMentor) {
      toast.error("Please select both a user and a mentor");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_URL}/api/admin/assign-mentor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: selectedUser._id,
            mentorId: selectedMentor._id,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to assign mentor");
      }

      setSuccessMessage(`✅ ${selectedMentor.name} assigned to ${selectedUser.fullName}`);
      setSelectedUser(null);
      setSelectedMentor(null);
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchData();
      toast.success(`${selectedMentor.name} assigned to ${selectedUser.fullName}`);
    } catch (error) {
      console.error("Assign mentor error:", error);
      toast.error("Failed to assign mentor");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  // Filter users
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  // Filter mentors
  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchMentorQuery.toLowerCase()) ||
    mentor.expertise.toLowerCase().includes(searchMentorQuery.toLowerCase())
  );

  // Alias for consistent naming
  const filteredInstructors = filteredMentors;

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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-[#C7C3D6] to-[#9A93B5] bg-clip-text text-transparent">
            Assign Mentors to Users
          </h1>
          <p className="text-[#9A93B5] text-lg">Select a user and assign a mentor to enable personalized 1:1 mentoring sessions</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-2xl p-5 text-green-300 shadow-[0_0_24px_rgba(34,197,94,0.15)] animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin"></div>
            <p className="text-sm text-[#9A93B5] font-medium">Loading assignments...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Users List */}
              <div className="lg:col-span-1">
                <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[rgba(139,92,246,0.2)] rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#EC4899]/10 p-5 border-b border-[rgba(139,92,246,0.2)]">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#A855F7]" />
                      <h2 className="text-lg font-bold text-white">Users <span className="text-[#A855F7]">({filteredUsers.length})</span></h2>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="p-4 border-b border-[rgba(139,92,246,0.15)]">
                    <input
                      type="text"
                      placeholder="Search user..."
                      value={searchUserQuery}
                      onChange={(e) => setSearchUserQuery(e.target.value)}
                      className="w-full bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all"
                    />
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-400">No users found</div>
                    ) : (
                      <div className="divide-y divide-[rgba(139,92,246,0.1)]">
                        {filteredUsers.map((user) => (
                          <div
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`p-4 cursor-pointer transition-all duration-300 border-l-4 ${
                              selectedUser?._id === user._id
                                ? "bg-gradient-to-r from-[#8B5CF6]/20 to-transparent border-[#8B5CF6] shadow-[0_0_16px_rgba(139,92,246,0.2)]"
                                : "border-transparent hover:bg-[rgba(139,92,246,0.05)] hover:border-[rgba(139,92,246,0.3)]"
                            }`}>
                            <p className="font-semibold text-sm text-white">{user.fullName}</p>
                            <p className="text-xs text-[#9A93B5] mt-1">{user.email}</p>
                            {user.assignedInstructor && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 border border-[#8B5CF6]/30 rounded-lg text-xs text-[#A855F7] font-medium">
                                <Check className="w-3 h-3" />
                                {user.assignedMentor?.name || user.assignedInstructor.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mentors List */}
              <div className="lg:col-span-1">
                <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[rgba(139,92,246,0.2)] rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#EC4899]/10 p-5 border-b border-[rgba(139,92,246,0.2)]">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-[#EC4899]" />
                      <h2 className="text-lg font-bold text-white">Mentors <span className="text-[#EC4899]">({filteredMentors.length})</span></h2>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="p-4 border-b border-[rgba(139,92,246,0.15)]">
                    <input
                      type="text"
                      placeholder="Search mentor..."
                      value={searchMentorQuery}
                      onChange={(e) => setSearchMentorQuery(e.target.value)}
                      className="w-full bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-color)] placeholder-[#9A93B5] focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all"
                    />
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredMentors.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-400">
                        {mentors.length === 0
                          ? "No active mentors available"
                          : "No mentors match search"}
                      </div>
                    ) : (
                      <div className="divide-y divide-[rgba(139,92,246,0.1)]">
                        {filteredMentors.map((mentor) => (
                          <div
                            key={mentor._id}
                            onClick={() => setSelectedMentor(mentor)}
                            className={`p-4 cursor-pointer transition-all duration-300 border-l-4 ${
                              selectedMentor?._id === mentor._id
                                ? "bg-gradient-to-r from-[#A855F7]/20 to-transparent border-[#A855F7] shadow-[0_0_16px_rgba(168,85,247,0.2)]"
                                : "border-transparent hover:bg-[rgba(168,85,247,0.05)] hover:border-[rgba(168,85,247,0.3)]"
                            }`}>
                            <p className="font-semibold text-sm text-white">{mentor.name}</p>
                            <p className="text-xs text-[#A855F7] mt-1 font-medium">{mentor.expertise}</p>
                            <p className="text-xs text-[#9A93B5] mt-1">{mentor.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assignment Panel */}
              <div className="lg:col-span-1">
                <div className="bg-[var(--card-bg)] border border-[rgba(168,85,247,0.3)] rounded-2xl p-6 h-[600px] flex flex-col justify-between shadow-[0_8px_32px_rgba(168,85,247,0.2)]">
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-[#A855F7] uppercase tracking-wider mb-3 font-bold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        From User
                      </p>
                      {selectedUser ? (
                        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[rgba(168,85,247,0.3)] shadow-[0_4px_16px_rgba(168,85,247,0.15)]">
                          <p className="font-bold text-white">{selectedUser.fullName}</p>
                          <p className="text-sm text-[#9A93B5] mt-1">{selectedUser.email}</p>
                          {selectedUser.assignedMentor && (
                            <p className="text-xs text-yellow-300 mt-2 flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3" />
                              Currently: {selectedUser.assignedMentor.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-dashed border-[rgba(139,92,246,0.3)] text-[#9A93B5] text-sm">
                          Select a user from the list
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.4)]">
                        <ChevronDown className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-[#A855F7] uppercase tracking-wider mb-3 font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        To Mentor
                      </p>
                      {selectedMentor ? (
                        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[rgba(168,85,247,0.3)] shadow-[0_4px_16px_rgba(168,85,247,0.15)]">
                          <p className="font-bold text-white">{selectedMentor.name}</p>
                          <p className="text-sm text-[#A855F7] mt-1 font-medium">{selectedMentor.expertise}</p>
                          <p className="text-xs text-[#9A93B5] mt-2">{selectedMentor.email}</p>
                        </div>
                      ) : (
                        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-dashed border-[rgba(168,85,247,0.3)] text-[#9A93B5] text-sm">
                          Select a mentor from the list
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={assignMentor}
                    disabled={!selectedUser || !selectedMentor}
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 text-base ${
                      selectedUser && selectedMentor
                        ? "bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#A855F7] hover:shadow-[0_0_32px_rgba(168,85,247,0.4)] text-white"
                        : "bg-[rgba(168,85,247,0.2)] text-[#9A93B5] cursor-not-allowed border border-[rgba(168,85,247,0.3)]"
                    }`}>
                    {selectedUser && selectedMentor ? "✨ Assign Now" : "Select Both to Continue"}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5 border border-[rgba(168,85,247,0.2)] rounded-2xl p-6 shadow-[0_4px_16px_rgba(168,85,247,0.1)] hover:shadow-[0_8px_24px_rgba(168,85,247,0.2)] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.4)]">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-[#A855F7] uppercase tracking-wider font-bold">Total Users</p>
                </div>
                <p className="text-4xl font-bold text-white">{users.length}</p>
              </div>
              <div className="bg-gradient-to-br from-[#A855F7]/10 to-[#A855F7]/5 border border-[rgba(168,85,247,0.2)] rounded-2xl p-6 shadow-[0_4px_16px_rgba(168,85,247,0.1)] hover:shadow-[0_8px_24px_rgba(168,85,247,0.2)] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A855F7] to-[#D946EF] flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.4)]">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-[#A855F7] uppercase tracking-wider font-bold">Total Mentors</p>
                </div>
                <p className="text-4xl font-bold text-white">{mentors.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 shadow-[0_4px_16px_rgba(34,197,94,0.1)] hover:shadow-[0_8px_24px_rgba(34,197,94,0.2)] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-[0_0_16px_rgba(34,197,94,0.4)]">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-green-400 uppercase tracking-wider font-bold">Assignments Done</p>
                </div>
                <p className="text-4xl font-bold text-white">{users.filter(u => u.assignedMentor).length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
