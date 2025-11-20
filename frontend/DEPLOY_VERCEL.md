# Instrucciones para desplegar en Vercel

## Pasos para el despliegue del Frontend:

1. Asegúrate de tener tu código subido a GitHub

2. Ve a https://vercel.com y crea una cuenta (puedes usar GitHub)

3. Click en "Add New..." y selecciona "Project"

4. Importa tu repositorio de GitHub "Bocatto"

5. Configura el proyecto:
   - **Project Name:** bocatto-frontend (o el nombre que prefieras)
   - **Framework Preset:** Other
   - **Root Directory:** frontend
   - **Build Command:** (dejar vacío o "echo 'No build required'")
   - **Output Directory:** . (punto, indica la carpeta actual)
   - **Install Command:** (dejar vacío)

6. **IMPORTANTE:** En "Environment Variables" agrega:
   - No necesitas variables de entorno por ahora, pero puedes agregar:
   - `API_URL` = URL de tu backend en Render (cuando lo despliegues)

7. Click en "Deploy"

8. Espera a que se despliegue (toma menos de 1 minuto)

9. Una vez desplegado, obtendrás una URL como:
   https://bocatto-frontend.vercel.app

## Actualizaciones Automáticas:

- Cada vez que hagas push a la rama `main`, Vercel desplegará automáticamente
- Las pull requests también obtienen previews automáticos

## Configuración del Backend en el Frontend:

Una vez tengas la URL del backend en Render, actualiza el archivo:
`frontend/js/config.js`

Cambia:
```javascript
BASE_URL: 'http://localhost:5000'
```

Por:
```javascript
BASE_URL: 'https://tu-backend.onrender.com'
```

## Dominios Personalizados (Opcional):

En Vercel puedes agregar tu propio dominio personalizado desde la configuración del proyecto.
