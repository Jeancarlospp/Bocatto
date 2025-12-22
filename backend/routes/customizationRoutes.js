import express from 'express';
import {
  getCustomizationOptions,
  calculateCustomPrice,
  getCartAllergyWarnings
} from '../controllers/customizationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Customization Routes
 * Base path: /api/products (for product-related)
 * Base path: /api/cart (for cart-related)
 */

// Optional authentication middleware
const optionalAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    return authenticateToken(req, res, next);
  }
  next();
};

// GET customization options for a product
// Public access
router.get('/:id/customization-options', getCustomizationOptions);

// POST calculate custom price with extras
// Public access
router.post('/:id/calculate-custom-price', calculateCustomPrice);

export default router;

// Export cart allergy warnings route separately to be used in cart routes
export { getCartAllergyWarnings };
