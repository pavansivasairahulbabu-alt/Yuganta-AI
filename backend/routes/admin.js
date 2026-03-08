import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Mentor from "../models/Mentor.js";
import User from "../models/User.js";
import Instructor from "../models/Instructor.js";
import Blog from "../models/Blog.js";
import MentorshipSession from "../models/MentorshipSession.js";
import sgMail from "../config/mailer.js";
import upload from "../middleware/upload.js";
import multer from "multer";

// In-memory multer for instructor photo (no Cloudinary required)
const memStorage = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// Email configuration - Gmail SMTP


// Function to send OTP email
const sendOTPEmail = async (email, otp, instructorName) => {
	try {
		const htmlContent = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Welcome to YuganthaAI, ${instructorName}!</h2>
				<p>Your instructor account has been created. Please set your password using the OTP below:</p>
				
				<div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
					<p style="margin: 0; color: #666; font-size: 14px;">Your OTP (valid for 10 minutes):</p>
					<p style="margin: 10px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</p>
				</div>
				
				<p>Please visit the forgot password page and enter your email and this OTP to set your password:</p>
				<p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/instructor/forgot-password" style="color: #007bff; text-decoration: none;">Set Your Password</a></p>
				
				<p style="color: #666; font-size: 12px; margin-top: 30px;">
					If you didn't request this, please contact the administrator.
				</p>
			</div>
		`;

		const msg = {
			to: email,
			from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yuganthaai.com',
			subject: "YuganthaAI - Instructor Account Setup",
			html: htmlContent,
		};

		// Try to send email, but don't fail if email service is unavailable
		try {
			const result = await sgMail.send(msg);
			console.log(`✅ OTP email sent to ${email} via SendGrid`);
			console.log(`📧 Message ID: ${result[0].headers['x-message-id']}`);
		} catch (emailError) {
			// Log to console instead of failing completely
			console.log(`📧 [MOCK EMAIL] OTP for ${email}: ${otp}`);
			console.log(`Note: Email service unavailable. In production, this would be sent to: ${email}`);
			console.error('SendGrid Error:', emailError.message);
		}

		return true;
	} catch (error) {
		console.error("Error sending OTP email:", error);
		// Don't throw - gracefully handle email failures
		return true;
	}
};

// Static admin credentials
const ADMIN_EMAIL = "admin@yugantaai.com";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("Admin123!", 10);

// Admin login
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (email !== ADMIN_EMAIL) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ email: ADMIN_EMAIL, role: "admin" },
			process.env.JWT_SECRET,
			{ expiresIn: "34h" }
		);

		res.json({
			token,
			admin: { email: ADMIN_EMAIL },
		});
	} catch (error) {
		console.error("Admin login error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
	const token = req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		console.warn("❌ No authorization token provided");
		return res.status(401).json({ message: "No token, authorization denied" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log("🔍 Decoded token:", { email: decoded.email, role: decoded.role });
		
		if (decoded.role !== "admin") {
			console.warn("❌ Token role is not admin, received:", decoded.role);
			return res.status(403).json({ message: "Access denied - admin role required" });
		}
		
		req.admin = decoded;
		console.log("✅ Admin verified:", decoded.email);
		next();
	} catch (error) {
		console.error("❌ Token verification error:", error.message);
		res.status(401).json({ message: "Token is not valid" });
	}
};

// Get all mentors
router.get("/mentors", verifyAdmin, async (req, res) => {
	try {
		const { topic } = req.query;
		const filter = {};
		if (topic && typeof topic === "string" && topic.trim()) {
			filter.expertise = { $regex: topic.trim(), $options: "i" };
		}
		const mentors = await Mentor.find(filter).sort({ createdAt: -1 });
		res.json(mentors);
	} catch (error) {
		console.error("Get mentors error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Add new mentor
router.post("/mentors", verifyAdmin, async (req, res) => {
	try {
		const { name, expertise, email, bio, photo, company } = req.body;
		if (!name || !expertise || !email || !bio || !photo || !company) {
			return res.status(400).json({ message: "Name, expertise, email, bio, photo, and company are required" });
		}

		const existingMentor = await Mentor.findOne({ email });
		if (existingMentor) {
			return res.status(400).json({ message: "Mentor with this email already exists" });
		}

		const mentor = new Mentor({
			name,
			expertise,
			email,
			bio,
			photo,
			company,
			active: true,
		});

		await mentor.save();
		res.status(201).json(mentor);
	} catch (error) {
		console.error("Add mentor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Activate mentor
router.put("/mentors/:id/activate", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;

		const mentor = await Mentor.findByIdAndUpdate(
			id,
			{ active: true },
			{ new: true }
		);

		if (!mentor) {
			return res.status(404).json({ message: "Mentor not found" });
		}

		res.json({
			message: "Mentor activated successfully",
			mentor,
		});
	} catch (error) {
		console.error("Activate mentor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Deactivate mentor
router.put("/mentors/:id/deactivate", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;

		const mentor = await Mentor.findByIdAndUpdate(
			id,
			{ active: false },
			{ new: true }
		);

		if (!mentor) {
			return res.status(404).json({ message: "Mentor not found" });
		}

		res.json({
			message: "Mentor deactivated successfully",
			mentor,
		});
	} catch (error) {
		console.error("Deactivate mentor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Update mentor (toggle active or update details)
router.put("/mentors/:id", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;

		const mentor = await Mentor.findByIdAndUpdate(
			id,
			updates,
			{ new: true, runValidators: true }
		);

		if (!mentor) {
			return res.status(404).json({ message: "Mentor not found" });
		}

		res.json(mentor);
	} catch (error) {
		console.error("Update mentor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Delete mentor
router.delete("/mentors/:id", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;

		const mentor = await Mentor.findByIdAndDelete(id);

		if (!mentor) {
			return res.status(404).json({ message: "Mentor not found" });
		}

		res.json({ message: "Mentor deleted successfully" });
	} catch (error) {
		console.error("Delete mentor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Get all mentorship sessions
router.get("/mentorship-sessions", verifyAdmin, async (req, res) => {
	try {
		const sessions = await MentorshipSession.find()
			.populate("userId", "fullName email")
			.populate("mentorId", "name email expertise")
			.sort({ bookedDate: -1 });
		res.json(sessions);
	} catch (error) {
		console.error("Get mentorship sessions error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Assign or reassign mentor to a session
router.put("/mentorship-sessions/:id/assign-mentor", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const { mentorId } = req.body;

		if (!mentorId) {
			return res.status(400).json({ message: "mentorId is required" });
		}

		const session = await MentorshipSession.findById(id);
		if (!session) {
			return res.status(404).json({ message: "Session not found" });
		}

		const mentor = await Mentor.findById(mentorId);
		if (!mentor) {
			return res.status(404).json({ message: "Mentor not found" });
		}

		session.mentorId = mentorId;
		session.status = "mentor_assigned";
		await session.save();

		await session.populate("userId", "fullName email");
		await session.populate("mentorId", "name email expertise");

		res.json({ message: "Mentor assigned successfully", session });
	} catch (error) {
		console.error("Assign mentor to session error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Get all users
router.get("/users", verifyAdmin, async (req, res) => {
	try {
		const users = await User.find()
			.select("-password")
			.populate({
				path: "assignedInstructor",
				select: "name expertise email",
				options: { strictPopulate: false }
			})
			.sort({ createdAt: -1 });
		res.json(users);
	} catch (error) {
		console.error("Get users error:", error);
		res.status(500).json({ message: "Server error", details: error.message });
	}
});

// Assign instructor to user
router.post("/assign-instructor", verifyAdmin, async (req, res) => {
	try {
		const { userId, instructorId } = req.body;

		if (!userId || !instructorId) {
			return res.status(400).json({ message: "User ID and Instructor ID are required" });
		}

		// Verify instructor exists and is active
		const instructor = await Instructor.findById(instructorId);
		if (!instructor) {
			return res.status(404).json({ message: "Instructor not found" });
		}

		if (!instructor.active) {
			return res.status(400).json({ message: "Instructor is not active" });
		}

		// Update user with assigned instructor
		const user = await User.findByIdAndUpdate(
			userId,
			{ assignedInstructor: instructorId },
			{ new: true }
		).populate({
			path: "assignedInstructor",
			select: "name expertise email",
			options: { strictPopulate: false }
		});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({
			message: "Instructor assigned successfully",
			user,
		});
	} catch (error) {
		console.error("Assign instructor error:", error);
		res.status(500).json({ message: "Server error", details: error.message });
	}
});

// Create instructor (admin adds instructor)
router.post("/instructors", verifyAdmin, async (req, res) => {
	try {
		const { name, email, expertise, bio, photo, company, avatar, experience } = req.body;
		if (!name || !email || !expertise || !bio || !photo || !company) {
			return res.status(400).json({ message: "Name, email, expertise, bio, photo, and company are required" });
		}

		const existingInstructor = await Instructor.findOne({ email });
		if (existingInstructor) {
			return res.status(400).json({ message: "Instructor with this email already exists" });
		}

		const instructor = new Instructor({
			name,
			email,
			expertise,
			bio,
			photo,
			company,
			avatar: avatar || "",
			experience: experience || "",
			active: true,
			approved: true, // Admin-created instructors are pre-approved
			// No password, no OTP - instructor will set password when they first login
		});

		await instructor.save();

		res.status(201).json({
			message: "Instructor created successfully. They can now set their password using the forgot password option.",
			instructor: {
				_id: instructor._id,
				name: instructor.name,
				email: instructor.email,
				expertise: instructor.expertise,
				photo: instructor.photo,
				company: instructor.company,
				bio: instructor.bio,
				experience: instructor.experience,
				active: instructor.active,
				approved: instructor.approved,
			},
		});
	} catch (error) {	
		console.error("Create instructor error:", error);
		res.status(500).json({ message: "Server error", details: error.message });
	}
});

// Get all registered instructors
router.get("/instructors", verifyAdmin, async (req, res) => {
	try {
		const instructors = await Instructor.find()
			.select("-password")
			.sort({ createdAt: -1 });
		res.json(instructors);
	} catch (error) {
		console.error("Get instructors error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Approve instructor
router.put("/instructors/:id/approve", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;

		const instructor = await Instructor.findByIdAndUpdate(
			id,
			{ approved: true },
			{ new: true }
		).select("-password");

		if (!instructor) {
			return res.status(404).json({ message: "Instructor not found" });
		}

		res.json({
			message: "Instructor approved successfully",
			instructor,
		});
	} catch (error) {
		console.error("Approve instructor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Deactivate instructor
router.put("/instructors/:id/deactivate", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;

		const instructor = await Instructor.findByIdAndUpdate(
			id,
			{ active: false },
			{ new: true }
		).select("-password");

		if (!instructor) {
			return res.status(404).json({ message: "Instructor not found" });
		}

		res.json({
			message: "Instructor deactivated successfully",
			instructor,
		});
	} catch (error) {
		console.error("Deactivate instructor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Activate instructor
router.put("/instructors/:id/activate", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;

		const instructor = await Instructor.findByIdAndUpdate(
			id,
			{ active: true },
			{ new: true }
		).select("-password");

		if (!instructor) {
			return res.status(404).json({ message: "Instructor not found" });
		}

		res.json({
			message: "Instructor activated successfully",
			instructor,
		});
	} catch (error) {
		console.error("Activate instructor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Delete instructor
router.delete("/instructors/:id", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;

		// Check if any users are assigned to this instructor
		const assignedUsers = await User.find({ assignedInstructor: id });
		
		if (assignedUsers.length > 0) {
			// Optionally, you can either:
			// 1. Prevent deletion
			// return res.status(400).json({ 
			//   message: `Cannot delete instructor. ${assignedUsers.length} student(s) are assigned to this instructor.` 
			// });
			
			// 2. Or unassign students first (recommended)
			await User.updateMany(
				{ assignedInstructor: id },
				{ $unset: { assignedInstructor: "" } }
			);
		}

		const instructor = await Instructor.findByIdAndDelete(id);

		if (!instructor) {
			return res.status(404).json({ message: "Instructor not found" });
		}

		res.json({ 
			message: "Instructor deleted successfully",
			unassignedStudents: assignedUsers.length 
		});
	} catch (error) {
		console.error("Delete instructor error:", error);
		res.status(500).json({ message: "Server error", details: error.message });
	}
});

// Assign mentor to user
router.post("/assign-mentor", verifyAdmin, async (req, res) => {
	try {
		const { userId, mentorId } = req.body;

		if (!userId || !mentorId) {
			return res.status(400).json({ message: "userId and mentorId are required" });
		}

		// Find user and mentor
		const user = await User.findById(userId);
		const mentor = await Mentor.findById(mentorId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!mentor) {
			return res.status(404).json({ message: "Mentor not found" });
		}

		// Assign mentor to user
		user.assignedMentor = mentorId;
		await user.save();

		res.json({
			message: `${mentor.name} assigned to ${user.fullName}`,
			user,
		});
	} catch (error) {
		console.error("Assign mentor error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// ==================== BLOG MANAGEMENT ROUTES ====================

// Get all blogs (admin)
router.get("/blogs", verifyAdmin, async (req, res) => {
	try {
		const blogs = await Blog.find().sort({ createdAt: -1 });
		res.json(blogs);
	} catch (error) {
		console.error("Get blogs error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Create new blog
router.post("/blogs", verifyAdmin, async (req, res) => {
	try {
		const { title, excerpt, content, author, category, tags, readTime, featured, thumbnail, slug } = req.body;

		if (!title || !excerpt || !content || !author || !category) {
			return res.status(400).json({ message: "All required fields must be filled" });
		}

		// Use provided slug or generate from title
		const blogSlug = slug || title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		// Check if slug already exists
		const existingBlog = await Blog.findOne({ slug: blogSlug });
		if (existingBlog) {
			return res.status(400).json({ message: "A blog with similar title already exists" });
		}

		const blogData = {
			title,
			slug: blogSlug,
			excerpt,
			content,
			author,
			category,
			tags: Array.isArray(tags) ? tags : [],
			readTime: readTime || 5,
			featured: Boolean(featured),
			thumbnail: thumbnail || "",
		};

		const blog = new Blog(blogData);
		await blog.save();

		res.status(201).json(blog);
	} catch (error) {
		console.error("Create blog error:", error);
		res.status(500).json({ message: "Server error", details: error.message });
	}
});

// Update blog
router.put("/blogs/:id", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const { title, excerpt, content, author, category, tags, readTime, featured, thumbnail, slug } = req.body;

		const blog = await Blog.findById(id);
		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}

		// Update slug if title changed or slug provided
		if (slug) {
			blog.slug = slug;
		} else if (title && title !== blog.title) {
			const newSlug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");
			
			// Check if new slug conflicts with another blog
			const slugExists = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
			if (slugExists) {
				return res.status(400).json({ message: "A blog with similar title already exists" });
			}
			blog.slug = newSlug;
		}

		if (title) blog.title = title;
		if (excerpt) blog.excerpt = excerpt;
		if (content) blog.content = content;
		if (author) blog.author = author;
		if (category) blog.category = category;
		if (tags) blog.tags = Array.isArray(tags) ? tags : [];
		if (readTime !== undefined) blog.readTime = readTime;
		if (featured !== undefined) blog.featured = Boolean(featured);
		if (thumbnail !== undefined) blog.thumbnail = thumbnail;

		await blog.save();
		res.json(blog);
	} catch (error) {
		console.error("Update blog error:", error);
		res.status(500).json({ message: "Server error", details: error.message });
	}
});

// Delete blog
router.delete("/blogs/:id", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const blog = await Blog.findByIdAndDelete(id);

		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}

		res.json({ message: "Blog deleted successfully" });
	} catch (error) {
		console.error("Delete blog error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Toggle featured status
router.put("/blogs/:id/toggle-featured", verifyAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const blog = await Blog.findById(id);

		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}

		blog.featured = !blog.featured;
		await blog.save();

		res.json(blog);
	} catch (error) {
		console.error("Toggle featured error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Upload instructor profile photo (memory storage → base64 data URL, no Cloudinary needed)
router.post("/upload-instructor-photo", verifyAdmin, memStorage.single("photo"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No photo file provided" });
		}
		const b64 = req.file.buffer.toString("base64");
		const dataUrl = `data:${req.file.mimetype};base64,${b64}`;
		res.json({ url: dataUrl, message: "Photo uploaded successfully" });
	} catch (error) {
		console.error("Instructor photo upload error:", error);
		res.status(500).json({ message: "Server error", details: error.message });
	}
});

// Upload image for blog
router.post("/upload-image", verifyAdmin, upload.single("image"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No image file provided" });
		}

		res.json({
			message: "Image uploaded successfully",
			url: req.file.path,
			publicId: req.file.filename,
		});
	} catch (error) {
		console.error("Image upload error:", error);
		res.status(500).json({ message: "Server error", details: error.message });
	}
});

export default router;
