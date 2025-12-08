# API de Reservaciones - Documentación Completa

## Tabla de Contenidos
1. [Endpoints Públicos](#endpoints-públicos)
2. [Endpoints Protegidos (Cliente)](#endpoints-protegidos-cliente)
3. [Endpoints Administrativos](#endpoints-administrativos)
4. [Reglas de Negocio](#reglas-de-negocio)
5. [Estructura de Datos](#estructura-de-datos)
6. [Códigos de Error](#códigos-de-error)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Base URL
- **Desarrollo**: `http://localhost:5000`
- **Producción**: `https://bocatto.onrender.com`

**Nota**: Las rutas de reservaciones NO usan el prefijo `/api/`, acceso directo desde `/reservations`

---

## Endpoints Públicos

### 1. Verificar Disponibilidad

```
GET /reservations/availability/:areaId?date=YYYY-MM-DD
```

**Descripción**: Obtiene las franjas horarias reservadas para un área específica en una fecha dada.

**Parámetros URL**:
- `areaId` (required): ID del área/ambiente

**Query Parameters**:
- `date` (required): Fecha en formato `YYYY-MM-DD`

**Ejemplo Request**:
```javascript
fetch('http://localhost:5000/reservations/availability/64abc123...?date=2024-12-25')
```

**Response 200**:
```json
{
  "success": true,
  "date": "2024-12-25",
  "areaName": "Terraza Privada",
  "reservedSlots": [
    {
      "start": "2024-12-25T18:00:00.000Z",
      "end": "2024-12-25T20:00:00.000Z",
      "status": "paid"
    },
    {
      "start": "2024-12-25T21:00:00.000Z",
      "end": "2024-12-25T23:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

**Errores**:
- `400`: Fecha no proporcionada o formato inválido
- `404`: Área no encontrada

---

## Endpoints Protegidos (Cliente)

**Autenticación**: Todos los endpoints requieren cookie JWT válida (`token`)

### 2. Crear Reservación

```
POST /reservations
```

**Descripción**: Crea una nueva reservación con validaciones de negocio.

**Headers**:
```
Content-Type: application/json
Cookie: token=<JWT>
```

**Body**:
```json
{
  "areaId": "64abc123...",
  "startTime": "2024-12-25T18:00:00.000Z",
  "endTime": "2024-12-25T20:00:00.000Z",
  "guestCount": 4,
  "notes": "Celebración de cumpleaños",
  "paymentMethodSimulated": "card"
}
```

**Campos**:
- `areaId` (required): ID del área/ambiente
- `startTime` (required): Fecha y hora de inicio (ISO 8601)
- `endTime` (required): Fecha y hora de fin (ISO 8601)
- `guestCount` (required): Número de invitados (integer ≥ 1)
- `notes` (optional): Notas adicionales (máx. 500 caracteres)
- `paymentMethodSimulated` (optional): `"cash"`, `"card"`, o `"transfer"` (default: `"card"`)

**Validaciones Automáticas**:
- ✅ Fecha de inicio debe ser futura
- ✅ Fecha de fin debe ser posterior a inicio
- ✅ Máximo 30 días de anticipación
- ✅ No solapamiento con otras reservaciones activas
- ✅ `guestCount` debe estar entre `minCapacity` y `maxCapacity` del área
- ✅ Área debe estar activa (`isActive: true`)
- ✅ Cálculo automático de `totalPrice`: $5 base + $2.50/hora adicional

**Response 201**:
```json
{
  "success": true,
  "message": "Reservación creada exitosamente",
  "reservation": {
    "id": "64def456...",
    "area": {
      "name": "Terraza Privada",
      "description": "...",
      "imageUrl": "https://...",
      "minCapacity": 2,
      "maxCapacity": 8
    },
    "user": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com"
    },
    "startTime": "2024-12-25T18:00:00.000Z",
    "endTime": "2024-12-25T20:00:00.000Z",
    "totalPrice": 7.5,
    "guestCount": 4,
    "status": "pending",
    "notes": "Celebración de cumpleaños",
    "paymentMethodSimulated": "card",
    "createdAt": "2024-12-15T10:30:00.000Z"
  }
}
```

**Errores**:
- `400`: Validación fallida (campos faltantes, fechas inválidas, capacidad excedida, fecha > 30 días)
- `404`: Área no encontrada
- `409`: Conflicto - ya existe reservación en ese horario

---

### 3. Obtener Mis Reservaciones

```
GET /reservations/my-reservations?status=pending&upcoming=true
```

**Descripción**: Lista todas las reservaciones del usuario autenticado.

**Query Parameters** (opcionales):
- `status`: Filtrar por estado (`pending`, `paid`, `cancelled`, `expired`)
- `upcoming`: `true` para mostrar solo reservaciones futuras

**Response 200**:
```json
{
  "success": true,
  "count": 3,
  "reservations": [
    {
      "_id": "64def456...",
      "area": {
        "name": "Salón Principal",
        "imageUrl": "https://..."
      },
      "startTime": "2024-12-25T18:00:00.000Z",
      "endTime": "2024-12-25T20:00:00.000Z",
      "totalPrice": 7.5,
      "guestCount": 4,
      "status": "paid",
      "createdAt": "2024-12-15T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Obtener Reservación por ID

```
GET /reservations/:id
```

**Descripción**: Obtiene detalles de una reservación específica. Solo el propietario o admin puede acceder.

**Response 200**:
```json
{
  "success": true,
  "reservation": {
    "_id": "64def456...",
    "area": {
      "name": "Terraza Privada",
      "features": ["WiFi", "Aire Acondicionado"]
    },
    "user": {
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "startTime": "2024-12-25T18:00:00.000Z",
    "endTime": "2024-12-25T20:00:00.000Z",
    "totalPrice": 7.5,
    "status": "paid"
  }
}
```

**Errores**:
- `404`: Reservación no encontrada
- `403`: No autorizado (no es el propietario ni admin)

---

### 5. Cancelar Reservación

```
DELETE /reservations/:id
```

**Descripción**: Cancela una reservación. Solo el propietario puede cancelar antes de la hora de inicio.

**Restricciones**:
- Solo reservaciones `pending` o `paid`
- No puede haberse iniciado aún (`startTime > now`)

**Response 200**:
```json
{
  "success": true,
  "message": "Reservación cancelada exitosamente",
  "reservation": {
    "id": "64def456...",
    "status": "cancelled"
  }
}
```

**Errores**:
- `404`: Reservación no encontrada
- `403`: No autorizado
- `400`: Ya cancelada, expirada, o ya comenzó

---

### 6. Confirmar Pago (Simulado)

```
POST /reservations/:id/confirm-payment
```

**Descripción**: Simula confirmación de pago, cambiando estado de `pending` a `paid`.

**Response 200**:
```json
{
  "success": true,
  "message": "Pago confirmado exitosamente",
  "reservation": {
    "id": "64def456...",
    "area": { "name": "..." },
    "totalPrice": 7.5,
    "status": "paid"
  }
}
```

**Errores**:
- `404`: Reservación no encontrada
- `403`: No es el propietario
- `400`: Ya pagada, cancelada o expirada

---

## Endpoints Administrativos

**Autenticación**: Requiere cookie JWT con `role: 'admin'`

### 7. Obtener Todas las Reservaciones (Admin)

```
GET /reservations/admin/all?status=paid&areaId=64abc...&startDate=2024-12-01&endDate=2024-12-31
```

**Query Parameters** (opcionales):
- `status`: Filtrar por estado
- `areaId`: Filtrar por área específica
- `startDate`: Fecha de inicio del rango (YYYY-MM-DD)
- `endDate`: Fecha de fin del rango (YYYY-MM-DD)

**Response 200**:
```json
{
  "success": true,
  "count": 150,
  "reservations": [
    {
      "_id": "...",
      "area": { "name": "..." },
      "user": {
        "firstName": "María",
        "email": "maria@example.com",
        "phone": "+593..."
      },
      "startTime": "...",
      "status": "paid",
      "totalPrice": 10
    }
  ]
}
```

---

### 8. Cancelar Reservación (Admin)

```
DELETE /reservations/:id/admin-cancel
```

**Descripción**: Admin puede cancelar cualquier reservación sin restricciones (incluso si ya comenzó o está pagada).

**Response 200**:
```json
{
  "success": true,
  "message": "Reservación cancelada por administrador",
  "reservation": {
    "id": "64def456...",
    "status": "cancelled"
  }
}
```

---

## Reglas de Negocio

### Validaciones de Fecha y Hora

1. **Fecha Futura**: `startTime` debe ser mayor que la fecha/hora actual
2. **Rango Válido**: `endTime` debe ser mayor que `startTime`
3. **Anticipación Máxima**: Solo se puede reservar con máximo **30 días** de anticipación
4. **No Solapamiento**: No pueden existir 2 reservaciones activas (`pending` o `paid`) para la misma área con horarios que se solapen

**Lógica de Solapamiento**:
```
Reservación A solapa con Reservación B si:
  A.startTime < B.endTime AND A.endTime > B.startTime
```

### Capacidad

- `guestCount` debe estar entre `area.minCapacity` y `area.maxCapacity`
- Validación automática al crear reservación

### Precio

**Fórmula**:
```
Duración en horas = Math.ceil((endTime - startTime) / 3600000)
Precio = $5.00 (primera hora) + $2.50 × (horas adicionales)
```

**Ejemplos**:
- 1 hora: $5.00
- 1.5 horas: $7.50 (se redondea a 2 horas)
- 3 horas: $10.00

### Estados de Reservación

| Estado | Descripción | Transiciones Permitidas |
|--------|-------------|------------------------|
| `pending` | Creada, esperando pago | → `paid` (confirmar pago)<br>→ `cancelled` (cancelar)<br>→ `expired` (automático) |
| `paid` | Pago confirmado | → `cancelled` (solo admin) |
| `cancelled` | Cancelada | (estado final) |
| `expired` | Expiró sin pago | (estado final) |

**Expiración Automática**:
- Una reservación `pending` expira automáticamente cuando `endTime` < fecha actual
- Método modelo: `reservation.isExpired()` devuelve `true` si expiró

---

## Estructura de Datos

### Modelo Reservation

```javascript
{
  user: ObjectId,              // Referencia a User
  area: ObjectId,              // Referencia a Area
  startTime: Date,             // Fecha/hora inicio (required)
  endTime: Date,               // Fecha/hora fin (required)
  totalPrice: Number,          // Precio total ≥ $5 (required)
  status: String,              // 'pending' | 'paid' | 'cancelled' | 'expired'
  guestCount: Number,          // Número de invitados ≥ 1 (required)
  notes: String,               // Notas opcionales (max 500 chars)
  paymentMethodSimulated: String, // 'cash' | 'card' | 'transfer'
  createdAt: Date,             // Auto-generado
  updatedAt: Date              // Auto-generado
}
```

### Virtual Field

```javascript
reservation.durationHours  // Duración calculada en horas (getter)
```

### Instance Methods

```javascript
await reservation.isExpired()  
// Returns: true si endTime < now y status === 'pending'
```

### Static Methods

```javascript
// Encuentra reservaciones que se solapan
const overlapping = await Reservation.findOverlapping(
  areaId,           // ID del área
  startTime,        // Fecha inicio propuesta
  endTime,          // Fecha fin propuesta
  excludeId         // (opcional) Excluir esta reservación del check
);

// Calcula precio automáticamente
const price = Reservation.calculatePrice(startTime, endTime);
// Returns: Number (ej: 7.5)
```

---

## Códigos de Error

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | OK | Operación exitosa |
| `201` | Created | Reservación creada exitosamente |
| `400` | Bad Request | Validación fallida, datos inválidos |
| `401` | Unauthorized | No autenticado (falta token JWT) |
| `403` | Forbidden | No autorizado (no es propietario o no es admin) |
| `404` | Not Found | Reservación o área no encontrada |
| `409` | Conflict | Conflicto de horario (solapamiento) |
| `500` | Server Error | Error interno del servidor |

---

## Ejemplos de Uso

### Ejemplo 1: Crear Reservación Completa

```javascript
import { createReservation } from '@/lib/api';

try {
  const result = await createReservation({
    areaId: '675e9a1b2c3d4e5f6a7b8c9d',
    startTime: '2024-12-25T18:00:00.000Z',
    endTime: '2024-12-25T20:30:00.000Z',  // 2.5 horas
    guestCount: 6,
    notes: 'Celebración familiar, necesitamos sillas para niños',
    paymentMethodSimulated: 'card'
  });

  console.log('Reservación creada:', result.reservation.id);
  console.log('Precio total:', result.reservation.totalPrice); // $10.00
} catch (error) {
  console.error('Error:', error.message);
  // Manejo de errores específicos
  if (error.message.includes('solapamiento')) {
    alert('Ya existe una reservación en ese horario');
  }
}
```

### Ejemplo 2: Verificar Disponibilidad Antes de Reservar

```javascript
import { checkAvailability } from '@/lib/api';

const areaId = '675e9a1b2c3d4e5f6a7b8c9d';
const date = '2024-12-25';

try {
  const availability = await checkAvailability(areaId, date);
  
  console.log('Franjas reservadas:');
  availability.reservedSlots.forEach(slot => {
    const start = new Date(slot.start).toLocaleTimeString();
    const end = new Date(slot.end).toLocaleTimeString();
    console.log(`${start} - ${end} (${slot.status})`);
  });

  // Puedes usar esta info para mostrar un calendario visual
} catch (error) {
  console.error('Error:', error);
}
```

### Ejemplo 3: Listar Mis Reservaciones Futuras

```javascript
import { getMyReservations } from '@/lib/api';

try {
  const result = await getMyReservations({ 
    upcoming: true,
    status: 'paid'  // Solo reservaciones confirmadas
  });

  console.log(`Tienes ${result.count} reservaciones próximas:`);
  result.reservations.forEach(res => {
    console.log(`- ${res.area.name} el ${new Date(res.startTime).toLocaleDateString()}`);
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Ejemplo 4: Cancelar Reservación

```javascript
import { cancelReservation } from '@/lib/api';

const reservationId = '675e9a1b2c3d4e5f6a7b8c9d';

try {
  const result = await cancelReservation(reservationId);
  console.log('Reservación cancelada exitosamente');
  // Actualizar UI
} catch (error) {
  if (error.message.includes('comenzó')) {
    alert('No puedes cancelar una reservación que ya comenzó');
  }
}
```

### Ejemplo 5: Confirmar Pago

```javascript
import { confirmPayment } from '@/lib/api';

const reservationId = '675e9a1b2c3d4e5f6a7b8c9d';

try {
  const result = await confirmPayment(reservationId);
  console.log('Pago confirmado. Total:', result.reservation.totalPrice);
  // Redirigir a página de confirmación
} catch (error) {
  console.error('Error al confirmar pago:', error);
}
```

### Ejemplo 6: Admin - Ver Todas las Reservaciones del Día

```javascript
import { getAllReservations } from '@/lib/api';

const today = new Date().toISOString().split('T')[0];

try {
  const result = await getAllReservations({
    startDate: today,
    endDate: today
  });

  console.log(`Reservaciones de hoy: ${result.count}`);
  
  // Agrupar por área
  const byArea = {};
  result.reservations.forEach(res => {
    const areaName = res.area.name;
    if (!byArea[areaName]) byArea[areaName] = [];
    byArea[areaName].push(res);
  });

  Object.entries(byArea).forEach(([area, reservations]) => {
    console.log(`${area}: ${reservations.length} reservaciones`);
  });
} catch (error) {
  console.error('Error:', error);
}
```

---

## Testing Checklist

### ✅ Validaciones de Fecha

- [ ] Intentar reservar en fecha pasada → Error 400
- [ ] Intentar reservar con más de 30 días de anticipación → Error 400
- [ ] `endTime` <= `startTime` → Error 400
- [ ] Fechas válidas → Success 201

### ✅ Validación de Solapamiento

- [ ] Reservar mismo horario exacto → Error 409
- [ ] Reservar horario que solapa parcialmente → Error 409
- [ ] Reservar horario libre → Success 201
- [ ] Actualizar reservación sin solapar con otras → Success 200

### ✅ Validación de Capacidad

- [ ] `guestCount` < `minCapacity` → Error 400
- [ ] `guestCount` > `maxCapacity` → Error 400
- [ ] `guestCount` válido → Success 201

### ✅ Cálculo de Precio

- [ ] 1 hora → $5.00
- [ ] 1 hora 30 minutos → $7.50 (redondea a 2 horas)
- [ ] 3 horas → $10.00

### ✅ Estados y Transiciones

- [ ] Crear reservación → status = 'pending'
- [ ] Confirmar pago → status = 'paid'
- [ ] Cancelar como cliente → status = 'cancelled' (solo antes de inicio)
- [ ] Cancelar como admin → status = 'cancelled' (en cualquier momento)

### ✅ Autorización

- [ ] Cliente puede ver solo sus reservaciones
- [ ] Cliente no puede ver reservaciones de otros
- [ ] Admin puede ver todas las reservaciones
- [ ] Cliente no puede acceder endpoints admin → Error 403

### ✅ Disponibilidad

- [ ] Endpoint público accesible sin autenticación
- [ ] Muestra solo reservaciones activas (pending/paid)
- [ ] No muestra reservaciones canceladas o expiradas

---

## Notas Adicionales

### Timezone Considerations

- Todas las fechas se almacenan en UTC en MongoDB
- El frontend debe convertir a timezone local del usuario al mostrar
- Al enviar fechas al backend, usar formato ISO 8601 con timezone: `2024-12-25T18:00:00.000Z`

### Seguridad

- **NUNCA** confíes en el frontend para validaciones críticas
- Todas las reglas de negocio se validan en el backend
- JWT cookie con HTTPOnly previene XSS
- Middleware `authenticateToken` protege todos los endpoints sensibles
- Middleware `isAdmin` valida permisos administrativos

### Performance

- Índices MongoDB configurados:
  - `{ user: 1, createdAt: -1 }` → Consultas por usuario
  - `{ area: 1, status: 1 }` → Filtros por área y estado
  - `{ startTime: 1, endTime: 1 }` → Búsqueda de solapamientos
  - `{ status: 1, endTime: 1 }` → Limpieza de expirados

### Próximos Pasos (Frontend)

1. **Formulario de Reservación**: Componente con selección de fecha/hora y área
2. **Calendario de Disponibilidad**: Vista visual de franjas horarias libres/ocupadas
3. **Panel de Usuario**: Lista de reservaciones con acciones (cancelar, pagar)
4. **Panel Admin**: Dashboard de reservaciones con filtros y estadísticas
5. **Notificaciones**: Alertas cuando una reservación está por comenzar

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Colección MongoDB**: `reservacions` (FastFoodApp database)
