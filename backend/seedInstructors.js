import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Instructor from "./models/Instructor.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const instructors = [
	{
		name: "Dr. Sarah Chen",
		email: "sarah.chen@merosphere.com",
		password: "instructor123",
		expertise: "Machine Learning, Deep Learning, Computer Vision",
		bio: "PhD in Computer Science from Stanford. 10+ years of experience in ML research and teaching. Former research scientist at Google AI.",
		avatar: "https://randomuser.me/api/portraits/women/1.jpg",
		active: true,
		approved: true,
	},
	{
		name: "Prof. Michael Rodriguez",
		email: "michael.rodriguez@merosphere.com",
		password: "instructor123",
		expertise: "Natural Language Processing, AI Ethics, LLMs",
		bio: "Professor of AI at MIT. Specialized in NLP and ethical AI development. Published 50+ research papers in top-tier conferences.",
		avatar: "https://randomuser.me/api/portraits/men/2.jpg",
		active: true,
		approved: true,
	},
	{
		name: "Dr. Priya Sharma",
		email: "priya.sharma@merosphere.com",
		password: "instructor123",
		expertise: "Data Science, Statistical Analysis, Python",
		bio: "Data Science lead with 8 years of industry experience. Expert in statistical modeling and data visualization. Former Data Scientist at Amazon.",
		avatar: "https://randomuser.me/api/portraits/women/3.jpg",
		active: true,
		approved: true,
	},
	{
		name: "James Wilson",
		email: "james.wilson@merosphere.com",
		password: "instructor123",
		expertise: "Cloud Computing, MLOps, DevOps",
		bio: "Senior Cloud Architect with expertise in deploying ML models at scale. AWS and Azure certified professional.",
		avatar: "https://randomuser.me/api/portraits/men/4.jpg",
		active: true,
		approved: true,
	},
	{
		name: "Dr. Emily Zhang",
		email: "emily.zhang@merosphere.com",
		password: "instructor123",
		expertise: "Reinforcement Learning, AI Agents, Robotics",
		bio: "Robotics researcher specializing in autonomous systems and RL. PhD from Berkeley. Previously worked at Tesla AI.",
		avatar: "https://randomuser.me/api/portraits/women/5.jpg",
		active: true,
		approved: true,
	},
];

const users = [
	{
		fullName: "John Doe",
		email: "john@example.com",
		password: "user123456",
	},
	{
		fullName: "Jane Smith",
		email: "jane@example.com",
		password: "user123456",
	},
	{
		fullName: "Alex Johnson",
		email: "alex@example.com",
		password: "user123456",
	},
	{
		fullName: "Maria Garcia",
		email: "maria@example.com",
		password: "user123456",
	},
	{
		fullName: "David Lee",
		email: "david@example.com",
		password: "user123456",
	},
];

async function seedInstructorsAndUsers() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("MongoDB connected...");

		// Clear existing instructors and users
		await Instructor.deleteMany({});
		console.log("Existing instructors cleared");

		await User.deleteMany({});
		console.log("Existing users cleared");

		// Add instructors
		await Instructor.insertMany(instructors);
		console.log(`${instructors.length} instructors added successfully!`);

		// Add users
		await User.insertMany(users);
		console.log(`${users.length} users added successfully!`);

		console.log("\n✅ SEED COMPLETE! Here are your credentials:\n");
		
		console.log("📚 INSTRUCTORS:");
		instructors.forEach((instructor, i) => {
			console.log(`${i + 1}. ${instructor.name}`);
			console.log(`   Email: ${instructor.email}`);
			console.log(`   Password: ${instructor.password}`);
			console.log(`   Expertise: ${instructor.expertise}\n`);
		});

		console.log("👥 USERS:");
		users.forEach((user, i) => {
			console.log(`${i + 1}. ${user.fullName}`);
			console.log(`   Email: ${user.email}`);
			console.log(`   Password: ${user.password}\n`);
		});

		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

seedInstructorsAndUsers();
