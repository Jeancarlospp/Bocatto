# Guía Rápida - Bocatto Restaurant

## 🚀 Inicio Rápido

### 1. Configurar MongoDB
```bash
# Edita: backend/.env
# Pega tu URI de MongoDB Atlas en la línea MONGODB_URI=
```

### 2. Iniciar Desarrollo

**Opción A - Script Automático (Windows PowerShell):**
```powershell
.\start-dev.ps1
```

**Opción B - Manual:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
python -m http.server 3000
```

### 3. Abrir en el Navegador
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 Comandos Comunes

### Backend
```bash
cd backend
npm run dev      # Desarrollo (auto-reload)
npm start        # Producción
```

### Verificar Conexión Backend
```bash
curl http://localhost:5000
# O abre en el navegador
```

## 🗂️ Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `backend/.env` | Configuración (MONGODB_URI) |
| `backend/server.js` | Servidor principal |
| `backend/config/database.js` | Conexión MongoDB |
| `frontend/index.html` | Página principal |
| `frontend/js/config.js` | Config API URL |
| `frontend/js/main.js` | JavaScript principal |

## 🎯 Estructura de Carpetas

```
backend/
├── config/       → Configuraciones
├── models/       → Modelos MongoDB (crear aquí)
├── routes/       → Rutas API (crear aquí)
├── controllers/  → Lógica negocio (crear aquí)
└── middleware/   → Middlewares (crear aquí)

frontend/
├── css/          → Estilos
├── js/           → JavaScript modular
├── html/         → Páginas adicionales
└── assets/       → Imágenes, iconos
```

## 🔧 Desarrollo de Funcionalidades

### Crear un Modelo (Ejemplo: Menu)
```javascript
// backend/models/Menu.js
import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: String,
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);
```

### Crear un Controlador
```javascript
// backend/controllers/menuController.js
import Menu from '../models/Menu.js';

export const getAllMenu = async (req, res) => {
  try {
    const items = await Menu.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Crear una Ruta
```javascript
// backend/routes/menuRoutes.js
import express from 'express';
import { getAllMenu } from '../controllers/menuController.js';

const router = express.Router();
router.get('/', getAllMenu);

export default router;
```

### Registrar la Ruta en server.js
```javascript
// En backend/server.js
import menuRoutes from './routes/menuRoutes.js';
app.use('/api/menu', menuRoutes);
```

## 🌐 Frontend - Consumir API

```javascript
// En frontend/js/
import apiService from './api.js';

// Obtener datos
const menuItems = await apiService.get('/api/menu');
console.log(menuItems);

// Crear datos
const newItem = await apiService.post('/api/menu', {
  name: 'Pizza',
  price: 12.99
});
```

## 📦 Despliegue

### Render (Backend)
1. Push a GitHub
2. Crear Web Service en Render
3. Root Directory: `backend`
4. Agregar variable: `MONGODB_URI`

### Vercel (Frontend)
1. Conectar repo en Vercel
2. Root Directory: `frontend`
3. Deploy automático

### Actualizar URL en Producción
```javascript
// frontend/js/config.js
BASE_URL: 'https://tu-backend.onrender.com'
```

## 🆘 Problemas Comunes

**Error: Cannot find module 'express'**
```bash
cd backend
npm install
```

**Error: Puerto 5000 en uso**
```bash
# Cambia el puerto en backend/.env
PORT=5001
```

**CORS Error**
- Ya está configurado en backend/server.js
- Verifica que FRONTEND_URL en .env sea correcto

## 📚 Recursos

- [Express Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [MDN Web Docs](https://developer.mozilla.org/)

---

✨ **¡Tu entorno está listo! Comienza a programar.**
