import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";
import LearningPaths from "../components/LearningPaths";

export default function CoursesPage() {
	const navigate = useNavigate();

	const staticCourses = [
		{
			id: "agentic-ai-crash-course",
			title: "Agentic AI Crash Course",
			duration: "80+ Hours",
			weeks: "4 Weeks",
			thumbnail: "https://onug.net/wp-content/uploads/2025/02/ONUG-Blog-Image-1024x512-1.jpg", 
			topics: ["AI Agents", "RAG", "LangChain", "AutoGen", "CrewAI"],
			path: "/courses/agentic-ai-crash-course-page"
		},
		{
			id: "agentic-ai-pioneer-program",
			title: "Agentic AI Pioneer Program",
			duration: "150+ Hours",
			weeks: "4 Months",
			thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*LtgPxfl-J6dJrg9rRgWdGA.png",
			topics: ["DSA", "ML & DL", "LangChain", "CrewAI", "LangGraph", "AI Agents", "RAG", "AutoGen"],
			path: "/courses/agentic-ai-pioneer-program"
		},
		{
			id: "mastering-dsa-algorithms",
			title: "Mastering Data Structures & Algorithms",
			duration: "40+ Hours",
			weeks: "6 Weeks",
			thumbnail: "https://miro.medium.com/1*u1dfDjx8WS86XlELNL252Q.jpeg",
			topics: ["Arrays", "Linked Lists", "Stacks & Queues", "Searching & Sorting", "Trees & Graphs"],
			path: "/courses/dsa-machine-learning"
		}
	];

	// Animated images for the slider
	const sliderImages = [
		"https://images.unsplash.com/photo-1551434678-e076c223a692?w=400",
		"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
		"https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400",
		"https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400",
		"https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400",
	];

	return (
		<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-20 transition-colors duration-300'>
			{/* Hero Section */}
			<section className='px-4 md:px-6 py-12 md:py-16 relative overflow-hidden'>
				<div className='max-w-7xl mx-auto'>
					<div className='flex flex-col lg:flex-row items-center justify-between gap-12'>
						{/* Left Content */}
						<div className='flex-1'>
							<h1 className='text-4xl md:text-6xl font-bold mb-6'>
								<span className='bg-gradient-to-r from-[#2373f3] via-[#549ffb] to-[#6caffb] bg-clip-text text-transparent'>
									Courses
								</span>
							</h1>

							<p className='text-gray-500 text-lg mb-12 max-w-xl'>
								Kickstart your AI career with foundational
								tracks and skill-specific short courses, all
								taught by leading experts in the field.
							</p>

							{/* Statistics */}
							<div className='flex flex-wrap gap-6 md:gap-12 mb-12'>
								<div>
									<div className='text-3xl md:text-4xl font-bold mb-2'>
										100+
									</div>
									<div className='text-gray-400'>
										Enrollments
									</div>
								</div>
								<div>
									<div className='text-4xl font-bold mb-2'>
										4.1
									</div>
									<div className='text-gray-400'>
										Average Rating
									</div>
								</div>
								<div>
									<div className='text-4xl font-bold mb-2'>
										5+
									</div>
									<div className='text-gray-400'>Courses</div>
								</div>
							</div>
						</div>

						{/* Right Side - Animated Image Grid */}
						<div className='flex-1 relative h-[300px] md:h-[500px] w-full max-w-lg'>
							<ImageSlider images={sliderImages} />
						</div>
					</div>
				</div>
			</section>

			{/* Courses Section */}
			<section className='px-4 md:px-6 py-12 bg-[var(--bg-color)]'>
				<div className='max-w-7xl mx-auto'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
						{staticCourses.map((course) => (
							<div
								key={course.id}
								className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
								
								{/* Thumbnail */}
								<div className="w-full h-44 md:h-48 overflow-hidden rounded-2xl mb-5">
									<img
										src={course.thumbnail}
										alt={course.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								</div>

								{/* Duration/Weeks */}
								<div className="flex items-center gap-3 text-[var(--text-muted)] text-sm mb-4">
									<span>{course.duration}</span>
									<span>•</span>
									<span>{course.weeks}</span>
								</div>

								{/* Title */}
								<h3 className="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-4 leading-tight group-hover:text-[#A855F7] transition-colors">
									{course.title}
								</h3>

								{/* Topics */}
								<div className="flex flex-wrap gap-2 mb-6 min-h-[80px]">
									{course.topics.map((topic, index) => (
										<span 
											key={index}
											className="px-3 py-1 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)] group-hover:border-[#A855F7]/30 transition-colors"
										>
											{topic}
										</span>
									))}
								</div>

								{/* Enroll Button */}
								<button
									onClick={() => navigate(course.path)}
									className="block w-full text-center py-3.5 rounded-2xl border border-blue-400/50 text-base text-[var(--text-color)] font-semibold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
								>
									Enroll Now
								</button>
							</div>
						))}
					</div>
				</div>
			</section>

			<LearningPaths />
		</div>
	);
}
// Image Slider Component with Animation
function ImageSlider({ images }) {
	const [positions, setPositions] = useState(() =>
		images.map((_, index) => ({
			x: Math.random() * 60,
			y: Math.random() * 60,
			rotation: Math.random() * 20 - 10,
			scale: 0.8 + Math.random() * 0.4,
			delay: index * 0.2,
		}))
	);

	useEffect(() => {
		// Animate positions
		const interval = setInterval(() => {
			setPositions((prev) =>
				prev.map((pos) => ({
					...pos,
					x: Math.random() * 60,
					y: Math.random() * 60,
					rotation: Math.random() * 20 - 10,
				}))
			);
		}, 3000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className='relative w-full h-full'>
			{images.map((img, index) => (
				<div
					key={index}
					className='absolute w-48 h-32 rounded-lg overflow-hidden shadow-2xl transition-all duration-1000 ease-in-out'
					style={{
						left: `${positions[index]?.x || 0}%`,
						top: `${positions[index]?.y || 0}%`,
						transform: `rotate(${positions[index]?.rotation || 0
							}deg) scale(${positions[index]?.scale || 1})`,
						transitionDelay: `${positions[index]?.delay || 0}s`,
						zIndex: index,
					}}>
					<img
						src={img}
						alt={`Course ${index + 1}`}
						className='w-full h-full object-cover'
					/>
				</div>
			))}
		</div>
	);
}
