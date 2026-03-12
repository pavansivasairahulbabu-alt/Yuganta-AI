import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

export default function ForgotPasswordPage() {
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const requestOtp = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		setLoading(true);

		try {
			const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || "Failed to send OTP");
			}

			setMessage(`${data.message} If not visible, check Spam/Junk.`);
			setStep(2);
		} catch (err) {
			setError(err.message || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const resetPassword = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch(`${API_URL}/api/auth/reset-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp, password }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || "Failed to reset password");
			}

			setMessage(data.message || "Password reset successful.");
			setStep(3);
		} catch (err) {
			setError(err.message || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-[var(--bg-color)] flex items-center justify-center px-4 py-16'>
			<div className='max-w-md w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 shadow-xl'>
				<h1 className='text-2xl font-bold text-[var(--text-color)] mb-2'>Forgot Password</h1>
				<p className='text-sm text-[var(--text-muted)] mb-6'>Step {step} of 3</p>

				{error && <div className='mb-4 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300'>{error}</div>}
				{message && <div className='mb-4 rounded-lg border border-blue-400/40 bg-blue-500/10 p-3 text-sm text-blue-200'>{message}</div>}

				{step === 1 && (
					<form onSubmit={requestOtp} className='space-y-4'>
						<label className='block text-sm text-[var(--text-color)]'>Email</label>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className='w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 py-3 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/50'
						/>
						<button
							type='submit'
							disabled={loading}
							className='w-full rounded-xl bg-gradient-to-r from-[#1a56db] to-[#1e40af] py-3 font-semibold text-white disabled:opacity-60'>
							{loading ? "Sending OTP..." : "Send OTP"}
						</button>
					</form>
				)}

				{step === 2 && (
					<form onSubmit={resetPassword} className='space-y-4'>
						<label className='block text-sm text-[var(--text-color)]'>OTP</label>
						<input
							type='text'
							value={otp}
							onChange={(e) => setOtp(e.target.value.slice(0, 6))}
							required
							maxLength={6}
							className='w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 py-3 text-center tracking-[0.3em] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/50'
						/>

						<label className='block text-sm text-[var(--text-color)]'>New Password</label>
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={6}
							className='w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 py-3 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/50'
						/>

						<label className='block text-sm text-[var(--text-color)]'>Confirm Password</label>
						<input
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							minLength={6}
							className='w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 py-3 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/50'
						/>

						<button
							type='submit'
							disabled={loading}
							className='w-full rounded-xl bg-gradient-to-r from-[#1a56db] to-[#1e40af] py-3 font-semibold text-white disabled:opacity-60'>
							{loading ? "Resetting..." : "Reset Password"}
						</button>
					</form>
				)}

				{step === 3 && (
					<div className='rounded-xl border border-green-400/40 bg-green-500/10 p-4 text-green-200'>
						Password reset successful. You can now <Link to='/login' className='font-semibold text-blue-300'>login</Link>.
					</div>
				)}

				<div className='mt-6 text-sm text-[var(--text-muted)]'>
					Back to <Link to='/login' className='text-blue-400'>Login</Link>
				</div>
			</div>
		</div>
	);
}
