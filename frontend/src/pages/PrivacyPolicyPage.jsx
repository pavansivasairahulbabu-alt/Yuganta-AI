const privacyPoints = [
	{
		title: "Information We Collect",
		content:
			"We collect details you provide directly, such as your name, email, phone number, and course interests when you register or submit forms.",
	},
	{
		title: "How We Use Information",
		content:
			"Data is used to provide learning services, schedule mentorship calls, improve course recommendations, and communicate important account updates.",
	},
	{
		title: "Data Sharing",
		content:
			"We do not sell personal information. We may share limited data with trusted service providers for hosting, analytics, payments, and communication support.",
	},
	{
		title: "Data Protection",
		content:
			"We use reasonable administrative and technical safeguards to protect your data against unauthorized access, disclosure, and misuse.",
	},
	{
		title: "Your Rights",
		content:
			"You may request access, correction, or deletion of your personal information by contacting us through official support channels.",
	},
];

export default function PrivacyPolicyPage() {
	return (
		<section className='min-h-screen bg-gradient-to-b from-[#EAF4FF] via-[#F3F9FF] to-[#FFFFFF] py-14 md:py-20'>
			<div className='max-w-5xl mx-auto px-4 md:px-6'>
				<div className='rounded-2xl border border-[#BFDBFE] bg-white shadow-[0_16px_40px_rgba(30,64,175,0.08)] p-6 md:p-10'>
					<p className='text-sm font-semibold uppercase tracking-wide text-[#1D4ED8] mb-3'>
						Legal
					</p>
					<h1 className='text-3xl md:text-4xl font-bold text-[#0F172A] mb-4'>
						Privacy Policy
					</h1>
					<p className='text-[#334155] leading-relaxed mb-8'>
						This policy explains how YugantaAI collects, uses, and protects your
						personal data while you use our platform.
					</p>

					<div className='space-y-5'>
						{privacyPoints.map((point) => (
							<div key={point.title} className='rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] p-5'>
								<h2 className='text-lg font-semibold text-[#1E3A8A] mb-2'>{point.title}</h2>
								<p className='text-[#334155] leading-relaxed'>{point.content}</p>
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
