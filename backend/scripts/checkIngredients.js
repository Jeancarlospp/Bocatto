import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Menu.js';

dotenv.config();

async function checkIngredients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    console.log(`📦 Checking ${products.length} products\n`);

    for (const product of products) {
      if (!product.ingredients || product.ingredients.length === 0) {
        console.log(`⚠️  "${product.name}" (${product.productId}) - NO ingredients`);
        continue;
      }

      const first = product.ingredients[0];
      
      // Check structure
      if (typeof first === 'string') {
        console.log(`❌ "${product.name}" (${product.productId}) - STRING FORMAT`);
        console.log(`   Data: ${product.ingredients.slice(0, 3).join(', ')}`);
      } else if (typeof first === 'object' && first !== null) {
        if (!first.name) {
          console.log(`❌ "${product.name}" (${product.productId}) - MALFORMED OBJECT`);
          console.log(`   Keys: ${Object.keys(first).join(', ')}`);
          console.log(`   First few values:`, JSON.stringify(first).slice(0, 100));
        }
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Check complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkIngredients();
