import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function CoursesNavbar() {
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { theme, toggleTheme } = useTheme();

	const navItems = [
		{ label: "Courses", to: "/free-courses" },
		{
			label: "Program Dashboard",
			to: isAuthenticated ? "/my-learning" : "/login",
		},
	];

	const handleNavClick = () => {
		setMobileMenuOpen(false);
	};

	useEffect(() => {
		setShowProfileMenu(false);
		setMobileMenuOpen(false);
	}, [location]);

	const handleLogout = () => {
		setShowProfileMenu(false);
		logout();
		navigate("/", { replace: true });
	};

	return (
		<nav className='bg-[var(--card-bg)] backdrop-blur-lg text-[var(--text-color)] px-4 md:px-6 py-4 fixed w-full top-0 z-50 shadow-[0_8px_32px_rgba(59,130,246,0.15)] border-b border-[var(--border-color)] transition-colors duration-300'>
			<div className='max-w-7xl mx-auto flex items-center justify-between'>
				{/* Logo */}
				<Link to='/' className='flex items-center space-x-2 group'>
					<img
						src='/yuganta-logo.png'
						alt='yugantaAI'
						className='w-10 h-10 transition-transform group-hover:scale-110'
					/>
					<div className='text-lg md:text-xl font-bold'>
						<span className='text-white'>Yuganta</span>
						<span className='text-[#3B82F6]'>AI</span>
					</div>
				</Link>

				{/* Desktop Navigation */}
				<div className='hidden md:flex items-center flex-1 justify-center ml-8'>
					<div className='flex items-center gap-6'>
						{navItems.map((item) => (
							<Link
								key={item.label}
								to={item.to}
								onClick={handleNavClick}
								className='text-xs font-semibold uppercase tracking-wide text-[#C7C3D6] hover:text-[#3B82F6] transition-all duration-200 whitespace-nowrap relative after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#3B82F6] after:transition-all after:duration-300 hover:after:w-full'>
								{item.label}
							</Link>
						))}
					</div>
				</div>

				{/* Right Section */}
				<div className='hidden md:flex items-center gap-4'>
					<button
						onClick={toggleTheme}
						className='p-2 rounded-lg border border-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] transition-colors'
						aria-label='Toggle Theme'
						title={theme === "dark-theme" ? "Dark Mode" : "Light Mode"}
					>
						<span className="w-5 h-5 flex items-center justify-center">
							{theme === "dark-theme" ? (
								// Sun (White in Dark Mode)
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									className="w-5 h-5 text-white"
									strokeWidth={2}
								>
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
								// Moon (Black in Light Mode)
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="black"
									className="w-5 h-5"
								>
									<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
								</svg>
							)}
						</span>
					</button>
					{isAuthenticated ? (
						<div className='relative'>
							<button
								onClick={() => setShowProfileMenu(!showProfileMenu)}
								className='flex items-center space-x-3 px-4 py-2 border border-[#3B82F6] rounded-xl hover:bg-[rgba(59,130,246,0.1)] transition-all duration-200'>
								<div className='w-8 h-8 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full flex items-center justify-center text-white font-semibold'>
									{user?.name?.charAt(0).toUpperCase() || 'U'}
								</div>
								<span className='text-sm font-medium'>{user?.name}</span>
								<svg
									className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
								</svg>
							</button>

							{showProfileMenu && (
								<div className='absolute right-0 mt-2 w-64 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-lg py-2 z-50'>
									<Link
										to='/profile'
										className='block px-4 py-3 text-sm text-[var(--text-color)] hover:bg-[var(--card-bg-hover)] hover:text-blue-500 transition-colors'>
										Profile
									</Link>
									<Link
										to='/my-learning'
										className='block px-4 py-3 text-sm text-[var(--text-color)] hover:bg-[var(--card-bg-hover)] hover:text-blue-500 transition-colors'>
										My Learning
									</Link>
									<Link
										to='/mentorships'
										className='block px-4 py-3 text-sm text-[var(--text-color)] hover:bg-[var(--card-bg-hover)] hover:text-blue-500 transition-colors'>
										My Mentorships
									</Link>
									<button
										onClick={handleLogout}
										className='w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors'>
										Logout
									</button>
								</div>
							)}
						</div>
					) : (
						<>
							<Link
								to='/login'
								className='px-6 py-2 text-sm font-semibold text-[#C7C3D6] hover:text-[#3B82F6] transition-colors'>
								Login
							</Link>
							<Link
								to='/signup'
								className='px-6 py-2 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-xl text-sm font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-200'>
								Sign Up
							</Link>
						</>
					)}
				</div>

				{/* Mobile actions */}
				<div className='md:hidden flex items-center gap-2'>
					<button
						onClick={toggleTheme}
						className='p-2 rounded-lg border border-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] transition-colors'
						aria-label='Toggle Theme'
						title={theme === "dark-theme" ? "Dark Mode" : "Light Mode"}
					>
						<span className='text-lg text-[var(--icon-color)]'>{theme === "dark-theme" ? "☀️" : "🌙"}</span>
					</button>
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className='p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] transition-colors'>
						<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							{mobileMenuOpen ? (
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
							) : (
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
							)}
						</svg>
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className='md:hidden mt-4 pb-4 border-t border-[rgba(59,130,246,0.2)]'>
					<div className='flex flex-col space-y-2 mt-4'>
						{navItems.map((item) => (
							<Link
								key={item.label}
								to={item.to}
								onClick={handleNavClick}
								className='px-4 py-2 text-sm text-[#C7C3D6] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all'>
								{item.label}
							</Link>
						))}
						{isAuthenticated ? (
							<>
								<Link
									to='/profile'
									onClick={handleNavClick}
									className='px-4 py-2 text-sm text-[#C7C3D6] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all'>
									Profile
								</Link>
								<Link
									to='/my-learning'
									onClick={handleNavClick}
									className='px-4 py-2 text-sm text-[#C7C3D6] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all'>
									My Learning
								</Link>
								<Link
									to='/mentorships'
									onClick={handleNavClick}
									className='px-4 py-2 text-sm text-[#C7C3D6] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all'>
									My Mentorships
								</Link>
								<button
									onClick={handleLogout}
									className='px-4 py-2 text-sm text-[#C7C3D6] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all text-left'>
									Logout
								</button>
							</>
						) : (
							<>
								<Link
									to='/login'
									onClick={handleNavClick}
									className='px-4 py-2 text-sm text-[#C7C3D6] hover:text-[#3B82F6] hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all'>
									Login
								</Link>
								<Link
									to='/signup'
									onClick={handleNavClick}
									className='mx-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-xl text-sm font-semibold text-center'>
									Sign Up
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
