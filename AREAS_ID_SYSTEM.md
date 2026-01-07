# ✅ Sistema de ID Incremental para Areas - COMPLETADO

Se ha actualizado TODO el sistema de Areas para usar el campo `id` incremental en lugar del `_id` de MongoDB.

## 🔄 Cambios Realizados

### 1. **Modelo Area**
- ✅ Campo `id` numérico único agregado
- ✅ Sistema de contador (Counter collection) para autoincrementar
- ✅ Middleware pre-save que asigna ID automáticamente

### 2. **Modelo Reservation**
- ✅ Campo `user` ahora usa Number (id incremental) en lugar de ObjectId
- ✅ Campo `area` ahora usa Number (id incremental) en lugar de ObjectId
- ✅ Eliminadas las referencias de Mongoose (ref: 'User', ref: 'Area')

### 3. **Controllers Actualizados**

#### **areaController.js**
- ✅ `getAreaById` - Busca por id incremental o _id de MongoDB
- ✅ `updateArea` - Busca por id incremental o _id de MongoDB
- ✅ `deleteArea` - Busca por id incremental o _id de MongoDB
- ✅ `toggleAreaStatus` - Busca por id incremental o _id de MongoDB

#### **reservationController.js**
- ✅ Funciones helper `populateReservation` y `populateReservations` para populate manual
- ✅ `createReservation` - Usa `area.id` incremental en lugar de ObjectId
- ✅ `getMyReservations` - Populate manual de area y user
- ✅ `getReservationById` - Populate manual de area y user
- ✅ `confirmPayment` - Populate manual de area y user
- ✅ `getAllReservations` - Populate manual de area y user
- ✅ `getAvailability` - Busca área por id incremental

### 4. **Scripts de Migración**
- ✅ `migrateAreaIds.js` - Para migrar áreas existentes

## 📋 URIs de Producción para Probar

**Base URL:** `https://bocatto.onrender.com`

### 🏢 **Areas (Ambientes)**

#### 1. Obtener Todas las Áreas
```http
GET https://bocatto.onrender.com/api/areas
```

#### 2. Obtener Área por ID
```http
GET https://bocatto.onrender.com/api/areas/1
```
*Nota: Puede usar ID incremental (1, 2, 3) o MongoDB ObjectId*

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Salón Principal",
    "description": "Ambiente elegante y espacioso...",
    "minCapacity": 2,
    "maxCapacity": 12,
    "features": ["Wi-Fi", "Aire acondicionado", "Vista panorámica", "Decoración moderna"],
    "imageUrl": "https://...",
    "isActive": true,
    "createdAt": "2025-12-07T21:42:57.293Z",
    "updatedAt": "2025-12-07T21:54:25.590Z"
  }
}
```

#### 3. Crear Área (Admin)
```http
POST https://bocatto.onrender.com/api/areas
Cookie: token=<admin_jwt_token>
Content-Type: application/json

{
  "name": "Terraza Privada",
  "description": "Espacio exclusivo al aire libre",
  "minCapacity": 2,
  "maxCapacity": 8,
  "features": ["Vista panorámica", "Aire libre"]
}
```

#### 4. Actualizar Área (Admin)
```http
PUT https://bocatto.onrender.com/api/areas/1
Cookie: token=<admin_jwt_token>
Content-Type: application/json

{
  "name": "Salón Principal Renovado",
  "maxCapacity": 15
}
```

#### 5. Eliminar Área - Soft Delete (Admin)
```http
DELETE https://bocatto.onrender.com/api/areas/1
Cookie: token=<admin_jwt_token>
```

#### 6. Toggle Estado de Área (Admin)
```http
PATCH https://bocatto.onrender.com/api/areas/1/toggle-status
Cookie: token=<admin_jwt_token>
```

### 📅 **Reservaciones**

#### 1. Crear Reservación
```http
POST https://bocatto.onrender.com/api/reservations
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "areaId": 1,
  "startTime": "2026-01-15T18:00:00.000Z",
  "endTime": "2026-01-15T20:00:00.000Z",
  "guestCount": 4,
  "notes": "Mesa cerca de la ventana",
  "paymentMethodSimulated": "credit_card"
}
```

**Nota Importante:** Ahora `areaId` puede ser:
- ID incremental: `1`, `2`, `3`
- MongoDB ObjectId: `6935f4e1539161bedede49`

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Reservación creada exitosamente",
  "reservation": {
    "id": "67a0...",
    "area": {
      "id": 1,
      "name": "Salón Principal",
      "description": "...",
      "imageUrl": "...",
      "minCapacity": 2,
      "maxCapacity": 12
    },
    "user": {
      "id": 2,
      "firstName": "Cliente",
      "lastName": "Ejemplo",
      "email": "cliente@example.com"
    },
    "startTime": "2026-01-15T18:00:00.000Z",
    "endTime": "2026-01-15T20:00:00.000Z",
    "totalPrice": 10,
    "guestCount": 4,
    "status": "pending",
    "notes": "Mesa cerca de la ventana",
    "createdAt": "2026-01-07T..."
  }
}
```

#### 2. Obtener Mis Reservaciones
```http
GET https://bocatto.onrender.com/api/reservations/my-reservations
Cookie: token=<jwt_token>
```

#### 3. Obtener Reservación por ID
```http
GET https://bocatto.onrender.com/api/reservations/RESERVATION_MONGO_ID
Cookie: token=<jwt_token>
```

#### 4. Obtener Disponibilidad de un Área
```http
GET https://bocatto.onrender.com/api/reservations/availability/1?date=2026-01-15
```
*Nota: Ahora puedes usar el ID incremental (1) en lugar del ObjectId*

#### 5. Todas las Reservaciones (Admin)
```http
GET https://bocatto.onrender.com/api/reservations?status=paid&areaId=1
Cookie: token=<admin_jwt_token>
```
*Nota: `areaId` puede ser ID incremental*

#### 6. Confirmar Pago
```http
POST https://bocatto.onrender.com/api/reservations/RESERVATION_ID/confirm-payment
Cookie: token=<jwt_token>
```

#### 7. Cancelar Reservación
```http
DELETE https://bocatto.onrender.com/api/reservations/RESERVATION_ID/cancel
Cookie: token=<jwt_token>
```

## 🔑 Cambios Importantes

### **Modelo Reservation**
Ahora almacena IDs incrementales en lugar de ObjectIds:

```javascript
// ANTES
{
  user: ObjectId("6935c97b8831ada3499cfb32"),
  area: ObjectId("6935f4e1539161bedede49")
}

// AHORA
{
  user: 1,  // ID incremental del usuario
  area: 1   // ID incremental del área
}
```

### **Populate Manual**
Ya no se usa `.populate()` de Mongoose. Se hace populate manual:

```javascript
// Función helper
const populateReservation = async (reservation) => {
  const area = await Area.findOne({ id: reservation.area });
  const user = await User.findOne({ id: reservation.user });
  
  return {
    ...reservation,
    area: area,
    user: user
  };
};
```

### **Queries de Área**
Los controladores ahora aceptan tanto ID incremental como ObjectId:

```javascript
// Por ID incremental
GET /api/areas/1

// Por MongoDB ObjectId
GET /api/areas/6935f4e1539161bedede49
```

## 🚀 Migración de Datos

### **Ejecutar migración de Areas:**
```bash
cd backend
node scripts/migrateAreaIds.js
```

### **Ejecutar migración de Reservations:**
Necesitarás actualizar las reservaciones existentes para que usen IDs incrementales.
**ADVERTENCIA:** Esto modificará todas las reservaciones existentes.

## ✅ Verificación

1. **Crear un área nueva** - Verificar que recibe `id` incremental automáticamente
2. **Obtener área por ID incremental** - `GET /api/areas/1`
3. **Crear una reservación** - Usar `areaId: 1` en lugar de ObjectId
4. **Consultar reservación** - Verificar que area y user se populan correctamente

## 🎯 Próximos Pasos

Si necesitas aplicar el mismo patrón a otras colecciones:
- **Products** (productos del menú)
- **Orders** (órdenes)
- **Offers** (ofertas)
- **Carts** (carritos)

Usa el mismo proceso:
1. Agregar campo `id` al modelo
2. Agregar middleware pre-save
3. Actualizar controladores para buscar por `id`
4. Crear script de migración
5. Si hay relaciones, cambiar ObjectId a Number
