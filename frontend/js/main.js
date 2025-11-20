// Main JavaScript - Punto de entrada
import { utils } from './utils.js';
import apiService from './api.js';

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Bocatto App Initialized');
    
    initNavbar();
    testAPIConnection();
});

/**
 * Inicializa la navegación responsive
 */
function initNavbar() {
    const navToggler = document.getElementById('navToggler');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggler && navMenu) {
        navToggler.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

/**
 * Prueba la conexión con el backend
 */
async function testAPIConnection() {
    try {
        const response = await apiService.get('/');
        console.log('✅ Backend conectado:', response);
    } catch (error) {
        console.error('❌ Error al conectar con el backend:', error);
        console.log('ℹ️ Asegúrate de que el servidor backend esté corriendo en el puerto 5000');
    }
}

// Exportar funciones si es necesario
export { initNavbar, testAPIConnection };
