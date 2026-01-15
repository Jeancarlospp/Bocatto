import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadLocationImage } from '../middleware/upload.js';
import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  toggleLocationStatus
} from '../controllers/locationController.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/', getAllLocations);
router.get('/:id', getLocationById);

/**
 * Protected routes - Admin only
 */
router.post('/', authenticateToken, isAdmin, uploadLocationImage, createLocation);
router.put('/:id', authenticateToken, isAdmin, uploadLocationImage, updateLocation);
router.delete('/:id', authenticateToken, isAdmin, deleteLocation);
router.patch('/:id/toggle', authenticateToken, isAdmin, toggleLocationStatus);

export default router;
