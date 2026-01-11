import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Menu.js';

/**
 * Create new order from cart (checkout)
 * POST /api/orders
 * Body: { deliveryType, paymentMethod, customerNotes? }
 * Protected: Requires authentication
 */
export const createOrder = async (req, res) => {
  try {
    const { deliveryType, paymentMethod, customerNotes, sessionId } = req.body;
    const userId = req.user.id;

    console.log('=== CREATE ORDER DEBUG ===');
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    console.log('Delivery Type:', deliveryType);
    console.log('Payment Method:', paymentMethod);

    // Validate required fields
    if (!deliveryType || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Delivery type and payment method are required'
      });
    }

    // Validate enum values
    const validDeliveryTypes = ['pickup', 'dine-in'];
    const validPaymentMethods = ['cash', 'card', 'transfer'];

    if (!validDeliveryTypes.includes(deliveryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery type. Must be "pickup" or "dine-in"'
      });
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be "cash", "card", or "transfer"'
      });
    }

    // Find active cart for user by userId OR sessionId
    // This handles cases where user just logged in and cart isn't linked yet
    const cartQuery = {
      status: 'active',
      $or: [
        { user: userId }
      ]
    };

    // Add sessionId to query if provided
    if (sessionId) {
      cartQuery.$or.push({ sessionId });
    }

    console.log('Cart Query:', JSON.stringify(cartQuery, null, 2));

    let cart = await Cart.findOne(cartQuery).populate('items.product');

    console.log('Cart found:', cart ? 'Yes' : 'No');
    if (cart) {
      console.log('Cart items count:', cart.items.length);
      console.log('Cart user:', cart.user);
      console.log('Cart sessionId:', cart.sessionId);
    }

    // If cart found by sessionId but no user, link it to this user
    if (cart && !cart.user && userId) {
      console.log('Linking cart to user');
      cart.user = userId;
      await cart.save();
    }

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add products before checkout'
      });
    }

    // Verify stock and availability for all products
    for (const item of cart.items) {
      const product = await Product.findOne({ productId: item.productId });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} no longer exists`
        });
      }

      if (!product.available) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.name} is no longer available`
        });
      }

      if (product.currentStock !== undefined && product.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Only ${product.currentStock} available`
        });
      }
    }

    // Create order from cart
    console.log('Creating order with items:', cart.items.length);
    
    const orderItems = cart.items.map(item => {
      console.log('Processing item:', {
        name: item.name,
        productId: item.productId,
        product: item.product || item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      });
      
      return {
        product: item.product || item.productId,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations || {},
        subtotal: item.subtotal
      };
    });

    const order = new Order({
      user: userId,
      sessionId: cart.sessionId,
      items: orderItems,
      deliveryType,
      paymentMethod,
      customerNotes: customerNotes || '',
      estimatedReadyTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    console.log('Order object created, attempting to save...');
    await order.save();
    console.log('Order saved successfully:', order.orderNumber);

    // Mark cart as completed and link to order
    cart.status = 'completed';
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

/**
 * Get all orders for authenticated user
 * GET /api/orders/my-orders?status=pending&limit=10
 * Protected: Requires authentication
 */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20 } = req.query;

    const filter = { user: userId };
    
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

/**
 * Get specific order by ID
 * GET /api/orders/:id
 * Protected: Requires authentication (owner or admin)
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is owner or admin
    if (order.user !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

/**
 * Get all orders (admin only)
 * GET /api/orders?status=preparing&deliveryType=pickup&limit=50
 * Protected: Admin only
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, deliveryType, limit = 50, page = 1 } = req.query;
    
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (deliveryType) {
      filter.deliveryType = deliveryType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: orders
    });

  } catch (error) {
    console.error('Error fetching all orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

/**
 * Update order status (admin only)
 * PUT /api/orders/:id/status
 * Body: { status, staffNotes? }
 * Protected: Admin only
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staffNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prevent changing status of cancelled or delivered orders
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of ${order.status} orders`
      });
    }

    order.status = status;
    
    if (staffNotes) {
      order.staffNotes = staffNotes;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

/**
 * Cancel order
 * DELETE /api/orders/:id
 * Body: { reason? }
 * Protected: Owner or admin
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is owner or admin
    if (order.user !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders'
      });
    }

    // Prevent cancelling already completed or cancelled orders
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered orders'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Restore stock for all items
    for (const item of order.items) {
      const product = await Product.findOne({ productId: item.productId });
      if (product && product.currentStock !== undefined) {
        product.currentStock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by ' + (userRole === 'admin' ? 'admin' : 'customer');
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

/**
 * Get active orders for kitchen display
 * GET /api/orders/kitchen/active
 * Returns orders with status: confirmed, preparing, ready
 * Public or protected based on requirements
 */
export const getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['confirmed', 'preparing', 'ready'] }
    })
      .sort({ createdAt: 1 }); // Oldest first

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching kitchen orders',
      error: error.message
    });
  }
};
