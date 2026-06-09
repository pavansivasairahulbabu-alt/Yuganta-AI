import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config({ path: '.env' });

async function dumpCourses() {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = await Course.find({});
  for (let c of courses) {
    console.log(`\n=== Course: ${c.title} ===`);
    if (c.modules) {
      for (let m of c.modules) {
        console.log(`  Module: ${m.title}`);
        if (m.videos) {
          for (let v of m.videos) {
            console.log(`    - Video: ${v.title} (${v.url})`);
          }
        }
      }
    } else {
      console.log(`  No modules found.`);
    }
  }
  mongoose.disconnect();
}
dumpCourses();
