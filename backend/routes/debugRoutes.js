import express from 'express';
import Reservation from '../models/Reservation.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * DEBUG ENDPOINT - Get all reservations with details
 * GET /debug/reservations
 */
router.get('/reservations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('user', 'firstName lastName email')
      .populate('area', 'name')
      .sort({ createdAt: -1 });

    const summary = {
      total: reservations.length,
      byStatus: {
        pending: reservations.filter(r => r.status === 'pending').length,
        paid: reservations.filter(r => r.status === 'paid').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length,
        expired: reservations.filter(r => r.status === 'expired').length
      },
      reservations: reservations.map(r => ({
        id: r._id,
        user: r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Unknown',
        area: r.area ? r.area.name : 'Unknown',
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
        guestCount: r.guestCount,
        totalPrice: r.totalPrice,
        createdAt: r.createdAt
      }))
    };

    return res.json({
      success: true,
      ...summary
    });
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
      error: error.message
    });
  }
});

/**
 * DEBUG ENDPOINT - Delete ALL reservations
 * DELETE /debug/reservations/clear-all
 * USE WITH CAUTION - This deletes ALL data
 */
router.delete('/reservations/clear-all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await Reservation.deleteMany({});
    
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} reservations`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting reservations',
      error: error.message
    });
  }
});

/**
 * DEBUG ENDPOINT - Delete reservations by status
 * DELETE /debug/reservations/clear-by-status?status=cancelled
 */
router.delete('/reservations/clear-by-status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status parameter is required'
      });
    }

    const result = await Reservation.deleteMany({ status });
    
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} ${status} reservations`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting reservations',
      error: error.message
    });
  }
});

/**
 * DEBUG ENDPOINT - Check overlapping for specific time range
 * POST /debug/check-overlap
 * Body: { areaId, startTime, endTime }
 */
router.post('/check-overlap', async (req, res) => {
  try {
    const { areaId, startTime, endTime } = req.body;
    
    if (!areaId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'areaId, startTime, and endTime are required'
      });
    }

    const overlapping = await Reservation.findOverlapping(
      areaId,
      new Date(startTime),
      new Date(endTime)
    );

    return res.json({
      success: true,
      hasOverlap: overlapping.length > 0,
      count: overlapping.length,
      overlapping: overlapping.map(r => ({
        id: r._id,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
        user: r.user,
        guestCount: r.guestCount
      }))
    });
  } catch (error) {
    console.error('Overlap check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking overlap',
      error: error.message
    });
  }
});

export default router;
