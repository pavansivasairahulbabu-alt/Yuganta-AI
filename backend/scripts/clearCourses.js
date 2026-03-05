import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

const clearCourses = async () => {
    await connectDB();
    try {
        await mongoose.connection.db.collection('courses').deleteMany({});
        console.log('All courses cleared from database.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing courses:', error);
        process.exit(1);
    }
};

clearCourses();
