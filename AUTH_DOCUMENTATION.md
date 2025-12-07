# 🔐 SISTEMA DE AUTENTICACIÓN - BOCATTO

## 📝 RESUMEN DE ARCHIVOS CREADOS/MODIFICADOS

### Backend:
1. ✅ `backend/models/User.js` - Modelo de usuario con encriptación
2. ✅ `backend/middleware/auth.js` - Middleware de autenticación JWT
3. ✅ `backend/controllers/authController.js` - Controladores de login/logout
4. ✅ `backend/routes/authRoutes.js` - Rutas de autenticación
5. ✅ `backend/server.js` - Modificado (cookie-parser y rutas auth)
6. ✅ `backend/scripts/createFirstAdmin.js` - **Script temporal para crear primer admin**

### Frontend:
1. ✅ `frontend/components/LoginModal.jsx` - Modal de login con 2 opciones
2. ✅ `frontend/components/AdminSidebar.jsx` - Sidebar modular del admin
3. ✅ `frontend/components/Header.jsx` - Modificado (botón Ingresar abre modal)
4. ✅ `frontend/app/admin/layout.jsx` - Layout protegido del dashboard
5. ✅ `frontend/app/admin/page.jsx` - Página principal del dashboard

---

## 🔑 CÓMO FUNCIONA EL LOGIN/LOGOUT DE ADMIN

### **Login:**

1. **Usuario hace clic en "Ingresar"** → Se abre el modal `LoginModal`
2. **Selecciona pestaña "Administrador"** → Muestra formulario email/password
3. **Ingresa credenciales** → Formulario envía POST a `/api/auth/admin/login`
4. **Backend valida**:
   - Email existe
   - Usuario es admin (role === 'admin')
   - Contraseña correcta (bcrypt.compare)
   - Cuenta activa (isActive === true)
5. **Si es válido**:
   - Genera JWT con userId, email, role
   - Establece cookie HTTPOnly llamada `authToken`
   - Cookie expira en 24 horas
   - Devuelve datos del usuario
6. **Frontend recibe respuesta**:
   - Cierra el modal
   - Redirige a `/admin` (dashboard)
7. **Al entrar a /admin**:
   - Layout verifica autenticación con GET `/api/auth/admin/verify`
   - Si válido → Muestra dashboard
   - Si no → Redirige a home

### **Logout:**

1. **Usuario hace clic en "Cerrar Sesión"** en el sidebar
2. **Frontend envía POST** a `/api/auth/admin/logout`
3. **Backend**:
   - Elimina la cookie `authToken`
   - Establece headers anti-cache (Cache-Control, Pragma, Expires)
4. **Frontend**:
   - Limpia historial del navegador (window.history.replaceState)
   - Redirige a home `/`
5. **Resultado**: 
   - Usuario no puede usar botón "Atrás" para volver al admin
   - Cookie eliminada → Cualquier intento de acceso falla

---

## 🛡️ CÓMO SE PROTEGEN LAS RUTAS

### **Backend (Middleware):**

Las rutas admin están protegidas con 2 middlewares:

```javascript
// authRoutes.js
router.get('/admin/verify', authenticateToken, isAdmin, verifySession);
```

1. **authenticateToken**: Verifica que existe JWT válido en cookies
   - Decodifica el token
   - Busca el usuario en DB
   - Verifica que esté activo
   - Adjunta `req.user` para siguiente middleware

2. **isAdmin**: Verifica que el usuario sea admin
   - Chequea `req.user.role === 'admin'`
   - Si no es admin → Error 403

### **Frontend (Layout protegido):**

`/app/admin/layout.jsx` verifica autenticación en cada carga:

```javascript
useEffect(() => {
  verifyAuth(); // Verifica token al montar componente
}, []);
```

**Flujo de verificación:**
1. Componente se monta
2. Llama a `/api/auth/admin/verify` con cookies incluidas
3. Si respuesta exitosa → Muestra contenido
4. Si falla → `router.replace('/')` (redirige a home)

**¿Por qué `router.replace` en lugar de `router.push`?**
- `replace` NO agrega entrada al historial
- Usuario no puede usar "Atrás" para volver

### **Prevención de acceso por botón "Atrás":**

1. **Headers anti-cache** en logout:
   ```javascript
   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
   ```
   - Navegador NO cachea la página
   - Cada visita requiere nueva petición al servidor

2. **Limpieza de historial**:
   ```javascript
   window.history.replaceState(null, '', '/');
   ```
   - Reemplaza entrada actual en historial
   - Evita "volver" a página protegida

3. **Verificación en cada carga**:
   - Layout llama `verifyAuth()` en mount
   - Si token inválido/expirado → Redirige

---

## ➕ CÓMO AGREGAR NUEVAS OPCIONES AL DASHBOARD

### **1. Agregar enlace al Sidebar:**

Edita `frontend/components/AdminSidebar.jsx`:

```javascript
const menuItems = [
  // ... secciones existentes ...
  {
    section: 'Nueva Sección',  // Nombre del grupo
    items: [
      { 
        label: 'Nueva Opción',        // Texto del enlace
        href: '/admin/nueva-ruta',    // Ruta de la página
        icon: '🆕'                    // Emoji o icono
      }
    ]
  }
];
```

**Características del Sidebar:**
- Expansible/colapsable (icono ⇆)
- Destaca ruta activa (fondo naranja)
- Agrupa opciones por secciones
- Muestra solo iconos cuando está contraído

### **2. Crear la página correspondiente:**

Crea `frontend/app/admin/nueva-ruta/page.jsx`:

```javascript
export default function NuevaRuta() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Nueva Opción
      </h2>
      {/* Tu contenido aquí */}
    </div>
  );
}
```

**Nota**: NO necesitas crear `layout.jsx` para cada subruta. El layout de `/admin/layout.jsx` se hereda automáticamente.

### **3. Si requiere API backend:**

Sigue el patrón del `WORKFLOW.md`:

1. Crear modelo en `backend/models/NuevoModelo.js`
2. Crear controlador en `backend/controllers/nuevoController.js`
3. Crear rutas en `backend/routes/nuevoRoutes.js`
4. Registrar en `server.js`: `app.use('/api/nuevo', nuevoRoutes)`
5. Proteger con middleware si es necesario:
   ```javascript
   router.get('/', authenticateToken, isAdmin, listarTodo);
   ```

---

## ➕ CÓMO AGREGAR NUEVAS OPCIONES AL MODAL DE LOGIN

### **Caso: Agregar login para "Empleados"**

Edita `frontend/components/LoginModal.jsx`:

#### **1. Agregar nueva pestaña:**

```javascript
const [activeTab, setActiveTab] = useState('admin'); // admin | client | employee

// En el JSX de tabs:
<button
  onClick={() => {
    setActiveTab('employee');
    setError('');
  }}
  className={/* estilos condicionales */}
>
  Empleado
</button>
```

#### **2. Agregar formulario para empleados:**

```javascript
{activeTab === 'employee' && (
  <form onSubmit={handleEmployeeLogin} className="space-y-4">
    {/* Campos de formulario */}
  </form>
)}
```

#### **3. Crear handler de login:**

```javascript
const handleEmployeeLogin = async (e) => {
  e.preventDefault();
  // Lógica similar a handleAdminLogin
  const response = await fetch('/api/auth/employee/login', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(formData)
  });
  // ... manejo de respuesta
};
```

#### **4. Agregar ruta en backend:**

```javascript
// backend/routes/authRoutes.js
router.post('/employee/login', employeeLogin);
```

**Patrón**: Cada tipo de usuario tiene su propia ruta y lógica de autenticación.

---

## 🔐 FLUJO COMPLETO DE AUTENTICACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                      INICIO DE SESIÓN                        │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Ingresar" (Header)                 │
│    → Se abre LoginModal                                     │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Usuario selecciona pestaña "Administrador"               │
│    → Muestra formulario email/password                      │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Usuario ingresa credenciales y hace clic en "Ingresar"   │
│    → POST /api/auth/admin/login                             │
│    → Body: { email, password }                              │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend valida:                                          │
│    ✓ Email existe en BD                                    │
│    ✓ Usuario tiene role='admin'                            │
│    ✓ Cuenta está activa (isActive=true)                    │
│    ✓ Password coincide (bcrypt.compare)                    │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Si válido:                                               │
│    → Genera JWT (exp: 24h)                                 │
│    → Establece cookie HTTPOnly 'authToken'                 │
│    → Actualiza lastLogin en BD                             │
│    → Devuelve datos del usuario                            │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend recibe respuesta exitosa:                       │
│    → Cierra modal                                           │
│    → router.push('/admin')                                  │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Al cargar /admin:                                        │
│    → layout.jsx llama verifyAuth()                          │
│    → GET /api/auth/admin/verify (con cookies)              │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Backend verifica:                                        │
│    → authenticateToken: Decodifica JWT, busca user         │
│    → isAdmin: Verifica role='admin'                        │
│    → Devuelve datos del usuario                            │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Frontend muestra dashboard admin con:                    │
│    → Sidebar con menú de navegación                        │
│    → Top bar con nombre del admin                          │
│    → Contenido de la página                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CIERRE DE SESIÓN                        │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Cerrar Sesión" (Sidebar)          │
│    → POST /api/auth/admin/logout                            │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend:                                                 │
│    → Elimina cookie 'authToken'                            │
│    → Establece headers anti-cache                          │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend:                                                │
│    → window.history.replaceState(null, '', '/')            │
│    → router.replace('/')                                    │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Usuario redirigido a home                                │
│    → Cookie eliminada → No puede acceder a /admin          │
│    → Botón "Atrás" no permite volver                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 ENDPOINTS DE AUTENTICACIÓN

### POST `/api/auth/admin/login`
**Descripción**: Login de administradores  
**Body**:
```json
{
  "email": "admin@bocatto.com",
  "password": "Admin123!"
}
```
**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": "...",
    "firstName": "Admin",
    "lastName": "Bocatto",
    "email": "admin@bocatto.com",
    "role": "admin",
    "adminAcceso": "SUPER_ADMIN"
  }
}
```
**Errores**:
- 400: Datos incompletos
- 401: Email/password incorrectos
- 403: No es admin o cuenta inactiva

---

### POST `/api/auth/admin/logout`
**Descripción**: Cierre de sesión  
**Headers**: Requiere cookie `authToken`  
**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Logout successful."
}
```

---

### GET `/api/auth/admin/verify`
**Descripción**: Verificar sesión actual  
**Headers**: Requiere cookie `authToken`  
**Middleware**: `authenticateToken`, `isAdmin`  
**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "firstName": "Admin",
    "lastName": "Bocatto",
    "email": "admin@bocatto.com",
    "role": "admin",
    "adminAcceso": "SUPER_ADMIN"
  }
}
```
**Errores**:
- 401: Token inválido/expirado
- 403: No es admin

---

## 🔒 SEGURIDAD IMPLEMENTADA

### **1. Password Hashing:**
- Bcrypt con 10 salt rounds
- Hash automático en `User.pre('save')`
- Nunca se almacena contraseña en texto plano

### **2. JWT (JSON Web Tokens):**
- Secret key en `.env` (JWT_SECRET)
- Expiración: 24 horas
- Payload: userId, email, role

### **3. HTTPOnly Cookies:**
- Cookie `authToken` no accesible desde JavaScript
- Protección XSS (Cross-Site Scripting)
- `sameSite: 'strict'` → Protección CSRF

### **4. CORS Configurado:**
- Whitelist de origins permitidos
- `credentials: true` → Permite cookies

### **5. Validaciones:**
- Role verification (solo admins)
- Account status (isActive)
- Token expiration
- Email uniqueness

### **6. Anti-Cache Headers:**
- `Cache-Control: no-store, no-cache`
- Previene acceso después de logout

---

## ⚙️ VARIABLES DE ENTORNO NECESARIAS

Asegúrate de tener en `backend/.env`:

```env
# JWT Secret (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=bocatto_secret_key_2024

# MongoDB (ya configurado)
MONGODB_URI=mongodb+srv://...

# Server
PORT=5000
NODE_ENV=development
```

**⚠️ IMPORTANTE**: Cambia `JWT_SECRET` a un valor aleatorio seguro en producción:
```powershell
# Generar secret random
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🧪 CÓMO PROBAR EL SISTEMA

### **1. Crear el primer admin:**
```powershell
cd backend
node scripts/createFirstAdmin.js
```

### **2. Iniciar servidores:**
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **3. Probar login:**
1. Abrir http://localhost:3000
2. Clic en "Ingresar"
3. Seleccionar pestaña "Administrador"
4. Ingresar:
   - Email: admin@bocatto.com
   - Password: Admin123!
5. Clic "Ingresar como Admin"
6. Deberías ver el dashboard en `/admin`

### **4. Probar protección de rutas:**
1. Estando logueado, copiar URL del admin
2. Hacer logout
3. Intentar acceder a la URL copiada
4. Deberías ser redirigido a home

### **5. Probar botón "Atrás":**
1. Loguearse
2. Entrar al dashboard
3. Hacer logout
4. Presionar botón "Atrás" del navegador
5. NO deberías poder ver contenido del admin

---

## 📚 PRÓXIMOS PASOS SUGERIDOS

### **Para Clientes (Google OAuth):**
1. Configurar Google Cloud Console
2. Obtener Client ID y Client Secret
3. Implementar ruta `/api/auth/google`
4. Agregar redirect callback
5. Activar botón en LoginModal

### **Para Empleados:**
1. Agregar role `employee` al modelo User
2. Crear ruta `/api/auth/employee/login`
3. Crear dashboard separado en `/employee`
4. Agregar pestaña en LoginModal

### **Funcionalidades adicionales:**
1. "Olvidé mi contraseña" (reset password)
2. Cambiar contraseña desde dashboard
3. Crear otros admins desde panel
4. Logs de actividad admin
5. Two-factor authentication (2FA)

---

## ❓ PREGUNTAS FRECUENTES

### **¿Puedo tener múltiples admins?**
Sí, el primer admin puede crear otros admins. Necesitarás implementar una página en `/admin/admins` con un formulario que llame a POST `/api/users` (endpoint por crear).

### **¿Qué pasa si olvido la contraseña del admin?**
Deberás crear manualmente un nuevo admin usando el script `createFirstAdmin.js` con un email diferente, o modificar la contraseña directamente en MongoDB.

### **¿Puedo personalizar la duración del token?**
Sí, en `authController.js` línea:
```javascript
expiresIn: '24h' // Cambiar a '1h', '7d', etc.
```
También actualiza `maxAge` de la cookie para que coincida.

### **¿Cómo agrego más niveles de acceso admin?**
Usa el campo `adminAcceso` en el modelo User. Valores sugeridos:
- `SUPER_ADMIN`: Acceso total
- `EDITOR`: Puede editar contenido
- `VIEWER`: Solo lectura

Luego usa el middleware `checkAdminAccess('SUPER_ADMIN')` en rutas específicas.

---
