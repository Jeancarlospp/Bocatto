'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchMenu } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import ProductCustomizationModal from '@/components/ProductCustomizationModal';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    loadMenu();
    
    // Listen for cart updates to reload menu
    const handleCartUpdate = () => {
      loadMenu();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await fetchMenu();
      // Filter only available products
      const availableItems = (data.data || []).filter(item => item.available !== false);
      setMenuItems(availableItems);
    } catch (err) {
      console.error('Error loading menu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category).filter(Boolean))];

  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = async (productId, quantity, customizations) => {
    const result = await addToCart(productId, quantity, customizations);
    
    if (result.success) {
      setIsModalOpen(false);
      // Reload menu to reflect updated stock
      await loadMenu();
      alert('¡Producto agregado al carrito!');
    } else {
      alert(result.message || 'Error al agregar al carrito');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Nuestro Menú</h1>
          <p className="text-xl opacity-90">Descubre nuestros deliciosos platos preparados con los mejores ingredientes</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition font-medium ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white'
                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                }`}
              >
                {category === 'all' ? 'Todos' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-6 py-4 rounded-lg text-center max-w-2xl mx-auto">
              <p className="text-lg font-semibold mb-2">Error al cargar el menú</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && menuItems.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-white mb-2">Menú no disponible</h3>
              <p className="text-gray-400 text-lg">Estamos preparando deliciosos platos para ti. Vuelve pronto.</p>
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && selectedCategory !== 'all' && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No hay productos en esta categoría</h3>
              <p className="text-gray-400 text-lg">Prueba seleccionando otra categoría.</p>
            </div>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <article 
                  key={item._id} 
                  className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-orange-600 transition-all duration-300 hover:shadow-lg hover:shadow-orange-600/20 group"
                >
                  {/* Product Image */}
                  <div className="relative h-64 bg-neutral-700 overflow-hidden">
                    {item.img ? (
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-30">🍽️</span>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    {item.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-orange-600 text-white text-sm font-semibold rounded-full">
                          {item.category}
                        </span>
                      </div>
                    )}

                    {/* Stock Badge */}
                    {item.currentStock !== undefined && item.currentStock <= 5 && item.currentStock > 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded-full">
                          ¡Últimas unidades!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition">
                        {item.name}
                      </h3>
                      <span className="text-2xl font-bold text-orange-500 ml-4 flex-shrink-0">
                        ${item.price?.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {item.description || 'Delicioso plato preparado especialmente para ti.'}
                    </p>

                    {/* Subcategory */}
                    {item.subcategory && (
                      <p className="text-gray-500 text-xs mb-3">
                        {item.subcategory}
                      </p>
                    )}

                    {/* Ingredients */}
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 font-semibold">Ingredientes:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.ingredients.slice(0, 5).map((ingredient, idx) => {
                            // Safely extract ingredient name
                            let ingredientName = '';
                            if (typeof ingredient === 'string') {
                              ingredientName = ingredient;
                            } else if (typeof ingredient === 'object' && ingredient !== null) {
                              ingredientName = ingredient.name || String(ingredient);
                            }
                            
                            return ingredientName ? (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-neutral-700 text-gray-300 text-xs rounded"
                              >
                                {ingredientName}
                              </span>
                            ) : null;
                          })}
                          {item.ingredients.length > 5 && (
                            <span className="px-2 py-1 bg-neutral-700 text-gray-300 text-xs rounded">
                              +{item.ingredients.length - 5} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stock Info */}
                    {item.currentStock !== undefined && (
                      <div className="flex items-center gap-2 text-sm mb-4">
                        <span className={`w-2 h-2 rounded-full ${
                          item.currentStock > 10 ? 'bg-green-500' : 
                          item.currentStock > 5 ? 'bg-yellow-500' : 
                          item.currentStock > 0 ? 'bg-orange-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-gray-400 text-xs">
                          {item.currentStock > 0 ? `${item.currentStock} disponibles` : 'Agotado'}
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    <button 
                      onClick={() => handleOrderClick(item)}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                      disabled={item.currentStock === 0}
                    >
                      {item.currentStock === 0 ? 'No Disponible' : 'Ordenar Ahora'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Customization Modal */}
      <ProductCustomizationModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
