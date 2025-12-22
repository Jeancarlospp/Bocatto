'use client';

import { useState, useEffect } from 'react';

export default function ProductCustomizationModal({ product, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [allergyWarnings, setAllergyWarnings] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !product) return null;

  const handleIngredientToggle = (ingredient) => {
    setRemovedIngredients(prev => {
      if (prev.includes(ingredient)) {
        return prev.filter(i => i !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && (!product.currentStock || newQuantity <= product.currentStock)) {
      setQuantity(newQuantity);
    }
  };

  const calculateTotal = () => {
    return (product.price * quantity).toFixed(2);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    const customizations = {
      removedIngredients,
      addedIngredients: [],
      allergyWarnings,
      specialInstructions: specialInstructions.trim()
    };

    await onAddToCart(product.productId, quantity, customizations);
    
    // Reset form after successful add
    setQuantity(1);
    setRemovedIngredients([]);
    setAllergyWarnings([]);
    setSpecialInstructions('');
    setIsAdding(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-700 animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 p-6 flex justify-between items-start z-10">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-white mb-1">{product.name}</h2>
            <p className="text-gray-400 text-sm">{product.description}</p>
            <div className="mt-2">
              <span className="text-3xl font-bold text-orange-500">${product.price.toFixed(2)}</span>
              {product.category && (
                <span className="ml-3 px-3 py-1 bg-orange-600/20 text-orange-400 text-xs font-semibold rounded-full">
                  {product.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-2 hover:bg-neutral-700 rounded-lg"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Image */}
        {product.img && (
          <div className="relative h-64 bg-neutral-700">
            <img
              src={product.img}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Ingredients Section */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Personaliza tus ingredientes
              </h3>
              <p className="text-gray-400 text-sm mb-4">Selecciona los ingredientes que deseas remover</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.ingredients.map((ingredient, index) => {
                  const isRemoved = removedIngredients.includes(ingredient);
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                        isRemoved
                          ? 'bg-red-900/20 border-red-500/50'
                          : 'bg-neutral-700 border-neutral-600 hover:border-orange-500/50'
                      }`}
                      onClick={() => handleIngredientToggle(ingredient)}
                    >
                      <span className={`font-medium ${isRemoved ? 'text-red-400 line-through' : 'text-white'}`}>
                        {ingredient}
                      </span>
                      
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-neutral-800 ${
                          isRemoved ? 'bg-red-600' : 'bg-green-600'
                        }`}
                        role="switch"
                        aria-checked={!isRemoved}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isRemoved ? 'translate-x-1' : 'translate-x-6'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Allergy Warnings Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Advertencias de alergia
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Especifica los alérgenos para esta orden (útil al ordenar para otra persona)
            </p>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ej: gluten, lactosa, maní, mariscos"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    const allergy = e.target.value.trim().toLowerCase();
                    if (!allergyWarnings.includes(allergy)) {
                      setAllergyWarnings([...allergyWarnings, allergy]);
                    }
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              
              {allergyWarnings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allergyWarnings.map((allergy, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm"
                    >
                      <span>{allergy}</span>
                      <button
                        onClick={() => setAllergyWarnings(allergyWarnings.filter((_, i) => i !== index))}
                        className="text-red-400 hover:text-red-200 transition"
                        aria-label={`Remover ${allergy}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Presiona Enter para agregar cada alérgeno
              </p>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Instrucciones especiales
            </h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="¿Alguna preferencia adicional? (Ej: Sin sal, extra picante, etc.)"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {specialInstructions.length}/500 caracteres
            </p>
          </div>

          {/* Quantity and Total */}
          <div className="bg-neutral-700/50 rounded-xl p-5 border border-neutral-600">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold">Cantidad</span>
              
              {/* Quantity Counter */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition"
                >
                  −
                </button>
                
                <span className="text-2xl font-bold text-white w-12 text-center">
                  {quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={product.currentStock && quantity >= product.currentStock}
                  className="w-10 h-10 flex items-center justify-center bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Warning */}
            {product.currentStock && quantity >= product.currentStock && (
              <p className="text-yellow-400 text-sm mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Stock máximo alcanzado
              </p>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-600">
              <span className="text-lg text-gray-300">Total:</span>
              <span className="text-3xl font-bold text-orange-500">${calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-neutral-800 border-t border-neutral-700 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || (product.currentStock !== undefined && product.currentStock < quantity)}
            className="flex-1 py-3 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Agregando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Agregar al Carrito
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
