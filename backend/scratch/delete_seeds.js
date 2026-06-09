import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config({ path: '.env' });

const SEED_URLS = [
  "what_are_ai_agents.mp4",
  "agentic_workflow.mp4",
  "langchain_agents.mp4",
  "multi_agent_systems.mp4",
  "planning_reasoning.mp4",
  "memory_state.mp4"
];

async function removeSeedVideos() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  
  const courses = await Course.find({});
  let removedCount = 0;

  for (let course of courses) {
    if (!course.modules) continue;

    let modified = false;

    for (let i = course.modules.length - 1; i >= 0; i--) {
      let module = course.modules[i];
      if (!module.videos) continue;

      const initialLength = module.videos.length;
      
      module.videos = module.videos.filter(v => {
        // Remove if URL contains any of the seed filenames
        const isSeed = SEED_URLS.some(seedUrl => v.url && v.url.includes(seedUrl));
        if (isSeed) {
          console.log(`Removing seed video: ${v.title} from module '${module.title}'`);
          removedCount++;
        }
        return !isSeed;
      });

      if (module.videos.length !== initialLength) {
        modified = true;
      }

      // If a module becomes empty because we removed all its videos, we remove the module too
      if (module.videos.length === 0) {
        console.log(`Removing empty module: '${module.title}'`);
        course.modules.splice(i, 1);
        modified = true;
      }
    }

    if (modified) {
      await course.save();
      console.log(`Saved course: ${course.title}`);
    }
  }

  console.log(`\nSuccessfully removed ${removedCount} seed videos.`);
  mongoose.disconnect();
}

removeSeedVideos().catch(console.error);
