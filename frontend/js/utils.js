// Utilidades generales
export const utils = {
    /**
     * Formatea un precio
     * @param {number} price - Precio a formatear
     * @returns {string} - Precio formateado
     */
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    },

    /**
     * Formatea una fecha
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} - Fecha formateada
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Muestra un mensaje de notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        // Implementación simple - puedes mejorarla con una librería de notificaciones
        console.log(`[${type.toUpperCase()}]: ${message}`);
        alert(message);
    },

    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} - True si es válido
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Valida un teléfono (Ecuador)
     * @param {string} phone - Teléfono a validar
     * @returns {boolean} - True si es válido
     */
    validatePhone(phone) {
        const re = /^(\+593|0)?[0-9]{9,10}$/;
        return re.test(phone);
    },

    /**
     * Limpia un formulario
     * @param {HTMLFormElement} form - Formulario a limpiar
     */
    clearForm(form) {
        form.reset();
    },

    /**
     * Maneja errores de forma consistente
     * @param {Error} error - Error a manejar
     */
    handleError(error) {
        console.error('Error:', error);
        this.showNotification(
            error.message || 'Ha ocurrido un error. Por favor, intenta de nuevo.',
            'error'
        );
    },

    /**
     * Obtiene datos del localStorage
     * @param {string} key - Clave del dato
     * @returns {any} - Dato almacenado o null
     */
    getLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return null;
        }
    },

    /**
     * Guarda datos en localStorage
     * @param {string} key - Clave del dato
     * @param {any} value - Valor a guardar
     */
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },

    /**
     * Elimina datos del localStorage
     * @param {string} key - Clave del dato
     */
    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    /**
     * Debounce function para optimizar eventos
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} - Función con debounce
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
