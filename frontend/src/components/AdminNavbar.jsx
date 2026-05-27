import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Phone,
  CalendarCheck,
  Users,
  GraduationCap,
  UserPlus,
  UserCheck,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem("adminSidebarCollapsed");
    return stored === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isFirstMount = useRef(true);

  const navLinks = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Jobs", path: "/admin/add-job", icon: Briefcase },
    { label: "Calls", path: "/admin/calls", icon: Phone },
    { label: "Mentorship Bookings", path: "/admin/bookings", icon: CalendarCheck },
    { label: "Mentor Management", path: "/admin/mentors", icon: Users },
    { label: "Instructor Management", path: "/admin/instructors", icon: GraduationCap },
    { label: "Registrations", path: "/admin/registrations", icon: UserPlus },
    { label: "Assign Mentors", path: "/admin/assign-mentors", icon: UserCheck },
    { label: "Courses", path: "/admin/courses", icon: BookOpen },
    { label: "Blog Management", path: "/admin/blogs", icon: FileText },
  ];

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const applyLayoutOffset = () => {
      const needsTransition = !isFirstMount.current;
      const transitionStyle = needsTransition ? "padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)" : "none";
      
      if (window.innerWidth >= 1024) {
        document.body.style.transition = transitionStyle;
        document.body.style.paddingLeft = isCollapsed ? "88px" : "280px";
      } else {
        document.body.style.transition = transitionStyle;
        document.body.style.paddingLeft = "0px";
      }
    };

    applyLayoutOffset();
    
    if (isFirstMount.current) {
      isFirstMount.current = false;
    }

    window.addEventListener("resize", applyLayoutOffset);

    return () => {
      window.removeEventListener("resize", applyLayoutOffset);
      const nextPath = window.location.pathname;
      const nextIsAdminPage = nextPath.startsWith("/admin") && nextPath !== "/admin/login" && nextPath !== "/admin";
      if (!nextIsAdminPage) {
        document.body.style.paddingLeft = "0px";
        document.body.style.transition = "";
      }
    };
  }, [isCollapsed]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      return;
    }

    document.body.style.overflow = isMobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  const shellClasses =
    theme === "light-theme"
      ? "bg-white/95 border-[rgba(0,0,0,0.08)]"
      : "bg-[rgba(18,14,33,0.95)] border-[rgba(139,92,246,0.24)]";

  const textMuted = theme === "light-theme" ? "text-gray-600" : "text-[#BDB5D7]";
  const textStrong = theme === "light-theme" ? "text-gray-900" : "text-white";
  const hoverTextClass = theme === "light-theme" ? "hover:text-gray-900" : "hover:text-white";

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <header className={`fixed top-0 left-0 right-0 h-16 ${shellClasses} border-b backdrop-blur-xl z-50`}>
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setIsCollapsed((prev) => !prev);
                } else {
                  setIsMobileOpen((prev) => !prev);
                }
              }}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[rgba(139,92,246,0.35)] hover:bg-[rgba(139,92,246,0.1)] transition-colors"
              aria-label="Toggle admin sidebar"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2.5"
              aria-label="Go to admin dashboard"
            >
              <img src="/yuganta-logo.png" alt="YugantaAI" className="w-8 h-8 rounded-md" />
              <h1 className={`text-base md:text-lg font-bold whitespace-nowrap ${textStrong}`}>
                <span>Yuganta</span>
                <span className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent">AI</span>
              </h1>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[rgba(139,92,246,0.35)] hover:bg-[rgba(139,92,246,0.1)] transition-colors"
              aria-label="Toggle Theme"
              title={theme === "dark-theme" ? "Dark Mode" : "Light Mode"}
            >
              {theme === "dark-theme" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 md:px-4 h-10 rounded-lg border border-[#EC4899] text-[#EC4899] hover:bg-[rgba(236,72,153,0.1)] transition-colors text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-16 left-0 bottom-0 z-50 ${shellClasses} border-r backdrop-blur-xl transition-all duration-300 ${
          isCollapsed ? "w-[88px]" : "w-[280px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <nav className="p-3 space-y-1 overflow-y-auto h-full">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`w-full h-11 rounded-xl transition-all duration-300 flex items-center ${
                  isCollapsed ? "pl-[30px]" : "px-4"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-[rgba(139,92,246,0.25)] to-[rgba(236,72,153,0.15)] text-white border border-[rgba(139,92,246,0.45)]"
                    : `${textMuted} ${hoverTextClass} hover:bg-[rgba(139,92,246,0.14)] border border-transparent`
                }`}
                title={isCollapsed ? link.label : undefined}
                aria-label={link.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span
                  className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${
                    isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
                  }`}
                >
                  {link.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
