import Cart from '../models/Cart.js';
import Product from '../models/Menu.js';
import mongoose from 'mongoose';

// Get or create cart
export const getCart = async (req, res) => {
  try {
    console.log('Get Cart - Body:', req.body);
    console.log('Get Cart - User:', req.user);
    
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    let cart = await Cart.findOne({ 
      sessionId, 
      status: 'active' 
    }).populate('items.product', 'name price img available currentStock');

    // Create new cart if doesn't exist
    if (!cart) {
      cart = new Cart({
        sessionId,
        user: req.user?.userId || null,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
      await cart.save();
    }

    // Update user if logged in and cart doesn't have user
    if (req.user && !cart.user) {
      cart.user = req.user.userId;
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error('Error in getCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving cart',
      error: error.message
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    console.log('Add to Cart - Body:', req.body);
    console.log('Add to Cart - User:', req.user);

    const { sessionId, productId, quantity, customizations } = req.body;

    // Validation
    if (!sessionId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, product ID, and quantity are required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Validate product exists and is available
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.available) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.currentStock !== undefined && product.currentStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.currentStock} available`
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ 
      sessionId, 
      status: 'active' 
    });

    if (!cart) {
      cart = new Cart({
        sessionId,
        user: req.user?.userId || null,
        items: []
      });
    }

    // Check if item with same customizations exists
    const customizationsStr = JSON.stringify(customizations || {});
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      JSON.stringify(item.customizations) === customizationsStr
    );

    const subtotal = product.price * quantity;

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check stock again for new quantity
      if (product.currentStock !== undefined && product.currentStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.currentStock} available`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].subtotal = product.price * newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: product._id,
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity,
        customizations: customizations || {
          removedIngredients: [],
          addedIngredients: [],
          specialInstructions: ''
        },
        subtotal
      });
    }

    // Update product stock in database (only once)
    if (product.currentStock !== undefined) {
      product.currentStock = Math.max(0, product.currentStock - quantity);
      await product.save();
    }

    await cart.save();    // Populate product details
    await cart.populate('items.product', 'name price img available currentStock');

    return res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: cart
    });

  } catch (error) {
    console.error('Error in addToCart:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error adding product to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    console.log('Update Cart Item - Body:', req.body);

    const { sessionId, itemId, quantity } = req.body;

    if (!sessionId || !itemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, item ID, and quantity are required'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    const cart = await Cart.findOne({ 
      sessionId, 
      status: 'active' 
    }).populate('items.product', 'name price img available currentStock');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const cartItem = cart.items[itemIndex];
    const oldQuantity = cartItem.quantity;

    // If quantity is 0, remove item
    if (quantity === 0) {
      // Restore full stock
      const product = await Product.findById(cartItem.product);
      if (product && product.currentStock !== undefined) {
        product.currentStock += oldQuantity;
        await product.save();
      }
      
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock
      const product = await Product.findById(cart.items[itemIndex].product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (!product.available) {
        return res.status(400).json({
          success: false,
          message: 'Product is no longer available'
        });
      }

      // Calculate stock change
      const quantityDifference = quantity - oldQuantity;
      
      // Check if we have enough stock for increase
      if (quantityDifference > 0) {
        if (product.currentStock !== undefined && product.currentStock < quantityDifference) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Only ${product.currentStock + oldQuantity} available`
          });
        }
      }

      // Update stock
      if (product.currentStock !== undefined) {
        product.currentStock -= quantityDifference; // Can be negative (restore) or positive (decrease)
        await product.save();
      }

      // Update quantity and subtotal
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });

  } catch (error) {
    console.error('Error in updateCartItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    console.log('Remove from Cart - Body:', req.body);

    const { sessionId, itemId } = req.body;

    if (!sessionId || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and item ID are required'
      });
    }

    const cart = await Cart.findOne({ 
      sessionId, 
      status: 'active' 
    }).populate('items.product', 'name price img available currentStock');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const cartItem = cart.items[itemIndex];
    
    // Restore stock before removing
    const product = await Product.findById(cartItem.product);
    if (product && product.currentStock !== undefined) {
      product.currentStock += cartItem.quantity;
      await product.save();
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    });

  } catch (error) {
    console.error('Error in removeFromCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    console.log('Clear Cart - Body:', req.body);

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const cart = await Cart.findOne({ 
      sessionId, 
      status: 'active' 
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Restore stock for all items before clearing
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product && product.currentStock !== undefined) {
        product.currentStock += item.quantity;
        await product.save();
      }
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });

  } catch (error) {
    console.error('Error in clearCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};
