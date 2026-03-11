import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Check if SMTP credentials exist
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("⚠️ SMTP credentials not fully set. Email may not work.");
}

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,

  // secure should be true only for port 465
  secure: Number(process.env.SMTP_PORT) === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Timeouts for cloud servers
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,

  // Debugging logs
  logger: true,
  debug: true,
});

// Verify SMTP connection when server starts
async function verifySMTP() {
  try {
    await transporter.verify();
    console.log("✅ SMTP transporter ready");
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
  }
}

verifySMTP();

// Export transporter
export default transporter;