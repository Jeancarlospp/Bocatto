import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Counter schema
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Simple User schema for migration (without pre-save hooks)
const userSchema = new mongoose.Schema({
  id: Number,
  firstName: String,
  lastName: String,
  email: String,
  role: String
}, {
  timestamps: true,
  strict: false // Allow other fields not defined in schema
});

const User = mongoose.model('User', userSchema, 'users');

async function migrateUserIds() {
  try {
    // Use MONGODB_URI from environment or command line argument
    const mongoUri = process.env.MONGODB_URI || process.argv[2];
    
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI no está definido.');
      console.log('💡 Ejecuta el script con: node scripts/migrateUserIds.js "tu_mongo_uri"');
      console.log('💡 O define MONGODB_URI en las variables de entorno.');
      process.exit(1);
    }
    
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    // Get all users without id
    const usersWithoutId = await User.find({ 
      $or: [
        { id: { $exists: false } },
        { id: null }
      ]
    }).sort({ createdAt: 1 });

    console.log(`📊 Usuarios sin ID encontrados: ${usersWithoutId.length}\n`);

    if (usersWithoutId.length === 0) {
      console.log('✅ Todos los usuarios ya tienen ID asignado.');
      await mongoose.connection.close();
      return;
    }

    // Get current counter or start from 1
    let counter = await Counter.findById('userId');
    let currentId = counter ? counter.seq : 0;

    console.log(`🔢 Iniciando desde ID: ${currentId + 1}\n`);

    // Assign IDs to users
    for (const user of usersWithoutId) {
      currentId++;
      user.id = currentId;
      await user.save();
      console.log(`✅ Usuario: ${user.email} - ID asignado: ${currentId}`);
    }

    // Update counter
    await Counter.findByIdAndUpdate(
      'userId',
      { seq: currentId },
      { upsert: true }
    );

    console.log(`\n✅ Migración completada. ${usersWithoutId.length} usuarios actualizados.`);
    console.log(`🔢 Próximo ID será: ${currentId + 1}`);

    await mongoose.connection.close();
    console.log('\n🔒 Conexión cerrada.');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateUserIds();
