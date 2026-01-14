'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import LoginModal from './LoginModal';

export default function CartDropdown({ cart, onUpdateQuantity, onRemoveItem, onClearCart, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dropdownRef = useRef(null);
  const updateTimeoutRef = useRef({});
  const router = useRouter();
  const { user } = useAuth();
  const { refreshCart } = useCart();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const totalItems = cart?.totalItems || 0;
  const items = cart?.items || [];
  // Calcular subtotal desde items para asegurar valor correcto
  const subtotal = cart?.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
  // Siempre usar 15% de IVA
  const IVA_RATE = 0.15;
  const ivaAmount = parseFloat((subtotal * IVA_RATE).toFixed(2));
  const totalPrice = parseFloat((subtotal + ivaAmount).toFixed(2));

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 0) return;

    // Mark item as updating for UI feedback
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

    // Clear existing timeout for this item
    if (updateTimeoutRef.current[itemId]) {
      clearTimeout(updateTimeoutRef.current[itemId]);
    }

    // Debounce API call - wait 500ms after last change
    updateTimeoutRef.current[itemId] = setTimeout(async () => {
      try {
        await onUpdateQuantity(itemId, newQuantity);
      } finally {
        setUpdatingItems(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      }
    }, 500);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const handleCheckout = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setIsOpen(false);
    setShowCheckoutModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Reload cart after login to associate session with user
    setTimeout(async () => {
      await refreshCart();
      setIsOpen(false);
      setShowCheckoutModal(true);
    }, 300);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg transition"
        aria-label="Shopping cart"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        
        {/* Badge */}
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 z-50 animate-slideDown">
          {/* Header */}
          <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Mi Carrito
            </h3>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
                    onClearCart();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-3">Cargando carrito...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-3">🛒</div>
                <p className="text-gray-400 font-medium">Tu carrito está vacío</p>
                <p className="text-gray-500 text-sm mt-1">Agrega productos para comenzar</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-700">
                {items.map((item) => (
                  <div key={item._id} className="p-4 hover:bg-neutral-750 transition">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-neutral-700 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.product?.img ? (
                          <img
                            src={item.product.img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-orange-500 font-bold text-sm">${item.price.toFixed(2)}</p>
                        
                        {/* Customizations */}
                        {item.customizations?.removedIngredients?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Sin: {item.customizations.removedIngredients.slice(0, 2).join(', ')}
                            {item.customizations.removedIngredients.length > 2 && '...'}
                          </p>
                        )}
                        
                        {/* Allergy Warnings */}
                        {item.customizations?.allergyWarnings?.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-xs text-red-400">
                              Alergia: {item.customizations.allergyWarnings.slice(0, 2).join(', ')}
                              {item.customizations.allergyWarnings.length > 2 && '...'}
                            </p>
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={updatingItems[item._id]}
                            className="w-6 h-6 flex items-center justify-center bg-neutral-600 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-wait text-white rounded text-sm transition"
                          >
                            −
                          </button>
                          <span className="text-white font-semibold text-sm w-8 text-center relative">
                            {item.quantity}
                            {updatingItems[item._id] && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <svg className="animate-spin h-3 w-3 text-orange-500" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={updatingItems[item._id] || (item.product?.currentStock && item.quantity >= item.product.currentStock)}
                            className="w-6 h-6 flex items-center justify-center bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded text-sm transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal and Remove */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => onRemoveItem(item._id)}
                          className="text-red-400 hover:text-red-300 transition p-1"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-white font-bold text-sm">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-neutral-700 bg-neutral-800">
              {/* Subtotal */}
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-gray-300">${subtotal.toFixed(2)}</span>
              </div>
              
              {/* IVA 15% */}
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-gray-400">IVA (15%):</span>
                <span className="text-gray-300">${(subtotal * 0.15).toFixed(2)}</span>
              </div>
              
              {/* Total */}
              <div className="flex justify-between items-center mb-4 pt-2 border-t border-neutral-600">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-2xl font-bold text-orange-500">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button 
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                onClick={handleCheckout}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Proceder al Pago
              </button>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal 
          cart={cart}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            setShowCheckoutModal(false);
            setIsOpen(false);
            router.push('/orders');
          }}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal({ cart, onClose, onSuccess }) {
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const { createOrder } = await import('@/lib/api');
      
      await createOrder({
        deliveryType,
        paymentMethod,
        customerNotes: customerNotes.trim()
      });

      alert('¡Orden creada exitosamente!');
      onSuccess();
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Error al procesar la orden');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-neutral-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-700 animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">Confirmar Orden</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-2 hover:bg-neutral-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-neutral-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Resumen del Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>{cart?.totalItems || 0} items</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span>${(cart?.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>IVA (15%):</span>
                <span>${((cart?.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0) * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-neutral-600">
                <span>Total:</span>
                <span className="text-orange-500">${((cart?.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0) * 1.15).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Type */}
          <div>
            <label className="block text-white font-semibold mb-3">Tipo de Entrega</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-4 rounded-lg border-2 transition ${
                  deliveryType === 'pickup'
                    ? 'border-orange-500 bg-orange-500/20 text-white'
                    : 'border-neutral-600 bg-neutral-700 text-gray-300 hover:border-orange-500/50'
                }`}
              >
                <div className="text-2xl mb-1">🏪</div>
                <div className="font-semibold">Recoger</div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('dine-in')}
                className={`p-4 rounded-lg border-2 transition ${
                  deliveryType === 'dine-in'
                    ? 'border-orange-500 bg-orange-500/20 text-white'
                    : 'border-neutral-600 bg-neutral-700 text-gray-300 hover:border-orange-500/50'
                }`}
              >
                <div className="text-2xl mb-1">🍽️</div>
                <div className="font-semibold">Comer Aquí</div>
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-white font-semibold mb-3">Método de Pago</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-500/20 text-white'
                    : 'border-neutral-600 bg-neutral-700 text-gray-300 hover:border-orange-500/50'
                }`}
              >
                <div className="text-xl mb-1">💵</div>
                <div className="text-sm font-semibold">Efectivo</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-500/20 text-white'
                    : 'border-neutral-600 bg-neutral-700 text-gray-300 hover:border-orange-500/50'
                }`}
              >
                <div className="text-xl mb-1">💳</div>
                <div className="text-sm font-semibold">Tarjeta</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'transfer'
                    ? 'border-orange-500 bg-orange-500/20 text-white'
                    : 'border-neutral-600 bg-neutral-700 text-gray-300 hover:border-orange-500/50'
                }`}
              >
                <div className="text-xl mb-1">🏦</div>
                <div className="text-sm font-semibold">Transfer</div>
              </button>
            </div>
          </div>

          {/* Customer Notes */}
          <div>
            <label className="block text-white font-semibold mb-2">Notas Adicionales (Opcional)</label>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Instrucciones especiales, hora de recogida, etc."
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition text-lg"
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Orden'}
          </button>
        </form>
      </div>
    </div>
  );
}
