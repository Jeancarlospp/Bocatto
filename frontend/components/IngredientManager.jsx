'use client';

import { useState } from 'react';

/**
 * Ingredient Manager Component
 * Allows adding ingredients and toggling their customizability
 */
export default function IngredientManager({ ingredients = [], onChange }) {
  const [newIngredient, setNewIngredient] = useState('');

  // Ensure ingredients is always an array of valid objects
  const safeIngredients = Array.isArray(ingredients) 
    ? ingredients.filter(ing => ing && typeof ing === 'object' && ing.name)
    : [];

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;

    const updated = [
      ...safeIngredients,
      { name: newIngredient.trim(), customizable: false }
    ];
    onChange(updated);
    setNewIngredient('');
  };

  const handleToggleCustomizable = (index) => {
    const updated = safeIngredients.map((ing, i) => 
      i === index ? { ...ing, customizable: !ing.customizable } : ing
    );
    onChange(updated);
  };

  const handleRemoveIngredient = (index) => {
    const updated = safeIngredients.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Agregar ingrediente..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
        />
        <button
          type="button"
          onClick={handleAddIngredient}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
        >
          ➕ Agregar
        </button>
      </div>

      {safeIngredients.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Ingredientes del producto ({safeIngredients.length}):
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-80 overflow-y-auto">
            {safeIngredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-orange-300 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-gray-800 font-medium">
                    {ingredient.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    {ingredient.customizable ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold flex items-center gap-1">
                        ✨ Personalizable
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold flex items-center gap-1">
                        🔒 Fijo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle customizable */}
                  <button
                    type="button"
                    onClick={() => handleToggleCustomizable(index)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                      ingredient.customizable ? 'bg-green-600' : 'bg-gray-400'
                    }`}
                    title={ingredient.customizable ? 'Cliente puede quitar este ingrediente' : 'Ingrediente fijo (no se puede quitar)'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        ingredient.customizable ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                    title="Eliminar ingrediente"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900 mb-1">💡 ¿Cómo funciona?</p>
            <ul className="text-blue-800 space-y-1">
              <li>• <strong>🔒 Fijo (por defecto):</strong> Ingrediente base del producto, NO aparece en personalización del cliente</li>
              <li>• <strong>✨ Personalizable:</strong> El cliente SÍ puede elegir si lo quiere o no en su orden</li>
              <li>• Usa el toggle para permitir que el cliente personalice ese ingrediente</li>
            </ul>
          </div>
        </div>
      )}

      {ingredients.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-4xl mb-2">🍽️</p>
          <p className="font-medium">No hay ingredientes agregados</p>
          <p className="text-sm mt-1">Agrega ingredientes para este producto</p>
        </div>
      )}
    </div>
  );
}
