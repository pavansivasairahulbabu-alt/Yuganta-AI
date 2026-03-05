import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import API_URL from "../config/api";

export default function BlogsPage() {
	const [blogs, setBlogs] = useState([]);
	const [featuredBlog, setFeaturedBlog] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState("All");

	const categories = [
		"All",
		"GenAI",
		"Machine Learning",
		"Deep Learning",
		"AI Agents",
		"Data Science",
		"Python",
		"Interview Prep",
		"Career",
	];

	const fetchBlogs = async () => {
		try {
			const response = await fetch(`${API_URL}/api/blogs`);
			const data = await response.json();

			const featured = data.find(blog => blog.featured);
			setFeaturedBlog(featured);
			setBlogs(data.filter(blog => !blog.featured));
			setLoading(false);
		} catch (error) {
			console.error("Error fetching blogs:", error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBlogs();
	}, []);

	const getFilteredBlogs = () => {
		if (selectedCategory === "All") return blogs;
		return blogs.filter(blog => blog.category === selectedCategory);
	};

	const getMostPopularBlogs = () => {
		return [...blogs].sort((a, b) => b.views - a.views).slice(0, 4);
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("en-US", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300'>
			{/* Header with back button and scrollable categories */}
			<div className='bg-white border-b border-gray-200 sticky top-0 z-40'>
				<div className='max-w-7xl mx-auto px-4 md:px-6'>
					<div className='flex items-center space-x-4 md:space-x-6 overflow-x-auto py-4 scrollbar-hide'>
						<Link
							to='/'
							className='flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium transition whitespace-nowrap'>
							<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
							</svg>
							<span>Back</span>
						</Link>
						{categories.map((category) => (
							<button
								key={category}
								onClick={() => setSelectedCategory(category)}
								className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${selectedCategory === category
									? "bg-gray-900 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}>
								{category}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className='max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12'>
				{/* Featured Blog */}
				{featuredBlog && (
					<Link
						to={`/blogs/${featuredBlog.slug}`}
						className='block mb-12 md:mb-16'>
						<div className='bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1'>
							<div className='grid md:grid-cols-2 gap-0'>
								<div className='relative h-64 md:h-auto'>
									<span className='absolute top-4 left-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold z-10'>
										Featured Blog
									</span>
									<img
										src={featuredBlog.thumbnail}
										alt={featuredBlog.title}
										className='w-full h-full object-cover'
									/>
								</div>
								<div className='p-6 md:p-12 flex flex-col justify-center'>
									<h1 className='text-2xl md:text-4xl font-bold text-gray-900 mb-4 hover:text-purple-600 transition'>
										{featuredBlog.title}
									</h1>
									<div className='flex items-center space-x-4 text-sm text-gray-600 mb-4'>
										<span>{featuredBlog.author}</span>
										<span>•</span>
										<span>{formatDate(featuredBlog.createdAt)}</span>
									</div>
									<p className='text-gray-600 leading-relaxed mb-6'>
										{featuredBlog.excerpt}
									</p>
									<div className='flex items-center space-x-4 text-sm text-gray-500'>
										<span className='flex items-center space-x-1'>
											<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
											</svg>
											<span>{featuredBlog.views} views</span>
										</span>
										<span>•</span>
										<span>{featuredBlog.readTime}</span>
									</div>
								</div>
							</div>
						</div>
					</Link>
				)}

				{/* Latest Articles */}
				<div className='mb-12 md:mb-16'>
					<div className='flex items-center justify-between mb-8'>
						<h2 className='text-2xl md:text-3xl font-bold'>Latest Articles</h2>
						<Link
							to='/blogs'
							className='text-blue-400 hover:text-blue-300 flex items-center space-x-2 transition'>
							<span>View all</span>
							<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
							</svg>
						</Link>
					</div>

					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{getFilteredBlogs().slice(0, 4).map((blog) => (
							<Link
								key={blog._id}
								to={`/blogs/${blog.slug}`}
								className='group'>
								<div className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 h-full flex flex-col'>
									<div className='relative h-48'>
										<img
											src={blog.thumbnail}
											alt={blog.title}
											className='w-full h-full object-cover group-hover:scale-110 transition duration-500'
										/>
										<div className='absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold'>
											{blog.category}
										</div>
									</div>
									<div className='p-6 flex flex-col flex-1'>
										<h3 className='text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition'>
											{blog.title}
										</h3>
										<div className='flex items-center space-x-2 text-xs text-gray-500 mb-3'>
											<span>{blog.author}</span>
											<span>•</span>
											<span>{formatDate(blog.createdAt)}</span>
										</div>
										<div className='mt-auto flex items-center justify-between text-xs text-gray-500'>
											<span>{blog.readTime}</span>
											<span className='flex items-center space-x-1'>
												<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
												</svg>
												<span>{blog.views}</span>
											</span>
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Most Popular Articles */}
				<div>
					<div className='flex items-center justify-between mb-8'>
						<h2 className='text-2xl md:text-3xl font-bold'>Most Popular Articles</h2>
						<Link
							to='/blogs'
							className='text-blue-400 hover:text-blue-300 flex items-center space-x-2 transition'>
							<span>View all</span>
							<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
							</svg>
						</Link>
					</div>

					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{getMostPopularBlogs().map((blog) => (
							<Link
								key={blog._id}
								to={`/blogs/${blog.slug}`}
								className='group'>
								<div className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 h-full flex flex-col'>
									<div className='relative h-48'>
										<img
											src={blog.thumbnail}
											alt={blog.title}
											className='w-full h-full object-cover'
										/>
									</div>
									<div className='p-6 flex flex-col flex-1'>
										<h3 className='text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition'>
											{blog.title}
										</h3>
										<div className='flex items-center space-x-2 text-xs text-gray-500 mb-3'>
											<span>{blog.author}</span>
											<span>•</span>
											<span className='text-green-600 font-semibold'>Last Updated: {formatDate(blog.updatedAt)}</span>
										</div>
										<p className='text-sm text-gray-600 line-clamp-3 mb-4'>
											{blog.excerpt}
										</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Roadmap Section */}
				<div className='mt-16 bg-gradient-to-r from-gray-900 to-black rounded-3xl p-8 md:p-12'>
					<h2 className='text-2xl md:text-3xl font-bold mb-8 text-center'>Roadmap for 2026</h2>
					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{[
							{
								title: "Learning Path for AI Agents",
								description: "Learn AI Agents basics to advanced RAG systems, tools, & frameworks. Build autonomous agents from scratch.",
								color: "from-purple-500 to-pink-500",
							},
							{
								title: "Roadmap to Learn Generative AI",
								description: "This learning path guides users, developers, and researchers through mastering cutting-edge AI tools and trends.",
								color: "from-red-500 to-orange-500",
							},
							{
								title: "Learn All About AgentOps",
								description: "Structured six-month roadmap that takes you from fundamentals to full mastery of the agent lifecycle.",
								color: "from-pink-500 to-red-500",
							},
							{
								title: "Learning Path for Data Scientist",
								description: "Start with basics, advance through ML and deep learning, and excel with real-world projects.",
								color: "from-purple-500 to-blue-500",
							},
						].map((roadmap, index) => (
							<div
								key={index}
								className='bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition duration-300'>
								<h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${roadmap.color} bg-clip-text text-transparent`}>
									{roadmap.title}
								</h3>
								<p className='text-gray-400 text-sm mb-6'>
									{roadmap.description}
								</p>
								<button className='text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center space-x-2 transition'>
									<span>Explore</span>
									<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
									</svg>
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
