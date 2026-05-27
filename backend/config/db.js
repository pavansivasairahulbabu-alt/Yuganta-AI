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
		// console.error('Failed to connect to MongoDB. Please check:');
		// console.error('1. Your internet connection');
		// console.error('2. MongoDB Atlas cluster is running');
		// console.error('3. Your IP address is whitelisted in MongoDB Atlas');
		// console.error('4. Username and password are correct');
		process.exit(1);
	}
};

export default connectDB;
