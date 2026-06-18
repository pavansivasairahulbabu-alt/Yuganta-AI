import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useTheme } from "../context/ThemeContext";
import { 
	Target, 
	Rocket, 
	Cpu, 
	Award, 
	Lightbulb, 
	ShieldCheck, 
	Globe,
	ChevronRight,
	Users,
	GraduationCap,
	Star
} from "lucide-react";

export default function AboutPage() {
	const { theme } = useTheme();
	const isLight = theme === "light-theme";

	const coreValues = [
		{
			icon: <Lightbulb className={`w-8 h-8 ${isLight ? 'text-[#8B5CF6]' : 'text-[#A855F7]'}`} />,
			title: "Innovation",
			description: "Pushing boundaries with cutting-edge AI research and practical implementation."
		},
		{
			icon: <ShieldCheck className={`w-8 h-8 ${isLight ? 'text-[#8B5CF6]' : 'text-[#A855F7]'}`} />,
			title: "Integrity",
			description: "Building ethical AI solutions that respect privacy and promote transparency."
		},
		{
			icon: <Award className={`w-8 h-8 ${isLight ? 'text-[#8B5CF6]' : 'text-[#A855F7]'}`} />,
			title: "Excellence",
			description: "Delivering top-tier education and engineering services that exceed expectations."
		},
		{
			icon: <Globe className={`w-8 h-8 ${isLight ? 'text-[#8B5CF6]' : 'text-[#A855F7]'}`} />,
			title: "Accessibility",
			description: "Making advanced AI knowledge available to everyone, regardless of their background."
		}
	];

	return (
		<>
			<SEO
				title="About Us - Yuganta AI | AI & Digital Solutions"
				description="Learn about Yuganta AI's vision, mission, and how we help organizations modernize through AI-driven products and engineering services."
				keywords="about yuganta ai, company vision, digital transformation, AI solutions, IT services"
				url="/about"
			/>
			<div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300 pt-20">
				{/* Hero Section */}
				<div className="relative py-20 md:py-32 overflow-hidden">
					{/* Animated Background Orbs */}
					<div className={`absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] ${isLight ? 'opacity-10' : 'opacity-20'} rounded-full blur-[120px] animate-pulse`}></div>
					<div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-[#38BDF8] to-[#10B981] ${isLight ? 'opacity-10' : 'opacity-20'} rounded-full blur-[120px] animate-pulse`} style={{ animationDelay: '2s' }}></div>

					<div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
						<div className="mb-10 animate-fadeIn">
							<div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${isLight ? 'bg-white/80 border-[#8B5CF6]/20 shadow-sm' : 'bg-[#1E1E1E]/80 border-white/10 backdrop-blur-md'}`}>
								<div className="relative flex h-2.5 w-2.5">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8B5CF6]"></span>
								</div>
								<nav className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)] ml-1">
									<Link to="/" className="hover:text-[#8B5CF6] transition-colors opacity-70 hover:opacity-100">Home</Link>
									<ChevronRight className="w-3 h-3 opacity-50" />
									<span className={`text-transparent bg-clip-text bg-gradient-to-r ${isLight ? 'from-[#6D28D9] to-[#0284C7]' : 'from-[#8B5CF6] to-[#38BDF8]'}`}>About Us</span>
								</nav>
							</div>
						</div>
						
						<div className="max-w-5xl mx-auto">
							<h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.05] tracking-tight text-[var(--text-color)]">
								Architecting the <br className="hidden md:block" />
								<span className={`text-transparent bg-clip-text bg-gradient-to-r ${isLight ? 'from-[#6D28D9] via-[#1D4ED8] to-[#0284C7]' : 'from-[#8B5CF6] via-[#2563EB] to-[#38BDF8]'} drop-shadow-sm`}>
									AI-First Future
								</span>
							</h1>
							<p className="text-lg sm:text-xl md:text-2xl text-[var(--text-muted)] leading-relaxed mb-12 max-w-3xl mx-auto font-medium">
								Yuganta AI is at the forefront of the intelligence revolution. We combine deep technical expertise with a passion for education to build products that matter.
							</p>
							<div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
								<Link to="/courses" className="relative group px-8 py-4 rounded-xl font-bold text-white overflow-hidden w-full sm:w-auto shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all duration-300 hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] transition-transform duration-300 group-hover:scale-105"></div>
									<div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)] transition-opacity duration-300"></div>
									<span className="relative flex items-center justify-center gap-2">
										Explore Our Courses
										<Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
									</span>
								</Link>
								<Link to="/contact" className={`relative group px-8 py-4 rounded-xl font-bold w-full sm:w-auto border ${isLight ? 'border-gray-200 bg-white text-gray-800 hover:border-[#8B5CF6]/50 shadow-sm hover:bg-gray-50' : 'border-white/10 bg-[var(--bg-card)] text-white hover:bg-white/5 hover:border-white/20'} transition-all duration-300 hover:-translate-y-1`}>
									<span className="flex items-center justify-center gap-2">
										Contact Our Team
										<Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
									</span>
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Mission & Vision Section */}
				<div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<div className="relative group">
							<div className={`absolute -inset-1 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] rounded-2xl blur ${isLight ? 'opacity-10' : 'opacity-25'} group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
							<div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[var(--bg-card)]">
								<img
									src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
									alt="Strategic Planning"
									className={`w-full h-auto ${isLight ? 'opacity-90' : 'opacity-80'} group-hover:scale-105 transition-transform duration-700`}
								/>
								<div className={`absolute inset-0 bg-gradient-to-t ${isLight ? 'from-white/40' : 'from-[var(--bg-primary)]'} via-transparent to-transparent`}></div>
							</div>
						</div>

						<div className="space-y-12">
							<div className="flex gap-6">
								<div className={`flex-shrink-0 w-14 h-14 ${isLight ? 'bg-[#8B5CF6]/5' : 'bg-[rgba(139,92,246,0.1)]'} rounded-2xl flex items-center justify-center border ${isLight ? 'border-[#8B5CF6]/20' : 'border-[rgba(139,92,246,0.2)]'}`}>
									<Target className={`w-8 h-8 ${isLight ? 'text-[#8B5CF6]' : 'text-[#A855F7]'}`} />
								</div>
								<div>
									<h2 className="text-3xl font-bold mb-4">Our Vision</h2>
									<p className="text-[var(--text-muted)] text-lg leading-relaxed font-medium">
										To empower every individual and organization with AI-driven intelligence, fostering a future where technology amplifies human potential rather than replacing it.
									</p>
								</div>
							</div>

							<div className="flex gap-6">
								<div className={`flex-shrink-0 w-14 h-14 ${isLight ? 'bg-[#38BDF8]/5' : 'bg-[rgba(56,189,248,0.1)]'} rounded-2xl flex items-center justify-center border ${isLight ? 'border-[#38BDF8]/20' : 'border-[rgba(56,189,248,0.2)]'}`}>
									<Rocket className="w-8 h-8 text-[#2563EB]" />
								</div>
								<div>
									<h2 className="text-3xl font-bold mb-4">Our Mission</h2>
									<p className="text-[var(--text-muted)] text-lg leading-relaxed font-medium">
										We are dedicated to providing accessible, high-quality AI education and innovative solutions that bridge the gap between complex research and real-world application.
									</p>
								</div>
							</div>

							<div className="flex gap-6">
								<div className={`flex-shrink-0 w-14 h-14 ${isLight ? 'bg-[#8B5CF6]/5' : 'bg-[rgba(139,92,246,0.1)]'} rounded-2xl flex items-center justify-center border ${isLight ? 'border-[#8B5CF6]/20' : 'border-[rgba(139,92,246,0.2)]'}`}>
									<Cpu className={`w-8 h-8 ${isLight ? 'text-[#8B5CF6]' : 'text-[#A855F7]'}`} />
								</div>
								<div>
									<h2 className="text-3xl font-bold mb-4">What We Do</h2>
									<p className="text-[var(--text-muted)] text-lg leading-relaxed font-medium">
										From enterprise-grade Agentic AI applications to specialized training programs in MERN and GenAI, we deliver the tools needed to thrive in the modern tech landscape.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Core Values Section */}
				<div className="bg-[var(--bg-secondary)] py-24 transition-colors duration-300">
					<div className="max-w-7xl mx-auto px-4 md:px-6 text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-color)]">
							Our Core Values
						</h2>
						<p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto font-medium">
							These principles guide everything we do, from the courses we design to the code we write.
						</p>
					</div>
					<div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{coreValues.map((value, index) => (
							<div key={index} className="p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl hover:border-[#2563EB] transition-all duration-300 group shadow-lg">
								<div className={`mb-6 p-4 ${isLight ? 'bg-[#8B5CF6]/5' : 'bg-[rgba(139,92,246,0.05)]'} rounded-2xl inline-block group-hover:scale-110 transition-transform duration-300`}>
									{value.icon}
								</div>
								<h3 className="text-2xl font-bold mb-4 text-[var(--text-color)]">{value.title}</h3>
								<p className="text-[var(--text-muted)] leading-relaxed font-medium">
									{value.description}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Statistics Section */}
				<div className="py-24">
					<div className="max-w-7xl mx-auto px-4 md:px-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{/* Stat 1 */}
							<div className="relative group">
								<div className={`absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] rounded-3xl blur transition duration-500 ${isLight ? 'opacity-10 group-hover:opacity-20' : 'opacity-20 group-hover:opacity-40'}`}></div>
								<div className="relative p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl text-center transform group-hover:-translate-y-2 transition-all duration-300">
									<div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${isLight ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-[#2563EB]/20 text-[#38BDF8]'}`}>
										<Users className="w-8 h-8" />
									</div>
									<div className="text-5xl md:text-6xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#38BDF8]">
										100+
									</div>
									<div className="text-[var(--text-color)] font-bold tracking-wider uppercase text-sm opacity-80">
										Active Students
									</div>
								</div>
							</div>

							{/* Stat 2 */}
							<div className="relative group">
								<div className={`absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] rounded-3xl blur transition duration-500 ${isLight ? 'opacity-10 group-hover:opacity-20' : 'opacity-20 group-hover:opacity-40'}`}></div>
								<div className="relative p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl text-center transform group-hover:-translate-y-2 transition-all duration-300">
									<div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${isLight ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-[#8B5CF6]/20 text-[#C084FC]'}`}>
										<GraduationCap className="w-8 h-8" />
									</div>
									<div className="text-5xl md:text-6xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#C084FC]">
										10+
									</div>
									<div className="text-[var(--text-color)] font-bold tracking-wider uppercase text-sm opacity-80">
										Expert Mentors
									</div>
								</div>
							</div>

							{/* Stat 3 */}
							<div className="relative group">
								<div className={`absolute inset-0 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-3xl blur transition duration-500 ${isLight ? 'opacity-10 group-hover:opacity-20' : 'opacity-20 group-hover:opacity-40'}`}></div>
								<div className="relative p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl text-center transform group-hover:-translate-y-2 transition-all duration-300">
									<div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${isLight ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#10B981]/20 text-[#34D399]'}`}>
										<Star className="w-8 h-8" />
									</div>
									<div className="text-5xl md:text-6xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">
										4.9/5
									</div>
									<div className="text-[var(--text-color)] font-bold tracking-wider uppercase text-sm opacity-80">
										Student Satisfaction
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Final CTA */}
				<div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
					<div className="relative rounded-[2rem] overflow-hidden p-[1px] group">
						{/* Animated Gradient Border */}
						<div className={`absolute inset-0 bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#38BDF8] transition-opacity duration-500 ${isLight ? 'opacity-30 group-hover:opacity-80' : 'opacity-50 group-hover:opacity-100'}`}></div>
						
						{/* Card Content */}
						<div className="relative bg-[var(--bg-card)] rounded-[2rem] p-12 text-center h-full w-full">
							{/* Background Glow */}
							<div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6] opacity-10 rounded-full -mr-20 -mt-20 blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
							<div className="absolute bottom-0 left-0 w-64 h-64 bg-[#38BDF8] opacity-10 rounded-full -ml-20 -mb-20 blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
							
							<div className="relative z-10">
								<h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-color)]">
									Ready to Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#38BDF8]">AI Journey?</span>
								</h2>
								<p className="text-[var(--text-muted)] text-xl mb-10 max-w-2xl mx-auto font-medium">
									Join hundreds of students and professionals who are already building the future with Yuganta AI.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link to="/signup" className="px-10 py-4 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-all duration-300">
										Join Now
									</Link>
									<Link to="/talk-to-expert" className="px-10 py-4 border border-[var(--border-color)] text-[var(--text-color)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] hover:scale-105 transition-all duration-300">
										Talk to an Expert
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
