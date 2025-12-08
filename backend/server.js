import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database.js';

// Cargar variables de entorno
dotenv.config();

// Crear instancia de Express
const app = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://bocatto-git-main-jeancarlos-projects-8f89f917.vercel.app", 
    "https://bocatto-nu.vercel.app", 
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies for JWT authentication

// Conectar a MongoDB
connectDB();

// Importar rutas
import menuRoutes from './routes/menuRoutes.js';
import authRoutes from './routes/authRoutes.js';
import areaRoutes from './routes/areaRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido a la API de Bocatto Restaurant',
    status: 'Server is running',
    version: '1.0.0'
  });
});

// Rutas de la API
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/areas', areaRoutes); // No prefix 'api/' as per requirements
app.use('/reservations', reservationRoutes); // No prefix 'api/' as per requirements

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'La ruta solicitada no existe'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
