


import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
    TrendingUp, CheckCircle, ChevronLeft, ChevronRight,
    BarChart2, CandlestickChart, LineChart, Activity,
    Layers, Target, Zap, Globe
} from "lucide-react";

// ─── Live Learning carousel slides ────────────────────────────────────────────
const CAROUSEL_SLIDES = [
    {
        tag: "TECHNICAL ANALYSIS",
        title: "Candlestick & Chart Patterns Live",
        desc: "Identify bullish engulfing, doji, hammer, and head-and-shoulders on real NSE charts alongside experienced traders.",
        chips: ["Candlestick", "Patterns", "NSE Live", "Chart Reading"],
        accent: "#38BDF8",
        icon: CandlestickChart,
        stat: { label: "NIFTY 50", value: "+1.24%", color: "#22C55E" },
        bar: "3/4",
    },
    {
        tag: "DERIVATIVES · F&O",
        title: "Options Strategies in Real Market",
        desc: "Walk through Iron Condor, Bull Call Spread, and straddles on Sensex live expiry days — understand greeks in motion.",
        chips: ["Options", "Futures", "Greeks", "F&O"],
        accent: "#A78BFA",
        icon: Layers,
        stat: { label: "BANKNIFTY", value: "48,210", color: "#A78BFA" },
        bar: "1/2",
    },
    {
        tag: "FUNDAMENTAL ANALYSIS",
        title: "Reading Balance Sheets & P&L Live",
        desc: "Decode quarterly results, P/E compression, ROE trends, and sector rotation with hands-on screener walkthroughs.",
        chips: ["P&L", "Balance Sheet", "P/E Ratio", "Screener"],
        accent: "#34D399",
        icon: BarChart2,
        stat: { label: "RELIANCE", value: "ROE 12.4%", color: "#34D399" },
        bar: "2/3",
    },
    {
        tag: "TRADE SIMULATION",
        title: "Virtual Portfolio — Entry to Exit",
        desc: "Execute paper trades on Zerodha Kite and TradingView with real-time setups: entry triggers, stop-loss, and target booking.",
        chips: ["Paper Trade", "Position Size", "SL / Target", "Execution"],
        accent: "#FB923C",
        icon: Target,
        stat: { label: "P&L TODAY", value: "+₹3,840", color: "#22C55E" },
        bar: "4/5",
    },
    {
        tag: "MARKET STRUCTURE",
        title: "NSE & BSE Market Mechanics",
        desc: "Understand circuit breakers, FII / DII flows, SEBI regulations, settlement cycles, and how order books move prices.",
        chips: ["SEBI", "NSE / BSE", "FII/DII", "Order Book"],
        accent: "#F472B6",
        icon: Globe,
        stat: { label: "FII NET", value: "+₹1,240 Cr", color: "#38BDF8" },
        bar: "3/5",
    },
];

// ─── Tools list ───────────────────────────────────────────────────────────────
const tools = [
    "TradingView", "Zerodha Kite", "Upstox Pro", "Angel One", "Groww", "Dhan",
    "Fyers", "5paisa", "Moneycontrol", "Screener", "Chartink", "Trendlyne",
    "TickerTape", "StockEdge", "MarketSmith India", "NSE India", "BSE India",
    "Investing.com", "Economic Times Markets", "Yahoo Finance", "Google Finance",
    "Sensibull", "Opstra", "AlgoTest", "Streak", "Strike", "Trading Economics",
    "Investopedia", "Finviz", "Macrotrends",
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
        "Macrotrends": "https://www.macrotrends.net/assets/images/favicon.ico",
    };
    return logos[name] || `https://via.placeholder.com/24?text=${name[0]}`;
};

// ─── Mini animated ticker bar ──────────────────────────────────────────────────
const TICKERS = [
    "NIFTY 50 ▲ 24,812  +1.24%",
    "SENSEX ▲ 81,540  +0.94%",
    "BANKNIFTY ▲ 52,340  +1.08%",
    "RELIANCE ▲ 2,944  +0.72%",
    "TCS ▲ 3,820  +0.45%",
    "HDFC BANK ▲ 1,792  +1.32%",
    "INFOSYS ▼ 1,623  -0.34%",
    "NIFTY IT ▲ 38,200  +0.88%",
];

function TickerBar() {
    return (
        <div style={{
            background: "linear-gradient(90deg, #0a1628 0%, #0d1f3c 100%)",
            borderBottom: "1px solid #1e3a5f",
            overflow: "hidden",
            height: "38px",
            display: "flex",
            alignItems: "center",
        }}>
            <div style={{
                display: "flex",
                gap: "60px",
                animation: "tickerScroll 28s linear infinite",
                whiteSpace: "nowrap",
                paddingLeft: "100%",
            }}>
                {[...TICKERS, ...TICKERS].map((t, i) => (
                    <span key={i} style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: t.includes("▼") ? "#f87171" : "#34d399",
                        letterSpacing: "0.04em",
                    }}>{t}</span>
                ))}
            </div>
            <style>{`@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
        </div>
    );
}

// ─── Carousel component ────────────────────────────────────────────────────────
function LiveLearningCarousel() {
    const [idx, setIdx] = useState(0);
    const [animDir, setAnimDir] = useState(null); // 'left' | 'right'
    const [visible, setVisible] = useState(true);
    const timerRef = useRef(null);

    const go = (dir) => {
        clearTimeout(timerRef.current);
        setAnimDir(dir);
        setVisible(false);
        setTimeout(() => {
            setIdx((prev) => (dir === "right" ? (prev + 1) % CAROUSEL_SLIDES.length : (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length));
            setVisible(true);
            setAnimDir(null);
        }, 280);
    };

    useEffect(() => {
        timerRef.current = setTimeout(() => go("right"), 4500);
        return () => clearTimeout(timerRef.current);
    }, [idx]);

    const slide = CAROUSEL_SLIDES[idx];
    const Icon = slide.icon;

    return (
        <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
            {/* prev / next buttons */}
            {[{ dir: "left", pos: { left: "-22px" }, icon: <ChevronLeft size={22} /> },
            { dir: "right", pos: { right: "-22px" }, icon: <ChevronRight size={22} /> }].map(({ dir, pos, icon }) => (
                <button
                    key={dir}
                    onClick={() => go(dir)}
                    style={{
                        position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 10,
                        ...pos,
                        width: "44px", height: "44px", borderRadius: "50%",
                        border: "1px solid rgba(56,189,248,0.35)",
                        background: "rgba(10,22,40,0.75)",
                        color: "#38BDF8", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(8px)",
                        transition: "background 0.2s",
                    }}
                >{icon}</button>
            ))}

            {/* slide card */}
            <div style={{
                borderRadius: "20px",
                border: `1px solid ${slide.accent}40`,
                background: "linear-gradient(135deg, #0d1b2a 0%, #0a1628 100%)",
                overflow: "hidden",
                boxShadow: `0 32px 80px ${slide.accent}22`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : `translateY(${animDir === "right" ? "18px" : "-18px"})`,
                transition: "opacity 0.28s ease, transform 0.28s ease",
                minHeight: "340px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
            }}>
                {/* left — visual panel */}
                <div style={{
                    background: `linear-gradient(135deg, ${slide.accent}18 0%, #06111f 100%)`,
                    borderRight: `1px solid ${slide.accent}30`,
                    padding: "40px 36px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "5px 14px",
                            borderRadius: "999px",
                            border: `1px solid ${slide.accent}50`,
                            background: `${slide.accent}18`,
                            color: slide.accent,
                            fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
                            marginBottom: "22px",
                        }}>{slide.tag}</div>

                        {/* fake chart bar visual */}
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px", marginBottom: "24px" }}>
                            {[40, 65, 50, 80, 60, 90, 70, 100, 75, 85, 95, 110].map((h, i) => (
                                <div key={i} style={{
                                    flex: 1, borderRadius: "3px 3px 0 0",
                                    background: i === 11 ? slide.accent : `${slide.accent}${i % 2 === 0 ? "60" : "35"}`,
                                    height: `${h * 0.72}%`,
                                    transition: "height 0.5s ease",
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* mini stat pill */}
                    <div style={{
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.09)",
                        padding: "12px 16px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{slide.stat.label}</span>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: slide.stat.color }}>{slide.stat.value}</span>
                    </div>
                </div>

                {/* right — text panel */}
                <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "14px",
                        background: `${slide.accent}20`,
                        border: `1px solid ${slide.accent}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: slide.accent,
                    }}>
                        <Icon size={24} />
                    </div>

                    <h3 style={{
                        fontSize: "22px", fontWeight: 800, color: "#f0f6ff",
                        lineHeight: 1.3, margin: 0,
                    }}>{slide.title}</h3>

                    <p style={{ fontSize: "14px", color: "rgba(200,215,240,0.72)", lineHeight: 1.7, margin: 0 }}>
                        {slide.desc}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {slide.chips.map((c) => (
                            <span key={c} style={{
                                fontSize: "12px", fontWeight: 600, color: slide.accent,
                                background: `${slide.accent}18`,
                                border: `1px solid ${slide.accent}35`,
                                borderRadius: "8px", padding: "4px 12px",
                            }}>{c}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* dot indicators */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
                {CAROUSEL_SLIDES.map((_, i) => (
                    <button key={i} onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 280); }} style={{
                        width: i === idx ? "28px" : "8px", height: "8px",
                        borderRadius: "999px",
                        background: i === idx ? slide.accent : "rgba(255,255,255,0.2)",
                        border: "none", cursor: "pointer",
                        transition: "all 0.3s ease",
                        padding: 0,
                    }} />
                ))}
            </div>
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function IndianMarketTradePage() {
    const { theme } = useTheme();
    const { isAuthenticated, user, token, isCourseEnrolled, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [agree, setAgree] = useState(true);
    const [whatsapp, setWhatsapp] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showAllTools, setShowAllTools] = useState(false);

    const TRADE_SLUG = "indian-market-trade";
    const TRADE_TITLE = "Indian Market Trade";
    const TRADE_ALIASES = [
        TRADE_SLUG, "indian-trade-market", TRADE_TITLE,
        "Trading Course", "Indian Market Trading Course",
        "indian market trade", "trading course", "indian market trading course",
    ];

    const normalizeCourseKey = (v) =>
        String(v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const trimWrappedUrl = (v) => {
        let s = String(v || "").trim();
        const lead = new Set(["<", "[", "(", "'", '"', "`"]);
        const trail = new Set([">", "]", ")", "'", '"', "`"]);
        while (s && lead.has(s[0])) s = s.slice(1).trimStart();
        while (s && trail.has(s[s.length - 1])) s = s.slice(0, -1).trimEnd();
        return s;
    };

    const resolveDriveId = (raw) => {
        if (!raw) return null;
        const s = trimWrappedUrl(raw);
        try {
            const u = new URL(s);
            if (!/drive\.google\.com|docs\.google\.com/i.test(u.hostname)) return null;
            const fp = u.searchParams.get("id"); if (fp) return fp;
        } catch { /* fall through */ }
        const m1 = s.match(/\/file\/d\/([^/]+)/); if (m1) return m1[1];
        const m2 = s.match(/[?&]id=([^&]+)/); if (m2) return m2[1];
        return null;
    };

    useEffect(() => {
        setIsEnrolled(TRADE_ALIASES.some((a) => isCourseEnrolled(a)));
    }, [isCourseEnrolled, isAuthenticated, user]);

    useEffect(() => {
        const fullName = user?.fullName || user?.user?.fullName || "";
        const email = user?.email || user?.user?.email || "";
        if (fullName || email) setForm((f) => ({ ...f, name: f.name || fullName, email: f.email || email }));
    }, [user]);

    const findTradeCourseId = async () => {
        const res = await fetch(`${API_URL}/api/courses`);
        if (!res.ok) return null;
        const courses = await res.json();
        if (!Array.isArray(courses)) return null;
        const aliases = new Set(TRADE_ALIASES.map(normalizeCourseKey));
        const match = courses.find((c) =>
            [c?._id, c?.title, c?.slug, c?.path, c?.courseId].map(normalizeCourseKey).some((x) => aliases.has(x))
        ) || courses.find((c) =>
            normalizeCourseKey(c?.category) === "trading" &&
            String(c?.price || "").trim() === "5999" &&
            normalizeCourseKey(c?.title) !== "indian-market-trade-pro"
        );
        return match?._id || null;
    };

    const createMentorshipSession = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/assigned-mentor`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const mentor = await res.json();
                const d = new Date(); d.setDate(d.getDate() + 8);
                const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                await fetch(`${API_URL}/api/mentorship-sessions`, {
                    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ title: "First Mentorship", mentorId: mentor?._id, date: dateStr, time: "7:00pm", notes: "Auto-created on enrollment" }),
                });
            }
        } catch { /* non-blocking */ }
    };

    const syncTradeEnrollment = async () => {
        const courseId = await findTradeCourseId();
        if (!courseId) return { synced: false, reason: "course-not-found" };
        const res = await fetch(`${API_URL}/api/users/enroll/${courseId}`, {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) { if (refreshUser) refreshUser(); await createMentorshipSession(); return { synced: true, alreadyEnrolled: false }; }
        const data = await res.json().catch(() => ({}));
        if ((data?.message || "").toLowerCase().includes("already enrolled")) { if (refreshUser) refreshUser(); return { synced: true, alreadyEnrolled: true }; }
        return { synced: false, reason: data?.message || res.statusText };
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
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, courseId: TRADE_SLUG, courseName: TRADE_TITLE, type: "Enrollment", agreeTerms: agree, whatsappUpdates: whatsapp }),
            });
            const leadData = await leadRes.json().catch(() => ({}));
            if (leadData?.alreadyEnrolled) {
                const s = await syncTradeEnrollment();
                if (s.synced) { setIsEnrolled(true); setForm({ name: "", phone: "", email: "" }); toast.info(s.alreadyEnrolled ? "Already enrolled!" : "Enrolled!"); }
                else toast.error("Registration exists but sync failed. Try again.");
                return;
            }
            if (!leadRes.ok) { toast.error(leadData?.message || "Unable to enroll right now."); return; }
            const s = await syncTradeEnrollment();
            if (s.synced) { setIsEnrolled(true); toast.success(s.alreadyEnrolled ? "Already enrolled!" : "Successfully enrolled!"); }
            else { toast.error("Enrollment submitted but course access failed. Try again."); return; }
            setForm({ name: "", phone: "", email: "" });
        } catch (err) { console.error(err); toast.error("Unable to enroll right now."); }
        finally { setSubmitting(false); }
    };

    const isDark = theme !== "light-theme";

    // shared heading style
    const H2 = {
        fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.15, margin: 0,
        color: isDark ? "#60A5FA" : "var(--text-color)"
    };

    return (
        <div className="min-h-screen" style={{ background: "var(--bg-color)", color: "var(--text-color)" }}>

            {/* ── TICKER ── */}
            <TickerBar />

            {/* ── HERO ── */}
            <div style={{
                position: "relative", overflow: "hidden",
                background: isDark
                    ? "linear-gradient(135deg, #060d1a 0%, #0a1628 50%, #060d1a 100%)"
                    : "linear-gradient(135deg, #f0f7ff 0%, #e8f2ff 50%, #f0f7ff 100%)",
                paddingTop: "80px", paddingBottom: "80px",
            }}>
                {/* decorative blobs */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35 }}>
                    <div style={{ position: "absolute", right: "-5%", top: "15%", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, #2563EB55 0%, transparent 70%)" }} />
                    <div style={{ position: "absolute", left: "-8%", bottom: "10%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, #22C55E33 0%, transparent 70%)" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, #38BDF8, transparent)" }} />
                </div>

                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative" }}>
                    {/* nav anchors */}
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "48px" }}>
                        {[
                            { label: "What To Expect", href: "#what-to-expect" },
                            { label: "Live Learning", href: "#live-learning" },
                            { label: "Tools", href: "#tools" },
                            { label: "Fees", href: "#fees" },
                        ].map(({ label, href }) => (
                            <a key={label} href={href} style={{
                                borderRadius: "999px", border: "1px solid var(--border-primary)",
                                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                                padding: "8px 20px", fontSize: "14px", fontWeight: 600,
                                color: "var(--text-muted)", textDecoration: "none",
                                backdropFilter: "blur(8px)", transition: "all 0.2s",
                            }}>{label}</a>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "28px" }}>
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "6px 18px", borderRadius: "999px",
                            border: "1px solid #2563EB60",
                            background: "#2563EB18",
                            color: "#2563EB", fontSize: "13px", fontWeight: 700,
                        }}>
                            <TrendingUp size={16} /> Live Market Training
                        </span>

                        <h1 style={{
                            ...H2, fontSize: "clamp(32px,5vw,60px)",
                            maxWidth: "820px",
                        }}>
                            Master the Indian Stock Market —{" "}
                            <span style={{ color: "#38BDF8" }}>Zero to Pro</span>
                        </h1>

                        <p style={{ fontSize: "18px", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7, margin: 0 }}>
                            A continuous, hands-on journey through NSE &amp; BSE — from reading charts to executing real options strategies — with live trade simulations and no fixed end date.
                        </p>

                        {/* stat cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", width: "100%", maxWidth: "720px" }}>
                            {[
                                { value: "20+", label: "Platforms", sub: "& Tools", color: "#38BDF8" },
                                { value: "∞", label: "Continuous", sub: "Learning", color: "#22C55E" },
                                { value: "₹5,999", label: "One-Time", sub: "Fee", color: "#2563EB" },
                            ].map((s) => (
                                <div key={s.sub} style={{
                                    borderRadius: "16px", border: "1px solid var(--border-primary)",
                                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
                                    padding: "20px 12px", textAlign: "center",
                                    backdropFilter: "blur(8px)",
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                                }}>
                                    <div style={{ fontSize: "32px", fontWeight: 900, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: "13px", marginTop: "8px", color: "var(--text-color)" }}>{s.label}</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{s.sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* enroll form */}
                        <div id="trade-enroll-form" style={{ width: "100%", maxWidth: "480px" }}>
                            <div style={{
                                borderRadius: "20px",
                                border: "1px solid #2563EB45",
                                background: isDark ? "rgba(10,22,40,0.85)" : "rgba(255,255,255,0.92)",
                                padding: "28px 24px",
                                boxShadow: "0 24px 64px rgba(37,99,235,0.18)",
                                backdropFilter: "blur(12px)",
                            }}>
                                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "18px", margin: "0 0 18px" }}>
                                    Start Your Market Journey
                                </h3>
                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {[
                                        { placeholder: "Your Full Name", value: form.name, onChange: (v) => setForm((f) => ({ ...f, name: v })), type: "text" },
                                        { placeholder: "Your Email Id", value: form.email, onChange: (v) => setForm((f) => ({ ...f, email: v })), type: "email" },
                                    ].map((f) => (
                                        <input key={f.placeholder} type={f.type} placeholder={f.placeholder} value={f.value}
                                            onChange={(e) => f.onChange(e.target.value)}
                                            required
                                            style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-color)", color: "var(--text-color)", fontSize: "14px", boxSizing: "border-box" }}
                                        />
                                    ))}
                                    <input
                                        type="tel" placeholder="Your Phone Number" value={form.phone}
                                        onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 10) setForm((f) => ({ ...f, phone: v })); }}
                                        maxLength={10} pattern="[0-9]{10}" required
                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-color)", color: "var(--text-color)", fontSize: "14px", boxSizing: "border-box" }}
                                    />
                                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "13px", color: "#9A93B5", flexWrap: "wrap" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                                            I agree to Terms &amp; Conditions
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                            <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
                                            WhatsApp Updates
                                        </label>
                                    </div>
                                    <button
                                        type="submit" disabled={submitting || isEnrolled}
                                        style={{
                                            width: "100%", padding: "14px",
                                            borderRadius: "10px", border: "none",
                                            background: isEnrolled
                                                ? "linear-gradient(90deg, #16a34a, #22c55e)"
                                                : "linear-gradient(90deg, #2563EB, #38BDF8)",
                                            color: "#fff", fontWeight: 700, fontSize: "16px", cursor: submitting || isEnrolled ? "default" : "pointer",
                                            opacity: submitting ? 0.7 : 1,
                                            boxShadow: "0 4px 18px rgba(37,99,235,0.35)",
                                            transition: "all 0.3s",
                                        }}
                                    >
                                        {submitting ? "Submitting…" : isEnrolled ? "Enrolled ✓" : "Enroll Now — ₹5,999"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── WHAT TO EXPECT ── */}
            <section id="what-to-expect" style={{
                background: isDark
                    ? "linear-gradient(180deg,#060d1a 0%,#080f1e 100%)"
                    : "linear-gradient(180deg,#f8fbff 0%,#eef5ff 100%)",
                padding: "80px 24px",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "56px" }}>
                        <h2 style={H2}>Everything you need to trade confidently</h2>
                        <p style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "16px" }}>
                            A living curriculum that evolves with the market — no fixed timeline, no end date.
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: "20px" }}>
                        {[
                            { title: "Technical Analysis", Icon: CandlestickChart, color: "#38BDF8", points: ["Candlestick Patterns", "Support & Resistance", "RSI", "MACD", "Bollinger Bands"] },
                            { title: "Fundamental Research", Icon: BarChart2, color: "#34D399", points: ["P&L Analysis", "Balance Sheets", "P/E Ratio", "ROE", "Sector Research"] },
                            { title: "Derivatives & F&O", Icon: Layers, color: "#A78BFA", points: ["Futures", "Options", "Greeks", "Hedging"] },
                            { title: "Market Structure", Icon: Globe, color: "#FB923C", points: ["SEBI Regulations", "NSE & BSE", "Nifty 50", "Sensex"] },
                            { title: "Trade Simulations", Icon: Target, color: "#F472B6", points: ["Virtual Portfolios", "Entry & Exit", "Position Sizing"] },
                            { title: "Continuous Learning", Icon: Zap, color: "#FBBF24", points: ["Live Market Updates", "Community Support", "Practical Sessions"] },
                        ].map(({ title, Icon, color, points }) => (
                            <div key={title} style={{
                                borderRadius: "18px",
                                border: "1px solid var(--border-primary)",
                                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
                                padding: "28px 24px",
                                backdropFilter: "blur(8px)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                                transition: "transform 0.25s, border-color 0.25s",
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${color}60`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--border-primary)"; }}
                            >
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "14px",
                                    background: `${color}22`, border: `1px solid ${color}45`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color, marginBottom: "16px",
                                }}>
                                    <Icon size={24} />
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px", margin: "0 0 14px" }}>{title}</h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {points.map((p) => (
                                        <li key={p} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-muted)" }}>
                                            <CheckCircle size={16} style={{ color: "#22C55E", flexShrink: 0 }} />{p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LIVE LEARNING CAROUSEL ── */}
            <section id="live-learning" style={{
                background: isDark ? "#060d1a" : "#f0f7ff",
                padding: "80px 24px",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "52px" }}>
                        <h2 style={H2}>Live Learning in Action</h2>
                        <p style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "16px" }}>
                            Hands-on practical sessions driven by real market conditions — every session is unique
                        </p>
                    </div>
                    <LiveLearningCarousel />
                </div>
            </section>

            {/* ── TOOLS ── */}
            <section id="tools" style={{
                background: isDark
                    ? "linear-gradient(180deg,#080f1e 0%,#060d1a 100%)"
                    : "linear-gradient(180deg,#eef5ff 0%,#f8fbff 100%)",
                padding: "80px 24px",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h2 style={H2}>Platforms &amp; Tools</h2>
                        <p style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "16px" }}>
                            Master 20+ trading platforms, screeners, and analysis tools used by professional traders
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
                        {tools.slice(0, showAllTools ? undefined : 18).map((name) => (
                            <div key={name} style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                padding: "12px 16px", borderRadius: "12px",
                                border: "1px solid #e5e7eb",
                                background: "#ffffff",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                cursor: "default",
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
                            >
                                <div style={{ width: "24px", height: "24px", flexShrink: 0, borderRadius: "6px", overflow: "hidden", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <img src={getToolLogo(name)} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                        onError={(e) => { e.target.src = `https://via.placeholder.com/24?text=${name[0]}`; }} />
                                </div>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.3, flex: 1, wordBreak: "break-word" }}>{name}</span>
                            </div>
                        ))}
                    </div>
                    {tools.length > 18 && (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "28px" }}>
                            <button onClick={() => setShowAllTools(!showAllTools)} style={{
                                padding: "12px 28px", borderRadius: "12px",
                                border: "2px solid #2563EB", color: "#2563EB",
                                background: "transparent", fontWeight: 600, fontSize: "14px", cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2563EB"; }}
                            >
                                {showAllTools ? "Show Less" : "Display All Tools"}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="fees" style={{
                background: isDark ? "#060d1a" : "#f8fbff",
                padding: "80px 24px",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h2 style={H2}>Simple, Transparent Pricing</h2>
                        <p style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "16px" }}>
                            One program, one price — everything included, continuous access
                        </p>
                    </div>
                    <div style={{ maxWidth: "520px", margin: "0 auto" }}>
                        <div style={{
                            position: "relative", overflow: "hidden",
                            borderRadius: "20px", border: "2px solid #2563EB80",
                            background: isDark ? "rgba(10,22,40,0.9)" : "#fff",
                            padding: "36px 32px",
                            boxShadow: "0 28px 80px rgba(37,99,235,0.22)",
                        }}>
                            {/* top gradient bar */}
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#2563EB,#38BDF8,#22C55E)" }} />
                            <div style={{
                                display: "inline-flex", padding: "4px 14px", borderRadius: "999px",
                                background: "#2563EB", color: "#fff", fontSize: "12px", fontWeight: 700,
                                marginBottom: "16px",
                            }}>Most Popular</div>
                            <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Indian Market Trade</h3>
                            <div style={{ fontSize: "48px", fontWeight: 900, color: "#2563EB", marginBottom: "24px" }}>₹5,999</div>
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
                                {[
                                    "Continuous learning — no fixed timeline",
                                    "Live market workshops & sessions",
                                    "20+ trading tools & platforms",
                                    "Technical & fundamental analysis modules",
                                    "Options & F&O strategy sessions",
                                    "Industry-grade trade simulation projects",
                                    "Lifetime access to recordings",
                                ].map((item) => (
                                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px" }}>
                                        <CheckCircle size={20} style={{ color: "#22C55E", flexShrink: 0, marginTop: "2px" }} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/courses/indian-trade-market#trade-enroll-form"
                                onClick={(e) => { e.preventDefault(); document.getElementById("trade-enroll-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: "100%", padding: "14px", borderRadius: "12px",
                                    background: "linear-gradient(90deg,#2563EB,#38BDF8)",
                                    color: "#fff", fontWeight: 700, fontSize: "16px", textDecoration: "none",
                                    boxShadow: "0 4px 18px rgba(37,99,235,0.3)",
                                    transition: "opacity 0.2s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                            >
                                Enroll Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div id="testimonials" style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 24px" }} />
        </div>
    );
}