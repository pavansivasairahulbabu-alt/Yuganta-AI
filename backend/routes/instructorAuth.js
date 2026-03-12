import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "../config/mailer.js";
import Instructor from "../models/Instructor.js";

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

// Function to send OTP email
const sendOTPEmail = async (email, otp, instructorName = "Instructor") => {
	const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/instructor/forgot-password`;

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
              <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;">Instructor Portal</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hello <strong>${instructorName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                We received a request to set up your password for your YuganthaAI Instructor account.
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

	const textContent = `YuganthaAI – Instructor Verification Code\n\nHello ${instructorName},\n\nWe received a request to set up your password for your YuganthaAI Instructor account.\n\nYour verification code: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.\n\nTo set up your password, visit:\n${resetUrl}\n\nIf you did not make this request, you can safely ignore this email. Your account remains secure.\n\n-- YuganthaAI Team`;

	const msg = {
		to: email,
		from: {
			name: "YuganthaAI",
			email: process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER,
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
		const result = await transporter.sendMail(msg);
		console.log(`✅ OTP email sent successfully to ${email} via SMTP`);
		console.log(`📧 Message ID: ${result.messageId}`);
		return true;
	} catch (error) {
		const details = getMailErrorDetails(error);
		console.error(`❌ Failed to send OTP email to ${email}:`, details);
		const mailError = new Error(`Failed to send OTP email: ${error.message}`);
		mailError.details = details;
		throw mailError;
	}
};

// @route   POST /api/instructor-auth/register
// @desc    Register new instructor (without password)
// @access  Public
router.post(
	"/register",
	[
		body("name").trim().notEmpty().withMessage("Name is required"),
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("expertise").trim().notEmpty().withMessage("Expertise is required"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, expertise, bio, photo, company, experience, avatar } = req.body;
		const normalizedEmail = String(email).trim().toLowerCase();

		try {
			// Check if instructor exists
			const instructorExists = await Instructor.findOne({ email: normalizedEmail });
			if (instructorExists) {
				return res.status(409).json({ message: "Instructor with this email already exists" });
			}

			// Create instructor without password (will be set via forgot password).
			// Keep safe defaults for required profile fields if not provided at registration time.
			const instructor = await Instructor.create({
				name: String(name).trim(),
				email: normalizedEmail,
				expertise: String(expertise).trim(),
				bio: bio ? String(bio).trim() : "Instructor profile pending update.",
				photo: photo ? String(photo).trim() : "https://via.placeholder.com/300x300.png?text=Instructor",
				company: company ? String(company).trim() : "YugantaAI",
				experience: experience ? String(experience).trim() : "",
				avatar: avatar ? String(avatar).trim() : "",
				approved: false,
			});

			if (instructor) {
				// Generate OTP for password setup
				const otp = Math.floor(100000 + Math.random() * 900000).toString();
				const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

				// Store OTP and expiry
				instructor.resetToken = otp;
				instructor.resetTokenExpiry = otpExpiry;
				await instructor.save();

				// Send OTP email
				try {
					await sendOTPEmail(normalizedEmail, otp);
				} catch (mailError) {
					return res.status(502).json({
						message: "Unable to send OTP email right now.",
						error: mailError.message,
						details: mailError.details || null,
					});
				}

				res.status(201).json({
					message: "Registration successful. Check your email for OTP to set password.",
					_id: instructor._id,
					email: instructor.email,
				});
			}
		} catch (error) {
			if (error?.code === 11000) {
				return res.status(409).json({ message: "Instructor with this email already exists" });
			}
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	}
);

// @route   POST /api/instructor-auth/setup-password
// @desc    Set password using OTP
// @access  Public
router.post(
	"/setup-password",
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
			const instructor = await Instructor.findOne({ email });

			if (!instructor) {
				return res.status(404).json({ message: "Instructor not found" });
			}

			// Check if OTP is valid and not expired
			if (instructor.resetToken !== otp || !instructor.resetTokenExpiry) {
				return res.status(400).json({ message: "Invalid OTP" });
			}

			if (new Date() > instructor.resetTokenExpiry) {
				return res.status(400).json({ message: "OTP has expired" });
			}

			// Set password
			instructor.password = password;
			instructor.resetToken = undefined;
			instructor.resetTokenExpiry = undefined;
			await instructor.save();

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

// @route   POST /api/instructor-auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
	"/forgot-password",
	[body("email").isEmail().withMessage("Please enter a valid email")],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email } = req.body;

		try {
			const instructor = await Instructor.findOne({ email });

			if (!instructor) {
				return res.status(404).json({ message: "Instructor not found" });
			}

			// Generate OTP for password reset
			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

			instructor.resetToken = otp;
			instructor.resetTokenExpiry = otpExpiry;
			await instructor.save();

			// Send OTP email
			try {
				await sendOTPEmail(email, otp, instructor.name);
			} catch (mailError) {
				return res.status(502).json({
					message: "Unable to send OTP email right now.",
					error: mailError.message,
					details: mailError.details || null,
				});
			}

			res.json({
				message: "OTP sent to your email. Check your inbox.",
			});
		} catch (error) {
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	}
);

// @route   POST /api/instructor-auth/reset-password
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
			const instructor = await Instructor.findOne({ email });

			if (!instructor) {
				return res.status(404).json({ message: "Instructor not found" });
			}

			// Check if OTP is valid and not expired
			console.log("🔍 Reset password verification:");
			console.log("📧 Email:", email);
			console.log("🔐 Stored token:", instructor.resetToken);
			console.log("🔐 Provided OTP:", otp);
			console.log("🕐 Token expiry:", instructor.resetTokenExpiry);
			console.log("🕐 Current time:", new Date());
			console.log("✅ OTP Match:", instructor.resetToken === otp);
			console.log("✅ Expiry exists:", !!instructor.resetTokenExpiry);
			console.log("✅ Not expired:", instructor.resetTokenExpiry ? new Date() <= instructor.resetTokenExpiry : false);

			if (!instructor.resetToken || !instructor.resetTokenExpiry) {
				return res.status(400).json({ message: "No OTP found. Please request a password reset first." });
			}

			if (instructor.resetToken !== otp) {
				return res.status(400).json({ message: "Invalid OTP" });
			}

			if (new Date() > instructor.resetTokenExpiry) {
				return res.status(400).json({ message: "OTP has expired. Please request a new one." });
			}

			// Reset password
			instructor.password = password;
			instructor.resetToken = undefined;
			instructor.resetTokenExpiry = undefined;
			await instructor.save();

			res.json({
				message: "Password reset successfully. You can now login.",
			});
		} catch (error) {
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	}
);

// @route   POST /api/instructor-auth/login
// @desc    Login instructor
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
			// Check if instructor exists
			const instructor = await Instructor.findOne({ email });
			if (!instructor) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			// Check if instructor has set password
			if (!instructor.password) {
				return res.status(401).json({ 
					message: "Please set your password using the registration email" 
				});
			}

			// Check if instructor is active
			if (!instructor.active) {
				return res.status(401).json({ message: "Instructor account is deactivated" });
			}

			// Check password
			const isMatch = await instructor.comparePassword(password);
			if (!isMatch) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			res.json({
				_id: instructor._id,
				name: instructor.name,
				email: instructor.email,
				expertise: instructor.expertise,
				approved: instructor.approved,
				token: generateToken(instructor._id),
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
