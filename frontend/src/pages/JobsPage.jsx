import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import API_URL from "../config/api";

export default function JobsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [locationQuery, setLocationQuery] = useState("");
	const [selectedExperience, setSelectedExperience] = useState([]);
	const [selectedJobType, setSelectedJobType] = useState("All");
	const [salaryQuery, setSalaryQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const { theme } = useTheme();

	const [jobs, setJobs] = useState([]);

	useEffect(() => {
		fetchJobs();
	}, []);

	const fetchJobs = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_URL}/api/jobs`);
			if (!response.ok) throw new Error("Failed to fetch jobs");
			const data = await response.json();
			// If we have data from database, use it.
			if (data && data.length > 0) {
				setJobs(data);
			} else {
				setJobs([]);
			}
		} catch (error) {
			console.error("Error fetching jobs:", error);
			setJobs([]); // Clear jobs on error
		} finally {
			setLoading(false);
		}
	};

	const [filters, setFilters] = useState({
		location: true,
		experience: true,
		jobType: false,
		salary: true,
	});

	const toggleFilter = (filter) => {
		setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
	};

	const handleCheckboxChange = (setter, value) => {
		setter((prev) => 
			prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
		);
	};

	// Filter logic
	const filteredJobs = jobs.filter((job) => {
		const matchesSearch =
			job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			job.company.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesLocation = job.location.toLowerCase().includes(locationQuery.toLowerCase());
		const matchesExperience = selectedExperience.length === 0 || selectedExperience.includes(job.experience);
		const matchesJobType = selectedJobType === "All" || job.type === selectedJobType;
		const matchesSalary = !salaryQuery || (job.salary || "").toLowerCase().includes(salaryQuery.toLowerCase());

		return matchesSearch && matchesLocation && matchesExperience && matchesJobType && matchesSalary;
	});

	return (
		<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-20 transition-colors duration-300'>
			{/* Search Header Section */}
			<section className='bg-[var(--card-bg)] py-12 border-b border-[var(--border-color)]'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 text-center'>
					<h1 className='text-3xl md:text-4xl font-bold mb-8'>
						Find Your Next <span className='text-blue-500'>Job</span> Here!
					</h1>
					<div className='relative max-w-3xl mx-auto shadow-lg rounded-xl overflow-hidden'>
						<input
							type='text'
							placeholder='Search'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full bg-[var(--bg-color)] border-none px-6 py-4 pr-12 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none transition duration-300'
						/>
						<button className='absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500'>
							<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
							</svg>
						</button>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className='px-4 md:px-6 py-12'>
				<div className='max-w-7xl mx-auto flex flex-col lg:flex-row gap-8'>
					{/* Sidebar Filter */}
					<aside className='lg:w-80 flex-shrink-0'>
						<div className='bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden transition-colors duration-300 shadow-sm'>
							<div className='p-6 border-b border-[var(--border-color)] flex items-center justify-between'>
								<h2 className='text-2xl font-bold'>Filter</h2>
								<button 
									onClick={() => {
										setSearchQuery("");
										setLocationQuery("");
										setSelectedExperience([]);
										setSelectedJobType("All");
										setSalaryQuery("");
									}}
									className='text-sm text-blue-500 hover:text-blue-600 font-medium'
								>
									Clear All
								</button>
							</div>

							{/* Location Filter */}
							<div className='border-b border-[var(--border-color)]'>
								<button
									onClick={() => toggleFilter("location")}
									className='w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--card-bg-hover)] transition-colors'
								>
									<span className='font-medium'>Location</span>
									<svg
										className={`w-5 h-5 transition-transform ${filters.location ? "rotate-180" : ""}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
									</svg>
								</button>
								{filters.location && (
									<div className='px-6 pb-6 pt-2'>
										<div className='relative'>
											<input
												type='text'
												placeholder='Enter location'
												value={locationQuery}
												onChange={(e) => setLocationQuery(e.target.value)}
												className='w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
											/>
											<svg className='absolute right-3 top-2.5 w-4 h-4 text-[var(--text-muted)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
											</svg>
										</div>
									</div>
								)}
							</div>

							{/* Experience Filter */}
							<div className='border-b border-[var(--border-color)]'>
								<button
									onClick={() => toggleFilter("experience")}
									className='w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--card-bg-hover)] transition-colors'
								>
									<span className='font-medium'>Experience</span>
									<svg
										className={`w-5 h-5 transition-transform ${filters.experience ? "rotate-180" : ""}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
									</svg>
								</button>
								{filters.experience && (
									<div className='px-6 pb-6 pt-2 space-y-3'>
										{["Fresher", "1 - 3 yr.", "3 - 6 yr.", "6+ yr."].map((exp) => (
											<label key={exp} className='flex items-center gap-3 cursor-pointer group'>
												<div className='relative flex items-center'>
													<input
														type='checkbox'
														checked={selectedExperience.includes(exp)}
														onChange={() => handleCheckboxChange(setSelectedExperience, exp)}
														className='w-4 h-4 rounded border-[var(--border-color)] text-blue-500 focus:ring-blue-500 bg-[var(--bg-color)] appearance-none border checked:bg-blue-500 checked:border-blue-500 transition-all'
													/>
													{selectedExperience.includes(exp) && (
														<svg className='absolute w-3 h-3 text-white left-0.5 pointer-events-none' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
														</svg>
													)}
												</div>
												<span className='text-sm group-hover:text-blue-500 transition-colors'>{exp}</span>
											</label>
										))}
									</div>
								)}
							</div>

							{/* Salary Filter */}
							<div className='border-b border-[var(--border-color)]'>
								<button
									onClick={() => toggleFilter("salary")}
									className='w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--card-bg-hover)] transition-colors'
								>
									<span className='font-medium'>Salary</span>
									<svg
										className={`w-5 h-5 transition-transform ${filters.salary ? "rotate-180" : ""}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
									</svg>
								</button>
								{filters.salary && (
										<div className='px-6 pb-6 pt-2'>
											<div className='relative'>
												<input
													type='text'
													placeholder='e.g. 4-8 LPA'
													value={salaryQuery}
													onChange={(e) => setSalaryQuery(e.target.value)}
													className='w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
												<svg className='absolute right-3 top-2.5 w-4 h-4 text-[var(--text-muted)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
												</svg>
											</div>
										</div>
								)}
							</div>

							{/* Job Type Filter */}
							<div className=''>
								<button
									onClick={() => toggleFilter("jobType")}
									className='w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--card-bg-hover)] transition-colors'
								>
									<span className='font-medium'>Job Type</span>
									<svg
										className={`w-5 h-5 transition-transform ${filters.jobType ? "rotate-180" : ""}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
									</svg>
								</button>
								{filters.jobType && (
									<div className='px-6 pb-6 pt-2 space-y-2'>
										{["All", "Full-Time", "Contract", "Internship"].map((type) => (
											<label key={type} className='flex items-center gap-3 cursor-pointer group'>
												<input
													type='radio'
													name='jobType'
													checked={selectedJobType === type}
													onChange={() => setSelectedJobType(type)}
													className='w-4 h-4 text-blue-500 focus:ring-blue-500 bg-[var(--bg-color)] border-[var(--border-color)]'
												/>
												<span className='text-sm group-hover:text-blue-500 transition-colors'>{type}</span>
											</label>
										))}
									</div>
								)}
							</div>
						</div>
					</aside>

					{/* Job List Area */}
					<div className='flex-1'>
						<h2 className='text-3xl font-bold mb-8'>
							All <span className='text-blue-500'>Jobs</span>
						</h2>

						<div className='space-y-4'>
							{loading ? (
								<div className='flex justify-center items-center py-20'>
									<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
								</div>
							) : filteredJobs.length > 0 ? (
								filteredJobs.map((job) => (
									<div
										key={job._id || job.id}
										className='bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 hover:shadow-md transition-shadow duration-300'
									>
										{/* Company Logo */}
										<div className='w-20 h-20 flex-shrink-0 bg-white rounded-lg border border-[var(--border-color)] flex items-center justify-center p-2'>
											<img
												src={job.logo?.trim() || "/job-default-logo.svg"}
												alt={job.company}
												className='max-w-full max-h-full object-contain'
												onError={(e) => {
													e.target.src = "/job-default-logo.svg";
												}}
											/>
										</div>

										{/* Job Info */}
										<div className='flex-1 text-center md:text-left'>
											<a 
												href={job.jobLink} 
												target="_blank" 
												rel="noopener noreferrer"
											>
												<h3 className='text-xl font-bold hover:text-blue-500 transition-colors mb-1 underline'>
													{job.title}
												</h3>
											</a>
											<p className='text-[var(--text-muted)] font-medium mb-3'>{job.company}</p>
											<div className='flex items-center justify-center md:justify-start gap-4 text-[var(--text-muted)] text-sm'>
												<div className='flex items-center gap-2'>
													<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
													</svg>
													{job.location}
												</div>
												<div className='flex items-center gap-2'>
													<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7h18M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2M8 11v6M12 11v6M16 11v6M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z' />
													</svg>
													{job.workMode || "Online"}
												</div>
												<div className='flex items-center gap-2'>
													<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
													</svg>
													{job.experience}
												</div>
												<div className='flex items-center gap-2'>
													<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1M12 16v1m4-12H8a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z' />
													</svg>
													{job.salary}
												</div>
											</div>
										</div>

										{/* Job Action */}
										<div className='mt-4 md:mt-0 flex flex-col items-center md:items-end gap-2'>
											<span className='px-8 py-2 border border-blue-500 text-blue-500 rounded-full text-sm font-semibold'>
												{job.type}
											</span>
										</div>
									</div>
								))
							) : (
								<div className='text-center py-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl'>
									<p className='text-[var(--text-muted)]'>No jobs found matching your criteria.</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Floating Button */}
			
		</div>
	);
}
