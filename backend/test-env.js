import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("Environment Variables Check:");
console.log("============================");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "***hidden***" : "NOT SET");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "NOT SET");
console.log("PORT:", process.env.PORT || "NOT SET");
console.log("============================");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
	console.error("❌ Email credentials are missing!");
} else {
	console.log("✅ Email credentials are loaded");
}
