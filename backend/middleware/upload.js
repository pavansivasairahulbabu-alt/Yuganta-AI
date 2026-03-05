import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine resource type based on file mimetype
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'course-materials',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
            resource_type: isPdf ? 'raw' : 'auto', // Use 'raw' for PDFs explicitly
        };
    },
});

const upload = multer({ storage: storage });

export default upload;
