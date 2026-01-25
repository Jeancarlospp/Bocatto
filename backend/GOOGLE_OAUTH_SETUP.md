# 🔐 Guía de Configuración de Google OAuth 2.0

Esta guía te ayudará a configurar Google OAuth para permitir a los clientes iniciar sesión con su cuenta de Google.

## 📋 Requisitos Previos

- Cuenta de Google
- Acceso a Google Cloud Console

## 🚀 Pasos de Configuración

### Paso 1: Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba a la izquierda)
3. Clic en **"Nuevo Proyecto"**
4. Nombre: `Bocatto Restaurant` (o el nombre que prefieras)
5. Clic en **"Crear"**
6. Espera a que se cree y selecciónalo

### Paso 2: Configurar la Pantalla de Consentimiento OAuth

1. En el menú lateral, ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** (para permitir cualquier cuenta de Google)
3. Clic en **"Crear"**
4. Completa la información:
   - **Nombre de la aplicación**: `Bocatto Restaurant`
   - **Correo de asistencia**: Tu correo
   - **Logo de la aplicación**: (Opcional) Sube el logo de Bocatto
   - **Página principal**: `http://localhost:3000` (o tu dominio de producción)
   - **Dominios autorizados**: Deja vacío por ahora
   - **Correo del desarrollador**: Tu correo
5. Clic en **"Guardar y continuar"**
6. En **"Alcances"** (Scopes):
   - Clic en **"Agregar o quitar alcances"**
   - Selecciona:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Clic en **"Actualizar"** y luego **"Guardar y continuar"**
7. En **"Usuarios de prueba"**:
   - Durante desarrollo, agrega tu correo de prueba
   - Clic en **"Guardar y continuar"**
8. Revisa el resumen y clic en **"Volver al panel"**

### Paso 3: Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Clic en **"+ Crear Credenciales"** → **"ID de cliente de OAuth"**
3. Tipo de aplicación: **"Aplicación web"**
4. Nombre: `Bocatto Web Client`
5. **URIs de redirección autorizados** (MUY IMPORTANTE):
   
   **Para desarrollo:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```
   
   **Para producción (Render + Vercel):**
   ```
   https://tu-backend-en-render.onrender.com/api/auth/google/callback
   ```

6. Clic en **"Crear"**
7. **¡GUARDA ESTAS CREDENCIALES!** Se mostrarán:
   - **Client ID**: `xxxxxxxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxx`

### Paso 4: Configurar Variables de Entorno

#### Backend (.env)

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (para redirección después del login)
FRONTEND_URL=http://localhost:3000

# Session Secret (genera uno único)
SESSION_SECRET=tu-session-secret-unico-y-seguro
```

#### Producción (Render)

En Render, agrega las mismas variables pero con URLs de producción:

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-client-secret
GOOGLE_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://tu-frontend.vercel.app
```

## 🔄 Flujo de Autenticación

```
1. Usuario hace clic en "Continuar con Google"
2. Frontend redirige a: /api/auth/google
3. Backend redirige a Google OAuth
4. Usuario inicia sesión en Google
5. Google redirige a: /api/auth/google/callback
6. Backend:
   - Recibe datos del usuario
   - Busca/crea usuario en DB
   - Genera JWT token
   - Setea cookie HttpOnly
7. Backend redirige a frontend: /?google_auth=success
8. Frontend detecta el parámetro y verifica sesión
9. ¡Usuario logueado!
```

## 🧪 Probar la Integración

1. Inicia el backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Inicia el frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Abre `http://localhost:3000`
4. Haz clic en "Iniciar Sesión"
5. Selecciona tab "Cliente"
6. Clic en "Continuar con Google"
7. Selecciona tu cuenta de Google
8. ¡Deberías estar logueado!

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback en Google Console coincida EXACTAMENTE con `GOOGLE_CALLBACK_URL`
- Incluye el protocolo (http/https) y el puerto

### Error: "access_denied"
- Asegúrate de que tu correo esté en "Usuarios de prueba" (solo necesario mientras la app está en modo de prueba)

### Error: "No se pudo obtener el email"
- Verifica que hayas agregado los scopes de email y profile

### Cookie no se setea
- Verifica que `FRONTEND_URL` esté correctamente configurado
- En producción, asegúrate de usar HTTPS

## 📱 Comportamiento del Usuario

### Nuevo usuario con Google:
- Se crea cuenta automáticamente
- Sin contraseña (usa solo Google para login)
- Rol: "client" (nunca admin)

### Usuario existente con mismo email:
- Se vincula cuenta de Google a la existente
- Puede usar ambos métodos: email/password Y Google

### Admin intenta usar Google:
- Error: "Los administradores no pueden usar Google OAuth"
- Debe usar credenciales tradicionales

## 🔒 Seguridad

- ✅ Las credenciales de Google NUNCA se exponen al frontend
- ✅ JWT se almacena en cookie HttpOnly (no accesible por JavaScript)
- ✅ Tokens tienen expiración de 24 horas
- ✅ Solo clientes pueden usar OAuth (admins bloqueados)
- ✅ Se usa `prompt: 'select_account'` para siempre mostrar selector de cuenta

## 📦 Publicar en Producción

Cuando estés listo para producción:

1. En Google Cloud Console, ve a "Pantalla de consentimiento OAuth"
2. Clic en **"Publicar app"**
3. Completa la verificación de Google (puede tomar días)
4. Una vez verificado, cualquier cuenta de Google puede usarse

---

**Siguiente paso sugerido:** [Implementar 2FA para mayor seguridad](./2FA_SETUP.md) (Fase 2)
