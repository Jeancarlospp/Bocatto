# Instrucciones para desplegar en Render

## Pasos para el despliegue:

1. Sube tu código a GitHub (asegúrate de que .env NO esté incluido)

2. Ve a https://render.com y crea una cuenta

3. Click en "New +" y selecciona "Web Service"

4. Conecta tu repositorio de GitHub "Bocatto"

5. Configura el servicio:
   - **Name:** bocatto-backend (o el nombre que prefieras)
   - **Region:** Oregon (o el más cercano)
   - **Branch:** main
   - **Root Directory:** backend
   - **Runtime:** Node
   - **Build Command:** npm install
   - **Start Command:** npm start

6. En "Environment Variables" agrega (MUY IMPORTANTE):
   ```
   MONGODB_URI = tu_uri_de_mongodb_atlas_aqui
   JWT_SECRET = tu_secreto_jwt_seguro_aqui
   NODE_ENV = production
   FRONTEND_URL = https://tu-dominio-vercel.vercel.app
   ```
   
   ⚠️ **NOTA CRÍTICA**: Asegúrate de que `JWT_SECRET` sea el mismo que usas localmente.
   Si no lo tienes, genera uno nuevo con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

7. Click en "Create Web Service"

8. Espera a que se despliegue (verás los logs en tiempo real)

9. Una vez desplegado, obtendrás una URL como:
   https://bocatto-backend.onrender.com

## Verificación del Despliegue:

Después de desplegar, verifica que:

1. En los logs de Render aparezca:
   ```
   ✅ MongoDB conectado: [nombre del cluster]
   🔐 JWT Secret configurado: Sí
   🗄️ MongoDB URI configurado: Sí
   ```

2. Prueba el endpoint de salud:
   ```
   https://bocatto-backend.onrender.com/
   ```
   Debe devolver: `{ "message": "Bienvenido a la API de Bocatto Restaurant", ... }`

3. Actualiza el frontend en Vercel:
   - Ve a tu proyecto en Vercel > Settings > Environment Variables
   - Agrega/actualiza: `NEXT_PUBLIC_API_URL = https://bocatto-backend.onrender.com`
   - Redeploya el frontend

## Solución de Problemas:

### El carrito no se actualiza en producción:
1. Verifica que `JWT_SECRET` esté configurado correctamente en Render
2. Verifica que `MONGODB_URI` apunte a la misma base de datos (o una de producción)
3. Revisa los logs en Render para ver errores
4. Verifica que el frontend tenga la URL correcta del backend

### Error 500 al agregar al carrito:
- Revisa los logs de Render (puede ser un error de conexión a MongoDB)
- Verifica que todas las variables de entorno estén configuradas

### CORS errors:
- Asegúrate de que la URL de tu frontend de Vercel esté en la lista de CORS en `server.js`
- El backend ya está configurado para aceptar peticiones de Vercel

## Notas importantes:

- Render puede tomar unos minutos en la primera ejecución
- El plan gratuito "duerme" después de 15 minutos de inactividad
- La primera petición después de dormir puede tardar 30-60 segundos
- Actualiza la URL del backend en tu frontend para producción
