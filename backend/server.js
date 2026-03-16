import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
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
import contactRoutes from "./routes/contact.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env even if process cwd is project root
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
	console.error("❌ FATAL ERROR: Missing required environment variables:");
	missingEnvVars.forEach((varName) => console.error(`   - ${varName}`));
	console.error("Please set these variables in your .env file or deployment platform.");
	process.exit(1);
}

console.log("✅ Core environment variables are configured");
if (process.env.BREVO_API_KEY) {
	console.log(`📧 Brevo email configured: ${process.env.BREVO_FROM_EMAIL || '(no BREVO_FROM_EMAIL set)'}`);
} else {
	console.warn("⚠️  BREVO_API_KEY not set — OTP emails will fail");
}

const app = express();
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// CORS configuration
const envOrigins = (process.env.FRONTEND_URL || '')
	.split(',')
	.map(url => url.trim())
	.filter(Boolean);
const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const prodDefaultOrigins = ['https://yuganthaai.vercel.app', 'https://yugantaai.com'];

const allowedOrigins = [
	...(process.env.NODE_ENV === "production" ? prodDefaultOrigins : defaultDevOrigins),
	...envOrigins,
];
const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

const corsOptions = {
	origin: (origin, callback) => {
		const isAllowedExact = !origin || uniqueAllowedOrigins.includes(origin);
		const isVercelPreview =
			typeof origin === "string" &&
			/^https:\/\/yugantha-ai-[a-z0-9-]+\.vercel\.app$/i.test(origin);

		if (isAllowedExact || isVercelPreview) {
			return callback(null, true);
		}

		return callback(new Error("Not allowed by CORS"));
	},
	credentials: true,
	optionsSuccessStatus: 200
};

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: Number(process.env.API_RATE_LIMIT_MAX || 600),
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many requests. Please try again in a few minutes." },
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: Number(process.env.AUTH_RATE_LIMIT_MAX || 50),
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many authentication attempts. Please try again later." },
});

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
	contentSecurityPolicy: false,
	crossOriginResourcePolicy: false,
}));
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/instructor-auth", authLimiter);
app.use("/api/mentor-auth", authLimiter);

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
app.use("/api/contact", contactRoutes);

// Health check
app.get("/", (req, res) => {
	res.json({
		message: "YuganthaAI API is running",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	});
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

	server.keepAliveTimeout = 65000;
	server.headersTimeout = 66000;

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
