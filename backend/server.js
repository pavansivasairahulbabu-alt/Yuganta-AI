import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/courses.js";
import adminRoutes from "./routes/admin.js";
import instructorAuthRoutes from "./routes/instructorAuth.js";
import mentorAuthRoutes from "./routes/mentorAuth.js";
import blogRoutes from "./routes/blogs.js";
import mentorshipSessionsRoutes from "./routes/mentorshipSessions.js";
import leadRoutes from "./routes/leads.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env even if process cwd is project root
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
	console.error('❌ FATAL ERROR: Missing required environment variables:');
	missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
	console.error('Please set these variables in your .env file or deployment platform.');
	process.exit(1);
}

console.log('✅ All required environment variables are configured (including SendGrid)');
console.log(`🔐 SendGrid from email: ${process.env.SENDGRID_FROM_EMAIL}`);

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const envOrigins = (process.env.FRONTEND_URL || '')
	.split(',')
	.map(url => url.trim())
	.filter(Boolean);
const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const prodDefaultOrigins = ['https://yuganthaai.vercel.app', 'https://yuganthaai.com'];

const corsOptions = {
	origin: process.env.NODE_ENV === 'production'
		? [...prodDefaultOrigins, ...envOrigins]
		: [...defaultDevOrigins, ...envOrigins],
	credentials: true,
	optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor-auth", instructorAuthRoutes);
app.use("/api/mentor-auth", mentorAuthRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/mentorship-sessions", mentorshipSessionsRoutes);
app.use("/api/leads", leadRoutes);

// Health check
app.get("/", (req, res) => {
	res.json({ message: "YuganthaAI API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		message: "Something went wrong!",
		error: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
});

const PORT = Number(process.env.PORT || 5000);
const MAX_PORT_RETRIES = 10;

const startServer = (port, retriesLeft = MAX_PORT_RETRIES) => {
	const server = app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});

	server.on("error", (error) => {
		if (error.code === "EADDRINUSE" && retriesLeft > 0) {
			console.warn(`⚠️ Port ${port} is already in use. Trying port ${port + 1}...`);
			startServer(port + 1, retriesLeft - 1);
			return;
		}

		console.error("❌ Failed to start server:", error.message);
		process.exit(1);
	});
};

startServer(PORT);
