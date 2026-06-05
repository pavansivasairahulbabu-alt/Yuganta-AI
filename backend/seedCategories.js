import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import Category from "./models/Category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const categories = [
  { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "AI and machine learning concepts" },
  { name: "Web Development", slug: "web-development", description: "Front-end and back-end web development" },
  { name: "Mobile Development", slug: "mobile-development", description: "iOS and Android development" },
  { name: "Data Science", slug: "data-science", description: "Data analysis and visualization" },
  { name: "Cloud Computing", slug: "cloud-computing", description: "AWS, Azure, Google Cloud" },
  { name: "DevOps", slug: "devops", description: "CI/CD, Docker, Kubernetes" },
  { name: "Cybersecurity", slug: "cybersecurity", description: "Security best practices and techniques" },
  { name: "Blockchain", slug: "blockchain", description: "Blockchain and cryptocurrency" },
  { name: "Database Design", slug: "database-design", description: "SQL and NoSQL databases" },
  { name: "Programming Basics", slug: "programming-basics", description: "Fundamentals of programming" },
];

const seedCategories = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();

    console.log("🗑️  Clearing existing categories...");
    await Category.deleteMany({});

    console.log("📝 Seeding categories...");
    const createdCategories = await Category.insertMany(categories);

    console.log(`✅ Successfully seeded ${createdCategories.length} categories:`);
    createdCategories.forEach((cat) => {
      console.log(`  • ${cat.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
    process.exit(1);
  }
};

seedCategories();
