import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
    TrendingUp, Clock, BarChart2, BookOpen, Users, CheckCircle,
    ChevronDown, Activity, DollarSign, PieChart, Shield
} from "lucide-react";


export default function IndianMarketTradePage() {
    const { theme } = useTheme();
    const { isAuthenticated, user, token, isCourseEnrolled, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [agree, setAgree] = useState(true);
    const [whatsapp, setWhatsapp] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [openWeek, setOpenWeek] = useState(null);
    const [showAllTools, setShowAllTools] = useState(false);
    const [instructors, setInstructors] = useState([]); 223

    const [loadingInstructors, setLoadingInstructors] = useState(true);

    const TRADE_SLUG = "indian-market-trade";
    const TRADE_TITLE = "Indian Market Trade";
    const trimWrappedUrl = (value) => {
        let s = String(value || "").trim();
        const leadingWrappers = new Set(["<", "[", "(", "'", "\"", "`"]);
        const trailingWrappers = new Set([">", "]", ")", "'", "\"", "`"]);

        while (s && leadingWrappers.has(s[0])) s = s.slice(1).trimStart();
        while (s && trailingWrappers.has(s[s.length - 1])) s = s.slice(0, -1).trimEnd();
        return s;
    };

    useEffect(() => {
        const enrolled =
            isCourseEnrolled(TRADE_SLUG) ||
            isCourseEnrolled(TRADE_TITLE) ||
            isCourseEnrolled("indian market trade");
        setIsEnrolled(enrolled);
    }, [isCourseEnrolled, isAuthenticated, user]);

    const resolveDriveId = (raw) => {
        if (!raw) return null;
        const s = trimWrappedUrl(raw);
        try {
            const u = new URL(s);
            if (!/drive\.google\.com|docs\.google\.com/i.test(u.hostname)) return null;
            const fromParam = u.searchParams.get("id");
            if (fromParam) return fromParam;
        } catch {
            // Not a full URL; try the raw Google Drive patterns below.
        }
        const m1 = s.match(/\/file\/d\/([^/]+)/);
        if (m1 && m1[1]) return m1[1];
        const m2 = s.match(/[?&]id=([^&]+)/);
        if (m2 && m2[1]) return m2[1];
        return null;
    };

    const resolveImageUrl = (url) => {
        if (!url) return "";
        const s = trimWrappedUrl(url);
        if (s.startsWith("data:")) return s;
        const isHttp = /^https?:\/\//i.test(s);
        if (isHttp && /(drive\.google\.com|docs\.google\.com)\//i.test(s)) {
            const id = resolveDriveId(s);
            if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
            return s;
        }
        if (isHttp) return s;
        const base = API_URL?.replace(/\/+$/, "") || "";
        const path = String(url).replace(/^\/+/, "");
        return `${base}/${path}`;
    };

    const handleImageError = (e, originalUrl) => {
        const img = e.currentTarget;
        const id = resolveDriveId(originalUrl);
        const step = img.dataset.fallbackStep || "0";
        if (id) {
            if (step === "0") { img.dataset.fallbackStep = "1"; img.src = `https://drive.google.com/uc?id=${id}`; return; }
            if (step === "1") { img.dataset.fallbackStep = "2"; img.src = `https://lh3.googleusercontent.com/d/${id}=s800`; return; }
        }
        img.dataset.fallbackStep = "done";
        img.src = "https://via.placeholder.com/160?text=Instructor";
    };

    useEffect(() => {
        (async () => {
            try {
                setLoadingInstructors(true);
                let list = [];
                try {
                    const res = await fetch(`${API_URL}/api/courses/instructors/public`);
                    if (res.ok) { const data = await res.json(); list = Array.isArray(data) ? data : []; }
                } catch {
                    // Instructor list is optional; fall back to courses below.
                }
                if (!list.length) {
                    const coursesRes = await fetch(`${API_URL}/api/courses`);
                    if (coursesRes.ok) {
                        const courses = await coursesRes.json();
                        const byInstructor = new Map();
                        for (const c of courses) {
                            const key = c.instructorId || c.instructor;
                            if (!key) continue;
                            if (!byInstructor.has(key)) {
                                byInstructor.set(key, { _id: c.instructorId || key, name: c.instructor, expertise: c.category || "Instructor", email: "", bio: "", description: "" });
                            }
                        }
                        list = Array.from(byInstructor.values());
                    }
                }
                const normalized = list.map((i) => ({ ...i, photo: i.photo || i.photoUrl || i.photoURL || i.avatar || i.image || i.imageUrl || i.picture || "", experience: i.experience || "" }));
                setInstructors(normalized);
            } catch { setInstructors([]); } finally { setLoadingInstructors(false); }
        })();
    }, []);

    useEffect(() => {
        const fullName = user?.fullName || user?.user?.fullName || "";
        const email = user?.email || user?.user?.email || "";
        if (fullName || email) { setForm((prev) => ({ ...prev, name: prev.name || fullName, email: prev.email || email })); }
    }, [user]);

    const findTradeCourseId = async () => {
        const response = await fetch(`${API_URL}/api/courses`);
        if (!response.ok) return null;
        const courses = await response.json();
        if (!Array.isArray(courses)) return null;
        const match = courses.find((course) =>
            (course?.title || "").toLowerCase().includes("indian market trade")
        );
        return match?._id || null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEnrolled) { toast.info("You are already enrolled in this program."); return; }
        if (!form.name || !form.phone || !form.email) { toast.error("Please fill in name, phone, and email."); return; }
        if (!/^\d{10}$/.test(form.phone)) { toast.error("Please enter a valid 10-digit phone number."); return; }
        if (!agree) { toast.error("Please accept Terms & Conditions to continue."); return; }
        if (!isAuthenticated) { toast("Please sign up or log in to enroll."); navigate("/signup"); return; }
        setSubmitting(true);
        try {
            const leadRes = await fetch(`${API_URL}/api/leads`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, courseId: TRADE_SLUG, courseName: TRADE_TITLE, type: "Enrollment", agreeTerms: agree, whatsappUpdates: whatsapp }),
            });
            const leadData = await leadRes.json().catch(() => ({}));
            if (leadData?.alreadyEnrolled) { setIsEnrolled(true); setForm({ name: "", phone: "", email: "" }); toast.info("You are already enrolled in this program."); return; }
            if (!leadRes.ok) { toast.error(leadData?.message || "Unable to enroll right now. Please try again."); return; }
            const courseId = await findTradeCourseId();
            if (courseId) {
                const enrollRes = await fetch(`${API_URL}/api/users/enroll/${courseId}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
                if (!enrollRes.ok) {
                    const enrollData = await enrollRes.json().catch(() => ({}));
                    const message = (enrollData?.message || "").toLowerCase();
                    if (message.includes("already enrolled")) { setIsEnrolled(true); if (refreshUser) refreshUser(); toast.info("You are already enrolled in this program."); }
                    else { setIsEnrolled(true); if (refreshUser) refreshUser(); toast.success("Enrollment submitted successfully!"); }
                } else {
                    setIsEnrolled(true); if (refreshUser) refreshUser(); toast.success("Successfully enrolled!");
                    try {
                        const mentorRes = await fetch(`${API_URL}/api/users/assigned-mentor`, { headers: { Authorization: `Bearer ${token}` } });
                        if (mentorRes.ok) {
                            const mentor = await mentorRes.json();
                            const d = new Date(); d.setDate(d.getDate() + 8);
                            const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                            await fetch(`${API_URL}/api/mentorship-sessions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: "First Mentorship", mentorId: mentor?._id, date: dateStr, time: "7:00pm", notes: "Auto-created on enrollment" }) });
                        }
                    } catch {
                        // Mentorship auto-scheduling should not block enrollment.
                    }
                }
            } else { setIsEnrolled(true); toast.success("Enrollment submitted successfully!"); }
            setForm({ name: "", phone: "", email: "" });
        } catch (err) { console.error("Lead submit error", err); toast.error("Unable to enroll right now. Please try again."); }
        finally { setSubmitting(false); }
    };

    const tools = [
        "TradingView",
        "Zerodha Kite",
        "Upstox Pro",
        "Angel One",
        "Groww",
        "Dhan",
        "Fyers",
        "5paisa",
        "Moneycontrol",
        "Screener",
        "Chartink",
        "Trendlyne",
        "TickerTape",
        "StockEdge",
        "MarketSmith India",
        "NSE India",
        "BSE India",
        "Investing.com",
        "Economic Times Markets",
        "Yahoo Finance",
        "Google Finance",
        "Sensibull",
        "Opstra",
        "AlgoTest",
        "Streak",
        "Strike",
        "Trading Economics",
        "Investopedia",
        "Finviz",
        "Macrotrends"
    ];
    const getToolLogo = (name) => {
        const logos = {
            "TradingView": "https://s3-symbol-logo.tradingview.com/tradingview-icon.svg",

            "Zerodha Kite": "https://zerodha.com/static/images/logo.svg",

            "Upstox Pro": "https://upstox.com/favicon.ico",

            "Angel One": "https://www.angelone.in/favicon.ico",

            "Groww": "https://groww.in/favicon.ico",

            "Dhan": "https://dhan.co/favicon.ico",

            "Fyers": "https://fyers.in/favicon.ico",

            "5paisa": "https://www.5paisa.com/favicon.ico",

            "Moneycontrol": "https://images.moneycontrol.com/static-mcnews/2021/05/moneycontrol-logo-770x433.png",

            "Screener": "https://www.screener.in/static/img/logo-black.f44abb4998d1.svg",

            "Chartink": "https://chartink.com/favicon.ico",

            "Trendlyne": "https://trendlyne.com/favicon.ico",

            "TickerTape": "https://www.tickertape.in/favicon.ico",

            "StockEdge": "https://stockedge.com/favicon.ico",

            "MarketSmith India": "https://marketsmithindia.com/favicon.ico",

            "NSE India": "https://www.nseindia.com/assets/images/NSE_Logo.svg",

            "BSE India": "https://www.bseindia.com/include/images/bse_logo.svg",

            "Investing.com": "https://www.investing.com/favicon.ico",

            "Economic Times Markets": "https://img.etimg.com/photo/msid-74451948,quality-100/et-logo.jpg",

            "Yahoo Finance": "https://s.yimg.com/cv/apiv2/default/icons/favicon_y19_32x32_custom.svg",

            "Google Finance": "https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png",

            "Sensibull": "https://sensibull.com/favicon.ico",

            "Opstra": "https://opstra.definedge.com/favicon.ico",

            "AlgoTest": "https://algotest.in/favicon.ico",

            "Streak": "https://www.streak.tech/favicon.ico",

            "Strike": "https://strike.money/favicon.ico",

            "Trading Economics": "https://api.tradingeconomics.com/favicon.ico",

            "Investopedia": "https://www.investopedia.com/favicon.ico",

            "Finviz": "https://finviz.com/favicon.ico",

            "Macrotrends": "https://www.macrotrends.net/assets/images/favicon.ico"
        };

        return logos[name] || `https://via.placeholder.com/24?text=${name[0]}`;
    };

    const curriculum = [
        {
            title: "WEEK 1: Foundations of Indian Financial Markets",
            items: [
                "Introduction to Indian Capital Markets & SEBI",
                "Understanding NSE & BSE – Structure & Participants",
                "Types of Financial Instruments: Equity, Debt, Derivatives, Commodities",
                { text: "Demat & Trading Accounts", sub: ["Opening, Setup & Order Types Explained"] },
                "Reading Stock Quotes, Indices (Nifty 50, Sensex) & Market Data",
            ],
        },
        {
            title: "WEEK 2: Technical Analysis & Chart Patterns",
            items: [
                "Candlestick Patterns: Bullish & Bearish Signals",
                "Support, Resistance & Trendlines",
                "Key Indicators: RSI, MACD, Bollinger Bands, Moving Averages",
                "Volume Analysis & Price Action Strategies",
                "Chart Patterns: Head & Shoulders, Double Top/Bottom, Flags",
            ],
        },
        {
            title: "WEEK 3: Fundamental Analysis & Sector Research",
            items: [
                "Understanding Financial Statements: P&L, Balance Sheet, Cash Flow",
                "Key Ratios: P/E, P/B, ROE, Debt-to-Equity",
                "Sector Analysis: Banking, IT, Pharma, FMCG, Auto",
                "Macroeconomic Indicators & Their Market Impact",
                "Identifying Undervalued Stocks – Screener.in & Tickertape",
            ],
        },
        {
            title: "WEEK 4: Options, Futures & Risk Management",
            items: [
                "Introduction to F&O – Futures and Options Basics",
                "Options Greeks: Delta, Theta, Vega Explained Simply",
                "Intraday vs Swing vs Positional Trading Strategies",
                "Building a Trading Plan & Risk-Reward Framework",
                "Portfolio Construction, Diversification & Tax on Trading",
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">

            {/* ── HERO ── */}
            <div className="relative bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] pt-24 md:pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Nav links */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6 text-sm">
                            {["What to Expect", "Curriculum", "Instructors", "Fees"].map((label) => (
                                <a
                                    key={label}
                                    href={`#${label.toLowerCase().replace(/\s/g, "-")}`}
                                    className="text-[var(--text-muted)] hover:text-[#2563EB] font-semibold transition-colors duration-200"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center gap-8">
                        {/* Badge */}
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2563EB]/40 bg-[#2563EB]/10 text-[#2563EB] text-sm font-semibold">
                            <TrendingUp className="w-4 h-4" /> Live Market Training
                        </span>

                        <h1 className={theme === "light-theme"
                            ? "text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--text-color)]"
                            : "text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#60A5FA]"
                        }>
                            Indian Market Trading Course
                        </h1>

                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl">
                            A comprehensive, hands-on journey through the Indian stock market — from Nifty & Sensex basics
                            to advanced options strategies — with live trade simulations and expert mentorship.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { value: "30+", label: "Hours of", sub: "Live Learning", color: "#38BDF8" },
                                { value: "1:1", label: "Weekly", sub: "Mentorship", color: "#38BDF8" },
                                { value: "100%", label: "Placement", sub: "Assistance", color: "#38BDF8" },
                                { value: "10+", label: "Live Workshops &", sub: "Recordings", color: "#22C55E" },
                            ].map((s) => (
                                <div key={s.sub} className="rounded-xl border bg-[var(--card-bg)] border-[var(--border-primary)] p-4 text-center shadow-sm">
                                    <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                                    <div className="mt-3 text-sm text-[var(--text-color)]">{s.label}</div>
                                    <div className="mt-1 text-sm text-[var(--text-color)]">{s.sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Enroll Form */}
                        <div id="trade-enroll-form" className="w-full max-w-lg">
                            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 shadow-[0_8px_32px_rgba(37,99,235,0.1)]">
                                <h3 className="text-xl font-bold mb-4">Master the Indian Markets: Start Now</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="Your Full Name"
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 10) setForm((f) => ({ ...f, phone: v })); }}
                                        placeholder="Your Phone Number"
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5"
                                        maxLength={10} pattern="[0-9]{10}" required
                                    />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                        placeholder="Your Email Id"
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5"
                                        required
                                    />
                                    <div className="flex items-center justify-center gap-4 text-sm text-[#9A93B5]">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                                            I Agree to the Terms & Conditions
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
                                            Send WhatsApp Updates
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting || isEnrolled}
                                        className="w-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white rounded-lg font-bold px-6 py-3.5 transition-all duration-300 shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.5)] disabled:opacity-60"
                                    >
                                        {submitting ? "Submitting..." : isEnrolled ? "Enrolled ✓" : "Enroll Now"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── WHAT TO EXPECT ── */}
            <section id="what-to-expect" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className={theme === "light-theme"
                            ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                            : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
                        }>
                            How Does the Indian Market Trade Course Help You?
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "30+ Hours of Market Immersion",
                                points: [
                                    "Master technical & fundamental analysis with live chart walkthroughs on NSE & BSE.",
                                    "Hands-on practice with real tickers, screeners, and order simulations.",
                                ],
                            },
                            {
                                title: "10+ Real Trade Simulations",
                                points: [
                                    "Practice entries, exits and position sizing on virtual portfolios.",
                                    "Diverse market scenarios — bull runs, bear phases, sideways markets.",
                                ],
                            },
                            {
                                title: "1:1 Expert Mentorship",
                                points: [
                                    "Weekly sessions with seasoned traders and market analysts.",
                                    "Personalized feedback on your trade journal and strategy.",
                                ],
                            },
                        ].map((card) => (
                            <div key={card.title}>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-color)]">{card.title}</h3>
                                <ul className="list-disc pl-5 space-y-3 text-[var(--text-muted)] leading-relaxed">
                                    {card.points.map((p) => <li key={p}>{p}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CURRICULUM STATS ── */}
            <section className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className={theme === "light-theme"
                            ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                            : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
                        }>
                            Curriculum Statistics
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            { icon: <BarChart2 className="w-6 h-6 text-[var(--text-color)]" />, title: "Trade Projects", desc: "Hands-on simulations with real Indian market scenarios." },
                            { icon: <Clock className="w-6 h-6 text-[var(--text-color)]" />, title: "30+ Hours", desc: "Deep-dive learning in equity, derivatives & commodities." },
                            { icon: <Activity className="w-6 h-6 text-[var(--text-color)]" />, title: "20+ Tools & Platforms", desc: "Proficiency in Zerodha, TradingView, Screener & more." },
                            { icon: <BookOpen className="w-6 h-6 text-[var(--text-color)]" />, title: "30+ Assignments", desc: "Structured exercises to sharpen your trading edge." },
                            { icon: <Users className="w-6 h-6 text-[var(--text-color)]" />, title: "Mentorship Sessions", desc: "1:1 live guidance from experienced market practitioners." },
                            { icon: <Shield className="w-6 h-6 text-[var(--text-color)]" />, title: "Risk Management Module", desc: "Learn position sizing, stop-loss & portfolio protection." },
                        ].map((stat) => (
                            <div key={stat.title} className="flex items-start gap-4">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
                                    {stat.icon}
                                </span>
                                <div>
                                    <h3 className="text-xl font-semibold text-[var(--text-color)]">{stat.title}</h3>
                                    <p className="text-[var(--text-muted)] mt-1">{stat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ROADMAP ── */}
            <section id="roadmap" className="bg-[var(--bg-color)] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-6 md:mb-10">
                        <h2 className={theme === "light-theme"
                            ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                            : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
                        }>
                            Personalized Roadmap
                        </h2>
                        <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
                            Your ambition + our expertise = your custom path to trading mastery
                        </p>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)] bg-[var(--card-bg)] shadow-[0_8px_32px_rgba(37,99,235,0.12)]">
                        <img
                            src={theme === "light-theme" ? "/Trading-dark.png" : "/Trading-dark.png"}
                            alt="Program Personalized Roadmap"
                            className="w-full h-auto object-contain"
                            loading="lazy"
                        />
                    </div>
                </div>
            </section>

            {/* ── CURRICULUM ── */}
            <section id="curriculum" className="bg-[var(--bg-color)] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-6 md:mb-10">
                        <h2 className={theme === "light-theme"
                            ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                            : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
                        }>
                            Curriculum
                        </h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {["Trade Projects", "30+ Hours", "20+ Tools", "30+ Assignments"].map((chip) => (
                            <span key={chip} className="px-3 py-1.5 rounded-full text-sm border border-[var(--border-primary)] bg-[var(--card-bg)]">
                                {chip}
                            </span>
                        ))}
                    </div>

                    <div className="max-w-4xl mx-auto space-y-4">
                        {curriculum.map((mod, idx) => (
                            <details
                                key={idx}
                                open={openWeek === idx}
                                className="group rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)]"
                            >
                                <summary
                                    onClick={(e) => { e.preventDefault(); setOpenWeek(openWeek === idx ? null : idx); }}
                                    className="cursor-pointer select-none flex items-center justify-between px-4 py-3 font-semibold"
                                >
                                    <span className="text-[var(--text-color)]">{mod.title}</span>
                                    <span className="ml-4 w-6 h-6 inline-flex items-center justify-center rounded-md border border-[var(--border-primary)]">
                                        <svg className="w-3 h-3 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="px-6 pb-5">
                                    <ol className="space-y-2 list-decimal pl-5 text-[var(--text-muted)]">
                                        {mod.items.map((it, i) => {
                                            if (typeof it === "string") return <li key={i} className="leading-relaxed">{it}</li>;
                                            return (
                                                <li key={i} className="leading-relaxed">
                                                    {it.text}
                                                    {Array.isArray(it.sub) && it.sub.length > 0 && (
                                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                                            {it.sub.map((s, si) => <li key={si}>{s}</li>)}
                                                        </ul>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TOOLS ── */}
            <section id="tools" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-6 md:mb-10">
                        <h2 className={theme === "light-theme"
                            ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                            : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
                        }>
                            Platforms & Tools
                        </h2>
                        <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
                            Master 20+ trading platforms, screeners, and analysis tools used by professional traders
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                        {tools.slice(0, showAllTools ? undefined : 18).map((name) => (
                            <div
                                key={name}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-default"
                            >
                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-md bg-gray-50">
                                    <img
                                        src={getToolLogo(name)}
                                        alt={name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.target.src = `https://via.placeholder.com/24?text=${name[0]}`; }}
                                    />
                                </div>
                                <span className="text-sm md:text-base font-bold text-gray-900 leading-tight flex-1 break-words">{name}</span>
                            </div>
                        ))}
                    </div>
                    {tools.length > 18 && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setShowAllTools(!showAllTools)}
                                className="px-6 py-3 rounded-xl border-2 border-[#2563EB] text-[#2563EB] font-semibold hover:bg-[#2563EB] hover:text-white transition-all"
                            >
                                {showAllTools ? "Show Less" : "Display All Tools"}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── INSTRUCTORS ── */}
            <section id="instructors" className="instructors-page py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
                    <div className="space-y-3 text-center">
                        <h2 className={theme === "light-theme"
                            ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                            : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
                        }>
                            Real Traders, Real Insights: Your Expert Mentors
                        </h2>
                        <p className="text-sm md:text-base text-[var(--text-muted)]">Learn from practitioners who trade the Indian markets daily</p>
                    </div>

                    <style>{`
            .instructors-page { background: transparent; }
            .instructors-page .ins-text-primary  { color: #e8f0fe; }
            .instructors-page .ins-text-secondary { color: #93c5fd; }
            .instructors-page .ins-text-muted     { color: #60a5fa; }
            .instructors-page .ins-card-face {
              background: linear-gradient(175deg, #0e1e38 0%, #080f1e 100%);
              border: 1px solid rgba(37,99,235,0.22);
              box-shadow: inset 0 1px 0 rgba(96,165,250,0.07);
            }
            .instructors-page .ins-card-back-face {
              background: linear-gradient(145deg, #0d1f3c, #0b1628);
              border: 1px solid rgba(37,99,235,0.35);
            }
            .instructors-page .ins-divider { background: rgba(37,99,235,0.2); }
            .instructors-page .ins-badge {
              background: rgba(37,99,235,0.15);
              border: 1px solid rgba(37,99,235,0.35);
              color: #60a5fa;
            }
            .instructors-page .ins-email { color: #93c5fd; }
            .instructors-page .ins-email:hover { color: #60a5fa; }
            .instructors-page .ins-company { color: #60a5fa; }
            .instructors-page .ins-email-icon { color: #3b82f6; }
            .instructors-page .ins-bio { color: #bfdbfe; }
            .instructors-page .ins-back-label { color: #93c5fd; }
            .instructors-page .ins-mailto-btn {
              background: rgba(37,99,235,0.15);
              border: 1px solid rgba(37,99,235,0.4);
              color: #93c5fd;
            }
            .instructors-page .ins-mailto-btn:hover {
              background: rgba(37,99,235,0.28);
              border-color: rgba(37,99,235,0.7);
              color: #bfdbfe;
            }
            .light-theme .instructors-page .ins-text-primary  { color: #1e3a5f; }
            .light-theme .instructors-page .ins-text-secondary { color: #2563eb; }
            .light-theme .instructors-page .ins-text-muted    { color: #3b82f6; }
            .light-theme .instructors-page .ins-card-face {
              background: linear-gradient(175deg, #ffffff 0%, #f5f9ff 100%);
              border: 1px solid rgba(37,99,235,0.2);
              box-shadow: 0 4px 28px rgba(37,99,235,0.10), inset 0 1px 0 rgba(255,255,255,0.9);
            }
            .light-theme .instructors-page .ins-card-back-face {
              background: linear-gradient(145deg, #dbeafe, #eff6ff);
              border: 1px solid rgba(37,99,235,0.3);
            }
            .light-theme .instructors-page .ins-badge {
              background: rgba(37,99,235,0.1);
              border: 1px solid rgba(37,99,235,0.28);
              color: #2563eb;
            }
            .light-theme .instructors-page .ins-email { color: #2563eb; }
            .light-theme .instructors-page .ins-company { color: #3b82f6; }
            .light-theme .instructors-page .ins-bio { color: #1e3a5f; }
            .light-theme .instructors-page .ins-back-label { color: #2563eb; }
            .light-theme .instructors-page .ins-exp-row {
              background: rgba(37,99,235,0.08);
              border: 1px solid rgba(37,99,235,0.22);
              color: #1e3a5f;
            }
            .light-theme .instructors-page .ins-mailto-btn {
              background: rgba(37,99,235,0.1);
              border: 1px solid rgba(37,99,235,0.3);
              color: #1e3a5f;
            }
            .ins-flip-wrapper { perspective: 1100px; height: 460px; }
            .ins-flip-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1); cursor: pointer; }
            .ins-flip-wrapper:hover .ins-flip-inner { transform: rotateY(180deg); }
            .ins-flip-front,.ins-flip-back { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 20px; overflow: hidden; }
            .ins-flip-back { transform: rotateY(180deg); }
            .ins-flip-wrapper:hover { filter: drop-shadow(0 20px 40px rgba(37,99,235,0.22)); }
          `}</style>

                    {loadingInstructors ? (
                        <div className="text-center py-10">
                            <div className="inline-block w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : instructors.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[rgba(37,99,235,0.15)] to-[rgba(96,165,250,0.1)] border border-[rgba(37,99,235,0.3)] flex items-center justify-center mx-auto mb-4">
                                <svg className="w-9 h-9 text-[#2563EB] opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM16 15v2h2v-2zM4 15v2H2v-2z" />
                                </svg>
                            </div>
                            <p className="ins-text-muted font-medium">No instructors available yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {instructors.map((ins, idx) => {
                                const initials = (ins.name || "I").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                                const gradients = [["#2563EB", "#38BDF8"], ["#1D4ED8", "#2563EB"], ["#1D4ED8", "#1D4ED8"], ["#38BDF8", "#60A5FA"], ["#2563EB", "#1D4ED8"], ["#1D4ED8", "#38BDF8"]];
                                const [c1, c2] = gradients[idx % gradients.length];
                                const expertiseTags = (ins.expertise || ins.designation || "Instructor").split(/[,/]/).map(s => s.trim()).filter(Boolean);
                                return (
                                    <div key={ins._id || ins.email || ins.name} className="ins-flip-wrapper">
                                        <div className="ins-flip-inner">
                                            <div className="ins-flip-front ins-card-face flex flex-col h-full relative overflow-hidden">
                                                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px] z-10" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
                                                <div className="px-5 pt-6 pb-0 flex justify-center">
                                                    {ins.photo ? (
                                                        <div className="w-full overflow-hidden" style={{ borderRadius: "14px", aspectRatio: "4/3", boxShadow: `0 4px 20px rgba(0,0,0,0.22), 0 0 0 1px ${c1}22` }}>
                                                            <img src={resolveImageUrl(ins.photo)} alt={ins.name || "Instructor"} className="w-full h-full object-cover" style={{ objectPosition: "center 15%" }} referrerPolicy="no-referrer" onError={(e) => handleImageError(e, ins.photo)} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full flex items-center justify-center text-white text-5xl font-bold tracking-wide" style={{ borderRadius: "14px", aspectRatio: "4/3", background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 4px 20px rgba(0,0,0,0.22)` }}>{initials}</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col items-center px-5 pt-4 pb-4">
                                                    <h3 className="ins-text-primary text-[18px] font-bold text-center leading-snug mb-1 tracking-tight">{ins.name || "Instructor"}</h3>
                                                    <p className="text-[13px] font-semibold mb-3 text-center" style={{ color: c1 }}>{expertiseTags[0] || "Instructor"}</p>
                                                    {ins.company && (
                                                        <div className="flex items-center gap-1.5 mb-3">
                                                            <svg className="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                            <span className="ins-company text-[13px] font-medium">{ins.company}</span>
                                                        </div>
                                                    )}
                                                    {expertiseTags.slice(1, 3).length > 0 && (
                                                        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                                                            {expertiseTags.slice(1, 3).map((tag, ti) => (
                                                                <span key={ti} className="ins-badge text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide">{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {ins.experience && (
                                                        <div className="ins-exp-row flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium mt-auto mb-2">
                                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                            {ins.experience}
                                                        </div>
                                                    )}
                                                    <div className="mt-auto flex items-center justify-center gap-1.5 opacity-40">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                        <span className="ins-text-muted text-[10px] font-medium tracking-wide uppercase">View Bio</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ins-flip-back ins-card-back-face flex flex-col h-full">
                                                <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
                                                <div className="flex-1 flex flex-col px-7 py-6 overflow-hidden">
                                                    <div className="flex items-center gap-3 mb-5">
                                                        {ins.photo ? (
                                                            <img src={resolveImageUrl(ins.photo)} alt={ins.name} className="w-12 h-12 rounded-full object-cover shrink-0" style={{ boxShadow: `0 0 0 2px ${c1}66` }} referrerPolicy="no-referrer" onError={(e) => handleImageError(e, ins.photo)} />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{initials}</div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="ins-text-primary text-sm font-bold leading-tight truncate">{ins.name || "Instructor"}</p>
                                                            <p className="ins-company text-xs truncate">{expertiseTags[0] || "Instructor"}</p>
                                                        </div>
                                                    </div>
                                                    <p className="ins-back-label text-[10px] font-bold uppercase tracking-widest mb-2">About</p>
                                                    <p className="ins-bio text-[13px] leading-relaxed line-clamp-5 flex-1">{ins.bio || ins.description || "No bio available for this instructor yet."}</p>
                                                    {ins.experience && (
                                                        <div className="ins-exp-row flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium mt-3">
                                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                            {ins.experience}
                                                        </div>
                                                    )}
                                                </div>
                                                {ins.active === false && (
                                                    <div className="absolute top-4 right-4 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm text-blue-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">Inactive</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="fees" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-10">
                        <h2 className={theme === "light-theme"
                            ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                            : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
                        }>
                            Choose the Right Trading Program for You
                        </h2>
                        <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
                            Unlock your market potential with the program designed for your growth journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                        {/* Plan B – Crash Course */}
                        <div className="rounded-2xl border-2 border-[#2563EB] bg-[var(--card-bg)] p-6 md:p-8 shadow-[0_8px_32px_rgba(37,99,235,0.2)] relative overflow-hidden">
                            <div className="absolute top-4 right-4 bg-[#2563EB] text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
                            <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mb-2">Indian Market Trade</h3>
                            <div className="text-4xl md:text-5xl font-extrabold mb-6 text-[#2563EB]">₹5,999</div>
                            <ul className="space-y-3 text-[var(--text-color)]">
                                {[
                                    "4 Weeks of Power Learning",
                                    "30+ Hours of Live Market Workshops",
                                    "Industry-Grade Trade Projects",
                                    "Structured Curriculum",
                                    "AV Certificate | NSE Certification Prep | WSU Certificate",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <Link
                                    to="/courses/indian-trade-market#trade-enroll-form"
                                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                    className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white font-semibold py-3 transition-all"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div id="testimonials" className="max-w-7xl mx-auto px-4 md:px-6 py-16"></div>
        </div>
    );
}
