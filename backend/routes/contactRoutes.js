import express from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactStatus,
  deleteContactMessage,
  getContactStats
} from '../controllers/contactController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Contact Routes
 * 
 * Public routes:
 * - POST /api/contact - Submit contact form
 * 
 * Admin routes:
 * - GET /api/contact - Get all messages
 * - GET /api/contact/stats - Get statistics
 * - GET /api/contact/:id - Get single message
 * - PATCH /api/contact/:id/status - Update message status
 * - DELETE /api/contact/:id - Delete message
 */

// Public route - anyone can submit contact form
router.post('/', createContactMessage);

// Admin routes - protected
router.get('/stats', authenticateToken, isAdmin, getContactStats);
router.get('/', authenticateToken, isAdmin, getAllContactMessages);
router.get('/:id', authenticateToken, isAdmin, getContactMessageById);
router.patch('/:id/status', authenticateToken, isAdmin, updateContactStatus);
router.delete('/:id', authenticateToken, isAdmin, deleteContactMessage);

export default router;
