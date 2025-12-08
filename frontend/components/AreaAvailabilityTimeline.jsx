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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Disponibilidad de Ambientes - {new Date(selectedDate).toLocaleDateString('es-EC', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b-2 border-gray-300 bg-gray-50 sticky left-0 z-10">
                Ambiente
              </th>
              {timeSlots.map(slot => (
                <th key={slot} className="px-2 py-2 text-xs font-medium text-gray-600 border-b-2 border-gray-300 bg-gray-50 text-center min-w-[60px]">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-white z-10">
                  <div>{area.name}</div>
                  <div className="text-xs text-gray-500">Cap: {area.capacity}</div>
                </td>
                {timeSlots.map(slot => {
                  const occupied = isSlotOccupied(area._id, slot);
                  const reservation = occupied ? getSlotReservation(area._id, slot) : null;

                  return (
                    <td
                      key={`${area._id}-${slot}`}
                      className="px-1 py-2 text-center border-r border-gray-100"
                      title={
                        occupied && reservation
                          ? `Reservado por ${reservation.user?.firstName} ${reservation.user?.lastName}\n${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}\nEstado: ${reservation.status}`
                          : 'Disponible'
                      }
                    >
                      {occupied ? (
                        <div className={`w-full h-8 rounded flex items-center justify-center ${
                          reservation?.status === 'paid' 
                            ? 'bg-green-500' 
                            : 'bg-yellow-500'
                        }`}>
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-8 rounded bg-gray-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="mt-4 flex items-center justify-end space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded bg-gray-100 mr-2"></div>
          <span className="text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 rounded bg-yellow-500 mr-2"></div>
          <span className="text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 rounded bg-green-500 mr-2"></div>
          <span className="text-gray-600">Pagada</span>
        </div>
      </div>
    </div>
  );
}
