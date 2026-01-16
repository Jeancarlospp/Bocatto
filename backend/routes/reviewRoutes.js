import express from 'express';
import {
  createReview,
  getProductReviews,
  getOrderReviews,
  getReservationReviews,
  getMyReviews,
  getPendingReviews,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  respondToReview
} from '../controllers/reviewController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Review Routes
 * Base path: /reviews
 *
 * Public routes: GET approved reviews for products/orders/reservations
 * Protected routes: Create, update, delete own reviews
 * Admin routes: Approve, reject, respond to reviews
 */

// ==================== PUBLIC ROUTES ====================

// GET reviews for a product (only approved)
router.get('/product/:productId', getProductReviews);

// GET reviews for an order (only approved)
router.get('/order/:orderId', getOrderReviews);

// GET reviews for a reservation (only approved)
router.get('/reservation/:reservationId', getReservationReviews);

// GET review by ID
router.get('/:id', getReviewById);

// ==================== PROTECTED ROUTES (Authenticated Users) ====================

// CREATE new review
router.post('/', authenticateToken, createReview);

// GET my reviews
router.get('/my-reviews', authenticateToken, getMyReviews);

// UPDATE my review
router.put('/:id', authenticateToken, updateReview);

// DELETE my review
router.delete('/:id', authenticateToken, deleteReview);

// ==================== ADMIN ROUTES ====================

// GET pending reviews (admin only)
router.get('/pending', authenticateToken, isAdmin, getPendingReviews);

// APPROVE review (admin only)
router.patch('/:id/approve', authenticateToken, isAdmin, approveReview);

// REJECT review (admin only)
router.patch('/:id/reject', authenticateToken, isAdmin, rejectReview);

// RESPOND to review (admin only)
router.post('/:id/respond', authenticateToken, isAdmin, respondToReview);

export default router;
