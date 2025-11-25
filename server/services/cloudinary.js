/**
 * Cloudinary service configuration
 * Handles image and video uploads to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} originalName - Original filename (for extension detection)
 * @param {string} folder - Cloudinary folder path (optional)
 * @param {Object} options - Additional Cloudinary options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export async function uploadToCloudinary(fileBuffer, originalName, folder = 'academora', options = {}) {
  return new Promise((resolve, reject) => {
    // Build upload options, ensuring resource_type is set correctly
    const uploadOptions = {
      folder,
      resource_type: options.resource_type || 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // Merge any additional options (transformations, eager, etc.)
    Object.keys(options).forEach(key => {
      if (key !== 'resource_type') {
        uploadOptions[key] = options[key];
      } else {
        // Ensure resource_type is set
        uploadOptions.resource_type = options.resource_type || 'auto';
      }
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create readable stream from buffer and pipe to Cloudinary
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null); // End the stream
    readable.pipe(uploadStream);
  });
}

/**
 * Get file extension from filename
 * @param {string} filename - Original filename
 * @returns {string} File extension (e.g., 'jpg', 'png')
 */
function getFileExtension(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  // Map common extensions
  const extensionMap = {
    'jpg': 'jpeg',
    'jpeg': 'jpeg',
    'png': 'png',
    'gif': 'gif',
    'webp': 'webp',
    'mp4': 'mp4',
    'webm': 'webm',
  };
  return extensionMap[ext] || ext;
}

/**
 * Delete a file from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public_id or URL
 * @param {string} resourceType - 'image', 'video', or 'raw' (default: 'auto')
 * @returns {Promise<Object>} Cloudinary deletion result
 */
export async function deleteFromCloudinary(publicId, resourceType = 'auto') {
  try {
    // Extract public_id from URL if full URL is provided
    let extractedPublicId = publicId;
    
    if (publicId.includes('cloudinary.com')) {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{public_id}
      const urlParts = publicId.split('/upload/');
      if (urlParts.length > 1) {
        extractedPublicId = urlParts[1].split('.')[0]; // Remove extension
      }
    }

    const result = await cloudinary.uploader.destroy(extractedPublicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null if not a Cloudinary URL
 */
export function extractPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  const urlParts = url.split('/upload/');
  if (urlParts.length > 1) {
    const pathPart = urlParts[1];
    // Remove file extension and any transformations
    return pathPart.split('.')[0].split('/').pop();
  }

  return null;
}

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public_id or URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized Cloudinary URL
 */
export function getOptimizedUrl(publicId, options = {}) {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    ...otherOptions
  } = options;

  // If already a full URL, extract public_id
  let extractedPublicId = publicId;
  if (publicId.includes('cloudinary.com')) {
    const extracted = extractPublicId(publicId);
    if (extracted) {
      extractedPublicId = extracted;
    }
  }

  const transformations = [];
  
  if (width || height) {
    transformations.push(`w_${width || 'auto'},h_${height || 'auto'},c_${crop}`);
  }
  
  if (quality) {
    transformations.push(`q_${quality}`);
  }
  
  if (format) {
    transformations.push(`f_${format}`);
  }

  // Add any other transformation options
  Object.entries(otherOptions).forEach(([key, value]) => {
    transformations.push(`${key}_${value}`);
  });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const folder = extractedPublicId.includes('/') ? '' : 'academora/';
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.length > 0 ? transformations.join(',') + '/' : ''}${folder}${extractedPublicId}`;
}

export default cloudinary;

