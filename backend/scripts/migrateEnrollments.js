import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Course from "../models/Course.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Mapping of old/stale course IDs to the current valid course IDs in the database
const ID_MAP = {
	"69ae9c86d29207e06cebe9c8": "6a1806d6b5e868b97b735fd0", // Mastering Data Structures & Algorithms
	"69ae9d82d29207e06cebe9cd": "6a1806d6b5e868b97b735fc2", // Agentic AI Crash Course
	"69b10c775f913db8cc01d4a8": "6a1806d6b5e868b97b735fc9", // Agentic AI Pioneer Program
	"697ba81ac8cee485de8daf68": "6a1806d6b5e868b97b735fd0", // Map old programming course to Mastering DSA
};

async function migrate() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("✓ MongoDB connected successfully.");

		const users = await User.find({});
		let updatedUsersCount = 0;

		for (const user of users) {
			let modified = false;
			const newEnrollments = [];
			const seenCourseIds = new Set();

			for (const enrollment of user.enrolledCourses) {
				const oldIdStr = enrollment.courseId?.toString();
				
				if (!oldIdStr) continue;

				let targetIdStr = oldIdStr;
				if (ID_MAP[oldIdStr]) {
					targetIdStr = ID_MAP[oldIdStr];
					console.log(`Mapping stale courseId ${oldIdStr} -> ${targetIdStr} for user ${user.email}`);
					modified = true;
				}

				// Check if the target course actually exists in the database
				const courseExists = await Course.exists({ _id: new mongoose.Types.ObjectId(targetIdStr) });
				if (!courseExists) {
					console.warn(`⚠️ Target course ID ${targetIdStr} does not exist in courses collection. Skipping enrollment.`);
					modified = true;
					continue; // Discard invalid/deleted course enrollments
				}

				if (seenCourseIds.has(targetIdStr)) {
					console.log(`Removing duplicate enrollment for course ${targetIdStr} for user ${user.email}`);
					modified = true;
					continue; // Skip duplicates to avoid duplicate enrollments
				}

				seenCourseIds.add(targetIdStr);
				enrollment.courseId = new mongoose.Types.ObjectId(targetIdStr);
				newEnrollments.push(enrollment);
			}

			if (modified) {
				user.enrolledCourses = newEnrollments;
				user.markModified("enrolledCourses");
				await user.save();
				updatedUsersCount++;
				console.log(`✅ Successfully updated enrollments for user: ${user.email}`);
			}
		}

		console.log(`\n🎉 Migration complete! Updated ${updatedUsersCount} users.`);
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration error:", error);
		process.exit(1);
	}
}

migrate();
