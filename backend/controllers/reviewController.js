import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import Product from '../models/Menu.js';

/**
 * Create new review
 * POST /reviews
 * Protected: Authenticated users only
 */
export const createReview = async (req, res) => {
  try {
    const { type, targetId, stars, title, comment } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!type || !targetId || !stars || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Tipo, targetId, estrellas y comentario son requeridos'
      });
    }

    // Validate type
    if (!['product', 'order', 'reservation'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de reseña inválido'
      });
    }

    // Check if user already reviewed this entity
    const existingReview = await Review.findOne({
      user: userId,
      type,
      targetId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este elemento'
      });
    }

    // Validate that user can review this entity
    const validationResult = await validateReviewEligibility(userId, type, targetId);
    if (!validationResult.valid) {
      return res.status(403).json({
        success: false,
        message: validationResult.message
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      type,
      targetId,
      stars,
      title: title || null,
      comment,
      isApproved: false // Admin must approve
    });

    return res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente. Pendiente de aprobación.',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este elemento'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Error al crear la reseña'
    });
  }
};

/**
 * Validate if user can review an entity
 */
async function validateReviewEligibility(userId, type, targetId) {
  switch (type) {
    case 'product':
      // User must have an order with status 'delivered' containing this product
      const orderWithProduct = await Order.findOne({
        user: userId,
        status: 'delivered',
        'items.productId': targetId
      });

      if (!orderWithProduct) {
        return {
          valid: false,
          message: 'Solo puedes reseñar productos que hayas comprado'
        };
      }
      return { valid: true };

    case 'order':
      // User must be the owner and order must be delivered
      const order = await Order.findOne({
        user: userId,
        $or: [
          { orderNumber: targetId },
          { orderNumber: `ORD-${String(targetId).padStart(6, '0')}` }
        ],
        status: 'delivered'
      });

      if (!order) {
        return {
          valid: false,
          message: 'Solo puedes reseñar órdenes completadas que te pertenezcan'
        };
      }
      return { valid: true };

    case 'reservation':
      // User must be the owner and reservation date must have passed
      const reservation = await Reservation.findOne({
        user: userId,
        id: targetId,
        status: 'paid'
      });

      if (!reservation) {
        return {
          valid: false,
          message: 'Solo puedes reseñar reservaciones pagadas que te pertenezcan'
        };
      }

      // Check if reservation date has passed
      if (new Date(reservation.endTime) > new Date()) {
        return {
          valid: false,
          message: 'Solo puedes reseñar reservaciones después de que hayan terminado'
        };
      }
      return { valid: true };

    default:
      return { valid: false, message: 'Tipo de reseña inválido' };
  }
}

/**
 * Get reviews for a product
 * GET /reviews/product/:productId
 * Public (only approved reviews)
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      type: 'product',
      targetId: parseInt(productId),
      isApproved: true,
      isVisible: true
    }).sort({ createdAt: -1 });

    // Get average rating
    const stats = await Review.getAverageRating('product', parseInt(productId));

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      data: reviews
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las reseñas'
    });
  }
};

/**
 * Get reviews for an order
 * GET /reviews/order/:orderId
 * Public (only approved reviews)
 */
export const getOrderReviews = async (req, res) => {
  try {
    const { orderId } = req.params;

    const reviews = await Review.find({
      type: 'order',
      targetId: parseInt(orderId),
      isApproved: true,
      isVisible: true
    }).sort({ createdAt: -1 });

    const stats = await Review.getAverageRating('order', parseInt(orderId));

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      data: reviews
    });

  } catch (error) {
    console.error('Get order reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las reseñas'
    });
  }
};

/**
 * Get reviews for a reservation
 * GET /reviews/reservation/:reservationId
 * Public (only approved reviews)
 */
export const getReservationReviews = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reviews = await Review.find({
      type: 'reservation',
      targetId: parseInt(reservationId),
      isApproved: true,
      isVisible: true
    }).sort({ createdAt: -1 });

    const stats = await Review.getAverageRating('reservation', parseInt(reservationId));

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      data: reviews
    });

  } catch (error) {
    console.error('Get reservation reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las reseñas'
    });
  }
};

/**
 * Get my reviews
 * GET /reviews/my-reviews
 * Protected: Authenticated users only
 */
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.find({
      user: userId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus reseñas'
    });
  }
};

/**
 * Get pending reviews (for admin)
 * GET /reviews/pending
 * Protected: Admin only
 */
export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      isApproved: false
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error('Get pending reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las reseñas pendientes'
    });
  }
};

/**
 * Get review by ID
 * GET /reviews/:id
 * Public
 */
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    let review;

    // Try to find by MongoDB _id first
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      review = await Review.findById(id);
    } else {
      // Otherwise try numeric id
      const reviewId = parseInt(id);
      if (!isNaN(reviewId)) {
        review = await Review.findOne({ id: reviewId });
      }
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get review by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la reseña'
    });
  }
};

/**
 * Update my review
 * PUT /reviews/:id
 * Protected: Owner only
 */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { stars, title, comment } = req.body;
    const userId = req.user.id;

    let review;

    // Find review
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      review = await Review.findById(id);
    } else {
      const reviewId = parseInt(id);
      if (!isNaN(reviewId)) {
        review = await Review.findOne({ id: reviewId });
      }
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Check ownership
    if (review.user !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta reseña'
      });
    }

    // Update fields
    if (stars) review.stars = stars;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;

    // Reset approval status when edited
    review.isApproved = false;

    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Reseña actualizada. Pendiente de aprobación.',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar la reseña'
    });
  }
};

/**
 * Delete my review
 * DELETE /reviews/:id
 * Protected: Owner only
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let review;

    // Find review
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      review = await Review.findById(id);
    } else {
      const reviewId = parseInt(id);
      if (!isNaN(reviewId)) {
        review = await Review.findOne({ id: reviewId });
      }
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Check ownership (unless admin)
    if (review.user !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta reseña'
      });
    }

    await Review.findByIdAndDelete(review._id);

    return res.status(200).json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la reseña'
    });
  }
};

/**
 * Approve review
 * PATCH /reviews/:id/approve
 * Protected: Admin only
 */
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    let review;

    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      review = await Review.findById(id);
    } else {
      const reviewId = parseInt(id);
      if (!isNaN(reviewId)) {
        review = await Review.findOne({ id: reviewId });
      }
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    review.isApproved = true;
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Reseña aprobada exitosamente',
      data: review
    });

  } catch (error) {
    console.error('Approve review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al aprobar la reseña'
    });
  }
};

/**
 * Reject review
 * PATCH /reviews/:id/reject
 * Protected: Admin only
 */
export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    let review;

    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      review = await Review.findById(id);
    } else {
      const reviewId = parseInt(id);
      if (!isNaN(reviewId)) {
        review = await Review.findOne({ id: reviewId });
      }
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    review.isApproved = false;
    review.isVisible = false;
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Reseña rechazada',
      data: review
    });

  } catch (error) {
    console.error('Reject review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar la reseña'
    });
  }
};

/**
 * Respond to review
 * POST /reviews/:id/respond
 * Protected: Admin only
 */
export const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const adminId = req.user.id;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'La respuesta es requerida'
      });
    }

    let review;

    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      review = await Review.findById(id);
    } else {
      const reviewId = parseInt(id);
      if (!isNaN(reviewId)) {
        review = await Review.findOne({ id: reviewId });
      }
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    review.adminResponse = response;
    review.respondedAt = new Date();
    review.respondedBy = adminId;
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Respuesta agregada exitosamente',
      data: review
    });

  } catch (error) {
    console.error('Respond to review error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error al responder la reseña'
    });
  }
};
