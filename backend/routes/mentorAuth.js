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
	
	const htmlContent = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
			<h2 style="margin-bottom: 8px;">YuganthaAI Password Setup OTP</h2>
			<p>Hello ${mentorName},</p>
			<p>Use the OTP below to set your password.</p>
			
			<div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
				<p style="margin: 0; color: #666; font-size: 14px;">Your OTP (valid for 10 minutes):</p>
				<p style="margin: 10px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</p>
			</div>
			
			<p>Go to the password setup page and enter this OTP.</p>
			<p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mentor/forgot-password" style="color: #007bff; text-decoration: none;">Set Your Password</a></p>
			
			<p style="color: #666; font-size: 12px; margin-top: 30px;">
				This is an automated transactional email. Do not reply.
			</p>
		</div>
	`;

	const textContent = `YuganthaAI Password Setup OTP\n\nHello ${mentorName},\n\nUse this OTP to set your password: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nSet password here: ${(process.env.FRONTEND_URL || 'http://localhost:5173')}/mentor/forgot-password\n\nIf you did not request this, please ignore this email.`;

	const msg = {
		to: email,
		from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER,
		subject: "YuganthaAI - Password Setup OTP",
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
