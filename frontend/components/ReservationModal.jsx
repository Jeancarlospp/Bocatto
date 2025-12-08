'use client';

import { useState, useEffect } from 'react';
import { createReservation } from '@/lib/api';

/**
 * ReservationModal Component
 * 
 * Professional reservation form with:
 * - Date and time selection
 * - Real-time price calculation
 * - Frontend validations (no past dates, max 30 days, end > start)
 * - Backend error handling
 */
export default function ReservationModal({ 
  isOpen, 
  onClose, 
  area, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    guestCount: area?.minCapacity || 2,
    notes: '',
    paymentMethodSimulated: 'card'
  });

  const [calculatedPrice, setCalculatedPrice] = useState(5.00);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        date: tomorrow.toISOString().split('T')[0],
        startTime: '12:00',
        endTime: '14:00',
        guestCount: area?.minCapacity || 2,
        notes: '',
        paymentMethodSimulated: 'card'
      });
      setError(null);
      setValidationErrors({});
      calculatePrice('12:00', '14:00');
    }
  }, [isOpen, area]);

  // Calculate price based on duration
  const calculatePrice = (start, end) => {
    if (!start || !end) return;

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      setCalculatedPrice(5.00);
      return;
    }

    const durationMinutes = endMinutes - startMinutes;
    const durationHours = Math.ceil(durationMinutes / 60);

    // $5 first hour + $2.50 per additional hour
    const price = durationHours <= 1 
      ? 5.00 
      : 5.00 + (durationHours - 1) * 2.50;

    setCalculatedPrice(price);
  };

  // Validate date constraints
  const validateDate = (dateValue) => {
    const errors = {};
    const selectedDate = new Date(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if date is in the past
    if (selectedDate < today) {
      errors.date = 'No puedes seleccionar una fecha pasada';
      return errors;
    }

    // Check max 30 days advance
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (selectedDate > maxDate) {
      errors.date = 'Solo puedes reservar con máximo 30 días de anticipación';
      return errors;
    }

    return errors;
  };

  // Validate time constraints
  const validateTime = (start, end) => {
    const errors = {};

    if (!start || !end) {
      errors.time = 'Debes seleccionar hora de inicio y fin';
      return errors;
    }

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      errors.time = 'La hora de fin debe ser posterior a la hora de inicio';
      return errors;
    }

    return errors;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear specific validation error
    setValidationErrors(prev => ({ ...prev, [name]: null }));

    // Recalculate price on time change
    if (name === 'startTime') {
      calculatePrice(value, formData.endTime);
      setValidationErrors(prev => ({ ...prev, time: null }));
    }
    if (name === 'endTime') {
      calculatePrice(formData.startTime, value);
      setValidationErrors(prev => ({ ...prev, time: null }));
    }

    // Validate date on change
    if (name === 'date') {
      const dateErrors = validateDate(value);
      setValidationErrors(prev => ({ ...prev, ...dateErrors }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Frontend validations
    const dateErrors = validateDate(formData.date);
    const timeErrors = validateTime(formData.startTime, formData.endTime);
    const errors = { ...dateErrors, ...timeErrors };

    // Check guest count
    if (formData.guestCount < area.minCapacity || formData.guestCount > area.maxCapacity) {
      errors.guestCount = `El número de invitados debe estar entre ${area.minCapacity} y ${area.maxCapacity}`;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Combine date and time into ISO strings
    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

    try {
      setLoading(true);

      const reservationData = {
        areaId: area._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        guestCount: parseInt(formData.guestCount),
        notes: formData.notes,
        paymentMethodSimulated: formData.paymentMethodSimulated
      };

      const result = await createReservation(reservationData);

      if (result.success) {
        // Success! Notify parent and close
        if (onSuccess) {
          onSuccess(result.reservation);
        }
        onClose();
      } else {
        setError(result.message || 'Error al crear la reservación');
      }

    } catch (err) {
      console.error('Reservation error:', err);
      
      // Handle specific backend errors
      if (err.message.includes('solapamiento') || err.message.includes('reservación')) {
        setError('Ya existe una reservación para este ambiente en ese horario. Por favor, elige otro horario.');
      } else if (err.message.includes('fecha')) {
        setError(err.message);
      } else if (err.message.includes('capacidad')) {
        setError(err.message);
      } else if (err.message.includes('iniciar sesión') || err.message.includes('autenticación')) {
        setError('Tu sesión expiró. Por favor, inicia sesión nuevamente.');
      } else {
        setError('Error al crear la reservación. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const durationHours = Math.ceil(
    ((new Date(`2000-01-01T${formData.endTime}:00`) - new Date(`2000-01-01T${formData.startTime}:00`)) / (1000 * 60 * 60))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Reservar Ambiente</h2>
            <p className="text-gray-400 text-sm mt-1">{area?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha de Reserva <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 bg-neutral-800 border ${validationErrors.date ? 'border-red-500' : 'border-neutral-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
            />
            {validationErrors.date && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.date}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hora de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hora de Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {validationErrors.time && (
            <p className="text-sm text-red-400 -mt-2">{validationErrors.time}</p>
          )}

          {/* Price Display */}
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 mb-1">Precio Estimado</p>
                <p className="text-xs text-gray-400">
                  {durationHours <= 1 
                    ? '1 hora incluida' 
                    : `1 hora base + ${durationHours - 1} hora(s) adicional(es)`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-500">
                  ${calculatedPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">USD</p>
              </div>
            </div>
            {durationHours > 1 && (
              <div className="mt-3 pt-3 border-t border-orange-500/20">
                <p className="text-xs text-gray-400">
                  💡 <span className="font-medium">Detalle:</span> $5.00 (primera hora) + ${((durationHours - 1) * 2.50).toFixed(2)} ({durationHours - 1} hora(s) × $2.50)
                </p>
              </div>
            )}
          </div>

          {/* Guest Count */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Número de Invitados <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              min={area?.minCapacity}
              max={area?.maxCapacity}
              required
              className={`w-full px-4 py-3 bg-neutral-800 border ${validationErrors.guestCount ? 'border-red-500' : 'border-neutral-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
            />
            <p className="mt-1 text-xs text-gray-400">
              Capacidad: {area?.minCapacity} - {area?.maxCapacity} personas
            </p>
            {validationErrors.guestCount && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.guestCount}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Método de Pago (Simulado)
            </label>
            <select
              name="paymentMethodSimulated"
              value={formData.paymentMethodSimulated}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            >
              <option value="card">Tarjeta de Crédito/Débito</option>
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia Bancaria</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              placeholder="Ej: Necesito sillas para niños, decoración especial, etc."
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {formData.notes.length}/500 caracteres
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-neutral-800 text-gray-300 font-medium rounded-lg hover:bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Confirmar Reservación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
