# ✅ Checklist de Producción - Bocatto

## Backend (Render)

### Variables de Entorno Requeridas:
- [ ] `MONGODB_URI` - URI de MongoDB Atlas (misma que local o una de producción)
- [ ] `JWT_SECRET` - Secreto JWT (DEBE ser el mismo que usas localmente)
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` - URL de Vercel (opcional, para referencia)

### Verificación de Logs:
Al iniciar el servidor, debes ver en los logs de Render:
```
🚀 Servidor corriendo en puerto [puerto]
🌍 Entorno: production
🔐 JWT Secret configurado: Sí
🗄️ MongoDB URI configurado: Sí
📍 CORS habilitado para dominios configurados
✅ MongoDB conectado: [nombre del cluster]
📊 Base de datos: [nombre de la base de datos]
```

### Test del API:
1. [ ] Visita: `https://tu-backend.onrender.com/`
2. [ ] Debe devolver: `{ "message": "Bienvenido a la API de Bocatto Restaurant", ... }`
3. [ ] Prueba agregar un producto al carrito desde el frontend en producción
4. [ ] Revisa los logs en Render para ver:
   ```
   === ADD TO CART ===
   Body: {...}
   ✅ Cart saved successfully: {...}
   ```

## Frontend (Vercel)

### Variables de Entorno Requeridas:
- [ ] `NEXT_PUBLIC_API_URL` = `https://tu-backend.onrender.com` (SIN barra al final)

### Verificación:
1. [ ] El frontend puede cargar el menú desde el backend
2. [ ] El carrito funciona correctamente
3. [ ] Los productos se agregan al carrito
4. [ ] El stock se actualiza correctamente
5. [ ] No hay errores de CORS en la consola del navegador

## Base de Datos (MongoDB Atlas)

### Verificación:
1. [ ] La conexión desde Render está permitida (IP 0.0.0.0/0 en Network Access)
2. [ ] El usuario de la base de datos tiene permisos de lectura/escritura
3. [ ] La URI es correcta y no tiene caracteres especiales sin codificar

### Colecciones a verificar:
- [ ] `carts` - Los carritos se crean y actualizan correctamente
- [ ] `products` (o `menus`) - Los productos tienen `currentStock` actualizado
- [ ] `users` - Los usuarios se autentican correctamente

## Problemas Comunes y Soluciones

### ❌ "El carrito no se actualiza en la base de datos"

**Causas posibles:**
1. JWT_SECRET diferente entre local y producción
2. MongoDB URI apuntando a bases de datos diferentes
3. Error al guardar el carrito (verifica logs)

**Solución:**
1. Verifica que `JWT_SECRET` sea EXACTAMENTE el mismo en local y Render
2. Verifica que `MONGODB_URI` apunte a la misma base de datos
3. Revisa los logs de Render: busca "✅ Cart saved successfully"
4. Si ves errores, cópialos y revisa el mensaje de error

### ❌ "Error 401 - Unauthorized"

**Causa:** JWT_SECRET diferente o token expirado

**Solución:**
1. Cierra sesión y vuelve a iniciar sesión
2. Limpia las cookies del navegador
3. Verifica que JWT_SECRET sea el mismo en ambos ambientes

### ❌ "CORS Error"

**Causa:** El dominio de Vercel no está en la lista de CORS

**Solución:**
1. Ve a `backend/server.js`
2. Agrega tu URL de Vercel al array de `cors.origin`
3. Ejemplo: `"https://bocatto-tu-usuario.vercel.app"`
4. Haz commit y push para redeployar

### ❌ "Error 500 - Internal Server Error"

**Causa:** Error en el servidor (probablemente MongoDB)

**Solución:**
1. Revisa los logs de Render
2. Busca el mensaje de error específico
3. Verifica que MongoDB esté conectado: "✅ MongoDB conectado"
4. Verifica que MONGODB_URI esté bien configurado

## Comando Útiles

### Generar JWT_SECRET nuevo:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Ver logs en tiempo real (Render):
1. Ve a tu servicio en Render
2. Click en "Logs"
3. Verás los logs en tiempo real

### Redeployar manualmente (Render):
1. Ve a tu servicio en Render
2. Click en "Manual Deploy" > "Deploy latest commit"

### Verificar variables de entorno (Render):
1. Ve a tu servicio en Render
2. Click en "Environment"
3. Verifica que todas las variables estén configuradas

## Debugging en Producción

Si algo no funciona, sigue estos pasos:

1. **Revisa los logs del backend en Render**
   - Busca mensajes de error
   - Verifica que MongoDB esté conectado
   - Busca "=== ADD TO CART ===" cuando agregues al carrito

2. **Abre la consola del navegador (F12)**
   - Pestaña "Console": busca errores de JavaScript o CORS
   - Pestaña "Network": verifica las peticiones al backend
   - Verifica que las URLs sean correctas

3. **Verifica la base de datos en MongoDB Atlas**
   - Ve a "Collections"
   - Revisa si los documentos se están creando/actualizando
   - Verifica el campo `currentStock` de los productos

4. **Compara local vs producción**
   - ¿Funciona en local pero no en producción?
   - Probablemente es un problema de configuración (variables de entorno)
   - ¿No funciona en ninguno?
   - Probablemente es un bug en el código

---

**Última actualización:** Enero 2026
**Versión:** 1.0.0
