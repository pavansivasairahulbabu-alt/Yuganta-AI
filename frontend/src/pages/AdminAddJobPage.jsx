import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";

export default function AdminAddJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    workMode: "Online",
    type: "Full-Time",
    experience: "Fresher",
    salary: "",
    logo: "",
    jobLink: "",
    description: "",
  });

  const experienceOptions = ["Fresher", "1 - 3 yr.", "3 - 6 yr.", "6+ yr."];
  const jobTypes = ["Full-Time", "Contract", "Internship"];
  const workModeOptions = ["On-site", "Hybrid", "Online"];

  const selectClassName =
    "w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white focus:outline-none focus:border-[#A855F7] transition-colors";
  const optionClassName = "bg-[#171327] text-white";

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    } else {
      fetchJobs();
    }
  }, [navigate]);

  const handleUnauthorized = (message = "Session expired. Please login again.") => {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminToken");
    toast.error(message);
    navigate("/admin/login", { replace: true });
  };

  const fetchJobs = async () => {
    try {
      setFetchingJobs(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs list");
    } finally {
      setFetchingJobs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.location || !formData.jobLink) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(`${API_URL}/api/admin/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      toast.success("Job added successfully");
      setFormData({
        title: "",
        company: "",
        location: "",
        workMode: "Online",
        type: "Full-Time",
        experience: "Fresher",
        salary: "",
        logo: "",
        jobLink: "",
        description: "",
      });
      fetchJobs();
    } catch (error) {
      console.error("Add job error:", error);
      toast.error(error.message || "Failed to add job");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_URL}/api/admin/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) throw new Error("Failed to delete job");
      
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.error("Delete job error:", error);
      toast.error("Failed to delete job");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 md:pt-28 pb-16">
      <AdminNavbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="space-y-2 mb-8 text-center md:text-left">
          <p className="text-sm text-[#9A93B5] font-semibold uppercase tracking-wider">Management</p>
          <h1 className="text-4xl md:text-5xl font-bold">Jobs Management</h1>
          <p className="text-[#C7C3D6] mt-3 text-lg">
            Create and manage job postings for the user portal
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Registration Form */}
          <div className="bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
            <h2 className="text-2xl font-bold mb-6 text-white">Add New Job</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Job Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Data Engineer"
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors"
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Company Name*</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. YugantaAI"
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors"
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Remote / Bengaluru"
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors"
                    required
                  />
                </div>

                {/* Job Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Job Type*</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={selectClassName}
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type} className={optionClassName}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Work Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Work Mode*</label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    className={selectClassName}
                  >
                    {workModeOptions.map((mode) => (
                      <option key={mode} value={mode} className={optionClassName}>{mode}</option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Experience Level*</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={selectClassName}
                  >
                    {experienceOptions.map((exp) => (
                      <option key={exp} value={exp} className={optionClassName}>{exp}</option>
                    ))}
                  </select>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Salary Range*</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 4-8 LPA / 20-30k per month"
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white focus:outline-none focus:border-[#A855F7] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Logo URL (Optional)</label>
                  <input
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="e.g. https://logo.clearbit.com/company.com"
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors"
                  />
                </div>

                {/* Job Registration Link */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A855F7]">Job Registration Link*</label>
                  <input
                    type="url"
                    name="jobLink"
                    value={formData.jobLink}
                    onChange={handleChange}
                    placeholder="e.g. https://company.com/apply/job-id"
                    className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#A855F7]">Job Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Briefly describe the role..."
                  className="w-full px-4 py-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-[#9A93B5] focus:outline-none focus:border-[#A855F7] transition-colors resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Adding Job..." : "Create Job Posting"}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Jobs List */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Existing Jobs</h2>
            
            {fetchingJobs ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A855F7]"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-2xl p-12 text-center">
                <p className="text-[#C7C3D6]">No jobs found in the database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                  <div 
                    key={job._id} 
                    className="bg-[var(--card-bg)] border border-[rgba(139,92,246,0.3)] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[rgba(139,92,246,0.6)] transition-all"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center flex-shrink-0">
                        <img 
                          src={job.logo?.trim() || '/job-default-logo.svg'} 
                          alt={job.company} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => { e.target.src = '/job-default-logo.svg'; }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{job.title}</h3>
                        <p className="text-[#A855F7] font-medium">{job.company}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#9A93B5]">
                          <span className="flex items-center gap-1">📍 {job.location}</span>
                          <span className="flex items-center gap-1">🏢 {job.workMode || "Online"}</span>
                          <span className="flex items-center gap-1">💼 {job.type}</span>
                          <span className="flex items-center gap-1">🎓 {job.experience}</span>
                          <span className="flex items-center gap-1">💰 {job.salary}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <a 
                        href={job.jobLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] text-[#A855F7] rounded-lg hover:bg-[rgba(139,92,246,0.2)] transition-colors text-sm font-semibold"
                      >
                        View Link
                      </a>
                      <button 
                        onClick={() => handleDelete(job._id)}
                        className="px-4 py-2 bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.3)] text-[#EC4899] rounded-lg hover:bg-[rgba(236,72,153,0.2)] transition-colors text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
