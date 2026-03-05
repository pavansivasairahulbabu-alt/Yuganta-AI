import { useEffect, useState } from "react";
import API_URL from "../config/api";

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Try fetching instructors (admin endpoint, optional token)
        try {
          const adminToken = localStorage.getItem("adminToken");
          const res = await fetch(`${API_URL}/api/admin/instructors`, {
            headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            list = Array.isArray(data) ? data : [];
          }
        } catch { void 0; }

        // If no instructors, try mentors list (admin endpoint, optional token)
        if (!list.length) {
          try {
            const adminToken = localStorage.getItem("adminToken");
            const res = await fetch(`${API_URL}/api/admin/mentors`, {
              headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
            });
            if (res.ok) {
              const data = await res.json();
              list = Array.isArray(data) ? data : [];
            }
          } catch { void 0; }
        }

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
        }));
        setInstructors(normalized);
      } catch {
        setError("Failed to load instructors");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-[#9A93B5]">Loading instructors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center py-20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#8B5CF6] to-[#EC4899] rounded-full"></div>
            <p className="text-sm font-semibold text-[#A855F7]">Explore</p>
          </div>
          <h1 className="text-5xl font-bold text-[var(--text-color)]">Instructors</h1>
          <p className="text-lg text-[var(--text-color)]">Meet our instructors and mentors</p>
        </div>

        <style>
          {`
            .flip-card { position: relative; perspective: 1000px; -webkit-perspective: 1000px; }
            .flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; -webkit-transform-style: preserve-3d; will-change: transform; }
            .flip-card:hover .flip-inner { transform: rotateY(180deg); }
            .flip-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            .flip-front { transform: rotateY(0deg); }
            .flip-back { transform: rotateY(180deg); }
          `}
        </style>

        {instructors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9A93B5]">No instructors available</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-24 sm:mt-20 md:mt-24">
          {instructors.map((ins) => (
            <div
              key={ins._id || ins.email || ins.name}
              className="flip-card relative rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] shadow-[0_8px_32px_rgba(139,92,246,0.1)]"
            >
              <div className="flip-inner rounded-2xl min-h-[360px]">
                <div className="flip-face flip-front p-6 bg-[var(--card-bg)] relative pt-52">
                  {ins.photo ? (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-black shadow-lg bg-gray-200 z-10">
                      <img
                        src={resolveImageUrl(ins.photo)}
                        alt={ins.name || "Instructor"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, ins.photo)}
                      />
                    </div>
                  ) : (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-white text-3xl font-bold z-10">
                      {(ins.name || "I").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-[var(--text-color)]">{ins.name || "Instructor"}</h3>
                    <p className="text-sm text-[#A855F7] font-medium">
                      {ins.expertise || ins.designation || "Instructor"}
                      {ins.company ? ` • ${ins.company}` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-[#9A93B5]">
                    <p>Email: <span className="text-[var(--text-color)]">{ins.email || "—"}</span></p>
                  </div>
                </div>

                <div className="flip-face flip-back p-6 bg-[var(--card-bg)] border-t border-[var(--border-primary)]">
                  <h4 className="text-sm font-semibold text-[var(--text-color)] mb-2">About</h4>
                  <p className="text-sm text-[#9A93B5]">
                    {ins.bio || ins.description || "No bio available."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
