# Bocatto Restaurant - Frontend

Frontend desarrollado con **Next.js 16 + React + Tailwind CSS**

## 🚀 Desarrollo Local

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
npm install
```

### Variables de Entorno
Crea un archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Ejecutar
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📂 Estructura

```
frontend/
├── app/
│   ├── layout.js          # Layout principal
│   ├── page.js            # Página inicio
│   └── menu/
│       └── page.jsx       # Página menú
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Hero.jsx
│   └── Features.jsx
└── lib/
    └── api.js             # Cliente API
```

## 🌐 Deploy en Vercel

Ver instrucciones completas en: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

**Resumen:**
1. Push a GitHub
2. Conecta repo en Vercel
3. Configura Root Directory: `frontend`
4. Agrega variable: `NEXT_PUBLIC_API_URL=https://bocatto.onrender.com`
5. Deploy automático

## 🔗 URLs

- **Desarrollo:** http://localhost:3000
- **Producción:** https://bocatto-xxx.vercel.app (después del deploy)
