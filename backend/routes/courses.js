

import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Instructor from "../models/Instructor.js";
import { protect } from "../middleware/auth.js";
import { protectInstructor } from "../middleware/instructorAuth.js";
import upload from "../middleware/upload.js";
import { uploadVideoToR2 } from "../middleware/r2Upload.js";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const router = express.Router();

// S3 Client initialization
const hasR2Config = !!(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET_NAME &&
    process.env.CLOUDFLARE_R2_PUBLIC_URL
);

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
});

// Validation and Normalization Helpers
const validateVideoUrl = (url) => {
    if (!url) return false;
    const cleanUrl = url.trim();
    const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (r2PublicUrl) {
        const cleanR2Url = r2PublicUrl.trim().replace(/\/$/, "");
        if (cleanUrl.startsWith(cleanR2Url)) return true;
    }
    return cleanUrl.includes("cloudfront.net");
};

const validateModulesVideoUrls = (modules) => {
    if (!modules || !Array.isArray(modules)) return null;
    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const module = modules[mIdx];
        const moduleTitle = module.title || `Module ${mIdx + 1}`;
        if (module.videos && Array.isArray(module.videos)) {
            for (let vIdx = 0; vIdx < module.videos.length; vIdx++) {
                const video = module.videos[vIdx];
                const videoTitle = video.title || `Video ${vIdx + 1}`;
                if (!validateVideoUrl(video.url)) return { videoTitle, moduleTitle, url: video.url };
            }
        }
	}
	return null;
};

const safeDecodeURIComponent = (value) => {
	if (typeof value !== "string") return "";
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
};

const getDocumentKeyCandidates = (value) => {
	const raw = String(value || "").trim();
	if (!raw) return [];

	const decoded = safeDecodeURIComponent(raw).trim();
	const stripped = decoded.split("?")[0].split("#")[0].replace(/^\/+/, "");
	const basename = stripped.split("/").pop();

	return [...new Set([raw, decoded, stripped, basename].filter(Boolean))];
};

const courseHasDocument = (course, requestedKey) => {
	const requestedCandidates = new Set(getDocumentKeyCandidates(requestedKey));
	if (requestedCandidates.size === 0) return false;

	for (const module of course?.modules || []) {
		for (const video of module?.videos || []) {
			for (const doc of video?.documents || []) {
				const docCandidates = [
					...(doc?.key ? getDocumentKeyCandidates(doc.key) : []),
					...(doc?.url ? getDocumentKeyCandidates(doc.url) : []),
				];

				if (docCandidates.some((candidate) => requestedCandidates.has(candidate))) {
					return true;
				}
			}
		}
	}

	return false;
};

const canAccessCourse = async (course, user) => {
	if (!course || !user) return false;

	if (user.role === "admin" || user.role === "instructor") {
		return true;
	}

	if (course.instructorId && course.instructorId.toString() === user._id?.toString()) {
		return true;
	}

	const student = await User.findById(user._id).select("enrolledCourses");
	return !!student?.enrolledCourses?.some(
		(enrollment) => enrollment.courseId && enrollment.courseId.toString() === course._id.toString()
	);
};

const findCourseDocument = (course, requestedKey) => {
	const requestedCandidates = new Set(getDocumentKeyCandidates(requestedKey));
	for (const module of course?.modules || []) {
		for (const video of module?.videos || []) {
			for (const doc of video?.documents || []) {
				const docCandidates = [
					...(doc?.key ? getDocumentKeyCandidates(doc.key) : []),
					...(doc?.url ? getDocumentKeyCandidates(doc.url) : []),
				];

				if (docCandidates.some((candidate) => requestedCandidates.has(candidate))) {
					return doc;
				}
			}
		}
	}
	return null;
};

const pipeResponseBody = async (source, res) => {
	if (!source) throw new Error("Document stream body is empty");

	if (typeof source.pipe === "function") {
		source.pipe(res);
		return;
	}

	if (typeof Readable.fromWeb === "function" && typeof source.getReader === "function") {
		Readable.fromWeb(source).pipe(res);
		return;
	}

	throw new Error("Unsupported document stream body type");
};

const normalizeCourseModules = (modules) => {
    if (!Array.isArray(modules)) return [];
    return modules
        .filter((module) => module && typeof module === "object")
        .map((module, moduleIndex) => {
            const videos = Array.isArray(module.videos)
                ? module.videos
                        .filter((video) => video && typeof video === "object")
                        .map((video, videoIndex) => ({
                            title: String(video.title || "").trim(),
                            url: String(video.url || ""),
                            publicId: String(video.publicId || ""),
                            duration: String(video.duration || ""),
                            description: String(video.description || ""),
                            order: Number(video.order) || videoIndex + 1,
                            documents: Array.isArray(video.documents) ? video.documents : []
                        }))
                : [];
            return {
                title: String(module.title || "").trim(),
                description: String(module.description || ""),
                order: Number(module.order) || moduleIndex + 1,
                videos,
            };
        })
        .filter((module) => module.title.length > 0);
};

// --- ROUTES ---

router.get("/", async (req, res) => {
    try {
        const courses = await Course.find({}).sort({ createdAt: -1 }).lean();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/:id/content", protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean();
        if (!course) return res.status(404).json({ message: "Course not found" });
        
        // Authorization Logic
        let isAuthorized = req.user?.role === "admin" || req.user?.role === "instructor" || 
                           (course.instructorId && course.instructorId.toString() === req.user?._id.toString());
        
        if (!isAuthorized && req.user) {
            const student = await User.findById(req.user._id).select("enrolledCourses");
            if (student?.enrolledCourses?.some(e => e.courseId?.toString() === req.params.id)) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) return res.status(403).json({ message: "Access denied." });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// SECURE STREAMING ROUTE
router.get("/:courseId/documents/stream", protect, async (req, res) => {
    try {
        const { courseId } = req.params;
        const documentKey = req.query.key;
        if (!documentKey) return res.status(400).json({ message: "Key missing" });

        const course = await Course.findById(courseId).lean();
        if (!course) return res.status(404).json({ message: "Course not found" });

        const isAuthorized = await canAccessCourse(course, req.user);
        if (!isAuthorized) {
            return res.status(403).json({ message: "Access denied." });
        }

        if (!courseHasDocument(course, documentKey)) {
            return res.status(404).json({ message: "Document not found in this course." });
        }

        const document = findCourseDocument(course, documentKey);
        const s3Key = safeDecodeURIComponent(documentKey).replace(/^\/+/, "");
        const filename = (document?.name || s3Key.split('/').pop() || "document.pdf").trim();
        const encodedFilename = encodeURIComponent(filename);

        res.setHeader("Cache-Control", "private, no-store, no-transform");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", document?.type || "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"; filename*=UTF-8''${encodedFilename}`);

        if (hasR2Config) {
            try {
                const command = new GetObjectCommand({
                    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
                    Key: s3Key,
                });

                const s3Response = await s3Client.send(command);
                await pipeResponseBody(s3Response.Body, res);
                return;
            } catch (r2Error) {
                console.warn("R2 stream failed, trying document URL fallback:", r2Error?.message || r2Error);
            }
        }

        if (!document?.url) {
            throw new Error("Document URL missing for fallback streaming");
        }

        const fallbackResponse = await fetch(document.url);
        if (!fallbackResponse.ok || !fallbackResponse.body) {
            throw new Error(`Fallback fetch failed with status ${fallbackResponse.status}`);
        }

        if (fallbackResponse.headers.get("content-type")) {
            res.setHeader("Content-Type", fallbackResponse.headers.get("content-type"));
        }

        await pipeResponseBody(fallbackResponse.body, res);
    } catch (error) {
        console.error("Error streaming secure document:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to load secure document.", error: error.message });
        } else {
            res.destroy?.(error);
        }
    }
});
// ==========================================


// @route   POST /api/courses
// @desc    Create a course (Instructor or Admin)
// @access  Private
router.post("/", protect, async (req, res) => {
    try {
        // Validate Video URLs in Modules
        if (req.body.modules) {
            const err = validateModulesVideoUrls(req.body.modules);
            if (err) {
                return res.status(400).json({
                    message: `Validation Error: The video URL for "${err.videoTitle}" in module "${err.moduleTitle}" is not a valid CloudFront/R2 URL. All course videos must be hosted on the authorized delivery endpoint: ${process.env.CLOUDFLARE_R2_PUBLIC_URL || "CloudFront/R2"}`
                });
            }
        }

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

            // Validate Video URLs in Modules
            const err = validateModulesVideoUrls(modules);
            if (err) {
                return res.status(400).json({
                    message: `Validation Error: The video URL for "${err.videoTitle}" in module "${err.moduleTitle}" is not a valid CloudFront/R2 URL. All course videos must be hosted on the authorized delivery endpoint: ${process.env.CLOUDFLARE_R2_PUBLIC_URL || "CloudFront/R2"}`
                });
            }

            modules = normalizeCourseModules(modules);

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
        // Validate Video URLs in Modules
        if (req.body.modules) {
            const err = validateModulesVideoUrls(req.body.modules);
            if (err) {
                return res.status(400).json({
                    message: `Validation Error: The video URL for "${err.videoTitle}" in module "${err.moduleTitle}" is not a valid CloudFront/R2 URL. All course videos must be hosted on the authorized delivery endpoint: ${process.env.CLOUDFLARE_R2_PUBLIC_URL || "CloudFront/R2"}`
                });
            }
        }

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

            if (updateData.modules !== undefined) {
                // Validate Video URLs in Modules
                const err = validateModulesVideoUrls(updateData.modules);
                if (err) {
                    return res.status(400).json({
                        message: `Validation Error: The video URL for "${err.videoTitle}" in module "${err.moduleTitle}" is not a valid CloudFront/R2 URL. All course videos must be hosted on the authorized delivery endpoint: ${process.env.CLOUDFLARE_R2_PUBLIC_URL || "CloudFront/R2"}`
                    });
                }
                updateData.modules = normalizeCourseModules(updateData.modules);
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
        const { title, url, publicId, duration, description, order, documents } = req.body;

        // Validate Video URL
        if (!validateVideoUrl(url)) {
            return res.status(400).json({
                message: `Validation Error: The video URL is not a valid CloudFront/R2 URL. All course videos must be hosted on the authorized delivery endpoint: ${process.env.CLOUDFLARE_R2_PUBLIC_URL || "CloudFront/R2"}`
            });
        }

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

        const newVideo = {
            title,
            url: url || "",
            publicId: publicId || "",
            duration: duration || "",
            description: description || "",
            order: order || course.modules[moduleIndex].videos.length + 1,
            documents: documents || []
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
        const { title, url, publicId, duration, description, order, documents } = req.body;

        // Validate Video URL if passed
        if (url !== undefined && !validateVideoUrl(url)) {
            return res.status(400).json({
                message: `Validation Error: The video URL is not a valid CloudFront/R2 URL. All course videos must be hosted on the authorized delivery endpoint: ${process.env.CLOUDFLARE_R2_PUBLIC_URL || "CloudFront/R2"}`
            });
        }

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

        if (title) course.modules[moduleIndex].videos[videoIndex].title = title;
        if (url !== undefined) course.modules[moduleIndex].videos[videoIndex].url = url;
        if (publicId !== undefined) course.modules[moduleIndex].videos[videoIndex].publicId = publicId;
        if (duration !== undefined) course.modules[moduleIndex].videos[videoIndex].duration = duration;
        if (description !== undefined) course.modules[moduleIndex].videos[videoIndex].description = description;
        if (order) course.modules[moduleIndex].videos[videoIndex].order = order;
        if (documents !== undefined) course.modules[moduleIndex].videos[videoIndex].documents = documents; 

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

// @route   POST /api/courses/instructor/upload-video
// @desc    Upload a video as instructor
// @access  Private (Instructor)
router.post("/instructor/upload-video", protectInstructor, uploadVideoToR2, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video file provided" });
        }

        // Extract duration if available
        const duration = req.file.duration ? Math.round(req.file.duration) : 0;

        res.json({
            message: "Video uploaded successfully to Cloudflare R2",
            url: req.file.path,
            publicId: req.file.filename,
            duration: duration,
            thumbnail: req.file.thumbnail || null,
        });
    } catch (error) {
        console.error("Error uploading video:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
});

export default router;
