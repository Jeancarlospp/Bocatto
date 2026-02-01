import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import { encrypt, decrypt, generateBackupCodes, hashBackupCode } from '../utils/encryption.js';

/**
 * ========================================
 * TWO-FACTOR AUTHENTICATION CONTROLLERS
 * ========================================
 */

/**
 * Generate 2FA setup (secret + QR code)
 * POST /api/auth/2fa/setup
 * Requires authentication
 */
export const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA ya está habilitado. Desactívalo primero si quieres reconfigurarlo.'
      });
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `${user.firstName} ${user.lastName}`,
      service: 'Bocatto Restaurant',
      length: 32
    });

    // Generate QR code URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store the secret temporarily (not enabled yet)
    const encryptedSecret = encrypt(secret.base32);
    user.twoFactorSecret = encryptedSecret;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        secret: secret.base32, // Show to user for manual entry
        qrCode: qrCodeUrl,
        backupCodes: null // Will be generated when verified
      }
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al configurar 2FA.'
    });
  }
};

/**
 * Verify and enable 2FA
 * POST /api/auth/2fa/verify
 * Body: { token }
 */
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token || token.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Token de 6 dígitos requerido.'
      });
    }

    const user = await User.findOne({ id: userId });

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Configuración de 2FA no encontrada. Inicia el setup primero.'
      });
    }

    // Decrypt the secret
    const secret = decrypt(user.twoFactorSecret);

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar configuración 2FA.'
      });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps before/after for clock skew
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido. Verifica que sea correcto y no haya expirado.'
      });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(code => ({
      code: hashBackupCode(code),
      used: false
    }));

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedBackupCodes;
    await user.save();

    return res.status(200).json({
      success: true,
      message: '2FA habilitado exitosamente.',
      data: {
        backupCodes: backupCodes // Show plain codes only once
      }
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar 2FA.'
    });
  }
};

/**
 * Disable 2FA
 * POST /api/auth/2fa/disable
 * Body: { token } or { backupCode }
 */
export const disable2FA = async (req, res) => {
  try {
    const { token, backupCode } = req.body;
    const userId = req.user.id;

    const user = await User.findOne({ id: userId });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA no está habilitado.'
      });
    }

    let verified = false;

    // Verify with TOTP token
    if (token && token.length === 6) {
      const secret = decrypt(user.twoFactorSecret);
      if (secret) {
        verified = speakeasy.totp.verify({
          secret: secret,
          encoding: 'base32',
          token: token,
          window: 2
        });
      }
    }

    // Or verify with backup code
    if (!verified && backupCode) {
      const hashedCode = hashBackupCode(backupCode.replace('-', '').toUpperCase());
      const matchingCode = user.twoFactorBackupCodes.find(
        code => code.code === hashedCode && !code.used
      );
      
      if (matchingCode) {
        verified = true;
        // Mark backup code as used
        matchingCode.used = true;
        matchingCode.usedAt = new Date();
      }
    }

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o código de respaldo ya utilizado.'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: '2FA deshabilitado exitosamente.'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al deshabilitar 2FA.'
    });
  }
};

/**
 * Validate 2FA token during login
 * POST /api/auth/2fa/validate
 * Body: { token } or { backupCode }
 * Note: This is called from login flow, user is not fully authenticated yet
 */
export const validate2FA = async (req, res) => {
  try {
    const { token, backupCode, tempUserId } = req.body;

    if (!tempUserId) {
      return res.status(400).json({
        success: false,
        message: 'Sesión inválida.'
      });
    }

    const user = await User.findOne({ id: tempUserId });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Configuración 2FA inválida.'
      });
    }

    let verified = false;

    // Verify with TOTP token
    if (token && token.length === 6) {
      const secret = decrypt(user.twoFactorSecret);
      if (secret) {
        verified = speakeasy.totp.verify({
          secret: secret,
          encoding: 'base32',
          token: token,
          window: 2
        });
      }
    }

    // Or verify with backup code
    if (!verified && backupCode) {
      const hashedCode = hashBackupCode(backupCode.replace('-', '').toUpperCase());
      const matchingCode = user.twoFactorBackupCodes.find(
        code => code.code === hashedCode && !code.used
      );
      
      if (matchingCode) {
        verified = true;
        // Mark backup code as used
        matchingCode.used = true;
        matchingCode.usedAt = new Date();
        await user.save();
      }
    }

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Código 2FA inválido.'
      });
    }

    return res.status(200).json({
      success: true,
      message: '2FA verificado exitosamente.',
      data: {
        userId: user.id
      }
    });

  } catch (error) {
    console.error('2FA validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al validar 2FA.'
    });
  }
};

/**
 * Get 2FA status
 * GET /api/auth/2fa/status
 */
export const get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ id: userId }).select('twoFactorEnabled twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    // Count unused backup codes
    const backupCodesRemaining = user.twoFactorBackupCodes 
      ? user.twoFactorBackupCodes.filter(code => !code.used).length 
      : 0;

    return res.status(200).json({
      success: true,
      twoFactorStatus: {
        enabled: user.twoFactorEnabled || false,
        backupCodesRemaining: backupCodesRemaining,
        setupDate: user.twoFactorEnabled ? user.updatedAt : null
      }
    });

  } catch (error) {
    console.error('2FA status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estado de 2FA.'
    });
  }
};