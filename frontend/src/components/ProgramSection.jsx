export default function ProgramSection() {
	const programs = [
		{
			title: "GenAI Pinnacle Plus Program",
			features: [
				"300+ Hours of Immersive Learning",
				"50+ Industry-Aligned Projects",
				"1:1 Expert Mentorship",
			],
			badge: "Newly Launched",
			gradient: "from-blue-600 to-purple-700",
		},
		{
			title: "Agentic AI Pioneer Program",
			features: [
				"1:1 Mentorship with Leading AI Experts",
				"150+ Hours of Comprehensive learning",
				"12+ Hands-on Projects on Skill-Building",
			],
			gradient: "from-orange-500 to-amber-700",
		},
	];

	return (
		<section
			id='programs'
			className='py-16 md:py-28 px-4 md:px-6 bg-[#0B0614]'>
			<div className='max-w-7xl mx-auto'>
				{programs.map((program, index) => {
					const anchorId = program.title
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, "-")
						.replace(/(^-|-$)/g, "");

					return (
						<div
							key={index}
							id={anchorId}
							className={`mb-12 md:mb-16 flex flex-col ${
								index % 2 === 0
									? "md:flex-row"
									: "md:flex-row-reverse"
							} items-center gap-8 md:gap-12 animate-fadeInUp animation-delay-${index * 100}`}>
							{/* Image Card */}
						<div className='w-full md:w-1/2 relative animate-slideInLeft'>
								{program.badge && (
									<div className='absolute top-4 left-4 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold z-10 shadow-[0_4px_16px_rgba(139,92,246,0.4)]'>
										{program.badge}
									</div>
								)}
								<div
								className={`rounded-2xl overflow-hidden bg-gradient-to-br ${program.gradient} h-64 md:h-80 flex items-center justify-center border border-[rgba(139,92,246,0.3)] shadow-[0_8px_32px_rgba(139,92,246,0.2)] hover:shadow-[0_16px_48px_rgba(139,92,246,0.35)] hover:-translate-y-2 transition-all duration-300`}>
									<div className='text-white text-center p-8'>
										<div className='text-4xl md:text-6xl mb-4'>🤖</div>
										<p className='text-lg md:text-xl font-semibold'>
											AI Learning Experience
										</p>
									</div>
								</div>
							</div>

							{/* Content */}
						<div className='w-full md:w-1/2 animate-slideInRight'>
								<h2 className='text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-white'>
									{program.title}
								</h2>
								<ul className='space-y-3 md:space-y-4 mb-6 md:mb-8'>
									{program.features.map((feature, idx) => (
										<li
											key={idx}
											className='flex items-start text-base md:text-lg text-[#C7C3D6]'>
											<span className='text-[#A855F7] mr-2 md:mr-3 text-lg md:text-xl'>
												•
											</span>
											{feature}
										</li>
									))}
								</ul>
								<button className='bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-200 text-sm md:text-base shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.6)] hover:-translate-y-1'>
									Explore AI Agents
								</button>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
