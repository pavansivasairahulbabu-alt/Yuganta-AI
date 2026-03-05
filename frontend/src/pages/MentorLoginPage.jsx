import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMentor } from "../context/MentorContext";
import { useTheme } from "../context/ThemeContext";

export default function MentorLoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { login, isAuthenticated } = useMentor();
	const { isDarkMode } = useTheme();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/mentor/dashboard", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		const result = await login(email, password);
		if (result.success) {
			navigate("/mentor/dashboard");
		} else {
			setError(result.error);
		}
	};

	return (
		<div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
			isDarkMode 
				? 'bg-gradient-to-br from-[#0B0614] via-[#160B2E] to-[#1a0f3a]' 
				: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
		}`}>
			<div className='max-w-md w-full space-y-8'>
				{/* Back to Home */}
				<Link
					to='/'
					className={`inline-flex items-center mb-4 transition duration-300 font-semibold ${
						isDarkMode
							? 'text-[#A855F7] hover:text-[#EC4899]'
							: 'text-blue-600 hover:text-blue-800'
					}`}>
					<svg
						className='w-5 h-5 mr-2'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2.5}
							d='M10 19l-7-7m0 0l7-7m-7 7h18'
						/>
					</svg>
					Back to Home
				</Link>

				{/* Login Card */}
				<div className={`backdrop-blur-xl rounded-2xl p-8 md:p-10 ${
					isDarkMode
						? 'bg-[#12091F] border border-[rgba(139,92,246,0.25)] shadow-[0_8px_32px_rgba(139,92,246,0.2)]'
						: 'bg-white border border-blue-200 shadow-[0_8px_32px_rgba(59,130,246,0.15)]'
				}`}>
					<div className='text-center mb-10'>
						<div className='flex items-center justify-center space-x-2 mb-6'>
							<div className='text-2xl font-bold'>
								<span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Yuganta</span>
								<span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>AI</span>
							</div>
						</div>
						<h2 className={`text-3xl font-bold mb-2 ${
							isDarkMode ? 'text-white' : 'text-gray-900'
						}`}>
							Mentor Portal
						</h2>
						<p className={isDarkMode ? 'text-[#C7C3D6]' : 'text-gray-600'}>
							Sign in to manage your mentorship sessions
						</p>
					</div>

					{error && (
						<div className={`mb-6 p-4 rounded-lg text-sm font-medium flex items-center space-x-2 ${
							isDarkMode
								? 'bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.3)] text-[#EC4899]'
								: 'bg-red-50 border border-red-200 text-red-600'
						}`}>
							<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
								<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
							</svg>
							<span>{error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label className={`block mb-2.5 text-sm font-semibold ${
								isDarkMode ? 'text-white' : 'text-gray-700'
							}`}>
								Email Address
							</label>
							<input
								type='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className={`w-full px-4 py-3.5 rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${
									isDarkMode
										? 'bg-[#0B0614] border border-[#2A1F4D] text-white placeholder-[#9A93B5] focus:ring-blue-500 focus:border-blue-500 hover:border-[rgba(59,130,246,0.5)]'
										: 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400'
								}`}
								placeholder='mentor@yugantaai.com'
								required
							/>
						</div>

						<div>
							<label className={`block mb-2.5 text-sm font-semibold ${
								isDarkMode ? 'text-white' : 'text-gray-700'
							}`}>
								Password
							</label>
							<input
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className={`w-full px-4 py-3.5 rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${
									isDarkMode
										? 'bg-[#0B0614] border border-[#2A1F4D] text-white placeholder-[#9A93B5] focus:ring-blue-500 focus:border-blue-500 hover:border-[rgba(59,130,246,0.5)]'
										: 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400'
								}`}
								placeholder='Enter your password'
								required
							/>
						</div>

						<button
							type='submit'
							className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-lg font-bold transition-all duration-300 shadow-[0_8px_24px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-100'>
							Sign In
						</button>
					</form>

					<div className='mt-8 text-center space-y-4'>
						<Link
							to='/mentor/forgot-password'
							className={`inline-block font-semibold transition duration-300 ${
								isDarkMode
									? 'text-[#A855F7] hover:text-[#EC4899]'
									: 'text-blue-600 hover:text-blue-800'
							}`}>
							First time login or forgot password? Click here
						</Link>
						<p className={`text-sm ${
							isDarkMode ? 'text-[#9A93B5]' : 'text-gray-500'
						}`}>
							New mentor? Set your password first
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
