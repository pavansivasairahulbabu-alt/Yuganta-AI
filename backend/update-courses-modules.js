import mongoose from "mongoose";
import Course from "./models/Course.js";
import Instructor from "./models/Instructor.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const courseUpdates = {
	"AIML": {
		rating: 4.5,
		level: "Intermediate",
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
	"ASTRA AI": {
		rating: 4.5,
		level: "Advanced",
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
	"MERN MASTERY PROGRAM": {
		rating: 4.5,
		level: "Beginner",
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
};

async function updateCoursesWithModules() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("✓ MongoDB connected\n");

		for (const [courseTitle, updateData] of Object.entries(courseUpdates)) {
			const course = await Course.findOne({ title: courseTitle });
			
			if (course) {
				course.modules = updateData.modules;
				course.rating = updateData.rating;
				course.level = updateData.level;
				await course.save();
				
				const totalVideos = updateData.modules.reduce(
					(sum, m) => sum + (m.videos?.length || 0),
					0
				);
				
				console.log(`✓ Updated: ${courseTitle}`);
				console.log(`  - Modules: ${updateData.modules.length}`);
				console.log(`  - Videos: ${totalVideos}`);
				console.log(`  - Rating: ${updateData.rating} ★`);
				console.log(`  - Level: ${updateData.level}`);
				console.log("");
			}
		}

		console.log("✅ All courses updated successfully!\n");
		console.log("🎯 Instructor can now:");
		console.log("   1. Login to dashboard");
		console.log("   2. View all 3 courses with modules");
		console.log("   3. Add/Edit/Delete modules and videos");
		console.log("   4. Changes reflect instantly for enrolled students");
		console.log("");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

updateCoursesWithModules();
