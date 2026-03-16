import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.select("-password")
			.populate("enrolledCourses.courseId")
			.populate("assignedInstructor", "name expertise email avatar bio")
			.populate("assignedMentor", "name expertise email avatar bio");

		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   GET /api/users/assigned-instructor
// @desc    Get user's assigned instructor
// @access  Private
router.get("/assigned-instructor", protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.populate("assignedInstructor", "name expertise email avatar bio");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!user.assignedInstructor) {
			return res.status(404).json({ message: "No instructor assigned yet" });
		}

		res.json(user.assignedInstructor);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   GET /api/users/assigned-mentor
// @desc    Get user's assigned mentor
// @access  Private
router.get("/assigned-mentor", protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.populate("assignedMentor", "name expertise email avatar bio");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!user.assignedMentor) {
			return res.status(404).json({ message: "No mentor assigned yet" });
		}

		res.json(user.assignedMentor);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		if (user) {
			user.fullName = req.body.fullName || user.fullName;
			user.email = req.body.email || user.email;

			if (req.body.password) {
				user.password = req.body.password;
			}

			const updatedUser = await user.save();

			res.json({
				_id: updatedUser._id,
				fullName: updatedUser.fullName,
				email: updatedUser.email,
				enrolledCourses: updatedUser.enrolledCourses,
			});
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   POST /api/users/enroll/:courseId
// @desc    Enroll in a course
// @access  Private
router.post("/enroll/:courseId", protect, async (req, res) => {
	try {
		const courseId = req.params.courseId;

		if (!mongoose.Types.ObjectId.isValid(courseId)) {
			return res.status(400).json({ message: "Invalid course id" });
		}

		const user = await User.findById(req.user._id).select("enrolledCourses");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if already enrolled
		const alreadyEnrolled = user.enrolledCourses.find(
			(course) => course.courseId.toString() === courseId
		);

		if (alreadyEnrolled) {
			return res
				.status(400)
				.json({ message: "Already enrolled in this course" });
		}

		const enrollResult = await User.updateOne(
			{
				_id: req.user._id,
				"enrolledCourses.courseId": { $ne: courseId },
			},
			{
				$push: {
					enrolledCourses: {
						courseId,
						enrolledAt: Date.now(),
						progress: 0,
						completed: false,
					},
				},
			},
		);

		if (enrollResult.modifiedCount === 0) {
			return res.status(400).json({ message: "Already enrolled in this course" });
		}

		const updatedUser = await User.findById(req.user._id).select("enrolledCourses");

		// Increment student count in course
		const Course = (await import("../models/Course.js")).default;
		await Course.findByIdAndUpdate(courseId, {
			$inc: { students: 1 }
		});

		res.json({
			message: "Successfully enrolled",
			enrolledCourses: updatedUser?.enrolledCourses || [],
		});
	} catch (error) {
		console.error("Enrollment error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   GET /api/users/enrolled
// @desc    Get enrolled courses
// @access  Private
router.get("/enrolled", protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate(
			"enrolledCourses.courseId"
		);
		
		// Filter out null courseIds (deleted courses)
		const filteredEnrolledCourses = user.enrolledCourses.filter(
			(enrollment) => enrollment.courseId !== null
		).sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
		
		res.json(filteredEnrolledCourses);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

export default router;
