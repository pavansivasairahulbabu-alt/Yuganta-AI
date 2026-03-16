import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [errorCode, setErrorCode] = useState("");
	const [loading, setLoading] = useState(false);
	const { login, googleLogin } = useAuth();
	const navigate = useNavigate();

	const handleGoogleSuccess = async (credentialResponse) => {
		setLoading(true);
		const result = await googleLogin(credentialResponse);
		if (result.success) {
			navigate("/");
		} else {
			setError(result.error);
		}
		setLoading(false);
	};

	const handleGoogleError = () => {
		setError("Google login failed. Please try again.");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setErrorCode("");
		setLoading(true);

		const result = await login(email, password);

		if (result.success) {
			navigate("/");
		} else {
			setError(result.error);
			setErrorCode(result.errorCode || "");
		}

		setLoading(false);
	};

	return (
		<div className='min-h-screen bg-[var(--bg-color)] flex items-center justify-center px-4 md:px-6 py-16 md:py-20 relative overflow-hidden transition-colors duration-300'>
			{/* Animated background orbs */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B5CF6] opacity-20 rounded-full blur-[120px] animate-pulse-slow"></div>
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#EC4899] opacity-20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

			<div className='max-w-md w-full relative z-10'>
				{/* Logo */}
				<div className='text-center mb-6 md:mb-8'>
					<Link
						to='/'
						className='inline-flex items-center space-x-2 mb-4 md:mb-6 group'>
						<img
							src='/yuganta-logo.png'
							alt='yuganta AI'
							className='w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-110'
						/>
						<div className='text-xl md:text-2xl font-bold text-white'>
							<span className='text-white'>Yuganta</span>
							<span className='bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent'>AI</span>
						</div>
					</Link>
					<h1 className='text-2xl md:text-3xl font-bold text-white mb-2'>
						Welcome Back
					</h1>
					<p className='text-sm md:text-base text-[#C7C3D6]'>
						Login to continue your learning journey
					</p>
				</div>

				{/* Login Form */}
				<div className='bg-[var(--card-bg)] border border-[rgba(139,92,246,0.25)] backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_rgba(139,92,246,0.3)] p-6 md:p-8 transition-colors duration-300'>
					{error && (
						<div className='bg-[rgba(236,72,153,0.1)] border border-[#EC4899] text-[#EC4899] px-4 py-3 rounded-xl mb-6'>
							{error}
						</div>
					)}
					{errorCode === "USER_NOT_VERIFIED" && (
						<div className='mb-6 rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-200'>
							<div className='font-medium'>Your account is not verified yet.</div>
							<div className='mt-2'>
								Please sign up again with the same email to receive a fresh OTP.
							</div>
							<div className='mt-2 flex items-center gap-4'>
								<Link to='/signup' className='font-semibold text-blue-300 hover:text-blue-200'>Go to Signup</Link>
								<Link to='/forgot-password' className='font-semibold text-blue-300 hover:text-blue-200'>Forgot Password</Link>
							</div>
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Email */}
						<div>
							<label className='block text-[var(--text-color)] text-sm font-medium mb-2'>
								Email Address
							</label>
							<input
								type='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className='w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[rgba(139,92,246,0.3)] transition-all duration-200'
								placeholder='Enter your email'
								required
							/>
						</div>

						{/* Password */}
						<div>
							<label className='block text-[var(--text-color)] text-sm font-medium mb-2'>
								Password
							</label>
							<div className='relative'>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									className='w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[rgba(139,92,246,0.3)] transition-all duration-200'
									placeholder='Enter your password'
									required
								/>
								<button
									type='button'
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-[#9A93B5] hover:text-[#A855F7] transition-colors duration-200'>
									{showPassword ? (
										<svg
											className='w-5 h-5'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
											/>
										</svg>
									) : (
										<svg
											className='w-5 h-5'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
											/>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
											/>
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Remember Me & Forgot Password */}
						<div className='flex items-center justify-between text-sm'>
							<label className='flex items-center text-[#C7C3D6] cursor-pointer'>
								<input
									type='checkbox'
									className='mr-2 rounded accent-[#8B5CF6]'
								/>
								Remember me
							</label>
							<Link
								to='/forgot-password'
								className='text-[#A855F7] hover:text-[#EC4899] transition-colors duration-200'>
								Forgot Password?
							</Link>
						</div>

						{/* Login Button */}
						<button
							type='submit'
							disabled={loading}
							className='w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_32px_rgba(139,92,246,0.6)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'>
							{loading ? "Logging in..." : "Login"}
						</button>

						{/* Divider */}
						<div className="my-6 flex items-center">
							<div className="flex-grow border-t border-[var(--border-color)]"></div>
							<span className="mx-4 text-sm text-[var(--text-muted)]">OR</span>
							<div className="flex-grow border-t border-[var(--border-color)]"></div>
						</div>

						{/* Social Logins */}
						<div className="space-y-3">
							<GoogleLogin
								onSuccess={handleGoogleSuccess}
								onError={handleGoogleError}
								useOneTap
							/>
						</div>
					</form>

					{/* Sign Up Link */}
					<p className='mt-6 text-center text-[#C7C3D6]'>
						Don't have an account?{" "}
						<Link
							to='/signup'
							className='text-[#A855F7] hover:text-[#EC4899] font-semibold transition-colors duration-200'>
							Sign Up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
