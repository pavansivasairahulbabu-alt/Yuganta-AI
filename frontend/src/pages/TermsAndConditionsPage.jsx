import { Link } from "react-router-dom";

const termsSections = [
	{
		title: "1. Acceptance of Terms",
		content:
			"By accessing or using YugantaAI services, you agree to comply with these Terms and Conditions. If you do not agree, please discontinue use of the platform.",
	},
	{
		title: "2. User Responsibilities",
		content:
			"You agree to provide accurate information, maintain the confidentiality of your account credentials, and use the platform in compliance with applicable laws.",
	},
	{
		title: "3. Payments and Refunds",
		content:
			"Course fees, mentorship plans, and related services are billed as listed at checkout. Refund requests are reviewed according to our published refund policy and service terms.",
	},
	{
		title: "4. Intellectual Property",
		content:
			"All course materials, videos, branding, and downloadable assets are owned by YugantaAI or its licensors. Reproduction or redistribution without permission is prohibited.",
	},
	{
		title: "5. Limitation of Liability",
		content:
			"YugantaAI is not liable for indirect, incidental, or consequential losses arising from platform usage, downtime, or third-party integrations.",
	},
	{
		title: "6. Changes to Terms",
		content:
			"We may update these terms from time to time. Continued use of the platform after updates indicates acceptance of the revised terms.",
	},
];

export default function TermsAndConditionsPage() {
	return (
		<section className='min-h-screen bg-gradient-to-b from-[#EAF4FF] via-[#F3F9FF] to-[#FFFFFF] py-14 md:py-20'>
			<div className='max-w-5xl mx-auto px-4 md:px-6'>
				<div className='rounded-2xl border border-[#BFDBFE] bg-white shadow-[0_16px_40px_rgba(30,64,175,0.08)] p-6 md:p-10'>
					<p className='text-sm font-semibold uppercase tracking-wide text-[#1D4ED8] mb-3'>
						Legal
					</p>
					<h1 className='text-3xl md:text-4xl font-bold text-[#0F172A] mb-4'>
						Terms and Conditions
					</h1>
					<p className='text-[#334155] leading-relaxed mb-8'>
						These terms govern your use of YugantaAI services, courses, and mentorship
						offers. Please read them carefully before using the platform.
					</p>

					<div className='space-y-5'>
						{termsSections.map((section) => (
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
