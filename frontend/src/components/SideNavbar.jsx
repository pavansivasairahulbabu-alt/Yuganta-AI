import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
	FiHome,
	FiInfo,
	FiMail,
	FiBriefcase,
	FiBookOpen,
	FiUsers,
	FiGrid,
	FiMenu,
	FiX,
	FiSun,
	FiMoon,
	FiLogIn,
	FiUserPlus,
	FiLogOut,
	FiUser,
	FiChevronDown,
	FiCalendar,
	FiCpu,
	FiBook,
	FiWind
} from "react-icons/fi";

export default function SideNavbar() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [showServicesDropdown, setShowServicesDropdown] = useState(false);
	const { user, isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { theme, toggleTheme } = useTheme();

	const profileMenuRef = useRef(null);
	const sidebarRef = useRef(null);

	const navItems = [
		{ label: "Home", to: "/", icon: FiHome },
		{ label: "About", to: "/about", icon: FiInfo },
		{ label: "Contact", to: "/contact", icon: FiMail },
		{ label: "Jobs", to: "/jobs", icon: FiBriefcase },
		{ label: "Blogs", to: "/blogs", icon: FiBookOpen },
		{ label: "Instructors", to: "/instructors", icon: FiUsers },
	];

	const serviceItems = [
		{ label: "Court Booker", to: "/projects/court-booker", icon: FiCalendar },
		{ label: "AI Agent Avatar", to: "/projects/ai-agent-avatar", icon: FiCpu },
		{ label: "AI Learning Platform", to: "/projects/ai-learning-platform", icon: FiBook },
		{ label: "HVAC Agent", to: "/projects/hvac-agent", icon: FiWind },
	];

	// Close sidebar and profile menu on location changes
	useEffect(() => {
		setIsSidebarOpen(false);
		setShowProfileMenu(false);
		if (serviceItems.some(item => location.pathname === item.to)) {
			setShowServicesDropdown(true);
		}
	}, [location]);

	// Close profile menu or sidebar on clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
				setShowProfileMenu(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		setShowProfileMenu(false);
		logout();
		navigate("/", { replace: true });
	};

	const isActive = (path) => {
		if (path === "/") {
			return location.pathname === "/";
		}
		return location.pathname.startsWith(path);
	};

	const renderNavLinks = () => (
		<div className="flex flex-col gap-2 w-full">
			{navItems.map((item) => {
				const active = isActive(item.to);
				const Icon = item.icon;
				return (
					<Link
						key={item.label}
						to={item.to}
						className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group ${
							active
								? "bg-gradient-to-r from-[rgba(59,130,246,0.15)] to-[rgba(96,165,250,0.05)] text-[#3B82F6] border-l-4 border-[#3B82F6]"
								: "text-[var(--text-secondary)] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
						}`}
					>
						<Icon className={`mr-3 text-lg ${active ? "text-[#3B82F6]" : "text-[var(--text-muted)] group-hover:text-[#3B82F6]"} transition-colors`} size={20} />
						<span className="capitalize">{item.label}</span>
					</Link>
				);
			})}

			{/* Services Dropdown */}
			<div className="w-full">
				<button
					onClick={() => setShowServicesDropdown(!showServicesDropdown)}
					className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group ${
						serviceItems.some(item => isActive(item.to))
							? "text-[#3B82F6]"
							: "text-[var(--text-secondary)] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
					}`}
				>
					<div className="flex items-center">
						<FiGrid className={`mr-3 text-lg ${serviceItems.some(item => isActive(item.to)) ? "text-[#3B82F6]" : "text-[var(--text-muted)] group-hover:text-[#3B82F6]"} transition-colors`} size={20} />
						<span className="uppercase text-xs tracking-wider">Services</span>
					</div>
					<FiChevronDown
						className={`w-4 h-4 transition-transform duration-200 ${
							showServicesDropdown ? "rotate-180" : ""
						}`}
					/>
				</button>

				{showServicesDropdown && (
					<div className="mt-1 ml-6 pl-2 border-l border-[rgba(59,130,246,0.15)] flex flex-col gap-1">
						{serviceItems.map((service) => {
							const active = isActive(service.to);
							const Icon = service.icon;
							return (
								<Link
									key={service.label}
									to={service.to}
									className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 block ${
										active
											? "text-[#3B82F6] font-semibold"
											: "text-[var(--text-secondary)] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
									}`}
								>
									<Icon className="mr-2 text-sm" size={14} />
									<span>{service.label}</span>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);

	const renderAuthFooter = () => (
		<div className="w-full pt-4 border-t border-[rgba(59,130,246,0.1)] flex flex-col gap-3">
			{/* Theme Toggle in Auth Footer */}
			<div className="flex items-center justify-between px-2 mb-1">
				<span className="text-xs text-[var(--text-muted)] font-medium">Theme Mode</span>
				<button
					onClick={toggleTheme}
					className="p-2 border border-[#3B82F6]/30 rounded-xl hover:bg-[rgba(59,130,246,0.1)] transition-all duration-200"
					aria-label="Toggle Theme"
					title={theme === "dark-theme" ? "Switch to Light Mode" : "Switch to Dark Mode"}
				>
					<span className="w-5 h-5 flex items-center justify-center">
						{theme === "dark-theme" ? (
							<FiSun className="w-5 h-5 text-white" size={20} />
						) : (
							<FiMoon className="w-5 h-5 text-black" size={20} />
						)}
					</span>
				</button>
			</div>

			{isAuthenticated ? (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-3 p-2 bg-[rgba(59,130,246,0.05)] rounded-xl border border-[rgba(59,130,246,0.1)]">
						<div className="w-9 h-9 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-md">
							{(user?.fullName || user?.user?.fullName || user?.name || user?.user?.name || user?.email || user?.user?.email || 'U').charAt(0).toUpperCase()}
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-xs font-semibold truncate text-[var(--text-color)]">
								{user?.fullName || user?.user?.fullName || user?.name || user?.user?.name || "User"}
							</p>
							<p className="text-[10px] text-[var(--text-muted)] truncate">
								{user?.email || user?.user?.email || ""}
							</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-1.5 mt-1">
						<Link
							to="/profile"
							className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-[rgba(59,130,246,0.15)] hover:border-[#3B82F6]/60 rounded-lg text-[var(--text-color)] hover:text-[#3B82F6] transition-colors"
						>
							<FiUser size={13} />
							<span>Profile</span>
						</Link>
						<button
							onClick={handleLogout}
							className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-transparent bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
						>
							<FiLogOut size={13} />
							<span>Logout</span>
						</button>
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					<Link
						to="/login"
						className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold border border-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] rounded-xl text-[var(--text-color)] hover:text-[#3B82F6] transition-all"
					>
						<FiLogIn size={16} />
						<span>Login</span>
					</Link>
					<Link
						to="/signup"
						className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white rounded-xl shadow-[0_4px_12px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-all"
					>
						<FiUserPlus size={16} />
						<span>Sign Up</span>
					</Link>
				</div>
			)}
		</div>
	);

	return (
		<>
			{/* TOP HEADER BAR */}
			<header className="fixed top-0 left-0 w-full h-16 z-50 bg-[var(--nav-bg)] border-b border-[rgba(59,130,246,0.1)] backdrop-blur-lg flex items-center justify-between px-4 md:px-6 shadow-md transition-colors duration-300">
				{/* Left Side: Toggle Menu Button & Logo */}
				<div className="flex items-center gap-4">
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] text-[var(--text-color)] transition-colors focus:outline-none"
						aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
					>
						{isSidebarOpen ? (
							<FiX className="w-6 h-6 transition-transform duration-200" size={24} />
						) : (
							<FiMenu className="w-6 h-6 transition-transform duration-200" size={24} />
						)}
					</button>

					<Link to="/" className="flex items-center space-x-2 group">
						<img
							src="/yuganta-logo.png"
							alt="yugantaAI"
							className="w-8 h-8 md:w-9 md:h-9 transition-transform group-hover:scale-105"
						/>
						<span className="text-lg md:text-xl font-bold tracking-tight">
							<span className="text-[var(--text-color)]">Yuganta</span>
							<span className="text-[#3B82F6]">AI</span>
						</span>
					</Link>
				</div>

				{/* Right Side: Theme Toggle & User Profile Actions */}
				<div className="flex items-center gap-3">
					{/* Theme Toggle Button */}
					<button
						onClick={toggleTheme}
						className="p-2 border border-[#3B82F6]/30 rounded-xl hover:bg-[rgba(59,130,246,0.1)] transition-all duration-200"
						aria-label="Toggle Theme"
						title={theme === "dark-theme" ? "Switch to Light Mode" : "Switch to Dark Mode"}
					>
						<span className="w-5 h-5 flex items-center justify-center">
							{theme === "dark-theme" ? (
								<FiSun className="w-5 h-5 text-white" size={20} />
							) : (
								<FiMoon className="w-5 h-5 text-black" size={20} />
							)}
						</span>
					</button>

					{/* Profile Avatar or Login/Signup */}
					{isAuthenticated ? (
						<div className="relative" ref={profileMenuRef}>
							<button
								onClick={() => setShowProfileMenu(!showProfileMenu)}
								className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 border border-[#3B82F6]/40 rounded-xl hover:bg-[rgba(59,130,246,0.1)] transition-all duration-200"
							>
								<div className="w-7 h-7 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
									{(user?.fullName || user?.user?.fullName || user?.name || user?.user?.name || user?.email || user?.user?.email || 'U').charAt(0).toUpperCase()}
								</div>
								<span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate text-[var(--text-color)]">
									{user?.fullName || user?.user?.fullName || user?.name || user?.user?.name || "User"}
								</span>
								<FiChevronDown
									className={`w-4 h-4 transition-transform duration-200 ${
										showProfileMenu ? "rotate-180" : ""
									}`}
								/>
							</button>

							{showProfileMenu && (
								<div className="absolute right-0 mt-2 w-64 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-lg py-2 z-50 transition-all">
									<div className="px-4 py-3 border-b border-[var(--border-color)]">
										<p className="text-sm font-bold text-[var(--text-color)] truncate">
											{user?.fullName || user?.user?.fullName || user?.name || user?.user?.name || "User"}
										</p>
										<p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
											{user?.email || user?.user?.email || ""}
										</p>
									</div>
									<Link
										to="/profile"
										onClick={() => setShowProfileMenu(false)}
										className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-color)] hover:bg-[rgba(59,130,246,0.08)] hover:text-blue-500 transition-colors"
									>
										<FiUser size={15} />
										<span>Profile</span>
									</Link>
									<Link
										to="/my-learning"
										onClick={() => setShowProfileMenu(false)}
										className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-color)] hover:bg-[rgba(59,130,246,0.08)] hover:text-blue-500 transition-colors"
									>
										<FiBookOpen size={15} />
										<span>My Learning</span>
									</Link>
									<Link
										to="/mentorships"
										onClick={() => setShowProfileMenu(false)}
										className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-color)] hover:bg-[rgba(59,130,246,0.08)] hover:text-blue-500 transition-colors"
									>
										<FiUsers size={15} />
										<span>My Mentorships</span>
									</Link>
									<div className="border-t border-[var(--border-color)] my-1"></div>
									<button
										onClick={handleLogout}
										className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-700/10 transition-colors"
									>
										<FiLogOut size={15} />
										<span>Logout</span>
									</button>
								</div>
							)}
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Link
								to="/login"
								className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[#3B82F6] transition-colors"
							>
								<FiLogIn size={14} />
								<span>Login</span>
							</Link>
							<Link
								to="/signup"
								className="hidden sm:flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white rounded-xl text-sm font-semibold hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-all duration-200"
							>
								<FiUserPlus size={14} />
								<span>Sign Up</span>
							</Link>
						</div>
					)}
				</div>
			</header>

			{/* SIDEBAR NAVIGATION MENU DRAWER */}
			<aside
				ref={sidebarRef}
				className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-40 bg-[var(--nav-bg)] border-r border-[rgba(59,130,246,0.1)] backdrop-blur-lg flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out transform ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<nav className="flex flex-col gap-1 w-full p-4 overflow-y-auto max-h-full scrollbar-hide">
					<div className="flex flex-col gap-1.5 w-full">
						{navItems.map((item) => {
							const active = isActive(item.to);
							const Icon = item.icon;
							return (
								<Link
									key={item.label}
									to={item.to}
									className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
										active
											? "bg-gradient-to-r from-[rgba(59,130,246,0.15)] to-[rgba(96,165,250,0.05)] text-[#3B82F6] border-l-4 border-[#3B82F6]"
											: "text-[var(--text-secondary)] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
									}`}
								>
									<Icon className={`mr-3 text-lg ${active ? "text-[#3B82F6]" : "text-[var(--text-muted)] group-hover:text-[#3B82F6]"} transition-colors`} size={18} />
									<span>{item.label}</span>
								</Link>
							);
						})}

						{/* Services Dropdown */}
						<div className="w-full">
							<button
								onClick={() => setShowServicesDropdown(!showServicesDropdown)}
								className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group ${
									serviceItems.some(item => isActive(item.to))
										? "text-[#3B82F6]"
										: "text-[var(--text-secondary)] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
								}`}
							>
								<div className="flex items-center">
									<FiGrid className={`mr-3 text-lg ${serviceItems.some(item => isActive(item.to)) ? "text-[#3B82F6]" : "text-[var(--text-muted)] group-hover:text-[#3B82F6]"} transition-colors`} size={18} />
									<span className="uppercase text-xs tracking-wider">Services</span>
								</div>
								<FiChevronDown
									className={`w-4 h-4 transition-transform duration-200 ${
										showServicesDropdown ? "rotate-180" : ""
									}`}
								/>
							</button>

							{showServicesDropdown && (
								<div className="mt-1 ml-6 pl-2 border-l border-[rgba(59,130,246,0.15)] flex flex-col gap-1">
									{serviceItems.map((service) => {
										const active = isActive(service.to);
										const Icon = service.icon;
										return (
											<Link
												key={service.label}
												to={service.to}
												className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 block ${
													active
														? "text-[#3B82F6] font-semibold"
														: "text-[var(--text-secondary)] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
												}`}
											>
												<Icon className="mr-2 text-sm text-[var(--text-muted)]" size={14} />
												<span>{service.label}</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</nav>

				{/* Minimal footer inside drawer */}
				<div className="p-4 border-t border-[rgba(59,130,246,0.1)] text-center">
					<p className="text-[10px] text-[var(--text-muted)]">Yuganta AI © 2026</p>
				</div>
			</aside>

			{/* SIDE DRAWER BACKDROP */}
			{isSidebarOpen && (
				<div
					onClick={() => setIsSidebarOpen(false)}
					className="fixed inset-0 top-16 bg-black/55 backdrop-blur-sm z-30 transition-opacity duration-300"
				/>
			)}
		</>
	);
}
