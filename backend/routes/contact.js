import express from "express";
import rateLimit from "express-rate-limit";
import mailer from "../config/mailer.js";

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many messages sent. Please try again later." },
});

// POST /api/contact
router.post("/", contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: "Message is too long (max 2000 characters)." });
  }

  try {
    await mailer.sendMail({
      from: { name: "YugantaAI Contact Form", email: process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER },
      to: "pavansivasairahulbabu@gmail.com",
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #A855F7;">New Contact Form Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #555; width: 100px;">Name:</td>
              <td style="padding: 8px; color: #333;">${name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; color: #555;">Email:</td>
              <td style="padding: 8px; color: #333;">${email.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #555;">Subject:</td>
              <td style="padding: 8px; color: #333;">${subject.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
              <td style="padding: 8px; color: #333; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
            </tr>
          </table>
        </div>
      `,
      text: `New Contact Form Message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    res.json({ success: true, message: "Your message has been sent successfully!" });
  } catch (err) {
    console.error("Contact form email error:", err);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
});

export default router;
