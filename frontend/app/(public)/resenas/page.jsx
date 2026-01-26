'use client';

import { useEffect, useState } from 'react';
import { getApprovedReviews, getReviewStats } from '@/lib/api';
import ReviewStars from '@/components/ReviewStars';

export default function ResenasPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStars, setSelectedStars] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const typeFilters = [
    { value: 'all', label: 'Todas' },
    { value: 'product', label: 'Productos' },
    { value: 'order', label: 'Pedidos' },
    { value: 'reservation', label: 'Reservaciones' }
  ];

  const starFilters = [
    { value: 'all', label: 'Todas' },
    { value: '5', label: '5 estrellas' },
    { value: '4', label: '4 estrellas' },
    { value: '3', label: '3 estrellas' },
    { value: '2', label: '2 estrellas' },
    { value: '1', label: '1 estrella' }
  ];

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [selectedType, selectedStars, page]);

  const loadStats = async () => {
    try {
      const data = await getReviewStats();
      setStats(data.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        limit: 12,
        page
      };

      if (selectedType !== 'all') {
        filters.type = selectedType;
      }

      if (selectedStars !== 'all') {
        filters.stars = selectedStars;
      }

      const data = await getApprovedReviews(filters);
      setReviews(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    setPage(1);
    if (type === 'type') {
      setSelectedType(value);
    } else if (type === 'stars') {
      setSelectedStars(value);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getTypeBadge = (type) => {
    const types = {
      product: { text: 'Producto', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      order: { text: 'Pedido', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      reservation: { text: 'Reserva', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
    };
    const badge = types[type] || types.product;
    return <span className={`px-2 py-0.5 text-xs rounded-full border ${badge.color}`}>{badge.text}</span>;
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Reseñas de Clientes</h1>
          <p className="text-xl opacity-90">Opiniones reales de quienes nos han visitado</p>
        </div>
      </section>

      {/* Stats Section */}
      {stats && stats.totalReviews > 0 && (
        <section className="bg-neutral-800 py-8 border-b border-neutral-700">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {/* Average Rating */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-yellow-400">{stats.averageRating}</span>
                  <svg className="w-8 h-8 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <p className="text-gray-400">Calificación promedio</p>
              </div>

              {/* Total Reviews */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stats.totalReviews}</div>
                <p className="text-gray-400">Reseñas totales</p>
              </div>

              {/* Recommendation Rate */}
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">{stats.recommendationRate}%</div>
                <p className="text-gray-400">Nos recomiendan</p>
              </div>
            </div>

            {/* Star Distribution */}
            <div className="max-w-md mx-auto mt-8">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[`${star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'}Stars`];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <span className="text-gray-400 text-sm w-8">{star}</span>
                    <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <div className="flex-1 bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-500 text-sm w-10 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Filter Section */}
      <section className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Type Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {typeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange('type', filter.value)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition font-medium text-sm ${
                    selectedType === filter.value
                      ? 'bg-orange-600 text-white'
                      : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-neutral-600 hidden md:block" />

            {/* Star Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {starFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange('stars', filter.value)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition font-medium text-sm flex items-center gap-1 ${
                    selectedStars === filter.value
                      ? 'bg-yellow-600 text-white'
                      : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                  }`}
                >
                  {filter.value !== 'all' && (
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-6 py-4 rounded-lg text-center max-w-2xl mx-auto">
              <p className="text-lg font-semibold mb-2">Error al cargar las reseñas</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">No hay reseñas disponibles</h3>
              <p className="text-gray-400 text-lg">
                {selectedType !== 'all' || selectedStars !== 'all'
                  ? 'No se encontraron reseñas con los filtros seleccionados.'
                  : 'Aún no tenemos reseñas. ¡Sé el primero en compartir tu experiencia!'}
              </p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <article
                    key={review._id}
                    className="bg-neutral-800 rounded-xl border border-neutral-700 hover:border-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-600/10 p-6"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{review.userName || 'Usuario'}</p>
                          <p className="text-gray-500 text-xs">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      {getTypeBadge(review.type)}
                    </div>

                    {/* Stars */}
                    <div className="mb-3">
                      <ReviewStars rating={review.stars} readOnly size="md" />
                    </div>

                    {/* Title */}
                    {review.title && (
                      <h4 className="text-white font-semibold mb-2">{review.title}</h4>
                    )}

                    {/* Comment */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4">
                      {review.comment}
                    </p>

                    {/* Admin Response */}
                    {review.adminResponse && (
                      <div className="mt-4 pt-4 border-t border-neutral-700">
                        <div className="bg-neutral-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-orange-500 text-xs font-semibold">Respuesta de Bocatto</span>
                          </div>
                          <p className="text-gray-300 text-sm">{review.adminResponse}</p>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-neutral-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-400">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-neutral-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
