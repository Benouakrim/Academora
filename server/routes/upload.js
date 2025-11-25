import express from 'express';
import multer from 'multer';
import { parseUserToken, requireAdmin, requireUser } from '../middleware/auth.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../services/cloudinary.js';

const router = express.Router();

// Configure multer for in-memory storage (we'll upload to Cloudinary directly)
const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Cloudinary supports larger files)
  }
});

const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
  }
});

// Upload image endpoint
router.post('/image', parseUserToken, requireUser, imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'academora/images',
      {
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      }
    );

    // Return Cloudinary URL
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url, // Full Cloudinary URL
      publicId: result.public_id,
      filename: result.original_filename,
      originalName: req.file.originalname,
      size: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
});

// Delete image endpoint
// Supports deleting by public_id or full Cloudinary URL
router.delete('/image/:publicId(*)', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const publicId = req.params.publicId;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID or URL is required' });
    }

    // Try to delete from Cloudinary
    const result = await deleteFromCloudinary(publicId, 'image');

    if (result.result === 'ok' || result.result === 'not found') {
      res.json({ 
        message: 'Image deleted successfully',
        result: result.result 
      });
    } else {
      res.status(404).json({ 
        error: 'Image not found',
        result: result.result 
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
});

router.post('/video', parseUserToken, requireUser, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'academora/videos',
      {
        resource_type: 'video',
        eager: [
          { width: 1280, height: 720, crop: 'limit', quality: 'auto' }
        ],
        eager_async: false,
      }
    );

    res.json({
      message: 'Video uploaded successfully',
      videoUrl: result.secure_url, // Full Cloudinary URL
      publicId: result.public_id,
      filename: result.original_filename,
      originalName: req.file.originalname,
      size: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
      format: result.format,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error.message 
    });
  }
});


export default router;
