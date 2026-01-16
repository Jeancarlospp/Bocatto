'use client';

import { useState, useEffect } from 'react';

/**
 * AreaAvailabilityTimeline - Visual timeline component showing area availability
 * Shows which time slots are occupied for each area on a specific date
 */
export default function AreaAvailabilityTimeline({ reservations, areas, selectedDate }) {
  const [timeSlots, setTimeSlots] = useState([]);

  // Generate time slots from 9 AM to 11 PM
  useEffect(() => {
    const slots = [];
    for (let hour = 9; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    setTimeSlots(slots);
  }, []);

  // Check if a time slot is occupied for a specific area
  const isSlotOccupied = (areaId, timeSlot) => {
    if (!reservations || reservations.length === 0) return false;
    
    const [hour] = timeSlot.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return reservations.some(reservation => {
      if (reservation.area?._id !== areaId) return false;
      if (reservation.status === 'cancelled' || reservation.status === 'expired') return false;

      const resStart = new Date(reservation.startTime);
      const resEnd = new Date(reservation.endTime);

      // Check if slot overlaps with reservation
      return resStart < slotEnd && resEnd > slotDate;
    });
  };

  // Get reservation details for a specific slot
  const getSlotReservation = (areaId, timeSlot) => {
    if (!reservations || reservations.length === 0) return null;
    
    const [hour] = timeSlot.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return reservations.find(reservation => {
      if (reservation.area?._id !== areaId) return false;
      if (reservation.status === 'cancelled' || reservation.status === 'expired') return false;

      const resStart = new Date(reservation.startTime);
      const resEnd = new Date(reservation.endTime);

      return resStart < slotEnd && resEnd > slotDate;
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

  if (!selectedDate || !areas || areas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Selecciona una fecha para ver la disponibilidad de ambientes
      </div>
    );
  }

  // Get active reservations for selected date
  const getActiveReservationsForDate = () => {
    if (!reservations || reservations.length === 0) return [];
    
    return reservations.filter(reservation => {
      if (reservation.status === 'cancelled' || reservation.status === 'expired') return false;
      
      const resStart = new Date(reservation.startTime);
      const selectedDateObj = new Date(selectedDate);
      
      return resStart.toDateString() === selectedDateObj.toDateString();
    });
  };

  const activeReservations = getActiveReservationsForDate();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-600">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          📅 Disponibilidad de Ambientes
        </h3>
        <p className="text-lg font-semibold text-gray-800">
          {new Date(selectedDate).toLocaleDateString('es-EC', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-sm font-medium text-gray-700 mt-1">
          {activeReservations.length} reservación(es) activa(s) para esta fecha
        </p>
      </div>

      {/* Reservations Summary for the day */}
      {activeReservations.length > 0 && (
        <div className="mb-6 bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h4 className="text-sm font-bold text-gray-900 mb-3">📋 Reservaciones del Día:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeReservations.map(reservation => (
              <div key={reservation._id} className="bg-white rounded-md p-3 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {reservation.user?.firstName} {reservation.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{reservation.user?.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    reservation.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reservation.status === 'paid' ? 'Pagada' : 'Pendiente'}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    🏠 {reservation.area?.name}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    🕐 {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                  </p>
                  <p className="text-xs text-gray-700">
                    👥 {reservation.guestCount} invitados | 💵 ${reservation.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-400 bg-gradient-to-r from-gray-100 to-gray-200 sticky left-0 z-10">
                Ambiente
              </th>
              {timeSlots.map(slot => (
                <th key={slot} className="px-2 py-3 text-xs font-bold text-gray-900 border-b-2 border-gray-400 bg-gradient-to-r from-gray-100 to-gray-200 text-center min-w-[70px]">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area._id} className="border-b-2 border-gray-300 hover:bg-orange-50 transition">
                <td className="px-4 py-4 text-sm font-bold text-gray-900 border-r-2 border-gray-300 sticky left-0 bg-white z-10">
                  <div className="font-bold text-gray-900">{area.name}</div>
                  <div className="text-xs font-semibold text-gray-700">Capacidad: {area.capacity} personas</div>
                </td>
                {timeSlots.map(slot => {
                  const occupied = isSlotOccupied(area._id, slot);
                  const reservation = occupied ? getSlotReservation(area._id, slot) : null;

                  return (
                    <td
                      key={`${area._id}-${slot}`}
                      className="px-2 py-2 text-center border-r border-gray-200"
                      title={
                        occupied && reservation
                          ? `🔒 RESERVADO\n👤 Cliente: ${reservation.user?.firstName} ${reservation.user?.lastName}\n📧 ${reservation.user?.email}\n🕐 ${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}\n📊 Estado: ${reservation.status === 'paid' ? 'Pagada' : 'Pendiente'}\n👥 ${reservation.guestCount} invitados\n💵 $${reservation.totalPrice.toFixed(2)}`
                          : '✅ DISPONIBLE\nEste horario está libre para reservaciones'
                      }
                    >
                      {occupied ? (
                        <div className={`w-full h-10 rounded-md flex flex-col items-center justify-center shadow-md cursor-pointer transform hover:scale-105 transition ${
                          reservation?.status === 'paid' 
                            ? 'bg-gradient-to-br from-green-500 to-green-600' 
                            : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                        }`}>
                          <svg className="w-5 h-5 text-white mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-bold text-white">
                            {reservation?.user?.firstName?.charAt(0)}{reservation?.user?.lastName?.charAt(0)}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-10 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300 cursor-pointer hover:bg-green-50 transition">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-bold text-gray-900 mb-3">📖 Leyenda:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 mr-3 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Disponible</p>
              <p className="text-xs text-gray-700">Libre para reservar</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-yellow-400 to-yellow-500 mr-3 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Pendiente</p>
              <p className="text-xs text-gray-700">Reserva sin pagar</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-green-500 to-green-600 mr-3 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Pagada</p>
              <p className="text-xs text-gray-700">Reserva confirmada</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-700 mt-3 italic">
          💡 Tip: Pasa el cursor sobre cada celda para ver detalles completos de la reservación
        </p>
      </div>
    </div>
  );
}
