import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  validateCoupon,
  getCouponUsage,
  getCouponUsageById
} from '../controllers/couponController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Coupon Routes
 * Base path: /coupons
 *
 * Protected routes: Validate coupon (authenticated users)
 * Admin routes: All CRUD operations and usage reports
 */

// ==================== PROTECTED ROUTES (Authenticated Users) ====================

// VALIDATE coupon code
// POST /coupons/validate
// Body: { code, cartTotal }
router.post('/validate', authenticateToken, validateCoupon);

// ==================== ADMIN ROUTES ====================

// GET all coupons
router.get('/', authenticateToken, isAdmin, getAllCoupons);

// GET coupon usage history (all coupons)
// GET /coupons/usage?startDate=2024-01-01&endDate=2024-12-31&limit=100
router.get('/usage', authenticateToken, isAdmin, getCouponUsage);

// GET coupon by ID
router.get('/:id', authenticateToken, isAdmin, getCouponById);

// GET usage history for specific coupon
router.get('/:id/usage', authenticateToken, isAdmin, getCouponUsageById);

// CREATE new coupon
router.post('/', authenticateToken, isAdmin, createCoupon);

// UPDATE coupon
router.put('/:id', authenticateToken, isAdmin, updateCoupon);

// TOGGLE coupon active status
router.patch('/:id/toggle', authenticateToken, isAdmin, toggleCoupon);

// DELETE coupon
router.delete('/:id', authenticateToken, isAdmin, deleteCoupon);

export default router;
