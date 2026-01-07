# 📮 30 URIs POSTMAN - BOCATTO RESTAURANT API
## 🌐 URL BASE DE PRODUCCIÓN: `https://bocatto-backend.onrender.com`

---

## 🔐 AUTENTICACIÓN REQUERIDA

**Para endpoints protegidos**, primero debes obtener un token usando las rutas de login:

### 1️⃣ Login Admin
```
POST https://bocatto-backend.onrender.com/api/auth/admin/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "admin@bocatto.com",
  "password": "admin123"
}
```
**Respuesta**: Copia el `token` que recibes

### 2️⃣ Login Cliente
```
POST https://bocatto-backend.onrender.com/api/auth/client/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "cliente@test.com",
  "password": "password123"
}
```
**Respuesta**: Copia el `token` que recibes

---

## 🔑 CONFIGURACIÓN DE TOKEN EN POSTMAN

**Cuando un endpoint requiere autenticación:**
1. Ve a la pestaña **Authorization**
2. Selecciona **Bearer Token**
3. Pega el token que obtuviste del login

---

# 🟢 REGLAS DE NEGOCIO (10 Endpoints)

## 1. 🛒 Agregar Producto al Carrito con Validación de Stock
**Endpoint:** `POST https://bocatto-backend.onrender.com/api/cart/add`

**Autenticación:** Opcional (usa sessionId si no hay login)

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "sessionId": "guest_12345",
  "productId": 1,
  "quantity": 2,
  "customizations": {
    "extras": ["Queso extra", "Tocino"],
    "specialInstructions": "Sin cebolla"
  }
}
```

**Regla de Negocio:**
- Valida que el producto exista y esté disponible
- Verifica stock suficiente antes de agregar
- Calcula precio con customizaciones
- Agrupa items iguales con mismas customizaciones

---

## 2. 💳 Crear Orden desde Carrito (Checkout Completo)
**Endpoint:** `POST https://bocatto-backend.onrender.com/api/orders`

**Autenticación:** ✅ REQUERIDA (Cliente)

**Authorization:** Bearer Token (token de cliente)

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "sessionId": "guest_12345",
  "deliveryType": "dine-in",
  "paymentMethod": "card",
  "customerNotes": "Mesa cerca de la ventana"
}
```

**Reglas de Negocio:**
- Valida carrito no vacío
- Verifica stock de todos los productos nuevamente
- Genera número de orden único
- Calcula tiempo estimado de preparación (30 min)
- Marca carrito como completado
- Evita doble procesamiento

---

## 3. 📅 Crear Reservación con Validaciones de Negocio
**Endpoint:** `POST https://bocatto-backend.onrender.com/reservations`

**Autenticación:** ✅ REQUERIDA (Cliente)

**Authorization:** Bearer Token

**Body (raw JSON):**
```json
{
  "areaId": "675a25d8b35f246748df5b4a",
  "startTime": "2025-12-25T18:00:00.000Z",
  "endTime": "2025-12-25T20:00:00.000Z",
  "guestCount": 4,
  "notes": "Celebración de cumpleaños",
  "paymentMethodSimulated": "card"
}
```

**Reglas de Negocio:**
- Fecha debe ser futura (no pasado)
- Máximo 30 días de anticipación
- Verifica capacidad del área vs guestCount
- Detecta solapamiento de horarios (conflictos)
- Calcula precio por hora automáticamente
- Valida que el área esté activa

---

## 4. ⏰ Verificar Disponibilidad de Área (Anti-colisión)
**Endpoint:** `GET https://bocatto-backend.onrender.com/reservations/availability/675a25d8b35f246748df5b4a?date=2025-12-25`

**Autenticación:** ❌ No requerida (Público)

**Parámetros:**
- `675a25d8b35f246748df5b4a` = ID del área
- `date` = Fecha en formato YYYY-MM-DD

**Regla de Negocio:**
- Retorna franjas horarias ocupadas
- Muestra reservaciones confirmadas y pagadas
- Permite al frontend calcular slots disponibles
- Previene doble reservación

---

## 5. 🎁 Validar Oferta con Restricciones Temporales
**Endpoint:** `GET https://bocatto-backend.onrender.com/offers?active=true&validToday=true`

**Autenticación:** ❌ No requerida (Público)

**Query Params:**
- `active=true` (solo ofertas activas)
- `validToday=true` (válidas HOY según día de semana y hora)

**Reglas de Negocio:**
- Filtra por rango de fechas (startDate - endDate)
- Valida día de la semana (validDays: ["Lunes", "Martes"])
- Verifica hora actual dentro de startTime-endTime
- Controla límite de uso (maxUsage, usageCount)
- Ofertas destacadas (featured) primero

---

## 6. 🚫 Cancelar Reservación con Reglas de Tiempo
**Endpoint:** `DELETE https://bocatto-backend.onrender.com/reservations/675a123example`

**Autenticación:** ✅ REQUERIDA (Cliente)

**Authorization:** Bearer Token

**Sin Body**

**Reglas de Negocio:**
- Solo el usuario propietario puede cancelar
- No se puede cancelar si ya pasó la fecha
- No se puede cancelar reservaciones ya canceladas
- Libera el slot para otros usuarios
- Cambia status a 'cancelled'

---

## 7. 🔔 Advertencias de Alergias en Carrito
**Endpoint:** `GET https://bocatto-backend.onrender.com/api/cart/allergy-warnings`

**Autenticación:** ✅ REQUERIDA (Cliente con alergias guardadas)

**Authorization:** Bearer Token

**Reglas de Negocio:**
- Cruza productos del carrito con alergias del usuario
- Identifica ingredientes peligrosos
- Detecta trazas y contaminación cruzada
- Alerta sobre customizaciones riesgosas
- Sugiere alternativas seguras

---

## 8. 🍽️ Productos Seguros según Alergias del Usuario
**Endpoint:** `GET https://bocatto-backend.onrender.com/api/users/me/safe-products`

**Autenticación:** ✅ REQUERIDA (Cliente)

**Authorization:** Bearer Token

**Reglas de Negocio:**
- Filtra menú completo basado en alergias guardadas
- Excluye productos con alérgenos del usuario
- Considera ingredientes base y extras
- Solo retorna productos disponibles
- Previene reacciones alérgicas

---

## 9. 👨‍🍳 Órdenes Activas para Cocina (Dashboard en Tiempo Real)
**Endpoint:** `GET https://bocatto-backend.onrender.com/api/orders/kitchen/active`

**Autenticación:** ❌ No requerida (Público para pantalla cocina)

**Reglas de Negocio:**
- Filtra solo estados: confirmed, preparing, ready
- Ordena por prioridad y tiempo de espera
- Muestra tiempo desde creación
- Excluye órdenes completadas/canceladas
- Útil para display de cocina

---

## 10. 📊 Actualizar Estado de Orden (Workflow)
**Endpoint:** `PUT https://bocatto-backend.onrender.com/api/orders/675xyz123/status`

**Autenticación:** ✅ REQUERIDA (Admin)

**Authorization:** Bearer Token (admin)

**Body (raw JSON):**
```json
{
  "status": "preparing",
  "staffNotes": "Pedido especial para mesa 5"
}
```

**Status válidos:** `pending` → `confirmed` → `preparing` → `ready` → `delivered` → `cancelled`

**Reglas de Negocio:**
- Solo admin puede cambiar status
- Valida transiciones de estado lógicas
- No permite retroceder estados
- Actualiza timestamps automáticamente
- Notifica cambios al cliente (futuro)

---

# 🔵 ENDPOINTS CRUD Y OTROS (20 Endpoints)

## 11. 🏠 Verificar Estado del Servidor
**Endpoint:** `GET https://bocatto-backend.onrender.com/`

**Autenticación:** ❌ No requerida

**Respuesta esperada:**
```json
{
  "message": "Bienvenido a la API de Bocatto Restaurant",
  "status": "Server is running",
  "version": "1.0.0"
}
```

---

## 12. 📝 Registrar Nuevo Cliente
**Endpoint:** `POST https://bocatto-backend.onrender.com/api/auth/client/register`

**Autenticación:** ❌ No requerida

**Body (raw JSON):**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@test.com",
  "password": "password123",
  "phone": "0999123456",
  "address": "Quito, Ecuador"
}
```

---

## 13. ✅ Verificar Sesión de Cliente
**Endpoint:** `GET https://bocatto-backend.onrender.com/api/auth/client/verify`

**Autenticación:** ✅ REQUERIDA (Cliente)

**Authorization:** Bearer Token

---

## 14. 🚪 Cerrar Sesión Cliente
**Endpoint:** `POST https://bocatto-backend.onrender.com/api/auth/client/logout`

**Autenticación:** ✅ REQUERIDA (Cliente)

**Authorization:** Bearer Token

---

## 15. 🔐 Verificar Sesión Admin
**Endpoint:** `GET https://bocatto-backend.onrender.com/api/auth/admin/verify`

**Autenticación:** ✅ REQUERIDA (Admin)

**Authorization:** Bearer Token (admin)

---

## 16. 🍕 Obtener Todo el Menú
**Endpoint:** `GET https://bocatto-backend.onrender.com/api/menu`

**Autenticación:** ❌ No requerida

**Query Params opcionales:**
- `?category=Platos Principales`
- `?available=true`

---

## 17. 🔍 Obtener Producto por ID
**Endpoint:** `GET https://bocatto-backend.onrender.com/api/menu/1`

**Autenticación:** ❌ No requerida

**Parámetro:** `1` = productId del producto

---

## 18. ➕ Crear Nuevo Producto (Admin)
**Endpoint:** `POST https://bocatto-backend.onrender.com/api/menu`

**Autenticación:** ✅ REQUERIDA (Admin)

**Authorization:** Bearer Token (admin)

**Headers:**
```
Content-Type: multipart/form-data
```

**Form-data:**
```
name: Pizza Margherita
description: Pizza clásica italiana
category: Pizzas
price: 12.50
available: true
file: [Selecciona imagen .jpg/.png]
ingredients: ["Tomate", "Queso mozzarella", "Albahaca"]
allergens: ["Lácteos", "Gluten"]
```

---

## 19. ✏️ Actualizar Producto (Admin)
**Endpoint:** `PUT https://bocatto-backend.onrender.com/api/menu/1`

**Autenticación:** ✅ REQUERIDA (Admin)

**Authorization:** Bearer Token (admin)

**Form-data:**
```
name: Pizza Margherita Deluxe
price: 14.50
available: true
```

---

## 20. 🔄 Toggle Disponibilidad de Producto (Admin)
**Endpoint:** `PATCH https://bocatto-backend.onrender.com/api/menu/1/toggle`

**Autenticación:** ✅ REQUERIDA (Admin)

**Authorization:** Bearer Token (admin)

---

## 21. 🗑️ Eliminar Producto (Admin)
**Endpoint:** `DELETE https://bocatto-backend.onrender.com/api/menu/1`

**Autenticación:** ✅ REQUERIDA (Admin)

**Authorization:** Bearer Token (admin)

---

## 22. 🏢 Obtener Todas las Áreas
**Endpoint:** `GET https://bocatto-backend.onrender.com/areas`

**Autenticación:** ❌ No requerida

**Query Params:**
- `?activeOnly=true` (solo áreas activas)

---

## 23. 🆔 Obtener Área por ID
**Endpoint:** `GET https://bocatto-backend.onrender.com/areas/675a25d8b35f246748df5b4a`

**Autenticación:** ❌ No requerida

---

## 24. ➕ Crear Nueva Área (Admin)
**Endpoint:** `POST https://bocatto-backend.onrender.com/areas`

**Autenticación:** ✅ REQUERIDA (Admin)

**Authorization:** Bearer Token (admin)

**Form-data:**
```
name: Terraza VIP
description: Área al aire libre con vista
capacity: 20
pricePerHour: 50
amenities: ["WiFi", "Aire acondicionado", "Música"]
file: [imagen del área]
```

---

## 25. 🔄 Toggle Estado de Área (Admin)
**Endpoint:** `PATCH https://bocatto-backend.onrender.com/areas/675a25d8b35f246748df5b4a/toggle-status`

**Autenticación:** ✅ REQUERIDA (Admin)

**Authorization:** Bearer Token (admin)

---

## 26. 🛍️ Ver Carrito Actual
**Endpoint:** `POST https://bocatto-backend.onrender.com/api/cart/get`

**Autenticación:** Opcional

**Body (raw JSON):**
```json
{
  "sessionId": "guest_12345"
}
```

---

## 27. ♻️ Actualizar Cantidad en Carrito
**Endpoint:** `PUT https://bocatto-backend.onrender.com/api/cart/update`

**Autenticación:** Opcional

**Body (raw JSON):**
```json
{
  "sessionId": "guest_12345",
  "productId": 1,
  "quantity": 3
}
```

---

## 28. ❌ Eliminar Item del Carrito
**Endpoint:** `DELETE https://bocatto-backend.onrender.com/api/cart/remove`

**Autenticación:** Opcional

**Body (raw JSON):**
```json
{
  "sessionId": "guest_12345",
  "productId": 1
}
```

---

## 29. 🧹 Limpiar Carrito Completo
**Endpoint:** `DELETE https://bocatto-backend.onrender.com/api/cart/clear`

**Autenticación:** Opcional

**Body (raw JSON):**
```json
{
  "sessionId": "guest_12345"
}
```

---

## 30. 📦 Ver Mis Órdenes (Cliente)
**Endpoint:** `GET https://bocatto-backend.onrender.com/api/orders/my-orders?status=pending&limit=10`

**Autenticación:** ✅ REQUERIDA (Cliente)

**Authorization:** Bearer Token

**Query Params:**
- `status=pending` (opcional: pending, confirmed, preparing, ready, delivered, completed, cancelled)
- `limit=10` (número de órdenes a retornar)

---

## 📌 NOTAS IMPORTANTES

### 🔴 El servidor en Render puede tardar 30-60 segundos en despertar si estuvo inactivo
Si obtienes error de timeout, espera 1 minuto y vuelve a intentar.

### 🟢 Orden de Prueba Recomendado
1. **Primero:** Prueba login admin y cliente
2. **Segundo:** Verifica que el servidor responda con GET /
3. **Tercero:** Prueba endpoints públicos (menú, áreas, ofertas)
4. **Cuarto:** Prueba flujo de compra (carrito → orden)
5. **Quinto:** Prueba flujo de reservación

### 🛠️ Tips para Postman
- Crea un **Environment** con variable `base_url = https://bocatto-backend.onrender.com`
- Guarda los tokens en variables de entorno para reutilizarlos
- Usa **Collections** para organizar los 30 endpoints
- Guarda ejemplos de respuestas exitosas

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Login Admin funciona
- [ ] Login Cliente funciona
- [ ] Token se guarda correctamente
- [ ] Endpoints públicos responden sin token
- [ ] Endpoints protegidos rechazan sin token
- [ ] CRUD de productos funciona (Admin)
- [ ] Flujo de carrito → orden funciona
- [ ] Flujo de reservación funciona
- [ ] Validaciones de negocio se ejecutan
- [ ] Mensajes de error son claros

---

**🎉 ¡Listo para probar! Importa esta guía en Postman y comienza las pruebas.**
