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

6. En "Environment Variables" agrega:
   - `MONGODB_URI` = tu URI de MongoDB Atlas
   - `NODE_ENV` = production
   - `PORT` = (Render lo asigna automáticamente, no es necesario)

7. Click en "Create Web Service"

8. Espera a que se despliegue (verás los logs en tiempo real)

9. Una vez desplegado, obtendrás una URL como:
   https://bocatto-backend.onrender.com

## Notas importantes:

- Render puede tomar unos minutos en la primera ejecución
- El plan gratuito "duerme" después de 15 minutos de inactividad
- Actualiza la URL del backend en tu frontend para producción
