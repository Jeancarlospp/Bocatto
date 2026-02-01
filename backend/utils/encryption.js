import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Use JWT_SECRET as encryption key, or fallback
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'bocatto_default_key_2024';

// Create a consistent 32-byte key from the secret
const getKey = () => {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
};

/**
 * Encrypt a string (for storing 2FA secrets)
 * @param {string} text - The text to encrypt
 * @returns {string} - Encrypted text in format: iv:encrypted
 */
export const encrypt = (text) => {
  if (!text) return null;
  
  try {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt a string (for retrieving 2FA secrets)
 * @param {string} encryptedData - The encrypted data in format: iv:encrypted
 * @returns {string} - Decrypted text
 */
export const decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    const key = getKey();
    const parts = encryptedData.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Generate secure backup codes for 2FA recovery
 * @param {number} count - Number of backup codes to generate
 * @returns {Array<string>} - Array of backup codes
 */
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX
    const formattedCode = code.substring(0, 4) + '-' + code.substring(4, 8);
    codes.push(formattedCode);
  }
  
  return codes;
};

/**
 * Hash a backup code for secure storage
 * @param {string} code - The backup code to hash
 * @returns {string} - Hashed code
 */
export const hashBackupCode = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};