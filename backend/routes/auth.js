import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import transporter from "../config/mailer.js";

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
		expiresIn: "30d",
	});
};

const sendOtpEmail = async (email, otp, name, context = "signup") => {
	console.log(`\n📧 [sendOtpEmail] Called — context: ${context}, to: ${email}, BREVO_KEY: ${process.env.BREVO_API_KEY ? "SET" : "NOT SET"}, FROM: ${process.env.BREVO_FROM_EMAIL || "(not set)"}`);
	const isSignup = context === "signup";
	const actionText = isSignup ? "complete your registration" : "reset your password";
	const portalLabel = isSignup ? "Learner Portal" : "Password Reset";
	const introText = isSignup
		? "We received a request to create your YuganthaAI account. Use the verification code below to complete your signup."
		: "We received a request to reset your YuganthaAI password. Use the verification code below to continue.";
	const buttonText = isSignup ? "Complete Signup" : "Reset Password";
	const pagePath = isSignup ? "/signup" : "/forgot-password";
	const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}${pagePath}`;

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code - YuganthaAI</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">YuganthaAI</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;">${portalLabel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 24px;">
              <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hello <strong>${name}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">${introText}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:28px 20px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#1d4ed8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
                    <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:10px;color:#1a56db;font-family:monospace;">${otp}</p>
                    <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">This code expires in <strong>10 minutes</strong></p>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 16px;font-size:15px;color:#4b5563;line-height:1.6;">Use this code to ${actionText}. For your security, do not share this code with anyone.</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="background-color:#1a56db;border-radius:6px;">
                    <a href="${url}" style="display:inline-block;padding:12px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">${buttonText}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">If you did not request this, you can safely ignore this message.</p>
            </td>
          </tr>
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

	const text = `YuganthaAI Verification Code\n\nHello ${name},\n\n${introText}\n\nYour verification code: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.\n\nContinue here: ${url}\n\nIf you did not request this, please ignore this email.\n\n-- YuganthaAI Team`;

	try {
		const msg = {
			from: {
				name: "YuganthaAI",
				email: process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER,
			},
			to: email,
			subject: `Your verification code: ${otp}`,
			html,
			text,
			headers: {
				"X-Auto-Response-Suppress": "All",
				"Auto-Submitted": "auto-generated",
			},
		};

		console.log(`📤 [sendOtpEmail] Sending OTP email to ${email}...`);
		const result = await transporter.sendMail(msg);
		console.log(`✅ [sendOtpEmail] Email sent to ${email}. MessageId: ${result?.messageId}`);
	} catch (err) {
		const details = getMailErrorDetails(err);
		console.error(`❌ [sendOtpEmail] Failed to send to ${email}:`, details);
		throw err;
	}
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post(
	"/signup",
	[
		body("fullName").trim().notEmpty().withMessage("Full name is required"),
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ message: errors.array()[0].msg });
		}

		const { fullName, email, password } = req.body;
		const normalizedEmail = String(email).trim().toLowerCase();

		try {
			// Check if user exists
			const userExists = await User.findOne({ email: normalizedEmail });
			if (userExists && userExists.isVerified) {
				return res.status(409).json({
					message: "Account already exists. Please login or use Forgot Password.",
					errorCode: "USER_EXISTS",
				});
			}

			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

			if (userExists && !userExists.isVerified) {
				userExists.fullName = fullName;
				userExists.password = password;
				userExists.signupOtp = otp;
				userExists.signupOtpExpiry = otpExpiry;
				await userExists.save();
				try {
					await sendOtpEmail(normalizedEmail, otp, fullName, "signup");
				} catch (emailErr) {
					console.error("[Signup] Email send failed:", emailErr.message, emailErr.response || "");
					return res.status(500).json({ message: "Failed to send OTP email. Please check email configuration.", error: emailErr.message });
				}
				return res.status(200).json({
					message: "OTP sent to your email. Please verify to complete signup.",
					email: normalizedEmail,
				});
			}

			const user = await User.create({
				fullName,
				email: normalizedEmail,
				password,
				isVerified: false,
				signupOtp: otp,
				signupOtpExpiry: otpExpiry,
			});

			if (user) {
				try {
					await sendOtpEmail(user.email, otp, user.fullName, "signup");
				} catch (emailErr) {
					console.error("[Signup] Email send failed:", emailErr.message, emailErr.response || "");
					return res.status(500).json({ message: "Failed to send OTP email. Please check email configuration.", error: emailErr.message });
				}
				res.status(201).json({
					message: "OTP sent to your email. Please verify to complete signup.",
					email: user.email,
				});
			}
		} catch (error) {
			console.error("[Signup] Unexpected error:", error.message);
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	}
);

// @route   POST /api/auth/verify-signup-otp
// @desc    Verify signup OTP and activate account
// @access  Public
router.post(
	"/verify-signup-otp",
	[
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ message: errors.array()[0].msg });
		}

		const email = String(req.body.email).trim().toLowerCase();
		const otp = String(req.body.otp).trim();

		try {
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			if (user.isVerified) {
				return res.status(200).json({
					_id: user._id,
					fullName: user.fullName,
					email: user.email,
					enrolledCourses: user.enrolledCourses,
					token: generateToken(user._id),
				});
			}

			if (!user.signupOtp || !user.signupOtpExpiry) {
				return res.status(400).json({ message: "No OTP found. Please signup again." });
			}

			if (new Date() > user.signupOtpExpiry) {
				return res.status(400).json({ message: "OTP has expired. Please signup again." });
			}

			if (user.signupOtp !== otp) {
				return res.status(400).json({ message: "Invalid OTP" });
			}

			user.isVerified = true;
			user.signupOtp = null;
			user.signupOtpExpiry = null;
			await user.save();

			return res.status(200).json({
				_id: user._id,
				fullName: user.fullName,
				email: user.email,
				enrolledCourses: user.enrolledCourses,
				token: generateToken(user._id),
			});
		} catch (error) {
			return res.status(500).json({ message: "Server error", error: error.message });
		}
	}
);

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for user password reset
// @access  Public
router.post(
	"/forgot-password",
	[body("email").isEmail().withMessage("Please enter a valid email")],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ message: errors.array()[0].msg });
		}

		const email = String(req.body.email).trim().toLowerCase();

		try {
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			user.resetOtp = otp;
			user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
			await user.save();

				try {
					await sendOtpEmail(user.email, otp, user.fullName || "User", "reset");
				} catch (emailErr) {
					console.error("[ForgotPassword] Email send failed:", emailErr.message, emailErr.response || "");
					return res.status(500).json({ message: "Failed to send OTP email. Please check email configuration.", error: emailErr.message });
				}
				return res.status(200).json({ message: "OTP sent to your email. Check your inbox." });
			} catch (error) {
				console.error("[ForgotPassword] Unexpected error:", error.message);
			return res.status(500).json({ message: "Server error", error: error.message });
		}
	}
);

// @route   POST /api/auth/reset-password
// @desc    Reset user password using OTP
// @access  Public
router.post(
	"/reset-password",
	[
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
		body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ message: errors.array()[0].msg });
		}

		const email = String(req.body.email).trim().toLowerCase();
		const otp = String(req.body.otp).trim();
		const { password } = req.body;

		try {
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			if (!user.resetOtp || !user.resetOtpExpiry) {
				return res.status(400).json({ message: "No OTP found. Please request a new OTP." });
			}

			if (new Date() > user.resetOtpExpiry) {
				return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
			}

			if (user.resetOtp !== otp) {
				return res.status(400).json({ message: "Invalid OTP" });
			}

			user.password = password;
			user.resetOtp = null;
			user.resetOtpExpiry = null;
			await user.save();

			return res.status(200).json({ message: "Password reset successful. Please login." });
		} catch (error) {
			return res.status(500).json({ message: "Server error", error: error.message });
		}
	}
);

// @route   POST /api/auth/login
// @desc    Login user
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
			return res.status(400).json({ message: errors.array()[0].msg });
		}

		const email = String(req.body.email).trim().toLowerCase();
		const { password } = req.body;

		try {
			// Check if user exists
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			if (!user.isVerified) {
				return res.status(403).json({
					message: "Please verify your email using OTP before login",
					errorCode: "USER_NOT_VERIFIED",
				});
			}

			// Check password
			const isMatch = await user.comparePassword(password);
			if (!isMatch) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			res.json({
				_id: user._id,
				fullName: user.fullName,
				email: user.email,
				enrolledCourses: user.enrolledCourses,
				token: generateToken(user._id),
			});
		} catch (error) {
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	}
);

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post("/google", async (req, res) => {
	const { credential } = req.body;
	try {
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		const { name, email, picture } = payload;

		let user = await User.findOne({ email });

		if (user) {
			// User exists, log them in
			res.json({
				_id: user._id,
				fullName: user.fullName,
				email: user.email,
				avatar: user.avatar,
				enrolledCourses: user.enrolledCourses,
				token: generateToken(user._id),
			});
		} else {
			// User does not exist, create a new user
			const newUser = await User.create({
				fullName: name,
				email,
				avatar: picture,
				isVerified: true, // Google users are considered verified
			});

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				email: newUser.email,
				avatar: newUser.avatar,
				enrolledCourses: newUser.enrolledCourses,
				token: generateToken(newUser._id),
			});
		}
	} catch (error) {
		res.status(400).json({ message: "Google authentication failed", error });
	}
});

export default router;
