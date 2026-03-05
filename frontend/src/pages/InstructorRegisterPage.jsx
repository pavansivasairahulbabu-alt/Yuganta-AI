import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useInstructor } from "../context/InstructorContext";
import API_URL from "../config/api";

export default function InstructorRegisterPage() {
	const [step, setStep] = useState(1); // 1: Register, 2: OTP, 3: Set Password
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [expertise, setExpertise] = useState("");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const { isAuthenticated } = useInstructor();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/instructor/dashboard", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const handleRegister = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await fetch(
				`${API_URL}/api/instructor-auth/register`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name, email, expertise }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Registration failed");
				setLoading(false);
				return;
			}

			setMessage(data.message);
			setStep(2);
		} catch (err) {
			setError("Network error. Please try again.");
			console.error("Register error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleOtpVerify = async (e) => {
		e.preventDefault();
		setError("");

		if (!otp || otp.length !== 6) {
			setError("Please enter a valid 6-digit OTP");
			return;
		}

		setStep(3);
		setMessage("");
	};

	const handleSetPassword = async (e) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(
				`${API_URL}/api/instructor-auth/setup-password`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, otp, password }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Failed to set password");
				setLoading(false);
				return;
			}

			setMessage(data.message);
			setTimeout(() => {
				navigate("/instructor");
			}, 2000);
		} catch (err) {
			setError("Network error. Please try again.");
			console.error("Set password error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2f4f] to-[#2a4570] flex items-center justify-center px-4'>
			<div className='max-w-md w-full'>
				{/* Back to Home */}
				<Link
					to='/'
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
					Back to Home
				</Link>

				{/* Register Card */}
				<div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20'>
					<div className='text-center mb-8'>
						<div className='flex items-center justify-center space-x-2 mb-4'>
						<img 
							src='/yuganta-logo.png' 
							alt='yuganta AI' 
							className='w-12 h-12'
						/>
						<div className='text-2xl font-bold'>
							<span className='text-white'>Yuganta</span>
							<span className='bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>AI</span>
							</div>
						</div>
						<h2 className='text-3xl font-bold text-white mb-2'>
							Become an Instructor
						</h2>
						<p className='text-gray-300 text-sm'>
							Step {step} of 3
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

					{/* Step 1: Register */}
					{step === 1 && (
						<form onSubmit={handleRegister} className='space-y-4'>
							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Full Name
								</label>
								<input
									type='text'
									value={name}
									onChange={(e) => setName(e.target.value)}
									className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
									placeholder='Your full name'
									required
									disabled={loading}
								/>
							</div>

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
							</div>

							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Expertise
								</label>
								<input
									type='text'
									value={expertise}
									onChange={(e) => setExpertise(e.target.value)}
									className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
									placeholder='e.g., Web Development, AI/ML'
									required
									disabled={loading}
								/>
							</div>

							<button
								type='submit'
								disabled={loading}
								className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl'>
								{loading ? "Creating Account..." : "Continue"}
							</button>
						</form>
					)}

					{/* Step 2: OTP Verification */}
					{step === 2 && (
						<form onSubmit={handleOtpVerify} className='space-y-4'>
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
								className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl'>
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

					{/* Step 3: Set Password */}
					{step === 3 && (
						<form onSubmit={handleSetPassword} className='space-y-4'>
							<div className='text-center mb-6'>
								<p className='text-gray-300 text-sm'>
									Create a secure password for your account
								</p>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm font-medium'>
									Password
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
								className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl'>
								{loading ? "Setting Password..." : "Complete Registration"}
							</button>
						</form>
					)}

					{step === 1 && (
						<div className='mt-4 text-center'>
							<p className='text-gray-300 text-sm'>
								Already have an account?{" "}
								<Link
									to='/instructor'
									className='text-blue-400 hover:text-blue-300 font-semibold'>
									Sign In
								</Link>
							</p>
						</div>
					)}

					<div className='mt-4 p-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg text-yellow-200 text-xs'>
						<p className='font-semibold mb-1'>📝 Note:</p>
						<p>
							After registration, your account will need admin approval before you can teach courses.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
