import express from 'express';
import {
  getAllClients,
  updateClientStatus,
  getClientById
} from '../controllers/clientController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * ========================================
 * CLIENT MANAGEMENT ROUTES (Admin only)
 * Base path: /clients
 * ========================================
 */

// Get all clients with pagination/search/filters
// GET /clients?page=1&limit=10&search=john&status=active
router.get('/', authenticateToken, isAdmin, getAllClients);

// Get client by ID
// GET /clients/:id
router.get('/:id', authenticateToken, isAdmin, getClientById);

// Update client status (activate/deactivate)
// PUT /clients/:id/status
// Body: { isActive: boolean }
router.put('/:id/status', authenticateToken, isAdmin, updateClientStatus);

export default router;
