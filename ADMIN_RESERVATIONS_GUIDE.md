# 🎯 Guía del Panel de Administración - Reservaciones

## Descripción General

El panel de administración de reservaciones permite gestionar todas las reservas del sistema en tiempo real, con capacidades de filtrado avanzado y visualización de disponibilidad por ambiente.

---

## 🚀 Funcionalidades Implementadas

### 1. **Vista Principal de Reservaciones**
- **Ruta:** `/admin/reservations`
- **Acceso:** Solo administradores autenticados
- **Endpoint Backend:** `GET /reservations/admin/all`

#### Información Mostrada:
- Nombre completo del cliente
- Email del cliente
- Nombre del ambiente reservado
- Capacidad del ambiente
- Fecha y hora de inicio (formato: DD MMM YYYY - HH:MM AM/PM)
- Fecha y hora de fin (formato: DD MMM YYYY - HH:MM AM/PM)
- Número de invitados
- Precio total (con método de pago)
- Estado de la reservación (badge colorizado)
- Fecha de creación

#### Estados de Reservación:
- 🟡 **Pendiente** (pending): Reserva creada, pago no confirmado
- 🟢 **Pagada** (paid): Pago confirmado por el cliente
- 🔴 **Cancelada** (cancelled): Reserva cancelada por cliente o admin
- ⚫ **Expirada** (expired): Tiempo de reserva ha pasado

---

### 2. **Estadísticas en Tiempo Real**

Dashboard con 5 métricas clave:

1. **Total**: Número total de reservaciones (con filtros aplicados)
2. **Pendientes**: Reservas que esperan confirmación de pago
3. **Pagadas**: Reservas con pago confirmado
4. **Canceladas**: Reservas anuladas
5. **Ingresos**: Total acumulado de reservas pagadas (USD)

Las estadísticas se actualizan automáticamente al aplicar filtros.

---

### 3. **Sistema de Filtros Avanzado**

#### Filtros Disponibles:

**a) Por Estado:**
- Todos los estados (por defecto)
- Pendiente
- Pagada
- Cancelada
- Expirada

**b) Por Ambiente:**
- Dropdown con todos los ambientes activos
- Muestra nombre y capacidad
- Endpoint usado: `GET /areas`

**c) Por Rango de Fechas:**
- **Fecha inicio**: Filtra reservas desde esta fecha
- **Fecha fin**: Filtra reservas hasta esta fecha
- Formato: `YYYY-MM-DD`

#### Comportamiento:
- Los filtros se aplican instantáneamente (sin botón "Aplicar")
- Botón "Limpiar filtros" restaura todos los valores
- Query params enviados al backend:
  ```
  GET /reservations/admin/all?status=paid&areaId=123&startDate=2024-12-01&endDate=2024-12-31
  ```

---

### 4. **Timeline de Disponibilidad (Avanzado)** 🌟

Visualización gráfica de la disponibilidad de ambientes por hora.

#### Características:
- **Horario:** 9:00 AM - 11:00 PM (slots de 1 hora)
- **Vista:** Tabla con ambientes en filas y horas en columnas
- **Colores:**
  - ⬜ **Gris claro**: Horario disponible
  - 🟡 **Amarillo**: Horario ocupado (reserva pendiente)
  - 🟢 **Verde**: Horario ocupado (reserva pagada)
  
#### Funcionalidades:
- Selector de fecha para cambiar el día visualizado
- Botón toggle para mostrar/ocultar el timeline
- Hover sobre slot ocupado muestra:
  - Nombre del cliente
  - Hora exacta de inicio y fin
  - Estado de la reserva
- Scroll horizontal para ver todas las horas
- Nombres de ambientes fijos (sticky) al hacer scroll

#### Uso:
1. Selecciona una fecha en el selector
2. Click en "Mostrar Timeline"
3. Visualiza la disponibilidad de todos los ambientes
4. Usa el mouse para ver detalles de cada reserva

---

### 5. **Acciones del Administrador**

#### Cancelar Reservación
- **Botón:** "Cancelar" (rojo) en cada fila
- **Endpoint:** `DELETE /reservations/:id/admin-cancel`
- **Permiso:** Solo administradores
- **Confirmación:** Modal de confirmación antes de ejecutar
- **Efecto:** 
  - Cambia el estado a `cancelled`
  - Libera el horario del ambiente
  - Actualiza la tabla sin recargar la página
- **Restricciones:**
  - No se puede cancelar una reserva ya `cancelled`
  - No se puede cancelar una reserva `expired`
  - Admins pueden cancelar incluso reservas `paid` o pasadas

#### Estados del Botón:
- **Activo**: "Cancelar" (texto rojo)
- **Procesando**: "Cancelando..." (spinner animado)
- **Deshabilitado**: "No disponible" (gris) - para reservas ya canceladas/expiradas

---

### 6. **Sección de Notas**

- Muestra solo si hay reservaciones con notas del cliente
- Agrupa todas las notas en un panel dedicado
- Formato:
  ```
  Cliente - Ambiente
  "Nota del cliente aquí..."
  ```
- Borde naranja a la izquierda para destacar

---

## 🔧 Integración con Backend

### Endpoints Utilizados:

1. **Obtener todas las reservaciones:**
   ```
   GET /reservations/admin/all
   Query params: status, areaId, startDate, endDate
   Autenticación: JWT cookie + isAdmin middleware
   ```

2. **Obtener ambientes:**
   ```
   GET /areas
   Sin autenticación requerida
   ```

3. **Cancelar reservación (Admin):**
   ```
   DELETE /reservations/:id/admin-cancel
   Autenticación: JWT cookie + isAdmin middleware
   ```

### Respuestas Esperadas:

**getAllReservations:**
```javascript
{
  success: true,
  count: 25,
  reservations: [
    {
      _id: "...",
      user: { firstName: "Juan", lastName: "Pérez", email: "juan@example.com" },
      area: { _id: "...", name: "Terraza VIP", capacity: 8 },
      startTime: "2024-12-08T18:00:00.000Z",
      endTime: "2024-12-08T20:00:00.000Z",
      guestCount: 4,
      totalPrice: 10.00,
      status: "paid",
      paymentMethodSimulated: "card",
      notes: "Celebración de cumpleaños",
      createdAt: "2024-12-07T10:30:00.000Z"
    }
  ]
}
```

**adminCancelReservation:**
```javascript
{
  success: true,
  message: "Reservación cancelada exitosamente por administrador",
  reservation: { _id: "...", status: "cancelled", ... }
}
```

---

## 📊 Manejo de Estados y UX

### Loading States:
- ⏳ **Cargando inicial**: Spinner centrado con texto "Cargando..."
- 🔄 **Acción en proceso**: Botón deshabilitado con spinner inline
- ✅ **Acción completada**: Actualización optimista del estado

### Error States:
- ❌ **Error de carga**: Mensaje de error + botón "Reintentar"
- ❌ **Error de acción**: Alert del navegador con mensaje descriptivo

### Empty States:
- 📭 **Sin resultados**: Icono + mensaje + botón "Limpiar filtros" (si hay filtros activos)

### Confirmaciones:
- ⚠️ **Antes de cancelar**: Modal de confirmación con mensaje claro:
  ```
  ¿Seguro que quieres cancelar esta reserva?
  Esta acción liberará el ambiente en esa fecha/hora.
  ```

---

## 🎨 Diseño Visual

### Paleta de Colores:
- **Primario:** Naranja (#EA580C - orange-600)
- **Éxito:** Verde (#059669 - green-600)
- **Advertencia:** Amarillo (#CA8A04 - yellow-600)
- **Error:** Rojo (#DC2626 - red-600)
- **Neutro:** Gris (#6B7280 - gray-500)

### Badges de Estado:
- Pendiente: `bg-yellow-100 text-yellow-800`
- Pagada: `bg-green-100 text-green-800`
- Cancelada: `bg-red-100 text-red-800`
- Expirada: `bg-gray-100 text-gray-800`

### Responsividad:
- **Desktop:** Tabla completa con todas las columnas
- **Tablet:** Grid de estadísticas en 3 columnas, scroll horizontal en tabla
- **Mobile:** Consideración de implementar cards en lugar de tabla (mejora futura)

---

## 🚀 Mejoras Avanzadas Sugeridas

### 1. **Paginación**
- **Problema:** Con muchas reservas, la tabla puede ser pesada
- **Solución:** Implementar paginación server-side
- **Backend:** Agregar query params `page` y `limit`
- **Frontend:** Componente de paginación con "Anterior", números de página, "Siguiente"

### 2. **Exportación de Datos**
- **Formato:** CSV/Excel
- **Endpoint:** `GET /reservations/admin/export?format=csv`
- **Uso:** Reportes y análisis externos

### 3. **Filtro por Cliente**
- **Input:** Campo de búsqueda por nombre o email
- **Backend:** Query param `search`
- **Uso:** Encontrar todas las reservas de un cliente específico

### 4. **Ordenamiento Dinámico**
- **Funcionalidad:** Click en headers de tabla para ordenar
- **Columnas ordenables:** Fecha, precio, estado, cliente
- **Implementación:** State local o query params

### 5. **Vista de Calendario Mensual**
- **Visualización:** Calendario estilo Google Calendar
- **Uso:** Ver distribución de reservas por mes
- **Librería sugerida:** FullCalendar o React Big Calendar

### 6. **Notificaciones en Tiempo Real**
- **Tecnología:** WebSockets o Server-Sent Events
- **Uso:** Alertas cuando se crea/cancela una reserva
- **UX:** Toast notifications no intrusivas

### 7. **Reportes Analíticos**
- Ingresos por mes/semana
- Ambiente más popular
- Horarios pico
- Tasa de cancelación
- Cliente frecuente

### 8. **Acción: Marcar como Pagada (Admin)**
- **Botón:** "Confirmar Pago" para reservas pendientes
- **Endpoint:** `POST /reservations/:id/admin-confirm-payment`
- **Uso:** Cuando el pago se verifica manualmente

### 9. **Edición de Reservas (Admin)**
- **Funcionalidad:** Cambiar fecha/hora/ambiente de una reserva existente
- **Endpoint:** `PUT /reservations/:id/admin-edit`
- **Validación:** Mismas reglas que creación (overlap, capacidad, etc.)

### 10. **Filtro por Método de Pago**
- **Opciones:** Efectivo, Tarjeta, Transferencia
- **Uso:** Análisis de preferencias de pago

---

## 🔐 Seguridad

### Autenticación:
- Todas las rutas `/admin/*` están protegidas
- `AdminLayout` verifica autenticación en `useEffect`
- Redirección automática a `/` si no autenticado

### Autorización:
- Middleware `isAdmin` en todos los endpoints admin
- Verifica `req.user.role === 'admin'`
- Retorna 403 si no es admin

### Cookies HTTPOnly:
- JWT almacenado en cookie HTTPOnly
- No accesible desde JavaScript del cliente
- Enviado automáticamente con `credentials: 'include'`

---

## 📝 Manejo de Zona Horaria

### Consideraciones:
- Backend almacena fechas en **UTC** en MongoDB
- Frontend muestra fechas en zona horaria local del navegador
- `new Date().toLocaleDateString('es-EC')` para formato ecuatoriano
- `new Date().toLocaleTimeString('es-EC', { hour12: true })` para 12 horas

### Formato de Fechas:
- **Input del usuario:** `YYYY-MM-DD` (HTML5 date input)
- **Almacenamiento:** ISO 8601 UTC en MongoDB
- **Display:** Formato local legible (ej: "8 Dic 2024 - 06:00 PM")

---

## 🐛 Debugging

### Herramientas:
- **Console logs:** Todos los errores se loguean en consola del navegador
- **Network tab:** Inspeccionar requests/responses
- **Redux DevTools:** No aplicable (usa React State)

### Endpoints de Debug (solo development):
```
GET /debug/reservations - Ver todas las reservaciones con detalles
POST /debug/check-overlap - Verificar overlaps manualmente
DELETE /debug/reservations/clear-all - Limpiar toda la colección (CUIDADO)
```

---

## 📚 Archivos Relacionados

### Frontend:
- `frontend/app/admin/reservations/page.jsx` - Página principal
- `frontend/components/AreaAvailabilityTimeline.jsx` - Timeline visual
- `frontend/lib/api.js` - Funciones API (getAllReservations, adminCancelReservation, getAreas)

### Backend:
- `backend/routes/reservationRoutes.js` - Rutas de reservaciones
- `backend/controllers/reservationController.js` - Lógica de negocio
- `backend/models/Reservation.js` - Schema de MongoDB
- `backend/middleware/auth.js` - Autenticación y autorización

### Scripts:
- `backend/scripts/cleanIndexes.js` - Limpieza de índices obsoletos

---

## 🎓 Flujo de Uso Típico

1. **Admin inicia sesión** → Redirección a `/admin`
2. **Navega a "Ver Reservaciones"** → `/admin/reservations`
3. **Visualiza estadísticas generales** → Dashboard con métricas
4. **Aplica filtros** → Filtra por estado "paid", ambiente "Terraza VIP", fecha última semana
5. **Revisa tabla** → Ve 5 reservas pagadas para ese ambiente
6. **Activa timeline** → Selecciona mañana, visualiza disponibilidad por hora
7. **Cancela una reserva** → Click "Cancelar", confirma modal, reserva cancelada
8. **Revisa notas** → Scroll abajo, ve notas especiales de clientes

---

## ✅ Checklist de Funcionalidades

- ✅ Vista de tabla con todas las reservaciones
- ✅ Información completa del cliente (nombre, email)
- ✅ Información del ambiente (nombre, capacidad)
- ✅ Fechas y horas formateadas correctamente
- ✅ Badges de estado coloridos
- ✅ Dashboard con 5 estadísticas
- ✅ Filtro por estado
- ✅ Filtro por ambiente
- ✅ Filtro por rango de fechas
- ✅ Botón limpiar filtros
- ✅ Cancelación de reservas por admin
- ✅ Confirmación antes de cancelar
- ✅ Actualización optimista sin reload
- ✅ Timeline visual de disponibilidad
- ✅ Selector de fecha para timeline
- ✅ Hover tooltips en timeline
- ✅ Sección de notas
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Responsividad básica

---

## 🔄 Actualización de Estado sin Reload

### Técnica Utilizada: **Optimistic UI Update**

Cuando el admin cancela una reserva:

```javascript
// 1. Actualizar estado local inmediatamente
setReservations(prevReservations =>
  prevReservations.map(res =>
    res._id === reservationId
      ? { ...res, status: 'cancelled' }
      : res
  )
);

// 2. Llamar al backend
await adminCancelReservation(reservationId);

// 3. Si falla, revertir el estado (rollback)
```

**Ventajas:**
- UI instantánea, no espera respuesta del servidor
- Mejor percepción de velocidad
- Menor latencia percibida

**Alternativa: Pessimistic Update**
- Esperar respuesta del servidor antes de actualizar UI
- Recargar toda la lista: `await loadReservations()`
- Más lento pero más seguro

---

## 🌐 Endpoints sin Prefijo `/api`

**Importante:** Los endpoints de reservaciones y áreas NO usan el prefijo `/api`:

```javascript
✅ Correcto:
GET /reservations/admin/all
GET /areas
DELETE /reservations/:id/admin-cancel

❌ Incorrecto:
GET /api/reservations/admin/all
GET /api/areas
```

**Razón:** Requisito del cliente para mantener consistencia con schema existente.

---

## 📞 Soporte

Para problemas o dudas:
1. Verificar logs de consola (frontend y backend)
2. Revisar Network tab para errores de API
3. Verificar autenticación del admin
4. Consultar esta documentación

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024  
**Autor:** Sistema de Gestión Bocatto Restaurant
