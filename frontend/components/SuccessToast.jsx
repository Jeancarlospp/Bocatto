'use client';

import { useEffect } from 'react';

/**
 * SuccessToast - Componente de notificación de éxito
 * Diseño profesional y atractivo alineado con los estilos de Bocatto
 */
export default function SuccessToast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-2xl p-4 flex items-start gap-3 max-w-md border border-orange-400/30">
        {/* Icono de éxito */}
        <div className="flex-shrink-0 mt-0.5">
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">¡Reservación Exitosa!</h3>
          <p className="text-white/90 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          aria-label="Cerrar notificación"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="h-1 bg-white/20 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-white/40 animate-progress" 
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}
