import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
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
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
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
    allergyWarnings: [{
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
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    index: true
  },
  user: {
    type: Number,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  items: [orderItemSchema],
  totalItems: {
    type: Number,
    min: 1
  },
  totalPrice: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  deliveryType: {
    type: String,
    enum: ['pickup', 'dine-in'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  customerNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Customer notes cannot exceed 1000 characters']
  },
  staffNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Staff notes cannot exceed 1000 characters']
  },
  estimatedReadyTime: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for formatted order number
orderSchema.virtual('formattedOrderNumber').get(function() {
  return `#${this.orderNumber}`;
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
  next();
});

// Update timestamps for status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'delivered') {
      this.completedAt = new Date();
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
