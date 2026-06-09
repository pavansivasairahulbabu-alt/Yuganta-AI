import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config({ path: '.env' });

async function checkVideo() {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = await Course.find({});
  let found = false;
  for (let c of courses) {
    if (c.modules) {
      for (let m of c.modules) {
        if (m.videos) {
          for (let v of m.videos) {
            if (v.title.includes("Data types in Java") || v.title.includes("Data Types in Java")) {
              console.log(`Found in Course: ${c.title}, Module: ${m.title}, Order: ${v.order}, URL: ${v.url}`);
              found = true;
            }
          }
        }
      }
    }
  }
  if (!found) {
    console.log("Video not found in any course module.");
  }
  mongoose.disconnect();
}
checkVideo();
