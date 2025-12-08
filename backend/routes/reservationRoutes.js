import express from 'express';
import {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  confirmPayment,
  getAllReservations,
  adminCancelReservation,
  getAvailability
} from '../controllers/reservationController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * ========================================
 * PUBLIC ROUTES
 * ========================================
 */

/**
 * Check availability for an area on a specific date
 * GET /reservations/availability/:areaId?date=YYYY-MM-DD
 * Returns reserved time slots for the specified area and date
 */
router.get('/availability/:areaId', getAvailability);

/**
 * ========================================
 * PROTECTED ROUTES (CLIENT)
 * ========================================
 * All routes below require authentication
 */

/**
 * Create a new reservation
 * POST /reservations
 * Body: { areaId, startTime, endTime, guestCount, notes?, paymentMethodSimulated? }
 */
router.post('/', authenticateToken, createReservation);

/**
 * Get all reservations for the authenticated user
 * GET /reservations/my-reservations?status=pending&upcoming=true
 * Query params: status (pending/paid/cancelled/expired), upcoming (true/false)
 */
router.get('/my-reservations', authenticateToken, getMyReservations);

/**
 * Get a specific reservation by ID
 * GET /reservations/:id
 * User can only access their own reservations (admin can access all)
 */
router.get('/:id', authenticateToken, getReservationById);

/**
 * Cancel a reservation (client can only cancel their own pending reservations before start time)
 * DELETE /reservations/:id
 */
router.delete('/:id', authenticateToken, cancelReservation);

/**
 * Confirm payment for a reservation (simulated payment)
 * POST /reservations/:id/confirm-payment
 * Changes status from 'pending' to 'paid'
 */
router.post('/:id/confirm-payment', authenticateToken, confirmPayment);

/**
 * ========================================
 * ADMIN ROUTES
 * ========================================
 * All routes below require admin role
 */

/**
 * Get all reservations (admin only)
 * GET /reservations/all?status=paid&areaId=xxx&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Query params: status, areaId, startDate, endDate
 */
router.get('/admin/all', authenticateToken, isAdmin, getAllReservations);

/**
 * Cancel any reservation as admin (can cancel even after start time or if paid)
 * DELETE /reservations/:id/admin-cancel
 */
router.delete('/:id/admin-cancel', authenticateToken, isAdmin, adminCancelReservation);

export default router;
