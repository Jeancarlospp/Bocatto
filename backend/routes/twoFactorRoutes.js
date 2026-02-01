import express from 'express';
import { 
  setup2FA, 
  verify2FA, 
  disable2FA, 
  validate2FA, 
  get2FAStatus 
} from '../controllers/twoFactorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * ========================================
 * TWO-FACTOR AUTHENTICATION ROUTES
 * Base path: /api/auth/2fa
 * ========================================
 */

/**
 * Get 2FA status for current user
 * GET /api/auth/2fa/status
 * Requires authentication
 */
router.get('/status', authenticateToken, get2FAStatus);

/**
 * Setup 2FA - Generate secret and QR code
 * POST /api/auth/2fa/setup
 * Requires authentication
 */
router.post('/setup', authenticateToken, setup2FA);

/**
 * Verify 2FA setup and enable it
 * POST /api/auth/2fa/verify
 * Body: { token }
 * Requires authentication
 */
router.post('/verify', authenticateToken, verify2FA);

/**
 * Disable 2FA
 * POST /api/auth/2fa/disable
 * Body: { token } or { backupCode }
 * Requires authentication
 */
router.post('/disable', authenticateToken, disable2FA);

/**
 * Validate 2FA during login process
 * POST /api/auth/2fa/validate
 * Body: { token, tempUserId } or { backupCode, tempUserId }
 * Public route - used during login flow
 */
router.post('/validate', validate2FA);

export default router;