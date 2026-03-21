import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function FreeCourses() {
	const navigate = useNavigate();

	const staticCourses = [
		{
			id: "agentic-ai-crash-course",
			title: "Agentic AI Crash Course",
			duration: "30+ Hours",
			weeks: "4 Weeks",
			thumbnail: "https://onug.net/wp-content/uploads/2025/02/ONUG-Blog-Image-1024x512-1.jpg", 
			topics: ["AI Agents", "RAG", "LangChain", "AutoGen", "CrewAI"],
			path: "/courses/agentic-ai-crash-course-page"
		},
		{
			id: "agentic-ai-pioneer-program",
			title: "Agentic AI Pioneer Program",
			duration: "150 Hours",
			weeks: "4 Months",
			thumbnail: "./pioneerthumb.png",
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

	return (
		<section
			id='free-courses'
			className='py-12 md:py-24 px-4 md:px-6 bg-[var(--bg-color)] text-[var(--text-color)] relative overflow-hidden transition-colors duration-300'>
			
			<div className='max-w-7xl mx-auto relative z-10'>
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
								onClick={() => {
									navigate(course.path);
								}}
								className="block w-full text-center py-3.5 rounded-2xl border text-base font-semibold transition-all duration-300 border-blue-400/50 text-[var(--text-color)] hover:bg-blue-500 hover:text-white hover:border-blue-500"
							>
								Enroll Now
							</button>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
