# Sistema de Reservaciones - Guía de Usuario (Cliente)

## 🎯 Funcionalidades Implementadas

### 1. **Página de Reservaciones** (`/reservations`)
- ✅ Galería de ambientes disponibles
- ✅ Información detallada de cada área (capacidad, características, imagen)
- ✅ Botón "Hacer una reservación" en cada ambiente

### 2. **Validación de Login**
- ✅ Si el usuario **NO** está logeado:
  - Muestra mensaje flotante: *"¡Inicia sesión para continuar! Debes iniciar sesión para poder hacer una reservación"*
  - El mensaje se muestra por 3 segundos y hace scroll automático al botón de login
  
- ✅ Si el usuario **SÍ** está logeado:
  - Abre el modal de reservación directamente

### 3. **Formulario de Reservación Professional**

#### Campos del Formulario:
- **Fecha de Reserva** (obligatorio)
  - Validación: No permite fechas pasadas
  - Validación: Máximo 30 días de anticipación
  
- **Hora de Inicio** (obligatorio)
  - Selector de tiempo (formato 24h)
  
- **Hora de Fin** (obligatorio)
  - Validación: Debe ser posterior a la hora de inicio
  
- **Número de Invitados** (obligatorio)
  - Rango validado según capacidad del área
  - Ej: Si el área permite 2-8 personas, solo acepta valores en ese rango
  
- **Método de Pago Simulado**
  - Opciones: Tarjeta, Efectivo, Transferencia
  
- **Notas Adicionales** (opcional)
  - Máximo 500 caracteres
  - Ejemplo: "Necesito sillas para niños"

#### Cálculo de Precio en Tiempo Real:
- 💰 **Precio base**: $5.00 USD (primera hora)
- 💰 **Horas adicionales**: $2.50 USD por cada hora extra
- 📊 **Cálculo automático**: Se actualiza al cambiar la hora de inicio o fin
- 📝 **Detalle visible**: Muestra desglose del precio (ej: "$5.00 + $5.00 = $10.00")

#### Validaciones Frontend:
✅ Fecha no puede ser pasada  
✅ Fecha máximo 30 días en el futuro  
✅ Hora fin > Hora inicio  
✅ Número de invitados dentro del rango del área  
✅ Todos los campos obligatorios completos  

#### Validaciones Backend (automáticas):
✅ Verifica que no exista otra reservación en el mismo horario (overlapping)  
✅ Confirma que el área esté activa  
✅ Valida capacidad contra límites del área  
✅ Recalcula precio en el servidor para evitar manipulación  

#### Manejo de Errores:
- **Horario ocupado**: "Ya existe una reservación para este ambiente en ese horario"
- **Fecha inválida**: Mensaje específico del problema
- **Sesión expirada**: "Tu sesión expiró. Por favor, inicia sesión nuevamente"
- Todos los errores se muestran en el modal sin alerts molestos

### 4. **Página "Mis Reservas"** (`/my-reservations`)

#### Acceso:
- 👤 **Desde el menú de usuario**: Click en tu nombre → "Mis Reservas"
- 🔒 **Protegida**: Redirige a inicio si no estás logeado

#### Filtros Disponibles:
- **Todas**: Muestra todas tus reservaciones
- **Próximas**: Solo reservaciones futuras (aún no completadas)
- **Pendientes**: Solo reservaciones sin pagar
- **Pagadas**: Solo reservaciones confirmadas

#### Información Mostrada:
Para cada reservación:
- 🏠 Nombre del ambiente
- 📅 Fecha completa (ej: "sábado, 25 de diciembre de 2024")
- ⏰ Horario (ej: "18:00 - 20:00")
- 👥 Número de invitados
- 💵 Precio total
- 📝 Notas (si las agregaste)
- 🏷️ Estado (badge de color):
  - 🟡 **Pendiente**: Amarillo
  - 🟢 **Pagada**: Verde
  - 🔴 **Cancelada**: Rojo
  - ⚫ **Expirada**: Gris

#### Acciones Disponibles:

##### 1. **Confirmar Pago (Simulado)**
- 🟢 Botón verde: "✓ Confirmar Pago"
- **Cuándo aparece**: Solo en reservaciones con estado "Pendiente" que aún no hayan comenzado
- **Qué hace**: 
  - Cambia el estado de `pending` → `paid`
  - Muestra alert con el total pagado
  - Actualiza la lista automáticamente
- **Nota**: Es una simulación, no procesa pagos reales

##### 2. **Cancelar Reservación**
- 🔴 Botón rojo: "Cancelar"
- **Cuándo aparece**: Solo si la reservación:
  - Tiene estado "Pendiente" o "Pagada"
  - Aún no ha comenzado (fecha futura)
- **Qué hace**:
  - Solicita confirmación
  - Cambia el estado a `cancelled`
  - Libera el horario para otros usuarios
  - Actualiza la lista automáticamente
- **Restricción**: No puedes cancelar reservaciones que ya comenzaron

##### 3. **Completada**
- ✓ Texto gris: "Completada"
- **Cuándo aparece**: Reservaciones pagadas que ya pasaron su hora de fin

### 5. **Integración con Header**

#### Usuario NO logeado:
- Botón naranja: **"Ingresar"**
- Al hacer click: Abre modal de login/registro

#### Usuario logeado:
- Muestra tu nombre con un menú desplegable
- **Opciones del menú**:
  1. 📅 **Mis Reservas** → Va a `/my-reservations`
  2. 🚪 **Cerrar sesión** → Logout y redirige a inicio

---

## 🚀 Flujo de Uso Completo

### Escenario 1: Usuario Nuevo

1. **Navega a** `/reservations`
2. Ve la galería de ambientes
3. Click en **"Hacer una reservación"**
4. ⚠️ **Mensaje**: "Debes iniciar sesión para poder hacer una reservación"
5. Scroll automático al botón **"Ingresar"**
6. Abre modal de login
7. Click en tab **"Cliente"** → **"Registrarse"**
8. Completa formulario de registro:
   - Nombre
   - Apellido
   - Email
   - Teléfono
   - Contraseña
9. ✅ **Registro exitoso** → Login automático
10. Header se actualiza mostrando tu nombre
11. **Vuelve a** `/reservations`
12. Click en **"Hacer una reservación"** de nuevo
13. ✅ **Ahora sí abre el modal de reservación**

### Escenario 2: Hacer una Reservación

1. **Selecciona fecha**: Ej. 25 de diciembre
2. **Selecciona hora inicio**: Ej. 18:00
3. **Selecciona hora fin**: Ej. 20:00
4. 💰 **Ve el precio calculado**: $7.50 (2 horas)
   - Detalle: $5.00 (primera hora) + $2.50 (1 hora adicional)
5. **Ingresa número de invitados**: Ej. 4 personas
6. **Selecciona método de pago**: Tarjeta
7. **Agrega notas** (opcional): "Celebración de cumpleaños"
8. Click en **"Confirmar Reservación"**
9. ⏳ **Procesando...** (el backend valida todo)
10. ✅ **Éxito**: Alert con ID de reservación y precio
11. Modal se cierra

### Escenario 3: Ver y Pagar una Reservación

1. Click en tu nombre (header)
2. Click en **"Mis Reservas"**
3. Ve tu lista de reservaciones
4. Click en filtro **"Pendientes"**
5. Encuentra la reservación que acabas de crear
6. Estado: 🟡 **Pendiente**
7. Click en **"✓ Confirmar Pago"**
8. ⚠️ **Confirmar**: "¿Confirmar el pago de esta reservación?"
9. Click **"Aceptar"**
10. ✅ **Pago confirmado**: Alert muestra el total
11. Estado cambia a: 🟢 **Pagada**
12. Botón de pago desaparece

### Escenario 4: Cancelar una Reservación

1. En **"Mis Reservas"**
2. Encuentra una reservación pendiente o pagada
3. Click en **"Cancelar"**
4. ⚠️ **Confirmar**: "¿Estás seguro de que deseas cancelar?"
5. Click **"Aceptar"**
6. ✅ **Cancelada**: Alert de confirmación
7. Estado cambia a: 🔴 **Cancelada**
8. Botones de acción desaparecen

### Escenario 5: Intentar Reservar Horario Ocupado

1. Usuario A reserva: 25 dic, 18:00-20:00
2. Usuario B intenta reservar: 25 dic, 19:00-21:00 (se solapa)
3. Backend detecta overlap
4. ❌ **Error**: "Ya existe una reservación para este ambiente en ese horario"
5. Usuario B debe elegir otro horario

---

## 📋 Validaciones Detalladas

### Fecha de Reservación

| Validación | Descripción | Ejemplo Error |
|------------|-------------|---------------|
| No pasada | `startTime > now` | "No puedes seleccionar una fecha pasada" |
| Máx 30 días | `startTime <= now + 30 días` | "Solo puedes reservar con máximo 30 días de anticipación" |

### Horario

| Validación | Descripción | Ejemplo Error |
|------------|-------------|---------------|
| Fin > Inicio | `endTime > startTime` | "La hora de fin debe ser posterior a la hora de inicio" |
| No overlap | Backend verifica solapamiento | "Ya existe una reservación en ese horario" |

### Capacidad

| Validación | Descripción | Ejemplo |
|------------|-------------|---------|
| Min-Max | `minCapacity <= guestCount <= maxCapacity` | Área: 2-8 personas → Solo acepta 2, 3, 4, 5, 6, 7, 8 |

### Precio

| Duración | Cálculo | Resultado |
|----------|---------|-----------|
| 1 hora | $5.00 | $5.00 |
| 1.5 horas | $5.00 + (1 × $2.50) | $7.50 |
| 2 horas | $5.00 + (1 × $2.50) | $7.50 |
| 3 horas | $5.00 + (2 × $2.50) | $10.00 |
| 5 horas | $5.00 + (4 × $2.50) | $15.00 |

**Nota**: Se redondea hacia arriba (ceil). Ej: 1 hora 15 minutos = 2 horas

---

## 🎨 Características de UI/UX

### Modal de Reservación
- 🎨 **Diseño moderno**: Fondo oscuro con glassmorphism
- 📱 **Responsive**: Se adapta a móviles
- ⚡ **Cálculo en tiempo real**: Precio se actualiza al cambiar horas
- 🔴 **Errores claros**: Mensajes específicos con iconos
- ⏳ **Loading states**: Spinner durante procesamiento
- ✅ **Feedback visual**: Campos inválidos con borde rojo

### Página "Mis Reservas"
- 🏷️ **Badges de estado**: Colores distintivos
- 📊 **Filtros rápidos**: Tabs para cambiar vista
- 📅 **Formato legible**: Fechas en español completo
- 💡 **Acciones contextuales**: Botones solo cuando aplican
- 🔄 **Actualización automática**: Después de cada acción

### Mensaje de Login Requerido
- 🎬 **Animación bounce**: Llama la atención
- ⏱️ **Auto-dismiss**: Se oculta a los 3 segundos
- 📜 **Scroll automático**: Te lleva al botón de login
- 🎨 **Diseño atractivo**: Color naranja con iconos

---

## 🔧 Manejo de Errores

### Errores del Usuario (400)
| Error | Mensaje |
|-------|---------|
| Fecha pasada | "No puedes seleccionar una fecha pasada" |
| Fecha > 30 días | "Solo puedes reservar con máximo 30 días de anticipación" |
| Fin <= Inicio | "La hora de fin debe ser posterior a la hora de inicio" |
| Capacidad excedida | "El número de invitados debe estar entre X y Y" |
| Campos vacíos | "Debes seleccionar hora de inicio y fin" |

### Errores del Sistema (409, 500)
| Error | Mensaje |
|-------|---------|
| Overlap | "Ya existe una reservación para este ambiente en ese horario" |
| Área no encontrada | "Área no encontrada" |
| Sesión expirada | "Tu sesión expiró. Por favor, inicia sesión nuevamente" |
| Error servidor | "Error al crear la reservación. Por favor, intenta nuevamente" |

### Restricciones de Acciones
| Acción | Restricción | Mensaje |
|--------|-------------|---------|
| Cancelar | Reservación ya comenzó | "No puedes cancelar una reservación que ya comenzó" |
| Cancelar | Ya cancelada | "Esta reservación ya está cancelada" |
| Pagar | Ya pagada | "Esta reservación ya está pagada" |
| Pagar | Cancelada | "No se puede confirmar el pago de una reservación cancelada" |

---

## 📱 Navegación Rápida

### Rutas Disponibles:
- `/` - Inicio
- `/reservations` - Galería de ambientes (pública)
- `/my-reservations` - Mis reservas (protegida, requiere login)

### Accesos Directos:
- **Header** → Tu nombre → "Mis Reservas"
- **Página de reservaciones** → Botón "Hacer una reservación"
- **Mis Reservas** → Botón "Hacer Nueva Reservación" (bottom)

---

## ✨ Mejoras Futuras Sugeridas

### Funcionalidades Adicionales:
1. **Notificaciones**
   - Email de confirmación al crear reservación
   - Recordatorio 24h antes del evento
   - Notificación de cancelación

2. **Calendario Visual**
   - Vista de calendario con horarios disponibles
   - Bloques visuales de disponibilidad
   - Click en horario para selección rápida

3. **Historial de Reservaciones**
   - Filtro por fechas específicas
   - Exportar a PDF/Excel
   - Estadísticas personales (total gastado, ambientes favoritos)

4. **Sistema de Reseñas**
   - Calificar ambiente después de la reservación
   - Ver reseñas de otros usuarios antes de reservar

5. **Descuentos y Promociones**
   - Cupones de descuento
   - Precios especiales en horarios de baja demanda
   - Programa de lealtad (puntos por reservación)

6. **Edición de Reservaciones**
   - Cambiar fecha/hora (si no está ocupado)
   - Modificar número de invitados
   - Actualizar notas

---

## 🐛 Troubleshooting

### Problema: No puedo ver mis reservaciones
**Solución**: 
- Verifica que estés logeado (debe aparecer tu nombre en el header)
- Refresca la página (F5)
- Verifica tu conexión a internet

### Problema: El precio no se actualiza
**Solución**:
- Asegúrate de seleccionar tanto hora de inicio como hora de fin
- Si persiste, cierra y abre el modal de nuevo

### Problema: Error "Sesión expirada"
**Solución**:
- Tu sesión caducó (24 horas)
- Cierra el modal
- Click en "Cerrar sesión" (header)
- Vuelve a iniciar sesión

### Problema: No puedo cancelar mi reservación
**Posibles causas**:
- La reservación ya comenzó (hora de inicio pasó)
- La reservación ya está cancelada
- Tu sesión expiró

---

## 📞 Soporte

Si encuentras algún problema no listado aquí, contacta al equipo de desarrollo:
- Email: soporte@bocatto.com
- Teléfono: +593 XX XXX XXXX

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Sistema**: Bocatto Restaurant - Reservaciones
