import mongoose from "mongoose";

const connectDB = async () => {
	try {
		mongoose.set("strictQuery", true);
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			serverSelectionTimeoutMS: 30000,
			socketTimeoutMS: 45000,
			connectTimeoutMS: 10000,
			family: 4,
			maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
			minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 5),
			maxIdleTimeMS: 30000,
			waitQueueTimeoutMS: 10000,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		console.error('Failed to connect to MongoDB. Please check:');
		console.error('1. Your internet connection');
		console.error('2. MongoDB Atlas cluster is running');
		console.error('3. Your IP address is whitelisted in MongoDB Atlas');
		console.error('4. Username and password are correct');
		process.exit(1);
	}
};

export default connectDB;
