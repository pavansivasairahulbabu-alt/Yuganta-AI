import mongoose from "mongoose";


const connectDB = async () => {
	try {
		mongoose.set("strictQuery", true);
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			serverSelectionTimeoutMS: 60000,
			socketTimeoutMS: 60000,
			connectTimeoutMS: 15000,
			family: 4,
			maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 50),
			minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 10),
			maxIdleTimeMS: 60000,
			waitQueueTimeoutMS: 30000,
			retryWrites: true,
			retryReads: true,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
//   console.error("MongoDB Connection Error:");
//   console.error("Message:", error.message);
//   console.error("Name:", error.name);
//   console.error("Code:", error.code);
//   console.error("Stack:", error.stack);
  process.exit(1);
}
}

export default connectDB;
