'use client';

import { useState, useEffect } from 'react';
import { fetchActiveAreas } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ReservationModal from '@/components/ReservationModal';

export default function ReservationsPage() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchActiveAreas();
      
      if (response.success && response.data) {
        setAreas(response.data);
      } else {
        setError('No se pudieron cargar los ambientes');
      }
    } catch (err) {
      console.error('Error loading areas:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleReservationClick = (area) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginMessage(true);
      setTimeout(() => {
        setShowLoginMessage(false);
        // Scroll to top to show login button
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 3000);
      return;
    }

    // User is authenticated, open reservation modal
    setSelectedArea(area);
    setIsModalOpen(true);
  };

  const handleReservationSuccess = (reservation) => {
    // Show success message and reload areas if needed
    alert(`¡Reservación creada exitosamente! ID: ${reservation.id}\nEstado: Pendiente de pago\nPrecio: $${reservation.totalPrice.toFixed(2)}`);
    // Optionally redirect to "Mis Reservas"
    // window.location.href = '/my-reservations';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
            <p className="text-white text-lg">Cargando ambientes disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
              <p className="text-red-400 text-center">{error}</p>
              <button
                onClick={loadAreas}
                className="mt-4 w-full px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 py-20">
      <div className="container mx-auto px-6">
        {/* Login Required Message */}
        {showLoginMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className="bg-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl border border-orange-400 animate-bounce">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="font-semibold">¡Inicia sesión para continuar!</p>
                  <p className="text-sm text-orange-100">Debes iniciar sesión para poder hacer una reservación</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Reserva tu Ambiente Ideal
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubre nuestros exclusivos espacios diseñados para hacer de tu experiencia un momento inolvidable
          </p>
        </div>

        {/* Areas Gallery */}
        {areas.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-800 mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No hay ambientes disponibles</h3>
            <p className="text-gray-400">Por favor, vuelve más tarde</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {areas.map((area) => (
              <div
                key={area._id}
                className="group bg-neutral-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-neutral-900">
                  {area.imageUrl ? (
                    <img
                      src={area.imageUrl}
                      alt={area.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Area Name */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {area.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {area.description}
                  </p>

                  {/* Capacity */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-700">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-300 text-sm font-medium">
                      Capacidad: {area.minCapacity} - {area.maxCapacity} personas
                    </span>
                  </div>

                  {/* Features */}
                  {area.features && area.features.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Características:</h4>
                      <div className="flex flex-wrap gap-2">
                        {area.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reservation Button */}
                  <button
                    onClick={() => handleReservationClick(area)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/50 transform hover:scale-105"
                  >
                    Hacer una reservación
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Modal */}
        {isModalOpen && selectedArea && (
          <ReservationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            area={selectedArea}
            onSuccess={handleReservationSuccess}
          />
        )}

        {/* Additional Info Section */}
        {areas.length > 0 && (
          <div className="mt-20 text-center">
            <div className="inline-block bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-8 max-w-2xl">
              <h3 className="text-2xl font-bold text-white mb-3">¿Necesitas ayuda?</h3>
              <p className="text-gray-300 mb-4">
                Nuestro equipo está listo para ayudarte a elegir el ambiente perfecto para tu ocasión especial
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="px-6 py-3 bg-neutral-700 text-white font-medium rounded-lg hover:bg-neutral-600 transition"
                >
                  Contáctanos
                </a>
                <a
                  href="/about"
                  className="px-6 py-3 border border-orange-500 text-orange-500 font-medium rounded-lg hover:bg-orange-500 hover:text-white transition"
                >
                  Conoce más
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
