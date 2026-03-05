import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../config/api";

export default function MentorshipBookingPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [assignedMentor, setAssignedMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [existingSessions, setExistingSessions] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const [timeSlots, setTimeSlots] = useState([
    "3:00pm",
    "3:30pm",
    "4:00pm",
    "6:00pm",
    "6:30pm",
    "7:00pm",
    "7:30pm",
    "8:00pm",
    "8:30pm",
    "9:00pm",
    "9:30pm",
  ]);
  const [topics, setTopics] = useState([
    "First Mentorship",
    "Applied Machine Learning",
    "Fundamentals of Deep Learning",
    "Getting started with NLP",
    "NLP using Deep Learning",
    "Getting Started with LLMs",
    "Building LLM Apps using Prompt Engineering",
    "Career Assistance",
    "Building End-to-End Generative AI Applications",
    "Getting started with Stable Diffusion",
    "Mastering Methods and Tools of Stable Diffusion",
    "Advanced Stable Diffusion Techniques",
  ]);

  const [program, setProgram] = useState({
    title: "Gen AI Pinnacle Plus Program Mentorship ROW",
    subtitle: "Gen AI Plus 1:1 Mentorship",
    duration: "30 min",
    location: "https://zoom.us/j/99716979451",
    note: "Note: Please do not change your prefilled Email ID",
    timezone: "India, Sri Lanka Time (UTC+5:30)",
  });

  useEffect(() => {
    fetchAssignedMentor();
    fetchUserEmail();
    fetchExistingSessions();
    fetchGlobalBookedSlots();
  }, []);

  const fetchGlobalBookedSlots = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/mentorship-sessions/booked-slots`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const slots = await response.json();
        
        // Create a map of globally booked slots by date and time
        const globalSlots = {};
        slots.forEach(slot => {
          const key = `${slot.date}_${slot.time}`;
          globalSlots[key] = true;
        });
        setBookedSlots(globalSlots);
      }
    } catch (error) {
      console.error("Error fetching global booked slots:", error);
    }
  };

  const fetchExistingSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/mentorship-sessions/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const sessions = await response.json();
        setExistingSessions(sessions);
      }
    } catch (error) {
      console.error("Error fetching existing sessions:", error);
    }
  };

  const fetchAssignedMentor = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to book a mentorship session");
        return;
      }

      const response = await fetch(`${API_URL}/api/users/assigned-mentor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const mentor = await response.json();
        setAssignedMentor(mentor);
        setProgram((prev) => ({
          ...prev,
          title: `1:1 Mentorship with ${mentor.name}`,
          subtitle: `Mentorship Session - ${mentor.expertise}`,
        }));
      } else if (response.status === 404) {
        setAssignedMentor(null);
      } else {
        console.error("Failed to load mentor information:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching mentor:", error);
      setAssignedMentor(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const user = await response.json();
        setEmail(user.email);
      }
    } catch (error) {
      console.error("Error fetching user email:", error);
    }
  };

  const currentMonth = useMemo(() => {
    const base = new Date(today);
    base.setMonth(base.getMonth() + monthOffset);
    return base;
  }, [today, monthOffset]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of today

    // Calculate minimum bookable date (today + 7 days)
    const minBookableDate = new Date(now);
    minBookableDate.setDate(now.getDate() + 7);

    const cells = [];
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push({ key: `blank-${i}`, label: "", isSelectable: false });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      const cellDate = new Date(year, month, d);
      cellDate.setHours(0, 0, 0, 0);
      // Date must be at least 7 days in the future
      const isBookable = cellDate >= minBookableDate;
      cells.push({ key: `day-${d}`, label: d, isSelectable: isBookable });
    }
    return cells;
  }, [currentMonth]);

  const displayMonth = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handleSelectDate = (dayLabel) => {
    if (!dayLabel) return;
    const chosen = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayLabel);
    chosen.setHours(0, 0, 0, 0);
    
    // Validate 7-day advance booking requirement
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minBookableDate = new Date(today);
    minBookableDate.setDate(today.getDate() + 7);
    
    if (chosen < minBookableDate) {
      toast.error("Sessions must be booked at least 7 days in advance. Please select a later date.");
      return;
    }
    
    setSelectedDate(chosen.toISOString());
    setSelectedSlot(null);
    setShowDetails(false);
  };

  const handleSelectSlot = (slot) => {
    if (!selectedDate) return;
    
    // Check if this slot is already booked globally
    const dateStr = new Date(selectedDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const slotKey = `${dateStr}_${slot}`;
    
    if (bookedSlots[slotKey]) {
      toast.error("This time slot is already booked by another user. Please choose a different slot.");
      return;
    }
    
    setSelectedSlot(slot);
    setShowDetails(true);
  };

  const handleConfirmBooking = async () => {
    if (!email || !topic || !selectedDate || !selectedSlot) return;
    
    // Check if user has 3 or more upcoming sessions this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weeklyBookings = existingSessions.filter(session => {
      const activeStatuses = ['upcoming','pending','mentor_assigned','scheduled','rescheduled'];
      if (!activeStatuses.includes(session.status)) return false;
      const sessionDate = new Date(session.bookedDate);
      return sessionDate >= startOfWeek && sessionDate < endOfWeek;
    });

    if (weeklyBookings.length >= 3) {
      toast.error("You can only book 3 sessions per week. Please try again next week or cancel an existing booking.");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to book a session");
        return;
      }

      const dateStr = new Date(selectedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const sessionData = {
        title: topic,
        mentorId: assignedMentor?._id,
        date: dateStr,
        time: selectedSlot,
        notes: `Booked on ${new Date().toLocaleDateString()}`,
      };

      const response = await fetch(`${API_URL}/api/mentorship-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        toast.success("Booking confirmed! You will see it in your mentorships shortly.");
        setTimeout(() => {
          window.location.href = "/mentorships";
        }, 1500);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to book session");
      }
    } catch (error) {
      console.error("Error booking session:", error);
      toast.error("Failed to book session. Please try again.");
    }
  };

  const isSelectedDay = (label) => {
    if (!selectedDate || !label) return false;
    const stored = new Date(selectedDate);
    return (
      stored.getDate() === Number(label) &&
      stored.getMonth() === currentMonth.getMonth() &&
      stored.getFullYear() === currentMonth.getFullYear()
    );
  };

  const bookingSummary = selectedDate && selectedSlot;
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Calculate weekly bookings count
  const getWeeklyBookingsCount = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return existingSessions.filter(session => {
      const activeStatuses = ['upcoming','pending','mentor_assigned','scheduled','rescheduled'];
      if (!activeStatuses.includes(session.status)) return false;
      const sessionDate = new Date(session.bookedDate);
      return sessionDate >= startOfWeek && sessionDate < endOfWeek;
    }).length;
  };

  const weeklyBookings = getWeeklyBookingsCount();
  const remainingBookings = 3 - weeklyBookings;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-28 pb-16 flex items-center justify-center">
        <p className="text-gray-400">Loading mentor information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg">{error}</p>
            <button
              onClick={() => navigate("/mentorships")}
              className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-200">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {!showDetails ? (
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/5 space-y-6">
              <div className="space-y-3">
                <div className="text-sm text-gray-400">{program.subtitle}</div>
                <h1 className="text-3xl font-bold leading-tight">{program.title}</h1>
                {assignedMentor ? (
                  <div className="bg-gradient-to-r from-[rgba(139,92,246,0.3)] to-[rgba(236,72,153,0.3)] border border-[rgba(139,92,246,0.6)] rounded-lg p-4 mt-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-xs text-[#C7C3D6] uppercase tracking-widest font-bold">Mentoring with</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{assignedMentor.name}</p>
                    <p className="text-sm text-[#A855F7] font-semibold mt-1">{assignedMentor.expertise}</p>
                    {assignedMentor.email && (
                      <p className="text-xs text-[#C7C3D6] mt-2">📧 {assignedMentor.email}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-600/20 border border-yellow-500/40 rounded-lg p-4 mt-4">
                    <p className="text-xs text-yellow-300 uppercase tracking-widest font-bold">⚠️ No Mentor Assigned</p>
                    <p className="text-sm text-yellow-200 mt-2">You'll be assigned a mentor soon. Contact admin for more info.</p>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-[#C7C3D6] pt-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                    <span>{program.duration}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{program.note}</p>
                
                {/* Weekly Booking Limit Display */}
                <div className={`mt-4 p-3 rounded-lg border ${
                  remainingBookings > 0 
                    ? 'bg-gradient-to-r from-[rgba(139,92,246,0.2)] to-[rgba(236,72,153,0.2)] border-[rgba(139,92,246,0.4)]'
                    : 'bg-red-500/20 border-red-500/40'
                }`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-semibold text-white">
                      Weekly Bookings: <span className={remainingBookings > 0 ? 'text-[#A855F7]' : 'text-red-400'}>{weeklyBookings}/3</span>
                    </p>
                  </div>
                  <p className="text-xs text-[#C7C3D6] mt-1 ml-7">
                    {remainingBookings > 0 
                      ? `You can book ${remainingBookings} more session${remainingBookings !== 1 ? 's' : ''} this week`
                      : 'You have reached your weekly booking limit'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-400">Time zone: {program.timezone}</p>
                
                {/* 7-Day Advance Booking Notice */}
                <div className="mt-3 p-3 rounded-lg border bg-blue-500/10 border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-300">Advance Booking Required</p>
                  </div>
                  <p className="text-xs text-blue-200 mt-1 ml-7">
                    Sessions must be booked at least 7 days in advance
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6 bg-[#0a0a0a]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Select a Date & Time</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <button
                    onClick={() => setMonthOffset((v) => v - 1)}
                    className="px-2 py-1 rounded hover:bg-white/10"
                    aria-label="Previous month">
                    ‹
                  </button>
                  <div className="font-semibold text-white">{displayMonth}</div>
                  <button
                    onClick={() => setMonthOffset((v) => v + 1)}
                    className="px-2 py-1 rounded hover:bg-white/10"
                    aria-label="Next month">
                    ›
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-400">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="py-1 uppercase tracking-wide text-xs">{day}</div>
                ))}
                {calendarDays.map((cell) => {
                  const active = isSelectedDay(cell.label);
                  return (
                    <button
                      key={cell.key}
                      disabled={!cell.isSelectable}
                      onClick={() => handleSelectDate(cell.label)}
                      className={`aspect-square rounded-full flex items-center justify-center text-sm transition border border-transparent ${
                        !cell.isSelectable
                          ? "opacity-40 cursor-default"
                          : active
                          ? "bg-white text-black font-semibold"
                          : "hover:bg-white/10"
                      }`}>
                      {cell.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-400">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })
                    : "Choose a date"}
                </div>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5 custom-scrollbar">
                  {timeSlots.map((slot) => {
                    const active = selectedSlot === slot;
                    const dateStr = selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }) : "";
                    const slotKey = `${dateStr}_${slot}`;
                    const isBooked = bookedSlots[slotKey];
                    
                    // Check if this is today and if the time has passed
                    let isPastTime = false;
                    if (selectedDate) {
                      const selectedDay = new Date(selectedDate);
                      const today = new Date();
                      selectedDay.setHours(0, 0, 0, 0);
                      today.setHours(0, 0, 0, 0);
                      
                      if (selectedDay.getTime() === today.getTime()) {
                        // It's today, check if time has passed
                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();
                        
                        // Parse slot time (e.g., "3:00pm" or "11:30am")
                        const timeMatch = slot.match(/(\d+):(\d+)(am|pm)/i);
                        if (timeMatch) {
                          let slotHour = parseInt(timeMatch[1]);
                          const slotMinute = parseInt(timeMatch[2]);
                          const isPM = timeMatch[3].toLowerCase() === 'pm';
                          
                          if (isPM && slotHour !== 12) slotHour += 12;
                          if (!isPM && slotHour === 12) slotHour = 0;
                          
                          if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
                            isPastTime = true;
                          }
                        }
                      }
                    }
                    
                    const disabled = !selectedDate || isBooked || isPastTime;
                    
                    return (
                      <button
                        key={slot}
                        disabled={disabled}
                        onClick={() => handleSelectSlot(slot)}
                        className={`w-full flex items-center justify-between px-5 py-4 text-left transition focus:outline-none text-base font-semibold ${
                          disabled
                            ? "text-gray-500 cursor-not-allowed opacity-50"
                            : active
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/5 text-gray-200"
                        }`}>
                        <span className="flex items-center gap-2">
                          {slot}
                          {isBooked && <span className="text-xs text-[#EC4899] bg-[rgba(236,72,153,0.2)] px-2 py-1 rounded">Booked</span>}
                          {isPastTime && !isBooked && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Past</span>}
                        </span>
                        <span
                          className={`text-sm inline-flex items-center gap-2 px-3 py-1 rounded-md border ${
                            disabled
                              ? "border-white/10 text-gray-500"
                              : active
                              ? "border-white text-white"
                              : "border-white/20 text-gray-200"
                          }`}>
                          {isBooked ? "Unavailable" : isPastTime ? "Past" : "Next"}
                          {!isBooked && !isPastTime && <span aria-hidden="true">›</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">Time zone</p>
                  <p className="font-semibold">{program.timezone}</p>
                </div>
                <button
                  disabled={!bookingSummary}
                  className={`px-5 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    bookingSummary
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
                      : "bg-white/10 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => bookingSummary && setShowDetails(true)}>
                  Confirm Session
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/5 space-y-6">
              <div className="space-y-3">
                <div className="text-sm text-gray-400">{program.subtitle}</div>
                <h1 className="text-3xl font-bold leading-tight">{program.title}</h1>
                <div className="flex items-center gap-3 text-sm text-[#C7C3D6]">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                    <span>{program.duration}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{program.note}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span>⏰</span>
                  <span>
                    {selectedSlot} on {formattedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{program.timezone}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <p>Note: Please do not change your prefilled Email ID</p>
                <p>Get access to Industry Mentors by booking your 30 mins 1:1 mentorship session.</p>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6 bg-[#0a0a0a]">
              <div className="space-y-2">
                <label className="text-sm text-gray-400" htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Your question is related to which of the following topic?</span>
                  <span className="text-red-300">*</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {topics.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-3 bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-3 hover:border-white/30 cursor-pointer">
                      <input
                        type="radio"
                        name="topic"
                        value={t}
                        checked={topic === t}
                        onChange={() => setTopic(t)}
                        className="accent-white w-4 h-4"
                      />
                      <span className="text-sm text-gray-200">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-5 py-3 rounded-lg border border-white/20 text-gray-200 hover:bg-white/5 transition">
                  Back
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={!email || !topic}
                  className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    email && topic
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
                      : "bg-white/10 text-gray-500 cursor-not-allowed"
                  }`}>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
