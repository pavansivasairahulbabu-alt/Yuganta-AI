import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import LoadingSpinner from "../components/LoadingSpinner";
import API_URL from "../config/api";

export default function BlogDetailPage() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const [blog, setBlog] = useState(null);
	const [relatedBlogs, setRelatedBlogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [liked, setLiked] = useState(false);

	const fetchBlog = async () => {
		try {
			const response = await fetch(`${API_URL}/api/blogs/${slug}`);
			if (!response.ok) throw new Error("Blog not found");
			const data = await response.json();
			setBlog(data);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching blog:", error);
			navigate("/blogs");
		}
	};

	const fetchRelatedBlogs = async () => {
		try {
			const response = await fetch(`${API_URL}/api/blogs`);
			const data = await response.json();
			setRelatedBlogs(data.filter(b => b.slug !== slug).slice(0, 3));
		} catch (error) {
			console.error("Error fetching related blogs:", error);
		}
	};

	useEffect(() => {
		fetchBlog();
		fetchRelatedBlogs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug]);

	const handleLike = async () => {
		try {
			const response = await fetch(`${API_URL}/api/blogs/${slug}/like`, {
				method: "POST",
			});
			const data = await response.json();
			setLiked(true);
			setBlog({ ...blog, likes: data.likes });
		} catch (error) {
			console.error("Error liking blog:", error);
		}
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

	if (!blog) return null;

	return (
		<div className='min-h-screen bg-white'>
			{/* Simple Navbar */}
			<nav className='bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between'>
					<Link to='/' className='flex items-center space-x-2 group'>
						<img 
							src='/yuganta-logo.png' 
							alt='yuganta AI' 
							className='w-8 h-8 transition-transform group-hover:scale-110'
						/>
						<span className='text-xl font-bold text-white'>
							<span className='text-white'>Yuganta</span>
							<span className='bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent'>AI</span>
						</span>
					</Link>
					<div className='flex items-center space-x-4'>
						<Link
							to='/blogs'
							className='text-gray-300 hover:text-white transition text-sm md:text-base'>
							← Back to Blogs
						</Link>
						<Link
							to='/'
							className='text-gray-300 hover:text-white transition text-sm md:text-base'>
							Home
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<div className='relative h-96 md:h-[500px] bg-gradient-to-r from-purple-900 to-indigo-900'>
				<img
					src={blog.thumbnail}
					alt={blog.title}
					className='w-full h-full object-cover opacity-40'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='max-w-4xl mx-auto px-4 md:px-6 text-center'>
						<span className='inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4'>
							{blog.category}
						</span>
						<h1 className='text-3xl md:text-5xl font-bold text-white mb-6 leading-tight'>
							{blog.title}
						</h1>
						<div className='flex items-center justify-center space-x-6 text-white/90'>
							<div className='flex items-center space-x-2'>
								<div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-bold'>
									{blog.author.charAt(0)}
								</div>
								<span>{blog.author}</span>
							</div>
							<span>•</span>
							<span>{formatDate(blog.createdAt)}</span>
							<span>•</span>
							<span>{blog.readTime}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className='max-w-4xl mx-auto px-4 md:px-6 py-12'>
				{/* Stats Bar */}
				<div className='flex items-center justify-between py-6 border-b border-gray-200 mb-8'>
					<div className='flex items-center space-x-6'>
						<div className='flex items-center space-x-2 text-gray-600'>
							<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
							</svg>
							<span>{blog.views} views</span>
						</div>
						<button
							onClick={handleLike}
							disabled={liked}
							className={`flex items-center space-x-2 transition ${
								liked ? "text-red-500" : "text-gray-600 hover:text-red-500"
							}`}>
							<svg className={`w-5 h-5 ${liked ? "fill-current" : ""}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
							</svg>
							<span>{blog.likes}</span>
						</button>
					</div>
					<div className='flex items-center space-x-4'>
						<button className='text-gray-600 hover:text-purple-600 transition'>
							<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
							</svg>
						</button>
						<button className='text-gray-600 hover:text-purple-600 transition'>
							<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' />
							</svg>
						</button>
					</div>
				</div>

				{/* Blog Content */}
				<div className='prose prose-lg max-w-none'>
					<div className='text-gray-700 leading-relaxed'>
						<ReactMarkdown
							components={{
								h1: ({...props}) => <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
								h2: ({...props}) => <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
								h3: ({...props}) => <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
								p: ({...props}) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
								ul: ({...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
								ol: ({...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
								li: ({...props}) => <li className="text-gray-700" {...props} />,
								code: ({inline, ...props}) => 
									inline ? 
									<code className="bg-gray-100 text-purple-600 px-2 py-1 rounded text-sm font-mono" {...props} /> :
									<code className="block bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm" {...props} />,
								strong: ({...props}) => <strong className="font-bold text-gray-900" {...props} />,
							}}>
							{blog.content}
						</ReactMarkdown>
					</div>
				</div>

				{/* Tags */}
				<div className='mt-12 pt-8 border-t border-gray-200'>
					<div className='flex flex-wrap gap-2'>
						{blog.tags.map((tag, index) => (
							<span
								key={index}
								className='px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition cursor-pointer'>
								#{tag}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Related Blogs */}
			{relatedBlogs.length > 0 && (
				<div className='bg-gray-50 py-16'>
					<div className='max-w-7xl mx-auto px-4 md:px-6'>
						<h2 className='text-3xl font-bold mb-8 text-gray-900'>Related Articles</h2>
						<div className='grid md:grid-cols-3 gap-6'>
							{relatedBlogs.map((relatedBlog) => (
								<Link
									key={relatedBlog._id}
									to={`/blogs/${relatedBlog.slug}`}
									className='group'>
									<div className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 h-full flex flex-col'>
										<div className='relative h-48'>
											<img
												src={relatedBlog.thumbnail}
												alt={relatedBlog.title}
												className='w-full h-full object-cover group-hover:scale-110 transition duration-500'
											/>
										</div>
										<div className='p-6 flex flex-col flex-1'>
											<h3 className='text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition'>
												{relatedBlog.title}
											</h3>
											<div className='flex items-center space-x-2 text-xs text-gray-500 mb-3'>
												<span>{relatedBlog.author}</span>
												<span>•</span>
												<span>{formatDate(relatedBlog.createdAt)}</span>
											</div>
											<p className='text-sm text-gray-600 line-clamp-3 mb-4'>
												{relatedBlog.excerpt}
											</p>
											<div className='mt-auto text-purple-600 font-semibold text-sm flex items-center space-x-2 group-hover:translate-x-2 transition'>
												<span>Read more</span>
												<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
												</svg>
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
