import mongoose from "mongoose";
import Course from "./models/Course.js";
import Instructor from "./models/Instructor.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const newCourses = [
	{
		title: "AIML",
		description: "Master Artificial Intelligence and Machine Learning from fundamentals to advanced applications. Build intelligent systems, work with neural networks, and create cutting-edge AI solutions. Perfect for aspiring AI engineers and data scientists.",
		instructor: "Pavan",
		rating: 4.5,
		students: 0,
		lessons: 48,
		duration: "6 weeks",
		level: "Intermediate",
		category: "AI & ML",
		thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
		price: "Free",
		isFree: true,
		modules: [
			{
				title: "Introduction to AI & ML",
				description: "Understanding the fundamentals of Artificial Intelligence and Machine Learning",
				order: 1,
				videos: [
					{ title: "What is AI and ML?", url: "", duration: "20:00", description: "Introduction to AI/ML concepts", order: 1 },
					{ title: "Types of Machine Learning", url: "", duration: "25:30", description: "Supervised, Unsupervised, Reinforcement Learning", order: 2 },
					{ title: "Python for AI/ML", url: "", duration: "30:15", description: "Essential Python libraries", order: 3 }
				]
			},
			{
				title: "Supervised Learning",
				description: "Deep dive into supervised learning algorithms",
				order: 2,
				videos: [
					{ title: "Linear Regression", url: "", duration: "28:00", description: "Understanding regression models", order: 1 },
					{ title: "Classification Algorithms", url: "", duration: "32:20", description: "Decision Trees, SVM, KNN", order: 2 },
					{ title: "Model Evaluation", url: "", duration: "22:15", description: "Metrics and validation techniques", order: 3 }
				]
			},
			{
				title: "Deep Learning",
				description: "Neural networks and deep learning fundamentals",
				order: 3,
				videos: [
					{ title: "Neural Networks Basics", url: "", duration: "35:00", description: "Architecture and training", order: 1 },
					{ title: "CNNs for Image Processing", url: "", duration: "40:30", description: "Convolutional Neural Networks", order: 2 },
					{ title: "RNNs and LSTMs", url: "", duration: "38:15", description: "Sequence models", order: 3 }
				]
			}
		]
	},
	{
		title: "ASTRA AI",
		description: "Advanced Strategic Training in AI - Build next-generation AI applications with cutting-edge technologies. Learn to create AI agents, work with large language models, and develop intelligent automation systems.",
		instructor: "Pavan",
		rating: 4.5,
		students: 0,
		lessons: 42,
		duration: "6 weeks",
		level: "Advanced",
		category: "AI & ML",
		thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
		price: "Free",
		isFree: true,
		modules: [
			{
				title: "AI Agents Fundamentals",
				description: "Building intelligent autonomous agents",
				order: 1,
				videos: [
					{ title: "Introduction to AI Agents", url: "", duration: "22:00", description: "Agent architecture and design", order: 1 },
					{ title: "Agent Communication", url: "", duration: "26:30", description: "Multi-agent systems", order: 2 },
					{ title: "Agent Learning", url: "", duration: "28:15", description: "Reinforcement learning for agents", order: 3 }
				]
			},
			{
				title: "Large Language Models",
				description: "Working with LLMs and transformers",
				order: 2,
				videos: [
					{ title: "Transformer Architecture", url: "", duration: "32:00", description: "Understanding transformers", order: 1 },
					{ title: "GPT and BERT", url: "", duration: "35:20", description: "Popular LLM architectures", order: 2 },
					{ title: "Fine-tuning LLMs", url: "", duration: "38:15", description: "Custom model training", order: 3 }
				]
			},
			{
				title: "AI Application Development",
				description: "Building production-ready AI applications",
				order: 3,
				videos: [
					{ title: "RAG Systems", url: "", duration: "30:00", description: "Retrieval Augmented Generation", order: 1 },
					{ title: "Vector Databases", url: "", duration: "28:30", description: "Embeddings and similarity search", order: 2 },
					{ title: "AI API Integration", url: "", duration: "25:15", description: "OpenAI, Anthropic, and more", order: 3 }
				]
			}
		]
	},
	{
		title: "MERN MASTERY PROGRAM",
		description: "Complete full-stack web development with MongoDB, Express, React, and Node.js. Build modern, scalable web applications from scratch. Master both frontend and backend development with real-world projects.",
		instructor: "Pavan",
		rating: 4.5,
		students: 1,
		lessons: 65,
		duration: "6 weeks",
		level: "Beginner",
		category: "Web Development",
		thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80",
		price: "Free",
		isFree: true,
		modules: [
			{
				title: "Frontend Fundamentals",
				description: "HTML, CSS, JavaScript essentials",
				order: 1,
				videos: [
					{ title: "HTML5 Deep Dive", url: "", duration: "25:00", description: "Modern HTML structures", order: 1 },
					{ title: "CSS3 & Flexbox", url: "", duration: "30:30", description: "Styling and layouts", order: 2 },
					{ title: "JavaScript ES6+", url: "", duration: "35:15", description: "Modern JavaScript features", order: 3 }
				]
			},
			{
				title: "React Development",
				description: "Building interactive UIs with React",
				order: 2,
				videos: [
					{ title: "React Components", url: "", duration: "28:00", description: "Functional and class components", order: 1 },
					{ title: "Hooks in Depth", url: "", duration: "32:20", description: "useState, useEffect, custom hooks", order: 2 },
					{ title: "State Management", url: "", duration: "30:15", description: "Context API and Redux", order: 3 }
				]
			},
			{
				title: "Backend with Node.js",
				description: "Server-side development with Express",
				order: 3,
				videos: [
					{ title: "Node.js Fundamentals", url: "", duration: "26:00", description: "Event loop and async programming", order: 1 },
					{ title: "Express.js Framework", url: "", duration: "28:30", description: "REST API development", order: 2 },
					{ title: "Authentication & Security", url: "", duration: "32:15", description: "JWT and best practices", order: 3 }
				]
			},
			{
				title: "MongoDB & Full Stack",
				description: "Database integration and deployment",
				order: 4,
				videos: [
					{ title: "MongoDB Basics", url: "", duration: "24:00", description: "NoSQL database concepts", order: 1 },
					{ title: "Mongoose ODM", url: "", duration: "27:30", description: "Schema design and relationships", order: 2 },
					{ title: "Deployment & DevOps", url: "", duration: "29:15", description: "Deploying MERN apps", order: 3 }
				]
			}
		]
	}
];

async function seedNewCourses() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("MongoDB connected");

		// Find instructor named Pavan
		let pavanInstructor = await Instructor.findOne({ name: "Pavan" });

		if (!pavanInstructor) {
			console.log("Pavan instructor not found. Creating instructor account...");
			pavanInstructor = new Instructor({
				name: "Pavan",
				email: "pavan@merosphere.com",
				expertise: "AI/ML & Full Stack Development",
				bio: "Expert in Artificial Intelligence, Machine Learning, and Full Stack Web Development with MERN stack",
				active: true,
				approved: true,
			});
			await pavanInstructor.save();
			console.log("Pavan instructor created successfully");
		}

		// Add instructorId to courses
		const coursesWithInstructor = newCourses.map(course => ({
			...course,
			instructorId: pavanInstructor._id
		}));

		// Check if courses already exist
		for (const courseData of coursesWithInstructor) {
			const existingCourse = await Course.findOne({ title: courseData.title });
			
			if (existingCourse) {
				console.log(`Course "${courseData.title}" already exists. Skipping...`);
			} else {
				const newCourse = new Course(courseData);
				await newCourse.save();
				
				// Add course to instructor's courses array
				await Instructor.findByIdAndUpdate(
					pavanInstructor._id,
					{ $addToSet: { courses: newCourse._id } }
				);
				
				console.log(`✓ Created course: ${courseData.title}`);
			}
		}

		console.log("\n✅ Course seeding completed!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding courses:", error);
		process.exit(1);
	}
}

seedNewCourses();
