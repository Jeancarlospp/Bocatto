import express from 'express';
import {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  deleteOffer
} from '../controllers/offerController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadOfferImage } from '../middleware/upload.js';

const router = express.Router();

/**
 * Offer Routes
 * Base path: /offers
 * 
 * Public routes: GET /offers (with filters for frontend)
 * Protected routes: All create/update/delete operations require admin authentication
 */

// GET all offers
// Public access (can filter active, featured, validToday)
// Examples: /offers?active=true&validToday=true
router.get('/', getAllOffers);

// GET offer by ID
// Public access (for frontend display)
router.get('/:id', getOfferById);

// CREATE new offer
// Protected: Admin only
// Supports multipart/form-data for image upload
router.post('/', authenticateToken, isAdmin, uploadOfferImage, createOffer);

// UPDATE offer
// Protected: Admin only
// Supports multipart/form-data for image upload
router.put('/:id', authenticateToken, isAdmin, uploadOfferImage, updateOffer);

// DELETE offer
// Protected: Admin only
router.delete('/:id', authenticateToken, isAdmin, deleteOffer);

export default router;