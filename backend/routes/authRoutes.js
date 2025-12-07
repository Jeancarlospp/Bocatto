import express from 'express';
import { adminLogin, adminLogout, verifySession } from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Admin Authentication Routes
 * Base path: /api/auth
 */

// Admin login - Public route
// POST /api/auth/admin/login
// Body: { email, password }
router.post('/admin/login', adminLogin);

// Admin logout - Protected route
// POST /api/auth/admin/logout
// Requires valid JWT token
router.post('/admin/logout', authenticateToken, adminLogout);

// Verify current session - Protected route
// GET /api/auth/admin/verify
// Requires valid JWT token
router.get('/admin/verify', authenticateToken, isAdmin, verifySession);

export default router;
