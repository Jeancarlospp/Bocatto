import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadProductImage } from '../middleware/upload.js';
import {
  getAllMenu,
  createProduct,
  getProductById,
  updateProduct,
  toggleProductAvailability,
  deleteProduct
} from '../controllers/menuController.js';

const router = express.Router();

// Public routes
router.get('/', getAllMenu);

// Protected routes (admin only)
// IMPORTANT: Specific routes must come BEFORE parameterized routes
// uploadProductImage handles the image upload to Cloudinary
router.post('/', authenticateToken, isAdmin, uploadProductImage, createProduct);
router.patch('/:id/toggle', authenticateToken, isAdmin, toggleProductAvailability);
router.put('/:id', authenticateToken, isAdmin, uploadProductImage, updateProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

// Public route with :id parameter (must be last to avoid conflicts)
router.get('/:id', getProductById);

export default router;
