# 📐 ESTRUCTURA DE LAYOUTS - BOCATTO

## ✅ PROBLEMA RESUELTO

**Antes**: El navigation bar público aparecía en todas las páginas, incluido el panel de administración.

**Ahora**: Layouts completamente separados usando Route Groups de Next.js 13+.

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

```
frontend/app/
├── layout.js                    → RootLayout (solo <html> y <body>)
├── (public)/                    → Grupo de rutas públicas
│   ├── layout.jsx              → PublicLayout (Header + Footer)
│   ├── page.js                 → Página de inicio
│   ├── menu/
│   │   └── page.jsx
│   ├── reservations/
│   │   └── page.jsx
│   ├── offers/
│   │   └── page.jsx
│   ├── locations/
│   │   └── page.jsx
│   ├── about/
│   │   └── page.jsx
│   ├── contact/
│   │   └── page.jsx
│   └── login/
│       └── page.jsx
└── admin/                       → Rutas de administración
    ├── layout.jsx              → AdminLayout (Sidebar + Protección)
    └── page.jsx                → Dashboard principal
```

---

## 🎯 CÓMO FUNCIONA

### **1. RootLayout (app/layout.js)**
- **Propósito**: Layout raíz mínimo que envuelve toda la aplicación
- **Contenido**: Solo estructura HTML básica (`<html>`, `<body>`)
- **NO incluye**: Header, Footer, ni ningún componente visual
- **Se aplica a**: TODAS las rutas (/, /admin, etc.)

```javascript
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        {children}  {/* Solo renderiza children, sin wrappers */}
      </body>
    </html>
  );
}
```

---

### **2. PublicLayout (app/(public)/layout.jsx)**
- **Propósito**: Layout para páginas públicas del sitio
- **Contenido**: Header (navigation bar) + children + Footer
- **Se aplica a**: Solo rutas dentro de `(public)/`
  - `/` → Inicio
  - `/menu` → Menú
  - `/reservations` → Reservaciones
  - `/offers` → Ofertas
  - `/locations` → Ubicaciones
  - `/about` → Quiénes somos
  - `/contact` → Contáctenos
  - `/login` → Login (abre modal)

```javascript
export default function PublicPagesLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      <Header />        {/* Navigation bar negro superior */}
      <main className="flex-1">
        {children}      {/* Contenido de la página */}
      </main>
      <Footer />        {/* Footer del sitio */}
    </div>
  );
}
```

**Componentes incluidos:**
- `Header`: Navigation bar con enlaces (Inicio, Menú, Reservaciones, etc.) y botón "Ingresar"
- `Footer`: Pie de página con información del restaurante

---

### **3. AdminLayout (app/admin/layout.jsx)**
- **Propósito**: Layout para panel de administración
- **Contenido**: Sidebar + Top bar + children
- **NO incluye**: Header público ni Footer
- **Se aplica a**: Solo rutas dentro de `admin/`
  - `/admin` → Dashboard principal
  - `/admin/products` → Gestión de productos
  - `/admin/reservations` → Gestión de reservaciones
  - `/admin/*` → Cualquier subruta de admin

```javascript
export default function AdminLayout({ children }) {
  // ... lógica de verificación de autenticación ...
  
  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar onLogout={handleLogout} />  {/* Sidebar izquierdo */}
      
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          {/* Top bar con info del admin */}
        </div>
        
        <div className="p-8">
          {children}  {/* Contenido del dashboard */}
        </div>
      </main>
    </div>
  );
}
```

**Componentes incluidos:**
- `AdminSidebar`: Menú lateral con navegación del admin
- Top bar: Cabecera interna con nombre del admin y avatar
- **NO incluye**: Header ni Footer públicos

**Protección de rutas:**
- Verifica autenticación con JWT
- Si no autenticado → Redirige a `/`
- Si autenticado → Muestra contenido

---

## 🔍 DETECCIÓN DE LAYOUT

### **¿Cómo sabe Next.js qué layout usar?**

Next.js 13+ usa **Route Groups** (carpetas con paréntesis):

1. **Rutas en `(public)/`**:
   - URL: `/` → Archivo: `app/(public)/page.js`
   - URL: `/menu` → Archivo: `app/(public)/menu/page.jsx`
   - **Los paréntesis no afectan la URL**
   - Usan `app/(public)/layout.jsx` → Muestra Header + Footer

2. **Rutas en `admin/`**:
   - URL: `/admin` → Archivo: `app/admin/page.jsx`
   - URL: `/admin/products` → Archivo: `app/admin/products/page.jsx`
   - Usan `app/admin/layout.jsx` → Muestra Sidebar, NO Header público

3. **Herencia de layouts**:
   ```
   RootLayout (layout.js)
   └─┬─ PublicLayout ((public)/layout.jsx)
   │ └── Páginas públicas con Header + Footer
   │
   └─┬─ AdminLayout (admin/layout.jsx)
     └── Páginas admin con Sidebar, SIN Header
   ```

---

## ✅ VERIFICACIÓN

### **Navegación pública funciona normalmente:**
- ✅ Al visitar `/`, `/menu`, `/about`, etc. → Se ve Header negro superior
- ✅ Footer se muestra en todas las páginas públicas
- ✅ Botón "Ingresar" abre modal de login

### **Panel de administración independiente:**
- ✅ Al visitar `/admin` → NO se ve Header público
- ✅ Solo se ve: Sidebar "Bocatto Admin" + Dashboard
- ✅ Al hacer logout → Redirige a `/` con Header público nuevamente

---

## 🛠️ CÓMO AGREGAR NUEVAS PÁGINAS

### **Para agregar página pública:**
1. Crear carpeta en `app/(public)/nueva-pagina/`
2. Crear `app/(public)/nueva-pagina/page.jsx`
3. **Automáticamente** usará PublicLayout (Header + Footer)

```javascript
// app/(public)/nueva-pagina/page.jsx
export default function NuevaPagina() {
  return (
    <div>
      <h1>Nueva Página</h1>
    </div>
  );
}
```
URL: `http://localhost:3000/nueva-pagina` (con Header y Footer)

---

### **Para agregar página admin:**
1. Crear carpeta en `app/admin/nueva-seccion/`
2. Crear `app/admin/nueva-seccion/page.jsx`
3. **Automáticamente** usará AdminLayout (Sidebar, sin Header público)
4. Agregar enlace en `components/AdminSidebar.jsx`

```javascript
// app/admin/nueva-seccion/page.jsx
export default function NuevaSeccion() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Nueva Sección
      </h2>
      {/* Contenido */}
    </div>
  );
}
```
URL: `http://localhost:3000/admin/nueva-seccion` (con Sidebar, sin Header)

---

## 📋 RESUMEN DE CAMBIOS

### **Archivos modificados:**

1. **app/layout.js** (RootLayout):
   - ❌ Eliminado: `<Header />` y `<Footer />`
   - ✅ Ahora: Solo estructura HTML básica

2. **app/(public)/layout.jsx** (NUEVO):
   - ✅ Creado: PublicLayout con Header + Footer
   - ✅ Se aplica a todas las rutas públicas

3. **Archivos movidos**:
   - `app/page.js` → `app/(public)/page.js`
   - `app/menu/` → `app/(public)/menu/`
   - `app/reservations/` → `app/(public)/reservations/`
   - `app/offers/` → `app/(public)/offers/`
   - `app/locations/` → `app/(public)/locations/`
   - `app/about/` → `app/(public)/about/`
   - `app/contact/` → `app/(public)/contact/`
   - `app/login/` → `app/(public)/login/`

4. **app/admin/layout.jsx** (Sin cambios):
   - ✅ Ya estaba correcto
   - ✅ NO hereda Header del RootLayout

---

## 🎨 RESULTADO VISUAL

### **Antes (INCORRECTO):**
```
┌─────────────────────────────────────┐
│  BOCATTO (Header público - NEGRO)   │ ← Aparecía en admin
├─────────────────────────────────────┤
│ Sidebar │ Dashboard Admin           │
│  Admin  │                           │
└─────────────────────────────────────┘
```

### **Ahora (CORRECTO):**

**Páginas públicas:**
```
┌─────────────────────────────────────┐
│  BOCATTO (Header público - NEGRO)   │ ← Solo en públicas
├─────────────────────────────────────┤
│         Contenido página            │
├─────────────────────────────────────┤
│           Footer                    │
└─────────────────────────────────────┘
```

**Panel admin:**
```
┌─────────────────────────────────────┐
│ Sidebar │ Panel de Administración   │ ← Sin Header público
│  Admin  │ (Top bar interno)         │
│         ├───────────────────────────┤
│         │  Contenido Dashboard      │
└─────────────────────────────────────┘
```

---

## 🔒 SEGURIDAD

El AdminLayout incluye protección de rutas:
- Verifica JWT en cada carga
- Si token inválido → Redirige a `/`
- Si usuario no es admin → Redirige a `/`
- Loading state durante verificación

**No se requiere cambiar nada de la lógica de autenticación.**

---

## ✅ CHECKLIST POST-CORRECCIÓN

- [x] RootLayout no renderiza Header ni Footer
- [x] PublicLayout creado con Header + Footer
- [x] Todas las páginas públicas movidas a `(public)/`
- [x] AdminLayout no afectado, sigue funcionando
- [x] Navigation bar público NO aparece en `/admin`
- [x] Sidebar y dashboard admin funcionan correctamente
- [x] Al hacer logout desde admin → Vuelve a página pública con Header

---

**Documentación actualizada**: 7 de diciembre, 2025  
**Sistema**: Bocatto Restaurant - Layout Architecture  
**Patrón**: Route Groups (Next.js 13+ App Router)
