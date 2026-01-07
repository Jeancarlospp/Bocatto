# ✅ Sistema de ID Incremental Actualizado

Se ha actualizado TODO el sistema para usar el campo `id` incremental en lugar del `_id` de MongoDB.

## 🔄 Cambios Realizados

### 1. **Modelo User**
- ✅ Agregado campo `id` numérico único y autoincremental
- ✅ Middleware que asigna automáticamente el ID a nuevos usuarios
- ✅ Sistema de contador (Counter collection) para autoincrementar

### 2. **Middleware de Autenticación**
- ✅ `authenticateToken` ahora busca usuarios por `id` incremental
- ✅ JWT contiene `userId` con el `id` incremental (no `_id`)

### 3. **Controllers Actualizados**
- ✅ `authController.js` - Login, registro, verificación de sesión
- ✅ `allergyController.js` - Manejo de alergias
- ✅ `orderController.js` - Creación y consulta de órdenes
- ✅ `reservationController.js` - Reservaciones
- ✅ `cartController.js` - Carrito de compras
- ✅ `customizationController.js` - Personalización de productos

## 📋 URIs de Producción para Pruebas

**Base URL:** `https://bocatto.onrender.com`

### 🔐 Autenticación

#### 1. Login de Admin
```http
POST https://bocatto.onrender.com/api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@bocatto.com",
  "password": "tu_contraseña"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": 1,
    "firstName": "Admin",
    "lastName": "Bocatto",
    "email": "admin@bocatto.com",
    "role": "admin",
    "adminAcceso": "SUPER_ADMIN"
  }
}
```

#### 2. Login de Cliente
```http
POST https://bocatto.onrender.com/api/auth/client/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "contraseña"
}
```

#### 3. Registro de Cliente
```http
POST https://bocatto.onrender.com/api/auth/client/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "0999999999",
  "address": "Quito, Ecuador"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Registro exitoso.",
  "user": {
    "id": 5,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "role": "client",
    "loyaltyPoints": 0
  }
}
```

#### 4. Verificar Sesión de Admin
```http
GET https://bocatto.onrender.com/api/auth/admin/verify
Cookie: token=<jwt_token>
```

#### 5. Verificar Sesión de Cliente
```http
GET https://bocatto.onrender.com/api/auth/client/verify
Cookie: token=<jwt_token>
```

#### 6. Obtener Usuario por ID (NUEVA)
```http
GET https://bocatto.onrender.com/api/auth/users/1
Cookie: token=<jwt_token>
```
*Nota: Puede usar ID incremental (1, 2, 3) o MongoDB ObjectId*

**Respuesta exitosa:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "firstName": "Admin",
    "lastName": "Bocatto",
    "email": "admin@bocatto.com",
    "role": "admin",
    "phone": "0993045178",
    "address": "Quito, Ecuador",
    "isActive": true,
    "loyaltyPoints": 0,
    "lastLogin": "2026-01-05T01:41:24.607Z",
    "acceso": "FULL_ACCESS",
    "adminAcceso": "SUPER_ADMIN",
    "allergies": [],
    "createdAt": "2025-12-07T18:37:47.524Z",
    "updatedAt": "2026-01-05T01:41:24.608Z"
  }
}
```

### 🍔 Órdenes

#### 1. Crear Orden
```http
POST https://bocatto.onrender.com/api/orders
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "deliveryType": "delivery",
  "paymentMethod": "cash",
  "customerNotes": "Sin cebolla",
  "sessionId": "session_123"
}
```

#### 2. Obtener Mis Órdenes
```http
GET https://bocatto.onrender.com/api/orders/my-orders
Cookie: token=<jwt_token>
```

#### 3. Obtener Orden por ID
```http
GET https://bocatto.onrender.com/api/orders/ORDER_ID
Cookie: token=<jwt_token>
```

### 📅 Reservaciones

#### 1. Crear Reservación
```http
POST https://bocatto.onrender.com/api/reservations
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "areaId": "AREA_MONGO_ID",
  "startTime": "2026-01-10T18:00:00.000Z",
  "endTime": "2026-01-10T20:00:00.000Z",
  "guestCount": 4,
  "notes": "Mesa cerca de la ventana",
  "paymentMethodSimulated": "credit_card"
}
```

#### 2. Obtener Mis Reservaciones
```http
GET https://bocatto.onrender.com/api/reservations/my-reservations
Cookie: token=<jwt_token>
```

#### 3. Obtener Reservación por ID
```http
GET https://bocatto.onrender.com/api/reservations/RESERVATION_ID
Cookie: token=<jwt_token>
```

#### 4. Cancelar Reservación
```http
DELETE https://bocatto.onrender.com/api/reservations/RESERVATION_ID/cancel
Cookie: token=<jwt_token>
```

### 🧪 Alergias

#### 1. Guardar Alergias del Usuario
```http
POST https://bocatto.onrender.com/api/allergies/user/allergies
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "allergies": [
    {
      "allergen": "gluten",
      "severity": "high"
    },
    {
      "allergen": "lactosa",
      "severity": "medium"
    }
  ]
}
```

#### 2. Obtener Alergias del Usuario
```http
GET https://bocatto.onrender.com/api/allergies/user/allergies
Cookie: token=<jwt_token>
```

## 🔑 Notas Importantes

### JWT (Token)
- El JWT ahora contiene `userId` con el **ID incremental** (1, 2, 3, etc.)
- El token se envía automáticamente en las cookies como `token`
- Ya NO se usa el `_id` de MongoDB en ninguna parte del sistema

### Autenticación
- Todos los endpoints protegidos requieren el token JWT en las cookies
- El middleware busca usuarios usando el `id` incremental
- Las comparaciones de usuario ahora usan `user.id` en lugar de `user._id`

### Migración de Datos
- Se ejecutó el script de migración para asignar IDs a usuarios existentes
- Los usuarios nuevos reciben automáticamente un ID incremental
- El contador se guarda en la colección `counters` con `_id: "userId"`

## ✅ Verificación

Para verificar que todo funciona correctamente:

1. **Hacer login** (admin o cliente)
2. **Obtener el usuario por ID** usando el endpoint `/api/auth/users/1`
3. **Crear una orden o reservación** - verificar que se asocia correctamente con el usuario
4. **Consultar mis órdenes/reservaciones** - verificar que solo se devuelven las del usuario actual

## 🚨 Importante para el Frontend

Si el frontend usa el campo `_id`, debe actualizarse para usar `id`:

```javascript
// ANTES
const userId = user._id;

// AHORA
const userId = user.id;
```

## 🔧 Comandos Útiles

### Ejecutar migración de IDs (si es necesario)
```bash
cd backend
node scripts/migrateUserIds.js
```

### Verificar usuarios en MongoDB
Todos los usuarios deberían tener un campo `id` numérico único.
