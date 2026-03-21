import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

console.log("🔍 Testing MongoDB Connection...");
console.log(`📍 URI: ${process.env.MONGODB_URI?.substring(0, 50)}...`);

const connectDB = async () => {
	try {
		mongoose.set("strictQuery", true);
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			serverSelectionTimeoutMS: 60000,
			socketTimeoutMS: 60000,
			connectTimeoutMS: 15000,
			family: 4,
			maxPoolSize: 50,
			minPoolSize: 10,
			maxIdleTimeMS: 60000,
			waitQueueTimeoutMS: 30000,
			retryWrites: true,
			retryReads: true,
		});
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
		console.log(`📊 Database: ${conn.connection.name}`);
		
		// Test a query
		const collections = await conn.connection.db.listCollections().toArray();
		console.log(`📦 Collections found: ${collections.map(c => c.name).join(", ")}`);
		
		process.exit(0);
	} catch (error) {
		console.error(`❌ MongoDB Error: ${error.message}`);
		console.error(error);
		process.exit(1);
	}
};

connectDB();
