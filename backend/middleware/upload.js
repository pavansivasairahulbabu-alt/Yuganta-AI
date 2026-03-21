import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine resource type based on file mimetype
        const isPdf = file.mimetype === 'application/pdf';
        const isVideo = file.mimetype.startsWith('video/');
        
        return {
            folder: 'course-materials',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'mp4', 'mov', 'avi', 'mkv', 'webm'],
            resource_type: isVideo ? 'video' : (isPdf ? 'raw' : 'auto'),
        };
    },
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit for videos
    }
});

export default upload;
