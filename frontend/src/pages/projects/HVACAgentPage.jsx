import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Shield, Brain, BarChart3, Cpu, Lightbulb } from "lucide-react";

export default function HVACAgentPage() {
	const features = [
		{
			title: "Multi-Agent AI Architecture",
			description: "Specialized agents for sensor validation, safety, comfort, and optimization working in coordination",
			icon: Brain
		},
		{
			title: "Edge-Based Intelligence",
			description: "All sensing, reasoning, and actuation occur locally on Raspberry Pi without cloud dependency",
			icon: Cpu
		},
		{
			title: "Deterministic Safety Control",
			description: "Rule-based safety enforcement isolated from probabilistic AI reasoning for guaranteed reliability",
			icon: Shield
		},
		{
			title: "Occupancy & Temperature Optimization",
			description: "Real-time lighting and airflow control based on PIR motion and thermal sensors",
			icon: Zap
		}
	];

	const architectureComponents = [
		{
			category: "Perception Layer",
			items: ["BME280 Temperature/Humidity Sensor", "PIR Motion Detection", "Real-time Data Validation"]
		},
		{
			category: "Decision Layer",
			items: ["LangGraph Multi-Agent Orchestration", "14 Specialized Agents", "Conflict Resolution Logic"]
		},
		{
			category: "Reasoning Layer",
			items: ["Phi-3 Mini LLM (Ollama)", "Contextual Explanation Generation", "Trend Analysis & Insights"]
		},
		{
			category: "Actuation Layer",
			items: ["GPIO Relay Control", "Fan/Lighting Drivers", "Rate-Limited Switching"]
		}
	];

	const techStack = ["Raspberry Pi 5", "Python", "LangGraph", "Phi-3 Mini", "Ollama", "BME280 Sensor", "PIR Sensor", "GPIO Relays", "Real-Time OS"];

	const capabilities = [
		"Autonomous zone-level control with human presence detection",
		"Temperature-driven HVAC fan control (28°C threshold)",
		"Occupancy-based lighting with 10-second inactivity timeout",
		"Sensor validation and fault detection",
		"AI-generated explanations for every control decision",
		"Offline operation with edge-based processing",
		"Explainable decision pathways for transparency",
		"Scalable multi-zone architecture"
	];

	return (
		<div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-20">
				<div className="max-w-7xl mx-auto px-4 md:px-6">

					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div>
							<div className="text-sm text-purple-400 font-semibold mb-4">INTELLIGENT BUILDING AUTOMATION</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-color)]">
								Agentic AI-Based HVAC & Lighting Control
							</h1>
							<p className="text-xl text-[var(--text-muted)] mb-8">
								Real-time, zone-level cyber-physical control using multi-agent AI, edge intelligence,
								and local LLM reasoning. Deploy autonomous building automation without cloud dependency.
							</p>


						</div>

						<div className="relative">
							<img
								src="/HVACimg.png"
								alt="HVAC Control System"
								className="w-full h-full object-contain bg-[var(--bg-primary)] rounded-2xl"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-color)]">AI-Powered Control Features</h2>
					<p className="text-[var(--text-muted)] text-lg">Multi-agent architecture for intelligent building automation</p>
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

			{/* System Architecture Section */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-20 border-t border-[var(--border-color)]">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-color)]">System Architecture</h2>
					<p className="text-[var(--text-muted)] text-lg">Layered design for modular, safe, and extensible control</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{architectureComponents.map((component, index) => (
						<div
							key={index}
							className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl"
						>
							<h3 className="text-lg font-semibold mb-4 text-blue-300">{component.category}</h3>
							<ul className="space-y-2">
								{component.items.map((item, idx) => (
									<li key={idx} className="flex items-start gap-2 text-[var(--text-muted)]">
										<span className="text-blue-400 mt-1">•</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>

			{/* Control Capabilities Section */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-20 border-t border-[var(--border-color)]">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-color)]">Autonomous Capabilities</h2>
					<p className="text-[var(--text-muted)] text-lg">Real-time decision-making and control</p>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					{capabilities.map((capability, index) => (
						<div
							key={index}
							className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl hover:border-purple-500/40 transition-all"
						>
							<div className="flex items-start gap-3">
								<div className="w-6 h-6 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									<svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<p className="text-[var(--text-muted)]">{capability}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Tech Stack Section */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-20 border-t border-[var(--border-color)]">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-color)]">Technology Stack</h2>
					<p className="text-[var(--text-muted)] text-lg">Industrial-grade IoT and AI integration</p>
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
						Build Intelligent Building Automation
					</h2>
					<p className="text-[var(--text-muted)] text-lg mb-8 max-w-2xl mx-auto">
						Deploy autonomous HVAC and lighting control with edge-based AI. No cloud dependency,
						explainable decisions, and real-time responsiveness for your building zones.
					</p>
					<Link
						to="/contact"
						className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
					>
						Start Building
					</Link>
				</div>
			</div>
		</div>
	);
}
