import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, MapPin, CheckCircle } from "lucide-react";

export default function CourtBookerPage() {
	const features = [
		{
			title: "Real-Time Booking",
			description: "Instant court reservations with live availability updates",
			icon: Calendar
		},
		{
			title: "Multi-Court Management",
			description: "Manage multiple courts and facilities from one platform",
			icon: MapPin
		},
		{
			title: "User Profiles",
			description: "Track booking history and favorite venues",
			icon: Users
		},
		{
			title: "AI Agent Support",
			description: "Book tickets through AI agent - No human support needed, fully automated",
			icon: CheckCircle
		}
	];

	const techStack = ["React", "Node.js", "MongoDB", "Express", "AI Agent", "Socket.io"];

	return (
		<div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-20">
				<div className="max-w-7xl mx-auto px-4 md:px-6">


					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div>
							<div className="text-sm text-purple-400 font-semibold mb-4">OUR PROJECTS</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-color)]">
								Court Booker
							</h1>
							<p className="text-xl text-[var(--text-muted)] mb-4">
								Streamline your sports facility bookings with our intelligent AI-powered court reservation system.
								Book tickets through our AI agent - completely automated with zero human intervention required.
							</p>
							<p className="text-lg text-[var(--text-muted)] mb-8 font-medium">
								🤖 Powered by AI Agent - No Human Support Needed
							</p>
							<div className="flex flex-wrap gap-4">
								<Link
									to="/contact"
									className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
								>
									Get Started
								</Link>
								<a
									href="#how-it-works"
									className="px-6 py-3 border border-purple-600 hover:bg-purple-600/10 rounded-lg font-semibold transition-colors"
								>
									Learn More
								</a>
							</div>
						</div>

						<div className="relative">
							<div className="aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20 overflow-hidden">
								<img
									src="/court_booking.png"
									alt="Court Booking System Interface"
									className="w-full h-full object-contain bg-[var(--bg-primary)]"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Theory Section - Why, How, When */}
			<div id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-6 py-20 bg-gradient-to-b from-[var(--bg-color)] via-[var(--bg-secondary)] to-[var(--bg-color)]">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-color)]">Understanding Court Booker</h2>
					<p className="text-[var(--text-muted)] text-lg">The complete guide to AI-powered court reservation</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8 mb-12">
					{/* Why Use It */}
					<div className="p-8 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl">
						<div className="text-4xl mb-4">🎯</div>
						<h3 className="text-2xl font-bold mb-4 text-[var(--text-color)]">Why Use Court Booker?</h3>
						<ul className="space-y-3 text-[var(--text-muted)]">
							<li className="flex items-start gap-2">
								<span className="text-purple-400 mt-1">•</span>
								<span><strong>24/7 Availability:</strong> AI agent works round the clock, no waiting for human staff</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-purple-400 mt-1">•</span>
								<span><strong>Zero Human Error:</strong> Automated booking eliminates double-bookings and scheduling conflicts</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-purple-400 mt-1">•</span>
								<span><strong>Cost Effective:</strong> Reduce operational costs by eliminating manual booking staff</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-purple-400 mt-1">•</span>
								<span><strong>Instant Confirmation:</strong> Get booking confirmations in seconds, not minutes</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-purple-400 mt-1">•</span>
								<span><strong>Better Customer Experience:</strong> Users book anytime without waiting for business hours</span>
							</li>
						</ul>
					</div>

					{/* How It Works */}
					<div className="p-8 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl">
						<div className="text-4xl mb-4">⚙️</div>
						<h3 className="text-2xl font-bold mb-4 text-[var(--text-color)]">How Does It Work?</h3>
						<ol className="space-y-3 text-[var(--text-muted)]">
							<li className="flex items-start gap-3">
								<span className="text-blue-400 font-bold">1.</span>
								<span><strong>User Initiates:</strong> Player opens the app or talks to the AI agent</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-blue-400 font-bold">2.</span>
								<span><strong>AI Understanding:</strong> Agent processes request (date, time, court type preferences)</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-blue-400 font-bold">3.</span>
								<span><strong>Real-Time Check:</strong> System checks live availability across all courts</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-blue-400 font-bold">4.</span>
								<span><strong>Smart Suggestions:</strong> AI recommends best options based on user history</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-blue-400 font-bold">5.</span>
								<span><strong>Instant Booking:</strong> Confirmation sent immediately via email/SMS</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-blue-400 font-bold">6.</span>
								<span><strong>Auto-Reminders:</strong> System sends reminders before your booking time</span>
							</li>
						</ol>
					</div>

					{/* When to Use */}
					<div className="p-8 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl">
						<div className="text-4xl mb-4">⏰</div>
						<h3 className="text-2xl font-bold mb-4 text-[var(--text-color)]">When to Use It?</h3>
						<ul className="space-y-3 text-[var(--text-muted)]">
							<li className="flex items-start gap-2">
								<span className="text-green-400 mt-1">✓</span>
								<span><strong>Sports Complexes:</strong> Tennis, badminton, basketball facilities</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-400 mt-1">✓</span>
								<span><strong>Fitness Centers:</strong> Squash courts, indoor soccer fields</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-400 mt-1">✓</span>
								<span><strong>Community Centers:</strong> Multi-purpose recreational spaces</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-400 mt-1">✓</span>
								<span><strong>Universities:</strong> Campus sports facilities management</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-400 mt-1">✓</span>
								<span><strong>Private Clubs:</strong> Golf, tennis, and country clubs</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-400 mt-1">✓</span>
								<span><strong>Event Venues:</strong> Conference halls, meeting rooms</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Benefits Highlight */}
				<div className="p-8 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-center">
					<h3 className="text-2xl font-bold mb-4 text-[var(--text-color)]">The AI Advantage</h3>
					<p className="text-[var(--text-muted)] text-lg max-w-3xl mx-auto">
						Our AI-powered booking system reduces operational overhead by <strong className="text-purple-400">70%</strong>,
						increases booking efficiency by <strong className="text-purple-400">90%</strong>, and provides
						<strong className="text-purple-400"> 24/7 service</strong> without any human intervention.
						It's not just automation—it's intelligent court management.
					</p>
				</div>
			</div>

			{/* Features Section */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-color)]">Key Features</h2>
					<p className="text-[var(--text-muted)] text-lg">Everything you need to manage court bookings efficiently</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl hover:border-purple-500/40 transition-all"
						>
							<div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
								<feature.icon className="text-purple-400" size={24} />
							</div>
							<h3 className="text-xl font-semibold mb-2 text-[var(--text-color)]">{feature.title}</h3>
							<p className="text-[var(--text-muted)]">{feature.description}</p>
						</div>
					))}
				</div>
			</div>

			{/* Tech Stack Section */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-20 border-t border-[var(--border-color)]">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-color)]">Technology Stack</h2>
					<p className="text-[var(--text-muted)] text-lg">Built with modern, scalable technologies</p>
				</div>

				<div className="flex flex-wrap justify-center gap-4">
					{techStack.map((tech, index) => (
						<div
							key={index}
							className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full text-[var(--text-color)] font-medium"
						>
							{tech}
						</div>
					))}
				</div>
			</div>

			{/* CTA Section */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
				<div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-12 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-color)]">
						Ready to Transform Your Facility Management?
					</h2>
					<p className="text-[var(--text-muted)] text-lg mb-8 max-w-2xl mx-auto">
						Get in touch with us to learn more about Court Booker and how it can streamline your operations.
					</p>
					<Link
						to="/contact"
						className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
					>
						Contact Us
					</Link>
				</div>
			</div>
		</div>
	);
}
