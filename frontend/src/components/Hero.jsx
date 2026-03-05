export default function Hero() {
	return (
		<section className='relative bg-[var(--bg-color)] text-[var(--text-color)] py-12 md:py-20 px-4 md:px-6 mt-16 overflow-hidden transition-colors duration-300'>
			{/* Animated background gradient orbs */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3B82F6] opacity-20 rounded-full blur-[120px] animate-pulse-slow"></div>
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#60A5FA] opacity-20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFhMGYzYSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

			<div className='max-w-6xl mx-auto text-center relative z-10 space-y-10 animate-fadeInUp'>
				{/* Top Badge */}
				<div className='mb-8 md:mb-10 animate-fadeInDown'>
					<span className='inline-block text-[#3B82F6] text-xs md:text-sm font-bold uppercase tracking-wider px-5 py-2.5 bg-[var(--card-bg)] border border-[rgba(59,130,246,0.3)] rounded-full hover:bg-[rgba(59,130,246,0.15)] transition-all duration-300'>
						✨ GenAI & Agentic AI Mastery Program
					</span>
				</div>

				{/* Main Heading */}
				<div className='space-y-4 md:space-y-6 animate-fadeInUp animation-delay-100'>
					<h1 className='text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight px-2'>
						Master AI Agents,
						<br />
						<span className='bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent'>
							Build The Future
						</span>
					</h1>
					<p className='text-lg md:text-xl text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto px-4'>
						Industry-validated curriculum with 1:1 mentorship from AI experts. 150+ hours of learning, 12+ hands-on projects, and guaranteed career advancement.
					</p>
				</div>

				{/* Feature Pills */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto px-4 py-8 md:py-10 animate-fadeInUp animation-delay-200'>
					<div className='bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 hover:bg-[rgba(59,130,246,0.12)] hover:border-[rgba(59,130,246,0.4)] transition-all duration-300 group animate-scaleInUp animation-delay-100'>
						<svg className='w-6 h-6 text-[#3B82F6] mb-2 mx-auto group-hover:scale-110 transition-transform duration-300' fill='currentColor' viewBox='0 0 20 20'>
							<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
						</svg>
						<p className='text-sm md:text-base font-semibold'>1:1 Expert Mentorship</p>
					</div>
					<div className='bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 hover:bg-[rgba(59,130,246,0.12)] hover:border-[rgba(59,130,246,0.4)] transition-all duration-300 group animate-scaleInUp animation-delay-200'>
						<svg className='w-6 h-6 text-[#3B82F6] mb-2 mx-auto group-hover:scale-110 transition-transform duration-300' fill='currentColor' viewBox='0 0 20 20'>
							<path d='M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10.441c1.057-.465 2.245-.779 3.5-.779 1.948 0 3.764.382 5.384 1.176A8.025 8.025 0 0115.5 15c1.948 0 3.764.382 5.384 1.176V4.804A7.967 7.967 0 0015.5 4c-1.255 0-2.443.29-3.5.804V12a8.025 8.025 0 00-3-6.196zM8 5.5a.5.5 0 11-1 0 .5.5 0 011 0z' />
						</svg>
						<p className='text-sm md:text-base font-semibold'>100+ Learning Hours</p>
					</div>
					<div className='bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 hover:bg-[rgba(59,130,246,0.12)] hover:border-[rgba(59,130,246,0.4)] transition-all duration-300 group animate-scaleInUp animation-delay-300'>
						<svg className='w-6 h-6 text-[#3B82F6] mb-2 mx-auto group-hover:scale-110 transition-transform duration-300' fill='currentColor' viewBox='0 0 20 20'>
							<path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.648a3.066 3.066 0 01-3.062 3.062H9.231A9.065 9.065 0 007.000 16.89a9.065 9.065 0 00-2.231.274H4.267a3.066 3.066 0 01-3.062-3.062V6.517a3.066 3.066 0 012.812-3.062zM9 12a1 1 0 11-2 0 1 1 0 012 0z' clipRule='evenodd' />
						</svg>
						<p className='text-sm md:text-base font-semibold'>Real Projects</p>
					</div>
				</div>



				{/* Trust Badges */}
				<div className='pt-6 md:pt-10 border-t border-[rgba(59,130,246,0.1)] animate-fadeInUp animation-delay-300'>
					<p className='text-sm text-[#9A93B5] mb-4'>Trusted by students and industry leaders worldwide</p>
					<div className='flex justify-center gap-6 md:gap-8 text-[#C7C3D6] text-sm md:text-base'>
						<div className='text-center animate-floatSlow animation-delay-100'>
							<p className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent'>100+</p>
							<p className='text-xs md:text-sm'>Students</p>
						</div>
						<div className='w-px bg-[rgba(59,130,246,0.2)]'></div>
						<div className='text-center animate-floatSlow animation-delay-200'>
							<p className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent'>4.9/5</p>
							<p className='text-xs md:text-sm'>Rating</p>
						</div>
						<div className='w-px bg-[rgba(59,130,246,0.2)]'></div>
						<div className='text-center animate-floatSlow animation-delay-300'>
							<p className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent'>85%</p>
							<p className='text-xs md:text-sm'>Career Growth</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
