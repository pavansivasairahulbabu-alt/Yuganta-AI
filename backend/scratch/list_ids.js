import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config({ path: '.env' });

async function getCourseIds() {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = await Course.find({}, '_id title');
  console.log("Database Course IDs:");
  courses.forEach(c => console.log(`ID: ${c._id} | Title: ${c.title}`));
  mongoose.disconnect();
}
getCourseIds();
