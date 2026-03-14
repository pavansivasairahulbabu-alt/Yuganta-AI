import { useState } from "react";
import { Link } from "react-router-dom";
import StructuredData from "../components/StructuredData";

export default function LandingPage() {
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

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
						<div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-4 shadow-xl">
							<div className="w-full h-44 md:h-48 overflow-hidden rounded-2xl mb-5">
								<img
									src="https://onug.net/wp-content/uploads/2025/02/ONUG-Blog-Image-1024x512-1.jpg"
									alt="AgenticAI Crash Course Page"
									className="w-full h-full object-cover"
								/>
							</div>

							<div className="flex items-center gap-3 text-[var(--text-muted)] text-sm mb-4">
								<span>80+ Hours</span>
								<span>•</span>
								<span>4 Weeks</span>
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
									src="https://miro.medium.com/v2/resize:fit:1400/1*LtgPxfl-J6dJrg9rRgWdGA.png"
									alt="Agentic AI Pioneer Program"
									className="w-full h-full object-cover"
								/>
							</div>

							<div className="flex items-center gap-3 text-[var(--text-muted)] text-sm mb-4">
								<span>150+ Hours</span>
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
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">AI Agents</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">RAG</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">AutoGen</span>
							</div>

							<Link
								to="/courses/agentic-ai-pioneer-program"
								className="block w-full text-center py-3.5 rounded-2xl border border-blue-300/70 text-base text-[var(--text-color)] font-semibold hover:border-blue-500 hover:text-blue-500 transition-colors"
							>
								Enroll Now
							</Link>
						</div>

						<div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-4 shadow-xl">
							<div className="w-full h-44 md:h-48 overflow-hidden rounded-2xl mb-5">
								<img
									src="https://miro.medium.com/1*u1dfDjx8WS86XlELNL252Q.jpeg"
									alt="Mastering Data Structures and Algorithms"
									className="w-full h-full object-cover"
								/>
							</div>

							<div className="flex items-center gap-3 text-[var(--text-muted)] text-sm mb-4">
								<span>40+ Hours</span>
								<span>•</span>
								<span>6 Weeks</span>
							</div>

							<h3 className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mb-4 leading-tight">
								Mastering Data Structures & Algorithms
							</h3>

							<div className="flex flex-wrap gap-2 mb-6">
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">Arrays</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">Linked Lists</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">Stacks & Queues</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">Searching & Sorting</span>
								<span className="px-3.5 py-1.5 rounded-lg border border-blue-300/70 text-sm font-semibold text-[var(--text-color)]">Trees & Graphs</span>
							</div>

							<Link
								to="/courses/dsa-machine-learning"
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
		</div>
	);
}
