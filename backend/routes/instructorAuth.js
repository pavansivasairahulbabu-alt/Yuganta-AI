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
	const htmlContent = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
			<h2 style="margin-bottom: 8px;">YuganthaAI Password Setup OTP</h2>
			<p>Hello ${instructorName},</p>
			<p>Use the OTP below to set your password.</p>
			
			<div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
				<p style="margin: 0; color: #666; font-size: 14px;">Your OTP (valid for 10 minutes):</p>
				<p style="margin: 10px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</p>
			</div>
			
			<p>Go to the password setup page and enter this OTP.</p>
			<p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/instructor/forgot-password" style="color: #007bff; text-decoration: none;">Set Your Password</a></p>
			
			<p style="color: #666; font-size: 12px; margin-top: 30px;">
				This is an automated transactional email. Do not reply.
			</p>
		</div>
	`;

	const textContent = `YuganthaAI Password Setup OTP\n\nHello ${instructorName},\n\nUse this OTP to set your password: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nSet password here: ${(process.env.FRONTEND_URL || 'http://localhost:5173')}/instructor/forgot-password\n\nIf you did not request this, please ignore this email.`;

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
