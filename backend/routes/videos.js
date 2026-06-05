import express from "express";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Video from "../models/Video.js";
import Category from "../models/Category.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Check if Cloudflare R2 credentials are fully configured
const hasR2Config = !!(
  process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
  process.env.CLOUDFLARE_R2_BUCKET_NAME &&
  process.env.CLOUDFLARE_R2_PUBLIC_URL
);

let s3Client = null;
if (hasR2Config) {
  s3Client = new S3Client({
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
    region: "auto",
  });
} else {
  console.warn("⚠️ Cloudflare R2 not configured in backend .env. Operating in Simulation / Mock mode for file uploads.");
}

// Predefined mock resources for simulation mode
const MOCK_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
];

const MOCK_THUMBNAILS = [
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542204172-e7052809a8a7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80"
];

// ==========================================
// R2 DIRECT UPLOAD ENDPOINT (Backend proxy)
// ==========================================
router.post("/videos/upload", verifyAdmin, async (req, res) => {
  try {
    const { fileName, fileType, purpose } = req.body;
    const fileBuffer = Buffer.from(req.body.fileData, 'base64');

    if (!fileName || !fileType || !fileBuffer) {
      return res.status(400).json({ message: "fileName, fileType, and fileData are required" });
    }

    const folder = purpose === "thumbnail" ? "thumbnails" : "videos";
    const uniqueFileName = `${folder}/${Date.now()}_${fileName.replace(/\s+/g, "_")}`;

    if (!hasR2Config) {
      // In simulation mode, return a mocked upload destination
      const fallbackUrl = purpose === "thumbnail" 
        ? MOCK_THUMBNAILS[Math.floor(Math.random() * MOCK_THUMBNAILS.length)]
        : MOCK_VIDEOS[Math.floor(Math.random() * MOCK_VIDEOS.length)];

      return res.json({
        isMock: true,
        downloadUrl: fallbackUrl,
        key: uniqueFileName,
      });
    }

    // Upload directly to R2 from backend
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: fileType,
    });

    await s3Client.send(command);
    const downloadUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/, "")}/${uniqueFileName}`;

    res.json({
      isMock: false,
      downloadUrl,
      key: uniqueFileName,
    });
  } catch (error) {
    console.error("Backend upload error:", error);
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
});

// ==========================================
// R2 UPLOAD PRESIGNED URL ROUTE (Legacy)
// ==========================================
router.post("/videos/presign", verifyAdmin, async (req, res) => {
  try {
    const { fileName, fileType, purpose } = req.body; // purpose: "video" | "thumbnail"
    
    if (!fileName || !fileType) {
      return res.status(400).json({ message: "fileName and fileType are required" });
    }

    const folder = purpose === "thumbnail" ? "thumbnails" : "videos";
    const uniqueFileName = `${folder}/${Date.now()}_${fileName.replace(/\s+/g, "_")}`;

    if (!hasR2Config) {
      // In simulation mode, return a mocked upload destination
      const fallbackUrl = purpose === "thumbnail" 
        ? MOCK_THUMBNAILS[Math.floor(Math.random() * MOCK_THUMBNAILS.length)]
        : MOCK_VIDEOS[Math.floor(Math.random() * MOCK_VIDEOS.length)];

      return res.json({
        isMock: true,
        uploadUrl: null, // Frontend will skip HTTP PUT
        downloadUrl: fallbackUrl,
        key: uniqueFileName,
      });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const downloadUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/, "")}/${uniqueFileName}`;

    res.json({
      isMock: false,
      uploadUrl,
      downloadUrl,
      key: uniqueFileName,
    });
  } catch (error) {
    console.error("Presign URL error:", error);
    res.status(500).json({ message: "Failed to generate presigned upload URL", error: error.message });
  }
});

// Helper to delete from R2 if configured
const deleteFromR2 = async (url) => {
  if (!hasR2Config || !s3Client || !url) return;
  try {
    const publicUrlPrefix = process.env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/, "");
    if (url.startsWith(publicUrlPrefix)) {
      const key = url.replace(`${publicUrlPrefix}/`, "");
      const command = new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
      });
      await s3Client.send(command);
      console.log(`🗑️ Successfully deleted from R2: ${key}`);
    }
  } catch (error) {
    console.error("Failed to delete file from Cloudflare R2:", error);
  }
};

// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================

// Get all categories with video count
router.get("/categories", verifyAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // Calculate video counts per category dynamically
    const videoCounts = await Video.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const countMap = {};
    videoCounts.forEach(c => {
      if (c._id) countMap[c._id.toLowerCase()] = c.count;
    });

    const formattedCategories = categories.map(cat => {
      const categoryObj = cat.toObject();
      categoryObj.videoCount = countMap[cat.name.toLowerCase()] || 0;
      return categoryObj;
    });

    res.json(formattedCategories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error retrieving categories" });
  }
});

// Create Category
router.post("/categories", verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingCategory = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existingCategory) {
      return res.status(400).json({ message: "Category name or slug already exists" });
    }

    const newCategory = new Category({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error creating category", error: error.message });
  }
});

// Update Category
router.put("/categories/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const oldName = category.name;

    if (name && name.trim().toLowerCase() !== oldName.toLowerCase()) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const duplicate = await Category.findOne({ _id: { $ne: id }, $or: [{ name: name.trim() }, { slug }] });
      if (duplicate) {
        return res.status(400).json({ message: "Another category with this name or slug already exists" });
      }

      category.name = name.trim();
      category.slug = slug;

      // Update all video metadata that matches the old category name
      await Video.updateMany({ category: oldName }, { category: name.trim() });
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();
    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Server error updating category", error: error.message });
  }
});

// Delete Category
router.delete("/categories/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if there are videos in this category
    const videoCount = await Video.countDocuments({ category: category.name });
    if (videoCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. There are ${videoCount} video(s) assigned to this category. Please reassign or delete them first.` 
      });
    }

    await Category.findByIdAndDelete(id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error deleting category" });
  }
});

// ==========================================
// VIDEOS CRUD ENDPOINTS
// ==========================================

// Get all videos with pagination, filtering, searching, and sorting
router.get("/videos", verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const sortBy = req.query.sortBy || "uploadDate"; // uploadDate, views, title
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const query = {};

    // Apply search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Determine sorting
    let sortQuery = {};
    if (sortBy === "uploadDate") {
      sortQuery.uploadDate = sortOrder;
    } else if (sortBy === "views") {
      sortQuery.views = sortOrder;
    } else if (sortBy === "title") {
      sortQuery.title = sortOrder;
    } else {
      sortQuery.createdAt = sortOrder;
    }

    const skip = (page - 1) * limit;

    const videos = await Video.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalVideos = await Video.countDocuments(query);
    const totalPages = Math.ceil(totalVideos / limit);

    res.json({
      videos,
      pagination: {
        page,
        limit,
        totalPages,
        totalVideos,
      },
    });
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({ message: "Server error retrieving videos" });
  }
});

// Get single video
router.get("/videos/:id", verifyAdmin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json({ message: "Server error retrieving video details" });
  }
});

// Create video metadata
router.post("/videos", verifyAdmin, async (req, res) => {
  try {
    const { title, description, category, tags, thumbnailUrl, videoUrl, duration, fileSize } = req.body;

    if (!title || !category || !videoUrl) {
      return res.status(400).json({ message: "Title, category, and video URL are required" });
    }

    const video = new Video({
      title,
      description: description || "",
      category,
      tags: Array.isArray(tags) ? tags : [],
      thumbnailUrl: thumbnailUrl || "",
      videoUrl,
      duration: duration || 0,
      fileSize: fileSize || 0,
      uploadDate: new Date(),
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error("Create video error:", error);
    res.status(500).json({ message: "Server error saving video metadata", error: error.message });
  }
});

// Update video details
router.put("/videos/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, thumbnailUrl, videoUrl, duration, fileSize } = req.body;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // If changing thumbnail or video URL, delete old ones from Cloudflare R2
    if (thumbnailUrl && thumbnailUrl !== video.thumbnailUrl) {
      await deleteFromR2(video.thumbnailUrl);
    }
    if (videoUrl && videoUrl !== video.videoUrl) {
      await deleteFromR2(video.videoUrl);
    }

    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (category) video.category = category;
    if (tags) video.tags = tags;
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl;
    if (videoUrl) video.videoUrl = videoUrl;
    if (duration !== undefined) video.duration = duration;
    if (fileSize !== undefined) video.fileSize = fileSize;

    await video.save();
    res.json(video);
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({ message: "Server error updating video metadata" });
  }
});

// Delete single video
router.delete("/videos/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Delete media assets from Cloudflare R2
    await deleteFromR2(video.thumbnailUrl);
    await deleteFromR2(video.videoUrl);

    await Video.findByIdAndDelete(id);
    res.json({ message: "Video and associated storage assets deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ message: "Server error deleting video" });
  }
});

// Bulk delete videos
router.post("/videos/bulk-delete", verifyAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty video ids for bulk deletion" });
    }

    const videos = await Video.find({ _id: { $in: ids } });
    
    // Delete files in Cloudflare R2
    for (const video of videos) {
      await deleteFromR2(video.thumbnailUrl);
      await deleteFromR2(video.videoUrl);
    }

    // Delete metadata documents
    const result = await Video.deleteMany({ _id: { $in: ids } });
    
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} video(s) and their associated storage assets.` 
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: "Server error executing bulk deletion" });
  }
});

// ==========================================
// ANALYTICS & STORAGE ENDPOINTS
// ==========================================

// Dashboard stats & charts
router.get("/video-analytics", verifyAdmin, async (req, res) => {
  try {
    // 1. Core Summary Cards Info
    const totalVideos = await Video.countDocuments();
    const totalCategories = await Category.countDocuments();
    
    const viewsAggr = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = viewsAggr[0]?.totalViews || 0;

    const storageAggr = await Video.aggregate([
      { $group: { _id: null, totalBytes: { $sum: "$fileSize" } } }
    ]);
    const totalBytes = storageAggr[0]?.totalBytes || 0;
    const storageUsedGB = parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(2));

    // 2. Recent uploads (limit 5)
    const recentUploads = await Video.find()
      .sort({ uploadDate: -1 })
      .limit(5);

    // 3. Category distribution (chart)
    const categoryDistribution = await Video.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, views: { $sum: "$views" } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Most viewed videos
    const mostViewedVideos = await Video.find()
      .sort({ views: -1 })
      .limit(5);

    // 5. Monthly uploads trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await Video.aggregate([
      { $match: { uploadDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$uploadDate" },
            month: { $month: "$uploadDate" }
          },
          count: { $sum: 1 },
          size: { $sum: "$fileSize" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const targetYear = d.getFullYear();
      const targetMonth = d.getMonth() + 1; // 1-indexed for aggregation matching
      
      const match = monthlyTrends.find(t => t._id.year === targetYear && t._id.month === targetMonth);
      monthlyData.push({
        month: `${months[targetMonth - 1]} ${targetYear}`,
        uploads: match ? match.count : 0,
        sizeMB: match ? parseFloat((match.size / (1024 * 1024)).toFixed(1)) : 0
      });
    }

    // 6. Recent activity timeline log
    const recentActivity = [];
    const latestUploads = await Video.find().sort({ uploadDate: -1 }).limit(3);
    const mostViews = await Video.find().sort({ views: -1 }).limit(2);

    latestUploads.forEach(v => {
      recentActivity.push({
        id: `upload-${v._id}`,
        type: "upload",
        message: `Video uploaded: "${v.title}"`,
        time: v.uploadDate,
        meta: { category: v.category }
      });
    });

    mostViews.forEach(v => {
      if (v.views > 10) {
        recentActivity.push({
          id: `view-${v._id}`,
          type: "milestone",
          message: `Popular video: "${v.title}" reached ${v.views} views`,
          time: new Date(Date.now() - 3600000 * 2), // Mock relative time
          meta: { views: v.views }
        });
      }
    });

    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      summary: {
        totalVideos,
        totalCategories,
        totalViews,
        storageUsedGB,
      },
      recentUploads,
      mostViewedVideos,
      categoryDistribution: categoryDistribution.map(c => ({
        name: c._id || "Uncategorized",
        value: c.count,
        views: c.views
      })),
      monthlyData,
      recentActivity: recentActivity.slice(0, 5)
    });
  } catch (error) {
    console.error("Get video analytics error:", error);
    res.status(500).json({ message: "Server error compiling video analytics" });
  }
});

// Storage Management endpoints
router.get("/video-storage", verifyAdmin, async (req, res) => {
  try {
    const storageLimitGB = 10; // R2 free tier limit, let's configure a mock 10GB limit

    const storageAggr = await Video.aggregate([
      { $group: { _id: null, totalBytes: { $sum: "$fileSize" } } }
    ]);
    const totalBytes = storageAggr[0]?.totalBytes || 0;
    const totalStorageUsedGB = totalBytes / (1024 * 1024 * 1024);
    const availableStorageGB = Math.max(0, storageLimitGB - totalStorageUsedGB);

    const largestVideos = await Video.find()
      .sort({ fileSize: -1 })
      .limit(10);

    // Calculate growth statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const lastMonthStorageAggr = await Video.aggregate([
      { $match: { uploadDate: { $lt: thirtyDaysAgo } } },
      { $group: { _id: null, totalBytes: { $sum: "$fileSize" } } }
    ]);
    
    const lastMonthBytes = lastMonthStorageAggr[0]?.totalBytes || 0;
    const addedBytes = totalBytes - lastMonthBytes;
    const percentGrowth = lastMonthBytes > 0 ? (addedBytes / lastMonthBytes) * 100 : 0;

    res.json({
      stats: {
        totalBytes,
        totalStorageUsedGB: parseFloat(totalStorageUsedGB.toFixed(3)),
        availableStorageGB: parseFloat(availableStorageGB.toFixed(3)),
        storageLimitGB,
        percentGrowth: parseFloat(percentGrowth.toFixed(1)),
        addedBytes,
      },
      largestVideos: largestVideos.map(v => ({
        id: v._id,
        title: v.title,
        sizeMB: parseFloat((v.fileSize / (1024 * 1024)).toFixed(2)),
        category: v.category,
        thumbnailUrl: v.thumbnailUrl,
        uploadDate: v.uploadDate,
      }))
    });
  } catch (error) {
    console.error("Get storage stats error:", error);
    res.status(500).json({ message: "Server error compiling storage statistics" });
  }
});

export default router;
