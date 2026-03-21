import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("\n🔍 MongoDB Connection Diagnostics");
console.log("==================================\n");

if (!process.env.MONGODB_URI) {
	console.error("❌ MONGODB_URI is NOT SET in .env");
	console.log("   Expected in: backend/.env");
	process.exit(1);
}

console.log("✅ MONGODB_URI is configured");
console.log(`   Cluster: ${process.env.MONGODB_URI.split("@")[1].split(".")[0] || "unknown"}`);
console.log("   (Password hidden for security)");

(async () => {
	try {
		console.log("\n⏳ Attempting connection (this may take up to 30 seconds)...\n");
		
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			serverSelectionTimeoutMS: 30000,
			socketTimeoutMS: 45000,
			connectTimeoutMS: 10000,
			family: 4,
		});
		
		console.log(`✅ SUCCESS: Connected to MongoDB`);
		console.log(`   Host: ${conn.connection.host}`);
		console.log(`   Database: ${conn.connection.db.databaseName}`);
		console.log(`   Collections: ${(await conn.connection.db.listCollections().toArray()).map(c => c.name).join(", ") || "none"}`);
		
		await mongoose.connection.close();
		console.log("\n✅ Connection test completed successfully!");
		
	} catch (error) {
		console.error("\n❌ CONNECTION FAILED");
		console.error(`Error: ${error.message}\n`);
		
		if (error.message.includes("ENOTFOUND")) {
			console.error("🔴 ISSUE: Cannot resolve MongoDB host");
			console.error("   → Check your MONGODB_URI is correct");
			console.error("   → Check your internet connection");
		} else if (error.message.includes("auth failed") || error.message.includes("Unauthorized")) {
			console.error("🔴 ISSUE: Authentication failed");
			console.error("   → Check username and password in MONGODB_URI");
		} else if (error.message.includes("TIMEOUT") || error.message.includes("timed out")) {
			console.error("🔴 ISSUE: Connection timeout");
			console.error("   → Check if your IP is whitelisted in MongoDB Atlas Network Access");
			console.error("   → Check if MongoDB cluster is running (IDLE or AVAILABLE status)");
		}
		
		process.exit(1);
	}
})();
