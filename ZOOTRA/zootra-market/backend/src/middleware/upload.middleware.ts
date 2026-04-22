import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Middleware to handle file uploads
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload failed', error: err });
        }
        next();
    });
};

export default uploadMiddleware;