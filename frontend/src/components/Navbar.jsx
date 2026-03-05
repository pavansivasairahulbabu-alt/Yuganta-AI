import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
	const [showExplore, setShowExplore] = useState(false);
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const navItems = [
		{ label: "Home", to: "/" },
		{
			label: "Program Dashboard",
			to: isAuthenticated ? "/my-learning" : "/login",
		},
		{ label: "Courses", to: "/free-courses" },
		{ label: "Blogs", to: "/blogs" },
		{ label: "About Us", to: "/about" },
		{ label: "Contact", to: "/contact" },
	];

	const handleNavClick = () => {
		setShowExplore(false);
		setMobileMenuOpen(false);
	};

	// Close dropdowns when route changes
	useEffect(() => {
		setShowExplore(false);
		setShowProfileMenu(false);
		setMobileMenuOpen(false);
	}, [location]);

	const handleLogout = () => {
		setShowProfileMenu(false);
		logout();
		// Use replace to avoid adding to history stack
		navigate("/", { replace: true });
	};

	return (
		<nav className='bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300 backdrop-blur-lg px-4 md:px-6 py-4 fixed w-full top-0 z-50 shadow-md border-b border-[var(--border-color)]'>
			<div className='max-w-7xl mx-auto flex items-center justify-between'>
				{/* Logo */}
				<Link to='/' className='flex items-center space-x-2 group'>
					<img
						src='/yuganta-logo.png'
						alt='yugantaAI'
						className='w-10 h-10 transition-transform group-hover:scale-110'
					/>
					<div className='text-lg md:text-xl font-bold'>
						<span className='text-[var(--text-color)]'>Yuganta</span>
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

				{/* Right Section: Explore + Profile */}
				<div className='hidden md:flex items-center gap-4'>
					{/* Explore Dropdown */}
					<div className='relative'>
						<button
							onClick={() => setShowExplore(!showExplore)}
							className='flex items-center space-x-2 px-4 py-2 border border-[#3B82F6] rounded-xl hover:bg-[rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-200 text-sm'>
							<span>Explore</span>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 9l-7 7-7-7'
								/>
							</svg>
						</button>

						{showExplore && (
							<div className='absolute top-full mt-2 bg-[#12091F] border border-[rgba(59,130,246,0.25)] rounded-xl shadow-[0_8px_32px_rgba(59,130,246,0.3)] py-2 w-48 right-0 backdrop-blur-sm'>
								<Link
									to='/my-learning'
									className='block px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] transition-all duration-200'>
									Learning Paths
								</Link>
								<Link
									to='/courses'
									className='block px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] transition-all duration-200'>
									Programs
								</Link>
							</div>
						)}
					</div>

					{/* User Menu */}
					{isAuthenticated ? (
						<div className='relative'>
							<button
								onClick={() =>
									setShowProfileMenu(!showProfileMenu)
								}
								className='w-[50px] h-[50px] bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-full flex items-center justify-center text-lg font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-200'>
								{user?.fullName?.charAt(0).toUpperCase()}
							</button>

							{showProfileMenu && (
								<div className='absolute top-full right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-lg py-2 w-48 backdrop-blur-sm'>
									<Link
										to='/my-learning'
										onClick={() =>
											setShowProfileMenu(false)
										}
										className='block px-4 py-2 text-[var(--text-color)] hover:bg-[var(--card-bg-hover)] hover:text-blue-500 transition-all duration-200'>
										Registered Courses
									</Link>
									<Link
										to='/profile'
										onClick={() =>
											setShowProfileMenu(false)
										}
										className='block px-4 py-2 text-[var(--text-color)] hover:bg-[var(--card-bg-hover)] hover:text-blue-500 transition-all duration-200'>
										Edit Profile
									</Link>
									<div className='border-t border-[var(--border-color)] my-2'></div>
									<button
										onClick={handleLogout}
										className='w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 transition-all duration-200'>
										Logout
									</button>
								</div>
							)}
						</div>
					) : (
						<Link
							to='/login'
							className='px-6 py-2 border border-[#3B82F6] rounded-xl hover:bg-[rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-200 text-sm'>
							Login
						</Link>
					)}
				</div>

				{/* Mobile Menu Button */}
				<button
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className='md:hidden p-2 hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all duration-200'>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						{mobileMenuOpen ? (
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						) : (
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M4 6h16M4 12h16M4 18h16'
							/>
						)}
					</svg>
				</button>
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
								className='px-4 py-2 hover:bg-[rgba(59,130,246,0.15)] rounded-lg text-sm font-semibold uppercase tracking-wide text-[#C7C3D6] hover:text-[#3B82F6] transition-all duration-200'>
								{item.label}
							</Link>
						))}

						<Link
							to='/courses'
							className='px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] rounded-lg transition-all duration-200'>
							Courses
						</Link>
						<Link
							to='/my-learning'
							className='px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] rounded-lg transition-all duration-200'>
							Learning Paths
						</Link>
						<Link
							to='/mentorships'
							className='block px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] transition-all duration-200'>
							Your Mentorship Sessions
						</Link>
						<Link
							to='/mentorships/book'
							className='block px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] transition-all duration-200'>
							Book Mentorship
						</Link>
						<Link
							to='/courses'
							className='px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] rounded-lg transition-all duration-200'>
							Programs
						</Link>

						{isAuthenticated ? (
							<>
								<div className='border-t border-[rgba(59,130,246,0.2)] my-2'></div>
								<div className='px-4 py-2 flex items-center space-x-3'>
									<div className='w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-full flex items-center justify-center font-bold shadow-[0_4px_15px_rgba(59,130,246,0.4)]'>
										{user?.fullName?.charAt(0).toUpperCase()}
									</div>
									<span className='font-semibold text-white'>{user?.fullName}</span>
								</div>
								<Link
									to='/profile'
									className='px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] rounded-lg transition-all duration-200'>
									My Profile
								</Link>
								<Link
									to='/my-learning'
									className='px-4 py-2 text-[#C7C3D6] hover:bg-[rgba(59,130,246,0.15)] hover:text-[#3B82F6] rounded-lg transition-all duration-200'>
									My Learning
								</Link>
								<button
									onClick={handleLogout}
									className='text-left px-4 py-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg transition-all duration-200'>
									Logout
								</button>
							</>
						) : (
							<Link
								to='/login'
								className='mx-4 px-6 py-2 border border-[#3B82F6] rounded-xl hover:bg-[rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] text-center transition-all duration-200'>
								Login
							</Link>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
