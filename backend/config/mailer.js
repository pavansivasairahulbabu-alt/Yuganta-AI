import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.SENDGRID_API_KEY) {
  console.warn("⚠️ SENDGRID_API_KEY not set. Email will not work.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("✅ SendGrid email client ready");
}

// Export a transporter-compatible object so routes need no change
const transporter = {
  sendMail: async (msg) => {
    const [response] = await sgMail.send(msg);
    return { messageId: response?.headers?.["x-message-id"] || "sent" };
  },
};

export default transporter;