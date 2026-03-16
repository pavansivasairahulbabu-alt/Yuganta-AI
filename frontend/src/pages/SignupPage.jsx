import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [otp, setOtp] = useState("");
	const [message, setMessage] = useState("");
	const [errorCode, setErrorCode] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { signup, verifySignupOtp, googleLogin } = useAuth();
	const navigate = useNavigate();
	const shouldShowError = Boolean(error);

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

	const clearStatus = () => {
		setError("");
		setErrorCode("");
	};

	const handleChange = (e) => {
		clearStatus();
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleStartSignup = async (e) => {
		e.preventDefault();
		clearStatus();

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match!");
			return;
		}

		setLoading(true);
		const result = await signup(formData.fullName, formData.email, formData.password);

		if (result.success) {
			setMessage(result.message || "OTP sent to your email");
			setStep(2);
		} else {
			setError(result.error);
			setErrorCode(result.errorCode || "");
		}

		setLoading(false);
	};

	const handleVerifyOtp = async (e) => {
		e.preventDefault();
		clearStatus();
		if (!/^\d{6}$/.test(otp.trim())) {
			setError("Please enter a valid 6-digit OTP");
			return;
		}

		setLoading(true);
		const result = await verifySignupOtp(formData.email, otp.trim());
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
						className='inline-flex items-center space-x-2 mb-4 md:mb-6'>
						<img
							src='/yuganta-logo.png'
							alt='yuganta AI'
							className='w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-110'
						/>
						<div className='text-2xl font-bold text-white'>
							<span className='text-white'>Yuganta</span>
							<span className='bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent'>AI</span>
						</div>
					</Link>
					<h1 className='text-3xl font-bold text-white mb-2'>
						Create Account
					</h1>
					<p className='text-gray-400'>
						Join thousands of learners worldwide
					</p>
				</div>

				{/* Signup Form */}
				<div className='bg-[var(--card-bg)] border border-[rgba(139,92,246,0.25)] backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_rgba(139,92,246,0.3)] p-8 transition-colors duration-300'>
					{shouldShowError && (
						<div className='bg-[rgba(236,72,153,0.1)] border border-[#EC4899] text-[#EC4899] px-4 py-3 rounded-xl mb-6'>
							{error}
						</div>
					)}
					{errorCode === "USER_EXISTS" && (
						<div className='mb-6 rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-200'>
							<div className='font-medium'>This email already has an account.</div>
							<div className='mt-2 flex items-center gap-4'>
								<Link to='/login' className='font-semibold text-blue-300 hover:text-blue-200'>Login</Link>
								<Link to='/forgot-password' className='font-semibold text-blue-300 hover:text-blue-200'>Forgot Password</Link>
							</div>
						</div>
					)}
					{message && (
						<div className='bg-blue-500/10 border border-blue-400/40 text-blue-200 px-4 py-3 rounded-xl mb-6'>
							{message}
						</div>
					)}
					<div className='mb-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400'>
						<span className={step >= 1 ? 'text-blue-300' : ''}>Details</span>
						<span>/</span>
						<span className={step >= 2 ? 'text-blue-300' : ''}>OTP</span>
					</div>

					{step === 1 ? (
					<form onSubmit={handleStartSignup} className='space-y-5'>
						{/* Full Name */}
						<div>
							<label className='block text-[var(--text-color)] text-sm font-medium mb-2'>
								Full Name
							</label>
							<input
								type='text'
								name='fullName'
								value={formData.fullName}
								onChange={handleChange}
								className='w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[rgba(139,92,246,0.3)] transition-all duration-200'
								placeholder='Enter your full name'
								required
							/>
						</div>

						{/* Email */}
						<div>
							<label className='block text-[var(--text-color)] text-sm font-medium mb-2'>
								Email Address
							</label>
							<input
								type='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
								className='w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[rgba(139,92,246,0.3)] transition-all duration-200'
								placeholder='Enter your email'
								required
							/>
						</div>

						<div>
							<label className='block text-[var(--text-color)] text-sm font-medium mb-2'>
								Password
							</label>
							<div className='relative'>
								<input
									type={showPassword ? "text" : "password"}
									name='password'
									value={formData.password}
									onChange={handleChange}
									className='w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[rgba(139,92,246,0.3)] transition-all duration-200'
									placeholder='Create a password'
									required
									minLength={6}
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-[#9A93B5] hover:text-[#A855F7] transition-colors duration-200'>
									{showPassword ? (
										<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
										</svg>
									) : (
										<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
										</svg>
									)}
								</button>
							</div>
							<p className='text-xs text-gray-400 mt-1'>Must be at least 6 characters</p>
						</div>

						<div>
							<label className='block text-[var(--text-color)] text-sm font-medium mb-2'>
								Confirm Password
							</label>
							<div className='relative'>
								<input
									type={showConfirmPassword ? "text" : "password"}
									name='confirmPassword'
									value={formData.confirmPassword}
									onChange={handleChange}
									className='w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[rgba(139,92,246,0.3)] transition-all duration-200'
									placeholder='Confirm your password'
									required
								/>
								<button
									type='button'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-[#9A93B5] hover:text-[#A855F7] transition-colors duration-200'>
									{showConfirmPassword ? (
										<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
										</svg>
									) : (
										<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Terms & Conditions */}
						<div className='flex items-start'>
							<input
								type='checkbox'
								id='terms'
								className='mt-1 mr-2 rounded'
								required
							/>
							<label
								htmlFor='terms'
								className='text-sm text-gray-300'>
								I agree to the{" "}
								<a
									href='#'
									className='text-blue-400 hover:text-blue-300'>
									Terms of Service
								</a>{" "}
								and{" "}
								<a
									href='#'
									className='text-blue-400 hover:text-blue-300'>
									Privacy Policy
								</a>
							</label>
						</div>

						{/* Sign Up Button */}
						<button
							type='submit'
							disabled={loading}
							className='w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_32px_rgba(139,92,246,0.6)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'>
							{loading ? "Sending OTP..." : "Send Email OTP"}
						</button>

						{/* Divider */}
						<div className="my-5 flex items-center">
							<div className="flex-grow border-t border-[var(--border-color)]"></div>
							<span className="mx-4 text-sm text-[var(--text-muted)]">OR</span>
							<div className="flex-grow border-t border-[var(--border-color)]"></div>
						</div>

						{/* Social Logins */}
						<div className="space-y-3 flex justify-center">
							<GoogleLogin
								onSuccess={handleGoogleSuccess}
								onError={handleGoogleError}
								useOneTap
							/>
						</div>

					</form>
					) : step === 2 ? (
						<form onSubmit={handleVerifyOtp} className='space-y-5'>
							<div className='text-center text-sm text-gray-300'>
								Enter the OTP sent to <span className='font-semibold text-white'>{formData.email}</span> to create your account.
							</div>
							<div>
								<label className='block text-[var(--text-color)] text-sm font-medium mb-2'>OTP</label>
								<input
									type='text'
									value={otp}
									onChange={(e) => {
										clearStatus();
										setOtp(e.target.value.slice(0, 6));
									}}
									required
									maxLength={6}
									className='w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-center tracking-[0.3em] text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[rgba(139,92,246,0.3)] transition-all duration-200'
									placeholder='000000'
								/>
							</div>
							<button
								type='submit'
								disabled={loading}
								className='w-full bg-gradient-to-r from-[#1a56db] to-[#1e40af] hover:from-[#1d4ed8] hover:to-[#1e3a8a] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
								{loading ? "Creating Account..." : "Verify OTP & Create Account"}
							</button>
							<button
								type='button'
								onClick={() => {
									clearStatus();
									setStep(1);
								}}
								className='w-full text-blue-300 hover:text-blue-200 text-sm'>
								Back to Details
							</button>
						</form>
					) : null}

					{/* Login Link */}
					<p className='mt-6 text-center text-gray-400'>
						Already have an account?{" "}
						<Link
							to='/login'
							className='text-blue-400 hover:text-blue-300 font-semibold transition'>
							Login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
