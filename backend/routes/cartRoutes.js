import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Optional authentication - if token exists, attach user info
const optionalAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    return authenticateToken(req, res, next);
  }
  next();
};

// All routes use optional authentication
router.post('/get', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.put('/update', optionalAuth, updateCartItem);
router.delete('/remove', optionalAuth, removeFromCart);
router.delete('/clear', optionalAuth, clearCart);

export default router;
