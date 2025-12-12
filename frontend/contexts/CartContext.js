'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart, clearCart as apiClearCart } from '@/lib/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  // Initialize sessionId on mount
  useEffect(() => {
    let sid = localStorage.getItem('cartSessionId');
    
    if (!sid) {
      // Generate new sessionId using browser's crypto API (no library needed)
      sid = crypto.randomUUID();
      localStorage.setItem('cartSessionId', sid);
    }
    
    setSessionId(sid);
  }, []);

  // Load cart when sessionId is ready
  useEffect(() => {
    if (sessionId) {
      loadCart();
    }
  }, [sessionId]);

  const loadCart = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const response = await getCart(sessionId);
      setCart(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, customizations) => {
    if (!sessionId) return { success: false, message: 'Session not ready' };
    
    try {
      const response = await apiAddToCart(sessionId, productId, quantity, customizations);
      setCart(response.data);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: error.message };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!sessionId || !cart) return;
    
    // Optimistic update - update UI immediately
    const previousCart = { ...cart };
    const updatedItems = cart.items.map(item => {
      if (item._id === itemId) {
        const newQuantity = quantity;
        const subtotal = item.price * newQuantity;
        return { ...item, quantity: newQuantity, subtotal };
      }
      return item;
    });
    
    // If quantity is 0, remove the item
    const filteredItems = quantity === 0 ? updatedItems.filter(item => item._id !== itemId) : updatedItems;
    
    const newTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
    const newTotalPrice = filteredItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    setCart({
      ...cart,
      items: filteredItems,
      totalItems: newTotalItems,
      totalPrice: newTotalPrice
    });
    
    // Then sync with server
    try {
      const response = await updateCartItem(sessionId, itemId, quantity);
      setCart(response.data);
      
      // Trigger event to reload menu if on menu page
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error updating cart:', error);
      // Rollback on error
      setCart(previousCart);
      alert('Error al actualizar el carrito. Por favor intenta de nuevo.');
    }
  };

  const removeItem = async (itemId) => {
    if (!sessionId) return;
    
    try {
      const response = await removeFromCart(sessionId, itemId);
      setCart(response.data);
      
      // Trigger event to reload menu if on menu page
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (!sessionId) return;
    
    try {
      const response = await apiClearCart(sessionId);
      setCart(response.data);
      
      // Trigger event to reload menu if on menu page
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addToCart, 
      updateQuantity, 
      removeItem, 
      clearCart,
      refreshCart: loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
