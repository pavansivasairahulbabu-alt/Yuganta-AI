import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Mentorship Bookings", path: "/admin/bookings" },
    { label: "Mentor Management", path: "/admin/mentors" },
    { label: "Instructor Management", path: "/admin/instructors" },
    { label: "Registrations", path: "/admin/registrations" },
    { label: "Assign Mentors", path: "/admin/assign-mentors" },
    { label: "Blog Management", path: "/admin/blogs" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  const navBgClasses =
    theme === "light-theme"
      ? "bg-white border-[rgba(0,0,0,0.08)]"
      : "bg-[rgba(22,11,46,0.8)] border-[rgba(139,92,246,0.2)]";

  return (
    <nav className={`fixed top-0 left-0 right-0 ${navBgClasses} backdrop-blur-xl z-50 shadow-[0_8px_32px_rgba(139,92,246,0.1)]`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 md:gap-8">
            <div className='flex items-center space-x-3'>
              <img
                src='/yuganta-logo.png'
                alt='YugantaAI'
                className='w-10 h-10 transition-transform hover:scale-110'
              />
              <h1 className="text-xl font-bold text-white hidden sm:block">
                <span>Yuganta</span>
                <span className='bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent'>AI</span>
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-4 py-2.5 rounded-none font-semibold transition-all duration-300 text-sm border-b-2 ${
                    location.pathname === link.path
                      ? theme === "light-theme"
                        ? "border-b-[#8B5CF6] text-gray-800"
                        : "border-b-[#8B5CF6] text-white"
                      : theme === "light-theme"
                        ? "border-b-transparent text-gray-700 hover:text-[#3B82F6]"
                        : "border-b-transparent text-[#C7C3D6] hover:text-white"
                  }`}>
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-lg border border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.1)] transition-all duration-300"
              aria-label="Toggle Theme"
              title={theme === "dark-theme" ? "Dark Mode" : "Light Mode"}>
              <span className="w-5 h-5 flex items-center justify-center">
                {theme === "dark-theme" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white" strokeWidth={2}>
                    <circle cx="12" cy="12" r="5" fill="white" />
                    <line x1="12" y1="1" x2="12" y2="4" stroke="white" />
                    <line x1="12" y1="20" x2="12" y2="23" stroke="white" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="white" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="white" />
                    <line x1="1" y1="12" x2="4" y2="12" stroke="white" />
                    <line x1="20" y1="12" x2="23" y2="12" stroke="white" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="white" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="white" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-5 h-5">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-lg border border-[#EC4899] text-[#EC4899] hover:bg-[rgba(236,72,153,0.1)] font-semibold transition-all duration-300 text-sm hover:shadow-[0_0_16px_rgba(236,72,153,0.3)]">
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-2 mt-3 overflow-x-auto">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-3 py-2 rounded-none font-semibold transition-all duration-300 text-xs whitespace-nowrap border-b-2 ${
                location.pathname === link.path
                  ? theme === "light-theme"
                    ? "border-b-[#8B5CF6] text-gray-800"
                    : "border-b-[#8B5CF6] text-white"
                  : theme === "light-theme"
                    ? "border-b-transparent text-gray-700 hover:text-[#3B82F6]"
                    : "border-b-transparent text-[#C7C3D6] hover:text-white"
              }`}>
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
