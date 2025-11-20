# Frontend - Bocatto Restaurant

Aplicación web frontend para el restaurante Bocatto.

## 🚀 Tecnologías

- **HTML5** - Estructura semántica moderna
- **CSS3** - Variables CSS, Flexbox, Grid, Responsive Design
- **JavaScript ES6+** - Módulos, async/await, clases
- **Fetch API** - Para comunicación con el backend

## 📁 Estructura del Proyecto

```
frontend/
├── assets/          # Imágenes, iconos, fuentes
├── css/
│   ├── reset.css       # Reset/normalización CSS
│   ├── variables.css   # Variables CSS (colores, tipografía, etc.)
│   └── styles.css      # Estilos principales
├── html/            # Páginas HTML adicionales
├── js/
│   ├── config.js       # Configuración (API URL, etc.)
│   ├── api.js          # Servicio de API
│   ├── utils.js        # Funciones utilitarias
│   └── main.js         # Punto de entrada principal
├── index.html       # Página principal
├── vercel.json      # Configuración de Vercel
└── README.md        # Este archivo
```

## 🎨 Sistema de Diseño

El proyecto utiliza un sistema de diseño basado en variables CSS para:
- Colores (primary, secondary, estados)
- Tipografía (tamaños, pesos)
- Espaciado (consistente en toda la app)
- Sombras y transiciones

## 🔧 Configuración Local

1. **Desarrollo simple:**
   - Abre `index.html` directamente en el navegador
   - Nota: Los módulos ES6 pueden requerir un servidor local

2. **Con servidor local (recomendado):**

   **Opción 1 - Python:**
   ```bash
   # Python 3
   python -m http.server 3000
   ```

   **Opción 2 - Node.js (http-server):**
   ```bash
   npx http-server -p 3000
   ```

   **Opción 3 - VS Code:**
   - Instala la extensión "Live Server"
   - Click derecho en `index.html` > "Open with Live Server"

3. **Abre en el navegador:**
   ```
   http://localhost:3000
   ```

## 🔗 Conectar con Backend

Edita `js/config.js` y actualiza la URL del backend:

```javascript
// Desarrollo local
BASE_URL: 'http://localhost:5000'

// Producción (Render)
BASE_URL: 'https://tu-backend.onrender.com'
```

## 📦 Despliegue en Vercel

Ver instrucciones detalladas en `DEPLOY_VERCEL.md`

Resumen rápido:
1. Sube el código a GitHub
2. Conecta el repositorio en Vercel
3. Configura Root Directory: `frontend`
4. Deploy automático

## 📱 Responsive Design

El sitio es completamente responsive con breakpoints en:
- Mobile: < 480px
- Tablet: < 768px
- Desktop: > 768px

## 🎯 Características

- ✅ Diseño moderno y limpio
- ✅ Navegación responsive
- ✅ Sistema de diseño con variables CSS
- ✅ Módulos JavaScript ES6+
- ✅ Servicio de API reutilizable
- ✅ Utilidades comunes
- ✅ Preparado para SEO
- ✅ Listo para despliegue en Vercel

## 🔜 Próximos Pasos

1. Agregar páginas adicionales (Menú, Reservas, etc.)
2. Implementar funcionalidades específicas del restaurante
3. Agregar imágenes y assets
4. Conectar con el backend
5. Implementar sistema de pedidos
6. Agregar autenticación si es necesario
