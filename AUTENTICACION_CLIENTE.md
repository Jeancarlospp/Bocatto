# 🔐 Sistema de Autenticación de Clientes - Bocatto

## 📋 Resumen de la Implementación

Se ha implementado un sistema completo de autenticación para clientes (usuarios finales) que coexiste con el sistema de administración existente, utilizando la misma infraestructura de sesiones (JWT + HTTPOnly cookies).

---

## 🗄️ 1. MODELO DE USUARIO (`User`)

### Archivo: `backend/models/User.js`

El modelo `User` ahora soporta **dos tipos de roles**:

```javascript
role: {
  type: String,
  enum: ['admin', 'client'],
  default: 'client'
}
```

### Campos del Modelo:

**Comunes (Admin y Cliente):**
- `firstName`: Nombre (requerido)
- `lastName`: Apellido (requerido)
- `email`: Correo electrónico único (requerido)
- `password`: Contraseña hash (requerido si no usa Google OAuth)
- `role`: 'admin' o 'client'
- `isActive`: Estado de la cuenta (boolean)
- `lastLogin`: Última fecha de inicio de sesión
- `createdAt`, `updatedAt`: Timestamps automáticos

**Específicos de Cliente:**
- `phone`: Teléfono (opcional)
- `address`: Dirección (opcional)
- `loyaltyPoints`: Puntos de lealtad (default: 0)
- `googleId`: ID de Google OAuth (para futura implementación, unique sparse)

**Específicos de Admin:**
- `acceso`: 'FULL_ACCESS' o 'LIMITED_ACCESS'
- `adminAcceso`: 'SUPER_ADMIN' o 'MANAGER'

### Cambios Realizados:
✅ Actualizado el campo `password.required` para permitir clientes con Google OAuth (futuro)
✅ Mantiene compatibilidad total con usuarios admin existentes
✅ Soft delete mediante `isActive`

---

## 🔌 2. ENDPOINTS DE BACKEND

### Archivo: `backend/routes/authRoutes.js`

### **Rutas de Cliente** (Base: `/api/auth`)

#### 1. **POST /api/auth/client/register**
**Registro de nuevo cliente**

**Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@email.com",
  "password": "secret123",
  "phone": "+593 999 999 999",  // opcional
  "address": "Av. Principal 123"  // opcional
}
```

**Validaciones:**
- ✅ Todos los campos obligatorios presentes
- ✅ Email único en la base de datos
- ✅ Contraseña mínimo 6 caracteres
- ✅ No puede crear un admin desde este endpoint (role forzado a 'client')

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Registro exitoso.",
  "user": {
    "id": "...",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "role": "client",
    "loyaltyPoints": 0
  }
}
```

**Comportamiento:**
- Auto-login después del registro (establece cookie authToken)
- `loyaltyPoints` inicial en 0
- `isActive` = true por defecto
- Actualiza `lastLogin`

---

#### 2. **POST /api/auth/client/login**
**Inicio de sesión de cliente**

**Body:**
```json
{
  "email": "juan@email.com",
  "password": "secret123"
}
```

**Validaciones:**
- ✅ Credenciales correctas
- ✅ Usuario existe
- ✅ `role === 'client'` (los admin no pueden usar este endpoint)
- ✅ `isActive === true`

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "user": {
    "id": "...",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "role": "client",
    "loyaltyPoints": 150
  }
}
```

**Cookie establecida:**
```
authToken: JWT_TOKEN
httpOnly: true
secure: true (en producción)
sameSite: 'none' (en producción) / 'lax' (en desarrollo)
maxAge: 24 horas
```

---

#### 3. **POST /api/auth/client/logout**
**Cierre de sesión de cliente**

**Requiere:** Token JWT válido (cookie authToken)

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente."
}
```

**Comportamiento:**
- Limpia la cookie `authToken`
- Establece headers anti-cache para evitar problemas con botón "Atrás"
- No requiere que sea específicamente un cliente (también funciona para admin)

---

#### 4. **GET /api/auth/client/verify**
**Verificar sesión de cliente**

**Requiere:** Token JWT válido + role === 'client'

**Respuesta (200):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "role": "client",
    "loyaltyPoints": 150,
    "phone": "+593 999 999 999",
    "address": "Av. Principal 123"
  }
}
```

---

### **Sistema de Sesiones (Reutilizado del Admin)**

#### Características:
- **JWT Token** generado con:
  - `userId`: ID de MongoDB
  - `email`: Email del usuario
  - `role`: 'admin' o 'client'
  - Expiración: 24 horas

- **Cookie HTTPOnly** con configuración de seguridad:
  ```javascript
  {
    httpOnly: true,  // Previene XSS
    secure: process.env.NODE_ENV === 'production',  // HTTPS en prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // Cross-site en prod
    maxAge: 24 * 60 * 60 * 1000  // 24 horas
  }
  ```

- **Middleware de Autenticación** (`authenticateToken`):
  - Lee token desde cookie `authToken`
  - Verifica firma JWT
  - Valida que el usuario exista y esté activo
  - Adjunta `req.user` con datos del usuario

- **Middleware de Autorización Admin** (`isAdmin`):
  - Verifica que `req.user.role === 'admin'`
  - Impide que clientes accedan a rutas de admin

---

## 🎨 3. FRONTEND - COMPONENTES

### A. Hook de Autenticación: `hooks/useClientAuth.js`

**Custom hook** que maneja el estado de autenticación del cliente.

#### Exports:
```javascript
const {
  user,              // Usuario actual o null
  loading,           // Boolean: cargando estado de auth
  isAuthenticated,   // Boolean: si hay usuario autenticado
  login,             // Function: (email, password) => Promise
  register,          // Function: (userData) => Promise
  logout,            // Function: () => Promise
  refreshUser        // Function: () => void (refresca datos)
} = useClientAuth();
```

#### Uso:
```javascript
// En cualquier componente
import { useClientAuth } from '@/hooks/useClientAuth';

function MyComponent() {
  const { user, login, logout } = useClientAuth();
  
  if (user) {
    return <p>Hola, {user.firstName}!</p>;
  }
  
  return <button onClick={() => login('email', 'pass')}>Login</button>;
}
```

---

### B. Header Actualizado: `components/Header.jsx`

**Cambios principales:**

1. **Integración con `useClientAuth`:**
   ```javascript
   const { user, loading, logout } = useClientAuth();
   ```

2. **Renderizado Condicional:**

   **Si NO está autenticado:**
   ```jsx
   <button onClick={() => setIsLoginModalOpen(true)}>
     Ingresar
   </button>
   ```

   **Si SÍ está autenticado:**
   ```jsx
   <div className="relative">
     <button onClick={() => setShowUserMenu(!showUserMenu)}>
       <UserIcon />
       {user.firstName}
       <ChevronIcon />
     </button>
     
     {showUserMenu && (
       <div className="dropdown">
         <div>{user.firstName} {user.lastName}</div>
         <div>{user.email}</div>
         {/* <Link href="/my-account">Mi cuenta</Link> */}  // Preparado para futuro
         <button onClick={handleLogout}>Cerrar sesión</button>
       </div>
     )}
   </div>
   ```

3. **Estado de Carga:**
   ```jsx
   {loading && <Spinner />}
   ```

4. **Logout con Redirección:**
   ```javascript
   const handleLogout = async () => {
     const result = await logout();
     setShowUserMenu(false);
     if (result.success) {
       router.push('/');
     }
   };
   ```

---

### C. Modal de Login/Registro: `components/LoginModal.jsx`

**Estructura del Modal:**

```
┌─────────────────────────────────────┐
│  [X] Cerrar                          │
│                                      │
│  Iniciar Sesión                      │
│                                      │
│  [Administrador] [Cliente]  ← Tabs  │
│  ─────────────────────────────────  │
│                                      │
│  // SI TAB = ADMIN:                 │
│  [Email]                             │
│  [Password]                          │
│  [Ingresar como Admin]               │
│                                      │
│  // SI TAB = CLIENTE:                │
│  [Iniciar Sesión] [Registrarse]     │
│                                      │
│    // SI = Iniciar Sesión:          │
│    [Email]                           │
│    [Password]                        │
│    [Iniciar Sesión]                  │
│    ───── o continúa con ─────        │
│    [🌐 Google (Próximamente)]       │
│                                      │
│    // SI = Registrarse:              │
│    [Nombre*] [Apellido*]             │
│    [Email*]                          │
│    [Password*]                       │
│    [Teléfono]                        │
│    [Dirección]                       │
│    [Crear Cuenta]                    │
│    ───── o regístrate con ────       │
│    [🌐 Google (Próximamente)]       │
└──────────────────────────────────────┘
```

#### Estados del Modal:
```javascript
const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'client'
const [clientView, setClientView] = useState('login'); // 'login' | 'register'
```

#### Funciones Principales:

**1. Login de Cliente:**
```javascript
const handleClientLogin = async (e) => {
  e.preventDefault();
  const result = await login(formData.email, formData.password);
  if (result.success) {
    handleClose(); // Cierra modal
    // Usuario actualizado automáticamente por useClientAuth
  } else {
    setError(result.message);
  }
};
```

**2. Registro de Cliente:**
```javascript
const handleClientRegister = async (e) => {
  e.preventDefault();
  
  // Validaciones frontend
  if (formData.password.length < 6) {
    setError('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  const result = await register({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password,
    phone: formData.phone || undefined,
    address: formData.address || undefined
  });
  
  if (result.success) {
    handleClose(); // Auto-login al registrarse
  } else {
    setError(result.message);
  }
};
```

**3. Google OAuth (Placeholder):**
```javascript
const handleGoogleLogin = () => {
  console.log('Google OAuth login - Future implementation');
  // TODO: Implementar flujo OAuth
  // Pasos preparados en comentarios del código
  alert('Inicio de sesión con Google estará disponible próximamente');
};
```

---

## 🔒 4. SEGURIDAD Y AUTORIZACIÓN

### Separación de Roles

#### Middleware de Autorización (`middleware/auth.js`):

**authenticateToken:**
- Verifica JWT token desde cookie
- Valida que el usuario exista y esté activo
- Adjunta `req.user` con todos los datos del usuario

**isAdmin:**
- SOLO permite usuarios con `role === 'admin'`
- Clientes con `role === 'client'` reciben 403 Forbidden

### Protección de Rutas:

**Backend:**
```javascript
// Rutas de admin - SOLO admin
router.post('/admin/login', adminLogin);
router.get('/admin/verify', authenticateToken, isAdmin, verifySession);

// Rutas de cliente - SOLO client
router.post('/client/login', clientLogin);
router.get('/client/verify', authenticateToken, verifyClientSession);
```

**Frontend:**
```javascript
// Layout de Admin (app/admin/layout.jsx)
useEffect(() => {
  const verifyAuth = async () => {
    const response = await fetch('/api/auth/admin/verify', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      router.replace('/'); // Redirige a home si no es admin
    }
  };
  verifyAuth();
}, []);
```

### Prevención de Acceso con Botón "Atrás":

**Backend (Logout):**
```javascript
res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
```

**Frontend:**
```javascript
// Después del logout
if (typeof window !== 'undefined') {
  window.history.replaceState(null, '', '/');
}
router.replace('/');
```

---

## 🌐 5. CONFIGURACIÓN PARA PRODUCCIÓN (Vercel + Render)

### Variables de Entorno:

**Backend (.env):**
```env
NODE_ENV=production
JWT_SECRET=tu_secret_super_seguro_aqui
FRONTEND_URL=https://bocatto-nu.vercel.app
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://bocatto.onrender.com
```

### Configuración de Cookies (Ya implementada):

```javascript
// En producción (NODE_ENV === 'production'):
{
  httpOnly: true,
  secure: true,        // HTTPS obligatorio
  sameSite: 'none',   // Permite cross-site (Vercel ↔ Render)
  maxAge: 24h
}

// En desarrollo:
{
  httpOnly: true,
  secure: false,       // HTTP permitido en localhost
  sameSite: 'lax',    // Mismo sitio
  maxAge: 24h
}
```

### CORS (Backend):
```javascript
app.use(cors({
  origin: [
    'https://bocatto-nu.vercel.app',  // Producción
    'http://localhost:3000'           // Desarrollo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

---

## 🚀 6. PREPARACIÓN PARA FUTURAS FUNCIONALIDADES

### A. Restricción de Reservaciones (Preparado)

El hook `useClientAuth` ya está listo para bloquear reservaciones:

```javascript
// En la página de reservaciones (futuro):
const { isAuthenticated, user } = useClientAuth();

const handleReservationClick = (areaId) => {
  if (!isAuthenticated) {
    // Abrir modal de login
    setShowLoginModal(true);
    return;
  }
  
  // Continuar con flujo de reservación
  openReservationForm(areaId, user);
};
```

### B. Google OAuth (Placeholder Implementado)

**Lo que está listo:**
- ✅ Botón visual de "Continuar con Google"
- ✅ Campo `googleId` en modelo User
- ✅ Comentarios con pasos de implementación en el código

**Próximos pasos (futuro):**
```javascript
// 1. Crear credenciales en Google Cloud Console
// 2. Configurar OAuth consent screen
// 3. Backend: GET /api/auth/google (redirect a Google)
// 4. Backend: GET /api/auth/google/callback (procesar respuesta)
// 5. Frontend: Habilitar botón y redirigir a endpoint de Google
```

### C. Página "Mi Cuenta" (Preparado)

En el Header, el dropdown tiene espacio comentado para:
```jsx
{/* 
<Link href="/my-account">
  Mi cuenta
</Link> 
*/}
```

Cuando se implemente `/my-account`:
- Ver perfil
- Editar datos personales
- Ver historial de reservaciones
- Ver puntos de lealtad
- Cambiar contraseña

---

## 📊 7. FLUJO COMPLETO DE AUTENTICACIÓN

### Registro de Nuevo Cliente:

```
1. Usuario abre modal de login
   ↓
2. Selecciona tab "Cliente"
   ↓
3. Click en "Registrarse"
   ↓
4. Llena formulario (nombre, apellido, email, password)
   ↓
5. Frontend valida campos
   ↓
6. POST /api/auth/client/register
   ↓
7. Backend valida email único
   ↓
8. Backend hashea password (bcrypt)
   ↓
9. Backend crea usuario con role='client'
   ↓
10. Backend genera JWT token
   ↓
11. Backend establece cookie authToken
   ↓
12. Frontend recibe usuario en respuesta
   ↓
13. useClientAuth actualiza estado
   ↓
14. Modal se cierra
   ↓
15. Header muestra nombre de usuario
   ↓
✅ Usuario registrado y autenticado
```

### Login de Cliente Existente:

```
1. Usuario abre modal de login
   ↓
2. Selecciona tab "Cliente"
   ↓
3. Llena email y password
   ↓
4. POST /api/auth/client/login
   ↓
5. Backend busca usuario por email
   ↓
6. Backend verifica role === 'client'
   ↓
7. Backend compara password hash
   ↓
8. Backend actualiza lastLogin
   ↓
9. Backend genera JWT token
   ↓
10. Backend establece cookie authToken
   ↓
11. Frontend recibe usuario en respuesta
   ↓
12. useClientAuth actualiza estado
   ↓
13. Modal se cierra
   ↓
14. Header muestra nombre de usuario
   ↓
✅ Usuario autenticado
```

### Verificación de Sesión (Al cargar página):

```
1. Componente con useClientAuth se monta
   ↓
2. useEffect ejecuta checkAuth()
   ↓
3. GET /api/auth/client/verify (con cookie)
   ↓
4. Backend verifica JWT token
   ↓
5. Backend valida usuario activo
   ↓
6. Backend devuelve datos de usuario
   ↓
7. Frontend actualiza estado user
   ↓
8. Header renderiza menú de usuario
   ↓
✅ Sesión verificada
```

### Logout:

```
1. Usuario click en "Cerrar sesión"
   ↓
2. handleLogout() ejecuta logout()
   ↓
3. POST /api/auth/client/logout (con cookie)
   ↓
4. Backend limpia cookie authToken
   ↓
5. Backend establece headers anti-cache
   ↓
6. Frontend limpia estado user (null)
   ↓
7. Dropdown se cierra
   ↓
8. Router redirige a home (/)
   ↓
9. Header muestra botón "Ingresar"
   ↓
✅ Sesión cerrada
```

---

## ✅ 8. CHECKLIST DE IMPLEMENTACIÓN

### Backend:
- [x] Modelo User actualizado con soporte para clientes
- [x] Controller con funciones de registro, login, logout de cliente
- [x] Rutas de cliente en authRoutes.js
- [x] Middleware de autenticación reutilizado
- [x] Middleware isAdmin para proteger rutas de admin
- [x] Sistema de cookies con flags de seguridad
- [x] Validaciones de email único y contraseñas
- [x] Hasheo de contraseñas con bcrypt
- [x] Actualización de lastLogin
- [x] Mensajes de error en español

### Frontend:
- [x] Hook useClientAuth creado
- [x] Header actualizado con renderizado condicional
- [x] Dropdown de usuario con logout
- [x] LoginModal con tabs Admin/Cliente
- [x] Formulario de login de cliente
- [x] Formulario de registro de cliente
- [x] Placeholder de Google OAuth
- [x] Validaciones frontend
- [x] Manejo de errores
- [x] Estados de carga
- [x] Redirección después de logout
- [x] Prevención de acceso con botón "Atrás"

### Seguridad:
- [x] Clientes no pueden acceder a panel de admin
- [x] Admins no pueden usar endpoints de cliente
- [x] Cookies HTTPOnly (previene XSS)
- [x] Configuración secure en producción (HTTPS)
- [x] SameSite configurado para cross-site
- [x] JWT con expiración de 24h
- [x] Verificación de isActive
- [x] Headers anti-cache en logout

### Preparación Futura:
- [x] Campo googleId en modelo User
- [x] Placeholder visual de Google OAuth
- [x] Comentarios de implementación OAuth
- [x] Hook preparado para restricción de reservaciones
- [x] Espacio para "Mi cuenta" en dropdown

---

## 🎯 9. CONCLUSIÓN

El sistema de autenticación de clientes está **100% funcional** y cumple con todos los requisitos:

✅ **Registro y login tradicional** (email + password)  
✅ **Reutiliza sistema de sesiones del admin** (mismo JWT, cookies, middleware)  
✅ **Navbar actualizado** con renderizado condicional  
✅ **Separación total de roles** (admin ≠ client)  
✅ **Seguridad robusta** (HTTPOnly, secure, sameSite)  
✅ **Configurado para producción** (Vercel + Render)  
✅ **Placeholder de Google OAuth** (preparado para futuro)  
✅ **Prevención de acceso con "Atrás"** (headers anti-cache)  
✅ **Preparado para restricción de reservaciones** (hook listo)  

El sistema es escalable, seguro y mantiene la compatibilidad total con el panel de administración existente.
