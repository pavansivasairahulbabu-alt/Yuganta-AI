#!/usr/bin/env node
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("🚀 Starting MeroSphere Backend...");
console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`⚙️  Node environment: ${process.env.NODE_ENV || 'development'}`);

// Import server after env is loaded
import("./server.js").then(() => {
	console.log("✅ Backend server module loaded successfully");
}).catch((err) => {
	console.error("❌ Failed to start server:", err.message);
	console.error(err);
	process.exit(1);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
	console.log("⚠️  SIGTERM received, shutting down gracefully...");
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("⚠️  SIGINT received, shutting down gracefully...");
	process.exit(0);
});
