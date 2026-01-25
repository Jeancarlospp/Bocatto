import express from 'express';
import passport from 'passport';
import { 
  adminLogin, 
  adminLogout, 
  verifySession,
  clientRegister,
  clientLogin,
  clientLogout,
  verifyClientSession,
  getUserById,
  getDashboardStats,
  googleAuthCallback,
  googleAuthFailure
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

// Get dashboard statistics - Protected route (Admin only)
// GET /api/auth/admin/dashboard-stats
// Requires valid JWT token + admin role
router.get('/admin/dashboard-stats', authenticateToken, isAdmin, getDashboardStats);

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

/**
 * ========================================
 * GOOGLE OAUTH ROUTES (Clients Only)
 * Base path: /api/auth
 * ========================================
 */

// Initiate Google OAuth login flow
// GET /api/auth/google
// Redirects to Google's OAuth consent screen
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // Always show account selector
  })
);

// Google OAuth callback
// GET /api/auth/google/callback
// Google redirects here after user authorizes
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure',
    session: false // We use JWT, not sessions for auth
  }),
  googleAuthCallback
);

// Google OAuth failure handler
// GET /api/auth/google/failure
router.get('/google/failure', googleAuthFailure);

export default router;
