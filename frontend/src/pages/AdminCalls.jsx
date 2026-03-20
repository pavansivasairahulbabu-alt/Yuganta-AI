import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import API_URL from "../config/api";

export default function AdminCalls() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [calls, setCalls] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const authed = localStorage.getItem("adminAuthed") === "true";
		if (!authed) {
			navigate("/admin/login", { replace: true });
			return;
		}
		fetchCalls();
	}, [navigate]);

	const fetchCalls = async () => {
		try {
			const token = localStorage.getItem("adminToken");
			const response = await fetch(`${API_URL}/api/leads`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.ok) {
				if (response.status === 401) {
					navigate("/admin/login", { replace: true });
					return;
				}
				throw new Error("Failed to load calls");
			}

			const data = await response.json();
			const filteredCalls = (Array.isArray(data) ? data : []).filter((lead) => {
				const source = String(lead?.leadSource || "").toLowerCase();
				const type = String(lead?.type || "").toLowerCase();
				return source === "talk to expert" || type === "consultation";
			});

			setCalls(filteredCalls);
		} catch (error) {
			console.error("Error fetching calls:", error);
			toast.error("Failed to load call requests");
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (id, newStatus) => {
		try {
			const token = localStorage.getItem("adminToken");
			const response = await fetch(`${API_URL}/api/leads/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				throw new Error("Failed to update status");
			}

			setCalls((prev) => prev.map((call) => (
				call._id === id ? { ...call, status: newStatus } : call
			)));
			toast.success("Call status updated");
		} catch (error) {
			console.error("Error updating call status:", error);
			toast.error("Unable to update status");
		}
	};

	const visibleCalls = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return calls;
		return calls.filter((call) => (
			String(call?.name || "").toLowerCase().includes(q)
			|| String(call?.email || "").toLowerCase().includes(q)
			|| String(call?.phone || "").toLowerCase().includes(q)
			|| String(call?.courseName || "").toLowerCase().includes(q)
			|| String(call?.discussionTopic || "").toLowerCase().includes(q)
		));
	}, [calls, searchQuery]);

	return (
		<div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-32 pb-12">
			<AdminNavbar />
			<div className="max-w-7xl mx-auto px-6">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
					<div>
						<h1 className="text-3xl font-bold text-[var(--text-color)] dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-blue-400">Calls</h1>
						<p className="text-gray-400 mt-2">Talk-to-Expert responses from website visitors</p>
					</div>
					<input
						type="text"
						placeholder="Search by name, email, course..."
						className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-2 w-full md:w-80 focus:border-blue-500 outline-none"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{loading ? (
					<div className="text-center py-20 text-gray-400">Loading call requests...</div>
				) : (
					<div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead className="bg-white/5 text-gray-300 text-xs uppercase tracking-wider">
									<tr>
										<th className="px-4 py-3 font-semibold">Date</th>
										<th className="px-4 py-3 font-semibold">Full Name</th>
										<th className="px-4 py-3 font-semibold">Email</th>
										<th className="px-4 py-3 font-semibold">Phone Number</th>
										<th className="px-4 py-3 font-semibold">Course Interested In</th>
										<th className="px-4 py-3 font-semibold">Topic To Discuss</th>
										<th className="px-4 py-3 font-semibold">Preferred Contact</th>
										<th className="px-4 py-3 font-semibold">Preferred Time</th>
										<th className="px-4 py-3 font-semibold">Status</th>
										<th className="px-4 py-3 font-semibold">Action</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/5">
									{visibleCalls.map((call) => (
										<tr key={call._id} className="hover:bg-white/5 transition-colors">
											<td className="px-4 py-3 text-gray-400 text-xs">{new Date(call.date).toLocaleDateString()}</td>
											<td className="px-4 py-3 text-[var(--text-color)] font-medium text-sm">{call.name}</td>
											<td className="px-4 py-3 text-gray-300 text-sm">{call.email}</td>
											<td className="px-4 py-3 text-gray-300 text-sm">{call.phone}</td>
											<td className="px-4 py-3 text-blue-300 text-sm">{call.courseName}</td>
											<td className="px-4 py-3 text-gray-300 text-sm max-w-[220px] whitespace-normal">{call.discussionTopic || "-"}</td>
											<td className="px-4 py-3 text-gray-300 text-sm">{call.preferredContactMode || "-"}</td>
											<td className="px-4 py-3 text-gray-300 text-sm">{call.preferredContactTime || "-"}</td>
											<td className="px-4 py-3">
												<span className={`px-3 py-1 rounded-full text-xs font-medium border ${call.status === "Contacted"
													? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
													: "bg-blue-500/10 border-blue-500/20 text-blue-400"
												}`}>
													{call.status || "New"}
												</span>
											</td>
											<td className="px-4 py-3">
												<select
													className="bg-[var(--card-bg)] border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
													value={call.status || "New"}
													onChange={(e) => handleStatusUpdate(call._id, e.target.value)}
												>
													<option value="New">New</option>
													<option value="Contacted">Contacted</option>
												</select>
											</td>
										</tr>
									))}
									{visibleCalls.length === 0 && (
										<tr>
											<td colSpan="10" className="px-6 py-12 text-center text-gray-500">No call requests found.</td>
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
