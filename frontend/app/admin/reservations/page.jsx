'use client';

import { useState, useEffect } from 'react';
import { getAllReservations, adminCancelReservation, getAreas } from '@/lib/api';
import AreaAvailabilityTimeline from '@/components/AreaAvailabilityTimeline';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineDate, setTimelineDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    areaId: '',
    startDate: '',
    endDate: ''
  });

  // Load areas for filter
  useEffect(() => {
    loadAreas();
  }, []);

  // Load reservations when filters change
  useEffect(() => {
    loadReservations();
  }, [filters]);

  const loadAreas = async () => {
    try {
      const data = await getAreas();
      if (data.success) {
        setAreas(data.areas);
      }
    } catch (err) {
      console.error('Error loading areas:', err);
    }
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params from filters
      const queryFilters = {};
      if (filters.status) queryFilters.status = filters.status;
      if (filters.areaId) queryFilters.areaId = filters.areaId;
      if (filters.startDate) queryFilters.startDate = filters.startDate;
      if (filters.endDate) queryFilters.endDate = filters.endDate;

      const data = await getAllReservations(queryFilters);
      
      if (data.success) {
        setReservations(data.reservations);
      } else {
        setError(data.message || 'Error al cargar reservaciones');
      }
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Error al cargar las reservaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    const confirmation = window.confirm(
      '¿Seguro que quieres cancelar esta reserva? Esta acción liberará el ambiente en esa fecha/hora.'
    );

    if (!confirmation) return;

    try {
      setActionLoading(reservationId);
      const result = await adminCancelReservation(reservationId);
      
      if (result.success) {
        // Update the reservation in the list without reloading
        setReservations(prevReservations =>
          prevReservations.map(res =>
            res._id === reservationId
              ? { ...res, status: 'cancelled' }
              : res
          )
        );
        alert('Reservación cancelada exitosamente');
      } else {
        alert(result.message || 'Error al cancelar la reservación');
      }
    } catch (err) {
      console.error('Error canceling reservation:', err);
      alert('Error al cancelar la reservación');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      areaId: '',
      startDate: '',
      endDate: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Pagada', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} - ${formatTime(dateString)}`;
  };

  const canCancelReservation = (reservation) => {
    return reservation.status !== 'cancelled' && reservation.status !== 'expired';
  };

  // Calculate statistics (with safe array check)
  const stats = {
    total: reservations?.length || 0,
    pending: reservations?.filter(r => r.status === 'pending').length || 0,
    paid: reservations?.filter(r => r.status === 'paid').length || 0,
    cancelled: reservations?.filter(r => r.status === 'cancelled').length || 0,
    totalRevenue: reservations?.filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.totalPrice, 0) || 0
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Reservaciones
        </h1>
        <p className="text-gray-600">
          Administra todas las reservaciones del sistema
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Pagadas</div>
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Canceladas</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Ingresos</div>
          <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Timeline Toggle */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow p-6 border-l-4 border-orange-600">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            📅 Vista de Disponibilidad de Ambientes
          </h2>
          <p className="text-sm font-medium text-gray-800">
            Visualiza en tiempo real qué ambientes están reservados por fecha y hora
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Seleccionar Fecha:</label>
            <input
              type="date"
              value={timelineDate}
              onChange={(e) => setTimelineDate(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 font-medium"
            />
          </div>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition shadow-md mt-5"
          >
            {showTimeline ? '🔼 Ocultar Timeline' : '🔽 Mostrar Timeline'}
          </button>
        </div>
      </div>

      {/* Timeline View */}
      {showTimeline && (
        <div className="mb-6">
          <AreaAvailabilityTimeline
            reservations={reservations}
            areas={areas}
            selectedDate={timelineDate}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
            >
              <option value="" className="text-gray-900">Todos los estados</option>
              <option value="pending" className="text-gray-900">Pendiente</option>
              <option value="paid" className="text-gray-900">Pagada</option>
              <option value="cancelled" className="text-gray-900">Cancelada</option>
              <option value="expired" className="text-gray-900">Expirada</option>
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Ambiente
            </label>
            <select
              value={filters.areaId}
              onChange={(e) => handleFilterChange('areaId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
            >
              <option value="" className="text-gray-900">Todos los ambientes</option>
              {areas && areas.length > 0 ? (
                areas.map(area => (
                  <option key={area._id} value={area._id} className="text-gray-900">
                    {area.name} (Cap: {area.capacity})
                  </option>
                ))
              ) : (
                <option disabled className="text-gray-500">Cargando ambientes...</option>
              )}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Fecha inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Fecha fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
        <div className="px-6 py-4 border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            📋 Reservaciones ({reservations.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadReservations}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Reintentar
            </button>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600">No se encontraron reservaciones</p>
            {(filters.status || filters.areaId || filters.startDate || filters.endDate) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-300">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Ambiente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Invitados
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Creada
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-gray-200">
                {reservations && reservations.length > 0 && reservations.map((reservation) => (
                  <tr key={reservation._id} className="hover:bg-orange-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {reservation.user?.firstName} {reservation.user?.lastName}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          {reservation.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {reservation.area?.name || 'N/A'}
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        Capacidad: {reservation.area?.capacity || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-bold">🕐 Inicio:</div>
                        <div className="font-semibold text-gray-800">{formatDateTime(reservation.startTime)}</div>
                      </div>
                      <div className="text-sm text-gray-900 mt-2">
                        <div className="font-bold">🕐 Fin:</div>
                        <div className="font-semibold text-gray-800">{formatDateTime(reservation.endTime)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        👥 {reservation.guestCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-700">
                        ${reservation.totalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {reservation.paymentMethodSimulated}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {formatDate(reservation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {canCancelReservation(reservation) ? (
                        <button
                          onClick={() => handleCancelReservation(reservation._id)}
                          disabled={actionLoading === reservation._id}
                          className="text-red-600 hover:text-red-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === reservation._id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Cancelando...
                            </span>
                          ) : (
                            'Cancelar'
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-400 font-semibold">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes Section - Show if any reservation has notes */}
      {reservations && reservations.length > 0 && reservations.some(r => r.notes) && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📝 Notas de Reservaciones
          </h3>
          <div className="space-y-3">
            {reservations
              .filter(r => r.notes)
              .map(reservation => (
                <div key={reservation._id} className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded">
                  <div className="text-sm font-bold text-gray-900">
                    {reservation.user?.firstName} {reservation.user?.lastName} - {reservation.area?.name}
                  </div>
                  <div className="text-sm font-medium text-gray-800 mt-1">
                    {reservation.notes}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
