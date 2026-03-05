import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../config/api";

export default function InstructorForgotPasswordPage() {
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
				`${API_URL}/api/instructor-auth/forgot-password`,
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
				`${API_URL}/api/instructor-auth/reset-password`,
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
				navigate("/instructor");
			}, 2000);
		} catch (err) {
			setError("Network error. Please try again.");
			console.error("Reset password error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2f4f] to-[#2a4570] flex items-center justify-center px-4'>
			<div className='max-w-md w-full'>
				{/* Back to Login */}
				<Link
					to='/instructor'
					className='inline-flex items-center text-blue-300 hover:text-blue-200 mb-6 transition duration-200'>
					<svg
						className='w-5 h-5 mr-2'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M10 19l-7-7m0 0l7-7m-7 7h18'
						/>
					</svg>
					Back to Login
				</Link>

				{/* Forgot Password Card */}
				<div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20'>
					<div className='text-center mb-8'>
						<div className='flex items-center justify-center space-x-2 mb-4'>
						<img 
							src='/yuganta-logo.png' 
							alt='yugantaAI' 
							className='w-12 h-12'
						/>
							<div className='text-2xl font-bold'>
							<span className='text-white'>Yuganta</span>
							<span className='text-blue-400'>AI</span>
							</div>
						</div>
						<h2 className='text-3xl font-bold text-white mb-2'>
							Setup/Reset Password
						</h2>
						<p className='text-gray-300 text-sm'>
							Step {step} of 3 - Enter your email to receive an OTP and set your password
						</p>
					</div>

					{error && (
						<div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm'>
							{error}
						</div>
					)}

					{message && (
						<div className='mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm'>
							{message}
						</div>
					)}

					{/* Step 1: Email */}
					{step === 1 && (
						<form onSubmit={handleEmailSubmit} className='space-y-4'>
							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Email Address
								</label>
								<input
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
									placeholder='your@email.com'
									required
									disabled={loading}
								/>
								<p className='text-gray-400 text-xs mt-2'>
									We'll send a 6-digit OTP to your email (valid for 10 minutes)
								</p>
							</div>

							<button
								type='submit'
								disabled={loading}
								className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl active:scale-95'>
								{loading ? "Sending OTP..." : "Send OTP"}
							</button>
						</form>
					)}

					{/* Step 2: OTP */}
					{step === 2 && (
						<form onSubmit={handleOtpSubmit} className='space-y-4'>
							<div className='text-center mb-6'>
								<p className='text-gray-300 text-sm'>
									We've sent an OTP to<br />
									<span className='text-white font-semibold'>{email}</span>
								</p>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Enter OTP
								</label>
								<input
									type='text'
									value={otp}
									onChange={(e) => setOtp(e.target.value.slice(0, 6))}
									className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
									placeholder='000000'
									maxLength='6'
									required
									disabled={loading}
								/>
								<p className='text-gray-400 text-xs mt-2'>6-digit code sent to your email</p>
							</div>

							<button
								type='submit'
								disabled={loading || otp.length !== 6}
								className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl active:scale-95'>
								Verify OTP
							</button>

							<button
								type='button'
								onClick={() => setStep(1)}
								className='w-full text-blue-300 hover:text-blue-200 py-2 transition duration-200'>
								Back
							</button>
						</form>
					)}

					{/* Step 3: New Password */}
					{step === 3 && (
						<form onSubmit={handlePasswordReset} className='space-y-4'>
							<div className='text-center mb-6'>
								<p className='text-gray-300 text-sm'>
									Create a new password for your account
								</p>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									New Password
								</label>
								<input
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
									placeholder='Min 6 characters'
									required
									disabled={loading}
								/>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Confirm Password
								</label>
								<input
									type='password'
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
									placeholder='Re-enter password'
									required
									disabled={loading}
								/>
							</div>

							<button
								type='submit'
								disabled={loading}
								className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl active:scale-95'>
								{loading ? "Resetting Password..." : "Reset Password"}
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
