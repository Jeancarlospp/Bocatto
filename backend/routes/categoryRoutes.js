import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories,
  seedCategories,
  resetCategories
} from '../controllers/categoryController.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

/**
 * Protected routes - Admin only
 */
router.post('/', authenticateToken, isAdmin, createCategory);
router.post('/seed', authenticateToken, isAdmin, seedCategories);
router.post('/reset', authenticateToken, isAdmin, resetCategories);
router.put('/reorder', authenticateToken, isAdmin, reorderCategories);
router.put('/:id', authenticateToken, isAdmin, updateCategory);
router.delete('/:id', authenticateToken, isAdmin, deleteCategory);
router.patch('/:id/toggle', authenticateToken, isAdmin, toggleCategoryStatus);

export default router;
