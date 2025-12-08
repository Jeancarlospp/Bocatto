'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyReservations, cancelReservation, confirmPayment } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, pending, paid
  const [actionLoading, setActionLoading] = useState(null); // Track which reservation is being acted upon

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Redirect to home if not authenticated
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      loadReservations();
    }
  }, [isAuthenticated, authLoading, filter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (filter === 'upcoming') {
        filters.upcoming = true;
      } else if (filter !== 'all') {
        filters.status = filter;
      }

      const result = await getMyReservations(filters);

      if (result.success) {
        setReservations(result.reservations);
      } else {
        setError('Error al cargar las reservaciones');
      }
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reservación?')) {
      return;
    }

    try {
      setActionLoading(reservationId);
      const result = await cancelReservation(reservationId);

      if (result.success) {
        // Reload reservations
        await loadReservations();
        alert('Reservación cancelada exitosamente');
      } else {
        alert(result.message || 'Error al cancelar la reservación');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert(err.message || 'Error al cancelar la reservación');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmPayment = async (reservationId) => {
    if (!confirm('¿Confirmar el pago de esta reservación?')) {
      return;
    }

    try {
      setActionLoading(reservationId);
      const result = await confirmPayment(reservationId);

      if (result.success) {
        // Reload reservations
        await loadReservations();
        alert(`¡Pago confirmado! Total: $${result.reservation.totalPrice.toFixed(2)}`);
      } else {
        alert(result.message || 'Error al confirmar el pago');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Error al confirmar el pago');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      paid: 'bg-green-500/10 text-green-500 border-green-500/30',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
      expired: 'bg-gray-500/10 text-gray-500 border-gray-500/30'
    };

    const labels = {
      pending: 'Pendiente',
      paid: 'Pagada',
      cancelled: 'Cancelada',
      expired: 'Expirada'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPastReservation = (endTime) => {
    return new Date(endTime) < new Date();
  };

  const canCancel = (reservation) => {
    // Can only cancel pending or paid reservations that haven't started yet
    return (
      (reservation.status === 'pending' || reservation.status === 'paid') &&
      new Date(reservation.startTime) > new Date()
    );
  };

  const canPay = (reservation) => {
    // Can only pay pending reservations that haven't started yet
    return (
      reservation.status === 'pending' &&
      new Date(reservation.startTime) > new Date()
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
            <p className="text-white text-lg">Cargando tus reservaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Mis Reservaciones
          </h1>
          <p className="text-gray-300 text-lg">
            Gestiona todas tus reservaciones en un solo lugar
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-2 mb-8 inline-flex gap-2">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'upcoming', label: 'Próximas' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'paid', label: 'Pagadas' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === tab.value
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-800 mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No hay reservaciones</h3>
            <p className="text-gray-400 mb-6">Aún no has realizado ninguna reservación</p>
            <a
              href="/reservations"
              className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
            >
              Hacer una Reservación
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left Side - Reservation Info */}
                    <div className="flex-1">
                      {/* Area Name & Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {reservation.area.name}
                          </h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Fecha</p>
                            <p className="text-white font-medium capitalize">
                              {formatDate(reservation.startTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Horario</p>
                            <p className="text-white font-medium">
                              {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Guest Count & Price */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-gray-300">{reservation.guestCount} invitados</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-500">
                          ${reservation.totalPrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Notes */}
                      {reservation.notes && (
                        <div className="mt-4 pt-4 border-t border-neutral-700">
                          <p className="text-xs text-gray-400 mb-1">Notas:</p>
                          <p className="text-gray-300 text-sm">{reservation.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col gap-3 lg:w-48">
                      {canPay(reservation) && (
                        <button
                          onClick={() => handleConfirmPayment(reservation._id)}
                          disabled={actionLoading === reservation._id}
                          className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === reservation._id ? 'Procesando...' : '✓ Confirmar Pago'}
                        </button>
                      )}

                      {canCancel(reservation) && (
                        <button
                          onClick={() => handleCancelReservation(reservation._id)}
                          disabled={actionLoading === reservation._id}
                          className="w-full px-4 py-3 bg-red-600/20 text-red-400 border border-red-500/50 font-medium rounded-lg hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === reservation._id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}

                      {isPastReservation(reservation.endTime) && reservation.status === 'paid' && (
                        <div className="text-center py-2">
                          <span className="text-gray-500 text-sm">✓ Completada</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Action */}
        {reservations.length > 0 && (
          <div className="mt-12 text-center">
            <a
              href="/reservations"
              className="inline-block px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition shadow-lg hover:shadow-orange-500/50"
            >
              Hacer Nueva Reservación
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
