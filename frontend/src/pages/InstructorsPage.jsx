import { useEffect, useState } from "react";
import API_URL from "../config/api";

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  const resolveDriveId = (raw) => {
    if (!raw) return null;
    let s = String(raw).trim();
    s = s.replace(/^[<\[\(\s'"`]+|[>\]\)\s'"`]+$/g, "");
    try {
      const u = new URL(s);
      if (!/drive\.google\.com|docs\.google\.com/i.test(u.hostname)) return null;
      const fromParam = u.searchParams.get("id");
      if (fromParam) return fromParam;
    } catch {}
    const m1 = s.match(/\/file\/d\/([^/]+)/);
    if (m1 && m1[1]) return m1[1];
    const m2 = s.match(/[?&]id=([^&]+)/);
    if (m2 && m2[1]) return m2[1];
    return null;
  };

  const resolveImageUrl = (url) => {
    if (!url) return "";
    let s = String(url).trim();
    s = s.replace(/^[<\[\(\s'"`]+|[>\]\)\s'"`]+$/g, "");
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
      if (step === "0") {
        img.dataset.fallbackStep = "1";
        img.src = `https://drive.google.com/uc?id=${id}`;
        return;
      }
      if (step === "1") {
        img.dataset.fallbackStep = "2";
        img.src = `https://lh3.googleusercontent.com/d/${id}=s800`;
        return;
      }
    }
    img.dataset.fallbackStep = "done";
    img.src = "https://via.placeholder.com/160?text=Instructor";
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let list = [];

        // Public instructors endpoint (no admin token required)
        try {
          const res = await fetch(`${API_URL}/api/courses/instructors/public`);
          if (res.ok) {
            const data = await res.json();
            list = Array.isArray(data) ? data : [];
          }
        } catch { void 0; }

        // Fallback: derive instructors from courses (public endpoint)
        if (!list.length) {
          const coursesRes = await fetch(`${API_URL}/api/courses`);
          if (!coursesRes.ok) {
            throw new Error("Failed to fetch courses");
          }
          const courses = await coursesRes.json();
          const byInstructor = new Map();
          for (const c of courses) {
            const key = c.instructorId || c.instructor;
            if (!key) continue;
            if (!byInstructor.has(key)) {
              byInstructor.set(key, {
                _id: c.instructorId || key,
                name: c.instructor,
                expertise: c.category || "Instructor",
                email: "",
                bio: "",
                description: "",
              });
            }
          }
          list = Array.from(byInstructor.values());
        }

        const normalized = list.map((i) => ({
          ...i,
          photo: i.photo || i.photoUrl || i.photoURL || i.avatar || i.image || i.imageUrl || i.picture || "",
          experience: i.experience || "",
        }));
        setInstructors(normalized);
      } catch {
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="instructors-page min-h-screen pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm ins-text-muted">Loading instructors...</p>
          </div>
        </div>
      </div>
    );
  }

  

  return (
    <div className="instructors-page min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#3B82F6] to-[#06B6D4] rounded-full"></div>
            <p className="text-sm font-semibold text-[#60A5FA] uppercase tracking-wider">Our Team</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold ins-text-primary">
            Meet the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]">Instructors</span>
          </h1>
          <p className="text-lg ins-text-secondary max-w-xl">
            Learn from industry experts and experienced mentors who are passionate about your growth.
          </p>
        </div>

        <style>{`
          /* ── Blue theme scoped to instructors page ── */

          /* Dark mode */
          .instructors-page {
            background: #060d1a;
            color: #e8f0fe;
          }
          .instructors-page .ins-text-primary  { color: #e8f0fe; }
          .instructors-page .ins-text-secondary { color: #93c5fd; }
          .instructors-page .ins-text-muted     { color: #60a5fa; }
          .instructors-page .ins-card-face {
            background: linear-gradient(175deg, #0e1e38 0%, #080f1e 100%);
            border: 1px solid rgba(59,130,246,0.22);
            box-shadow: inset 0 1px 0 rgba(99,179,246,0.07);
          }
          .instructors-page .ins-card-back-face {
            background: linear-gradient(145deg, #0d1f3c, #0b1628);
            border: 1px solid rgba(59,130,246,0.35);
          }
          .instructors-page .ins-divider { background: rgba(59,130,246,0.2); }
          .instructors-page .ins-badge {
            background: rgba(59,130,246,0.15);
            border: 1px solid rgba(59,130,246,0.35);
            color: #60a5fa;
          }
          .instructors-page .ins-email { color: #93c5fd; }
          .instructors-page .ins-email:hover { color: #60a5fa; }
          .instructors-page .ins-company { color: #60a5fa; }
          .instructors-page .ins-email-icon { color: #3b82f6; }
          .instructors-page .ins-bio { color: #bfdbfe; }
          .instructors-page .ins-back-label { color: #93c5fd; }
          .instructors-page .ins-mailto-btn {
            background: rgba(59,130,246,0.15);
            border: 1px solid rgba(59,130,246,0.4);
            color: #93c5fd;
          }
          .instructors-page .ins-mailto-btn:hover {
            background: rgba(59,130,246,0.28);
            border-color: rgba(59,130,246,0.7);
            color: #e8f0fe;
          }

          /* Light mode */
          .light-theme .instructors-page {
            background: #eff6ff;
            color: #1e3a5f;
          }
          .light-theme .instructors-page .ins-text-primary  { color: #1e3a5f; }
          .light-theme .instructors-page .ins-text-secondary { color: #2563eb; }
          .light-theme .instructors-page .ins-text-muted    { color: #3b82f6; }
          .light-theme .instructors-page .ins-card-face {
            background: linear-gradient(175deg, #ffffff 0%, #f5f9ff 100%);
            border: 1px solid rgba(37,99,235,0.16);
            box-shadow: 0 4px 28px rgba(37,99,235,0.10), inset 0 1px 0 rgba(255,255,255,0.9);
          }
          .light-theme .instructors-page .ins-card-back-face {
            background: linear-gradient(145deg, #dbeafe, #eff6ff);
            border: 1px solid rgba(37,99,235,0.25);
          }
          .light-theme .instructors-page .ins-divider { background: rgba(37,99,235,0.15); }
          .light-theme .instructors-page .ins-badge {
            background: rgba(59,130,246,0.1);
            border: 1px solid rgba(59,130,246,0.28);
            color: #2563eb;
          }
          .light-theme .instructors-page .ins-email { color: #2563eb; }
          .light-theme .instructors-page .ins-email:hover { color: #1d4ed8; }
          .light-theme .instructors-page .ins-company { color: #3b82f6; }
          .light-theme .instructors-page .ins-email-icon { color: #2563eb; }
          .light-theme .instructors-page .ins-bio { color: #1e3a5f; }
          .light-theme .instructors-page .ins-back-label { color: #2563eb; }
          .light-theme .instructors-page .ins-experience {
            color: #2563eb;
          }
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
          .light-theme .instructors-page .ins-mailto-btn:hover {
            background: rgba(37,99,235,0.2);
            border-color: rgba(37,99,235,0.55);
            color: #1e3a5f;
          }

          /* ── 3-D Flip card ── */
          .ins-flip-wrapper {
            perspective: 1100px;
            height: 460px;
          }
          .ins-flip-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1);
            cursor: pointer;
          }
          .ins-flip-wrapper:hover .ins-flip-inner {
            transform: rotateY(180deg);
          }
          .ins-flip-front,
          .ins-flip-back {
            position: absolute;
            inset: 0;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            border-radius: 20px;
            overflow: hidden;
          }
          .ins-flip-back {
            transform: rotateY(180deg);
          }
          /* subtle scale on hover wrapper */
          .ins-flip-wrapper:hover {
            filter: drop-shadow(0 20px 40px rgba(59,130,246,0.22));
          }
        `}</style>

        {instructors.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[rgba(59,130,246,0.15)] to-[rgba(6,182,212,0.1)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-[#3B82F6] opacity-60" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM16 15v2h2v-2zM4 15v2H2v-2z" />
              </svg>
            </div>
            <p className="ins-text-muted font-medium">No instructors available yet</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map((ins, idx) => {
            const initials = (ins.name || "I").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const gradients = [
              ["#3B82F6","#06B6D4"],
              ["#2563EB","#3B82F6"],
              ["#0EA5E9","#2563EB"],
              ["#06B6D4","#3B82F6"],
              ["#1D4ED8","#06B6D4"],
              ["#0284C7","#3B82F6"],
            ];
            const [c1, c2] = gradients[idx % gradients.length];
            const grad = `from-[${c1}] to-[${c2}]`;
            const expertiseTags = (ins.expertise || ins.designation || "Instructor").split(/[,/]/).map(s => s.trim()).filter(Boolean);
            return (
              <div key={ins._id || ins.email || ins.name} className="ins-flip-wrapper">
                <div className="ins-flip-inner">

                  {/* ── FRONT ── */}
                  <div className="ins-flip-front ins-card-face flex flex-col h-full relative overflow-hidden">

                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px] z-10" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />

                    {/* Large photo area */}
                    <div className="px-5 pt-6 pb-0 flex justify-center">
                      {ins.photo ? (
                        <div
                          className="w-full overflow-hidden"
                          style={{ borderRadius: "14px", aspectRatio: "4/3", boxShadow: `0 4px 20px rgba(0,0,0,0.22), 0 0 0 1px ${c1}22` }}
                        >
                          <img
                            src={resolveImageUrl(ins.photo)}
                            alt={ins.name || "Instructor"}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: "center 15%" }}
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, ins.photo)}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full flex items-center justify-center text-white text-5xl font-bold tracking-wide"
                          style={{ borderRadius: "14px", aspectRatio: "4/3", background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 4px 20px rgba(0,0,0,0.22)` }}
                        >
                          {initials}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col items-center px-5 pt-4 pb-4">

                      {/* Name */}
                      <h3 className="ins-text-primary text-[18px] font-bold text-center leading-snug mb-1 tracking-tight">
                        {ins.name || "Instructor"}
                      </h3>

                      {/* Primary expertise */}
                      <p className="text-[13px] font-semibold mb-3 text-center" style={{ color: c1 }}>
                        {expertiseTags[0] || "Instructor"}
                      </p>

                      {/* Company */}
                      {ins.company && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <svg className="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="ins-company text-[13px] font-medium">{ins.company}</span>
                        </div>
                      )}

                      {/* Expertise tags */}
                      {expertiseTags.slice(1, 3).length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                          {expertiseTags.slice(1, 3).map((tag, ti) => (
                            <span key={ti} className="ins-badge text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Experience */}
                      {ins.experience && (
                        <div className="ins-exp-row flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium mt-auto mb-2">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {ins.experience}
                        </div>
                      )}

                      {/* Flip hint */}
                      <div className="mt-auto flex items-center justify-center gap-1.5 opacity-40">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="ins-text-muted text-[10px] font-medium tracking-wide uppercase">View Bio</span>
                      </div>
                    </div>
                  </div>

                  {/* ── BACK ── */}
                  <div className="ins-flip-back ins-card-back-face flex flex-col h-full">
                    {/* Top accent bar */}
                    <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />

                    <div className="flex-1 flex flex-col px-7 py-6 overflow-hidden">
                      {/* Mini profile row */}
                      <div className="flex items-center gap-3 mb-5">
                        {ins.photo ? (
                          <img
                            src={resolveImageUrl(ins.photo)}
                            alt={ins.name}
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                            style={{ boxShadow: `0 0 0 2px ${c1}66` }}
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, ins.photo)}
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
                            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                          >
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="ins-text-primary text-sm font-bold leading-tight truncate">{ins.name || "Instructor"}</p>
                          <p className="ins-company text-xs truncate">{expertiseTags[0] || "Instructor"}</p>
                        </div>
                      </div>

                      {/* About label */}
                      <p className="ins-back-label text-[10px] font-bold uppercase tracking-widest mb-2">About</p>

                      {/* Bio */}
                      <p className="ins-bio text-[13px] leading-relaxed line-clamp-5 flex-1">
                        {ins.bio || ins.description || "No bio available for this instructor yet."}
                      </p>

                      {/* Experience */}
                      {ins.experience && (
                        <div className="ins-exp-row flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium mt-3">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {ins.experience}
                        </div>
                      )}


                    </div>

                    {/* Status */}
                    {ins.active === false && (
                      <div className="absolute top-4 right-4 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm text-blue-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                        Inactive
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
