# 📍 Sistema de Ubicaciones/Sucursales - Bocatto

## Descripción

Este módulo permite administrar las ubicaciones/sucursales del restaurante Bocatto, incluyendo la gestión completa desde el panel de administración y la visualización pública para los clientes.

## ✨ Características Implementadas

### Backend

1. **Modelo Location** (`backend/models/Location.js`)
   - Auto-incremento de ID numérico
   - Campos: nombre, dirección, ciudad, teléfono, email
   - Coordenadas geográficas (latitud y longitud)
   - Horarios de atención personalizables por día
   - Imagen subida a Cloudinary
   - Descripción
   - Flag de sucursal principal (flagship)
   - Sistema de activación/desactivación (soft delete)

2. **Controlador** (`backend/controllers/locationController.js`)
   - `createLocation` - Crear nueva sucursal
   - `getAllLocations` - Obtener todas las sucursales (con filtros)
   - `getLocationById` - Obtener una sucursal específica
   - `updateLocation` - Actualizar sucursal existente
   - `deleteLocation` - Eliminación suave (marca como inactiva)
   - `toggleLocationStatus` - Activar/desactivar sucursal

3. **Rutas** (`backend/routes/locationRoutes.js`)
   - `GET /locations` - Lista pública de sucursales activas
   - `GET /locations/:id` - Detalles de una sucursal
   - `POST /locations` - Crear sucursal (Admin only)
   - `PUT /locations/:id` - Actualizar sucursal (Admin only)
   - `DELETE /locations/:id` - Eliminar sucursal (Admin only)
   - `PATCH /locations/:id/toggle` - Cambiar estado (Admin only)

4. **Upload de Imágenes**
   - Configuración de Cloudinary para carpeta `bocatto/locations/`
   - Middleware `uploadLocationImage` en `backend/middleware/upload.js`
   - Función `deleteLocationImage` para limpiar imágenes eliminadas
   - Optimización automática y transformación de imágenes

### Frontend

1. **Panel de Administración** (`frontend/app/admin/locations/page.jsx`)
   - Formulario completo para crear/editar sucursales
   - Campos para todos los datos de la ubicación
   - Upload de imágenes con vista previa
   - Editor de horarios de atención por día
   - Checkbox para marcar sucursal principal
   - Lista de sucursales con tarjetas visuales
   - Acciones: Editar, Activar/Desactivar, Eliminar
   - Indicadores visuales de estado (activa/inactiva)
   - Badge especial para sucursales principales

2. **Página Pública** (`frontend/app/(public)/locations/page.jsx`)
   - Visualización de todas las sucursales activas
   - Filtro por ciudad
   - Tarjetas visuales con imagen, información y horarios
   - Enlace directo a Google Maps con coordenadas
   - Enlaces clicables para teléfono y email
   - Diseño responsive
   - Badge especial para sucursal principal

3. **Navegación**
   - Nueva sección "Restaurante" en AdminSidebar
   - Opción "Sucursales" en el menú de administración
   - Enlace "Ubicaciones" ya existente en el header público

## 📋 Uso

### Crear una Sucursal (Admin)

1. Ir a `/admin/locations`
2. Completar el formulario:
   - **Nombre**: Nombre de la sucursal (ej: "Bocatto Centro Histórico")
   - **Ciudad**: Ciudad donde se encuentra
   - **Dirección**: Dirección completa
   - **Teléfono**: Número de contacto
   - **Email** (opcional): Email de la sucursal
   - **Latitud/Longitud**: Coordenadas GPS (obtener de Google Maps)
   - **Descripción** (opcional): Descripción breve
   - **Horarios**: Horarios de atención por cada día
   - **Imagen**: Foto de la sucursal (opcional, máx 5MB)
   - **Sucursal Principal**: Marcar si es la principal
3. Click en "Agregar Sucursal"

### Editar una Sucursal

1. En la lista de sucursales, click en "Editar"
2. Modificar los campos deseados
3. Click en "Actualizar Sucursal"

### Obtener Coordenadas GPS

1. Ir a [Google Maps](https://maps.google.com)
2. Buscar la dirección de la sucursal
3. Click derecho en el marcador
4. Copiar las coordenadas (formato: -0.1807, -78.4678)
5. Usar el primer número como Latitud
6. Usar el segundo número como Longitud

## 🔗 Endpoints API

```
GET    /locations              - Obtener todas las sucursales
GET    /locations?activeOnly=true  - Solo sucursales activas
GET    /locations?city=Quito   - Filtrar por ciudad
GET    /locations/:id          - Obtener una sucursal
POST   /locations              - Crear sucursal (requiere auth admin)
PUT    /locations/:id          - Actualizar sucursal (requiere auth admin)
DELETE /locations/:id          - Eliminar sucursal (requiere auth admin)
PATCH  /locations/:id/toggle   - Activar/desactivar (requiere auth admin)
```

## 📝 Modelo de Datos

```javascript
{
  id: Number,              // Auto-incrementado
  name: String,            // Nombre de la sucursal
  address: String,         // Dirección
  city: String,            // Ciudad
  phone: String,           // Teléfono
  email: String,           // Email (opcional)
  coordinates: {
    lat: Number,           // Latitud
    lng: Number            // Longitud
  },
  openingHours: {
    monday: String,        // "09:00 - 22:00"
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  imageUrl: String,        // URL de Cloudinary
  description: String,     // Descripción (opcional)
  isActive: Boolean,       // Estado activo/inactivo
  isFlagship: Boolean,     // Sucursal principal
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Características de UI

- Diseño responsive (mobile, tablet, desktop)
- Animaciones suaves en hover
- Vista previa de imágenes antes de subir
- Indicadores visuales de estado
- Filtros interactivos
- Tarjetas visuales informativas
- Enlaces directos a Google Maps
- Enlaces clicables para contacto

## ✅ Validaciones

- Nombre: 3-100 caracteres
- Dirección: 10-200 caracteres
- Ciudad: 2-50 caracteres
- Teléfono: formato válido
- Email: formato válido (opcional)
- Coordenadas: Lat (-90 a 90), Lng (-180 a 180)
- Descripción: máx 500 caracteres
- Imagen: JPEG, PNG, WEBP - máx 5MB

## 🔒 Seguridad

- Solo administradores pueden crear/editar/eliminar
- Validación en backend y frontend
- Sanitización de datos
- Soft delete (no se borran físicamente)
- Upload seguro a Cloudinary

## 📦 Dependencias

- mongoose (base de datos)
- multer (upload de archivos)
- cloudinary (almacenamiento de imágenes)
- multer-storage-cloudinary (integración)

## 🚀 Próximas Mejoras Sugeridas

- Mapa interactivo con todas las sucursales
- Calculadora de ruta más cercana
- Sistema de favoritos
- Integración con sistema de reservaciones
- Filtros adicionales (por características, horarios, etc.)
- Galería de imágenes múltiples por sucursal
