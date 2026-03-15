import { useState } from "react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import API_URL from "../config/api";

const courseOptions = [
	{ value: "agentic-ai-crash-course", label: "Agentic AI Crash Course" },
	{ value: "agentic-ai-pioneer-program", label: "Agentic AI Pioneer Program" },
	{ value: "mastering-dsa-algorithms", label: "Mastering Data Structures & Algorithms" },
	{ value: "general-consultation", label: "General Consultation" },
];

const contactModes = ["Call", "WhatsApp", "Email", "Meet"];
const contactTimeSlots = ["Morning (9 AM - 12 PM)", "1 PM - 9 PM"];

export default function TalkToExpertPage() {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
		courseInterestedIn: "",
		discussionTopic: "",
		preferredContactMode: "",
		preferredContactTime: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const resetForm = () => {
		setFormData({
			fullName: "",
			email: "",
			phone: "",
			courseInterestedIn: "",
			discussionTopic: "",
			preferredContactMode: "",
			preferredContactTime: "",
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		const selectedCourse = courseOptions.find(
			(option) => option.value === formData.courseInterestedIn,
		);

		try {
			const response = await fetch(`${API_URL}/api/leads`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.fullName,
					email: formData.email,
					phone: formData.phone,
					courseId: formData.courseInterestedIn,
					courseName: selectedCourse?.label || "General Consultation",
					type: "Consultation",
					discussionTopic: formData.discussionTopic,
					preferredContactMode: formData.preferredContactMode,
					preferredContactTime: formData.preferredContactTime,
					leadSource: "Talk To Expert",
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || "Failed to submit request");
			}

			toast.success("Thanks! Our expert team will contact you soon.");
			resetForm();
		} catch (error) {
			toast.error(error.message || "Something went wrong");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<SEO
				title="Talk To An Expert - Yuganta AI"
				description="Share your learning goals and our experts will contact you with a personalized guidance plan."
				keywords="talk to expert, AI guidance, course counseling, yuganta ai"
				url="/talk-to-expert"
			/>
			<div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 pb-16 transition-colors duration-300">
				<div className="max-w-4xl mx-auto px-4 md:px-6">
					<div className="mb-10 text-center">
						<h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#2563EB] to-[#38BDF8] bg-clip-text text-transparent mb-4">
							Talk To An Expert
						</h1>
						<p className="text-[var(--text-muted)] text-base md:text-lg max-w-2xl mx-auto">
							Tell us your goals and preferred contact style. We will connect you with the right expert.
						</p>
					</div>

					<div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(37,99,235,0.12)]">
						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div>
									<label className="block text-sm font-semibold mb-2">Full Name</label>
									<input
										type="text"
										name="fullName"
										value={formData.fullName}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
										placeholder="Enter your full name"
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold mb-2">Email Address</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
										placeholder="you@example.com"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div>
									<label className="block text-sm font-semibold mb-2">Phone Number</label>
									<input
										type="tel"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
										placeholder="Enter your phone number"
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold mb-2">Course Interested In</label>
									<select
										name="courseInterestedIn"
										value={formData.courseInterestedIn}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
									>
										<option value="">Select a course</option>
										{courseOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-2">What topic do you want to discuss with the expert?</label>
								<textarea
									name="discussionTopic"
									value={formData.discussionTopic}
									onChange={handleChange}
									required
									rows="4"
									className="w-full px-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
									placeholder="Share your goals, current level, and what support you are looking for"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div>
									<label className="block text-sm font-semibold mb-2">Preferred Mode of Contact</label>
									<select
										name="preferredContactMode"
										value={formData.preferredContactMode}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
									>
										<option value="">Select mode</option>
										{contactModes.map((mode) => (
											<option key={mode} value={mode}>{mode}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold mb-2">Preferred Time to Contact</label>
									<select
										name="preferredContactTime"
										value={formData.preferredContactTime}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
									>
										<option value="">Select preferred time</option>
										{contactTimeSlots.map((slot) => (
											<option key={slot} value={slot}>{slot}</option>
										))}
									</select>
								</div>
							</div>

							<button
								type="submit"
								disabled={submitting}
								className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#0EA5E9] transition-all disabled:opacity-60"
							>
								{submitting ? "Submitting..." : "Submit Request"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
