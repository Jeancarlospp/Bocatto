import mongoose from 'mongoose';

// Counter schema for auto-incrementing IDs (shared with other models)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Location Model
 * Represents restaurant branches/locations
 * Collection: 'locations' in MongoDB
 */
const locationSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      minlength: [3, 'Location name must be at least 3 characters'],
      maxlength: [100, 'Location name cannot exceed 100 characters']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [10, 'Address must be at least 10 characters'],
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [2, 'City must be at least 2 characters'],
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function(v) {
          // Validate phone format (basic validation for international formats)
          return /^[\d\s\-\+\(\)]+$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Email is optional
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    openingHours: {
      monday: { type: String, default: '09:00 - 22:00' },
      tuesday: { type: String, default: '09:00 - 22:00' },
      wednesday: { type: String, default: '09:00 - 22:00' },
      thursday: { type: String, default: '09:00 - 22:00' },
      friday: { type: String, default: '09:00 - 23:00' },
      saturday: { type: String, default: '09:00 - 23:00' },
      sunday: { type: String, default: '10:00 - 21:00' }
    },
    imageUrl: {
      type: String,
      default: null,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFlagship: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'locations' // Explicit collection name
  }
);

// Auto-increment id before saving
locationSchema.pre('save', async function(next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'locationId' },
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

// Indexes for performance
locationSchema.index({ city: 1, isActive: 1 });
locationSchema.index({ createdAt: -1 });
locationSchema.index({ coordinates: '2dsphere' }); // For geospatial queries

const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);

export default Location;
