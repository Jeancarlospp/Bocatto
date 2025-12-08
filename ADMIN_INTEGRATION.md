# 🔧 Integración Técnica - Panel Admin de Reservaciones

## Resumen de Implementación

Sistema completo de gestión de reservaciones para administradores con visualización avanzada y filtrado dinámico.

---

## 📁 Archivos Creados/Modificados

### ✨ Nuevos Archivos:

1. **`frontend/app/admin/reservations/page.jsx`** (580 líneas)
   - Página principal del panel admin de reservaciones
   - Tabla completa con todas las columnas requeridas
   - Sistema de filtros avanzado (estado, ambiente, fechas)
   - Dashboard con 5 estadísticas en tiempo real
   - Botón de cancelación con confirmación
   - Sección de notas de clientes

2. **`frontend/components/AreaAvailabilityTimeline.jsx`** (170 líneas)
   - Componente visual tipo timeline/calendario
   - Muestra disponibilidad por hora (9 AM - 11 PM)
   - Colorización por estado (disponible, pendiente, pagada)
   - Tooltips con detalles de cada reserva
   - Sticky headers para mejor navegación

3. **`backend/scripts/cleanIndexes.js`** (48 líneas)
   - Script de mantenimiento para limpiar índices obsoletos
   - Elimina índices de schema anterior
   - Previene errores E11000 duplicate key

4. **`backend/routes/debugRoutes.js`** (142 líneas)
   - Endpoints de debugging (solo admin)
   - GET /debug/reservations - Ver todas las reservaciones
   - POST /debug/check-overlap - Verificar overlaps manualmente
   - DELETE /debug/reservations/clear-all - Limpiar base de datos
   - DELETE /debug/reservations/clear-by-status - Limpiar por estado

5. **`ADMIN_RESERVATIONS_GUIDE.md`** (documentación completa)

### 🔄 Archivos Modificados:

6. **`frontend/lib/api.js`**
   - Agregada función: `getAreas()` - Obtener todos los ambientes
   - Líneas: +20 (total: 367 líneas)

7. **`backend/server.js`**
   - Agregada ruta: `app.use('/debug', debugRoutes)`
   - Líneas: +2

8. **`backend/models/Reservation.js`**
   - Limpieza de logs de debug (opcional)
   - Líneas: -6 (total: 167 líneas)

9. **`backend/controllers/reservationController.js`**
   - Limpieza de logs de debug (opcional)
   - Líneas: -19 (total: 704 líneas)

---

## 🔌 Endpoints Backend Utilizados

### Reservaciones (Admin):

```javascript
// 1. Obtener todas las reservaciones con filtros
GET /reservations/admin/all
Query Params:
  - status: 'pending' | 'paid' | 'cancelled' | 'expired'
  - areaId: string (MongoDB ObjectId)
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
Headers:
  - Cookie: JWT token (HTTPOnly)
Middleware:
  - authenticateToken
  - isAdmin
Response: {
  success: boolean,
  count: number,
  reservations: Array<Reservation>
}

// 2. Cancelar reservación (admin)
DELETE /reservations/:id/admin-cancel
Params:
  - id: string (MongoDB ObjectId)
Headers:
  - Cookie: JWT token (HTTPOnly)
Middleware:
  - authenticateToken
  - isAdmin
Response: {
  success: boolean,
  message: string,
  reservation: Reservation
}
```

### Ambientes:

```javascript
// 3. Obtener todos los ambientes
GET /areas
No autenticación requerida
Response: {
  success: boolean,
  areas: Array<Area>
}
```

### Debug (solo development):

```javascript
// 4. Ver todas las reservaciones (debug)
GET /debug/reservations
Headers: Cookie: JWT token (admin)
Response: {
  success: boolean,
  total: number,
  byStatus: { pending, paid, cancelled, expired },
  reservations: Array<Reservation>
}

// 5. Verificar overlaps manualmente
POST /debug/check-overlap
Body: {
  areaId: string,
  startTime: string (ISO 8601),
  endTime: string (ISO 8601)
}
Response: {
  success: boolean,
  hasOverlap: boolean,
  count: number,
  overlapping: Array<Reservation>
}

// 6. Limpiar todas las reservaciones (CUIDADO)
DELETE /debug/reservations/clear-all
Headers: Cookie: JWT token (admin)
Response: {
  success: boolean,
  message: string,
  deletedCount: number
}

// 7. Limpiar por estado
DELETE /debug/reservations/clear-by-status?status=cancelled
Headers: Cookie: JWT token (admin)
Response: {
  success: boolean,
  message: string,
  deletedCount: number
}
```

---

## 🎨 Componentes React

### AdminReservationsPage

**Ubicación:** `frontend/app/admin/reservations/page.jsx`

**Props:** Ninguna (usa layout de admin)

**State:**
```javascript
{
  reservations: Array<Reservation>,      // Lista de reservaciones
  areas: Array<Area>,                    // Lista de ambientes
  loading: boolean,                      // Estado de carga inicial
  error: string | null,                  // Mensaje de error
  actionLoading: string | null,          // ID de reserva siendo procesada
  showTimeline: boolean,                 // Mostrar/ocultar timeline
  timelineDate: string,                  // Fecha seleccionada para timeline
  filters: {
    status: string,                      // Estado filtrado
    areaId: string,                      // Ambiente filtrado
    startDate: string,                   // Fecha inicio filtro
    endDate: string                      // Fecha fin filtro
  }
}
```

**Efectos:**
- `useEffect(() => loadAreas(), [])` - Cargar ambientes al montar
- `useEffect(() => loadReservations(), [filters])` - Recargar al cambiar filtros

**Funciones clave:**
- `loadAreas()` - Obtener lista de ambientes
- `loadReservations()` - Obtener reservaciones con filtros aplicados
- `handleCancelReservation(id)` - Cancelar una reservación
- `handleFilterChange(field, value)` - Actualizar filtro específico
- `clearFilters()` - Resetear todos los filtros
- `getStatusBadge(status)` - Generar badge colorido
- `formatDate(dateString)` - Formatear fecha (DD MMM YYYY)
- `formatTime(dateString)` - Formatear hora (HH:MM AM/PM)
- `canCancelReservation(reservation)` - Verificar si se puede cancelar

**Secciones visuales:**
1. Header con título y descripción
2. Dashboard de estadísticas (5 cards)
3. Toggle de timeline con selector de fecha
4. Timeline visual (condicional)
5. Panel de filtros (4 inputs)
6. Tabla de reservaciones (8 columnas)
7. Sección de notas (condicional)

---

### AreaAvailabilityTimeline

**Ubicación:** `frontend/components/AreaAvailabilityTimeline.jsx`

**Props:**
```typescript
{
  reservations: Array<Reservation>,  // Lista de reservaciones
  areas: Array<Area>,                // Lista de ambientes
  selectedDate: string               // Fecha seleccionada (YYYY-MM-DD)
}
```

**State:**
```javascript
{
  timeSlots: Array<string>  // ['09:00', '10:00', ..., '23:00']
}
```

**Funciones clave:**
- `isSlotOccupied(areaId, timeSlot)` - Verifica si un slot está ocupado
- `getSlotReservation(areaId, timeSlot)` - Obtiene la reserva de un slot
- `formatTime(dateString)` - Formatea hora para tooltip

**Algoritmo de Overlap:**
```javascript
// Slot: 14:00 - 15:00
// Reserva: 13:30 - 14:30
// Overlap si: resStart < slotEnd AND resEnd > slotStart
// Resultado: true (overlap detectado)
```

**Colores:**
- `bg-gray-100` - Disponible (gris claro)
- `bg-yellow-500` - Ocupado pendiente (amarillo)
- `bg-green-500` - Ocupado pagado (verde)

**Features:**
- Tabla responsive con scroll horizontal
- Sticky column para nombres de ambientes
- Tooltips con detalles de reserva
- Leyenda explicativa

---

## 🗄️ Esquema de Datos

### Reservation Model (Populated)

```javascript
{
  _id: "674a1b2c3d4e5f6789abcdef",
  user: {
    _id: "674a1b2c3d4e5f6789abcde0",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    role: "client"
  },
  area: {
    _id: "674a1b2c3d4e5f6789abcde1",
    name: "Terraza VIP",
    capacity: 8,
    isActive: true,
    imageUrl: "https://res.cloudinary.com/..."
  },
  startTime: "2024-12-08T18:00:00.000Z",  // UTC
  endTime: "2024-12-08T20:00:00.000Z",    // UTC
  totalPrice: 10.00,
  status: "paid",                          // 'pending' | 'paid' | 'cancelled' | 'expired'
  guestCount: 4,
  notes: "Celebración de cumpleaños, mesa cerca de la ventana",
  paymentMethodSimulated: "card",          // 'cash' | 'card' | 'transfer'
  createdAt: "2024-12-07T10:30:00.000Z",
  updatedAt: "2024-12-07T11:00:00.000Z"
}
```

### Area Model

```javascript
{
  _id: "674a1b2c3d4e5f6789abcde1",
  name: "Terraza VIP",
  description: "Espacio exclusivo con vista panorámica",
  capacity: 8,
  pricePerHour: 2.50,
  basePrice: 5.00,
  isActive: true,
  imageUrl: "https://res.cloudinary.com/.../image.jpg",
  imagePublicId: "bocatto/areas/xyz123",
  createdAt: "2024-11-01T00:00:00.000Z",
  updatedAt: "2024-11-01T00:00:00.000Z"
}
```

---

## 🔐 Autenticación y Autorización

### Flow de Autenticación:

```
1. Admin hace login en /admin-login
   ↓
2. Backend valida credenciales + role === 'admin'
   ↓
3. JWT generado y almacenado en HTTPOnly cookie
   ↓
4. AdminLayout verifica en useEffect:
   GET /api/auth/admin/verify (con cookie)
   ↓
5. Si válido: renderiza página
   Si inválido: redirect a '/'
```

### Middleware Stack (Backend):

```javascript
router.get('/admin/all',
  authenticateToken,  // 1. Verifica JWT en cookie
  isAdmin,            // 2. Verifica role === 'admin'
  getAllReservations  // 3. Controller
);
```

### Protección de Rutas (Frontend):

```javascript
// AdminLayout.jsx
useEffect(() => {
  verifyAuth();  // Verifica en cada mount
}, []);

const verifyAuth = async () => {
  const response = await fetch('/api/auth/admin/verify', {
    credentials: 'include'  // Envía cookie automáticamente
  });
  
  if (!response.ok) {
    router.replace('/');  // Redirect si no autenticado
  }
};
```

---

## 🎯 Flujo de Datos

### Carga Inicial:

```
1. Usuario navega a /admin/reservations
   ↓
2. AdminLayout verifica autenticación
   ↓
3. Component monta:
   - useEffect(() => loadAreas(), [])
   - useEffect(() => loadReservations(), [filters])
   ↓
4. API calls en paralelo:
   - GET /areas
   - GET /reservations/admin/all
   ↓
5. Estado actualizado:
   - setAreas(data.areas)
   - setReservations(data.reservations)
   ↓
6. Render de tabla y estadísticas
```

### Flujo de Filtrado:

```
1. Usuario cambia filtro (ej: selecciona estado "paid")
   ↓
2. onChange → handleFilterChange('status', 'paid')
   ↓
3. setFilters({ ...filters, status: 'paid' })
   ↓
4. useEffect detecta cambio en filters
   ↓
5. loadReservations() ejecutado
   ↓
6. GET /reservations/admin/all?status=paid
   ↓
7. setReservations(filteredData)
   ↓
8. Tabla re-renderiza con datos filtrados
```

### Flujo de Cancelación:

```
1. Usuario click "Cancelar" en fila de reserva
   ↓
2. window.confirm() muestra modal
   ↓
3. Si confirma:
   - setActionLoading(reservationId)
   - Botón muestra spinner
   ↓
4. Optimistic update:
   setReservations(prevReservations =>
     prevReservations.map(res =>
       res._id === id ? { ...res, status: 'cancelled' } : res
     )
   )
   ↓
5. DELETE /reservations/:id/admin-cancel
   ↓
6. Si éxito:
   - alert('Reservación cancelada exitosamente')
   - Estado ya actualizado (optimistic)
   ↓
7. Si error:
   - alert(error.message)
   - Revertir estado (rollback)
   ↓
8. setActionLoading(null)
```

---

## 📊 Cálculo de Estadísticas

Las estadísticas se calculan en el frontend a partir del array `reservations`:

```javascript
const stats = {
  // Total de reservaciones (respeta filtros)
  total: reservations.length,
  
  // Contar por estado
  pending: reservations.filter(r => r.status === 'pending').length,
  paid: reservations.filter(r => r.status === 'paid').length,
  cancelled: reservations.filter(r => r.status === 'cancelled').length,
  
  // Sumar ingresos (solo pagadas)
  totalRevenue: reservations
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.totalPrice, 0)
};
```

**Nota:** Se recalculan automáticamente al cambiar `reservations` (filtros, cancelaciones, etc.)

---

## 🌐 Manejo de Fechas y Zona Horaria

### Almacenamiento (Backend):
- MongoDB almacena en **UTC** (ISO 8601)
- Ejemplo: `"2024-12-08T18:00:00.000Z"`

### Display (Frontend):
```javascript
// Fecha legible
formatDate("2024-12-08T18:00:00.000Z")
// Output: "8 Dic 2024"

// Hora legible
formatTime("2024-12-08T18:00:00.000Z")
// Output: "06:00 PM" (convertido a zona local del browser)

// Fecha + Hora
formatDateTime("2024-12-08T18:00:00.000Z")
// Output: "8 Dic 2024 - 06:00 PM"
```

### Input de Usuario:
```html
<input type="date" value="2024-12-08" />
<!-- Valor: YYYY-MM-DD (ISO 8601 date-only) -->
```

### Conversión para Query:
```javascript
// Usuario selecciona: "2024-12-08"
// Backend recibe: "2024-12-08" (date string)
// Backend filtra: startTime >= "2024-12-08T00:00:00.000Z"
//                 startTime < "2024-12-09T00:00:00.000Z"
```

---

## 🚨 Manejo de Errores

### Errores Comunes y Soluciones:

**1. Error 401 Unauthorized:**
```
Causa: JWT inválido o expirado
Solución: Usuario debe volver a hacer login
```

**2. Error 403 Forbidden:**
```
Causa: Usuario no es admin
Solución: Verificar role en base de datos
```

**3. Error 500 Server Error:**
```
Causa: Error en backend (DB, código)
Solución: Revisar logs del servidor
```

**4. Network Error:**
```
Causa: Backend no disponible
Solución: Verificar que servidor esté corriendo
```

**5. CORS Error:**
```
Causa: Frontend y backend en dominios diferentes
Solución: Verificar configuración CORS en server.js
```

### Try-Catch Pattern:

```javascript
const loadReservations = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const data = await getAllReservations(filters);
    
    if (data.success) {
      setReservations(data.reservations);
    } else {
      setError(data.message || 'Error desconocido');
    }
  } catch (err) {
    console.error('Error loading reservations:', err);
    setError('Error al cargar las reservaciones');
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Testing Sugerido

### Tests Unitarios (Frontend):

```javascript
// AreaAvailabilityTimeline.test.jsx
describe('AreaAvailabilityTimeline', () => {
  test('renders time slots from 9 AM to 11 PM', () => {
    // ...
  });
  
  test('shows occupied slot in yellow for pending reservations', () => {
    // ...
  });
  
  test('shows occupied slot in green for paid reservations', () => {
    // ...
  });
  
  test('shows tooltip on hover with reservation details', () => {
    // ...
  });
});

// AdminReservationsPage.test.jsx
describe('AdminReservationsPage', () => {
  test('loads reservations on mount', () => {
    // ...
  });
  
  test('applies filters and reloads data', () => {
    // ...
  });
  
  test('cancels reservation with confirmation', () => {
    // ...
  });
  
  test('calculates statistics correctly', () => {
    // ...
  });
});
```

### Tests de Integración (Backend):

```javascript
// reservationRoutes.test.js
describe('GET /reservations/admin/all', () => {
  test('returns all reservations for admin', async () => {
    // ...
  });
  
  test('filters by status', async () => {
    // ...
  });
  
  test('returns 403 for non-admin users', async () => {
    // ...
  });
});

describe('DELETE /reservations/:id/admin-cancel', () => {
  test('cancels reservation successfully', async () => {
    // ...
  });
  
  test('returns 404 for non-existent reservation', async () => {
    // ...
  });
});
```

---

## 📦 Dependencias

### Frontend:
- `next` - Framework React
- `react` - Librería UI
- `tailwindcss` - Estilos

### Backend:
- `express` - Framework web
- `mongoose` - ODM para MongoDB
- `jsonwebtoken` - Autenticación JWT
- `cookie-parser` - Parsing de cookies
- `bcryptjs` - Hash de contraseñas
- `dotenv` - Variables de entorno
- `cors` - CORS middleware

---

## 🚀 Comandos de Inicio

### Desarrollo Local:

```bash
# Backend
cd backend
npm run dev
# Servidor en http://localhost:5000

# Frontend
cd frontend
npm run dev
# Aplicación en http://localhost:3000
```

### Script de Limpieza (si hay errores de índices):

```bash
cd backend
node scripts/cleanIndexes.js
# Limpia índices obsoletos de MongoDB
```

---

## 📈 Mejoras de Rendimiento

### 1. **Memoization**
```javascript
import { useMemo } from 'react';

const stats = useMemo(() => ({
  total: reservations.length,
  pending: reservations.filter(r => r.status === 'pending').length,
  // ...
}), [reservations]);
```

### 2. **Debouncing de Filtros**
```javascript
import { useDebounce } from 'use-debounce';

const [filters, setFilters] = useState({ ... });
const [debouncedFilters] = useDebounce(filters, 500);

useEffect(() => {
  loadReservations();
}, [debouncedFilters]);
```

### 3. **Paginación Server-Side**
```javascript
// Backend: Agregar a getAllReservations
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const reservations = await Reservation.find(query)
  .populate('user area')
  .sort({ startTime: 1 })
  .skip(skip)
  .limit(limit);

const total = await Reservation.countDocuments(query);

res.json({
  success: true,
  reservations,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
});
```

### 4. **React.memo para Timeline**
```javascript
export default React.memo(AreaAvailabilityTimeline, (prevProps, nextProps) => {
  return (
    prevProps.selectedDate === nextProps.selectedDate &&
    prevProps.reservations.length === nextProps.reservations.length &&
    prevProps.areas.length === nextProps.areas.length
  );
});
```

---

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas (MONGODB_URI, JWT_SECRET)
- [ ] CORS configurado correctamente (orígenes de producción)
- [ ] Índices de MongoDB optimizados (script cleanIndexes ejecutado)
- [ ] Logs de debug removidos (opcional)
- [ ] Endpoints de debug deshabilitados en producción
- [ ] SSL/HTTPS configurado
- [ ] Rate limiting implementado (opcional)
- [ ] Monitoreo de errores (Sentry, LogRocket, etc.)
- [ ] Backups de base de datos configurados
- [ ] Documentación actualizada

---

## 📞 Soporte y Contacto

Para problemas técnicos:
1. Revisar logs de consola (frontend y backend)
2. Verificar Network tab en DevTools
3. Consultar documentación: `ADMIN_RESERVATIONS_GUIDE.md`
4. Ejecutar endpoints de debug en development

---

**Versión:** 1.0.0  
**Fecha:** Diciembre 2024  
**Estado:** ✅ Producción Ready
