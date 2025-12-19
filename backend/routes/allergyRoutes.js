import express from 'express';
import {
  saveUserAllergies,
  getUserAllergies,
  getSafeProducts,
  checkProduct
} from '../controllers/allergyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Allergy Routes
 * Base path: /api/users
 * All routes require authentication
 */

// POST save/update user allergies
// Protected: Client authentication required
router.post('/me/allergies', authenticateToken, saveUserAllergies);

// GET user allergies
// Protected: Client authentication required
router.get('/me/allergies', authenticateToken, getUserAllergies);

// GET safe products for user based on allergies
// Protected: Client authentication required
router.get('/me/safe-products', authenticateToken, getSafeProducts);

// POST check if specific product is safe for user
// Protected: Client authentication required
router.post('/me/allergies/check-product/:id', authenticateToken, checkProduct);

export default router;
