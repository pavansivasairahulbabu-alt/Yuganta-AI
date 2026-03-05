import express from "express";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import { protect } from "../middleware/auth.js";
import { protectInstructor } from "../middleware/instructorAuth.js";
import upload from "../middleware/upload.js"; // Import upload middleware

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get("/", async (req, res) => {
	try {
		const courses = await Course.find({}).sort({ createdAt: -1 });
		res.json(courses);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   GET /api/courses/instructor/:instructorId
// @desc    Get all courses for a specific instructor
// @access  Public
router.get("/instructor/:instructorId", async (req, res) => {
	try {
		const courses = await Course.find({
			instructorId: req.params.instructorId,
		}).sort({ createdAt: -1 });
		res.json(courses);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   GET /api/courses/my-courses
// @desc    Get courses for logged-in instructor
// @access  Private (Instructor)
router.get("/my-courses/list", protectInstructor, async (req, res) => {
	try {
		const courses = await Course.find({
			instructorId: req.instructor._id,
		}).sort({ createdAt: -1 });
		res.json(courses);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get("/:id", async (req, res) => {
	try {
		const course = await Course.findById(req.params.id);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		res.json(course);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   POST /api/courses
// @desc    Create a course (Instructor or Admin)
// @access  Private
router.post("/", protect, async (req, res) => {
	try {
		const course = await Course.create(req.body);

		// Update students count on creation to 0
		course.students = 0;
		course.rating = 0;
		await course.save();

		res.status(201).json(course);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   POST /api/courses/instructor/create
// @desc    Create a course as instructor
// @access  Private (Instructor)
router.post(
	"/instructor/create",
	protectInstructor,
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "brochure", maxCount: 1 },
	]),
	async (req, res) => {
		try {
			// Log files and body to debug
			console.log("Files:", req.files);
			console.log("Body:", req.body);

			const {
				title,
				description,
				category,
				level,
				duration,
				price,
				videoUrl,
				videoPublicId,
			} = req.body;

			// Parse modules if sent as JSON string (common with FormData/Postman)
			let modules = [];
			if (req.body.modules) {
				try {
					modules =
						typeof req.body.modules === "string"
							? JSON.parse(req.body.modules)
							: req.body.modules;
				} catch (e) {
					console.error("Error parsing modules:", e);
					modules = [];
				}
			}

			if (!title || !description || !category) {
				return res
					.status(400)
					.json({
						message:
							"Title, description, and category are required",
					});
			}

			// Get file URLs from Cloudinary upload
			let thumbnailUrl = "";
			let brochureUrl = "";

			if (req.files) {
				if (req.files.thumbnail && req.files.thumbnail[0]) {
					thumbnailUrl = req.files.thumbnail[0].path;
				}
				if (req.files.brochure && req.files.brochure[0]) {
					brochureUrl = req.files.brochure[0].path;
				}
			}

			// Use existing thumbnail/brochure if passed in body (e.g. from previous edit) and no new file uploaded
			if (!thumbnailUrl && req.body.thumbnail)
				thumbnailUrl = req.body.thumbnail;
			if (!brochureUrl && req.body.brochureLink)
				brochureUrl = req.body.brochureLink;

			const courseData = {
				title,
				description,
				category,
				level: level || "Beginner",
				duration: duration || "",
				price: price || "Free",
				thumbnail: thumbnailUrl,
				brochureLink: brochureUrl,
				videoUrl: videoUrl || "",
				videoPublicId: videoPublicId || "",
				instructor:
					req.body.instructor ||
					req.instructor.name ||
					req.instructor.email,
				instructorId: req.instructor._id,
				modules: modules,
				students: 0,
				rating: 0,
				isFree: price === "Free" || !price,
			};

			console.log("Creating course with data:", courseData);

			const course = await Course.create(courseData);

			// Update instructor's courses array
			await Instructor.findByIdAndUpdate(
				req.instructor._id,
				{ $push: { courses: course._id } },
				{ new: true },
			);

			res.status(201).json(course);
		} catch (error) {
			console.error("Error creating course:", error);
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	},
);

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private
router.put("/:id", protect, async (req, res) => {
	try {
		const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		res.json(course);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   PUT /api/courses/instructor/:id
// @desc    Update a course as instructor
// @access  Private (Instructor)
router.put(
	"/instructor/:id",
	protectInstructor,
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "brochure", maxCount: 1 },
	]),
	async (req, res) => {
		try {
			const course = await Course.findById(req.params.id);

			if (!course) {
				return res.status(404).json({ message: "Course not found" });
			}

			// Check if instructor owns this course
			if (
				course.instructorId.toString() !== req.instructor._id.toString()
			) {
				return res
					.status(403)
					.json({ message: "Not authorized to update this course" });
			}

			let updateData = { ...req.body };

			// Parse modules if strictly updating via form-data (sometimes passed as string)
			if (req.body.modules && typeof req.body.modules === "string") {
				try {
					updateData.modules = JSON.parse(req.body.modules);
				} catch (e) {
					console.error("Error parsing modules on update:", e);
				}
			}

			// Handle file uploads
			if (req.files) {
				if (req.files.thumbnail && req.files.thumbnail[0]) {
					updateData.thumbnail = req.files.thumbnail[0].path;
				}
				if (req.files.brochure && req.files.brochure[0]) {
					updateData.brochureLink = req.files.brochure[0].path;
				}
			}

			const updatedCourse = await Course.findByIdAndUpdate(
				req.params.id,
				updateData,
				{ new: true, runValidators: true },
			);

			res.json(updatedCourse);
		} catch (error) {
			console.error("Error updating course:", error);
			res.status(500).json({
				message: "Server error",
				error: error.message,
			});
		}
	},
);

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private
router.delete("/:id", protect, async (req, res) => {
	try {
		const course = await Course.findByIdAndDelete(req.params.id);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		res.json({ message: "Course deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   DELETE /api/courses/instructor/:id
// @desc    Delete a course as instructor
// @access  Private (Instructor)
router.delete("/instructor/:id", protectInstructor, async (req, res) => {
	try {
		const course = await Course.findById(req.params.id);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Check if instructor owns this course
		if (course.instructorId.toString() !== req.instructor._id.toString()) {
			return res
				.status(403)
				.json({ message: "Not authorized to delete this course" });
		}

		await Course.findByIdAndDelete(req.params.id);

		// Remove course from instructor's courses array
		await Instructor.findByIdAndUpdate(
			req.instructor._id,
			{ $pull: { courses: req.params.id } },
			{ new: true },
		);

		res.json({ message: "Course deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   POST /api/courses/instructor/:courseId/modules
// @desc    Add a module to a course
// @access  Private (Instructor)
router.post("/instructor/:courseId/modules", protectInstructor, async (req, res) => {
	try {
		const course = await Course.findById(req.params.courseId);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Check if instructor owns this course
		if (course.instructorId.toString() !== req.instructor._id.toString()) {
			return res.status(403).json({ message: "Not authorized to modify this course" });
		}

		const { title, description, order, videos } = req.body;

		const newModule = {
			title,
			description: description || "",
			order: order || course.modules.length + 1,
			videos: videos || []
		};

		course.modules.push(newModule);
		await course.save();

		res.json({ 
			message: "Module added successfully", 
			course,
			module: course.modules[course.modules.length - 1]
		});
	} catch (error) {
		console.error("Error adding module:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   PUT /api/courses/instructor/:courseId/modules/:moduleId
// @desc    Update a module in a course
// @access  Private (Instructor)
router.put("/instructor/:courseId/modules/:moduleId", protectInstructor, async (req, res) => {
	try {
		const course = await Course.findById(req.params.courseId);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Check if instructor owns this course
		if (course.instructorId.toString() !== req.instructor._id.toString()) {
			return res.status(403).json({ message: "Not authorized to modify this course" });
		}

		const moduleIndex = course.modules.findIndex(
			m => m._id.toString() === req.params.moduleId
		);

		if (moduleIndex === -1) {
			return res.status(404).json({ message: "Module not found" });
		}

		const { title, description, order, videos } = req.body;

		if (title) course.modules[moduleIndex].title = title;
		if (description !== undefined) course.modules[moduleIndex].description = description;
		if (order) course.modules[moduleIndex].order = order;
		if (videos) course.modules[moduleIndex].videos = videos;

		await course.save();

		res.json({ 
			message: "Module updated successfully", 
			course,
			module: course.modules[moduleIndex]
		});
	} catch (error) {
		console.error("Error updating module:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   DELETE /api/courses/instructor/:courseId/modules/:moduleId
// @desc    Delete a module from a course
// @access  Private (Instructor)
router.delete("/instructor/:courseId/modules/:moduleId", protectInstructor, async (req, res) => {
	try {
		const course = await Course.findById(req.params.courseId);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Check if instructor owns this course
		if (course.instructorId.toString() !== req.instructor._id.toString()) {
			return res.status(403).json({ message: "Not authorized to modify this course" });
		}

		course.modules = course.modules.filter(
			m => m._id.toString() !== req.params.moduleId
		);

		await course.save();

		res.json({ message: "Module deleted successfully", course });
	} catch (error) {
		console.error("Error deleting module:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   POST /api/courses/instructor/:courseId/modules/:moduleId/videos
// @desc    Add a video to a module
// @access  Private (Instructor)
router.post("/instructor/:courseId/modules/:moduleId/videos", protectInstructor, async (req, res) => {
	try {
		const course = await Course.findById(req.params.courseId);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Check if instructor owns this course
		if (course.instructorId.toString() !== req.instructor._id.toString()) {
			return res.status(403).json({ message: "Not authorized to modify this course" });
		}

		const moduleIndex = course.modules.findIndex(
			m => m._id.toString() === req.params.moduleId
		);

		if (moduleIndex === -1) {
			return res.status(404).json({ message: "Module not found" });
		}

		const { title, url, publicId, duration, description, order } = req.body;

		const newVideo = {
			title,
			url: url || "",
			publicId: publicId || "",
			duration: duration || "",
			description: description || "",
			order: order || course.modules[moduleIndex].videos.length + 1
		};

		course.modules[moduleIndex].videos.push(newVideo);
		await course.save();

		res.json({ 
			message: "Video added successfully", 
			course,
			video: course.modules[moduleIndex].videos[course.modules[moduleIndex].videos.length - 1]
		});
	} catch (error) {
		console.error("Error adding video:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   PUT /api/courses/instructor/:courseId/modules/:moduleId/videos/:videoId
// @desc    Update a video in a module
// @access  Private (Instructor)
router.put("/instructor/:courseId/modules/:moduleId/videos/:videoId", protectInstructor, async (req, res) => {
	try {
		const course = await Course.findById(req.params.courseId);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Check if instructor owns this course
		if (course.instructorId.toString() !== req.instructor._id.toString()) {
			return res.status(403).json({ message: "Not authorized to modify this course" });
		}

		const moduleIndex = course.modules.findIndex(
			m => m._id.toString() === req.params.moduleId
		);

		if (moduleIndex === -1) {
			return res.status(404).json({ message: "Module not found" });
		}

		const videoIndex = course.modules[moduleIndex].videos.findIndex(
			v => v._id.toString() === req.params.videoId
		);

		if (videoIndex === -1) {
			return res.status(404).json({ message: "Video not found" });
		}

		const { title, url, publicId, duration, description, order } = req.body;

		if (title) course.modules[moduleIndex].videos[videoIndex].title = title;
		if (url !== undefined) course.modules[moduleIndex].videos[videoIndex].url = url;
		if (publicId !== undefined) course.modules[moduleIndex].videos[videoIndex].publicId = publicId;
		if (duration !== undefined) course.modules[moduleIndex].videos[videoIndex].duration = duration;
		if (description !== undefined) course.modules[moduleIndex].videos[videoIndex].description = description;
		if (order) course.modules[moduleIndex].videos[videoIndex].order = order;

		await course.save();

		res.json({ 
			message: "Video updated successfully", 
			course,
			video: course.modules[moduleIndex].videos[videoIndex]
		});
	} catch (error) {
		console.error("Error updating video:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// @route   DELETE /api/courses/instructor/:courseId/modules/:moduleId/videos/:videoId
// @desc    Delete a video from a module
// @access  Private (Instructor)
router.delete("/instructor/:courseId/modules/:moduleId/videos/:videoId", protectInstructor, async (req, res) => {
	try {
		const course = await Course.findById(req.params.courseId);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Check if instructor owns this course
		if (course.instructorId.toString() !== req.instructor._id.toString()) {
			return res.status(403).json({ message: "Not authorized to modify this course" });
		}

		const moduleIndex = course.modules.findIndex(
			m => m._id.toString() === req.params.moduleId
		);

		if (moduleIndex === -1) {
			return res.status(404).json({ message: "Module not found" });
		}

		course.modules[moduleIndex].videos = course.modules[moduleIndex].videos.filter(
			v => v._id.toString() !== req.params.videoId
		);

		await course.save();

		res.json({ message: "Video deleted successfully", course });
	} catch (error) {
		console.error("Error deleting video:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

export default router;
