import { useState } from "react";
import SEO from "../components/SEO";

export default function AboutPage() {
	const [email, setEmail] = useState("");

	const handleSubscribe = (e) => {
		e.preventDefault();
		// Handle newsletter subscription
		console.log("Subscribe email:", email);
		setEmail("");
	};

	return (
		<>
			<SEO
				title="About Us - Yuganta AI | AI & Digital Solutions"
				description="Learn about Yuganta AI's vision, mission, and how we help organizations modernize through AI-driven products and engineering services."
				keywords="about yuganta ai, company vision, digital transformation, AI solutions, IT services"
				url="/about"
			/>
			<div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
				{/* Hero Section */}
				<div className="relative bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)] py-20 md:py-32 overflow-hidden">
					<div className="absolute inset-0 bg-[url('/about.png')] bg-cover bg-center opacity-30"></div>
					<div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-secondary)]/75 via-[var(--bg-primary)]/75 to-[var(--bg-secondary)]/75"></div>
					<div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
						<div className="mb-6">
							<div className="flex items-center gap-2 text-sm md:text-base">
								<a href="/" className="text-[var(--text-muted)] hover:text-[#A855F7] transition-colors">
									Home
								</a>
								<span className="text-[var(--text-muted)]">/</span>
								<span className="text-[var(--text-color)]">About Us</span>
							</div>
						</div>
						<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-6">
							About Us
						</h1>
						<p className="text-lg md:text-xl text-[var(--text-muted)] max-w-3xl">
							Yuganta AI builds AI-powered products and modern digital experiences that help businesses grow faster, operate smarter, and serve customers better.
						</p>
					</div>
				</div>

				{/* Vision, Mission, What We Do Section */}
				<div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left Side - Image/Video */}
						<div className="relative">
							<div className="relative rounded-2xl overflow-hidden shadow-2xl">
								<img
									src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
									alt="Team collaboration"
									className="w-full h-auto"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/80 to-transparent"></div>
								{/* Play Button Overlay (optional) */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform">
										<svg className="w-8 h-8 text-[#2D1B69] ml-1" fill="currentColor" viewBox="0 0 24 24">
											<path d="M8 5v14l11-7z" />
										</svg>
									</div>
								</div>
							</div>
							{/* Decorative hand image */}
							<div className="absolute -left-8 -top-8 w-32 h-32 hidden lg:block">
								<img
									src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=200&fit=crop"
									alt="Hand with watch"
									className="rounded-lg shadow-xl"
								/>
							</div>
						</div>

						{/* Right Side - Text Content */}
						<div className="space-y-10">
							{/* Vision */}
							<div>
								<p className="text-sm text-[#A855F7] font-semibold mb-2  tracking-wider">
									Yuganta AI
								</p>
								<h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-4">
									Vision
								</h2>
								<p className="text-[var(--text-muted)] text-lg leading-relaxed">
									To empower every individual and organization with AI-driven intelligence, fostering a future where technology amplifies human potential.
								</p>
							</div>

							{/* Mission */}
							<div>
								<h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-4">
									Mission
								</h2>
								<p className="text-[var(--text-muted)] text-lg leading-relaxed">
									We are dedicated to providing accessible, high-quality AI education and innovative solutions that bridge the gap between complex technology and real-world application.
								</p>
							</div>

							{/* What We Do */}
							<div>
								<h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-4">
									What We Do ?
								</h2>
								<p className="text-[var(--text-muted)] text-lg leading-relaxed">
									We offer comprehensive AI training programs, mentorship, and enterprise solutions designed to equip learners and businesses with the skills needed to thrive in the AI era.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Statistics Section */}
				<div className="bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-secondary)] py-16 md:py-20">
					<div className="max-w-7xl mx-auto px-4 md:px-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
							{/* Projects */}
							<div className="text-center">
								<div className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-3">
									50<span className="text-[#A855F7]">+</span>
								</div>
								<div className="text-lg md:text-xl text-[var(--text-muted)] font-medium">
									Projects
								</div>
							</div>

							{/* Customers */}
							<div className="text-center">
								<div className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-3">
									20<span className="text-[#A855F7]">+</span>
								</div>
								<div className="text-lg md:text-xl text-[var(--text-muted)] font-medium">
									Customers
								</div>
							</div>

							{/* Ongoing Projects */}
							<div className="text-center">
								<div className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-3">
									10<span className="text-[#A855F7]">+</span>
								</div>
								<div className="text-lg md:text-xl text-[var(--text-muted)] font-medium">
									Ongoing Projects
								</div>
							</div>

							{/* Experts */}
							<div className="text-center">
								<div className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-3">
									50<span className="text-[#A855F7]">+</span>
								</div>
								<div className="text-lg md:text-xl text-[var(--text-muted)] font-medium">
									Experts
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Newsletter Section */}
				<div className="relative py-20 md:py-24 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)]"></div>
					<div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
						<div className="flex flex-col lg:flex-row items-center justify-between gap-8">
							{/* Left - Newsletter Text */}
							<div className="text-center lg:text-left">
								<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)] mb-2">
									Subscribe
								</h2>
								<p className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-color)]">
									To Our Newsletter
								</p>
							</div>

							{/* Right - Form */}
							<form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Your Email"
									required
									className="px-6 py-4 rounded-full bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--border-color)] text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#A855F7] w-full sm:w-80 text-lg"
								/>
								<button
									type="submit"
									className="px-8 py-4 bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200 text-lg whitespace-nowrap"
								>
									Subscribe Now
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
