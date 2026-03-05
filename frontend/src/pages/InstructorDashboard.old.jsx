import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useInstructor } from "../context/InstructorContext";
import VideoUpload from "../components/VideoUpload";

export default function InstructorDashboard() {
	const [courses, setCourses] = useState([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingCourse, setEditingCourse] = useState(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		instructor: "",
		duration: "",
		level: "Beginner",
		price: "",
		thumbnail: "",
		category: "AI & ML",
		videoUrl: "",
		videoPublicId: "",
		videos: [],
	});
	const [uploadingVideo, setUploadingVideo] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const { instructor, logout, isAuthenticated } = useInstructor();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/instructor", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		fetchCourses();
	}, []);

	const fetchCourses = async () => {
		try {
			const response = await fetch("http://localhost:5000/api/courses");
			const data = await response.json();
			setCourses(data);
		} catch (error) {
			console.error("Error fetching courses:", error);
		}
	};

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const url = editingCourse
				? `http://localhost:5000/api/courses/${editingCourse._id}`
				: "http://localhost:5000/api/courses";

			const response = await fetch(url, {
				method: editingCourse ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setShowAddModal(false);
				setEditingCourse(null);
				setFormData({
					title: "",
					description: "",
					instructor: "",
					duration: "",
					level: "Beginner",
					price: "",
					thumbnail: "",
					category: "AI & ML",
				});
				fetchCourses();
			}
		} catch (error) {
			console.error("Error saving course:", error);
		}
	};

	const handleEdit = (course) => {
		setEditingCourse(course);
		setFormData({
			title: course.title,
			description: course.description,
			instructor: course.instructor,
			duration: course.duration,
			level: course.level,
			price: course.price,
			thumbnail: course.thumbnail,
			category: course.category,
			videoUrl: course.videoUrl || "",
			videoPublicId: course.videoPublicId || "",
			videos: course.videos || [],
		});
		setShowAddModal(true);
	};

	const handleDelete = async (courseId) => {
		if (!window.confirm("Are you sure you want to delete this course?")) {
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:5000/api/courses/${courseId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				fetchCourses();
			}
		} catch (error) {
			console.error("Error deleting course:", error);
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/instructor");
	};

	if (!instructor) {
		return null;
	}

	return (
		<div className='min-h-screen bg-[#0a0a0a]'>
			{/* Header */}
			<header className='bg-[#1a1a1a] text-white px-6 py-4 sticky top-0 z-50 shadow-lg'>
				<div className='max-w-7xl mx-auto flex items-center justify-between'>
					<div className='flex items-center space-x-6'>
						<Link to='/' className='flex items-center space-x-2'>
							<svg
								className='w-10 h-10'
								viewBox='0 0 50 50'
								fill='none'>
								<path
									d='M10 40 L25 10 L40 40 M15 35 L35 35'
									stroke='white'
									strokeWidth='3'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
							<div className='text-xl font-bold'>
								<span className='text-white'>Mero</span>
								<span className='text-blue-400'>sphere</span>
							</div>
						</Link>
						<span className='text-sm text-gray-400'>
							Instructor Portal
						</span>
					</div>

					<div className='flex items-center space-x-4'>
						<div className='flex items-center space-x-3'>
							<div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold'>
								I
							</div>
							<span className='text-sm'>{instructor.email}</span>
						</div>
						<button
							onClick={handleLogout}
							className='px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition duration-200 text-sm'>
							Logout
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className='max-w-7xl mx-auto px-6 py-8'>
				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					<div className='bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white'>
						<div className='text-3xl font-bold mb-2'>
							{courses.length}
						</div>
						<div className='text-blue-100'>Total Courses</div>
					</div>
					<div className='bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white'>
						<div className='text-3xl font-bold mb-2'>0</div>
						<div className='text-purple-100'>Total Students</div>
					</div>
					<div className='bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white'>
						<div className='text-3xl font-bold mb-2'>
							{
								courses.filter((c) => c.level === "Beginner")
									.length
							}
						</div>
						<div className='text-green-100'>Beginner Courses</div>
					</div>
				</div>

				{/* Course Management */}
				<div className='bg-[#1a1a1a] rounded-xl p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-2xl font-bold text-white'>
							Manage Courses
						</h2>
						<button
							onClick={() => setShowAddModal(true)}
							className='px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition duration-200 flex items-center space-x-2'>
							<svg
								className='w-5 h-5'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 4v16m8-8H4'
								/>
							</svg>
							<span>Add New Course</span>
						</button>
					</div>

					{/* Courses Table */}
					<div className='overflow-x-auto'>
						<table className='w-full text-left text-white'>
							<thead className='border-b border-gray-700'>
								<tr>
									<th className='pb-3 px-4'>Course</th>
									<th className='pb-3 px-4'>Instructor</th>
									<th className='pb-3 px-4'>Level</th>
									<th className='pb-3 px-4'>Duration</th>
									<th className='pb-3 px-4'>Price</th>
									<th className='pb-3 px-4'>Actions</th>
								</tr>
							</thead>
							<tbody>
								{courses.map((course) => (
									<tr
										key={course._id}
										className='border-b border-gray-800 hover:bg-gray-900'>
										<td className='py-4 px-4'>
											<div className='flex items-center space-x-3'>
												<img
													src={
														course.thumbnail ||
														"https://via.placeholder.com/60"
													}
													alt={course.title}
													className='w-12 h-12 rounded-lg object-cover'
												/>
												<div>
													<div className='font-semibold'>
														{course.title}
													</div>
													<div className='text-xs text-gray-400'>
														{course.category}
													</div>
												</div>
											</div>
										</td>
										<td className='py-4 px-4 text-gray-300'>
											{course.instructor}
										</td>
										<td className='py-4 px-4'>
											<span
												className={`px-2 py-1 rounded-full text-xs ${
													course.level === "Beginner"
														? "bg-green-500/20 text-green-300"
														: course.level ===
														  "Intermediate"
														? "bg-blue-500/20 text-blue-300"
														: "bg-purple-500/20 text-purple-300"
												}`}>
												{course.level}
											</span>
										</td>
										<td className='py-4 px-4 text-gray-300'>
											{course.duration}
										</td>
										<td className='py-4 px-4 text-gray-300'>
											{course.price === "Free"
												? "Free"
												: `$${course.price}`}
										</td>
										<td className='py-4 px-4'>
											<div className='flex space-x-2'>
												<button
													onClick={() =>
														handleEdit(course)
													}
													className='p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-200'>
													<svg
														className='w-4 h-4'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
														/>
													</svg>
												</button>
												<button
													onClick={() =>
														handleDelete(course._id)
													}
													className='p-2 bg-red-600 hover:bg-red-700 rounded-lg transition duration-200'>
													<svg
														className='w-4 h-4'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Add/Edit Modal */}
			{showAddModal && (
				<div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
					<div className='bg-[#1a1a1a] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-2xl font-bold text-white'>
								{editingCourse
									? "Edit Course"
									: "Add New Course"}
							</h3>
							<button
								onClick={() => {
									setShowAddModal(false);
									setEditingCourse(null);
									setFormData({
										title: "",
										description: "",
										instructor: "",
										duration: "",
										level: "Beginner",
										price: "",
										thumbnail: "",
										category: "AI & ML",
										videoUrl: "",
										videoPublicId: "",
										videos: [],
									});
								}}
								className='text-gray-400 hover:text-white'>
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						<form onSubmit={handleSubmit} className='space-y-4'>
							<div>
								<label className='block text-white mb-2 text-sm'>
									Course Title
								</label>
								<input
									type='text'
									name='title'
									value={formData.title}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
									required
								/>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm'>
									Description
								</label>
								<textarea
									name='description'
									value={formData.description}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
									rows='3'
									required></textarea>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-white mb-2 text-sm'>
										Instructor
									</label>
									<input
										type='text'
										name='instructor'
										value={formData.instructor}
										onChange={handleInputChange}
										className='w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										required
									/>
								</div>

								<div>
									<label className='block text-white mb-2 text-sm'>
										Duration
									</label>
									<input
										type='text'
										name='duration'
										value={formData.duration}
										onChange={handleInputChange}
										placeholder='e.g., 4 weeks'
										className='w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										required
									/>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-white mb-2 text-sm'>
										Level
									</label>
									<select
										name='level'
										value={formData.level}
										onChange={handleInputChange}
										className='w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'>
										<option>Beginner</option>
										<option>Intermediate</option>
										<option>Advanced</option>
									</select>
								</div>

								<div>
									<label className='block text-white mb-2 text-sm'>
										Price
									</label>
									<input
										type='text'
										name='price'
										value={formData.price}
										onChange={handleInputChange}
										placeholder='Free or amount'
										className='w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
										required
									/>
								</div>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm'>
									Category
								</label>
								<input
									type='text'
									name='category'
									value={formData.category}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
									required
								/>
							</div>

							<div>
								<label className='block text-white mb-2 text-sm'>
									Thumbnail URL
								</label>
								<input
									type='url'
									name='thumbnail'
									value={formData.thumbnail}
									onChange={handleInputChange}
									placeholder='https://example.com/image.jpg'
									className='w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								/>
							</div>

							{/* Video Upload Component */}
							<VideoUpload
								existingVideo={formData.videoUrl}
								onUploadSuccess={(videoData) => {
									setFormData({
										...formData,
										videoUrl: videoData.url,
										videoPublicId: videoData.publicId,
									});
								}}
							/>

							<div className='flex space-x-4 pt-4'>
								<button
									type='submit'
									className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition duration-200 font-semibold'>
									{editingCourse
										? "Update Course"
										: "Create Course"}
								</button>
								<button
									type='button'
									onClick={() => {
										setShowAddModal(false);
										setEditingCourse(null);
									}}
									className='px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
