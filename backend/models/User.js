import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Counter schema for auto-incrementing IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is required for users without Google OAuth
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For Google OAuth clients (future implementation)
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  // Admin-specific fields
  acceso: {
    type: String,
    enum: ['FULL_ACCESS', 'LIMITED_ACCESS'],
    default: function() {
      return this.role === 'admin' ? 'FULL_ACCESS' : null;
    }
  },
  adminAcceso: {
    type: String,
    enum: ['SUPER_ADMIN', 'MANAGER'],
    default: function() {
      return this.role === 'admin' ? 'SUPER_ADMIN' : null;
    }
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  },
  // Profile picture URL (from Google OAuth)
  profilePicture: {
    type: String,
    trim: true
  },
  // Two-Factor Authentication fields
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    // This will be encrypted before saving
  },
  twoFactorBackupCodes: [{
    code: {
      type: String,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date
    }
  }],
  allergies: [{
    allergen: {
      type: String,
      enum: ['gluten', 'lactosa', 'maní', 'mariscos', 'huevo', 'soya', 'frutos_secos', 'pescado', 'apio', 'mostaza', 'sésamo', 'sulfitos'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Auto-increment id before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'userId',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Hash password before saving (only for admin users with password)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

export default mongoose.model('User', userSchema, 'users');
