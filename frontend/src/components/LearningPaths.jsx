import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function LearningPaths() {
	const navigate = useNavigate();
	const [contentRef, contentVisible] = useScrollAnimation();
	const [imageRef, imageVisible] = useScrollAnimation();

	return (
		<section className='py-12 md:py-24 px-4 md:px-6 bg-[var(--bg-color)] text-[var(--text-color)] relative overflow-hidden transition-colors duration-300'>
			<div className='absolute inset-0 opacity-20'>
				<div className='absolute top-32 right-10 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]'></div>
				<div className='absolute bottom-10 left-20 w-80 h-80 bg-[#EC4899] rounded-full blur-3xl animate-[float_7s_ease-in-out_infinite_2s]'></div>
			</div>

			{/* Additional animated elements with different colors */}
			<div className='absolute top-1/4 left-1/3 w-40 h-40 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] opacity-8 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite]'></div>
			<div className='absolute bottom-1/4 right-1/3 w-32 h-32 bg-gradient-to-br from-[#F59E0B] to-[#D97706] opacity-10 rounded-full blur-2xl animate-[float_9s_ease-in-out_infinite_1s]'></div>
			<div className='absolute top-1/3 right-1/4 w-28 h-28 bg-gradient-to-br from-[#10B981] to-[#059669] opacity-10 rounded-full blur-2xl animate-[pulse_6s_ease-in-out_infinite_2s]'></div>

			<div className='max-w-6xl mx-auto relative z-10'>
				<div className='flex flex-col md:flex-row items-center gap-8 md:gap-12'>
					{/* Content */}
					<div ref={contentRef} className={`w-full md:w-1/2 ${contentVisible ? 'animate-slideInLeft' : 'opacity-0'}`}>
						<div className='flex items-center gap-3 mb-4'>
							<div className='w-1 h-8 bg-gradient-to-b from-[#8B5CF6] to-[#EC4899] rounded-full animate-pulse'></div>
							<p className='text-sm font-semibold text-[#A855F7] uppercase tracking-wider'>Learning Paths</p>
						</div>
						<h2 className='text-4xl md:text-5xl font-bold mb-4 md:mb-5 bg-gradient-to-r from-[var(--text-color)] via-[var(--text-muted)] to-[var(--text-muted)] bg-clip-text text-transparent'>
							Comprehensive Learning Paths from Industry Experts
						</h2>
						<p className='text-base md:text-lg mb-6 md:mb-7 text-[var(--text-muted)] leading-relaxed'>
							Explore our comprehensive, FREE learning paths designed by industry mentors. Master AI, machine learning, and deep learning through structured curricula that combines theory with hands-on projects.
						</p>
						<button
							onClick={() => navigate('/courses')}
							className='border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200'>
							Get Started for FREE
						</button>
					</div>

					{/* Right Section - Learning Stats Cards */}
					<div ref={imageRef} className={`w-full md:w-1/2 ${imageVisible ? 'animate-slideInRight' : 'opacity-0'}`}>
						<div className='space-y-4'>
							{/* Card 1 */}
							<div className='bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(168,85,247,0.05)] backdrop-blur-xl border border-[rgba(139,92,246,0.2)] rounded-2xl p-6 hover:border-[rgba(139,92,246,0.4)] transition-all duration-300 group hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)]'>
								<div className='flex items-start gap-4'>
									<div className='p-3 bg-[rgba(139,92,246,0.2)] rounded-xl group-hover:bg-[rgba(139,92,246,0.3)] transition-colors'>
										<svg className='w-6 h-6 text-[#A855F7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
										</svg>
									</div>
									<div className='flex-1'>
										<h3 className='text-lg font-bold text-[var(--text-color)] mb-1'>Adaptive Learning</h3>
										<p className='text-sm text-[var(--text-muted)]'>Personalized pace & difficulty levels</p>
									</div>
								</div>
							</div>

							{/* Card 2 */}
							<div className='bg-gradient-to-br from-[rgba(236,72,153,0.15)] to-[rgba(244,114,182,0.05)] backdrop-blur-xl border border-[rgba(236,72,153,0.2)] rounded-2xl p-6 hover:border-[rgba(236,72,153,0.4)] transition-all duration-300 group hover:shadow-[0_8px_32px_rgba(236,72,153,0.2)]'>
								<div className='flex items-start gap-4'>
									<div className='p-3 bg-[rgba(236,72,153,0.2)] rounded-xl group-hover:bg-[rgba(236,72,153,0.3)] transition-colors'>
										<svg className='w-6 h-6 text-[#EC4899]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
										</svg>
									</div>
									<div className='flex-1'>
										<h3 className='text-lg font-bold text-[var(--text-color)] mb-1'>Live Workshops</h3>
										<p className='text-sm text-[var(--text-muted)]'>Interactive sessions with industry experts</p>
									</div>
								</div>
							</div>

							{/* Card 3 */}
							<div className='bg-gradient-to-br from-[rgba(6,182,212,0.15)] to-[rgba(8,145,178,0.05)] backdrop-blur-xl border border-[rgba(6,182,212,0.2)] rounded-2xl p-6 hover:border-[rgba(6,182,212,0.4)] transition-all duration-300 group hover:shadow-[0_8px_32px_rgba(6,182,212,0.2)]'>
								<div className='flex items-start gap-4'>
									<div className='p-3 bg-[rgba(6,182,212,0.2)] rounded-xl group-hover:bg-[rgba(6,182,212,0.3)] transition-colors'>
										<svg className='w-6 h-6 text-[#06B6D4]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' />
										</svg>
									</div>
									<div className='flex-1'>
										<h3 className='text-lg font-bold text-[var(--text-color)] mb-1'>1:1 Mentorships</h3>
										<p className='text-sm text-[var(--text-muted)]'>Dedicated guidance from industry experts</p>
									</div>
								</div>
							</div>

							{/* Card 4 */}
							<div className='bg-gradient-to-br from-[rgba(245,158,11,0.15)] to-[rgba(251,191,36,0.05)] backdrop-blur-xl border border-[rgba(245,158,11,0.2)] rounded-2xl p-6 hover:border-[rgba(245,158,11,0.4)] transition-all duration-300 group hover:shadow-[0_8px_32px_rgba(245,158,11,0.2)]'>
								<div className='flex items-start gap-4'>
									<div className='p-3 bg-[rgba(245,158,11,0.2)] rounded-xl group-hover:bg-[rgba(245,158,11,0.3)] transition-colors'>
										<svg className='w-6 h-6 text-[#F59E0B]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z' />
										</svg>
									</div>
									<div className='flex-1'>
										<h3 className='text-lg font-bold text-[var(--text-color)] mb-1'>Community Access</h3>
										<p className='text-sm text-[var(--text-muted)]'>Network with learners & professionals</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
