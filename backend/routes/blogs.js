import express from "express";
import Blog from "../models/Blog.js";
const router = express.Router();

// Get all blogs
router.get("/", async (req, res) => {
	try {
		const blogs = await Blog.find().sort({ createdAt: -1 });
		res.json(blogs);
	} catch (error) {
		res.status(500).json({ message: "Error fetching blogs", error: error.message });
	}
});

// Get featured blog
router.get("/featured", async (req, res) => {
	try {
		const blog = await Blog.findOne({ featured: true }).sort({ createdAt: -1 });
		res.json(blog);
	} catch (error) {
		res.status(500).json({ message: "Error fetching featured blog", error: error.message });
	}
});

// Get blog by slug
router.get("/:slug", async (req, res) => {
	try {
		const blog = await Blog.findOne({ slug: req.params.slug });
		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}
		
		// Increment views
		blog.views += 1;
		await blog.save();
		
		res.json(blog);
	} catch (error) {
		res.status(500).json({ message: "Error fetching blog", error: error.message });
	}
});

// Like a blog
router.post("/:slug/like", async (req, res) => {
	try {
		const blog = await Blog.findOne({ slug: req.params.slug });
		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}
		
		blog.likes += 1;
		await blog.save();
		
		res.json({ likes: blog.likes });
	} catch (error) {
		res.status(500).json({ message: "Error liking blog", error: error.message });
	}
});

export default router;
