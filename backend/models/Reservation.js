import mongoose from 'mongoose';

/**
 * Reservation Model
 * Represents table/area reservations made by clients
 * Collection: 'reservacions' in MongoDB (existing collection name)
 */
const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: [true, 'Area is required']
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      validate: {
        validator: function(value) {
          // Start time must be in the future
          return value > new Date();
        },
        message: 'Start time must be in the future'
      }
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function(value) {
          // End time must be after start time
          return value > this.startTime;
        },
        message: 'End time must be after start time'
      }
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [5, 'Minimum price is 5 USD']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'cancelled', 'expired'],
        message: 'Status must be: pending, paid, cancelled, or expired'
      },
      default: 'pending'
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'At least 1 guest is required'],
      validate: {
        validator: Number.isInteger,
        message: 'Guest count must be an integer'
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    paymentMethodSimulated: {
      type: String,
      enum: ['cash', 'card', 'transfer'],
      default: 'card'
    }
  },
  {
    timestamps: true,
    collection: 'reservacions' // Use existing collection name
  }
);

/**
 * Indexes for performance
 * - Query reservations by user
 * - Query reservations by area and status
 * - Query reservations by date range
 */
reservationSchema.index({ user: 1, createdAt: -1 });
reservationSchema.index({ area: 1, status: 1 });
reservationSchema.index({ startTime: 1, endTime: 1 });
reservationSchema.index({ status: 1, endTime: 1 }); // For expiration queries

/**
 * Virtual field: duration in hours
 */
reservationSchema.virtual('durationHours').get(function() {
  const diffMs = this.endTime - this.startTime;
  return diffMs / (1000 * 60 * 60); // Convert to hours
});

/**
 * Method: Check if reservation is expired
 */
reservationSchema.methods.isExpired = function() {
  return new Date() > this.endTime && this.status === 'pending';
};

/**
 * Static method: Find overlapping reservations
 * @param {ObjectId} areaId - Area to check
 * @param {Date} startTime - Requested start time
 * @param {Date} endTime - Requested end time
 * @param {ObjectId} excludeReservationId - Optional: exclude this reservation (for updates)
 * @returns {Promise<Array>} Array of overlapping reservations
 */
reservationSchema.statics.findOverlapping = async function(areaId, startTime, endTime, excludeReservationId = null) {
  const query = {
    area: areaId,
    status: { $in: ['pending', 'paid'] }, // Only active reservations
    // Overlap condition: R.startTime < requestedEndTime AND R.endTime > requestedStartTime
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };

  // Exclude current reservation when updating
  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  console.log('🔎 Overlap query:', JSON.stringify(query, null, 2));
  
  const results = await this.find(query);
  
  console.log('🔎 Query returned:', results.length, 'reservations');
  
  return results;
};

/**
 * Static method: Calculate total price based on duration
 * Base price: $5 USD for first hour
 * Additional: $2.50 USD per extra hour (or fraction)
 * 
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {Number} Total price in USD
 */
reservationSchema.statics.calculatePrice = function(startTime, endTime) {
  const diffMs = endTime - startTime;
  const hours = diffMs / (1000 * 60 * 60);
  
  if (hours <= 0) {
    throw new Error('Invalid time range');
  }

  // Base price for first hour
  const BASE_PRICE = 5;
  const ADDITIONAL_HOUR_PRICE = 2.50;

  if (hours <= 1) {
    return BASE_PRICE;
  }

  // Calculate additional hours (round up fractions)
  const additionalHours = Math.ceil(hours - 1);
  const totalPrice = BASE_PRICE + (additionalHours * ADDITIONAL_HOUR_PRICE);

  return parseFloat(totalPrice.toFixed(2));
};

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
