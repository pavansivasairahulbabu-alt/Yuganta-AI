import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

const ADMIN_EMAIL = "admin@yugantaai.com";
const ADMIN_PASSWORD = "Admin123!";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    if (authed) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid admin credentials. Try again.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminAuthed", "true");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError("Connection error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-3">
          
          <div>
            <h1 className="text-3xl font-bold">
              <span className='text-white'>Yuganta</span>
              <span className='bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent'>AI</span>
            </h1>
            <p className="text-sm text-[#C7C3D6] mt-2">Admin Panel</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] backdrop-blur-xl rounded-2xl p-10 space-y-6 shadow-[0_8px_32px_rgba(139,92,246,0.2)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-[#C7C3D6]" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300 hover:border-[rgba(139,92,246,0.5)]"
                placeholder={ADMIN_EMAIL}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-[#C7C3D6]" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3.5 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition duration-300 hover:border-[rgba(139,92,246,0.5)]"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className='p-4 bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.3)] rounded-lg text-[#EC4899] text-sm font-medium flex items-center space-x-2'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#A855F7] hover:to-[#D946EF] text-white py-3.5 rounded-lg font-bold transition-all duration-300 shadow-[0_8px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_12px_32px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-100">
              Sign In to Admin Panel
            </button>
          </form>

          {/* Demo Credentials */}
          <div className='border-t border-[rgba(139,92,246,0.2)] pt-6'>
            <p className='text-xs text-[#9A93B5] text-center mb-3 font-semibold uppercase tracking-wider'>Demo Credentials</p>
            <div className='space-y-2 text-xs text-[#C7C3D6]'>
              <div className='flex items-center justify-between'>
                <span>Email:</span>
                <code className='bg-[rgba(139,92,246,0.2)] px-3 py-1.5 rounded text-[#A855F7] font-semibold'>{ADMIN_EMAIL}</code>
              </div>
              <div className='flex items-center justify-between'>
                <span>Password:</span>
                <code className='bg-[rgba(139,92,246,0.2)] px-3 py-1.5 rounded text-[#A855F7] font-semibold'>{ADMIN_PASSWORD}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
