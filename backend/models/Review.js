import mongoose from 'mongoose';

// Counter schema for auto-incrementing IDs (reuse existing pattern)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Review Model
 * Represents user reviews for products, orders, and reservations
 * Collection: 'reviews' in MongoDB
 */
const reviewSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    user: {
      type: Number,
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      enum: ['product', 'order', 'reservation'],
      required: [true, 'Review type is required']
    },
    targetId: {
      type: Number,
      required: [true, 'Target ID is required']
    },
    stars: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin response cannot exceed 500 characters']
    },
    respondedAt: {
      type: Date
    },
    respondedBy: {
      type: Number
    }
  },
  {
    timestamps: true,
    collection: 'reviews'
  }
);

// Auto-increment id before saving
reviewSchema.pre('save', async function(next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'reviewId' },
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
// Unique constraint: one review per user per entity
reviewSchema.index({ user: 1, type: 1, targetId: 1 }, { unique: true });
// For fetching reviews of a specific entity
reviewSchema.index({ type: 1, targetId: 1, isApproved: 1 });
// For admin panel: pending reviews
reviewSchema.index({ isApproved: 1, createdAt: -1 });
// For user's reviews
reviewSchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Static method to get average rating for an entity
reviewSchema.statics.getAverageRating = async function(type, targetId) {
  const result = await this.aggregate([
    {
      $match: {
        type: type,
        targetId: targetId,
        isApproved: true,
        isVisible: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$stars' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0
    ? {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews
      }
    : { averageRating: 0, totalReviews: 0 };
};

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
