import express from 'express';
import {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
  toggleAreaStatus
} from '../controllers/areaController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadAreaImage } from '../middleware/upload.js';

const router = express.Router();

/**
 * Area Routes
 * Base path: /areas
 * 
 * Public routes: GET /areas (with ?activeOnly=true for frontend)
 * Protected routes: All create/update/delete operations require admin authentication
 */

// GET all areas
// Public access (can filter active only with ?activeOnly=true)
// Admin gets all areas (active and inactive)
router.get('/', getAllAreas);

// GET area by ID
// Public access (for future reservation page)
router.get('/:id', getAreaById);

// CREATE new area
// Protected: Admin only
// Supports multipart/form-data for image upload
router.post('/', authenticateToken, isAdmin, uploadAreaImage, createArea);

// UPDATE area
// Protected: Admin only
// Supports multipart/form-data for image upload
router.put('/:id', authenticateToken, isAdmin, uploadAreaImage, updateArea);

// DELETE area (soft delete)
// Protected: Admin only
router.delete('/:id', authenticateToken, isAdmin, deleteArea);

// TOGGLE area active status
// Protected: Admin only
router.patch('/:id/toggle-status', authenticateToken, isAdmin, toggleAreaStatus);

export default router;
