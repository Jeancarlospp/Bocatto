import Reservation from '../models/Reservation.js';
import Area from '../models/Area.js';
import User from '../models/User.js';

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Populate reservation with area and user details manually
 */
const populateReservation = async (reservation) => {
  const reservationObj = reservation.toObject ? reservation.toObject() : reservation;
  
  // Get area details
  const area = await Area.findOne({ id: reservationObj.area }).select('id name description imageUrl minCapacity maxCapacity');
  
  // Get user details
  const user = await User.findOne({ id: reservationObj.user }).select('id firstName lastName email phone');
  
  return {
    ...reservationObj,
    area: area || { id: reservationObj.area },
    user: user || { id: reservationObj.user }
  };
};

/**
 * Populate multiple reservations
 */
const populateReservations = async (reservations) => {
  return Promise.all(reservations.map(r => populateReservation(r)));
};

/**
 * Validate reservation date constraints
 * - Start time must be in the future
 * - Maximum 30 days in advance
 */
const validateReservationDates = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Check if start time is in the past
  if (start <= now) {
    return {
      valid: false,
      message: 'La fecha de inicio debe ser en el futuro'
    };
  }

  // Check if end time is after start time
  if (end <= start) {
    return {
      valid: false,
      message: 'La fecha de fin debe ser posterior a la fecha de inicio'
    };
  }

  // Check maximum 30 days in advance
  const maxAdvanceDays = 30;
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

  if (start > maxDate) {
    return {
      valid: false,
      message: `Solo se puede reservar con máximo ${maxAdvanceDays} días de anticipación`
    };
  }

  return { valid: true };
};

/**
 * ========================================
 * RESERVATION CONTROLLERS
 * ========================================
 */

/**
 * Create a new reservation
 * POST /reservations
 * Protected: Requires authentication (client)
 * 
 * Body:
 * {
 *   "areaId": "64abc123...",
 *   "startTime": "2024-12-25T18:00:00.000Z",
 *   "endTime": "2024-12-25T20:00:00.000Z",
 *   "guestCount": 4,
 *   "notes": "Optional notes",
 *   "paymentMethodSimulated": "card"
 * }
 * 
 * Response 201:
 * {
 *   "success": true,
 *   "message": "Reservación creada exitosamente",
 *   "reservation": { ... }
 * }
 * 
 * Errors:
 * - 400: Invalid input or date constraints
 * - 404: Area not found
 * - 409: Time slot already reserved (overlap)
 */
export const createReservation = async (req, res) => {
  try {
    const { areaId, startTime, endTime, guestCount, notes, paymentMethodSimulated } = req.body;
    const userId = req.user.id; // From auth middleware

    console.log('📝 Creating reservation:', { areaId, startTime, endTime, guestCount, userId: userId.toString() });

    // Validate required fields
    if (!areaId || !startTime || !endTime || !guestCount) {
      return res.status(400).json({
        success: false,
        message: 'Área, fecha de inicio, fecha de fin y número de invitados son requeridos'
      });
    }

    // Validate dates
    const dateValidation = validateReservationDates(startTime, endTime);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message
      });
    }

    // Check if area exists and is active
    let area;
    if (!isNaN(areaId)) {
      area = await Area.findOne({ id: parseInt(areaId) });
    }
    if (!area) {
      area = await Area.findById(areaId);
    }
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    if (!area.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Este ambiente no está disponible para reservaciones'
      });
    }

    // Validate guest count against area capacity
    if (guestCount < area.minCapacity || guestCount > area.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `El número de invitados debe estar entre ${area.minCapacity} y ${area.maxCapacity} personas`
      });
    }

    // Check for overlapping reservations
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    const overlapping = await Reservation.findOverlapping(
      areaId,
      requestedStart,
      requestedEnd
    );
    
    if (overlapping.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una reservación para este ambiente en ese rango de tiempo',
        overlappingReservations: overlapping.map(r => ({
          id: r._id,
          startTime: r.startTime,
          endTime: r.endTime,
          status: r.status
        }))
      });
    }

    // Calculate total price
    const totalPrice = Reservation.calculatePrice(new Date(startTime), new Date(endTime));

    // Create reservation with incremental IDs
    const reservation = await Reservation.create({
      user: userId,
      area: area.id,  // Use incremental id
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalPrice,
      guestCount,
      notes: notes || '',
      paymentMethodSimulated: paymentMethodSimulated || 'card',
      status: 'pending'
    });

    // Manually populate area and user details
    const populatedReservation = await populateReservation(reservation);

    console.log('✅ Reservation created:', reservation._id);

    return res.status(201).json({
      success: true,
      message: 'Reservación creada exitosamente',
      reservation: {
        id: reservation._id,
        area: populatedReservation.area,
        user: populatedReservation.user,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        totalPrice: reservation.totalPrice,
        guestCount: reservation.guestCount,
        status: reservation.status,
        notes: reservation.notes,
        paymentMethodSimulated: reservation.paymentMethodSimulated,
        createdAt: reservation.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Create reservation error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al crear la reservación'
    });
  }
};

/**
 * Get all reservations for current user
 * GET /reservations/my-reservations
 * Protected: Requires authentication (client)
 * 
 * Query params:
 * - status: Filter by status (pending, paid, cancelled, expired)
 * - upcoming: true/false (only future reservations)
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "count": 5,
 *   "reservations": [ ... ]
 * }
 */
export const getMyReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, upcoming } = req.query;

    const query = { user: userId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter upcoming reservations
    if (upcoming === 'true') {
      query.endTime = { $gt: new Date() };
    }

    const reservations = await Reservation.find(query)
      .sort({ startTime: -1 }); // Most recent first

    // Manually populate area and user details
    const populatedReservations = await populateReservations(reservations);

    return res.status(200).json({
      success: true,
      count: reservations.length,
      reservations: populatedReservations
    });

  } catch (error) {
    console.error('❌ Get my reservations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las reservaciones'
    });
  }
};

/**
 * Get reservation by ID
 * GET /reservations/:id
 * Protected: Requires authentication (client can only see their own)
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "reservation": { ... }
 * }
 */
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada'
      });
    }

    // Check authorization: only owner or admin can view
    if (!isAdmin && reservation.user !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reservación'
      });
    }

    // Manually populate area and user details
    const populatedReservation = await populateReservation(reservation);

    return res.status(200).json({
      success: true,
      reservation: populatedReservation
    });

  } catch (error) {
    console.error('❌ Get reservation by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la reservación'
    });
  }
};

/**
 * Cancel a reservation
 * DELETE /reservations/:id
 * Protected: Requires authentication (client can only cancel their own pending reservations)
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Reservación cancelada exitosamente"
 * }
 * 
 * Errors:
 * - 404: Reservation not found
 * - 403: Not authorized (not owner or already paid/cancelled)
 * - 400: Cannot cancel reservation that already started
 */
export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada'
      });
    }

    // Check authorization: only owner or admin can cancel
    if (!isAdmin && reservation.user !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta reservación'
      });
    }

    // Check if already cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Esta reservación ya está cancelada'
      });
    }

    // Check if already expired
    if (reservation.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Esta reservación ya expiró'
      });
    }

    // Check if reservation already started (optional: you can allow cancellation even after start)
    const now = new Date();
    if (reservation.startTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una reservación que ya comenzó'
      });
    }

    // Cancel reservation
    reservation.status = 'cancelled';
    await reservation.save();

    console.log('✅ Reservation cancelled:', reservation._id);

    return res.status(200).json({
      success: true,
      message: 'Reservación cancelada exitosamente',
      reservation: {
        id: reservation._id,
        status: reservation.status
      }
    });

  } catch (error) {
    console.error('❌ Cancel reservation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cancelar la reservación'
    });
  }
};

/**
 * Simulate payment confirmation
 * POST /reservations/:id/confirm-payment
 * Protected: Requires authentication (client)
 * 
 * Changes status from 'pending' to 'paid'
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Pago confirmado exitosamente",
 *   "reservation": { ... }
 * }
 * 
 * Errors:
 * - 404: Reservation not found
 * - 403: Not authorized
 * - 400: Already paid or cancelled
 */
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada'
      });
    }

    // Check authorization: only owner can confirm payment
    if (reservation.user !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para confirmar el pago de esta reservación'
      });
    }

    // Check if already paid
    if (reservation.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Esta reservación ya está pagada'
      });
    }

    // Check if cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'No se puede confirmar el pago de una reservación cancelada'
      });
    }

    // Check if expired
    if (reservation.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Esta reservación expiró'
      });
    }

    // Confirm payment
    reservation.status = 'paid';
    await reservation.save();

    // Manually populate area and user details
    const populatedReservation = await populateReservation(reservation);

    console.log('✅ Payment confirmed for reservation:', reservation._id);

    return res.status(200).json({
      success: true,
      message: 'Pago confirmado exitosamente',
      reservation: {
        id: reservation._id,
        area: populatedReservation.area,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        totalPrice: reservation.totalPrice,
        status: reservation.status,
        guestCount: reservation.guestCount
      }
    });

  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al confirmar el pago'
    });
  }
};

/**
 * ========================================
 * ADMIN CONTROLLERS
 * ========================================
 */

/**
 * Get all reservations (Admin only)
 * GET /reservations
 * Protected: Admin only
 * 
 * Query params:
 * - status: Filter by status
 * - areaId: Filter by area
 * - startDate: Filter reservations from this date
 * - endDate: Filter reservations until this date
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "count": 50,
 *   "reservations": [ ... ]
 * }
 */
export const getAllReservations = async (req, res) => {
  try {
    const { status, areaId, startDate, endDate } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by area
    if (areaId) {
      query.area = areaId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    const reservations = await Reservation.find(query)
      .sort({ startTime: -1 });

    // Manually populate area and user details
    const populatedReservations = await populateReservations(reservations);

    return res.status(200).json({
      success: true,
      count: reservations.length,
      reservations: populatedReservations
    });

  } catch (error) {
    console.error('❌ Get all reservations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las reservaciones'
    });
  }
};

/**
 * Admin cancel reservation
 * DELETE /reservations/:id/admin-cancel
 * Protected: Admin only
 * 
 * Admin can cancel any reservation at any time
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Reservación cancelada por administrador"
 * }
 */
export const adminCancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada'
      });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Esta reservación ya está cancelada'
      });
    }

    // Admin can cancel even if already started or paid
    reservation.status = 'cancelled';
    await reservation.save();

    console.log('✅ Admin cancelled reservation:', reservation._id);

    return res.status(200).json({
      success: true,
      message: 'Reservación cancelada por administrador',
      reservation: {
        id: reservation._id,
        status: reservation.status
      }
    });

  } catch (error) {
    console.error('❌ Admin cancel reservation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cancelar la reservación'
    });
  }
};

/**
 * Check available time slots for an area
 * GET /reservations/availability/:areaId
 * Public endpoint
 * 
 * Query params:
 * - date: Date to check (YYYY-MM-DD)
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "date": "2024-12-25",
 *   "availableSlots": [
 *     { "start": "09:00", "end": "10:00" },
 *     { "start": "14:00", "end": "15:00" }
 *   ],
 *   "reservedSlots": [
 *     { "start": "12:00", "end": "14:00", "status": "paid" }
 *   ]
 * }
 */
export const getAvailability = async (req, res) => {
  try {
    const { areaId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Fecha es requerida (formato: YYYY-MM-DD)'
      });
    }

    // Check if area exists
    let area;
    if (!isNaN(areaId)) {
      area = await Area.findOne({ id: parseInt(areaId) });
    }
    if (!area) {
      area = await Area.findById(areaId);
    }
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    // Get start and end of the requested day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all reservations for this area on this date
    const reservations = await Reservation.find({
      area: areaId,
      status: { $in: ['pending', 'paid'] },
      startTime: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ startTime: 1 });

    const reservedSlots = reservations.map(r => ({
      start: r.startTime,
      end: r.endTime,
      status: r.status
    }));

    return res.status(200).json({
      success: true,
      date,
      areaName: area.name,
      reservedSlots
    });

  } catch (error) {
    console.error('❌ Get availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener disponibilidad'
    });
  }
};
