import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const CourseSchema = new mongoose.Schema({
  title: String,
  modules: [
    {
      title: String,
      videos: [
        {
          title: String,
          url: String,
          publicId: String,
          duration: String,
          description: String,
          order: Number
        }
      ]
    }
  ]
});

const Course = mongoose.model("Course", CourseSchema);

async function runAudit() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully.\n");

    const courses = await Course.find({}).lean();

    console.log("====================================================");
    console.log("VERIFY CURRENT DATABASE");
    console.log("====================================================\n");

    for (const course of courses) {
      console.log(`Course: ${course.title}`);
      if (!course.modules || course.modules.length === 0) {
        console.log("  No modules found.");
      } else {
        for (const mod of course.modules) {
          console.log(`  Module: ${mod.title}`);
          if (!mod.videos || mod.videos.length === 0) {
            console.log("    No videos found.");
          } else {
            for (const vid of mod.videos) {
              console.log(`    Video:`);
              console.log(`      Title: ${vid.title}`);
              console.log(`      URL: ${vid.url || "(empty)"}`);
            }
          }
        }
      }
      console.log("");
    }

    console.log("====================================================");
    console.log("VALIDATION REPORT");
    console.log("====================================================\n");

    const report = [];

    for (const course of courses) {
      if (course.modules) {
        for (const mod of course.modules) {
          if (mod.videos) {
            for (const vid of mod.videos) {
              const url = vid.url || "";
              
              let isCloudFront = false;
              let isR2 = false;
              let isCloudinary = false;
              let isSeeded = false;
              let isEmpty = url.trim() === "";

              if (!isEmpty) {
                // CloudFront URL patterns (custom domain, or *.cloudfront.net)
                if (url.includes("cloudfront.net") || url.includes("cdn.yuganta") || url.includes("cdn.yugantha")) {
                  isCloudFront = true;
                }
                // Cloudflare R2 dev domains (e.g. pub-...r2.dev or similar)
                if (url.includes("r2.dev") || url.includes("r2.cloudflarestorage.com")) {
                  isR2 = true;
                }
                // Cloudinary
                if (url.includes("res.cloudinary.com") || url.includes("cloudinary")) {
                  isCloudinary = true;
                }
                // Seeded/demo URLs
                if (
                  url.includes("gtv-videos-bucket") || 
                  url.includes("sample") || 
                  url.includes("w3schools") || 
                  url.includes("dog.mp4") || 
                  url.includes("elephants.mp4") || 
                  url.includes("sea_turtle.mp4") ||
                  url.includes("BigBuckBunny.mp4") ||
                  url.includes("ForBiggerBlazes.mp4") ||
                  url.includes("ElephantsDream.mp4") ||
                  url.includes("ForBiggerEscapes.mp4") ||
                  url.includes("ForBiggerFun.mp4")
                ) {
                  isSeeded = true;
                }
              }

              report.push({
                course: course.title,
                module: mod.title,
                videoTitle: vid.title,
                url,
                isCloudFront,
                isR2,
                isCloudinary,
                isSeeded,
                isEmpty
              });
            }
          }
        }
      }
    }

    console.table(report.map(r => ({
      Course: r.course.substring(0, 25),
      Module: r.module.substring(0, 15),
      Video: r.videoTitle.substring(0, 15),
      URL: r.url.substring(0, 30),
      CF: r.isCloudFront ? "YES" : "NO",
      R2: r.isR2 ? "YES" : "NO",
      Cloudinary: r.isCloudinary ? "YES" : "NO",
      Seeded: r.isSeeded ? "YES" : "NO",
      Empty: r.isEmpty ? "YES" : "NO"
    })));

    console.log("\nSummary Analysis:");
    const stats = {
      total: report.length,
      cf: report.filter(r => r.isCloudFront).length,
      r2: report.filter(r => r.isR2).length,
      cloudinary: report.filter(r => r.isCloudinary).length,
      seeded: report.filter(r => r.isSeeded).length,
      empty: report.filter(r => r.isEmpty).length,
      other: report.filter(r => !r.isCloudFront && !r.isR2 && !r.isCloudinary && !r.isSeeded && !r.isEmpty).length
    };
    console.log(stats);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Audit run error:", error);
  }
}

runAudit();
