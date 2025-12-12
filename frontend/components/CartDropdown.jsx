'use client';

import { useState, useEffect, useRef } from 'react';

export default function CartDropdown({ cart, onUpdateQuantity, onRemoveItem, onClearCart, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const dropdownRef = useRef(null);
  const updateTimeoutRef = useRef({});

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
  const totalPrice = cart?.totalPrice || 0;

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
              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300 font-semibold">Total:</span>
                <span className="text-2xl font-bold text-orange-500">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button 
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                onClick={() => {
                  // TODO: Implement checkout
                  alert('Funcionalidad de pago próximamente');
                }}
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
    </div>
  );
}
