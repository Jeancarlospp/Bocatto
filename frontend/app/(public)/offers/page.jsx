'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchOffers } from '@/lib/api';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await fetchOffers();
      // Filter only active offers
      const activeOffers = (data.data || []).filter(offer => offer.active !== false);
      setOffers(activeOffers);
    } catch (err) {
      console.error('Error loading offers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique statuses for filtering
  const statuses = ['all', 'featured', 'limited'];

  // Filter offers by status
  const filteredOffers = selectedStatus === 'all' 
    ? offers 
    : selectedStatus === 'featured' 
    ? offers.filter(offer => offer.featured === true)
    : offers.filter(offer => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today
        const endDate = new Date(offer.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of offer day
        return endDate > today;
      });

  const calculateDiscount = (originalPrice, offerPrice) => {
    if (originalPrice && offerPrice && originalPrice > offerPrice) {
      return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
    }
    return 0;
  };

  const isOfferValid = (offer) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const startDate = new Date(offer.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(offer.endDate);
    endDate.setHours(23, 59, 59, 999); // Set to end of day
    
    return today >= startDate && today <= endDate;
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Ofertas Especiales</h1>
          <p className="text-xl opacity-90">Descubre nuestras promociones y combos especiales con los mejores precios</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition font-medium ${
                  selectedStatus === status
                    ? 'bg-orange-600 text-white'
                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                }`}
              >
                {status === 'all' ? 'Todas' : status === 'featured' ? 'Destacadas' : 'Por Tiempo Limitado'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-6 py-4 rounded-lg text-center max-w-2xl mx-auto">
              <p className="text-lg font-semibold mb-2">Error al cargar las ofertas</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && offers.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-white mb-2">No hay ofertas disponibles</h3>
              <p className="text-gray-400 text-lg">Estamos preparando promociones especiales. Vuelve pronto.</p>
            </div>
          )}

          {!loading && !error && filteredOffers.length === 0 && selectedStatus !== 'all' && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No hay ofertas en esta categoría</h3>
              <p className="text-gray-400 text-lg">Prueba seleccionando otra categoría.</p>
            </div>
          )}

          {!loading && !error && filteredOffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOffers.map((offer) => {
                const discount = calculateDiscount(offer.originalPrice, offer.offerPrice);
                const isValid = isOfferValid(offer);

                return (
                  <article 
                    key={offer._id} 
                    className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-orange-600 transition-all duration-300 hover:shadow-lg hover:shadow-orange-600/20 group relative"
                  >
                    {/* Offer Badge */}
                    {offer.badge && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className={`px-3 py-1 text-white text-sm font-bold rounded-full flex items-center gap-1 bg-${offer.badge.color}-600`}>
                          {offer.badge.icon} {offer.badge.text}
                        </span>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                          -{discount}%
                        </span>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {offer.featured && (
                      <div className="absolute top-16 right-4 z-10">
                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full">
                          ⭐ Destacada
                        </span>
                      </div>
                    )}

                    {/* Offer Image */}
                    <div className="relative h-64 bg-neutral-700 overflow-hidden">
                      {offer.imageUrl ? (
                        <Image
                          src={offer.imageUrl}
                          alt={offer.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl opacity-30">🎁</span>
                        </div>
                      )}
                    </div>

                    {/* Offer Info */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition">
                          {offer.name}
                        </h3>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            {offer.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${offer.originalPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-orange-500">
                              ${offer.offerPrice?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {offer.description || 'Oferta especial por tiempo limitado.'}
                      </p>

                      {/* Items included */}
                      {offer.items && offer.items.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2 font-semibold">Incluye:</p>
                          <div className="space-y-1">
                            {offer.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-300">
                                <span>{item.name}</span>
                                <span>x{item.quantity}</span>
                              </div>
                            ))}
                            {offer.items.length > 3 && (
                              <p className="text-xs text-gray-500">+{offer.items.length - 3} productos más</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Valid days */}
                      {offer.validDays && offer.validDays.length > 0 && offer.validDays.length < 7 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Válido:</p>
                          <p className="text-xs text-gray-300">{offer.validDays.join(', ')}</p>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500">
                          Válido hasta: {new Date(offer.endDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button 
                        className={`w-full py-3 font-semibold rounded-lg transition ${
                          isValid 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                            : 'bg-gray-600 cursor-not-allowed text-gray-300'
                        }`}
                        disabled={!isValid}
                      >
                        {isValid ? 'Aprovechar Oferta' : 'Oferta Expirada'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
