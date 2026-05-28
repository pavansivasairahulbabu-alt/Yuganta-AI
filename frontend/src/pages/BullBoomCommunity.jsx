import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useTheme } from "../context/ThemeContext";
import { FaWhatsapp, FaTelegram, FaInstagram } from "react-icons/fa";
import {
	FiTrendingUp,
	FiActivity,
	FiTarget,
	FiBookOpen,
	FiUserCheck,
	FiAward,
	FiPieChart,
	FiDollarSign,
	FiSend,
	FiPlus,
	FiArrowRight
} from "react-icons/fi";

export default function BullBoomCommunity() {
	const { theme } = useTheme();
	const isLight = theme === "light-theme";

	const [hoveredSignal, setHoveredSignal] = useState(null);
	const [activeGraphTab, setActiveGraphTab] = useState("nifty");

	const [openFaq, setOpenFaq] = useState(null);


	const faqs = [
		{
			q: "Who is the Bull Boom Trading Community for?",
			a: "It is built for anyone interested in stocks, Nifty, Sensex, and Forex markets. Whether you are an absolute beginner or an intermediate trader looking to refine your technical analysis and chart graph reading skills, our mentorship is designed to help you trade logic rather than noise."
		},
		{
			q: "Do you offer direct calls or financial advice?",
			a: "No. Yuganta AI and the Bull Boom Community focus purely on systematic education, risk management, and chart analysis. We share setup breakdowns (entry, target, stop loss) to teach you the 'why' behind trades, empowering you to make your own independent decisions."
		},
		{
			q: "What markets are covered in the chart setups?",
			a: "We actively map key global and domestic indices/markets: Nifty 50, Sensex, and major Forex currency pairs (such as EUR/USD, GBP/USD). We teach you how to analyze technical structures across different market hours."
		},
		{
			q: "How do I get started with the mentorship?",
			a: "Simply click 'Join via WhatsApp' or 'Join for Updates' to connect with our coordinator. We will onboard you into the community, give you access to our live graphs, and schedule your mentorship alignment."
		}
	];

	const graphDetails = {
		nifty: {
			title: "Live Setup: NIFTY 50 (1D Chart)",
			rsi: "58",
			path: "M 5,85 Q 30,70 45,55 T 85,20 T 95,15",
			circleX: "45",
			circleY: "55",
			indicatorColor: "#3B82F6",
			candles: [
				{ time: "10:00", h: 16, isGreen: true, label: null },
				{ time: "11:00", h: 10, isGreen: false, label: null },
				{ time: "12:00", h: 8, isGreen: true, label: null },
				{ time: "13:00", h: 24, isGreen: true, label: "BUY" },
				{ time: "14:00", h: 28, isGreen: true, label: null },
				{ time: "15:00", h: 12, isGreen: false, label: null },
				{ time: "16:00", h: 32, isGreen: true, label: "WIN! +120p" }
			],
			legend: [
				{ label: "EMA 20", val: "Bullish Trend", valColor: "text-green-400" },
				{ label: "Support Zone", val: "22,050", valColor: "text-blue-400" },
				{ label: "Target Zone", val: "22,450 (Hit)", valColor: "text-[#10B981] font-bold" }
			]
		},
		sensex: {
			title: "Live Setup: SENSEX (1D Chart)",
			rsi: "64",
			path: "M 5,90 Q 25,80 50,60 T 80,30 T 95,25",
			circleX: "50",
			circleY: "60",
			indicatorColor: "#10B981",
			candles: [
				{ time: "10:00", h: 12, isGreen: true, label: null },
				{ time: "11:00", h: 14, isGreen: true, label: null },
				{ time: "12:00", h: 8, isGreen: false, label: null },
				{ time: "13:00", h: 20, isGreen: true, label: "BREAKOUT" },
				{ time: "14:00", h: 26, isGreen: true, label: null },
				{ time: "15:00", h: 18, isGreen: false, label: null },
				{ time: "16:00", h: 36, isGreen: true, label: "WIN! +450p" }
			],
			legend: [
				{ label: "EMA 50", val: "Strong Support", valColor: "text-green-400" },
				{ label: "Support Zone", val: "72,500", valColor: "text-blue-400" },
				{ label: "Target Zone", val: "73,800 (Hit)", valColor: "text-[#10B981] font-bold" }
			]
		},
		forex: {
			title: "Live Setup: EUR/USD Forex (4H Chart)",
			rsi: "42",
			path: "M 5,60 Q 25,75 45,80 T 75,40 T 95,30",
			circleX: "45",
			circleY: "80",
			indicatorColor: "#F59E0B",
			candles: [
				{ time: "08:00", h: 22, isGreen: false, label: null },
				{ time: "12:00", h: 16, isGreen: false, label: null },
				{ time: "16:00", h: 14, isGreen: true, label: "SUPPORT" },
				{ time: "20:00", h: 24, isGreen: true, label: "REVERSAL" },
				{ time: "00:00", h: 18, isGreen: false, label: null },
				{ time: "04:00", h: 28, isGreen: true, label: null },
				{ time: "08:00", h: 30, isGreen: true, label: "ACTIVE" }
			],
			legend: [
				{ label: "MACD", val: "Bullish Cross", valColor: "text-green-400" },
				{ label: "Support Zone", val: "1.0780", valColor: "text-blue-400" },
				{ label: "Target Zone", val: "1.0920 (Active)", valColor: "text-yellow-400 font-bold" }
			]
		}
	};

	const coreServices = [
		{
			icon: <FiBookOpen className="w-6 h-6 text-[#10B981]" />,
			title: "Mentorship",
			description: "Personalized coaching covering technical analysis, price action, indicators, and market psychology."
		},
		{
			icon: <FiTrendingUp className="w-6 h-6 text-[#10B981]" />,
			title: "Real-time Chart Graphs",
			description: "Live setups and analysis on Crypto, Forex, and Indian Indices directly sharing breakout and breakdown zones."
		},
		{
			icon: <FiPieChart className="w-6 h-6 text-[#10B981]" />,
			title: "Risk & Portfolio Management",
			description: "Learn how to preserve capital, manage stop-losses, and execute optimal position sizing rules."
		},
		{
			icon: <FiTarget className="w-6 h-6 text-[#10B981]" />,
			title: "Breakout & Momentum Signals",
			description: "Get alerts on high-probability setups with entry, targets, and exit criteria clearly defined."
		}
	];

	const stats = [
		{ value: "85%+", label: "Signal Accuracy", icon: <FiAward className="text-[#10B981]" size={20} /> },
		{ value: "500+", label: "Active Traders", icon: <FiUserCheck className="text-[#10B981]" size={20} /> },
		{ value: "24/7", label: "Community Support", icon: <FiActivity className="text-[#10B981]" size={20} /> },
		{ value: "50+", label: "Mentoring Hours/Mo", icon: <FiBookOpen className="text-[#10B981]" size={20} /> }
	];

	// Simulated signals for interactive trading look
	const mockSignals = [
		{ asset: "NIFTY 50", type: "BUY CALL", entry: "22,100", target: "22,450", sl: "21,950", status: "Target Hit (+80% premium)", isGain: true },
		{ asset: "SENSEX", type: "BUY CALL", entry: "72,500", target: "73,800", sl: "72,100", status: "Target Hit (+65% premium)", isGain: true },
		{ asset: "EUR/USD (Forex)", type: "BUY LONG", entry: "1.0780", target: "1.0920", sl: "1.0740", status: "Active Setup", isGain: null },
		{ asset: "GBP/USD (Forex)", type: "SELL SHORT", entry: "1.2650", target: "1.2520", sl: "1.2710", status: "Target Hit (+130 pips)", isGain: true }
	];

	return (
		<>
			<SEO
				title="Bull Boom Trading Community - Yuganta AI"
				description="Join the Bull Boom Trading Community. Access professional trading mentorship, live chart graphs, real-time breakdown zones, and structural market guidance."
				keywords="bull boom, trading community, crypto trading, nifty trading, mentorship program, stock market graph, technical analysis"
				url="/bull-boom-community"
			/>

			<div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
				
				{/* Hero Section */}
				<div className="relative pt-12 pb-20 md:py-28 overflow-hidden">
					{/* Green and blue trading orbs for finance/trading look */}
					<div className={`absolute top-10 left-1/4 w-80 h-80 bg-[#10B981] ${isLight ? 'opacity-[0.04]' : 'opacity-10'} rounded-full blur-[140px] animate-pulse`}></div>
					<div className={`absolute bottom-5 right-10 w-96 h-96 bg-[#3B82F6] ${isLight ? 'opacity-[0.04]' : 'opacity-10'} rounded-full blur-[140px] animate-pulse`} style={{ animationDelay: '2s' }}></div>

					<div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
							
							{/* Left Content */}
							<div className="lg:col-span-7 space-y-6">
								<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-bold tracking-wide uppercase">
									<FiTrendingUp className="animate-bounce" />
									<span>Empowering Smart Investors</span>
								</div>
								
								<h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-[var(--text-color)]">
									Join the <span className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent">Bull Boom</span> Trading Community
								</h1>
								
								<p className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed font-medium">
									Master the art of reading price patterns, trade live market cycles, and develop your systematic edge. We provide interactive mentoring, live trading graphs, and risk strategies to help you become a consistently profitable trader.
								</p>

								<div className="flex flex-wrap gap-4 pt-2">
									<a href="#join-section" className="px-6 py-3.5 bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-bold rounded-xl hover:shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
										<span>Become a Member</span>
										<FiArrowRight />
									</a>
									<a href="https://wa.me/918978946421?text=Hi!%20I%20am%20interested%20in%20joining%20the%20Bull%20Boom%20Trading%20Community." target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-xl hover:shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
										<FaWhatsapp size={20} />
										<span>Chat on WhatsApp</span>
									</a>
									<a href="https://t.me/tradewithpavan7098" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-xl hover:shadow-[0_4px_20px_rgba(0,136,204,0.35)] hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
										<FaTelegram size={20} />
										<span>Join for Updates</span>
									</a>
									<a href="https://www.instagram.com/trade_wth_pavan?igsh=ZDh1b2o3cHQzbmF1" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] text-white font-bold rounded-xl hover:shadow-[0_4px_20px_rgba(253,29,29,0.35)] hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
										<FaInstagram size={20} />
										<span>Instagram</span>
									</a>
									<a href="#graphs-section" className="px-6 py-3.5 border border-[var(--border-color)] text-[var(--text-color)] font-bold rounded-xl hover:bg-[rgba(59,130,246,0.05)] transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
										<FiActivity />
										<span>Live Visual Setup</span>
									</a>
								</div>
							</div>

							{/* Right Logo Frame */}
							<div className="lg:col-span-5 flex justify-center">
								<div className="relative group w-full max-w-[400px]">
									{/* Outer glowing border representing high momentum */}
									<div className="absolute -inset-1.5 bg-gradient-to-r from-[#10B981] to-[#3B82F6] rounded-[2.5rem] opacity-40 blur-lg group-hover:opacity-75 transition duration-500"></div>
									
									<div className="relative rounded-[2.2rem] overflow-hidden bg-[var(--bg-card)] border border-[rgba(16,185,129,0.3)] p-4 shadow-2xl">
										<img
											src="/bull-boom.jpg"
											alt="Bull Boom Trading Community"
											className="w-full h-auto rounded-[1.8rem] object-cover group-hover:scale-[1.02] transition-transform duration-500"
										/>
									</div>
								</div>
							</div>

						</div>
					</div>
				</div>

				{/* Statistics Dashboard */}
				<div className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)]/50 py-10 transition-colors duration-300">
					<div className="max-w-7xl mx-auto px-4 md:px-6">
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
							{stats.map((stat, idx) => (
								<div key={idx} className="flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:border-[#10B981]/55 transition-colors">
									<div className="p-3 bg-[#10B981]/10 rounded-xl">
										{stat.icon}
									</div>
									<div>
										<div className="text-2xl md:text-3xl font-extrabold text-[var(--text-color)]">{stat.value}</div>
										<div className="text-xs text-[var(--text-muted)] font-semibold mt-0.5">{stat.label}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* How We Started section */}
				<div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<div className="space-y-6">
							<div className="inline-block text-xs font-bold text-[#10B981] uppercase tracking-wider">
								Origin & Vision
							</div>
							<h2 className="text-3xl md:text-4xl font-extrabold">
								How <span className="text-[#10B981]">Bull Boom</span> Began
							</h2>
							<p className="text-[var(--text-muted)] leading-relaxed text-base font-medium">
								Founded by the creators of Yuganta AI, the Bull Boom Trading Community was born out of a desire to demystify complex chart graphs and combat emotional retail losses for everyday people. 
							</p>
							<p className="text-[var(--text-muted)] leading-relaxed text-base font-medium">
								We noticed that many normal, everyday people who wish to enter the field of stocks, Nifty, Sensex, and Forex often feel overwhelmed by technical jargon and volatile charts. By breaking down price action strategies and chart structures into simple, logical rules, we designed an inclusive mentorship environment that translates complex market trends into structured, systematic setups.
							</p>
							<div className="p-5 bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl">
								<h4 className="text-lg font-bold text-[#10B981] mb-2">Our Goal</h4>
								<p className="text-xs text-[var(--text-muted)] leading-relaxed font-semibold">
									To build an elite hub of modern traders who trade logic rather than noise. We teach you how to analyze charts, create trade plans, and achieve financial clarity.
								</p>
							</div>
						</div>

						{/* Interactive simulated trading platform interface */}
						<div className="relative group" id="graphs-section">
							<div className="absolute -inset-1.5 bg-gradient-to-br from-[#10B981] to-[#3B82F6] rounded-3xl opacity-20 blur-md group-hover:opacity-30 transition"></div>
							
							<div className="relative bg-[#0F172A] text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl font-mono">
								{/* Chart header */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500"></div>
										<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
										<div className="w-3 h-3 rounded-full bg-green-500"></div>
										<span className="text-xs text-slate-400 ml-2 font-bold uppercase tracking-wider">{graphDetails[activeGraphTab].title}</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="flex bg-slate-800 p-1 rounded-lg gap-1 text-[10px] md:text-xs">
											{["nifty", "sensex", "forex"].map((tab) => (
												<button
													key={tab}
													type="button"
													onClick={() => setActiveGraphTab(tab)}
													className={`px-3 py-1 rounded font-bold uppercase transition-all ${
														activeGraphTab === tab
															? "bg-[#10B981] text-white shadow-sm"
															: "text-slate-400 hover:text-slate-200"
													}`}
												>
													{tab}
												</button>
											))}
										</div>
										<div className="hidden md:flex items-center gap-2 text-xs bg-slate-800 px-3 py-1 rounded-lg font-bold">
											<span className="text-green-400 font-bold">● LIVE FEED</span>
											<span className="text-slate-400">RSI: {graphDetails[activeGraphTab].rsi}</span>
										</div>
									</div>
								</div>

								{/* Simulated Candlestick Chart */}
								<div className="h-60 w-full flex items-end justify-between px-2 py-4 relative border-b border-l border-slate-800">
									
									{/* Background Grid Lines */}
									<div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
										<div className="border-b border-white w-full"></div>
										<div className="border-b border-white w-full"></div>
										<div className="border-b border-white w-full"></div>
										<div className="border-b border-white w-full"></div>
									</div>

									{/* Trend Overlay Line (visual element) */}
									<svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
										<path d={graphDetails[activeGraphTab].path} fill="none" stroke="#10B981" strokeWidth="2.5" className="stroke-dash-animated" />
										{/* Buy signal point */}
										<circle cx={graphDetails[activeGraphTab].circleX} cy={graphDetails[activeGraphTab].circleY} r="4" fill={graphDetails[activeGraphTab].indicatorColor} className="animate-ping" />
										<circle cx={graphDetails[activeGraphTab].circleX} cy={graphDetails[activeGraphTab].circleY} r="3.5" fill={graphDetails[activeGraphTab].indicatorColor} />
									</svg>

									{/* Candles */}
									{graphDetails[activeGraphTab].candles.map((candle, idx) => (
										<div key={idx} className="flex flex-col items-center w-6 h-full justify-end relative">
											{candle.label && (
												<span className={`absolute -top-6 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap animate-pulse ${
													candle.label.startsWith("WIN") ? "bg-emerald-500" : candle.label === "BUY" || candle.label === "SUPPORT" ? "bg-blue-500" : "bg-yellow-500"
												}`}>
													{candle.label}
												</span>
											)}
											<div className={`w-[1.5px] h-6 ${candle.isGreen ? "bg-green-400" : "bg-red-400"}`}></div>
											<div className={`w-3 rounded-sm ${
												candle.isGreen 
													? "bg-green-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
													: "bg-red-500"
											}`} style={{ height: `${candle.h * 4}px` }}></div>
											<div className={`w-[1.5px] h-6 ${candle.isGreen ? "bg-green-400" : "bg-red-400"}`}></div>
											<span className="text-[9px] text-slate-500 mt-2">{candle.time}</span>
										</div>
									))}
								</div>

								{/* Chart Legend info */}
								<div className="mt-4 flex flex-wrap gap-4 text-[10px] text-slate-400 justify-between">
									{graphDetails[activeGraphTab].legend.map((item, idx) => (
										<div key={idx}>
											{item.label}: <span className={item.valColor}>{item.val}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* What We Provide (Detailed features) */}
				<div className="bg-[var(--bg-secondary)] py-20 transition-colors duration-300">
					<div className="max-w-7xl mx-auto px-4 md:px-6">
						
						<div className="text-center mb-16 max-w-2xl mx-auto">
							<h2 className="text-3xl md:text-4xl font-extrabold mb-4">
								Professional Trading Mentorship & Resources
							</h2>
							<p className="text-[var(--text-muted)] text-base font-medium">
								We equip you with standard institutional tools, systematic education pathways, and daily breakdown analysis.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{coreServices.map((service, idx) => (
								<div key={idx} className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:border-[#10B981] group transition-all duration-300 hover:shadow-lg">
									<div className="p-3 bg-[#10B981]/10 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform">
										{service.icon}
									</div>
									<h3 className="text-xl font-bold mb-3 text-[var(--text-color)]">{service.title}</h3>
									<p className="text-sm text-[var(--text-muted)] leading-relaxed font-semibold">
										{service.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Live Signals & Strategy Tracker */}
				<div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
					<div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-10 shadow-lg">
						
						<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-[var(--border-color)] gap-4">
							<div>
								<h3 className="text-2xl font-extrabold text-[var(--text-color)]">Recent Mentor Setup Examples</h3>
								<p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Hover over a setup card to preview the risk parameters.</p>
							</div>
							<div className="flex items-center gap-2 text-xs bg-[#10B981]/10 text-[#10B981] px-3 py-1.5 rounded-lg border border-[#10B981]/20 font-bold uppercase">
								<FiActivity className="animate-spin" />
								<span>Updated 15 mins ago</span>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{mockSignals.map((sig, idx) => (
								<div 
									key={idx} 
									onMouseEnter={() => setHoveredSignal(idx)}
									onMouseLeave={() => setHoveredSignal(null)}
									className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
										hoveredSignal === idx 
											? "border-[#10B981] bg-[rgba(16,185,129,0.03)] -translate-y-1 shadow-md"
											: "border-[var(--border-color)] bg-[var(--bg-secondary)]"
									}`}
								>
									<div className="flex items-center justify-between mb-4">
										<span className="font-extrabold text-sm tracking-wider text-[var(--text-color)]">{sig.asset}</span>
										<span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
											sig.type === "LONG" || sig.type === "BUY CALL" 
												? "bg-[#10B981]/10 text-[#10B981]" 
												: "bg-red-500/10 text-red-500"
										}`}>
											{sig.type}
										</span>
									</div>

									<div className="space-y-1.5 text-xs text-[var(--text-muted)] font-semibold mb-4">
										<div className="flex justify-between">
											<span>Entry Zone:</span>
											<span className="text-[var(--text-color)]">{sig.entry}</span>
										</div>
										<div className="flex justify-between">
											<span>Target Zone:</span>
											<span className="text-green-500 font-bold">{sig.target}</span>
										</div>
										<div className="flex justify-between">
											<span>Stop Loss:</span>
											<span className="text-red-500">{sig.sl}</span>
										</div>
									</div>

									<div className={`text-xs font-bold pt-3 border-t border-[var(--border-color)] flex items-center justify-between ${
										sig.isGain ? "text-[#10B981]" : "text-blue-500"
									}`}>
										<span>{sig.status}</span>
										{sig.isGain && <FiTrendingUp />}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Core Learning Paths / Roadmap */}
				<div className="bg-[var(--bg-secondary)] py-20 transition-colors duration-300">
					<div className="max-w-7xl mx-auto px-4 md:px-6">
						<div className="text-center mb-16 max-w-2xl mx-auto">
							<div className="inline-block text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
								Systematic Syllabus
							</div>
							<h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-color)]">
								Our Core Trading Curriculums
							</h2>
							<p className="text-[var(--text-muted)] text-base font-medium mt-3">
								Structured modules from basic chart graphs to professional option trading strategies.
							</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							<div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 hover:border-[#10B981] transition-all duration-300">
								<h3 className="text-xl font-bold mb-4 text-[var(--text-color)]">1. Nifty & Sensex Options</h3>
								<ul className="space-y-3 text-sm text-[var(--text-muted)] font-semibold">
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Price Action & Candlestick Patterns</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Option Chain & OI (Open Interest) Analysis</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Intraday Breakout & Breakdown Levels</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Weekly/Monthly Expiry Strategies</span>
									</li>
								</ul>
							</div>

							<div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 hover:border-[#10B981] transition-all duration-300">
								<h3 className="text-xl font-bold mb-4 text-[var(--text-color)]">2. Global Forex Markets</h3>
								<ul className="space-y-3 text-sm text-[var(--text-muted)] font-semibold">
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Major Pairs (EUR/USD, GBP/USD) structure</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Session Trading (London & NY overlap)</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Macro News Integration (CPI, FOMC, NFP)</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Liquidity Sweeps & Smart Money concepts</span>
									</li>
								</ul>
							</div>

							<div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 hover:border-[#10B981] transition-all duration-300">
								<h3 className="text-xl font-bold mb-4 text-[var(--text-color)]">3. Capital & Risk Control</h3>
								<ul className="space-y-3 text-sm text-[var(--text-muted)] font-semibold">
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Mathematical Position Sizing Formulas</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Drawdown Management & Recovery rules</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Trading Psychology & FOMO Mitigation</span>
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
										<span>Systematic Trading Journal Maintenance</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>


				{/* FAQ Section */}
				<div className="bg-[var(--bg-secondary)] py-20 transition-colors duration-300">
					<div className="max-w-4xl mx-auto px-4 md:px-6">
						<div className="text-center mb-16">
							<div className="inline-block text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
								Frequently Asked Questions
							</div>
							<h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-color)]">
								Have Questions? We Have Answers.
							</h2>
						</div>

						<div className="space-y-4">
							{faqs.map((faq, idx) => (
								<div 
									key={idx} 
									className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden transition-all duration-200"
								>
									<button
										type="button"
										onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
										className="w-full flex items-center justify-between p-6 text-left font-bold text-[var(--text-color)] hover:text-[#10B981] transition-colors"
									>
										<span>{faq.q}</span>
										<span className={`transform transition-transform duration-200 ${openFaq === idx ? 'rotate-45 text-[#10B981]' : 'text-[var(--text-muted)]'}`}>
											<FiPlus size={20} />
										</span>
									</button>
									{openFaq === idx && (
										<div className="px-6 pb-6 pt-1 text-sm text-[var(--text-muted)] font-medium leading-relaxed border-t border-[var(--border-color)]">
											{faq.a}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Join Request Form Section */}
				<div id="join-section" className="max-w-4xl mx-auto px-4 md:px-6 pb-24">
					<div className="relative group">
						<div className="absolute -inset-1.5 bg-gradient-to-r from-[#10B981] to-[#3B82F6] rounded-[2.5rem] opacity-35 blur-xl group-hover:opacity-50 transition duration-500"></div>

						<div className="relative bg-[var(--bg-card)] border border-[rgba(16,185,129,0.25)] rounded-[2.2rem] p-8 md:p-12 shadow-2xl text-center">
							<div className="flex justify-center gap-4 mb-6">
								<div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.15)]">
									<FaWhatsapp className="w-8 h-8 animate-pulse" />
								</div>
								<div className="w-16 h-16 bg-[#0088cc]/10 rounded-2xl flex items-center justify-center text-[#0088cc] shadow-[0_0_15px_rgba(0,136,204,0.15)]">
									<FaTelegram className="w-8 h-8 animate-pulse" />
								</div>
								<div className="w-16 h-16 bg-[#E1306C]/10 rounded-2xl flex items-center justify-center text-[#E1306C] shadow-[0_0_15px_rgba(225,48,108,0.15)]">
									<FaInstagram className="w-8 h-8 animate-pulse" />
								</div>
							</div>

							<h3 className="text-3xl font-extrabold mb-4 text-[var(--text-color)]">Ready to Trade with Edge?</h3>
							
							<p className="text-[var(--text-muted)] text-base mb-8 max-w-xl mx-auto font-medium">
								Outsiders and aspiring traders are welcome. Tap below to chat with our community coordinator on WhatsApp, join our Telegram channel, or follow us on Instagram.
							</p>

							<div className="flex flex-wrap gap-4 justify-center">
								<a
									href="https://wa.me/918978946421?text=Hi!%20I%20am%20interested%20in%20joining%20the%20Bull%20Boom%20Trading%20Community."
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-2xl hover:shadow-[0_6px_25px_rgba(37,211,102,0.4)] hover:scale-[1.03] transition-all duration-300 text-base"
								>
									<FaWhatsapp size={22} />
									<span>Join via WhatsApp</span>
								</a>
								<a
									href="https://t.me/tradewithpavan7098"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-3 px-8 py-4 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-2xl hover:shadow-[0_6px_25px_rgba(0,136,204,0.4)] hover:scale-[1.03] transition-all duration-300 text-base"
								>
									<FaTelegram size={22} />
									<span>Join for Updates</span>
								</a>
								<a
									href="https://www.instagram.com/trade_wth_pavan?igsh=ZDh1b2o3cHQzbmF1"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] text-white font-bold rounded-2xl hover:shadow-[0_6px_25px_rgba(253,29,29,0.4)] hover:scale-[1.03] transition-all duration-300 text-base"
								>
									<FaInstagram size={22} />
									<span>Follow on Instagram</span>
								</a>
							</div>
						</div>
					</div>
				</div>

			</div>
		</>
	);
}
