# 🏠 MÓDULO DE GESTIÓN DE AMBIENTES (AREAS)

## ✅ IMPLEMENTACIÓN COMPLETA

Se ha implementado un módulo profesional CRUD para la gestión de ambientes (áreas) del restaurante, tanto en backend como en frontend del panel de administración.

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### **Backend:**

1. ✅ `backend/models/Area.js` - Modelo de datos
2. ✅ `backend/controllers/areaController.js` - Lógica de negocio
3. ✅ `backend/routes/areaRoutes.js` - Endpoints REST
4. ✅ `backend/middleware/upload.js` - Manejo de imágenes con Multer
5. ✅ `backend/server.js` - Rutas registradas y archivos estáticos

### **Frontend:**

6. ✅ `frontend/app/admin/areas/page.jsx` - Página de gestión completa
7. ✅ `frontend/components/AdminSidebar.jsx` - Enlace actualizado

---

## 🗄️ MODELO DE DATOS (Area)

### **Colección:** `areas` en MongoDB

### **Campos:**

```javascript
{
  name: String,              // Requerido, 3-100 caracteres
  description: String,       // Requerido, 10-500 caracteres
  minCapacity: Number,       // Requerido, mínimo 1, entero
  maxCapacity: Number,       // Requerido, >= minCapacity, entero
  features: [String],        // Requerido, 1-4 elementos, cada uno 3-50 caracteres
  imageUrl: String,          // Opcional, ruta relativa de la imagen
  isActive: Boolean,         // Default: true, para soft delete
  createdAt: Date,           // Automático (timestamps)
  updatedAt: Date            // Automático (timestamps)
}
```

### **Validaciones:**

- ✅ Nombre único y longitud controlada
- ✅ Capacidad mínima <= máxima
- ✅ Features: mínimo 1, máximo 4
- ✅ Cada feature entre 3-50 caracteres
- ✅ Timestamps automáticos

### **Índices:**
- `isActive`: Para filtrar áreas activas eficientemente
- `name`: Para búsquedas por nombre

---

## 🌐 ENDPOINTS DE LA API

**Base URL:** `/areas` (sin prefijo `/api/` según requisitos)

### **1. GET /areas**
**Descripción:** Obtener todas las áreas  
**Acceso:** Público (con filtro opcional)  
**Query params:**
- `activeOnly=true` (opcional): Filtrar solo áreas activas

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Terraza Principal",
      "description": "Espacio al aire libre con vista panorámica",
      "minCapacity": 2,
      "maxCapacity": 10,
      "features": ["Vista panorámica", "Aire libre", "Música ambiente", "Calefacción"],
      "imageUrl": "/uploads/areas/area-1733599999999-123456789.jpg",
      "isActive": true,
      "createdAt": "2025-12-07T...",
      "updatedAt": "2025-12-07T..."
    }
  ]
}
```

---

### **2. GET /areas/:id**
**Descripción:** Obtener área específica por ID  
**Acceso:** Público  
**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": { /* área completa */ }
}
```

**Errores:**
- 404: Área no encontrada
- 400: ID inválido

---

### **3. POST /areas**
**Descripción:** Crear nueva área  
**Acceso:** 🔒 Protegido - Solo Admin  
**Headers:** Cookie con `authToken`  
**Content-Type:** `multipart/form-data`  
**Body (FormData):**
```javascript
{
  name: "Terraza Principal",
  description: "Espacio al aire libre...",
  minCapacity: 2,
  maxCapacity: 10,
  features: JSON.stringify(["Vista", "Aire libre"]), // o array directo
  image: File // Opcional, archivo de imagen
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Area created successfully",
  "data": { /* área creada */ }
}
```

**Errores:**
- 400: Validación fallida
- 401: No autenticado
- 403: No es admin

---

### **4. PUT /areas/:id**
**Descripción:** Actualizar área existente  
**Acceso:** 🔒 Protegido - Solo Admin  
**Content-Type:** `multipart/form-data`  
**Body:** Igual que POST (todos los campos opcionales excepto los requeridos)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Area updated successfully",
  "data": { /* área actualizada */ }
}
```

**Nota:** Si se envía nueva imagen, la anterior se elimina automáticamente.

---

### **5. DELETE /areas/:id**
**Descripción:** Eliminar área (soft delete)  
**Acceso:** 🔒 Protegido - Solo Admin  
**Estrategia:** Soft delete - marca `isActive: false`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Area deleted successfully"
}
```

**¿Por qué soft delete?**
- ✅ No pierde datos históricos
- ✅ Evita romper relaciones con reservaciones existentes
- ✅ Permite reactivar áreas en el futuro
- ✅ Seguro para producción con MongoDB

---

### **6. PATCH /areas/:id/toggle-status**
**Descripción:** Activar/desactivar área  
**Acceso:** 🔒 Protegido - Solo Admin  
**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Area activated successfully", // o "deactivated"
  "data": { /* área con nuevo estado */ }
}
```

---

## 📷 SISTEMA DE IMÁGENES

### **Estrategia de Almacenamiento:**

**Opción implementada:** Almacenamiento local en servidor

#### **Flujo completo:**

1. **Upload:**
   - Admin selecciona imagen en formulario
   - Frontend envía archivo en `FormData` (campo `image`)
   - Backend recibe con Multer middleware
   - Multer guarda en `backend/uploads/areas/`
   - Filename: `area-{timestamp}-{random}.{ext}`

2. **Storage:**
   - **Ubicación física:** `backend/uploads/areas/`
   - **Campo BD:** `imageUrl` almacena ruta relativa: `/uploads/areas/filename.jpg`
   - **Middleware:** `uploadAreaImage` (multer.single('image'))

3. **Validaciones:**
   - ✅ Tipos permitidos: JPEG, JPG, PNG, WEBP
   - ✅ Tamaño máximo: 5MB
   - ✅ Validación de mimetype

4. **Construcción de URL:**
   ```javascript
   // En backend al guardar:
   imageUrl = `/uploads/areas/${req.file.filename}`;
   
   // En frontend para mostrar:
   const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${area.imageUrl}`;
   // Ejemplo: https://bocatto.onrender.com/uploads/areas/area-1733599999-123.jpg
   ```

5. **Servidor de archivos estáticos:**
   ```javascript
   // server.js
   app.use('/uploads', express.static('uploads'));
   ```
   Esto sirve `/uploads` como carpeta estática accesible vía HTTP.

6. **Limpieza automática:**
   - Al actualizar área con nueva imagen → elimina imagen anterior
   - Al fallar creación/actualización → elimina imagen subida
   - Función: `deleteAreaImage(imageUrl)` en `middleware/upload.js`

### **Alternativas futuras:**
Si el proyecto crece, se puede migrar a:
- **Cloudinary:** Para CDN y transformaciones automáticas
- **AWS S3:** Para almacenamiento escalable
- **Google Cloud Storage:** Similar a S3

El código está preparado para cambiar fácilmente:
1. Reemplazar middleware `uploadAreaImage`
2. Cambiar lógica en controller para guardar URL de servicio externo
3. No requiere cambios en frontend (solo usa `imageUrl`)

---

## 🎨 INTERFAZ DE ADMINISTRACIÓN

### **Ruta:** `/admin/areas`

### **Características:**

#### **A) Formulario de Creación/Edición:**

**Campos:**
- ✅ Nombre (input text, requerido)
- ✅ Descripción (textarea, requerido)
- ✅ Capacidad mínima (input number, requerido)
- ✅ Capacidad máxima (input number, requerido)
- ✅ Características (inputs dinámicos, 1-4)
  - Botón para agregar/eliminar
  - Máximo 4 características
  - Mínimo 1 característica
- ✅ Imagen (input file, opcional)
  - Preview inmediato al seleccionar
  - Acepta solo imágenes

**Validaciones frontend:**
- ❌ No permite enviar si falta campo requerido
- ❌ Valida minCapacity <= maxCapacity
- ❌ Valida 1-4 características no vacías
- ✅ Muestra preview de imagen antes de subir
- ✅ Mensajes de error claros

**Modos:**
- **Crear:** Formulario vacío, botón "Crear Ambiente"
- **Editar:** Formulario precargado, botón "Actualizar Ambiente"
  - Botón "Cancelar" para volver a modo crear
  - Scroll automático al inicio al editar

---

#### **B) Galería de Áreas:**

**Diseño:** Grid responsivo tipo tarjetas

**Columnas:**
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas

**Cada tarjeta muestra:**
- ✅ Imagen grande (48 alto, cover)
- ✅ Badge "INACTIVO" si `isActive: false`
- ✅ Nombre en negrita
- ✅ Descripción truncada (2 líneas)
- ✅ Capacidad con icono de personas
- ✅ Características en chips naranjas
- ✅ Botones de acción:
  - 🔵 Editar (azul)
  - 🔴 Eliminar (rojo)

**Estados visuales:**
- ✅ Hover: Escala 1.05 (efecto zoom suave)
- ✅ Inactivas: Opacidad 60%, borde rojo
- ✅ Activas: Borde gris normal

**Interacciones:**
- ✅ **Editar:** Carga datos en formulario, scroll arriba
- ✅ **Eliminar:** Pide confirmación antes de eliminar
- ✅ **Sin áreas:** Muestra mensaje "No hay ambientes registrados"

---

#### **C) Estados de carga:**
- ✅ Loading spinner al cargar datos
- ✅ "Guardando..." al enviar formulario
- ✅ Botón deshabilitado durante submit
- ✅ Alertas de éxito/error

---

## 🔒 SEGURIDAD Y PROTECCIÓN

### **Rutas protegidas:**

Todos los endpoints de modificación requieren:
1. ✅ Cookie `authToken` válida
2. ✅ Middleware `authenticateToken` (verifica JWT)
3. ✅ Middleware `isAdmin` (verifica role='admin')

```javascript
// Ejemplo:
router.post('/', authenticateToken, isAdmin, uploadAreaImage, createArea);
```

### **Validaciones:**
- ✅ Backend: Mongoose schema validators
- ✅ Frontend: Validación en submit
- ✅ Upload: Tipo y tamaño de archivo

### **Soft Delete:**
- ✅ No elimina físicamente de MongoDB
- ✅ Solo marca `isActive: false`
- ✅ Preserva integridad referencial

---

## 🔮 PREPARACIÓN PARA FRONTEND PÚBLICO

### **¿Cómo consumir desde página pública de reservaciones?**

```javascript
// En frontend público (futuro):
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/areas?activeOnly=true`
);

const data = await response.json();
const activeAreas = data.data; // Solo áreas activas

// Mostrar en galería similar a la del admin
activeAreas.map(area => (
  <AreaCard
    key={area._id}
    name={area.name}
    description={area.description}
    capacity={`${area.minCapacity}-${area.maxCapacity}`}
    features={area.features}
    imageUrl={`${process.env.NEXT_PUBLIC_API_URL}${area.imageUrl}`}
  />
));
```

### **Endpoint preparado:**
- ✅ `GET /areas?activeOnly=true` - Solo áreas activas
- ✅ Sin autenticación requerida
- ✅ Devuelve misma estructura que admin

### **Componente sugerido:**
Crear `frontend/app/(public)/reservations/page.jsx` que:
1. Consume `GET /areas?activeOnly=true`
2. Muestra galería similar (sin botones de editar/eliminar)
3. Al hacer clic en área → Lleva a formulario de reservación

---

## 🧪 CÓMO PROBAR

### **1. Iniciar backend:**
```powershell
cd backend
npm run dev
```

### **2. Iniciar frontend:**
```powershell
cd frontend
npm run dev
```

### **3. Acceder al panel:**
1. Login: http://localhost:3000
2. Ingresar como admin
3. Sidebar → Reservaciones → Ambientes
4. URL: http://localhost:3000/admin/areas

### **4. Probar funcionalidades:**

**Crear área:**
- Llenar formulario completo
- Seleccionar imagen
- Ver preview
- Crear → Debe aparecer en galería

**Editar área:**
- Clic en "Editar" de cualquier tarjeta
- Formulario se precarga
- Modificar campos
- Cambiar imagen (opcional)
- Actualizar → Cambios se reflejan

**Eliminar área:**
- Clic en "Eliminar"
- Confirmar alerta
- Área se marca como inactiva (badge rojo)
- Sigue apareciendo en admin pero opaca

**Validaciones:**
- Intentar crear sin campos requeridos → Error
- Intentar minCapacity > maxCapacity → Error
- Agregar 0 o más de 4 features → Error

---

## 📊 ESTRUCTURA DE CARPETAS RESULTANTE

```
backend/
├── models/
│   ├── Area.js           ← NUEVO
│   ├── Menu.js
│   └── User.js
├── controllers/
│   ├── areaController.js ← NUEVO
│   ├── authController.js
│   └── menuController.js
├── routes/
│   ├── areaRoutes.js     ← NUEVO
│   ├── authRoutes.js
│   └── menuRoutes.js
├── middleware/
│   ├── auth.js
│   └── upload.js         ← NUEVO
├── uploads/              ← NUEVO (auto-creado)
│   └── areas/            ← NUEVO
│       └── area-*.jpg
└── server.js             ← MODIFICADO

frontend/
├── app/
│   ├── admin/
│   │   ├── areas/        ← NUEVO
│   │   │   └── page.jsx  ← NUEVO
│   │   ├── layout.jsx
│   │   └── page.jsx
│   └── (public)/
│       └── ...
└── components/
    ├── AdminSidebar.jsx  ← MODIFICADO
    └── ...
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

- [x] Modelo Area con validaciones completas
- [x] Controlador con CRUD completo
- [x] Rutas RESTful sin prefijo `/api/`
- [x] Middleware de upload con Multer
- [x] Soft delete implementado
- [x] Imágenes guardadas localmente
- [x] Servidor de archivos estáticos
- [x] Protección con autenticación admin
- [x] Página admin con formulario
- [x] Validaciones frontend
- [x] Galería tipo tarjetas responsiva
- [x] Upload con preview
- [x] Edición inline
- [x] Eliminación con confirmación
- [x] Sidebar actualizado con enlace
- [x] Layout admin sin navbar público
- [x] Preparado para consumo público

---

## 🚀 PRÓXIMOS PASOS (FUTURO)

### **Para implementar visualización pública:**

1. **Crear página de reservaciones pública:**
   ```
   frontend/app/(public)/reservations/page.jsx
   ```

2. **Consumir endpoint:**
   ```javascript
   GET /areas?activeOnly=true
   ```

3. **Mostrar galería:**
   - Similar a la del admin pero sin acciones
   - Click en área → Formulario de reservación

4. **Vincular con modelo Reservation:**
   - Crear modelo con campo `areaId` referenciando `Area`
   - Validar disponibilidad por área y horario

---

## ⚠️ NOTAS IMPORTANTES

### **Variables de entorno requeridas:**

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
# o en producción:
NEXT_PUBLIC_API_URL=https://bocatto.onrender.com
```

**Backend (.env):**
```env
NODE_ENV=development
JWT_SECRET=bocatto_secret_key_2024
MONGODB_URI=mongodb+srv://...
```

### **Dependencias agregadas:**
```json
{
  "multer": "^1.4.5-lts.1"
}
```

### **No se modificó:**
- ❌ Sistema de autenticación (sigue igual)
- ❌ Layouts (público y admin separados)
- ❌ Otras rutas admin (products, orders, etc.)
- ❌ Modelo de reservaciones (pendiente)

---

## 🎯 RESUMEN EJECUTIVO

✅ **Módulo completamente funcional** de gestión de ambientes  
✅ **CRUD completo** con validaciones robustas  
✅ **Upload de imágenes** con preview y almacenamiento local  
✅ **Soft delete** para seguridad de datos  
✅ **UI profesional** tipo galería responsiva  
✅ **Protección admin** en todas las operaciones  
✅ **Preparado para frontend público** con endpoint filtrado  

**Todo el código en INGLÉS excepto textos de UI en ESPAÑOL según requisitos** ✅

---

**Documentación creada:** 7 de diciembre, 2025  
**Módulo:** Areas Management System  
**Stack:** Node.js + Express + MongoDB + Multer + Next.js 16 + React 19
