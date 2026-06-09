import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config({ path: '.env' });

async function cleanCourses() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  
  const courses = await Course.find({});
  console.log(`Found ${courses.length} courses.`);

  for (let course of courses) {
    console.log(`\nChecking Course: ${course.title} (ID: ${course._id})`);
    
    // Clear legacy videos array
    if (course.videos && course.videos.length > 0) {
      console.log(` - Found ${course.videos.length} legacy videos at root level. Clearing them...`);
      course.videos = [];
    }
    
    // Check modules for dog videos or old test videos
    if (course.modules && course.modules.length > 0) {
      for (let i = course.modules.length - 1; i >= 0; i--) {
        let module = course.modules[i];
        
        let initialLength = module.videos.length;
        module.videos = module.videos.filter(v => {
          // If the URL contains dog.mp4, elephant, turtle, etc. we should remove them
          if (v.url && (v.url.includes("dog") || v.url.includes("elephant") || v.url.includes("sea_turtle"))) {
            console.log(` - Removing dummy video: ${v.title} (${v.url})`);
            return false;
          }
          // Some might have invalid urls or be old seeds that are not R2
          if (v.url && !v.url.includes("pub-f58d270cf3294402934fa2667e0b053d.r2.dev")) {
             console.log(` - Removing non-R2 video: ${v.title} (${v.url})`);
             return false;
          }
          return true;
        });
        
        if (module.videos.length === 0) {
           console.log(` - Module '${module.title}' has no videos left after cleanup. Removing module.`);
           course.modules.splice(i, 1);
        }
      }
    }
    
    await course.save();
    console.log(` - Course '${course.title}' cleaned and saved.`);
  }

  console.log("\nCleanup finished.");
  mongoose.disconnect();
}

cleanCourses().catch(console.error);
