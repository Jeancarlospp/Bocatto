import express from 'express';
import { 
  adminLogin, 
  adminLogout, 
  verifySession,
  clientRegister,
  clientLogin,
  clientLogout,
  verifyClientSession,
  getUserById
} from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * ========================================
 * ADMIN AUTHENTICATION ROUTES
 * Base path: /api/auth
 * ========================================
 */

// Admin login - Public route
// POST /api/auth/admin/login
// Body: { email, password }
router.post('/admin/login', adminLogin);

// Admin logout - Protected route
// POST /api/auth/admin/logout
// Requires valid JWT token
router.post('/admin/logout', authenticateToken, adminLogout);

// Verify admin session - Protected route
// GET /api/auth/admin/verify
// Requires valid JWT token + admin role
router.get('/admin/verify', authenticateToken, isAdmin, verifySession);

/**
 * ========================================
 * CLIENT AUTHENTICATION ROUTES
 * Base path: /api/auth
 * ========================================
 */

// Client registration - Public route
// POST /api/auth/client/register
// Body: { firstName, lastName, email, password, phone?, address? }
router.post('/client/register', clientRegister);

// Client login - Public route
// POST /api/auth/client/login
// Body: { email, password }
router.post('/client/login', clientLogin);

// Client logout - Protected route
// POST /api/auth/client/logout
// Requires valid JWT token
router.post('/client/logout', authenticateToken, clientLogout);

// Verify client session - Protected route
// GET /api/auth/client/verify
// Requires valid JWT token + client role
router.get('/client/verify', authenticateToken, verifyClientSession);

/**
 * ========================================
 * USER ROUTES
 * Base path: /api/auth
 * ========================================
 */

// Get user by ID (incremental id or MongoDB _id)
// GET /api/auth/users/:id
// Protected route - requires authentication
router.get('/users/:id', authenticateToken, getUserById);

export default router;
