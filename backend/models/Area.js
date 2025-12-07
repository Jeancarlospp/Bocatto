import mongoose from 'mongoose';

/**
 * Area (Ambiente) Model
 * Represents dining areas/environments available for reservations
 * Collection: 'areas' in MongoDB
 */
const areaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Area name is required'],
      trim: true,
      minlength: [3, 'Area name must be at least 3 characters'],
      maxlength: [100, 'Area name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    minCapacity: {
      type: Number,
      required: [true, 'Minimum capacity is required'],
      min: [1, 'Minimum capacity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Capacity must be an integer'
      }
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [1, 'Maximum capacity must be at least 1'],
      validate: [
        {
          validator: Number.isInteger,
          message: 'Capacity must be an integer'
        },
        {
          validator: function(value) {
            return value >= this.minCapacity;
          },
          message: 'Maximum capacity must be greater than or equal to minimum capacity'
        }
      ]
    },
    features: {
      type: [String],
      required: [true, 'At least one feature is required'],
      validate: [
        {
          validator: function(arr) {
            return arr && arr.length >= 1 && arr.length <= 4;
          },
          message: 'Must have between 1 and 4 features'
        },
        {
          validator: function(arr) {
            return arr.every(feature => feature.trim().length >= 3 && feature.trim().length <= 50);
          },
          message: 'Each feature must be between 3 and 50 characters'
        }
      ]
    },
    imageUrl: {
      type: String,
      default: null,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'areas' // Explicit collection name
  }
);

// Index for efficient queries
areaSchema.index({ isActive: 1 });
areaSchema.index({ name: 1 });

// Virtual for capacity range display
areaSchema.virtual('capacityRange').get(function() {
  return `${this.minCapacity}-${this.maxCapacity}`;
});

// Ensure virtuals are included in JSON
areaSchema.set('toJSON', { virtuals: true });
areaSchema.set('toObject', { virtuals: true });

const Area = mongoose.model('Area', areaSchema);

export default Area;
