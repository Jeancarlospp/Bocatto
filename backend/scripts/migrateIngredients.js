import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Menu.js';

dotenv.config();

/**
 * Migration script to convert old ingredient format to new format
 * Old: ingredients: ["pan", "carne", "lechuga"]
 * New: ingredients: [{name: "pan", customizable: false}, ...]
 */
async function migrateIngredients() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      let newIngredients = [];

      // Check if ingredients need migration
      if (product.ingredients && product.ingredients.length > 0) {
        
        for (let i = 0; i < product.ingredients.length; i++) {
          const ingredient = product.ingredients[i];
          
          // String format - needs conversion
          if (typeof ingredient === 'string') {
            if (i === 0) {
              console.log(`🔄 Migrating "${product.name}" (${product.productId})`);
              console.log(`   Old format: string array`);
            }
            newIngredients.push({
              name: ingredient,
              customizable: false
            });
            needsUpdate = true;
          }
          // Object with numeric keys (corrupted) - fix it
          else if (typeof ingredient === 'object' && ingredient !== null) {
            const keys = Object.keys(ingredient);
            
            // Check if it's malformed (has numeric keys like {0: 'a', 1: 'b'})
            if (keys.some(k => !isNaN(k) && k !== 'customizable' && k !== '_id')) {
              if (i === 0) {
                console.log(`⚠️  Fixing corrupted data in "${product.name}" (${product.productId})`);
              }
              
              // Reconstruct string from numeric keys
              const charKeys = keys.filter(k => !isNaN(k)).sort((a, b) => a - b);
              const reconstructed = charKeys.map(k => ingredient[k]).join('');
              
              newIngredients.push({
                name: reconstructed,
                customizable: ingredient.customizable || false
              });
              needsUpdate = true;
            }
            // Correct format already
            else if (ingredient.name) {
              newIngredients.push(ingredient);
            }
          }
        }
        
        // If already in correct format
        if (!needsUpdate && newIngredients.length === 0) {
          console.log(`✓ "${product.name}" already in correct format`);
          skippedCount++;
          continue;
        }
      }

      if (needsUpdate) {
        product.ingredients = newIngredients;
        await product.save();
        console.log(`   ✅ Updated successfully\n`);
        updatedCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total products: ${products.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${products.length - updatedCount - skippedCount}\n`);

    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateIngredients();
