import mongoose from 'mongoose';

/**
 * Offer Model
 * Represents special offers/combos available in the restaurant
 * Collection: 'offers' in MongoDB
 */
const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Offer name is required'],
      trim: true,
      minlength: [3, 'Offer name must be at least 3 characters'],
      maxlength: [100, 'Offer name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    items: [{
      name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
      },
      quantity: {
        type: Number,
        required: [true, 'Item quantity is required'],
        min: [1, 'Quantity must be at least 1']
      }
    }],
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Original price must be positive']
    },
    offerPrice: {
      type: Number,
      required: [true, 'Offer price is required'],
      min: [0, 'Offer price must be positive']
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    validDays: [{
      type: String,
      enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    }],
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(value) {
          // Skip validation if startDate is not available (during partial updates)
          if (!this.startDate) return true;
          
          // Convert dates to same timezone for comparison
          const startDateOnly = new Date(this.startDate.toDateString());
          const endDateOnly = new Date(value.toDateString());
          return endDateOnly >= startDateOnly;
        },
        message: 'End date must be after or equal to start date'
      }
    },

    badge: {
      text: {
        type: String,
        default: 'Oferta'
      },
      color: {
        type: String,
        enum: ['red', 'blue', 'green', 'orange', 'purple'],
        default: 'red'
      },
      icon: {
        type: String,
        default: '🔥'
      }
    },
    imageUrl: {
      type: String,
      default: null
    },
    featured: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    },
    usageCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Calculate discount percentage before saving
offerSchema.pre('save', function(next) {
  if (this.originalPrice && this.offerPrice) {
    this.discount = Math.round(((this.originalPrice - this.offerPrice) / this.originalPrice) * 100);
  }
  next();
});

// Virtual field to check if offer is currently valid
offerSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  const today = now.toLocaleDateString('es-ES', { weekday: 'long' });
  
  return this.active && 
         now >= this.startDate && 
         now <= this.endDate &&
         this.validDays.includes(today);
});

export default mongoose.model('Offer', offerSchema);