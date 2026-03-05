import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import API_URL from '../config/api';
import toast from 'react-hot-toast';

export default function AdminRegistrations() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Auth Check (Reusing existing patterns)
        const authed = localStorage.getItem("adminAuthed") === "true";
        if (!authed) {
            navigate("/admin/login", { replace: true });
            return;
        }
        fetchLeads();
    }, [navigate]);

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${API_URL}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLeads(data);
            } else {
                if (response.status === 401) {
                    navigate("/admin/login");
                }
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
            toast.error("Failed to load registrations");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${API_URL}/api/leads/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const data = await response.json();
                setLeads(prev => prev.map(lead =>
                    lead._id === id ? { ...lead, status: newStatus } : lead
                ));

                // Show appropriate message based on enrollment status
                if (data.enrolled === true) {
                    if (data.alreadyEnrolled) {
                        toast.success("Status updated! Student was already enrolled in this course.");
                    } else {
                        toast.success("Status updated! Student has been enrolled in the course successfully.");
                    }
                } else if (data.enrolled === false) {
                    toast.info("Status updated. Student needs to register an account to access the course.");
                } else {
                    toast.success(data.message || "Status updated");
                }
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 pb-12">
            <AdminNavbar />
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400">Registrations & Enquiries</h1>
                        <p className="text-gray-400 mt-2">Manage student leads and brochure downloads</p>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-2 w-64 focus:border-purple-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Info Box */}
                <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-semibold text-purple-300 mb-1">Enrollment Info</h3>
                            <p className="text-xs text-gray-300">
                                When you change status to <span className="font-semibold text-green-400">"Enrolled"</span>, the system will automatically enroll students if they have an account. 
                                Students without accounts will need to register first before they can access the course.
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading leads...</div>
                ) : (
                    <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-300 text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Student Name</th>
                                        <th className="px-6 py-4 font-semibold">Contact</th>
                                        <th className="px-6 py-4 font-semibold">Type</th>
                                        <th className="px-6 py-4 font-semibold">Course Interest</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLeads.map(lead => (
                                        <tr key={lead._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(lead.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {lead.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">
                                                <div>{lead.phone}</div>
                                                <div className="text-gray-500 text-xs">{lead.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${(lead.type || "Brochure") === 'Enrollment'
                                                        ? 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                                                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                    }`}>
                                                    {lead.type || "Brochure"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-purple-300 text-sm">
                                                {lead.courseName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${lead.status === 'New' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                    lead.status === 'Contacted' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                        'bg-green-500/10 border-green-500/20 text-green-400'
                                                    }`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className="bg-[var(--card-bg)] border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-purple-500"
                                                    value={lead.status}
                                                    onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                                                >
                                                    <option value="New">New</option>
                                                    <option value="Contacted">Contacted</option>
                                                    <option value="Enrolled">Enrolled</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLeads.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                No leads found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
