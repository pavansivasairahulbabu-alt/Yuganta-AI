import mongoose from "mongoose";
import Course from "./models/Course.js";
import Instructor from "./models/Instructor.js";
import dotenv from "dotenv";

dotenv.config();

const courses = [
	{
		title: "Agentic AI Crash Course",
		description: "A fast-paced introduction to building autonomous AI agents using modern frameworks. Learn the fundamentals of Agentic AI, RAG, and multi-agent systems in this intensive 4-week program.",
		instructor: "YugantaAI",
		rating: 4.8,
		students: 0,
		lessons: 15,
		duration: "30+ Hours",
		level: "Beginner",
		category: "AI & ML",
		thumbnail: "https://onug.net/wp-content/uploads/2025/02/ONUG-Blog-Image-1024x512-1.jpg",
		price: "3500",
		isFree: false,
		modules: [
			{
				title: "Introduction to AI Agents",
				description: "Understanding what makes an agent 'agentic'.",
				order: 1,
				videos: [
					{ 
						title: "What are AI Agents?", 
						url: "https://res.cloudinary.com/demo/video/upload/dog.mp4", 
						publicId: "demo/dog",
						duration: "15:00", 
						order: 1 
					},
					{ 
						title: "The Agentic Workflow", 
						url: "https://res.cloudinary.com/demo/video/upload/elephants.mp4", 
						publicId: "demo/elephants",
						duration: "20:00", 
						order: 2 
					}
				]
			},
			{
				title: "Building with LangChain & CrewAI",
				description: "Hands-on with the most popular agent frameworks.",
				order: 2,
				videos: [
					{ 
						title: "LangChain Agents", 
						url: "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4", 
						publicId: "demo/sea_turtle",
						duration: "25:00", 
						order: 1 
					},
					{ 
						title: "Multi-Agent Systems with CrewAI", 
						url: "https://res.cloudinary.com/demo/video/upload/finish_line.mp4", 
						publicId: "demo/finish_line",
						duration: "30:00", 
						order: 2 
					}
				]
			}
		]
	},
	{
		title: "Agentic AI Pioneer Program",
		description: "The most comprehensive program for mastering Agentic AI. Build advanced autonomous systems, master LangGraph, and deploy professional-grade AI agents. Includes 150+ hours of content and expert mentorship.",
		instructor: "YugantaAI",
		rating: 4.9,
		students: 0,
		lessons: 45,
		duration: "150 Hours",
		level: "Advanced",
		category: "AI & ML",
		thumbnail: "/Agentic_AI_DSA.png",
		price: "5000",
		isFree: false,
		modules: [
			{
				title: "Advanced Agent Architectures",
				description: "Deep dive into complex agent reasoning patterns.",
				order: 1,
				videos: [
					{ 
						title: "Planning & Reasoning", 
						url: "https://res.cloudinary.com/demo/video/upload/dog.mp4", 
						publicId: "demo/dog",
						duration: "35:00", 
						order: 1 
					},
					{ 
						title: "Memory & State Management", 
						url: "https://res.cloudinary.com/demo/video/upload/elephants.mp4", 
						publicId: "demo/elephants",
						duration: "40:00", 
						order: 2 
					}
				]
			},
			{
				title: "Mastering LangGraph",
				description: "Building cyclic and controllable agent workflows.",
				order: 2,
				videos: [
					{ 
						title: "Stateful Graphs", 
						url: "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4", 
						publicId: "demo/sea_turtle",
						duration: "45:00", 
						order: 1 
					},
					{ 
						title: "Human-in-the-loop Systems", 
						url: "https://res.cloudinary.com/demo/video/upload/finish_line.mp4", 
						publicId: "demo/finish_line",
						duration: "50:00", 
						order: 2 
					}
				]
			}
		]
	},
	{
		title: "Mastering Data Structures & Algorithms",
		description: "Build a rock-solid foundation in problem-solving and computer science fundamentals. Master arrays, linked lists, trees, graphs, and dynamic programming to ace your technical interviews.",
		instructor: "YugantaAI",
		rating: 4.7,
		students: 0,
		lessons: 36,
		duration: "40+ Hours",
		level: "Intermediate",
		category: "Programming",
		thumbnail: "https://miro.medium.com/1*u1dfDjx8WS86XlELNL252Q.jpeg",
		price: "7000",
		isFree: false,
		modules: [
			{
				title: "Linear Data Structures",
				description: "Master the building blocks of data organization.",
				order: 1,
				videos: [
					{ 
						title: "Arrays & Strings Mastery", 
						url: "https://res.cloudinary.com/demo/video/upload/dog.mp4", 
						publicId: "demo/dog",
						duration: "30:00", 
						order: 1 
					},
					{ 
						title: "Linked Lists Deep Dive", 
						url: "https://res.cloudinary.com/demo/video/upload/elephants.mp4", 
						publicId: "demo/elephants",
						duration: "35:00", 
						order: 2 
					}
				]
			},
			{
				title: "Non-Linear Data Structures",
				description: "Understanding trees, graphs, and their applications.",
				order: 2,
				videos: [
					{ 
						title: "Binary Trees & BST", 
						url: "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4", 
						publicId: "demo/sea_turtle",
						duration: "40:00", 
						order: 1 
					},
					{ 
						title: "Graph Traversals (BFS/DFS)", 
						url: "https://res.cloudinary.com/demo/video/upload/finish_line.mp4", 
						publicId: "demo/finish_line",
						duration: "45:00", 
						order: 2 
					}
				]
			}
		]
	}
];

const seedCourses = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("MongoDB connected...");

		// Clear existing courses
		await Course.deleteMany({});
		console.log("Existing courses cleared");

		// Delete Instructor "Pavan" if exists
		await Instructor.deleteOne({ name: "Pavan" });
		console.log("Instructor 'Pavan' deleted");

		// Find or Create Instructor "YugantaAI"
		let instructorObj = await Instructor.findOne({ name: "YugantaAI" });
		if (!instructorObj) {
			instructorObj = new Instructor({
				name: "YugantaAI",
				email: "instructor@yugantaai.com",
				expertise: "AI & Full Stack",
				bio: "Expert Instructor for AI and Programming courses.",
				photo: "https://via.placeholder.com/150",
				company: "YugantaAI",
				active: true,
				approved: true
			});
			await instructorObj.save();
			console.log("Created instructor 'YugantaAI'.");
		}

		// Insert new courses
		const coursesWithInstructor = courses.map(course => ({
			...course,
			instructorId: instructorObj._id
		}));

		await Course.insertMany(coursesWithInstructor);
		console.log(`${courses.length} courses added successfully!`);

		process.exit(0);
	} catch (error) {
		console.error("Error seeding courses:", error);
		process.exit(1);
	}
};

seedCourses();
