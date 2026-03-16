import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { LayoutGrid, Clock, Code2, ClipboardList, Users, CheckCircle } from "lucide-react";

export default function AgenticAICrashCoursePage() {
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
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);

  const getToolLogo = (name) => {
    const logos = {
      "ChatGPT": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
      "wordware": "https://hdrobots.com/wp-content/uploads/2024/10/wordware-logo.webp",
      "LangChain": "https://avatars.githubusercontent.com/u/126733545?s=200&v=4",
      "CrewAI": "https://avatars.githubusercontent.com/u/153205166?s=200&v=4",
      "LangGraph": "https://avatars.githubusercontent.com/u/126733545?s=200&v=4",
      "AutoGen": "https://avatars.githubusercontent.com/u/6154722?s=200&v=4",
      "AutoGen Studio": "https://avatars.githubusercontent.com/u/6154722?s=200&v=4",
      "OpenAI": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS3PwERLLNB9XKFpeMgAMPxl5VvN3HRJnXQQ&s",
      "Python": "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
      "SQLite": "https://upload.wikimedia.org/wikipedia/commons/3/38/SQLite370.svg",
      "Meta Llama": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
      "Gemini": "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/gemini-color.png",
      "OpenAI GPT-4": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS3PwERLLNB9XKFpeMgAMPxl5VvN3HRJnXQQ&s",
      "Chroma": "https://avatars.githubusercontent.com/u/104526806?s=200&v=4",
      "Redis": "https://logowik.com/content/uploads/images/redis.jpg",
      "Hugging Face": "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
      "PEFT": "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
      "huggingface_hub": "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
      "LlamaIndex": "https://avatars.githubusercontent.com/u/128362615?s=200&v=4",
      "Accelerate": "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
      "Diffusers": "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
      "OpenAI Gym": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS3PwERLLNB9XKFpeMgAMPxl5VvN3HRJnXQQ&s",
      "DALL·E": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS3PwERLLNB9XKFpeMgAMPxl5VvN3HRJnXQQ&s",
      "harness": "https://avatars.githubusercontent.com/u/41344499?s=200&v=4",
      "PyTorch": "https://upload.wikimedia.org/wikipedia/commons/1/10/PyTorch_logo_icon.svg",
      "CLIPTokenizer": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS3PwERLLNB9XKFpeMgAMPxl5VvN3HRJnXQQ&s",
      "Civitai": "https://avatars.githubusercontent.com/u/121852438?s=200&v=4",
      "stability.ai": "https://avatars.githubusercontent.com/u/107931326?s=200&v=4",
      "BlueWillow": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn49NcF3W5JfNeokxhH5ssl80W5oHiZbMwMQ&s",
      "Designer": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVWS37WKwsNDmo8HcyhCbJjsHDSUSfObnr6A&s",
      "Lexica": "https://lexica.art/favicon.ico",
      "Chainlit": "https://avatars.githubusercontent.com/u/127344265?s=200&v=4",
      "Whisper": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS3PwERLLNB9XKFpeMgAMPxl5VvN3HRJnXQQ&s",
      "Docker": "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png",
      "Claude": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Claude_AI_symbol.svg/1280px-Claude_AI_symbol.svg.png",
      "n8n": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8b13FupbJiqRDcYQbK4BfEcAJ6S7eA8I5oQ&s",
      "gradio": "https://avatars.githubusercontent.com/u/51063788?s=200&v=4",
      "Pinecone": "https://avatars.githubusercontent.com/u/64010323?s=200&v=4",
      "tavily": "https://tavily.com/favicon.ico",
      "Locust": "https://avatars.githubusercontent.com/u/672004?s=200&v=4",
      "kubernetes": "https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg",
      "Langfuse": "https://avatars.githubusercontent.com/u/132148705?s=200&v=4",
      "Adobe Firefly": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR87SW6V5XE57Vgz6pce2mG2HpocuMsFiZxtw&s",
      "Unstructured": "https://avatars.githubusercontent.com/u/111306385?s=200&v=4",
      "ChatGPT API": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
      "DALL·E 2": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS3PwERLLNB9XKFpeMgAMPxl5VvN3HRJnXQQ&s",
      "Mistral AI": "https://avatars.githubusercontent.com/u/132141527?s=200&v=4",
      "BentoML": "https://avatars.githubusercontent.com/u/45155100?s=200&v=4",
      "Weights & Biases": "https://avatars.githubusercontent.com/u/26401354?s=200&v=4",
      "Midjourney": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Midjourney_Emblem.svg",
      "Cohere": "https://avatars.githubusercontent.com/u/79015033?s=200&v=4",
      "LangSmith": "https://avatars.githubusercontent.com/u/126733545?s=200&v=4"
    };
    return logos[name] || `https://via.placeholder.com/24?text=${name[0]}`;
  };

  const AGENTIC_SLUG = "agentic-ai-crash-course-page";
  const AGENTIC_TITLE = "AgenticAI Crash Course Page";

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
        // Public instructors endpoint first (no token required)
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
          return title.includes("agenticai crash course page") || title.includes("agentic ai crash course") || id === AGENTIC_SLUG;
        });

        setIsEnrolled(found);
      } catch {
        setIsEnrolled(false);
      }
    };

    fetchEnrollmentStatus();
  }, [isAuthenticated, token]);

  const findAgenticCourseId = async () => {
    const response = await fetch(`${API_URL}/api/courses`);
    if (!response.ok) return null;
    const courses = await response.json();
    if (!Array.isArray(courses)) return null;

    const match = courses.find((course) =>
      (course?.title || "").toLowerCase().includes("agenticai crash course page") ||
      (course?.title || "").toLowerCase().includes("agentic ai crash course")
    );

    return match?._id || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEnrolled) {
      toast.error("You are already enrolled in this program.");
      return;
    }
    if (!form.name || !form.phone || !form.email) return;
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
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
          courseId: AGENTIC_SLUG,
          courseName: AGENTIC_TITLE,
          type: "Enrollment",
          agreeTerms: agree,
          whatsappUpdates: whatsapp,
        }),
      });

      const leadData = await leadRes.json().catch(() => ({}));

      if (leadData?.alreadyEnrolled) {
        setForm({ name: "", phone: "", email: "" });
        setIsEnrolled(true);
        toast.error("Already enrolled with this phone number or email.");
        return;
      }

      // Persist enrollment to user account so button can reliably show "Enrolled" for this user
      const courseId = await findAgenticCourseId();
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
            toast.error("You are already enrolled in this program.");
          } else {
            console.warn("Enrollment failed:", enrollData?.message || enrollRes.statusText);
            toast.error(enrollData?.message || "Enrollment failed. Please try again.");
          }
        } else {
          toast.success("Successfully enrolled!");
          try {
            const mentorRes = await fetch(`${API_URL}/api/users/assigned-mentor`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (mentorRes.ok) {
              const mentor = await mentorRes.json();
              const d = new Date();
              d.setDate(d.getDate() + 8);
              const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const time = "7:00pm";
              await fetch(`${API_URL}/api/mentorship-sessions`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title: "First Mentorship",
                  mentorId: mentor?._id,
                  date: dateStr,
                  time,
                  notes: "Auto-created on enrollment",
                }),
              });
            }
          } catch {}
        }
      }

      setForm({ name: "", phone: "", email: "" });
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
              <a href="#expect" className="text-[var(--text-muted)] hover:text-[#1D4ED8] font-semibold transition-colors duration-200">What to Expect</a>
              <a href="#curriculum" className="text-[var(--text-muted)] hover:text-[#1D4ED8] font-semibold transition-colors duration-200">Curriculum</a>
              <a href="#instructors" className="text-[var(--text-muted)] hover:text-[#1D4ED8] font-semibold transition-colors duration-200">Instructors</a>
              <a href="#fees" className="text-[var(--text-muted)] hover:text-[#1D4ED8] font-semibold transition-colors duration-200">Fees</a>
               </div>
         
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-8">
            <h1 className={theme === "light-theme"
              ? "text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--text-color)]"
              : "text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#60A5FA]"
            }>
              AgenticAI Crash Course
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl">
              A structured journey to master agentic AI systems, from core foundations to
              production-grade autonomous agents, with hands-on mentorship and capstone projects.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-white dark:bg-[var(--card-bg)] border-[#94BDFB] dark:border-[var(--border-primary)] p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[#3B82F6]">30+</div>
                <div className="mt-3 text-sm text-[var(--text-color)]">Hours of Immersive</div>
                <div className="mt-3 text-sm text-[var(--text-color)]">Learning</div>
              </div>
              <div className="rounded-xl border bg-white dark:bg-[var(--card-bg)] border-[#94BDFB] dark:border-[var(--border-primary)] p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[#3B82F6]">1:1</div>
                <div className="mt-1 text-sm text-[var(--text-color)]">Live Weekly</div>
                <div className="mt-1 text-sm text-[var(--text-color)]">Mentorship</div>
              </div>
              <div className="rounded-xl border bg-white dark:bg-[var(--card-bg)] border-[#94BDFB] dark:border-[var(--border-primary)] p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[#F59E0B]">100%</div>
                <div className="mt-1 text-sm text-[var(--text-color)]">Placement Assistance</div>
              </div>
              <div className="rounded-xl border bg-white dark:bg-[var(--card-bg)] border-[#94BDFB] dark:border-[var(--border-primary)] p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold text-[#22C55E]">10+</div>
                <div className="mt-1 text-sm text-[var(--text-color)]">Hours of Live Workshops</div>
                <div className="mt-1 text-sm text-[var(--text-color)]">and</div>
                <div className="mt-1 text-sm text-[var(--text-color)]">Recordings</div>
              </div>
            </div>

            <div id="agentic-enroll-form" className="w-full max-w-lg">
              <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
                <h3 className="text-xl font-bold mb-4">Become a GenAI and Agentic AI Expert: Start Now</h3>
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
                    maxLength={10}
                    pattern="[0-9]{10}"
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
                    disabled={submitting || isEnrolled}
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
      <section id="expect" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
              }
            >
              How does the AgenticAI Crash Course Help You?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-color)]">
                80+ Hours of Immersive Learning
              </h3>
              <ul className="list-disc pl-5 space-y-3 text-[var(--text-muted)] leading-relaxed">
                <li>Master advanced Agentic AI systems with LangChain, LangGraph, and CrewAI through hands-on projects.</li>
                <li>Hands-on mastery of modern frameworks, tools, and best practices.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-color)]">
                10+ Industry-Aligned Projects
              </h3>
              <ul className="list-disc pl-5 space-y-3 text-[var(--text-muted)] leading-relaxed">
                <li>Real-world projects that connect theory with practice.</li>
                <li>Diverse challenges designed to turn knowledge into expertise.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-color)]">
                1:1 Expert Mentorship
              </h3>
              <ul className="list-disc pl-5 space-y-3 text-[var(--text-muted)] leading-relaxed">
                <li>Gain insights and feedback from seasoned professionals.</li>
                <li>Accelerate progress with a personalized success roadmap.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section id="curriculum-stats" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
              }
            >
              Curriculum Statistics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
                <LayoutGrid className="w-6 h-6 text-[var(--text-color)]" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-color)]"> Projects</h3>
                <p className="text-[var(--text-muted)] mt-1">
                  Hands-on learning with industry-relevant challenges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
                <Clock className="w-6 h-6 text-[var(--text-color)]" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-color)]">30+ Hours</h3>
                <p className="text-[var(--text-muted)] mt-1">
                  In-depth GenAI and Agentic AI learning to transform your career.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
                <Code2 className="w-6 h-6 text-[var(--text-color)]" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-color)]">40+ Tools & Libraries</h3>
                <p className="text-[var(--text-muted)] mt-1">
                  Develop expertise in essential frameworks, SDKs, and platforms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
                <ClipboardList className="w-6 h-6 text-[var(--text-color)]" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-color)]">30+ Assignments</h3>
                <p className="text-[var(--text-muted)] mt-1">
                  Structured practice to turn knowledge into action.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
                <Users className="w-6 h-6 text-[var(--text-color)]" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-color)]">Mentorship Sessions</h3>
                <p className="text-[var(--text-muted)] mt-1">
                  1:1 live guidance from GenAI and Agentic AI experts.
                </p>
              </div>
            </div>
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
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
              }
            >
              Personalized Roadmap
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
              Your ambition + our expertise = your custom path to mastery
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)] bg-[var(--card-bg)] shadow-[0_8px_32px_rgba(139,92,246,0.12)]">
            <img
              src={theme === "light-theme" ? "/roadmap-light.png" : "/roadmap-dark.png"}
              alt="Program Personalized Roadmap"
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>
      {/* Curriculum */}
      <section id="curriculum" className="bg-[var(--bg-color)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-10">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
              }
            >
              Curriculum
            </h2>
            
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[" Projects","30+ Hours","40+ Tools","30+ Assignments"].map((chip) => (
              <span key={chip} className="px-3 py-1.5 rounded-full text-sm border border-[var(--border-primary)] bg-[var(--card-bg)]">
                {chip}
              </span>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[
                {
                  title: "WEEK 1: Introduction to LangChain and RAG Essentials",
                  items: [
                    "Introduction to the LangChain Ecosystem",
                    "Essentials of LCEL",
                    "Introduction to RAG Systems",
                    { text: "Building Retrieval Systems", sub: ["Data Loading, Splitting & Chunking"] },
                    "Implementing Vector Databases and Retrievers"
                  ]
                },
                {
                  title: "WEEK 2: Agentic AI System Architectures & Design Patterns",
                  items: [
                    "Introduction to Agentic Design Patterns",
                    "The Reflection Pattern",
                    "The Tool Use Pattern",
                    "The Planning Pattern",
                    "The Multi Agent Pattern"
                  ]
                },
                {
                  title: "WEEK 3: Building Advanced AI Agents with LangGraph",
                  items: [
                    "Core Components of Agentic Systems & LangGraph",
                    "Building Tool Use Agentic AI Systems",
                    "Project: Build a Financial Analyst Tool Use AI Agent",
                    "Memory & Conversational Agentic AI System"
                  ]
                },
                {
                  title: "WEEK 4: Building Your Advanced AI Agent with CrewAI",
                  items: [
                    "Introduction to CrewAI",
                    "Core Components of CrewAI",
                    "Building Advanced Agents",
                    "Assembling Complex Crew"
                  ]
                }
              ].map((mod, idx) => (
                <details key={idx} open={openWeek === idx} className="group rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)]">
                  <summary
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenWeek(openWeek === idx ? null : idx);
                    }}
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
                        if (typeof it === "string") {
                          return <li key={i} className="leading-relaxed">{it}</li>;
                        }
                        return (
                          <li key={i} className="leading-relaxed">
                            {it.text}
                            {Array.isArray(it.sub) && it.sub.length > 0 && (
                              <ul className="list-disc pl-5 mt-2 space-y-1">
                                {it.sub.map((s, si) => (
                                  <li key={si}>{s}</li>
                                ))}
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
        </div>
      </section>
      <section id="tools" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-10">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
              }
            >
              Libraries & Frameworks
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
              Master 40+ GenAI and Agentic AI tools, libraries and frameworks for skill-building
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              "ChatGPT",
              "wordware",
              "LangChain",
              "CrewAI",
              "LangGraph",
              "AutoGen",
              "AutoGen Studio",
              "OpenAI",
              "Python",
              "SQLite",
              "Meta Llama",
              "Gemini",
              "OpenAI GPT-4",
              "Chroma",
              "Redis",
              "Hugging Face",
              "PEFT",
              "huggingface_hub",
              "LlamaIndex",
              "Accelerate",
              "Diffusers",
              "OpenAI Gym",
              "DALL·E",
              "harness",
              "PyTorch",
              "CLIPTokenizer",
              "Civitai",
              "stability.ai",
              "BlueWillow",
              "Designer",
              "Lexica",
              "Chainlit",
              "Whisper",
              "Docker",
              "Claude",
              "n8n",
              "gradio",
              "Pinecone",
              "tavily",
              "Locust",
              "kubernetes",
              "Langfuse",
              "Adobe Firefly",
              "Unstructured",
              "ChatGPT API",
              "DALL·E 2",
              "Mistral AI",
              "BentoML",
              "Weights & Biases",
              "Midjourney",
              "Cohere",
              "LangSmith",
            ].slice(0, showAllTools ? undefined : 18).map((name) => (
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
                <span className="text-sm md:text-base font-bold text-gray-900 leading-tight flex-1 break-words">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setShowAllTools(!showAllTools)}
              className="px-6 py-3 rounded-xl border-2 border-[#2563EB] text-[#2563EB] font-semibold hover:bg-[#2563EB] hover:text-white transition-all"
            >
              {showAllTools ? "Show Less" : "Display All Tools"}
            </button>
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
          <style>{`
            .instructors-page { background: transparent; }
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
            .light-theme .instructors-page .ins-experience { color: #2563eb; }
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
            .ins-flip-wrapper { perspective: 1100px; height: 460px; }
            .ins-flip-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1); cursor: pointer; }
            .ins-flip-wrapper:hover .ins-flip-inner { transform: rotateY(180deg); }
            .ins-flip-front,.ins-flip-back { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 20px; overflow: hidden; }
            .ins-flip-back { transform: rotateY(180deg); }
            .ins-flip-wrapper:hover { filter: drop-shadow(0 20px 40px rgba(59,130,246,0.22)); }
          `}</style>
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
      {/* Pricing */}
      <section id="fees" className="bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2
              className={
                theme === "light-theme"
                  ? "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--text-color)]"
                  : "text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#60A5FA]"
              }
            >
              Choose the Right AI Program for You
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--text-muted)]">
              Unlock your AI potential with the GenAI program designed for your growth journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Plan A */}
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 md:p-8 shadow-[0_8px_32px_rgba(139,92,246,0.12)]">
              <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mb-2">Agentic AI Pioneer program</h3>
              <div className="text-4xl md:text-5xl font-extrabold mb-6 text-[var(--text-color)]">₹12,000</div>
              <ul className="space-y-3 text-[var(--text-color)]">
                {[
                  "4 Months of Power Learning",
                  "25+ Deep-Dive Mentorship Sessions",
                  "150 Hours of Hands-On Workshops",
                  "Industry-Grade Projects",
                  "300+ Hours of Structured Curriculum",
                  "AV Certificate | Fractal Certificate | WSU Certificate",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {isEnrolled ? (
                  <span className="inline-flex items-center justify-center w-full rounded-xl border border-[var(--border-primary)] text-[var(--text-color)] font-semibold py-3">
                    Enrolled
                  </span>
                ) : isAuthenticated ? (
                  <a
                    href="agentic-ai-pioneer-program"
                    className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#0EA5E9] text-white font-semibold py-3 transition-all"
                  >
                    Enroll Now
                  </a>
                ) : (
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#0EA5E9] text-white font-semibold py-3 transition-all"
                  >
                    Enroll Now
                  </Link>
                )}
              </div>
            </div>

            {/* Plan B */}
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 md:p-8 shadow-[0_8px_32px_rgba(139,92,246,0.12)]">
              <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mb-2">AgenticAI Crash Course</h3>
              <div className="text-4xl md:text-5xl font-extrabold mb-6 text-[var(--text-color)]">₹6,000</div>
              <ul className="space-y-3 text-[var(--text-color)]">
                {[
                  "4 Weeks of Power Learning",
                  
                  "30+ Hours of Hands-On Workshops",
                  "Industry-Grade Projects",
                  "Structured Curriculum",
                  "AV Certificate | Fractal Certificate | WSU Certificate",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {isEnrolled ? (
                  <span className="inline-flex items-center justify-center w-full rounded-xl border border-[var(--border-primary)] text-[var(--text-color)] font-semibold py-3">
                    Enrolled
                  </span>
                ) : isAuthenticated ? (
                  <a
                    href="#agentic-enroll-form"
                    className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#0EA5E9] text-white font-semibold py-3 transition-all"
                  >
                    Enroll Now
                  </a>
                ) : (
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#0EA5E9] text-white font-semibold py-3 transition-all"
                  >
                    Enroll Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <div id="testimonials" className="max-w-7xl mx-auto px-4 md:px-6 py-16"></div>
    </div>
  );
}


