import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "../config/mailer.js";
import Mentor from "../models/Mentor.js";

const router = express.Router();

const getMailErrorDetails = (error) => ({
	message: error.message,
	code: error.code || null,
	command: error.command || null,
	response: error.response || null,
	responseCode: error.responseCode || null,
});

// Generate JWT Token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "34h",
	});
};

// Function to send OTP email via SendGrid
const sendOTPEmail = async (email, otp, mentorName = "Mentor") => {
	console.log(`\n📧 sendOTPEmail called for: ${email}, OTP: ${otp}`);
	const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mentor/forgot-password`;

	const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code – YuganthaAI</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">YuganthaAI</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;">Mentor Portal</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hello <strong>${mentorName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                We received a request to set up your password for your YuganthaAI Mentor account.
                Use the verification code below to continue.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:28px 20px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#1d4ed8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
                    <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:10px;color:#1a56db;font-family:monospace;">${otp}</p>
                    <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">This code expires in <strong>10 minutes</strong></p>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 16px;font-size:15px;color:#4b5563;line-height:1.6;">
                Enter this code on the password setup page to secure your account.
                For your security, do not share this code with anyone.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="background-color:#1a56db;border-radius:6px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Set Up Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                If you did not request this, you can safely disregard this message.
                Your account remains secure and no changes have been made.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">This is a transactional notification sent to <strong>${email}</strong></p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} YuganthaAI. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

	const textContent = `YuganthaAI – Mentor Verification Code\n\nHello ${mentorName},\n\nWe received a request to set up your password for your YuganthaAI Mentor account.\n\nYour verification code: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.\n\nTo set up your password, visit:\n${resetUrl}\n\nIf you did not make this request, you can safely ignore this email. Your account remains secure.\n\n-- YuganthaAI Team`;

	const msg = {
		to: email,
		from: {
			name: "YuganthaAI",
			email: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
		},
		subject: `Your verification code: ${otp}`,
		html: htmlContent,
		text: textContent,
		headers: {
			"X-Auto-Response-Suppress": "All",
			"Auto-Submitted": "auto-generated",
		},
	};

	try {
		console.log(`📤 Sending OTP email to ${email}...`);
		const result = await transporter.sendMail(msg);
		console.log(`✅ OTP email sent successfully to ${email} via SMTP`);
		console.log(`📧 Message ID: ${result.messageId}`);
		return true;
	} catch (error) {
		const details = getMailErrorDetails(error);
		console.error(`❌ Failed to send OTP email to ${email}`);
		console.error("📮 SMTP error details:", details);
		const mailError = new Error(`Failed to send OTP email: ${error.message}`);
		mailError.details = details;
		throw mailError;
	}
};

// @route   POST /api/mentor-auth/forgot-password
// @desc    Request password reset/setup
// @access  Public
router.post(
	"/forgot-password",
	[body("email").isEmail().withMessage("Please enter a valid email")],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log("❌ Validation errors:", errors.array());
			return res.status(400).json({ errors: errors.array() });
		}

		const { email } = req.body;
		console.log(`\n📧 Forgot Password Request for: ${email}`);

		try {
			console.log("🔍 Searching for mentor with email:", email);
			const mentor = await Mentor.findOne({ email });

			if (!mentor) {
				console.log("❌ Mentor not found for email:", email);
				return res.status(404).json({ message: "Mentor not found" });
			}

			console.log("✅ Mentor found:", mentor.name);

			// Ensure required fields have safe defaults (for old records)
			if (!mentor.photo) mentor.photo = "https://via.placeholder.com/150";
			if (!mentor.bio) mentor.bio = "Professional mentor at YuganthaAI";
			if (!mentor.company) mentor.company = "YuganthaAI";

			// Generate OTP for password reset
			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

			console.log(`📝 Generating OTP: ${otp}`);
			mentor.resetToken = otp;
			mentor.resetTokenExpiry = otpExpiry;
			await mentor.save();
			console.log("✅ OTP saved to database");

			// Send OTP email
			console.log(`📤 Sending OTP email to ${email}...`);
			try {
				await sendOTPEmail(email, otp, mentor.name);
			} catch (mailError) {
				console.error("❌ Email service error in forgot-password:", mailError.message);
				return res.status(502).json({
					message: "Unable to send OTP email right now. Please try again in a minute.",
					error: mailError.message,
					details: mailError.details || null,
				});
			}

			console.log(`✅ OTP email sent successfully to ${email}`);
			res.json({
				message: "OTP sent to your email. Check your inbox.",
			});
		} catch (error) {
			console.error("❌ Error in forgot-password endpoint:", error.message);
			console.error("Full error:", error);
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	}
);

// @route   POST /api/mentor-auth/reset-password
// @desc    Reset password using OTP
// @access  Public
router.post(
	"/reset-password",
	[
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("otp").notEmpty().withMessage("OTP is required"),
		body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, otp, password } = req.body;

		try {
			const mentor = await Mentor.findOne({ email });

			if (!mentor) {
				return res.status(404).json({ message: "Mentor not found" });
			}

			// Check if OTP is valid and not expired
			console.log("🔍 Reset password verification (Mentor):");
			console.log("📧 Email:", email);
			console.log("🔐 Stored token:", mentor.resetToken);
			console.log("🔐 Provided OTP:", otp);
			console.log("🕐 Token expiry:", mentor.resetTokenExpiry);
			console.log("🕐 Current time:", new Date());
			console.log("✅ OTP Match:", mentor.resetToken === otp);
			console.log("✅ Expiry exists:", !!mentor.resetTokenExpiry);
			console.log("✅ Not expired:", mentor.resetTokenExpiry ? new Date() <= mentor.resetTokenExpiry : false);

			if (!mentor.resetToken || !mentor.resetTokenExpiry) {
				return res.status(400).json({ message: "No OTP found. Please request a password reset first." });
			}

			if (mentor.resetToken !== otp) {
				return res.status(400).json({ message: "Invalid OTP" });
			}

			if (new Date() > mentor.resetTokenExpiry) {
				return res.status(400).json({ message: "OTP has expired. Please request a new one." });
			}

			// Hash password before saving
			const bcrypt = (await import("bcryptjs")).default;
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			// Reset password
			mentor.password = hashedPassword;
			mentor.resetToken = undefined;
			mentor.resetTokenExpiry = undefined;
			await mentor.save();

			res.json({
				message: "Password set successfully. You can now login.",
			});
		} catch (error) {
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	}
);

// @route   POST /api/mentor-auth/login
// @desc    Login mentor
// @access  Public
router.post(
	"/login",
	[
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("password").notEmpty().withMessage("Password is required"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			const bcrypt = (await import("bcryptjs")).default;

			// Check if mentor exists
			const mentor = await Mentor.findOne({ email });
			if (!mentor) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			// Check if mentor has set password
			if (!mentor.password) {
				return res.status(401).json({ 
					message: "Please set your password using the registration email" 
				});
			}

			// Check if mentor is active
			if (!mentor.active) {
				return res.status(401).json({ message: "Mentor account is deactivated" });
			}

			// Check password
			const isMatch = await bcrypt.compare(password, mentor.password);
			if (!isMatch) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			res.json({
				mentor: {
					_id: mentor._id,
					name: mentor.name,
					email: mentor.email,
					expertise: mentor.expertise,
					approved: mentor.approved,
				},
				token: generateToken(mentor._id),
			});
		} catch (error) {
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	}
);

export default router;
