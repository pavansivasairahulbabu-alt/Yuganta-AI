export default function Footer() {
	return (
		<footer className='bg-[#0a1f3d] text-white py-10 px-6'>
			<div className='max-w-7xl mx-auto'>
				{/* Main Footer Content */}
				<div className='flex flex-col md:flex-row justify-between items-start mb-8'>
					{/* Logo */}
					<div className='mb-8 md:mb-0'>
						<div className='flex items-center space-x-2 mb-2'>
							<svg
								className='w-12 h-12'
								viewBox='0 0 50 50'
								fill='none'>
								<path
									d='M10 40 L25 10 L40 40 M15 35 L35 35'
									stroke='white'
									strokeWidth='3'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
							<h3 className='text-2xl font-bold'>
								<span className='text-white'>Mero</span>
								<span className='text-blue-400'>sphere</span>
							</h3>
						</div>
					</div>

					{/* Navigation Columns */}
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 flex-1 md:ml-20'>
						{/* Merosphere Column */}
						<div>
							<h4 className='font-semibold mb-4'>Merosphere</h4>
							<ul className='space-y-3 text-sm text-gray-300'>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										About Us
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Our Team
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Careers
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Contact us
									</a>
								</li>
							</ul>
						</div>

						{/* Data Science Column */}
						<div>
							<h4 className='font-semibold mb-4'>Data Science</h4>
							<ul className='space-y-3 text-sm text-gray-300'>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Community
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Blog
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Hackathon
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Apply Jobs
									</a>
								</li>
							</ul>
						</div>

						{/* Companies Column */}
						<div>
							<h4 className='font-semibold mb-4'>Companies</h4>
							<ul className='space-y-3 text-sm text-gray-300'>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Post Jobs
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Trainings
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Hiring Hackathons
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Advertising
									</a>
								</li>
							</ul>
						</div>

						{/* Social Media Column */}
						<div>
							<h4 className='font-semibold mb-4'>Visit us</h4>
							<div className='flex space-x-3'>
								<a
									href='#'
									className='w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition'>
									<span className='text-[#0a1f3d] font-bold text-lg'>
										f
									</span>
								</a>
								<a
									href='#'
									className='w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition'>
									<span className='text-[#0a1f3d] font-bold text-lg'>
										in
									</span>
								</a>
								<a
									href='#'
									className='w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition'>
									<span className='text-[#0a1f3d] font-bold text-lg'>
										▶
									</span>
								</a>
								<a
									href='#'
									className='w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition'>
									<span className='text-[#0a1f3d] font-bold text-lg'>
										𝕏
									</span>
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400'>
					<p>© Copyright 2013-2026 Merosphere</p>
					<div className='flex space-x-4 mt-4 md:mt-0'>
						<a href='#' className='hover:text-white transition'>
							Privacy Policy
						</a>
						<span>|</span>
						<a href='#' className='hover:text-white transition'>
							Terms of Use
						</a>
						<span>|</span>
						<a href='#' className='hover:text-white transition'>
							Refund Policy
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
