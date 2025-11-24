# Instrucciones para desplegar en Vercel

## Pasos para el despliegue:

1. **Sube tu código a GitHub**
   ```bash
   git add .
   git commit -m "Migración a Next.js completada"
   git push origin main
   ```

2. **Ve a https://vercel.com** y crea una cuenta con GitHub

3. **Click en "Add New Project"**

4. **Selecciona el repositorio "Bocatto"**

5. **Configura el proyecto:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (detectado automáticamente)
   - **Build Command:** `npm run build` (por defecto)
   - **Output Directory:** `.next` (por defecto)

6. **Agregar Variable de Entorno:**
   - `NEXT_PUBLIC_API_URL` = `https://bocatto.onrender.com`

7. **Click en "Deploy"**

8. Espera a que termine (1-2 minutos)

9. Obtendrás una URL como:
   ```
   https://bocatto-tu-usuario.vercel.app
   ```

## Deploy Automático:

- Cada vez que hagas `git push`, Vercel despliega automáticamente
- No necesitas hacer nada más después del setup inicial

## Notas importantes:

- Vercel es GRATIS para Next.js
- Deploy instantáneo (no duerme como Render)
- SSL/HTTPS automático
- CDN global incluido

## Verificar funcionamiento:

1. Abre tu URL de Vercel
2. Navega a `/menu`
3. Debe cargar los datos del backend en Render
