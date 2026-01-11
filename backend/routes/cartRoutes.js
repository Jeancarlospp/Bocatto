import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { getCartAllergyWarnings } from '../controllers/customizationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Optional authentication - if token exists and valid, attach user info
// If token is invalid or expired, clear it and continue as anonymous
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by incremental ID
    const user = await User.findOne({ id: decoded.userId }).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    } else {
      // User not found or inactive, clear cookie
      res.clearCookie('token');
      req.user = null;
    }
  } catch (error) {
    // Token invalid or expired, clear it and continue as anonymous
    res.clearCookie('token');
    req.user = null;
  }
  
  next();
};

// All routes use optional authentication
router.post('/get', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.put('/update', optionalAuth, updateCartItem);
router.delete('/remove', optionalAuth, removeFromCart);
router.delete('/clear', optionalAuth, clearCart);

// GET allergy warnings for cart
router.get('/allergy-warnings', optionalAuth, getCartAllergyWarnings);

export default router;
