import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadProductImage } from '../middleware/upload.js';
import {
  getAllMenu,
  createProduct,
  getProductById,
  updateProduct
} from '../controllers/menuController.js';

const router = express.Router();

// Public routes
router.get('/', getAllMenu);
router.get('/:id', getProductById);

// Protected routes (admin only)
// uploadProductImage handles the image upload to Cloudinary
router.post('/', authenticateToken, isAdmin, uploadProductImage, createProduct);
router.put('/:id', authenticateToken, isAdmin, uploadProductImage, updateProduct);

export default router;
