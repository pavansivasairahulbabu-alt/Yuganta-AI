import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const run = async () => {
	try {
		const { default: connectDB } = await import("./config/db.js");
		const { default: Mentor } = await import("./models/Mentor.js");

		await connectDB();
		console.log("\n📊 Checking Mentors in Database...\n");

		const count = await Mentor.countDocuments();
		console.log(`Total Mentors: ${count}`);

		if (count === 0) {
			console.log("\n⚠️  No mentors found in database!");
			console.log("\n📝 Creating a test mentor...\n");

			const testMentor = await Mentor.create({
				name: "Test Mentor",
				email: "testmentor@example.com",
				expertise: "Web Development",
				approved: true,
				active: true,
			});

			console.log("✅ Test mentor created:");
			console.log(`   Name: ${testMentor.name}`);
			console.log(`   Email: ${testMentor.email}`);
			console.log(`   ID: ${testMentor._id}`);
		} else {
			console.log("\n✅ Mentors found:\n");
			const mentors = await Mentor.find({}, "name email approved active").limit(10);
			mentors.forEach((mentor, idx) => {
				console.log(`${idx + 1}. ${mentor.name}`);
				console.log(`   Email: ${mentor.email}`);
				console.log(`   Approved: ${mentor.approved}, Active: ${mentor.active}`);
			});
		}

		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
};

run();
