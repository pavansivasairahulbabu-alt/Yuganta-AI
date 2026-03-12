import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function DsaMlProgramPage() {
  const { theme } = useTheme();
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [agree, setAgree] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openWeek, setOpenWeek] = useState(null);
  const [showAllTools, setShowAllTools] = useState(false);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [instructors, setInstructors] = useState([]);

  const DSA_SLUG = "dsa-ml-program";
  const DSA_TITLE = "Mastering Data Structures & Algorithms";

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
        setLoadingInstructors(true);
        let list = [];
        try {
          const res = await fetch(`${API_URL}/api/courses/instructors/public`);
          if (res.ok) {
            const data = await res.json();
            list = Array.isArray(data) ? data : [];
          }
        } catch {}
        if (!list.length) {
          const coursesRes = await fetch(`${API_URL}/api/courses`);
          if (coursesRes.ok) {
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
        setLoadingInstructors(false);
      }
    })();
  }, []);

  useEffect(() => {
    const fullName = user?.fullName || user?.user?.fullName || "";
    const email = user?.email || user?.user?.email || "";

    if (fullName || email) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || fullName,
        email: prev.email || email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsEnrolled(false);
      return;
    }

    const fetchEnrollmentStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/enrolled`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;
        const data = await response.json();

        const found = Array.isArray(data) && data.some((item) => {
          const course = item?.courseId;
          const title = (course?.title || "").toLowerCase();
          const id = course?._id || "";
          return (
            title.includes("mastering data structures") ||
            title.includes("data structures & algorithms") ||
            id === DSA_SLUG
          );
        });

        setIsEnrolled(found);
      } catch {
        setIsEnrolled(false);
      }
    };

    fetchEnrollmentStatus();
  }, [isAuthenticated, token]);

  const findDsaCourseId = async () => {
    const response = await fetch(`${API_URL}/api/courses`);
    if (!response.ok) return null;
    const courses = await response.json();
    if (!Array.isArray(courses)) return null;

    const match = courses.find((course) =>
      (course?.title || "").toLowerCase().includes("mastering data structures") ||
      (course?.title || "").toLowerCase().includes("data structures & algorithms")
    );

    return match?._id || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEnrolled) {
      toast.success("You are already enrolled in this program.");
      return;
    }
    if (!form.name || !form.phone || !form.email) return;
    if (!agree) {
      toast.error("Please accept Terms & Conditions to continue.");
      return;
    }

    if (!isAuthenticated) {
      toast("Please sign up or log in to enroll.");
      navigate("/signup");
      return;
    }

    setSubmitting(true);
    try {
      const leadRes = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          courseId: DSA_SLUG,
          courseName: DSA_TITLE,
          type: "Enrollment",
          agreeTerms: agree,
          whatsappUpdates: whatsapp,
        }),
      });

      const leadData = await leadRes.json().catch(() => ({}));

      if (leadData?.alreadyEnrolled) {
        setIsEnrolled(true);
        toast.success("Already enrolled with this phone number or email.");
        return;
      }

      const courseId = await findDsaCourseId();
      if (courseId) {
        const enrollRes = await fetch(`${API_URL}/api/users/enroll/${courseId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!enrollRes.ok) {
          const enrollData = await enrollRes.json().catch(() => ({}));
          const message = (enrollData?.message || "").toLowerCase();
          if (message.includes("already enrolled")) {
            toast.success("You are already enrolled in this program.");
          } else {
            toast.error(enrollData?.message || "Enrollment failed. Please try again.");
            return;
          }
        }
      }

      toast.success("Successfully enrolled!");
      setForm((prev) => ({ ...prev, phone: "" }));
      setIsEnrolled(true);
    } catch (err) {
      console.error("Lead submit error", err);
      toast.error("Unable to complete enrollment right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="relative bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] pt-24 md:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6 text-sm">
              <a href="#expect" className="text-[#C7C3D6] hover:text-white font-semibold">What to Expect</a>
              <a href="#curriculum-detailed" className="text-[#C7C3D6] hover:text-white font-semibold">Curriculum</a>
              <a href="#instructors" className="text-[#C7C3D6] hover:text-white font-semibold">Instructors</a>
              <a href="#fees" className="text-[#C7C3D6] hover:text-white font-semibold">Fees</a>
              <a href="#testimonials" className="text-[#C7C3D6] hover:text-white font-semibold">Testimonials</a>
            </div>
            
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-8">
            <h1 className={theme === "light-theme"
              ? "text-4xl md:text-5xl lg:text-6xl font-extrabold leading-snug md:leading-tight text-[var(--text-color)] pb-1 md:pb-2"
              : "text-4xl md:text-5xl lg:text-6xl font-extrabold leading-snug md:leading-tight text-[#60A5FA] pb-1 md:pb-2"
            }>
              Mastering Data Structures & Algorithms
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-[var(--text-muted)] max-w-2xl">
              Build a rock-solid foundation in Data Structures & Algorithms and apply it to 
              real-world problem solving through structured projects and expert mentorship.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="rounded-xl border bg-white dark:bg-[var(--card-bg)] border-[#94BDFB] dark:border-[var(--border-primary)] p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[#3B82F6]">100+</div>
                <div className="mt-3 text-sm text-[var(--text-color)]">DSA Problems</div>
              </div>
              <div className="rounded-xl border bg-white dark:bg-[var(--card-bg)] border-[#94BDFB] dark:border-[var(--border-primary)] p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[#3B82F6]">1:1</div>
                <div className="mt-1 text-sm text-[var(--text-color)]">Mentorship</div>
              </div>
              <div className="rounded-xl border bg-white dark:bg-[var(--card-bg)] border-[#94BDFB] dark:border-[var(--border-primary)] p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[#22C55E]">Job</div>
                <div className="mt-1 text-sm text-[var(--text-color)]">Readiness</div>
              </div>
            </div>

            <div id="pioneer-enroll-form" className="w-full max-w-lg mx-auto">
              <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
                <h3 className="text-xl font-bold mb-4">Enroll for Mastering Data Structures & Algorithms </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your Full Name"
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5"
                    required
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="Your Phone Number"
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5"
                    required
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
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#0EA5E9] text-white rounded-lg font-bold px-6 py-3.5 transition-all duration-300 shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.5)] disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : isEnrolled ? "Enrolled" : "Enroll Now"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How the Program Helps You */}
      <section id="expect" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA] pb-1 md:pb-2"
              }
            >
              How does the Mastering Data Structures & Algorithms Program Help You?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-color)]">DSA Mastery</h3>
              <ul className="list-disc pl-5 space-y-3 text-[var(--text-muted)] leading-relaxed">
                <li>Master arrays, linked lists, stacks, queues, trees, graphs, dynamic programming, and more.</li>
                <li>Develop strong problem-solving skills for coding interviews and competitive programming.</li>
                <li>Learn efficient algorithms and optimize code for performance.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-color)]">Hands-on Coding Practice</h3>
              <ul className="list-disc pl-5 space-y-3 text-[var(--text-muted)] leading-relaxed">
                <li>Solve real-world coding challenges and algorithmic problems.</li>
                <li>Work on structured coding exercises to strengthen logic and analytical thinking.</li>
                <li>Build confidence through consistent practice and guided problem solving.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-color)]">Career Readiness</h3>
              <ul className="list-disc pl-5 space-y-3 text-[var(--text-muted)] leading-relaxed">
                <li>Prepare for technical interviews with curated DSA questions.</li>
                <li>Participate in mock interviews, coding assessments, and code reviews.</li>
                <li>Get mentorship and guidance to showcase your skills effectively.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Curriculum Statistics */}
      <section id="curriculum" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)] mb-4"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA] pb-1 md:pb-2 mb-4"
              }
            >
              Curriculum Statistics
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            <Item title="100+ DSA Problems" desc="From fundamentals to advanced techniques." />
            <Item title="Interview Prep & Patterns" desc="Core patterns, complexity, and real interview drills." />
            <Item title="300+ Hours" desc="Structured learning focused entirely on DSA." />
          </div>
        </div>
      </section>

      {/* Personalized Roadmap */}
      <section id="roadmap" className="bg-[var(--bg-color)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-10">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA] pb-1 md:pb-2"
              }
            >
              Personalized Roadmap
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
              Your ambition + our expertise = your custom path to mastery
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)] bg-[var(--card-bg)] shadow-[0_8px_32px_rgba(37,99,235,0.12)] max-w-6xl mx-auto">
            <img
              src={theme === "light-theme" ? "/DSA-light1.png" : "/DSA-dark1.png"}
              alt="Program Personalized Roadmap"
              className="w-full md:w-[90%] mx-auto h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Detailed Curriculum */}
      <section id="curriculum-detailed" className="bg-[var(--bg-color)] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl font-extrabold text-[#60A5FA] pb-1 md:pb-2"
              }
            >
              Curriculum
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
              Master the foundations of problem-solving with our structured DSA curriculum
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["100+ Problems", "40+ Hours", "50+ Tools", "40+ Assignments"].map((chip) => (
              <span key={chip} className="px-3 py-1.5 rounded-full text-sm border border-[var(--border-primary)] bg-[var(--card-bg)] text-[var(--text-color)]">
                {chip}
              </span>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[
                {
                  title: "WEEK 1: ARRAYS & LINKED LISTS",
                  items: [
                    { text: "Arrays", sub: ["Static", "Dynamic"] },
                    { text: "Linked Lists", sub: ["Single", "Double", "Circular"] }
                  ]
                },
                {
                  title: "WEEK 2: STACKS & QUEUES, SEARCHING",
                  items: [
                    "Stack Operations",
                    { text: "Queue", sub: ["Simple", "Circular", "DeQueue"] },
                    { text: "Searching", sub: ["Linear", "Binary"] }
                  ]
                },
                {
                  title: "WEEK 3: SORTING & HASHING",
                  items: [
                    { text: "Sorting", sub: ["Bubble", "Insertion", "Selection", "Merge", "Quick"] },
                    { text: "Hashtables", sub: ["Hash Functions", "Collision Handling"] }
                  ]
                },
                {
                  title: "WEEK 4: TREES & GRAPHS",
                  items: [
                    { text: "Trees", sub: ["Binary", "AVL", "RedBlack"] },
                    "Graph Representation",
                    { text: "Graph types", sub: ["Directed", "UnDirected"] }
                  ]
                }
              ].map((wk, i) => (
                <details key={i} open={openWeek === i} className="group rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)]">
                  <summary
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenWeek(openWeek === i ? null : i);
                    }}
                    className="cursor-pointer select-none flex items-center justify-between px-4 py-3 font-semibold"
                  >
                    <span className="text-[var(--text-color)]">{wk.title}</span>
                    <span className="ml-4 w-6 h-6 inline-flex items-center justify-center rounded-md border border-[var(--border-primary)]">
                      <svg className="w-3 h-3 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-5">
                    <ul className="space-y-2 list-disc pl-5 text-[var(--text-muted)]">
                      {wk.items.map((it, idx) => {
                        if (typeof it === "string") {
                          return <li key={idx} className="leading-relaxed">{it}</li>;
                        }
                        return (
                          <li key={idx} className="leading-relaxed">
                            {it.text}
                            {Array.isArray(it.sub) && (
                              <ul className="list-disc pl-5 mt-1 space-y-1">
                                {it.sub.map((s, si) => <li key={si}>{s}</li>)}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="tools-dsa" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-10">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA] pb-1 md:pb-2"
              }
            >
              DSA Tools & Frameworks
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
              Libraries and platforms aligned with arrays, stacks/queues, sorting, hashing, trees, and graphs
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-3 text-[var(--text-color)]">Arrays & Linked Lists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {[
                  "Java: ArrayList",
                  "Java: LinkedList",
                ].map((name) => (
                  <div key={name} className="flex items-center justify-center px-3 py-3 md:py-4 rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)] text-sm md:text-base font-semibold text-[var(--text-color)] text-center">
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 text-[var(--text-color)]">Stacks, Queues & Searching</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {[
                  "Java: Deque/Queue",
                  "Java: PriorityQueue"
                ].map((name) => (
                  <div key={name} className="flex items-center justify-center px-3 py-3 md:py-4 rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)] text-sm md:text-base font-semibold text-[var(--text-color)] text-center">
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              {showAllTools && (
                <>
                  <h3 className="text-lg font-bold mb-3 text-[var(--text-color)]">Sorting & Hashing</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {[
                      "Java: Arrays.sort",
                      "Java: Collections.sort",
                      "Java: HashMap/HashSet"
                    ].map((name) => (
                      <div key={name} className="flex items-center justify-center px-3 py-3 md:py-4 rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)] text-sm md:text-base font-semibold text-[var(--text-color)] text-center">
                        {name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {showAllTools && (
              <>
                {/* Trees & Graphs */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-[var(--text-color)]">Trees & Graphs</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {[
                      "Set/map",
                      "binarytree",
                      "Adjacency List/Matrix Utils"
                    ].map((name) => (
                      <div key={name} className="flex items-center justify-center px-3 py-3 md:py-4 rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)] text-sm md:text-base font-semibold text-[var(--text-color)] text-center">
                        {name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice & Dev */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-[var(--text-color)]">Practice & Dev</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {[
                      "LeetCode",
                      "HackerRank",
                      "Codeforces",
                      "CSES",
                      "AtCoder",
                      "GeeksforGeeks",
                      "VS Code Debugger",
                      "GDB/LLDB",
                      "pytest/JUnit/Catch2"
                    ].map((name) => (
                      <div key={name} className="flex items-center justify-center px-3 py-3 md:py-4 rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)] text-sm md:text-base font-semibold text-[var(--text-color)] text-center">
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => setShowAllTools(!showAllTools)}
                className="px-6 py-3 rounded-xl border-2 border-[#2563EB] text-[#2563EB] font-semibold hover:bg-[#2563EB] hover:text-white transition-all"
              >
                {showAllTools ? "Show Less" : "Display All Tools"}
              </button>
            </div>
          </div>
        </div>
      </section>
      <section id="instructors" className="instructors-page py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
          <div className="space-y-3 text-center">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
              }
            >
              Real Experience, Real Insights: Your Expert Mentors
            </h2>
            <p className="text-sm md:text-base text-[var(--text-muted)]">Tap into decades of combined industry experience</p>
          </div>
          
          {loadingInstructors ? (
            <div className="text-center py-10">
              <div className="inline-block w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : instructors.length === 0 ? (
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
                const gradients = [["#3B82F6","#06B6D4"],["#2563EB","#3B82F6"],["#0EA5E9","#2563EB"],["#06B6D4","#3B82F6"],["#1D4ED8","#06B6D4"],["#0284C7","#3B82F6"]];
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
                            <div className="w-full flex items-center justify-center text-white text-5xl font-bold tracking-wide" style={{ borderRadius: "14px", aspectRatio: "4/3", background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 4px 20px rgba(0,0,0,0.22)` }}>
                              {initials}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col items-center px-5 pt-4 pb-4">
                          <h3 className="ins-text-primary text-[18px] font-bold text-center leading-snug mb-1 tracking-tight">
                            {ins.name || "Instructor"}
                          </h3>
                          <p className="text-[13px] font-semibold mb-3 text-center" style={{ color: c1 }}>
                            {expertiseTags[0] || "Instructor"}
                          </p>
                          {ins.company && (
                            <div className="flex items-center gap-1.5 mb-3">
                              <svg className="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="ins-company text-[13px] font-medium">{ins.company}</span>
                            </div>
                          )}
                          {expertiseTags.slice(1, 3).length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                              {expertiseTags.slice(1, 3).map((tag, ti) => (
                                <span key={ti} className="ins-badge text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {ins.experience && (
                            <div className="ins-exp-row flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium mt-auto mb-2">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {ins.experience}
                            </div>
                          )}
                          <div className="mt-auto flex items-center justify-center gap-1.5 opacity-40">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="ins-text-muted text-[10px] font-medium tracking-wide uppercase">View Bio</span>
                          </div>
                        </div>
                      </div>
                      <div className="ins-flip-back ins-card-back-face flex flex-col h-full">
                        <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
                        <div className="flex-1 flex flex-col px-7 py-6 overflow-hidden">
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
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="ins-text-primary text-sm font-bold leading-tight truncate">{ins.name || "Instructor"}</p>
                              <p className="ins-company text-xs truncate">{expertiseTags[0] || "Instructor"}</p>
                            </div>
                          </div>
                          <p className="ins-back-label text-[10px] font-bold uppercase tracking-widest mb-2">About</p>
                          <p className="ins-bio text-[13px] leading-relaxed line-clamp-5 flex-1">
                            {ins.bio || ins.description || "No bio available for this instructor yet."}
                          </p>
                          {ins.experience && (
                            <div className="ins-exp-row flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium mt-3">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {ins.experience}
                            </div>
                          )}
                        </div>
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
      </section>
      {/* Fees */}
      <section id="fees" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA] pb-1 md:pb-2"
              }
            >
              Choose the Right AI Program for You
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
              Unlock your AI potential with the GenAI program designed for your growth journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto justify-items-center">
            <Plan
              name="Mastering Data Structures & Algorithms"
              price="₹5,000"
              ctaHref={isAuthenticated ? "#pioneer-enroll-form" : "/signup"}
              bullets={[
                "6 weeks Structured Learning",
                "100+ DSA Problems",
                "40+ Hours of Immersive Learning",
                "Interview Prep",
                "Mentorship & Reviews",
              ]}
            />
            <Plan
              name="Agentic AI Pioneer program"
              price="₹12,000"
              ctaHref="/courses/agentic-ai-pioneer-program#pioneer-enroll-form"
              bullets={[
                "4 Months of Power Learning",
                "25+ Deep-Dive Mentorship Sessions",
                "150+ Hours of Hands-On Workshops",
                "10+ Industry-Grade Projects",
                "300+ Hours of Structured Curriculum",
                "AV Certificate | Fractal Certificate | WSU Certificate",
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Item({ title, desc }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB] to-[#38BDF8]" />
      </span>
      <div>
        <h3 className="text-xl font-semibold text-[var(--text-color)]">{title}</h3>
        <p className="text-[var(--text-muted)] mt-1">{desc}</p>
      </div>
    </div>
  );
}

function Plan({ name, price, bullets, ctaHref = "/signup" }) {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 md:p-8 shadow-[0_8px_32px_rgba(139,92,246,0.12)] mx-auto w-full max-w-md">
      <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mb-2">{name}</h3>
      <div className="text-4xl md:text-5xl font-extrabold mb-6 text-[var(--text-color)]">{price}</div>
      <ul className="space-y-3 text-[var(--text-color)]">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center mt-1">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        {ctaHref.startsWith("#") ? (
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#0EA5E9] text-white font-semibold py-3 transition-all"
          >
            Enroll Now
          </a>
        ) : (
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#0EA5E9] text-white font-semibold py-3 transition-all"
          >
            Enroll Now
          </Link>
        )}
      </div>
    </div>
  );
}
