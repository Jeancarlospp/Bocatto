import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  img: {
    type: String,
    trim: true
  },
  available: {
    type: Boolean,
    default: true
  },
  currentStock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  creationDate: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Auto-generate productId before saving
productSchema.pre('save', async function(next) {
  if (this.isNew && !this.productId) {
    try {
      const Product = this.constructor;
      const maxProduct = await Product.findOne().sort({ productId: -1 }).lean();
      const totalProducts = await Product.countDocuments();
      this.productId = Math.max(maxProduct?.productId || 0, totalProducts) + 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Indexes for optimized searches
productSchema.index({ category: 1, available: 1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema, 'products');
