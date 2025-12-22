import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getKitchenOrders
} from '../controllers/orderController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * ========================================
 * PUBLIC/SEMI-PUBLIC ROUTES
 * ========================================
 */

/**
 * Get active orders for kitchen display
 * GET /api/orders/kitchen/active
 * Returns orders with status: confirmed, preparing, ready
 * Can be public for kitchen display or protected based on requirements
 */
router.get('/kitchen/active', getKitchenOrders);

/**
 * ========================================
 * PROTECTED ROUTES (AUTHENTICATED USERS)
 * ========================================
 * All routes below require authentication
 */

/**
 * Create new order from cart (checkout)
 * POST /api/orders
 * Body: { deliveryType, paymentMethod, customerNotes? }
 * Creates order from active cart, validates stock, marks cart as completed
 */
router.post('/', authenticateToken, createOrder);

/**
 * Get all orders for authenticated user
 * GET /api/orders/my-orders?status=pending&limit=10
 * Query params: status, limit
 * Returns orders sorted by newest first
 */
router.get('/my-orders', authenticateToken, getMyOrders);

/**
 * Get specific order by ID
 * GET /api/orders/:id
 * User can view their own orders, admin can view any order
 */
router.get('/:id', authenticateToken, getOrderById);

/**
 * Cancel order
 * DELETE /api/orders/:id
 * Body: { reason? }
 * User can cancel their own orders (if not delivered)
 * Admin can cancel any order
 * Restores stock for all items
 */
router.delete('/:id', authenticateToken, cancelOrder);

/**
 * ========================================
 * ADMIN ONLY ROUTES
 * ========================================
 * All routes below require admin authentication
 */

/**
 * Get all orders (admin only)
 * GET /api/orders?status=preparing&deliveryType=pickup&limit=50&page=1
 * Query params: status, deliveryType, limit, page
 * Returns paginated orders with filters
 */
router.get('/', authenticateToken, isAdmin, getAllOrders);

/**
 * Update order status (admin only)
 * PUT /api/orders/:id/status
 * Body: { status, staffNotes? }
 * Valid statuses: pending, confirmed, preparing, ready, delivered, cancelled
 */
router.put('/:id/status', authenticateToken, isAdmin, updateOrderStatus);

export default router;
