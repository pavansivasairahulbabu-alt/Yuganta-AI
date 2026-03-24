import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all active jobs
// @access  Public
router.get("/", async (req, res) => {
	try {
		const jobs = await Job.find({ active: true }).sort({ createdAt: -1 }).lean();
		res.json(jobs);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

export default router;
