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

// Simple Area schema for migration (without pre-save hooks)
const areaSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  minCapacity: Number,
  maxCapacity: Number
}, {
  timestamps: true,
  strict: false // Allow other fields not defined in schema
});

const Area = mongoose.model('Area', areaSchema, 'areas');

async function migrateAreaIds() {
  try {
    // Use MONGODB_URI from environment or command line argument
    const mongoUri = process.env.MONGODB_URI || process.argv[2];
    
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI no está definido.');
      console.log('💡 Ejecuta el script con: node scripts/migrateAreaIds.js "tu_mongo_uri"');
      console.log('💡 O define MONGODB_URI en las variables de entorno.');
      process.exit(1);
    }
    
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    // Get all areas without id
    const areasWithoutId = await Area.find({ 
      $or: [
        { id: { $exists: false } },
        { id: null }
      ]
    }).sort({ createdAt: 1 });

    console.log(`📊 Áreas sin ID encontradas: ${areasWithoutId.length}\n`);

    if (areasWithoutId.length === 0) {
      console.log('✅ Todas las áreas ya tienen ID asignado.');
      await mongoose.connection.close();
      return;
    }

    // Get current counter or start from 1
    let counter = await Counter.findById('areaId');
    let currentId = counter ? counter.seq : 0;

    console.log(`🔢 Iniciando desde ID: ${currentId + 1}\n`);

    // Assign IDs to areas
    for (const area of areasWithoutId) {
      currentId++;
      area.id = currentId;
      await area.save();
      console.log(`✅ Área: ${area.name} - ID asignado: ${currentId}`);
    }

    // Update counter
    await Counter.findByIdAndUpdate(
      'areaId',
      { seq: currentId },
      { upsert: true }
    );

    console.log(`\n✅ Migración completada. ${areasWithoutId.length} áreas actualizadas.`);
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
migrateAreaIds();
