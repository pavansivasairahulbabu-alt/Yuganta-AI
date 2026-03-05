import mongoose from "mongoose";
import Course from "./models/Course.js";
import Instructor from "./models/Instructor.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function verifyInstructorCourses() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("✓ MongoDB connected\n");

		// Find Pavan instructor
		const pavanInstructor = await Instructor.findOne({ name: "Pavan" });

		if (!pavanInstructor) {
			console.log("❌ Pavan instructor not found");
			process.exit(1);
		}

		console.log("📚 Instructor Details:");
		console.log("   Name:", pavanInstructor.name);
		console.log("   Email:", pavanInstructor.email);
		console.log("   Active:", pavanInstructor.active);
		console.log("   Approved:", pavanInstructor.approved);
		console.log("   Expertise:", pavanInstructor.expertise);
		console.log("   Has Password:", !!pavanInstructor.password);
		console.log("");

		// Fetch courses for this instructor
		const courses = await Course.find({
			instructorId: pavanInstructor._id,
		});

		console.log("📖 Courses Assigned to Instructor:");
		console.log("   Total Courses:", courses.length);
		console.log("");

		courses.forEach((course, index) => {
			console.log(`   ${index + 1}. ${course.title}`);
			console.log(`      Duration: ${course.duration}`);
			console.log(`      Level: ${course.level}`);
			console.log(`      Students: ${course.students}`);
			console.log(`      Rating: ${course.rating} ★`);
			console.log(`      Modules: ${course.modules?.length || 0}`);
			console.log(
				`      Total Videos: ${course.modules?.reduce(
					(sum, m) => sum + (m.videos?.length || 0),
					0,
				) || 0}`,
			);
			console.log("");
		});

		console.log("✅ Verification Complete!\n");
		console.log("📝 Next Steps:");
		console.log("   1. Login to Instructor Dashboard");
		console.log(`   2. Use email: ${pavanInstructor.email}`);
		console.log("   3. All courses will be visible in the dashboard");
		console.log("   4. Click on any course to manage modules and videos");
		console.log("");

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

verifyInstructorCourses();
