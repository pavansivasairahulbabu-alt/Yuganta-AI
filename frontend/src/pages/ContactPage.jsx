import { useState } from "react";
import SEO from "../components/SEO";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		email: "",
		name: "",
		subject: "",
		message: "",
	});

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleContactSubmit = (e) => {
		e.preventDefault();
		console.log("Contact form data:", formData);
		// Reset form
		setFormData({
			email: "",
			name: "",
			subject: "",
			message: "",
		});
	};

	return (
		<>
			<SEO
				title="Contact Us - Yuganta AI | Get in Touch"
				description="Contact Yuganta AI for inquiries about our AI courses, mentorship programs, and technology training. Located in Kamavarapukota, Eluru, Andhra Pradesh."
				keywords="contact yuganta ai, get in touch, support, customer service, kamavarapukota, eluru"
				url="/contact"
			/>
			<div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
				{/* Hero Section */}
				<div className="relative bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)] py-20 md:py-32 overflow-hidden">
					<div className="absolute inset-0 bg-[url('/contact.png')] bg-cover bg-center opacity-20"></div>
					<div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-secondary)]/85 via-[var(--bg-primary)]/85 to-[var(--bg-secondary)]/85"></div>
					<div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
						<div className="mb-6">
							<div className="flex items-center gap-2 text-sm md:text-base">
								<a href="/" className="text-[var(--text-muted)] hover:text-[#A855F7] transition-colors">
									Home
								</a>
								<span className="text-[var(--text-muted)]">/</span>
								<span className="text-[var(--text-color)]">Contact</span>
							</div>
						</div>
						<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-4">
							Contact
						</h1>
						<p className="text-lg md:text-xl text-[var(--text-muted)] max-w-3xl">
							Feel free to reach us
						</p>
					</div>
				</div>

				{/* Keep In Touch Section */}
				<div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						{/* Left Side - Map */}
						<div className="relative">
							<div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xl h-[400px] md:h-[500px]">
								<iframe
									src="https://www.google.com/maps?q=Kamavarapukota,Eluru,Andhra%20Pradesh,India&z=14&output=embed"
									width="100%"
									height="100%"
									style={{ border: 0 }}
									allowFullScreen=""
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
									title="Yuganta AI location in Kamavarapukota, Eluru"
									className="grayscale hover:grayscale-0 transition-all duration-300"
								></iframe>
								<div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
									<a
										href="https://www.google.com/maps/search/?api=1&query=Kamavarapukota,Eluru,Andhra%20Pradesh,India"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#2D1B69] text-sm font-medium hover:text-[#A855F7] transition-colors"
									>
										View larger map
									</a>
								</div>
								<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[rgba(0,0,0,0.7)] text-white px-4 py-2 rounded-lg text-sm">
									Use ctrl + scroll to zoom the map
								</div>
							</div>
						</div>

						{/* Right Side - Contact Info */}
						<div className="space-y-8">
							<h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-8">
								Keep In Touch
							</h2>

							{/* Mobile */}
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 bg-gradient-to-br from-[#69baf7] to-[#5fc2fb] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-1 ring-purple-400/30">
									<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
									</svg>
								</div>
								<div>
									<h3 className="text-xl font-semibold text-[var(--text-color)] mb-2">Mobile</h3>
									<p className="text-[var(--text-muted)] mb-1">Monday to Friday, 10 AM to 06 PM</p>
									<p className="text-[var(--text-muted)]">Tollfree : <span className="text-[var(--text-color)]">8978946421</span></p>
								</div>
							</div>

							{/* Email */}
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 bg-gradient-to-br from-[#69baf7] to-[#5fc2fb] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-1 ring-purple-400/30">
									<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>
								<div>
									<h3 className="text-xl font-semibold text-[var(--text-color)] mb-2">Email</h3>
									<a href="mailto:info@yugantaai.com" className="text-[#0b9bee] hover:text-[#1098e6] transition-colors text-lg">
										info@yugantaai.com
									</a>
								</div>
							</div>

							{/* India Location */}
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 bg-gradient-to-br from-[#69baf7] to-[#5fc2fb] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-1 ring-purple-400/30">
									<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
								</div>
								<div>
									<h3 className="text-xl font-semibold text-[var(--text-color)] mb-2">Location</h3>
									<p className="text-[var(--text-muted)] leading-relaxed">
										Yuganta AI,<br />
										Kamavarapukota, Eluru <br />
										Andhra Pradesh, India
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Leave A Message Section */}
				<div className="bg-[var(--bg-secondary)] py-16 md:py-24 transition-colors duration-300">
					<div className="max-w-4xl mx-auto px-4 md:px-6">
						<div className="text-center mb-12">
							<p className="text-sm text-[#A855F7] font-semibold mb-2 uppercase tracking-wider">
								Message
							</p>
							<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)]">
								Leave A Message
							</h2>
						</div>

						<form onSubmit={handleContactSubmit} className="space-y-6">
							{/* Email and Name Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleFormChange}
									placeholder="Your email"
									required
									className="px-6 py-4 bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all"
								/>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleFormChange}
									placeholder="Your Name"
									required
									className="px-6 py-4 bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all"
								/>
							</div>

							{/* Subject */}
							<input
								type="text"
								name="subject"
								value={formData.subject}
								onChange={handleFormChange}
								placeholder="Subject"
								required
								className="w-full px-6 py-4 bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all"
							/>

							{/* Message */}
							<textarea
								name="message"
								value={formData.message}
								onChange={handleFormChange}
								placeholder="Message"
								required
								rows="6"
								className="w-full px-6 py-4 bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all resize-none"
							></textarea>

							{/* Submit Button */}
							<div className="text-center">
								<button
									type="submit"
									className="px-12 py-4 bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] text-white font-semibold rounded-full hover:shadow-[0_0_30px_rgba(0,188,212,0.5)] hover:scale-105 transition-all duration-200 text-lg"
								>
									Submit Now
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
