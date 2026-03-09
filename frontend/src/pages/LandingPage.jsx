import { useState } from "react";
import { Link } from "react-router-dom";
import StructuredData from "../components/StructuredData";

export default function LandingPage() {
	const [email, setEmail] = useState("");

	const handleNewsletterSubmit = (e) => {
		e.preventDefault();
		console.log("Newsletter subscribe email:", email);
		setEmail("");
	};

	return (
		<div className="min-h-screen transition-colors duration-300">
			<StructuredData />
			{/* Hero Section */}
			<div className="relative min-h-screen flex items-center overflow-hidden">
				{/* Animated Background */}
				{/* Animated Background */}
				<div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)] opacity-90 transition-colors duration-300"></div>
				<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

				{/* Floating Animation Elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
					<div className="absolute top-40 right-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
					<div className="absolute bottom-20 left-20 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
				</div>

				<div className="max-w-7xl mx-auto px-4 md:px-6 py-20 relative z-10">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left Content */}
						<div>
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)] mb-6 leading-tight">
								Empowering Tomorrow's <span className="text-[#00D4FF]">Tech Leaders</span>
							</h1>
							<p className="text-lg md:text-xl text-[var(--text-muted)] mb-8 leading-relaxed">
								YugantaAI provides cutting-edge courses in MERN Stack, GenAI, and Agentic AI designed specifically for college students to excel in the tech industry. Beyond courses, we offer hands-on experience through innovative real-world projects including AI-powered HVAC systems, chatbots, and agentic AI applications.</p>
							<Link
								to="/courses"
								className="inline-block px-8 py-4 bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] text-white font-semibold rounded-full hover:shadow-[0_0_30px_rgba(0,188,212,0.5)] hover:scale-105 transition-all duration-200 text-lg"
							>
								Explore Our Courses
							</Link>
						</div>

						{/* Right Illustration */}
						<div className="relative hidden lg:block">
							<img
								src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
								alt="Students learning"
								className="rounded-2xl shadow-2xl"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Our Projects Section */}
			<div className="py-20">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="text-center mb-16">
						<p className="text-sm text-[#A855F7] font-semibold mb-2 uppercase tracking-wider">
							Innovation & Development
						</p>
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)]">
							Our Projects
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{/* Court Booker */}
						<Link to="/projects/court-booker" className="bg-[var(--card-bg)] border border-transparent rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 group">
							<div className="mb-6">
								<img
									src="/court_booking.png"
									alt="Court Booker"
									className="w-full h-40 object-cover rounded-2xl"
								/>
							</div>
							<h3 className="text-xl font-bold text-[var(--text-color)] mb-3 transition-colors">
								Court Booker
							</h3>
							<p className="text-sm text-[var(--text-muted)] leading-relaxed transition-colors">
								Smart booking system for sports courts and recreational facilities.
							</p>
						</Link>

						{/* AI Agent Avatar */}
						<Link to="/projects/ai-agent-avatar" className="bg-[var(--card-bg)] border border-transparent rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 group">
							<div className="mb-6">
								<img
									src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop"
									alt="AI Agent Avatar"
									className="w-full h-40 object-cover rounded-2xl"
								/>
							</div>
							<h3 className="text-xl font-bold text-[var(--text-color)] mb-3 transition-colors">
								AI Agent Avatar
							</h3>
							<p className="text-sm text-[var(--text-muted)] leading-relaxed transition-colors">
								Interactive 3D avatars powered by advanced AI for immersive experiences.
							</p>
						</Link>

						{/* HVAC Agent */}
						<Link to="/projects/hvac-agent" className="bg-[var(--card-bg)] border border-transparent rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 group">
							<div className="mb-6">
								<img
									src="/HVACimg.png"
									alt="HVAC Agent"
									className="w-full h-40 object-cover rounded-2xl"
								/>
							</div>
							<h3 className="text-xl font-bold text-[var(--text-color)] mb-3 transition-colors">
								HVAC Agent
							</h3>
							<p className="text-sm text-[var(--text-muted)] leading-relaxed transition-colors">
								Intelligent climate control systems optimization using AI.
							</p>
						</Link>

						{/* AI Learning Platform */}
						<Link to="/projects/ai-learning-platform" className="bg-[var(--card-bg)] border border-transparent rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 group">
							<div className="mb-6">
								<img
									src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop"
									alt="AI Learning Platform"
									className="w-full h-40 object-cover rounded-2xl"
								/>
							</div>
							<h3 className="text-xl font-bold text-[var(--text-color)] mb-3 transition-colors">
								AI Learning Platform
							</h3>
							<p className="text-sm text-[var(--text-muted)] leading-relaxed transition-colors">
								Next-generation educational platform personalized with AI.
							</p>
						</Link>
					</div>
				</div>
			</div>

			{/* Currently Courses Section */}
			<div className="py-20 md:py-32">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="text-center mb-16">
						<p className="text-sm text-[#A855F7] font-semibold mb-2 uppercase tracking-wider">
							We also provide courses
						</p>
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)]">
							Latest Courses
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
						<div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-4 shadow-xl">
							<div className="w-full h-44 md:h-48 overflow-hidden rounded-2xl mb-5">
								<img
									src="data:image/jpeg;base64,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"
									alt="AgenticAI Crash Course Page"
									className="w-full h-full object-cover"
								/>
							</div>

							<div className="flex items-center gap-3 text-[var(--text-muted)] text-sm mb-4">
								<span>150 Hours</span>
								<span>•</span>
								<span>15 Courses</span>
							</div>

							<h3 className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mb-4 leading-tight">
								Agentic AI Crash Course 
							</h3>

							<div className="flex flex-wrap gap-2 mb-6">
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">AI Agents</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">RAG</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">LangChain</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">AutoGen</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">CrewAI</span>
							</div>

							<Link
								to="/courses/agentic-ai-crash-course-page"
								className="block w-full text-center py-3.5 rounded-2xl border border-blue-300/70 text-base text-[var(--text-color)] font-semibold hover:border-blue-500 hover:text-blue-500 transition-colors"
							>
								Enroll Now
							</Link>
						</div>

						<div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-4 shadow-xl">
							<div className="w-full h-44 md:h-48 overflow-hidden rounded-2xl mb-5">
								<img
									src="data:image/jpeg;base64,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"
									alt="Agentic AI Pioneer Program"
									className="w-full h-full object-cover"
								/>
							</div>

							<div className="flex items-center gap-3 text-[var(--text-muted)] text-sm mb-4">
								<span>180+ Hours</span>
								<span>•</span>
								<span>4 Months</span>
							</div>

							<h3 className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mb-4 leading-tight">
								Agentic AI Pioneer Program
							</h3>

							<div className="flex flex-wrap gap-2 mb-6">
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">DSA</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">ML & DL</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">LangChain</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">CrewAI</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">LangGraph</span>
							</div>

							<Link
								to="/courses/agentic-ai-pioneer-program"
								className="block w-full text-center py-3.5 rounded-2xl border border-blue-300/70 text-base text-[var(--text-color)] font-semibold hover:border-blue-500 hover:text-blue-500 transition-colors"
							>
								Enroll Now
							</Link>
						</div>
					</div>
				</div>
			</div>
			
			



			{/* Why yugantaAI Section */}
			<div className="py-20 md:py-32 bg-[var(--bg-color)] transition-colors duration-300">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left Content */}
						<div>
							<p className="text-sm text-[#A855F7] font-semibold mb-4 uppercase tracking-wider">
								Explore
							</p>
							<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)] mb-8">
								Why yugantaAI?
							</h2>
							<p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6">
								yugantaAI is a leading technology education platform committed to empowering college students with industry-relevant skills in AI and software development.
							</p>
							<p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6">
								We offer a unique learning experience for students who want to stay ahead in the rapidly evolving tech landscape.
							</p>
							<p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8">
								Our focus on practical, hands-on projects ensures that every student not only learns but masters the skills needed to excel in their careers.
							</p>
							<Link
								to="/courses"
								className="inline-block px-8 py-4 border-2 border-[#00BCD4] text-[#00BCD4] font-semibold rounded-full hover:bg-[#00BCD4] hover:text-white transition-all duration-200"
							>
								Explore Our Courses
							</Link>
						</div>

						{/* Right Illustration */}
						<div className="relative">
							<img
								src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
								alt="Students collaborating"
								className="rounded-2xl shadow-2xl"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Why We Are The Right-Fit Section */}
			<div className="py-20 md:py-32">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left Illustration */}
						<div className="relative order-2 lg:order-1">
							<img
								src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop"
								alt="Learning environment"
								className="rounded-2xl shadow-2xl"
							/>
						</div>

						{/* Right Content */}
						<div className="order-1 lg:order-2">
							<p className="text-sm text-[#A855F7] font-semibold mb-4 uppercase tracking-wider">
								For You
							</p>
							<h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-8">
								Why We Are The Right-Fit?
							</h2>
							<p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6">
								We bring cutting-edge curriculum and industry expertise to deliver courses that prepare students for real-world challenges. Our teaching methodology focuses on practical implementation and project-based learning.
							</p>
							<p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6">
								Using the latest tools and frameworks, we create comprehensive, engaging, and career-focused courses. Our quality standards ensure that every student receives top-notch education before certification.
							</p>
							<p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8">
								We provide exceptional mentorship and support. Our structured yet flexible approach keeps students engaged and helps ensure they stay on track to achieve their learning goals.
							</p>
							<Link
								to="/courses"
								className="inline-block px-8 py-4 border-2 border-[#00BCD4] text-[#00BCD4] font-semibold rounded-full hover:bg-[#00BCD4] hover:text-white transition-all duration-200"
							>
								Explore Our Courses
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Video Section */}
			<div className="py-20 md:py-32 bg-[var(--bg-color)] transition-colors duration-300">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left Video */}
						<div className="relative">
							<div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] aspect-video flex items-center justify-center">
								<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop')] bg-cover bg-center opacity-30"></div>
								<button className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer z-10">
									<svg className="w-8 h-8 text-[#2563EB] ml-1" fill="currentColor" viewBox="0 0 24 24">
										<path d="M8 5v14l11-7z" />
									</svg>
								</button>
							</div>
						</div>

						{/* Right Content */}
						<div>
							<p className="text-sm text-[#A855F7] font-semibold mb-4 uppercase tracking-wider">
								Video
							</p>
							<h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-8">
								Why Is Learning With yugantaAI Important?
							</h2>
							<p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6">
								In today's rapidly evolving tech landscape, staying current with the latest technologies is crucial. Our courses transform the way students learn and prepare for their careers.
							</p>
							<p className="text-[var(--text-secondary)] text-lg leading-relaxed">
								From foundational concepts to advanced applications, our comprehensive curriculum brings together theory and practice to help students excel in their chosen tech domains.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Testimonials Section */}
			<div className="py-20 md:py-32">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="text-center mb-16">
						<p className="text-sm text-[#A855F7] font-semibold mb-2 uppercase tracking-wider">
							Testimonial
						</p>
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)]">
							What Our Students Say?
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Testimonial 1 */}
						<div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-xl border border-[rgba(139,92,246,0.2)] hover:border-[#A855F7] transition-all duration-300">
							<div className="mb-6">
								<svg className="w-12 h-12 text-[#00BCD4]" fill="currentColor" viewBox="0 0 24 24">
									<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
								</svg>
							</div>
							<p className="text-[var(--text-secondary)] leading-relaxed mb-6">
								Great course! The MERN stack curriculum was well-structured and the hands-on projects helped me land my first internship. Highly recommend YugantaAI!
							</p>
							<div className="border-t border-[rgba(139,92,246,0.2)] pt-6">
								<h4 className="text-[var(--text-color)] font-bold text-lg">Priya Sharma</h4>
								<p className="text-[#A855F7]">Computer Science Student, IIT Delhi</p>
							</div>
						</div>

						{/* Testimonial 2 */}
						<div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-xl border border-[rgba(139,92,246,0.2)] hover:border-[#A855F7] transition-all duration-300">
							<div className="mb-6">
								<svg className="w-12 h-12 text-[#00BCD4]" fill="currentColor" viewBox="0 0 24 24">
									<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
								</svg>
							</div>
							<p className="text-[var(--text-secondary)] leading-relaxed mb-6">
								The GenAI course opened up a whole new world for me. The instructors are knowledgeable and the support team is always there to help. Best decision I made!
							</p>
							<div className="border-t border-[rgba(139,92,246,0.2)] pt-6">
								<h4 className="text-[var(--text-color)] font-bold text-lg">Rahul Verma</h4>
								<p className="text-[#A855F7]">Engineering Student, BITS Pilani</p>
							</div>
						</div>

						{/* Testimonial 3 */}
						<div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-xl border border-[rgba(139,92,246,0.2)] hover:border-[#A855F7] transition-all duration-300">
							<div className="mb-6">
								<svg className="w-12 h-12 text-[#00BCD4]" fill="currentColor" viewBox="0 0 24 24">
									<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
								</svg>
							</div>
							<p className="text-[var(--text-secondary)] leading-relaxed mb-6">
								I completed the Agentic AI course and it was amazing! The practical approach and real-world projects gave me confidence to build my own AI applications.
							</p>
							<div className="border-t border-[rgba(139,92,246,0.2)] pt-6">
								<h4 className="text-[var(--text-color)] font-bold text-lg">Ananya Reddy</h4>
								<p className="text-[#A855F7]">AI Enthusiast, NIT Warangal</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Newsletter Section */}
			<div className="relative py-20 md:py-24 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-[#2D1B69] via-[#1E88E5] to-[#00ACC1]"></div>
				<div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
					<div className="flex flex-col lg:flex-row items-center justify-between gap-8">
						<div className="text-center lg:text-left">
							<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
								Subscribe
							</h2>
							<p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
								To Our Newsletter
							</p>
						</div>
						<form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Your Email"
								required
								className="px-6 py-4 rounded-full bg-[rgba(255,255,255,0.2)] backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-80 text-lg"
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
	);
}
