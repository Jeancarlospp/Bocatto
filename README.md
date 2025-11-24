# 🍽️ Bocatto Restaurant - Aplicación Web

Aplicación web completa para un restaurante con frontend en **Next.js + React + Tailwind CSS** y backend en **Node.js/Express** con **MongoDB Atlas**.

## 📋 Tecnologías

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca UI
- **Tailwind CSS 4** - Framework CSS utility-first
- **Vercel** - Hosting del frontend

### Backend
- **Node.js v22.17.0** - Runtime
- **Express v4.19.2** - Framework web
- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para MongoDB
- **Render** - Hosting del backend

## 🚀 Estado del Proyecto

✅ **Entorno completamente configurado y listo para desarrollo**

- ✅ Backend configurado con Express y MongoDB
- ✅ Frontend con HTML5, CSS3 moderno y JavaScript ES6+
- ✅ Sistema de diseño con variables CSS
- ✅ Servicio API reutilizable
- ✅ Configuración para despliegue en Render y Vercel
- ✅ Estructura de carpetas organizada

## 📁 Estructura del Proyecto

```
Bocatto/
├── backend/                    # API REST - Puerto 5000
│   ├── config/                 # Configuración de DB
│   ├── controllers/            # Lógica de negocio
│   ├── models/                 # Modelos de MongoDB
│   ├── routes/                 # Rutas de la API
│   ├── middleware/             # Middlewares
│   ├── .env                    # Variables de entorno (NO subir a git)
│   ├── server.js               # Punto de entrada
│   ├── package.json            # Dependencias
│   └── README.md               # Documentación del backend
│
└── frontend/                   # Next.js App - Puerto 3000
    ├── app/                    # App Router de Next.js
    │   ├── layout.js           # Layout principal
    │   ├── page.js             # Página inicio
    │   └── menu/               # Página menú
    ├── components/             # Componentes React
    │   ├── Header.jsx
    │   ├── Footer.jsx
    │   ├── Hero.jsx
    │   └── Features.jsx
    ├── lib/                    # Utilidades
    │   └── api.js              # Cliente API
    ├── .env.local              # Variables de entorno
    ├── package.json            # Dependencias
    └── README.md               # Documentación del frontend
```

## 🔧 Configuración Inicial

### 1️⃣ Configurar Backend

```bash
cd backend
```

**Edita el archivo `.env`** y pega tu URI de MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/bocatto?retryWrites=true&w=majority
```

**Inicia el servidor de desarrollo:**
```bash
npm run dev
```

El servidor estará corriendo en: `http://localhost:5000`

### 2️⃣ Configurar Frontend

```bash
cd frontend
npm install
```

**Crea el archivo `.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Inicia el servidor de desarrollo:**
```bash
npm run dev
```

El frontend estará corriendo en: `http://localhost:3000`

## 🧪 Probar la Conexión

1. Abre el navegador en `http://localhost:3000`
2. Abre la consola del navegador (F12)
3. Deberías ver: `✅ Backend conectado`

## 📦 Despliegue

### Backend en Render

Ver instrucciones en: `backend/DEPLOY_RENDER.md`

1. Sube el código a GitHub
2. Crea un nuevo Web Service en Render
3. Conecta tu repositorio
4. Configura Root Directory: `backend`
5. Agrega variables de entorno (MONGODB_URI)
6. Deploy

### Frontend en Vercel

Ver instrucciones en: `frontend/DEPLOY_VERCEL.md`

1. Conecta tu repositorio en Vercel
2. Configura Root Directory: `frontend`
3. Deploy automático

**Importante:** En Vercel, configura la variable de entorno `NEXT_PUBLIC_API_URL` con la URL de producción del backend.

## 🔐 Seguridad

- ✅ `.gitignore` configurado en backend y frontend
- ✅ Archivo `.env` NO se sube a git
- ✅ Variables de entorno separadas por ambiente
- ✅ CORS configurado en el backend

## 📝 Próximos Pasos

1. **Pega tu URI de MongoDB Atlas** en `backend/.env`
2. **Inicia ambos servidores** (backend y frontend)
3. **Desarrolla las funcionalidades**:
   - Modelos de datos (Menu, Orders, Reservations)
   - Controladores y rutas
   - Páginas del frontend
   - Integración frontend-backend

## 🆘 Comandos Útiles

### Backend
```bash
cd backend
npm run dev          # Desarrollo con auto-reload
npm start            # Producción
```

### Frontend
```bash
cd frontend
npm run dev          # Desarrollo
npm run build        # Build de producción
npm start            # Ejecutar build
```

### Verificar Node.js
```bash
node --version       # v22.17.0
npm --version        # 10.9.2
```

## 📖 Documentación Adicional

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Deploy Render](./backend/DEPLOY_RENDER.md)
- [Deploy Vercel](./frontend/DEPLOY_VERCEL.md)

## 👨‍💻 Desarrollo

El proyecto está listo para comenzar a desarrollar. La estructura es escalable y organizada para crecer con tu aplicación.

---

**¡Listo para comenzar a programar! 🎉**