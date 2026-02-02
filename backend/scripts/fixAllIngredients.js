import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const productSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  ingredients: mongoose.Schema.Types.Mixed
}, { strict: false });

const Product = mongoose.model('Product', productSchema, 'products');

async function fixAllIngredients() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let fixed = 0;

    for (const product of products) {
      let needsUpdate = false;
      let cleanIngredients = [];

      if (!product.ingredients || product.ingredients.length === 0) {
        console.log(`⏭️  Skipping "${product.name}" - no ingredients`);
        continue;
      }

      for (const ing of product.ingredients) {
        // Si es string, convertir a objeto
        if (typeof ing === 'string') {
          cleanIngredients.push({ name: ing, customizable: false });
          needsUpdate = true;
        }
        // Si es objeto válido con name, mantener
        else if (ing && typeof ing === 'object' && ing.name) {
          cleanIngredients.push({
            name: ing.name,
            customizable: ing.customizable || false
          });
        }
        // Si es objeto corrupto (con keys numéricas), reconstruir
        else if (ing && typeof ing === 'object') {
          const keys = Object.keys(ing).filter(k => !isNaN(k));
          if (keys.length > 0) {
            const reconstructed = keys.sort((a, b) => a - b).map(k => ing[k]).join('');
            if (reconstructed) {
              cleanIngredients.push({ name: reconstructed, customizable: false });
              needsUpdate = true;
            }
          }
        }
      }

      if (needsUpdate && cleanIngredients.length > 0) {
        console.log(`🔧 Fixing "${product.name}" (${product.productId})`);
        console.log(`   Before: ${product.ingredients.length} items`);
        console.log(`   After: ${cleanIngredients.length} items`);
        
        await Product.updateOne(
          { _id: product._id },
          { $set: { ingredients: cleanIngredients } }
        );
        
        fixed++;
        console.log(`   ✅ Updated\n`);
      } else {
        console.log(`✓ "${product.name}" OK`);
      }
    }

    console.log(`\n📊 Summary: ${fixed} products fixed\n`);
    
    await mongoose.connection.close();
    console.log('👋 Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAllIngredients();
