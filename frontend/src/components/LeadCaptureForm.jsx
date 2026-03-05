import { useState } from "react";
import toast from "react-hot-toast";
import API_URL from "../config/api";

export default function LeadCaptureForm({
	courseId,
	courseName,
	onClose,
	onDownload,
	type = "Brochure",
}) {
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		email: "",
	});
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(`${API_URL}/api/leads`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					courseId,
					courseName,
					type,
				}),
			});

			if (response.ok) {
				const data = await response.json();

				if (type === "Brochure") {
					// Check if this is an "already requested" response
					if (
						data.message &&
						data.message.includes("already requested")
					) {
						toast(
							"You've already requested this brochure. Downloading again...",
							{ icon: "✓", duration: 2000 },
						);
					} else {
						toast.success("Thank you! Downloading brochure...");
					}

					// Always trigger download if onDownload is provided
					if (onDownload) {
						setTimeout(() => onDownload(), 500);
					}
				} else {
					toast.success(
						"Enrollment request received! We will contact you shortly.",
					);
				}

				onClose();
			} else {
				const errorData = await response.json().catch(() => ({}));
				toast.error(
					errorData.message ||
						"Something went wrong. Please try again.",
				);
			}
		} catch (error) {
			console.error("Lead submission error:", error);
			toast.error("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn'>
			<div className='bg-[#12091F] border border-[rgba(139,92,246,0.3)] rounded-2xl w-full max-w-md p-8 relative shadow-[0_0_50px_rgba(139,92,246,0.2)]'>
				{/* Close Button */}
				<button
					onClick={onClose}
					className='absolute top-4 right-4 text-gray-400 hover:text-white transition'>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M6 18L18 6M6 6l12 12'
						/>
					</svg>
				</button>

				<h2 className='text-2xl font-bold text-white mb-2'>
					{type === "Brochure" ? "Download Brochure" : "Enroll Now"}
				</h2>
				<p className='text-gray-400 text-sm mb-6'>
					{type === "Brochure"
						? "Enter your details to get the full course roadmap."
						: "Fill in your details to start your journey with us."}
				</p>

				<form onSubmit={handleSubmit} className='space-y-5'>
					<div>
						<label className='block text-gray-300 text-sm font-medium mb-2'>
							Full Name
						</label>
						<input
							required
							type='text'
							placeholder='John Doe'
							className='w-full bg-[#0B0614] border border-[#2A1F4D] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition outline-none'
							value={formData.name}
							onChange={(e) =>
								setFormData({
									...formData,
									name: e.target.value,
								})
							}
						/>
					</div>
					<div>
						<label className='block text-gray-300 text-sm font-medium mb-2'>
							Phone Number
						</label>
						<input
							required
							type='tel'
							placeholder='+91 98765 43210'
							className='w-full bg-[#0B0614] border border-[#2A1F4D] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition outline-none'
							value={formData.phone}
							onChange={(e) =>
								setFormData({
									...formData,
									phone: e.target.value,
								})
							}
						/>
					</div>
					<div>
						<label className='block text-gray-300 text-sm font-medium mb-2'>
							Email Address
						</label>
						<input
							required
							type='email'
							placeholder='john@example.com'
							className='w-full bg-[#0B0614] border border-[#2A1F4D] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition outline-none'
							value={formData.email}
							onChange={(e) =>
								setFormData({
									...formData,
									email: e.target.value,
								})
							}
						/>
					</div>

					<button
						type='submit'
						disabled={loading}
						className='w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center'>
						{loading ? (
							<svg
								className='animate-spin h-5 w-5 text-white'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
							</svg>
						) : type === "Brochure" ? (
							"Download Roadmap"
						) : (
							"Submit Enrollment"
						)}
					</button>

					<p className='text-xs text-center text-gray-500 mt-4'>
						By submitting, you agree to our Terms & Privacy Policy.
					</p>
				</form>
			</div>
		</div>
	);
}
