# Backend API - Bocatto Restaurant

API REST para la aplicación web del restaurante Bocatto.

## 🚀 Tecnologías

- **Node.js** v22.17.0
- **Express** v4.19.2
- **MongoDB Atlas** con Mongoose
- **CORS** habilitado
- **ES6+ Modules**

## 📁 Estructura del Proyecto

```
backend/
├── config/          # Configuraciones (database.js)
├── controllers/     # Lógica de negocio
├── models/          # Modelos de MongoDB (Mongoose schemas)
├── routes/          # Rutas de la API
├── middleware/      # Middlewares personalizados
├── .env            # Variables de entorno (NO subir a git)
├── .env.example    # Ejemplo de variables de entorno
├── .gitignore      # Archivos a ignorar
├── package.json    # Dependencias
└── server.js       # Punto de entrada
```

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copia `.env.example` a `.env`
   - Agrega tu URI de MongoDB Atlas

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. Iniciar servidor de producción:
```bash
npm start
```

## 🌐 Variables de Entorno

- `PORT` - Puerto del servidor (default: 5000)
- `MONGODB_URI` - URI de conexión a MongoDB Atlas
- `NODE_ENV` - Entorno (development/production)
- `FRONTEND_URL` - URL del frontend para CORS

## 📝 Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor con nodemon (auto-reload)

## 🔗 Endpoints

**Ruta base:** `http://localhost:5000`

- `GET /` - Verificar estado del servidor

*Más endpoints se agregarán según las necesidades del restaurante*

## 📦 Despliegue en Render

El proyecto está configurado para desplegarse en Render automáticamente.
