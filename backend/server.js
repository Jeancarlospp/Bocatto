import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { connectDB } from './config/database.js';
import configurePassport from './config/passport.js';

// Importar rutas
import menuRoutes from './routes/menuRoutes.js';
import authRoutes from './routes/authRoutes.js';
import twoFactorRoutes from './routes/twoFactorRoutes.js';
import areaRoutes from './routes/areaRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import clientRoutes from './routes/clientRoutes.js';

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
    'http://127.0.0.1:5500',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration (required for Passport OAuth flow)
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'bocatto-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Conectar a MongoDB
connectDB();

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
app.use('/api/auth', authRoutes);app.use('/api/auth/2fa', twoFactorRoutes);app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/areas', areaRoutes);
app.use('/offers', offerRoutes);
app.use('/reservations', reservationRoutes);
app.use('/locations', locationRoutes);
app.use('/categories', categoryRoutes);
app.use('/reviews', reviewRoutes);
app.use('/coupons', couponRoutes);
app.use('/clients', clientRoutes);
app.use('/debug', debugRoutes);

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