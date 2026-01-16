import mongoose from 'mongoose';

// Counter schema for auto-incrementing IDs (reuse existing pattern)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * CouponUsage Model
 * Tracks the history of coupon usage for reporting and validation
 * Collection: 'couponusages' in MongoDB
 */
const couponUsageSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    coupon: {
      type: Number,
      required: [true, 'Coupon ID is required'],
      index: true
    },
    couponCode: {
      type: String,
      required: [true, 'Coupon code is required'],
      uppercase: true,
      trim: true
    },
    user: {
      type: Number,
      required: [true, 'User ID is required'],
      index: true
    },
    order: {
      type: String,
      required: [true, 'Order number is required'],
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    discountApplied: {
      type: Number,
      required: [true, 'Discount applied is required'],
      min: 0
    },
    orderSubtotal: {
      type: Number,
      required: [true, 'Order subtotal is required'],
      min: 0
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'couponusages'
  }
);

// Auto-increment id before saving
couponUsageSchema.pre('save', async function(next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'couponUsageId' },
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

// Indexes for optimized queries
// For checking user's usage of a specific coupon
couponUsageSchema.index({ coupon: 1, user: 1 });
// For user's usage history
couponUsageSchema.index({ user: 1, usedAt: -1 });
// For coupon usage reports
couponUsageSchema.index({ coupon: 1, usedAt: -1 });
// For date-based reports
couponUsageSchema.index({ usedAt: -1 });

// Static method to count user's usage of a specific coupon
couponUsageSchema.statics.getUserUsageCount = async function(couponId, userId) {
  return await this.countDocuments({
    coupon: couponId,
    user: userId
  });
};

// Static method to get usage statistics for a coupon
couponUsageSchema.statics.getCouponStats = async function(couponId) {
  const result = await this.aggregate([
    {
      $match: { coupon: couponId }
    },
    {
      $group: {
        _id: null,
        totalUses: { $sum: 1 },
        totalDiscountGiven: { $sum: '$discountApplied' },
        averageDiscount: { $avg: '$discountApplied' },
        totalOrderValue: { $sum: '$orderSubtotal' }
      }
    }
  ]);

  return result.length > 0
    ? {
        totalUses: result[0].totalUses,
        totalDiscountGiven: parseFloat(result[0].totalDiscountGiven.toFixed(2)),
        averageDiscount: parseFloat(result[0].averageDiscount.toFixed(2)),
        totalOrderValue: parseFloat(result[0].totalOrderValue.toFixed(2))
      }
    : {
        totalUses: 0,
        totalDiscountGiven: 0,
        averageDiscount: 0,
        totalOrderValue: 0
      };
};

const CouponUsage = mongoose.models.CouponUsage || mongoose.model('CouponUsage', couponUsageSchema);

export default CouponUsage;
