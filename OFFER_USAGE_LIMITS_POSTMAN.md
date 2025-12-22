# 🎯 Sistema de Límites de Uso para Ofertas - Guía Postman

## 📝 Nuevos Endpoints Implementados

### 1. **POST** `/offers/:id/validate` - Validar Oferta
**Descripción**: Verifica si una oferta está disponible para usar sin incrementar el contador.

### 2. **POST** `/offers/:id/apply` - Aplicar Oferta  
**Descripción**: Aplica la oferta incrementando el contador de uso y auto-desactivándola si alcanza el límite.

---

## 🧪 **Casos de Prueba en Postman**

### **PASO 1: Crear una oferta con límite de uso**

```http
POST http://localhost:5000/offers
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: Combo Especial Limitado
description: Oferta especial válida solo 3 veces
originalPrice: 50000
offerPrice: 35000
maxUsage: 3
validDays: ["lunes","martes","miércoles","jueves","viernes"]
startDate: 2025-12-12
endDate: 2025-12-31
badge: {"text":"Limitado","color":"orange","icon":"⭐"}
featured: true
active: true
items: [{"name":"Hamburguesa Premium","quantity":1},{"name":"Papas","quantity":1},{"name":"Bebida","quantity":1}]
```

### **PASO 2: Validar la oferta (debe estar disponible)**

```http
POST http://localhost:5000/offers/{OFFER_ID}/validate
Content-Type: application/json

{
  "userId": "user123"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "offer": {
      "id": "...",
      "name": "Combo Especial Limitado",
      "originalPrice": 50000,
      "offerPrice": 35000,
      "discount": 30
    },
    "validation": {
      "isValid": true,
      "isActive": true,
      "isTimeValid": true,
      "usageInfo": {
        "currentUsage": 0,
        "maxUsage": 3,
        "hasUsageLimit": true,
        "usageRemaining": 3
      },
      "validationErrors": []
    }
  }
}
```

### **PASO 3: Aplicar la oferta (1ra vez)**

```http
POST http://localhost:5000/offers/{OFFER_ID}/apply
Content-Type: application/json

{
  "userId": "user123",
  "orderDetails": {
    "items": ["hamburguesa", "papas", "bebida"],
    "total": 35000
  }
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Offer applied successfully",
  "data": {
    "offer": {
      "id": "...",
      "name": "Combo Especial Limitado",
      "originalPrice": 50000,
      "offerPrice": 35000,
      "discount": 30
    },
    "usageInfo": {
      "currentUsage": 1,
      "maxUsage": 3,
      "usageRemaining": 2,
      "autoDeactivated": false
    }
  }
}
```

### **PASO 4: Aplicar la oferta 2 veces más**

Repite el request anterior 2 veces más. En la 3ra aplicación verás:

```json
{
  "success": true,
  "message": "Offer applied successfully",
  "data": {
    "usageInfo": {
      "currentUsage": 3,
      "maxUsage": 3,
      "usageRemaining": 0,
      "autoDeactivated": true
    }
  }
}
```

### **PASO 5: Intentar aplicar nuevamente (debe fallar)**

```http
POST http://localhost:5000/offers/{OFFER_ID}/apply
```

**Respuesta esperada (Error 400):**
```json
{
  "success": false,
  "message": "Offer cannot be applied",
  "code": "OFFER_NOT_AVAILABLE",
  "errors": [
    "Offer is inactive",
    "Offer usage limit reached"
  ]
}
```

---

## 🔍 **Casos de Prueba Adicionales**

### **A. Oferta sin límite de uso (maxUsage: null)**

```javascript
// En el body de creación:
maxUsage: null  // o simplemente omitir el campo
```

**Resultado**: La oferta se puede aplicar infinitas veces.

### **B. Oferta fuera de horario válido**

```javascript
// Crear oferta válida solo los fines de semana
validDays: ["sábado","domingo"]
```

**Resultado**: Si validates/apply en día de semana → `isTimeValid: false`

### **C. Oferta expirada**

```javascript
// Crear oferta que ya expiró
endDate: "2025-12-01"
```

**Resultado**: `"Offer has expired"` en validationErrors

---

## 📊 **Verificar Estado de Ofertas**

### **GET** `/offers/{OFFER_ID}` - Ver estado actual

```http
GET http://localhost:5000/offers/{OFFER_ID}
```

Verás los campos:
- `usageCount`: Cuántas veces se ha aplicado
- `maxUsage`: Límite máximo (null = sin límite)  
- `active`: Si se auto-desactivó al llegar al límite

---

## 🎯 **Flujo de Prueba Completo**

1. **Crear** oferta con `maxUsage: 2`
2. **Validar** → `isValid: true, usageRemaining: 2`
3. **Aplicar** 1ra vez → `currentUsage: 1, usageRemaining: 1`
4. **Validar** → `isValid: true, usageRemaining: 1`
5. **Aplicar** 2da vez → `currentUsage: 2, usageRemaining: 0, autoDeactivated: true`
6. **Validar** → `isValid: false, errors: ["Offer is inactive", "Offer usage limit reached"]`
7. **Aplicar** 3ra vez → **Error 400**

---

## 💡 **Tips para Testing**

1. **Usa variables en Postman**: Guarda el `offer_id` después de crear
2. **Crea colección**: Agrupa todos los requests relacionados
3. **Tests automatizados**: Usa el tab "Tests" para verificar responses
4. **Ambientes**: Configura `{{base_url}}` = `http://localhost:5000`

## 🚀 **Próximas Mejoras**

- Límites por usuario individual
- Reset de contadores por período (diario/semanal)  
- Analytics de uso por oferta
- Notificaciones cuando quedan pocos usos