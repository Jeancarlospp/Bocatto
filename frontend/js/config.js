// Configuración de la API
export const API_CONFIG = {
    // Cambia esto por tu URL de Render cuando despliegues
    BASE_URL: 'https://bocatto.onrender.com',
    ENDPOINTS: {
        MENU: '/api/menu',
        ORDERS: '/api/orders',
        RESERVATIONS: '/api/reservations',
    },
    TIMEOUT: 10000, // 10 segundos
};

// Para producción, usa:
// BASE_URL: 'https://tu-app-backend.onrender.com'
