import mongoose from 'mongoose';

// Counter schema for auto-incrementing IDs (reuse existing pattern)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Coupon Model
 * Represents discount coupons/promo codes for orders
 * Collection: 'coupons' in MongoDB
 */
const couponSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Code must be at least 3 characters'],
      maxlength: [20, 'Code cannot exceed 20 characters'],
      match: [/^[A-Z0-9]+$/, 'Code can only contain letters and numbers']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required']
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
      validate: {
        validator: function(value) {
          // If percentage, max 100%
          if (this.discountType === 'percentage' && value > 100) {
            return false;
          }
          return true;
        },
        message: 'Percentage discount cannot exceed 100%'
      }
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase cannot be negative']
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cannot be negative']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(value) {
          if (!this.startDate) return true;
          return value >= this.startDate;
        },
        message: 'End date must be after or equal to start date'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1']
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative']
    },
    usagePerUser: {
      type: Number,
      default: 1,
      min: [1, 'Usage per user must be at least 1']
    },
    applicableTo: {
      type: String,
      enum: ['all', 'products', 'categories'],
      default: 'all'
    },
    applicableIds: [{
      type: Number
    }],
    createdBy: {
      type: Number,
      required: [true, 'Creator ID is required']
    }
  },
  {
    timestamps: true,
    collection: 'coupons'
  }
);

// Auto-increment id before saving
couponSchema.pre('save', async function(next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'couponId' },
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

// Convert code to uppercase before saving
couponSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

// Indexes for optimized queries
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ createdBy: 1 });

// Virtual to check if coupon is currently valid (date-wise)
couponSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive &&
         now >= this.startDate &&
         now <= this.endDate &&
         (this.usageLimit === null || this.usageCount < this.usageLimit);
});

// Static method to find coupon by code
couponSchema.statics.findByCode = async function(code) {
  return await this.findOne({
    code: code.toUpperCase(),
    isActive: true
  });
};

// Method to calculate discount for a given amount
couponSchema.methods.calculateDiscount = function(subtotal) {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
    // Apply max discount cap if set
    if (this.maxDiscount !== null && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    // Fixed discount
    discount = this.discountValue;
    // Don't allow discount greater than subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }
  }

  return parseFloat(discount.toFixed(2));
};

// Method to check if coupon can be used
couponSchema.methods.canBeUsed = function(subtotal) {
  const now = new Date();

  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'Este cupón no está activo' };
  }

  // Check dates
  if (now < this.startDate) {
    return { valid: false, message: 'Este cupón aún no está vigente' };
  }

  if (now > this.endDate) {
    return { valid: false, message: 'Este cupón ha expirado' };
  }

  // Check usage limit
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'Este cupón ha alcanzado su límite de uso' };
  }

  // Check minimum purchase
  if (subtotal < this.minPurchase) {
    return {
      valid: false,
      message: `El pedido mínimo para este cupón es $${this.minPurchase.toFixed(2)}`
    };
  }

  return { valid: true, message: 'Cupón válido' };
};

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export default Coupon;
