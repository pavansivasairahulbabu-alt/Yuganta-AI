import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Video from '../models/Video.js';

dotenv.config({ path: '.env' });

async function testCurriculumEndpoints() {
  console.log("Connecting to Database...");
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("\n--- STARTING CURRICULUM ENDPOINT LOGIC TEST ---");

  // 1. Find a test course
  const course = await Course.findOne({});
  if (!course) {
    console.log("No courses found to test against.");
    return mongoose.disconnect();
  }
  
  // 2. Find a test video
  const video = await Video.findOne({});
  if (!video) {
    console.log("No videos found to test against.");
    return mongoose.disconnect();
  }

  console.log(`\n[TEST 1] Testing Video Association (PUT /videos/:id equivalent)`);
  console.log(`Target Video: ${video.title}`);
  console.log(`Target Course: ${course.title}`);
  
  const testModuleName = "Automated Test Module";
  const testVideoOrder = 99;

  // SIMULATE: scrub old locations
  let modifiedCourses = 0;
  const allCourses = await Course.find({});
  for (let c of allCourses) {
    let modified = false;
    if (c.modules) {
      for (let i = c.modules.length - 1; i >= 0; i--) {
        let m = c.modules[i];
        if (m.videos) {
          const initialLen = m.videos.length;
          m.videos = m.videos.filter(v => v.url !== video.videoUrl && v.title !== video.title);
          if (m.videos.length !== initialLen) modified = true;
        }
        if (m.videos.length === 0) {
          c.modules.splice(i, 1);
          modified = true;
        }
      }
    }
    if (modified) {
      await c.save();
      modifiedCourses++;
    }
  }
  console.log(`✅ Scrubbed video from ${modifiedCourses} old location(s).`);

  // SIMULATE: Insert into new module
  const targetCourse = await Course.findById(course._id);
  let moduleObj = targetCourse.modules.find(m => m.title === testModuleName);
  if (!moduleObj) {
    const maxModuleOrder = targetCourse.modules.reduce((max, m) => Math.max(max, m.order || 0), 0);
    targetCourse.modules.push({
      title: testModuleName,
      description: "Testing API Logic",
      order: maxModuleOrder + 1,
      videos: [],
    });
    moduleObj = targetCourse.modules[targetCourse.modules.length - 1];
  }

  moduleObj.videos.push({
    title: video.title,
    url: video.videoUrl,
    duration: video.duration ? String(video.duration) : "10:00",
    order: testVideoOrder
  });

  await targetCourse.save();

  // VERIFY 
  const verificationCourse = await Course.findById(course._id);
  const verifyModule = verificationCourse.modules.find(m => m.title === testModuleName);
  const verifyVideo = verifyModule ? verifyModule.videos.find(v => v.title === video.title) : null;

  if (verifyModule && verifyVideo && verifyVideo.order === testVideoOrder) {
    console.log(`✅ SUCCESS: Video was correctly assigned to module '${testModuleName}' at order ${testVideoOrder}.`);
  } else {
    console.log(`❌ FAILED: Video association logic did not persist to MongoDB.`);
  }

  // CLEANUP: Remove the test module
  const cleanupCourse = await Course.findById(course._id);
  cleanupCourse.modules = cleanupCourse.modules.filter(m => m.title !== testModuleName);
  await cleanupCourse.save();
  console.log(`✅ Cleanup complete. Removed test module from database.`);

  console.log("\n--- TEST SUITE FINISHED ---");
  mongoose.disconnect();
}

testCurriculumEndpoints();
