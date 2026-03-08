import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sgMail from "@sendgrid/mail";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
  console.error("Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL");
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: process.env.SENDGRID_FROM_EMAIL,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: "SendGrid direct test",
  text: "hello",
};

try {
  const result = await sgMail.send(msg);
  console.log("SENDGRID_OK", result?.[0]?.statusCode ?? "ok");
} catch (error) {
  console.log("SENDGRID_FAIL", error.message);
  console.log(JSON.stringify(error?.response?.body ?? {}, null, 2));
}
