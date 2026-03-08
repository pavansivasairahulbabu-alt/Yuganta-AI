import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log('\n🔧 Mentor Creation Tool\n');
console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET');

const run = async () => {
	try {
		const { default: connectDB } = await import("./config/db.js");
		const { default: Mentor } = await import("./models/Mentor.js");

		await connectDB();

		// Check if test mentor already exists
		const existingMentor = await Mentor.findOne({ email: 'testmentor@example.com' });

		if (existingMentor) {
			console.log('\n✅ Test mentor already exists!');
			console.log('   Name:', existingMentor.name);
			console.log('   Email:', existingMentor.email);
			console.log('   ID:', existingMentor._id);
			console.log('\n📧 You can use this email to test forgot-password\n');
		} else {
			console.log('\n📝 Creating test mentor...\n');

			const testMentor = await Mentor.create({
				name: 'Test Mentor',
				email: 'testmentor@example.com',
				expertise: 'Web Development, Python, JavaScript',
				bio: 'Test mentor account for OTP flow verification.',
				photo: 'https://via.placeholder.com/300x300.png?text=Mentor',
				company: 'YugantaAI',
				approved: true,
				active: true,
				password: null, // Will be set via forgot-password
			});

			console.log('✅ Test mentor created successfully!\n');
			console.log('   Name:', testMentor.name);
			console.log('   Email:', testMentor.email);
			console.log('   ID:', testMentor._id);
			console.log('   Expertise:', testMentor.expertise);
			console.log('\n📧 Use this email to test forgot-password:');
			console.log('   testmentor@example.com\n');
			console.log('You will receive OTP emails at:', process.env.SENDGRID_FROM_EMAIL || 'NOT SET');
			console.log('\n');
		}

		process.exit(0);
	} catch (error) {
		console.error('\n❌ Error:', error.message);
		console.error(error);
		process.exit(1);
	}
};

run();
