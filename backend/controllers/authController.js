import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Menu from '../models/Menu.js';
import Reservation from '../models/Reservation.js';
import Order from '../models/Order.js';

/**
 * Admin login controller
 * POST /api/auth/admin/login
 * Body: { email, password }
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin credentials required.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h' // Token expires in 24 hours
      }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
          id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        adminAcceso: user.adminAcceso
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
};

/**
 * Admin logout controller
 * POST /api/auth/admin/logout
 */
export const adminLogout = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    // Prevent caching to avoid back button issues
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });

  } catch (error) {
    console.error('Admin logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

/**
 * Verify current session
 * GET /api/auth/admin/verify
 * Requires authenticateToken middleware
 */
export const verifySession = async (req, res) => {
  try {
    // User is already attached to req by authenticateToken middleware
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        adminAcceso: req.user.adminAcceso
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during session verification.'
    });
  }
};

/**
 * ========================================
 * CLIENT AUTHENTICATION CONTROLLERS
 * ========================================
 */

/**
 * Client registration controller
 * POST /api/auth/client/register
 * Body: { firstName, lastName, email, password, phone?, address? }
 */
export const clientRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellido, correo electrónico y contraseña son requeridos.'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres.'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este correo electrónico ya está registrado.'
      });
    }

    // Create new client user
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'client',
      phone: phone || undefined,
      address: address || undefined,
      isActive: true,
      loyaltyPoints: 0
    });

    // Update last login
    newUser.lastLogin = new Date();
    await newUser.save();

    // Generate JWT token (auto-login after registration)
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    // Set HTTP-only cookie (same config as admin)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Registro exitoso.',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        loyaltyPoints: newUser.loyaltyPoints
      }
    });

  } catch (error) {
    console.error('Client registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor durante el registro. Intenta nuevamente.'
    });
  }
};

/**
 * Client login controller
 * POST /api/auth/client/login
 * Body: { email, password }
 */
export const clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Correo electrónico y contraseña son requeridos.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Correo electrónico o contraseña incorrectos.'
      });
    }

    // Check if user is client
    if (user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Use el login de administrador.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta inactiva. Contacta con soporte.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Correo electrónico o contraseña incorrectos.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token (same as admin)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    // Set HTTP-only cookie (same config as admin)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints
      }
    });

  } catch (error) {
    console.error('Client login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor durante el inicio de sesión. Intenta nuevamente.'
    });
  }
};

/**
 * Client logout controller
 * POST /api/auth/client/logout
 */
export const clientLogout = async (req, res) => {
  try {
    // Clear the auth cookie (same as admin)
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    // Prevent caching to avoid back button issues
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente.'
    });

  } catch (error) {
    console.error('Client logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor al cerrar sesión.'
    });
  }
};

/**
 * Verify client session
 * GET /api/auth/client/verify
 * Requires authenticateToken middleware
 */
export const verifyClientSession = async (req, res) => {
  try {
    // User is already attached to req by authenticateToken middleware
    // Verify it's a client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        loyaltyPoints: req.user.loyaltyPoints,
        phone: req.user.phone,
        address: req.user.address
      }
    });

  } catch (error) {
    console.error('Client session verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar la sesión.'
    });
  }
};

/**
 * Get user by ID (incremental id or MongoDB _id)
 * GET /api/auth/users/:id
 * Protected route - requires authentication
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let user;

    // Try to find by incremental id first
    if (!isNaN(id)) {
      user = await User.findOne({ id: parseInt(id) }).select('-password');
    }
    
    // If not found, try by MongoDB _id
    if (!user) {
      user = await User.findById(id).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
        loyaltyPoints: user.loyaltyPoints,
        lastLogin: user.lastLogin,
        acceso: user.acceso,
        adminAcceso: user.adminAcceso,
        allergies: user.allergies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario.'
    });
  }
};

/**
 * Get dashboard statistics
 * GET /api/auth/admin/dashboard-stats
 * Protected: Admin only
 */
export const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard statistics...');

    // Get total products count
    const totalProducts = await Menu.countDocuments();
    console.log('📦 Total products:', totalProducts);

    // Get total reservations count (all statuses)
    const totalReservations = await Reservation.countDocuments();
    console.log('📅 Total reservations:', totalReservations);

    // Get total clients count (users with role 'client')
    const totalClients = await User.countDocuments({ role: 'client' });
    console.log('👥 Total clients:', totalClients);

    // Get today's orders count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ordersToday = await Order.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    console.log('🛒 Orders today:', ordersToday);

    // Additional useful stats
    const activeReservations = await Reservation.countDocuments({
      status: { $in: ['pending', 'paid'] },
      startTime: { $gte: new Date() }
    });

    const revenueToday = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    console.log('✅ Dashboard stats calculated successfully');

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalReservations,
        totalClients,
        ordersToday,
        activeReservations,
        revenueToday: revenueToday.length > 0 ? revenueToday[0].total : 0
      }
    });

  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard'
    });
  }
};

/**
 * ========================================
 * GOOGLE OAUTH CONTROLLERS
 * ========================================
 */

/**
 * Google OAuth callback handler
 * Called after successful Google authentication
 * GET /api/auth/google/callback
 */
export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      console.error('Google OAuth: No user returned from strategy');
      return res.redirect(`${process.env.FRONTEND_URL}?error=google_auth_failed`);
    }

    // Check if user is active
    if (!user.isActive) {
      console.error('Google OAuth: User account is inactive');
      return res.redirect(`${process.env.FRONTEND_URL}?error=account_inactive`);
    }

    // Generate JWT token for the user
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log(`✅ Google OAuth successful for user: ${user.email}`);

    // Redirect to frontend with success indicator
    return res.redirect(`${process.env.FRONTEND_URL}?google_auth=success`);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}?error=google_auth_error`);
  }
};

/**
 * Handle Google OAuth authentication failure
 * GET /api/auth/google/failure
 */
export const googleAuthFailure = (req, res) => {
  console.error('Google OAuth authentication failed');
  return res.redirect(`${process.env.FRONTEND_URL}?error=google_auth_failed`);
};

