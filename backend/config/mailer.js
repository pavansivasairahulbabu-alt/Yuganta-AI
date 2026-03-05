import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

// Ensure env is loaded even in ESM import order
dotenv.config();

if (!process.env.SENDGRID_API_KEY) {
  console.warn("⚠️ SENDGRID_API_KEY not set - email functionality will be disabled");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("✅ SendGrid configured");
}

export default sgMail;
