import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.BREVO_API_KEY) {
  console.warn("⚠️ BREVO_API_KEY not set. OTP emails will not be sent.");
} else {
  console.log("✅ Brevo email client ready");
}

const mailer = {
  async sendMail({ from, to, subject, html, text }) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured.");
    }

    // Resolve sender — routes pass { name, email } object or a bare string
    const senderEmail =
      process.env.BREVO_FROM_EMAIL ||
      (typeof from === "object" ? from.email : from) ||
      process.env.SMTP_USER;
    const senderName =
      (typeof from === "object" ? from.name : null) || "YuganthaAI";

    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      const err = new Error(`Brevo API error ${response.status}: ${errBody}`);
      err.code = "BREVO_API_ERROR";
      err.responseCode = response.status;
      err.response = errBody;
      throw err;
    }

    const data = await response.json();
    console.log(`✅ Email sent via Brevo. MessageId: ${data.messageId}`);
    return { messageId: data.messageId };
  },
};

export default mailer;