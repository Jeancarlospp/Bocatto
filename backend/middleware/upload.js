import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

/**
 * Cloudinary Configuration
 * Uses environment variables for security
 * 
 * Required .env variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Cloudinary Storage Configuration
 * - Uploads to: bocatto/areas/ folder in Cloudinary
 * - Allowed formats: jpg, png, webp
 * - Auto-generates unique public_id
 * - Transforms: auto-optimize quality and format
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bocatto/areas',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' }, // Max dimensions
      { quality: 'auto' }, // Auto-optimize quality
      { fetch_format: 'auto' } // Auto-convert to best format
    ]
  }
});

/**
 * File filter to accept only images
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed'), false);
  }
};

/**
 * Multer upload middleware with Cloudinary
 * - Single file upload
 * - Field name: 'image'
 * - Max file size: 5MB
 * - Uploads directly to Cloudinary (cloud storage)
 */
export const uploadAreaImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
}).single('image');

/**
 * Helper function to delete image from Cloudinary
 * @param {string} imageUrl - Full Cloudinary URL or public_id
 */
export const deleteAreaImage = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract public_id from Cloudinary URL
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/bocatto/areas/abc123.jpg
    // public_id: bocatto/areas/abc123
    
    let publicId;
    
    if (imageUrl.includes('cloudinary.com')) {
      // Extract from full URL
      const parts = imageUrl.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        // Get everything after version (v1234567890)
        const pathParts = parts.slice(uploadIndex + 2);
        publicId = pathParts.join('/').split('.')[0]; // Remove extension
      }
    } else {
      // Assume it's already a public_id
      publicId = imageUrl;
    }
    
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Image deleted from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

/**
 * ========================================
 * PRODUCTS UPLOAD MIDDLEWARE
 * ========================================
 */

/**
 * Cloudinary Storage for Products
 * - Uploads to: bocatto/products/ folder
 */
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bocatto/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

/**
 * Multer upload middleware for Products
 * - Single product image
 * - Max 5MB
 */
export const uploadProductImage = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
}).single('image');

/**
 * Helper to delete product image from Cloudinary
 */
export const deleteProductImage = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    let publicId;
    
    if (imageUrl.includes('cloudinary.com')) {
      const parts = imageUrl.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        const pathParts = parts.slice(uploadIndex + 2);
        publicId = pathParts.join('/').split('.')[0];
      }
    } else {
      publicId = imageUrl;
    }
    
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Product image deleted from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting product image from Cloudinary:', error);
  }
};

// Export cloudinary instance for direct use if needed
export { cloudinary };
