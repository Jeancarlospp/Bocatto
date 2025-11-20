import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
}, { timestamps: true });

export default mongoose.model('Product', menuSchema, 'products');
