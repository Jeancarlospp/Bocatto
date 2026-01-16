import Coupon from '../models/Coupon.js';
import CouponUsage from '../models/CouponUsage.js';

/**
 * Create new coupon
 * POST /coupons
 * Protected: Admin only
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      usagePerUser,
      applicableTo,
      applicableIds
    } = req.body;

    const adminId = req.user.id;

    // Validate required fields
    if (!code || !description || !discountType || discountValue === undefined || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Código, descripción, tipo de descuento, valor, fecha inicio y fecha fin son requeridos'
      });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cupón con este código'
      });
    }

    // Parse applicableIds if string
    let parsedApplicableIds = applicableIds;
    if (applicableIds && typeof applicableIds === 'string') {
      try {
        parsedApplicableIds = JSON.parse(applicableIds);
      } catch (e) {
        parsedApplicableIds = [];
      }
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usagePerUser: usagePerUser ? Number(usagePerUser) : 1,
      applicableTo: applicableTo || 'all',
      applicableIds: parsedApplicableIds || [],
      createdBy: adminId
    });

    return res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: coupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cupón con este código'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Error al crear el cupón'
    });
  }
};

/**
 * Get all coupons
 * GET /coupons
 * Protected: Admin only
 */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });

  } catch (error) {
    console.error('Get coupons error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los cupones'
    });
  }
};

/**
 * Get coupon by ID
 * GET /coupons/:id
 * Protected: Admin only
 */
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    let coupon;

    // Try to find by MongoDB _id first
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      coupon = await Coupon.findById(id);
    } else {
      // Otherwise try numeric id
      const couponId = parseInt(id);
      if (!isNaN(couponId)) {
        coupon = await Coupon.findOne({ id: couponId });
      }
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Get coupon by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el cupón'
    });
  }
};

/**
 * Update coupon
 * PUT /coupons/:id
 * Protected: Admin only
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      isActive,
      usageLimit,
      usagePerUser,
      applicableTo,
      applicableIds
    } = req.body;

    let coupon;

    // Find coupon
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      coupon = await Coupon.findById(id);
    } else {
      const couponId = parseInt(id);
      if (!isNaN(couponId)) {
        coupon = await Coupon.findOne({ id: couponId });
      }
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }

    // Check if new code already exists (if changing code)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cupón con este código'
        });
      }
    }

    // Parse applicableIds if string
    let parsedApplicableIds = applicableIds;
    if (applicableIds && typeof applicableIds === 'string') {
      try {
        parsedApplicableIds = JSON.parse(applicableIds);
      } catch (e) {
        parsedApplicableIds = coupon.applicableIds;
      }
    }

    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (description) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minPurchase !== undefined) coupon.minPurchase = Number(minPurchase);
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (startDate) coupon.startDate = new Date(startDate);
    if (endDate) coupon.endDate = new Date(endDate);
    if (isActive !== undefined) coupon.isActive = isActive;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (usagePerUser !== undefined) coupon.usagePerUser = Number(usagePerUser);
    if (applicableTo) coupon.applicableTo = applicableTo;
    if (parsedApplicableIds) coupon.applicableIds = parsedApplicableIds;

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      data: coupon
    });

  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar el cupón'
    });
  }
};

/**
 * Delete coupon
 * DELETE /coupons/:id
 * Protected: Admin only
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    let coupon;

    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      coupon = await Coupon.findById(id);
    } else {
      const couponId = parseInt(id);
      if (!isNaN(couponId)) {
        coupon = await Coupon.findOne({ id: couponId });
      }
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }

    await Coupon.findByIdAndDelete(coupon._id);

    return res.status(200).json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el cupón'
    });
  }
};

/**
 * Toggle coupon active status
 * PATCH /coupons/:id/toggle
 * Protected: Admin only
 */
export const toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    let coupon;

    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      coupon = await Coupon.findById(id);
    } else {
      const couponId = parseInt(id);
      if (!isNaN(couponId)) {
        coupon = await Coupon.findOne({ id: couponId });
      }
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Cupón ${coupon.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: coupon
    });

  } catch (error) {
    console.error('Toggle coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del cupón'
    });
  }
};

/**
 * Validate coupon code
 * POST /coupons/validate
 * Protected: Authenticated users
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'El código del cupón es requerido'
      });
    }

    if (cartTotal === undefined || cartTotal < 0) {
      return res.status(400).json({
        success: false,
        message: 'El total del carrito es requerido'
      });
    }

    // Find coupon
    const coupon = await Coupon.findByCode(code);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Cupón no encontrado o no está activo'
      });
    }

    // Check if coupon can be used (dates, limits, min purchase)
    const canBeUsed = coupon.canBeUsed(cartTotal);
    if (!canBeUsed.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: canBeUsed.message
      });
    }

    // Check user's usage of this coupon
    const userUsageCount = await CouponUsage.getUserUsageCount(coupon.id, userId);
    if (userUsageCount >= coupon.usagePerUser) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Ya has usado este cupón el máximo de veces permitido'
      });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal);
    const finalTotal = parseFloat((cartTotal - discount).toFixed(2));

    return res.status(200).json({
      success: true,
      valid: true,
      message: 'Cupón válido',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: discount,
        originalTotal: cartTotal,
        finalTotal: finalTotal,
        description: coupon.description
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Error al validar el cupón'
    });
  }
};

/**
 * Get coupon usage history (all coupons)
 * GET /coupons/usage
 * Protected: Admin only
 */
export const getCouponUsage = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;

    let query = {};

    // Date filter
    if (startDate || endDate) {
      query.usedAt = {};
      if (startDate) query.usedAt.$gte = new Date(startDate);
      if (endDate) query.usedAt.$lte = new Date(endDate);
    }

    const usage = await CouponUsage.find(query)
      .sort({ usedAt: -1 })
      .limit(parseInt(limit));

    // Calculate totals
    const totals = await CouponUsage.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalUses: { $sum: 1 },
          totalDiscountGiven: { $sum: '$discountApplied' },
          totalOrderValue: { $sum: '$orderSubtotal' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      count: usage.length,
      totals: totals.length > 0 ? {
        totalUses: totals[0].totalUses,
        totalDiscountGiven: parseFloat(totals[0].totalDiscountGiven.toFixed(2)),
        totalOrderValue: parseFloat(totals[0].totalOrderValue.toFixed(2))
      } : {
        totalUses: 0,
        totalDiscountGiven: 0,
        totalOrderValue: 0
      },
      data: usage
    });

  } catch (error) {
    console.error('Get coupon usage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de uso'
    });
  }
};

/**
 * Get usage history for a specific coupon
 * GET /coupons/:id/usage
 * Protected: Admin only
 */
export const getCouponUsageById = async (req, res) => {
  try {
    const { id } = req.params;

    let coupon;

    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      coupon = await Coupon.findById(id);
    } else {
      const couponId = parseInt(id);
      if (!isNaN(couponId)) {
        coupon = await Coupon.findOne({ id: couponId });
      }
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }

    const usage = await CouponUsage.find({ coupon: coupon.id })
      .sort({ usedAt: -1 });

    const stats = await CouponUsage.getCouponStats(coupon.id);

    return res.status(200).json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description
      },
      stats,
      count: usage.length,
      data: usage
    });

  } catch (error) {
    console.error('Get coupon usage by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de uso'
    });
  }
};
