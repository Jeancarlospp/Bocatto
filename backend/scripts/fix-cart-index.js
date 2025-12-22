import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixCartIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const cartsCollection = db.collection('carts');

    // Get existing indexes
    console.log('\nExisting indexes:');
    const indexes = await cartsCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the old unique sessionId index
    try {
      console.log('\nDropping old sessionId_1 index...');
      await cartsCollection.dropIndex('sessionId_1');
      console.log('✅ Old index dropped successfully');
    } catch (error) {
      console.log('⚠️  Index may not exist or already dropped:', error.message);
    }

    // Create new compound index
    console.log('\nCreating new compound index...');
    await cartsCollection.createIndex(
      { sessionId: 1, status: 1 },
      { 
        unique: true, 
        partialFilterExpression: { status: 'active' },
        name: 'sessionId_1_status_1_active_unique'
      }
    );
    console.log('✅ New compound index created successfully');

    // Show final indexes
    console.log('\nFinal indexes:');
    const finalIndexes = await cartsCollection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixCartIndex();
