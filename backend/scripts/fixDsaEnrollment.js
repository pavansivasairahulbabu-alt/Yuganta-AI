import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DSA_TITLE = "Mastering Data Structures & Algorithms";
const USER_EMAIL = "yoshithanunna@gmail.com";

async function main() {
	await mongoose.connect(process.env.MONGODB_URI);

	let instructor = await Instructor.findOne({ name: "YugantaAI" });
	if (!instructor) {
		instructor = await Instructor.create({
			name: "YugantaAI",
			email: "instructor@yugantaai.com",
			expertise: "Programming and AI",
			bio: "Instructor for programming and AI courses",
			photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
			company: "YugantaAI",
			approved: true,
			active: true,
		});
	}

	let course = await Course.findOne({ title: new RegExp(`^${DSA_TITLE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
	if (!course) {
		course = await Course.create({
			title: DSA_TITLE,
			description: "Build a strong foundation in data structures, algorithms, and problem solving with guided practice, structured modules, and mentorship support.",
			instructor: "YugantaAI",
			instructorId: instructor._id,
			rating: 4.7,
			students: 0,
			lessons: 36,
			duration: "4 Months",
			level: "Intermediate",
			category: "Programming",
			thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
			price: "7000",
			isFree: false,
			modules: [
				{
					title: "DSA Foundations",
					description: "Core programming logic, complexity analysis, and basic data structures.",
					order: 1,
					videos: [
						{ title: "Time and Space Complexity", url: "", duration: "20:00", description: "Analyze algorithm performance", order: 1 },
						{ title: "Arrays and Strings", url: "", duration: "24:00", description: "Core linear data handling", order: 2 },
						{ title: "Recursion Basics", url: "", duration: "22:00", description: "Recursive problem solving", order: 3 },
					],
				},
				{
					title: "Intermediate Data Structures",
					description: "Stacks, queues, linked lists, trees, and hashing.",
					order: 2,
					videos: [
						{ title: "Stacks and Queues", url: "", duration: "26:00", description: "Linear abstract data types", order: 1 },
						{ title: "Linked Lists", url: "", duration: "28:00", description: "Singly and doubly linked lists", order: 2 },
						{ title: "Trees and BST", url: "", duration: "32:00", description: "Hierarchical structures", order: 3 },
					],
				},
				{
					title: "Algorithms and Problem Solving",
					description: "Sorting, searching, graphs, dynamic programming, and interview patterns.",
					order: 3,
					videos: [
						{ title: "Sorting and Searching", url: "", duration: "30:00", description: "Classic algorithm patterns", order: 1 },
						{ title: "Graphs and Traversals", url: "", duration: "34:00", description: "BFS, DFS, shortest paths", order: 2 },
						{ title: "Dynamic Programming", url: "", duration: "36:00", description: "Optimization techniques", order: 3 },
					],
				},
			],
		});

		await Instructor.findByIdAndUpdate(instructor._id, {
			$addToSet: { courses: course._id },
		});
	}

	const user = await User.findOne({ email: USER_EMAIL });
	let dsaEnrollmentAdded = false;

	if (user) {
		const alreadyEnrolled = user.enrolledCourses.some(
			(enrollment) => enrollment.courseId?.toString() === course._id.toString(),
		);

		if (!alreadyEnrolled) {
			user.enrolledCourses.push({
				courseId: course._id,
				enrolledAt: new Date(),
				progress: 0,
				completed: false,
			});
			await user.save();
			dsaEnrollmentAdded = true;
			await Course.findByIdAndUpdate(course._id, { $inc: { students: 1 } });
		}
	}

	console.log(
		JSON.stringify(
			{
				courseId: course._id,
				courseTitle: course.title,
				userFound: Boolean(user),
				dsaEnrollmentAdded,
			},
			null,
			2,
		),
	);

	await mongoose.disconnect();
}

main().catch(async (error) => {
	console.error(error);
	await mongoose.disconnect();
	process.exit(1);
});