import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ mentors: 0, instructors: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <svg className='w-12 h-12 text-[#A855F7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
            </svg>
          </div>
          <p className="text-[#C7C3D6]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-32 pb-12">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider">Control Center</p>
          <h1 className="text-5xl md:text-6xl font-bold">Admin Dashboard</h1>
          <p className="text-[#C7C3D6] mt-3 text-lg">Manage your mentors, instructors, and platform settings</p>
        </div>

        {/* Management Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quiz Management Card */}
          <Link
            to="/admin/quizzes"
            className="group bg-[var(--card-bg)] border border-[rgba(249,115,22,0.35)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(249,115,22,0.1)] hover:shadow-[0_12px_48px_rgba(249,115,22,0.25)] hover:border-[rgba(249,115,22,0.7)] transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider mb-2">Assessments</p>
                <h2 className="text-2xl font-bold text-white mb-2">Quiz Management</h2>
                <p className="text-[#C7C3D6] text-sm">Create module-wise quizzes, publish question banks, track attempts, and store student scores in MongoDB.</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[rgba(249,115,22,0.22)] to-[rgba(236,72,153,0.1)] rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className='w-8 h-8 text-orange-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5h6m-7 4h8m-8 4h5m-8 8h14a2 2 0 002-2V7.5L16.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2z' />
                </svg>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {["1 to n questions per quiz", "Easy / Medium / Hard tagging", "3 student attempts, best score kept"].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <svg className='w-5 h-5 text-orange-400' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                  </svg>
                  <span className="text-xs text-[#C7C3D6]">{text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-orange-400 font-semibold group-hover:gap-3 transition-all duration-300 mt-auto">
              <span>Go to Quizzes</span>
              <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
              </svg>
            </div>
          </Link>

          {/* Mentors Management Card */}
          <Link
            to="/admin/mentors"
            className="group bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)] hover:shadow-[0_12px_48px_rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.6)] transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider mb-2">Management</p>
                <h2 className="text-2xl font-bold text-white mb-2">Mentor Management</h2>
                <p className="text-[#C7C3D6] text-sm">Create, manage, and assign mentors to users. Control mentor activation status and handle assignments.</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[rgba(139,92,246,0.2)] to-[rgba(168,85,247,0.1)] rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className='w-8 h-8 text-[#A855F7]' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM16 15v2h2v-2zM4 15v2H2v-2z' />
                </svg>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#A855F7]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Create mentor accounts</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#A855F7]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Activate / deactivate status</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#A855F7]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Remove mentors</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#A855F7] font-semibold group-hover:gap-3 transition-all duration-300 mt-auto">
              <span>Go to Mentors</span>
              <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
              </svg>
            </div>
          </Link>

          {/* Instructors Management Card */}
          <Link
            to="/admin/instructors"
            className="group bg-[var(--card-bg)] border border-[rgba(236,72,153,0.3)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(236,72,153,0.1)] hover:shadow-[0_12px_48px_rgba(236,72,153,0.25)] hover:border-[rgba(236,72,153,0.6)] transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider mb-2">Management</p>
                <h2 className="text-2xl font-bold text-white mb-2">Instructor Management</h2>
                <p className="text-[#C7C3D6] text-sm">Create, manage, and organize instructors for courses. Control accounts and course assignments.</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[rgba(236,72,153,0.2)] to-[rgba(236,72,153,0.1)] rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className='w-8 h-8 text-[#EC4899]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                </svg>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#EC4899]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Create instructor accounts</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#EC4899]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Manage course assignments</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#EC4899]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Control instructor status</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#EC4899] font-semibold group-hover:gap-3 transition-all duration-300 mt-auto">
              <span>Go to Instructors</span>
              <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
              </svg>
            </div>
          </Link>

          {/* Courses & Curriculum Management Card */}
          <Link
            to="/admin/courses"
            className="group bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)] hover:shadow-[0_12px_48px_rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.6)] transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider mb-2">Curriculum</p>
                <h2 className="text-2xl font-bold text-white mb-2">Course Management</h2>
                <p className="text-[#C7C3D6] text-sm">Create courses, build modules, and add video/lesson content hosted securely on R2/CloudFront.</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[rgba(139,92,246,0.2)] to-[rgba(168,85,247,0.1)] rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className='w-8 h-8 text-[#A855F7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                </svg>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#A855F7]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Create and delete courses</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#A855F7]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Interactive Curriculum Builder</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#A855F7]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">R2/CloudFront video delivery</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#A855F7] font-semibold group-hover:gap-3 transition-all duration-300 mt-auto">
              <span>Go to Courses</span>
              <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
              </svg>
            </div>
          </Link>

          {/* Assign Mentors Card */}
          <Link
            to="/admin/assign-mentors"
            className="group bg-[var(--card-bg)] border border-[rgba(236,72,153,0.3)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(236,72,153,0.1)] hover:shadow-[0_12px_48px_rgba(236,72,153,0.25)] hover:border-[rgba(236,72,153,0.6)] transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider mb-2">Assignment</p>
                <h2 className="text-2xl font-bold text-white mb-2">Assign Mentors</h2>
                <p className="text-[#C7C3D6] text-sm">Assign mentors to users for personalized 1:1 sessions. Manage mentor-user pairings.</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[rgba(236,72,153,0.2)] to-[rgba(236,72,153,0.1)] rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className='w-8 h-8 text-[#EC4899]' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM16 15v2h2v-2zM4 15v2H2v-2z' />
                </svg>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#EC4899]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Assign available mentors</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#EC4899]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Track pairings in real-time</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className='w-5 h-5 text-[#EC4899]' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className="text-xs text-[#C7C3D6]">Manage pairings</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#EC4899] font-semibold group-hover:gap-3 transition-all duration-300 mt-auto">
              <span>Assign Mentors</span>
              <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

