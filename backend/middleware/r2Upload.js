import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
}

const storage = multer.memoryStorage();
const uploadMemory = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});

export const uploadVideoToR2 = async (req, res, next) => {
  uploadMemory.single("video")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Multer error", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    if (!hasR2Config) {
      return res.status(500).json({ message: "Cloudflare R2 storage is not configured." });
    }

    try {
      const folder = "videos";
      const uniqueFileName = `${folder}/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;

      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: uniqueFileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(command);

      const downloadUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/, "")}/${uniqueFileName}`;
      
      // Attach details to mimic original multer-storage-cloudinary layout
      req.file.path = downloadUrl;
      req.file.filename = uniqueFileName;
      req.file.duration = 0; // Fallback since R2 doesn't return metadata duration
      
      next();
    } catch (uploadErr) {
      console.error("R2 Upload middleware error:", uploadErr);
      res.status(500).json({ message: "Failed to upload video to Cloudflare R2", error: uploadErr.message });
    }
  });
};
