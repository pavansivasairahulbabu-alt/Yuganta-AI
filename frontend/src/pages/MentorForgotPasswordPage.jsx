import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../config/api";

export default function MentorForgotPasswordPage() {
	const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const navigate = useNavigate();

	const handleEmailSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await fetch(
				`${API_URL}/api/mentor-auth/forgot-password`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Failed to send OTP");
				setLoading(false);
				return;
			}

			setMessage(
				`${data.message} If you don't see it, please check your Spam or Junk folder.`
			);
			setStep(2);
		} catch (err) {
			setError("Network error. Please try again.");
			console.error("Forgot password error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleOtpSubmit = (e) => {
		e.preventDefault();
		setError("");

		// Trim and validate OTP
		const trimmedOtp = otp.trim();
		
		if (!trimmedOtp || trimmedOtp.length !== 6) {
			setError("Please enter a valid 6-digit OTP");
			return;
		}

		if (!/^\d{6}$/.test(trimmedOtp)) {
			setError("OTP must contain only numbers");
			return;
		}

		// Store trimmed OTP and proceed
		setOtp(trimmedOtp);
		setStep(3);
		setMessage("");
	};

	const handlePasswordReset = async (e) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(
				`${API_URL}/api/mentor-auth/reset-password`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, otp: otp.trim(), password }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Failed to reset password");
				setLoading(false);
				return;
			}

			setMessage(data.message);
			setTimeout(() => {
				navigate("/mentor/login");
			}, 2000);
		} catch (err) {
			setError("Network error. Please try again.");
			console.error("Reset password error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-[#0B0614] via-[#160B2E] to-[#1a0f3a] flex items-center justify-center px-4 py-12'>
			<div className='max-w-md w-full space-y-8'>
				{/* Back to Login */}
				<Link
					to='/mentor/login'
					className='inline-flex items-center text-[#A855F7] hover:text-[#EC4899] mb-4 transition duration-300 font-semibold'>
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
					Back to Login
				</Link>

				{/* Forgot Password Card */}
				<div className='bg-[#12091F] border border-[rgba(139,92,246,0.25)] backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-[0_8px_32px_rgba(139,92,246,0.2)]'>
					<div className='text-center mb-10'>
						<div className='flex items-center justify-center space-x-2 mb-6'>
							<img 
								src='/yuganta-logo.png' 
								alt='yuganta AI' 
								className='w-12 h-12'
							/>
							<div className='text-2xl font-bold'>
								<span className='text-white'>Yuganta</span>
								<span className='bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent'>AI</span>
							</div>
						</div>
						<h2 className='text-3xl font-bold text-white mb-2'>
							Mentor Password Setup
						</h2>
						<p className='text-[#C7C3D6] text-sm'>
							Step {step} of 3 - Enter your email to receive an OTP and set your password
						</p>
					</div>

					{error && (
						<div className='mb-6 p-4 bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.3)] rounded-lg text-[#EC4899] text-sm font-medium flex items-center space-x-2'>
							<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
								<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
							</svg>
							<span>{error}</span>
						</div>
					)}

					{message && (
						<div className='mb-6 p-4 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-lg text-[#22C55E] text-sm font-medium flex items-center space-x-2'>
							<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
								<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
							</svg>
							<span>{message}</span>
						</div>
					)}

					{/* Step 1: Email */}
					{step === 1 && (
						<form onSubmit={handleEmailSubmit} className='space-y-6'>
							<div>
								<label className='block text-white mb-2.5 text-sm font-semibold'>
									Email Address
								</label>
								<input
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className='w-full px-4 py-3.5 bg-[#0B0614] border border-[#2A1F4D] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300 hover:border-[rgba(139,92,246,0.5)]'
									placeholder='mentor@yugantaai.com'
									required
									disabled={loading}
								/>
								<p className='text-[#9A93B5] text-xs mt-2'>
									We'll send a 6-digit OTP to your email (valid for 10 minutes)
								</p>
							</div>

							<button
								type='submit'
								disabled={loading}
								className='w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white py-3.5 rounded-lg font-bold transition-all duration-300 shadow-[0_8px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_12px_32px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed'>
								{loading ? "Sending OTP..." : "Send OTP"}
							</button>

							<div className='text-center mt-6'>
								<p className='text-[#9A93B5] text-sm'>
									Remember your password?{" "}
									<Link
										to='/mentor/login'
										className='text-[#A855F7] hover:text-[#EC4899] font-semibold transition duration-300'>
										Back to Login
									</Link>
								</p>
							</div>
						</form>
					)}

					{/* Step 2: OTP */}
					{step === 2 && (
						<form onSubmit={handleOtpSubmit} className='space-y-6'>
							<div className='text-center mb-6'>
								<p className='text-[#C7C3D6] text-sm'>
									We've sent an OTP to<br />
									<span className='text-white font-semibold'>{email}</span>
								</p>
							</div>

							<div>
								<label className='block text-white mb-2.5 text-sm font-semibold'>
									Enter OTP
								</label>
								<input
									type='text'
									value={otp}
									onChange={(e) => setOtp(e.target.value.slice(0, 6))}
									className='w-full px-4 py-3.5 bg-[#0B0614] border border-[#2A1F4D] rounded-lg text-white text-center text-2xl tracking-widest placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300 hover:border-[rgba(139,92,246,0.5)]'
									placeholder='000000'
									maxLength='6'
									required
									disabled={loading}
								/>
								<p className='text-[#9A93B5] text-xs mt-2 text-center'>6-digit code sent to your email</p>
							</div>

							<button
								type='submit'
								disabled={loading || otp.length !== 6}
								className='w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white py-3.5 rounded-lg font-bold transition-all duration-300 shadow-[0_8px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_12px_32px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed'>
								Verify OTP
							</button>

							<button
								type='button'
								onClick={() => setStep(1)}
								className='w-full text-[#A855F7] hover:text-[#EC4899] py-2 transition duration-300 font-semibold'>
								Back
							</button>
						</form>
					)}

					{/* Step 3: New Password */}
					{step === 3 && (
						<form onSubmit={handlePasswordReset} className='space-y-6'>
							<div className='text-center mb-6'>
								<p className='text-[#C7C3D6] text-sm'>
									Create a new password for your mentor account
								</p>
							</div>

							<div>
								<label className='block text-white mb-2.5 text-sm font-semibold'>
									New Password
								</label>
								<input
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='w-full px-4 py-3.5 bg-[#0B0614] border border-[#2A1F4D] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300 hover:border-[rgba(139,92,246,0.5)]'
									placeholder='Min 6 characters'
									required
									disabled={loading}
								/>
							</div>

							<div>
								<label className='block text-white mb-2.5 text-sm font-semibold'>
									Confirm Password
								</label>
								<input
									type='password'
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className='w-full px-4 py-3.5 bg-[#0B0614] border border-[#2A1F4D] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300 hover:border-[rgba(139,92,246,0.5)]'
									placeholder='Re-enter password'
									required
									disabled={loading}
								/>
							</div>

							<button
								type='submit'
								disabled={loading}
								className='w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white py-3.5 rounded-lg font-bold transition-all duration-300 shadow-[0_8px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_12px_32px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed'>
								{loading ? "Resetting Password..." : "Reset Password"}
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
