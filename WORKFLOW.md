# 📚 Guía de Desarrollo - Implementar Nuevas Funcionalidades

## 🎯 Flujo Completo: Backend → Frontend

Esta guía te muestra **paso a paso** cómo implementar una funcionalidad completa (ejemplo: Reservaciones).

---

## 📋 ORDEN DE TRABAJO

```
1. Backend (API)
   ├── Modelo (Schema de MongoDB)
   ├── Controlador (Lógica de negocio)
   ├── Ruta (Endpoints de la API)
   └── Registrar ruta en server.js

2. Frontend (Next.js)
   ├── Actualizar API client (lib/api.js)
   ├── Crear página (app/reservations/page.jsx)
   └── Agregar al menú de navegación
```

---

## 🔷 BACKEND - Crear API de Reservaciones

### **Paso 1: Crear el Modelo** 📄
**Archivo:** `backend/models/Reservation.js`

```javascript
import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'La fecha es requerida']
  },
  time: {
    type: String,
    required: [true, 'La hora es requerida']
  },
  guests: {
    type: Number,
    required: [true, 'El número de personas es requerido'],
    min: 1,
    max: 20
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true // Crea createdAt y updatedAt automáticamente
});

export default mongoose.model('Reservation', reservationSchema);
```

**📂 Ubicación:** `backend/models/Reservation.js`

---

### **Paso 2: Crear el Controlador** 🎮
**Archivo:** `backend/controllers/reservationController.js`

```javascript
import Reservation from '../models/Reservation.js';

// GET - Obtener todas las reservaciones
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: -1 });
    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET - Obtener una reservación por ID
export const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST - Crear nueva reservación
export const createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    
    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reservación creada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// PUT - Actualizar reservación
export const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: reservation,
      message: 'Reservación actualizada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE - Eliminar reservación
export const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservación no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Reservación eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

**📂 Ubicación:** `backend/controllers/reservationController.js`

---

### **Paso 3: Crear las Rutas** 🛣️
**Archivo:** `backend/routes/reservationRoutes.js`

```javascript
import express from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
} from '../controllers/reservationController.js';

const router = express.Router();

// Rutas de reservaciones
router.get('/', getAllReservations);           // GET /api/reservations
router.get('/:id', getReservationById);        // GET /api/reservations/:id
router.post('/', createReservation);           // POST /api/reservations
router.put('/:id', updateReservation);         // PUT /api/reservations/:id
router.delete('/:id', deleteReservation);      // DELETE /api/reservations/:id

export default router;
```

**📂 Ubicación:** `backend/routes/reservationRoutes.js`

---

### **Paso 4: Registrar en server.js** ⚙️
**Archivo:** `backend/server.js`

Agrega estas líneas:

```javascript
// Importar la ruta
import reservationRoutes from './routes/reservationRoutes.js';

// Registrar la ruta (después de las otras rutas)
app.use('/api/reservations', reservationRoutes);
```

**📂 Ubicación:** `backend/server.js` (editar existente)

---

## 🔷 FRONTEND - Crear Página de Reservaciones

### **Paso 5: Actualizar API Client** 🔌
**Archivo:** `frontend/lib/api.js`

Agrega estas funciones:

```javascript
// Obtener todas las reservaciones
export async function fetchReservations() {
  try {
    const response = await fetch(`${API_URL}/api/reservations`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Crear nueva reservación
export async function createReservation(reservationData) {
  try {
    const response = await fetch(`${API_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

**📂 Ubicación:** `frontend/lib/api.js` (editar existente)

---

### **Paso 6: Crear la Página** 🎨
**Archivo:** `frontend/app/reservations/page.jsx`

```javascript
'use client';

import { useState } from 'react';
import { createReservation } from '@/lib/api';

export default function ReservationsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await createReservation(formData);
      setMessage({ 
        type: 'success', 
        text: '¡Reservación creada exitosamente!' 
      });
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: 2,
        notes: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error al crear la reservación' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-2">Hacer una Reserva</h2>
          <p className="text-xl opacity-90">Reserva tu mesa ahora</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-neutral-800 p-8 rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Personas *
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Notas adicionales
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
                  placeholder="Alergias, preferencias de mesa, etc."
                />
              </div>

              {message.text && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
```

**📂 Ubicación:** `frontend/app/reservations/page.jsx`

---

### **Paso 7: Agregar al Menú de Navegación** 🔗
**Archivo:** `frontend/components/Header.jsx`

Edita para agregar el link:

```javascript
<ul className="flex gap-8 items-center">
  <li>
    <Link href="/" className="text-white hover:text-orange-500 transition">
      Inicio
    </Link>
  </li>
  <li>
    <Link href="/menu" className="text-white hover:text-orange-500 transition">
      Menú
    </Link>
  </li>
  <li>
    <Link href="/reservations" className="text-white hover:text-orange-500 transition">
      Reservas
    </Link>
  </li>
</ul>
```

**📂 Ubicación:** `frontend/components/Header.jsx` (editar existente)

---

## 📊 RESUMEN VISUAL

```
BACKEND (API REST)
==================
1. backend/models/Reservation.js          → Schema de MongoDB
2. backend/controllers/reservationController.js  → Lógica CRUD
3. backend/routes/reservationRoutes.js    → Endpoints
4. backend/server.js                      → Registrar rutas

↓ API REST disponible en /api/reservations

FRONTEND (Next.js)
==================
5. frontend/lib/api.js                    → Funciones fetch
6. frontend/app/reservations/page.jsx     → Página UI
7. frontend/components/Header.jsx         → Agregar navegación
```

---

## 🎯 PARA CUALQUIER NUEVA FUNCIONALIDAD

Usa esta misma estructura:

| Funcionalidad | Modelo | Controlador | Ruta | Página Frontend |
|---------------|--------|-------------|------|-----------------|
| **Menú** | `Menu.js` | `menuController.js` | `menuRoutes.js` | `app/menu/page.jsx` |
| **Reservaciones** | `Reservation.js` | `reservationController.js` | `reservationRoutes.js` | `app/reservations/page.jsx` |
| **Contacto** | `Contact.js` | `contactController.js` | `contactRoutes.js` | `app/contact/page.jsx` |
| **Órdenes** | `Order.js` | `orderController.js` | `orderRoutes.js` | `app/orders/page.jsx` |

---

## ✅ CHECKLIST

Antes de probar tu nueva funcionalidad:

- [ ] Modelo creado en `backend/models/`
- [ ] Controlador creado en `backend/controllers/`
- [ ] Ruta creada en `backend/routes/`
- [ ] Ruta registrada en `backend/server.js`
- [ ] Backend reiniciado (`npm run dev`)
- [ ] Funciones agregadas en `frontend/lib/api.js`
- [ ] Página creada en `frontend/app/`
- [ ] Link agregado en `Header.jsx`
- [ ] Frontend reiniciado (`npm run dev`)

---

## 🧪 PROBAR LA FUNCIONALIDAD

### Backend (API)
```bash
# Crear reservación con curl
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@test.com","phone":"0999999999","date":"2025-12-25","time":"19:00","guests":4}'

# Ver todas las reservaciones
curl http://localhost:5000/api/reservations
```

### Frontend
1. Abre http://localhost:3000/reservations
2. Llena el formulario
3. Envía la reservación
4. Verifica en MongoDB Atlas que se guardó

---

## 📝 NOTAS IMPORTANTES

- **MongoDB Atlas** guarda todo automáticamente cuando usas `.create()` o `.save()`
- Los modelos definen la estructura de los datos
- Los controladores contienen toda la lógica
- Las rutas solo conectan URLs con controladores
- El frontend solo consume la API

---

**¡Con esta guía puedes crear cualquier funcionalidad siguiendo el mismo patrón!** 🚀
