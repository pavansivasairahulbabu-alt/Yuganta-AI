import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import transporter from "../config/mailer.js";

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "30d",
	});
};

const sendOtpEmail = async (email, otp, name, context = "signup") => {
	const isSignup = context === "signup";
	const actionText = isSignup ? "complete your registration" : "reset your password";
	const pagePath = isSignup ? "/signup" : "/forgot-password";
	const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}${pagePath}`;

	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
			<h2 style="margin-bottom: 8px;">YuganthaAI Verification Code</h2>
			<p>Hello ${name},</p>
			<p>Use this code to ${actionText}.</p>
			<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:18px;text-align:center;margin:20px 0;">
				<p style="margin:0;color:#1d4ed8;font-size:13px;font-weight:600;">Your verification code</p>
				<p style="margin:8px 0 0;font-size:34px;letter-spacing:8px;font-weight:700;color:#1a56db;">${otp}</p>
				<p style="margin:10px 0 0;font-size:12px;color:#6b7280;">This code expires in 10 minutes</p>
			</div>
			<p>Continue here: <a href="${url}" style="color:#1a56db;">${url}</a></p>
			<p style="font-size:12px;color:#6b7280;">If you did not request this, you can ignore this email.</p>
		</div>
	`;

	const text = `YuganthaAI Verification Code\n\nHello ${name},\n\nUse this code to ${actionText}: ${otp}\n\nThis code expires in 10 minutes.\n\nContinue here: ${url}\n\nIf you did not request this, please ignore this email.`;

	await transporter.sendMail({
		from: {
			name: "YuganthaAI",
			email: process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER,
		},
		to: email,
		subject: `Your verification code: ${otp}`,
		html,
		text,
	});
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
				await sendOtpEmail(normalizedEmail, otp, fullName, "signup");

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
				await sendOtpEmail(user.email, otp, user.fullName, "signup");
				res.status(201).json({
					message: "OTP sent to your email. Please verify to complete signup.",
					email: user.email,
				});
			}
		} catch (error) {
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

			await sendOtpEmail(user.email, otp, user.fullName || "User", "reset");

			return res.status(200).json({ message: "OTP sent to your email. Check your inbox." });
		} catch (error) {
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

export default router;
