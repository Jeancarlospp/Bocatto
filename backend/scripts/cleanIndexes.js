import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FastFoodApp';

async function cleanIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reservacions');

    // Get all indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    // Drop obsolete indexes from old schema
    const obsoleteIndexes = [
      'numeroReservacion_1',
      'cliente_1_fechaReservacion_-1',
      'ambiente_1_fechaReservacion_1',
      'estado_1',
      'fechaReservacion_1_horaInicio_1'
    ];

    console.log('\n🗑️  Dropping obsolete indexes...');
    for (const indexName of obsoleteIndexes) {
      try {
        await collection.dropIndex(indexName);
        console.log(`  ✅ Dropped: ${indexName}`);
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log(`  ℹ️  Not found: ${indexName} (already removed)`);
        } else {
          console.log(`  ⚠️  Error dropping ${indexName}:`, error.message);
        }
      }
    }

    // Show remaining indexes
    console.log('\n📋 Remaining indexes:');
    const remainingIndexes = await collection.indexes();
    remainingIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\n✅ Index cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanIndexes();
