import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify JWT token and authenticate user
 * Protects routes that require authentication
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Contact support.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Middleware to verify user is an admin
 * Must be used after authenticateToken middleware
 */
export const isAdmin = (req, res, next) => {
  try {
    // Check if user exists in request (from authenticateToken)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user role is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization.'
    });
  }
};

/**
 * Optional: Middleware to check specific admin access levels
 * Use this for fine-grained permissions (SUPER_ADMIN, EDITOR, etc.)
 */
export const checkAdminAccess = (requiredAccess) => {
  return (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required.'
        });
      }

      // Check if user has the required access level
      if (req.user.adminAcceso !== requiredAccess && req.user.adminAcceso !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. ${requiredAccess} access required.`
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error during access verification.'
      });
    }
  };
};
