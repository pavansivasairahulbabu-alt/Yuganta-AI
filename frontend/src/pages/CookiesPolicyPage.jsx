const cookieSections = [
	{
		title: "What Are Cookies",
		content:
			"Cookies are small text files stored on your device that help websites remember your preferences and improve browsing experience.",
	},
	{
		title: "How We Use Cookies",
		content:
			"YugantaAI uses cookies to keep you signed in, understand user behavior, remember settings, and improve course discovery and performance.",
	},
	{
		title: "Types of Cookies",
		content:
			"We may use essential cookies, analytics cookies, and preference cookies. Essential cookies are required for core platform functionality.",
	},
	{
		title: "Managing Cookies",
		content:
			"You can control or disable cookies in your browser settings. Disabling some cookies may impact certain site features and user experience.",
	},
	{
		title: "Policy Updates",
		content:
			"We may update this Cookies Policy as platform features evolve. Significant updates will be reflected on this page with a revised date.",
	},
];

export default function CookiesPolicyPage() {
	return (
		<section className='min-h-screen bg-gradient-to-b from-[#EAF4FF] via-[#F3F9FF] to-[#FFFFFF] py-14 md:py-20'>
			<div className='max-w-5xl mx-auto px-4 md:px-6'>
				<div className='rounded-2xl border border-[#BFDBFE] bg-white shadow-[0_16px_40px_rgba(30,64,175,0.08)] p-6 md:p-10'>
					<p className='text-sm font-semibold uppercase tracking-wide text-[#1D4ED8] mb-3'>
						Legal
					</p>
					<h1 className='text-3xl md:text-4xl font-bold text-[#0F172A] mb-4'>
						Cookies Policy
					</h1>
					<p className='text-[#334155] leading-relaxed mb-8'>
						This page explains how cookies are used on YugantaAI and how you can
						manage your cookie preferences.
					</p>

					<div className='space-y-5'>
						{cookieSections.map((section) => (
							<div key={section.title} className='rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] p-5'>
								<h2 className='text-lg font-semibold text-[#1E3A8A] mb-2'>{section.title}</h2>
								<p className='text-[#334155] leading-relaxed'>{section.content}</p>
							</div>
						))}
					</div>

					<p className='text-sm text-[#475569] mt-8'>
						Last updated: March 15, 2026
					</p>
				</div>
			</div>
		</section>
	);
}
