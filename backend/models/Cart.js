import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  customizations: {
    removedIngredients: [{
      type: String,
      trim: true
    }],
    addedIngredients: [{
      type: String,
      trim: true
    }],
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Special instructions cannot exceed 500 characters']
    }
  },
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    index: true
  }
}, { 
  timestamps: true 
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  next();
});

// Index for cleanup of expired carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.index({ user: 1, status: 1 });

export default mongoose.model('Cart', cartSchema, 'carts');
