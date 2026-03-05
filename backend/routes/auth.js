import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "30d",
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

		try {
			// Check if user exists
			const userExists = await User.findOne({ email });
			if (userExists) {
				return res.status(400).json({ message: "User already exists" });
			}

			// Create user
			const user = await User.create({
				fullName,
				email,
				password,
			});

			if (user) {
				res.status(201).json({
					_id: user._id,
					fullName: user.fullName,
					email: user.email,
					token: generateToken(user._id),
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

		const { email, password } = req.body;

		try {
			// Check if user exists
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(401).json({ message: "Invalid credentials" });
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
