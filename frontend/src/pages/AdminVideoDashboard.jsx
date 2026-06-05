import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Video, FolderHeart, Eye, HardDrive, Plus, Film, Tags, BarChart3, 
  Clock, Calendar, Sparkles, Loader2, ArrowRight, TrendingUp, AlertCircle
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import api from "../config/axios";
import { useTheme } from "../context/ThemeContext";

export default function AdminVideoDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | analytics | storage

  useEffect(() => {
    const authed = localStorage.getItem("adminAuthed") === "true";
    const token = localStorage.getItem("adminToken");
    if (!authed || !token) {
      navigate("/admin/login", { replace: true });
    }
    setLoading(false);
  }, [navigate]);

  // Fetch full video dashboard analytics details
  const { data: analytics = {}, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["video-dashboard-analytics"],
    queryFn: async () => {
      const res = await api.get("/video-analytics");
      return res.data;
    },
    enabled: !loading,
  });

  // Fetch storage details
  const { data: storage = {}, isLoading: loadingStorage } = useQuery({
    queryKey: ["video-storage-analytics"],
    queryFn: async () => {
      const res = await api.get("/video-storage");
      return res.data;
    },
    enabled: !loading,
  });

  if (loading || loadingAnalytics || loadingStorage) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#A855F7] animate-spin mx-auto mb-4" />
          <p className="text-[#C7C3D6]">Assembling dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  const { summary = {}, recentUploads = [], mostViewedVideos = [], categoryDistribution = [], monthlyData = [], recentActivity = [] } = analytics;
  const { stats = {}, largestVideos = [] } = storage;

  // Formatting helpers
  const formatSize = (bytes) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (secs) => {
    if (!secs) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // SVG Chart Computations & Renderers
  
  // 1. Monthly Uploads SVG Bar Chart
  const renderMonthlyChart = () => {
    if (!monthlyData || monthlyData.length === 0) return null;
    const maxUploads = Math.max(...monthlyData.map(d => d.uploads), 4);
    const chartHeight = 160;
    const chartWidth = 500;
    const padding = 30;
    const graphHeight = chartHeight - padding * 2;
    const graphWidth = chartWidth - padding * 2;
    const colWidth = graphWidth / monthlyData.length;

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + graphHeight * (1 - ratio);
          const val = Math.round(maxUploads * ratio);
          return (
            <g key={idx} className="opacity-20">
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" />
              <text x={padding - 5} y={y + 4} fill="#C7C3D6" fontSize={9} textAnchor="end" className="font-mono font-bold">
                {val}
              </text>
            </g>
          );
        })}

        {/* Columns */}
        {monthlyData.map((d, idx) => {
          const x = padding + idx * colWidth + (colWidth - 28) / 2;
          const h = (d.uploads / maxUploads) * graphHeight;
          const y = padding + graphHeight - h;

          return (
            <g key={idx} className="group cursor-pointer">
              {/* Bar gradient fill */}
              <defs>
                <linearGradient id={`bar-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <rect
                x={x}
                y={y}
                width={28}
                height={Math.max(h, 4)}
                rx={4}
                fill={`url(#bar-grad-${idx})`}
                stroke="rgba(236,72,153,0.4)"
                strokeWidth={1}
                className="transition-all duration-300 hover:brightness-125"
              />
              {/* Label above */}
              <text x={x + 14} y={y - 6} fill="#white" fontSize={9} fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                {d.uploads}
              </text>
              {/* Month label below */}
              <text x={x + 14} y={chartHeight - 8} fill="#9A93B5" fontSize={9} textAnchor="middle" fontWeight="semibold">
                {d.month.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // 2. Category Distribution SVG Horizontal Bar Share
  const renderCategoryShare = () => {
    if (!categoryDistribution || categoryDistribution.length === 0) {
      return (
        <div className="flex items-center justify-center py-12 text-sm text-[#C7C3D6]">
          <AlertCircle className="w-5 h-5 mr-2 text-[#A855F7]" />
          <span>Upload videos to populate distribution insights.</span>
        </div>
      );
    }

    const totalCount = categoryDistribution.reduce((acc, c) => acc + c.value, 0);
    const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"];

    return (
      <div className="space-y-4">
        {/* Visual Share Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-900 border border-[rgba(139,92,246,0.15)]">
          {categoryDistribution.map((c, idx) => {
            const pct = (c.value / totalCount) * 100;
            const color = colors[idx % colors.length];
            return (
              <div
                key={c.name}
                className="h-full transition-all hover:opacity-90 cursor-pointer"
                title={`${c.name}: ${c.value} videos (${pct.toFixed(0)}%)`}
                style={{ backgroundColor: color, width: `${pct}%` }}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {categoryDistribution.map((c, idx) => {
            const pct = (c.value / totalCount) * 100;
            const color = colors[idx % colors.length];
            return (
              <div key={c.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[rgba(26,21,44,0.4)] border border-[rgba(139,92,246,0.08)]">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-white truncate">{c.name}</span>
                </div>
                <span className="text-[#C7C3D6] font-mono text-[10px] ml-2 shrink-0">
                  {c.value} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Storage Usage Donut Gauge
  const renderStorageGauge = () => {
    if (!stats || !stats.storageLimitGB) return null;
    const limit = stats.storageLimitGB;
    const used = stats.totalStorageUsedGB;
    const pct = Math.min(100, (used / limit) * 100);
    
    // SVG Donut values
    const size = 120;
    const strokeWidth = 10;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl shadow-xl text-center space-y-4">
        <div className="relative w-[120px] h-[120px]">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="rgba(139,92,246,0.1)"
              strokeWidth={strokeWidth}
            />
            {/* Foreground Fill */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="url(#storage-grad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="storage-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-white">{pct.toFixed(1)}%</span>
            <span className="text-[9px] text-[#9A93B5] font-semibold uppercase tracking-wider">Used</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">Cloudflare R2 Allocation</h4>
          <p className="text-xs text-[#C7C3D6] mt-1 font-mono">
            {used.toFixed(2)} GB / {limit} GB Allocated
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 pb-12 transition-colors duration-300">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[rgba(139,92,246,0.15)] pb-6">
          <div>
            <p className="text-xs text-[#9A93B5] font-semibold uppercase tracking-wider">Admin Dashboard</p>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Video Hub Control Center</h1>
            <p className="text-[#C7C3D6] text-sm mt-1">Global statistics, analytics trends, storage space, and rapid configurations</p>
          </div>
          
          {/* Quick Tabs switcher */}
          <div className="inline-flex rounded-xl p-1 bg-[rgba(26,21,44,0.7)] border border-[rgba(139,92,246,0.2)]">
            {[
              { id: "overview", label: "Overview", icon: Sparkles },
              { id: "analytics", label: "Analytics Trends", icon: BarChart3 },
              { id: "storage", label: "Storage & R2", icon: HardDrive },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === t.id 
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white shadow-md" 
                      : "text-[#C7C3D6] hover:text-white hover:bg-[rgba(139,92,246,0.08)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Overview Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Videos", val: summary.totalVideos || 0, icon: Video, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10" },
            { label: "Total Categories", val: summary.totalCategories || 0, icon: FolderHeart, color: "text-[#EC4899]", bg: "bg-[#EC4899]/10" },
            { label: "Total Views", val: (summary.totalViews || 0).toLocaleString(), icon: Eye, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
            { label: "Storage Used", val: `${(summary.storageUsedGB || 0).toFixed(2)} GB`, icon: HardDrive, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          ].map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-2xl p-6 flex items-center justify-between shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-1">
                  <p className="text-xs text-[#9A93B5] font-semibold uppercase tracking-wider">{c.label}</p>
                  <h3 className="text-2xl font-black text-white tracking-tight">{c.val}</h3>
                </div>
                <div className={`p-3.5 rounded-xl ${c.bg} ${c.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Tab Contents */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Quick Actions Panel */}
            <div className="bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white pb-3 border-b border-[rgba(139,92,246,0.1)]">
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/admin/video-upload"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.15)] hover:border-[rgba(139,92,246,0.4)] text-white font-semibold transition-all hover:pl-5 group"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-[#A855F7] group-hover:scale-110 transition-transform" />
                    <span>Upload New Video</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#A855F7] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/admin/video-manage"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.15)] hover:border-[rgba(139,92,246,0.4)] text-white font-semibold transition-all hover:pl-5 group"
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-[#EC4899] group-hover:scale-110 transition-transform" />
                    <span>Manage Library</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#EC4899] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/admin/video-categories"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.15)] hover:border-[rgba(139,92,246,0.4)] text-white font-semibold transition-all hover:pl-5 group"
                >
                  <div className="flex items-center gap-3">
                    <Tags className="w-5 h-5 text-[#3B82F6] group-hover:scale-110 transition-transform" />
                    <span>Video Categories</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#3B82F6] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="lg:col-span-2 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[rgba(139,92,246,0.1)]">
                <h3 className="text-base font-bold text-white">Recent Uploads</h3>
                <Link to="/admin/video-manage" className="text-xs text-[#A855F7] hover:underline font-semibold flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {recentUploads.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#C7C3D6]">
                  No recent uploads. Publish your first video!
                </div>
              ) : (
                <div className="divide-y divide-[rgba(139,92,246,0.08)]">
                  {recentUploads.map(video => (
                    <div key={video._id} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-center justify-between">
                      <div className="flex gap-3 items-center min-w-0">
                        <div className="aspect-video w-16 bg-black rounded-lg overflow-hidden border border-[rgba(139,92,246,0.1)] shrink-0">
                          <img src={video.thumbnailUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100"} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{video.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-[#9A93B5] mt-1 font-semibold">
                            <span className="px-1.5 py-0.5 rounded bg-[rgba(139,92,246,0.1)] text-[#C084FC] text-[8px]">{video.category}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{formatDuration(video.duration)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-white flex items-center gap-0.5"><Eye className="w-3.5 h-3.5 text-[#3B82F6]" />{video.views}</span>
                        <span className="text-[9px] text-[#9A93B5] mt-0.5 block">{new Date(video.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest Activity Feed */}
            <div className="lg:col-span-3 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white pb-3 border-b border-[rgba(139,92,246,0.1)]">
                Latest Activity Timeline
              </h3>

              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#C7C3D6]">
                  No administrative events recorded yet.
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {recentActivity.map(act => (
                    <div key={act.id} className="flex gap-4 items-start">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        act.type === "upload" ? "bg-[#A855F7]/10 text-[#A855F7]" : "bg-[#EC4899]/10 text-[#EC4899]"
                      }`}>
                        {act.type === "upload" ? <Video className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-tight">{act.message}</p>
                        <p className="text-[10px] text-[#9A93B5] mt-1 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(act.time).toLocaleString()}
                          {act.meta?.category && (
                            <span className="text-[#C084FC]">({act.meta.category})</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            
            {/* Monthly Uploads chart card */}
            <div className="bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Monthly Upload Trends</h3>
                <p className="text-xs text-[#9A93B5]">Upload activity volume over the last 6 months</p>
              </div>
              <div className="pt-4 flex justify-center">
                {renderMonthlyChart()}
              </div>
            </div>

            {/* Category distribution chart card */}
            <div className="bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Category Share Distribution</h3>
                <p className="text-xs text-[#9A93B5]">Relative distribution of video assets per category</p>
              </div>
              <div className="pt-2">
                {renderCategoryShare()}
              </div>
            </div>

            {/* Most viewed video list */}
            <div className="lg:col-span-2 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white pb-3 border-b border-[rgba(139,92,246,0.1)]">
                Most Viewed Videos (Leaderboard)
              </h3>
              
              {mostViewedVideos.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#C7C3D6]">
                  No videos registered views.
                </div>
              ) : (
                <div className="space-y-4">
                  {mostViewedVideos.map((video, idx) => (
                    <div key={video._id} className="flex gap-4 items-center justify-between p-3 rounded-2xl bg-[rgba(26,21,44,0.4)] border border-[rgba(139,92,246,0.08)]">
                      <div className="flex gap-3 items-center min-w-0">
                        <span className="w-6 text-center text-sm font-black text-[#A855F7] font-mono">
                          #{idx + 1}
                        </span>
                        
                        <div className="aspect-video w-16 bg-black rounded-lg overflow-hidden border border-[rgba(139,92,246,0.1)] shrink-0">
                          <img src={video.thumbnailUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100"} className="w-full h-full object-cover" />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{video.title}</h4>
                          <span className="inline-flex px-1.5 py-0.5 rounded bg-[rgba(139,92,246,0.1)] text-[#C084FC] text-[8px] font-bold mt-1">
                            {video.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white bg-[rgba(59,130,246,0.15)] text-[#60A5FA] border border-[#3B82F6]/30 px-2.5 py-1 rounded-xl">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{video.views.toLocaleString()} views</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === "storage" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Storage circle gauge */}
            <div className="lg:col-span-1">
              {renderStorageGauge()}
            </div>

            {/* Storage metrics details */}
            <div className="lg:col-span-2 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white pb-3 border-b border-[rgba(139,92,246,0.1)]">
                  Cloudflare R2 Storage Status
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="p-4 rounded-2xl bg-[rgba(26,21,44,0.4)] border border-[rgba(139,92,246,0.08)]">
                    <p className="text-[10px] text-[#9A93B5] font-semibold uppercase tracking-wider">Remaining Capacity</p>
                    <h4 className="text-xl font-black text-white mt-1">{(stats.availableStorageGB || 0).toFixed(2)} GB</h4>
                    <p className="text-[9px] text-[#10B981] font-semibold mt-1">Secure & S3 API compatible</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[rgba(26,21,44,0.4)] border border-[rgba(139,92,246,0.08)]">
                    <p className="text-[10px] text-[#9A93B5] font-semibold uppercase tracking-wider">Monthly File Storage Growth</p>
                    <h4 className="text-xl font-black text-white mt-1">+{stats.percentGrowth || 0}%</h4>
                    <p className="text-[9px] text-[#C7C3D6] mt-1">
                      Added {formatSize(stats.addedBytes)} in last 30 days
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex gap-2.5 items-start mt-6">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Asset storage integrates automatically with Cloudflare R2 bucket objects. Video deletions in this admin portal will automatically invoke R2 DeleteObject queries to release capacity.
                </span>
              </div>
            </div>

            {/* Largest Video Assets list */}
            <div className="lg:col-span-3 bg-[rgba(30,27,51,0.4)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white pb-3 border-b border-[rgba(139,92,246,0.1)]">
                Largest Video Assets (Cloud Billing impact)
              </h3>

              {largestVideos.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#C7C3D6]">
                  No videos found to analyze.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[rgba(139,92,246,0.1)] text-xs text-[#9A93B5] font-bold">
                        <th className="py-2.5 px-4">Title</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4 font-mono">Upload Date</th>
                        <th className="py-2.5 px-4 text-right">Disk Space</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-[rgba(139,92,246,0.05)]">
                      {largestVideos.map(v => (
                        <tr key={v.id} className="hover:bg-[rgba(139,92,246,0.04)] transition-colors">
                          <td className="py-3 px-4 font-bold text-white truncate max-w-xs">{v.title}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(139,92,246,0.1)] text-[#C084FC]">
                              {v.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#9A93B5] font-mono">{new Date(v.uploadDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-right font-bold text-white font-mono">{v.sizeMB} MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
