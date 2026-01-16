'use client';

import { useEffect, useState } from 'react';
import { getPendingReviews, approveReview, rejectReview, respondToReview } from '@/lib/api';
import ReviewStars, { ReviewCard } from '@/components/ReviewStars';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending', 'all'
  const [selectedReview, setSelectedReview] = useState(null); // For respond modal
  const [actionLoading, setActionLoading] = useState(null); // Track which review is being acted on

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      // For now, we only have getPendingReviews endpoint
      const response = await getPendingReviews();
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    if (!window.confirm('Aprobar esta reseña? Sera visible publicamente.')) return;

    setActionLoading(reviewId);
    try {
      await approveReview(reviewId);
      // Remove from list since it's no longer pending
      setReviews(reviews.filter(r => r._id !== reviewId && r.id !== reviewId));
      alert('Reseña aprobada exitosamente');
    } catch (err) {
      console.error('Error approving review:', err);
      alert(err.message || 'Error al aprobar la reseña');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId) => {
    if (!window.confirm('Rechazar esta reseña? No sera visible publicamente.')) return;

    setActionLoading(reviewId);
    try {
      await rejectReview(reviewId);
      // Remove from list
      setReviews(reviews.filter(r => r._id !== reviewId && r.id !== reviewId));
      alert('Reseña rechazada');
    } catch (err) {
      console.error('Error rejecting review:', err);
      alert(err.message || 'Error al rechazar la reseña');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRespond = async (reviewId, responseText) => {
    setActionLoading(reviewId);
    try {
      await respondToReview(reviewId, responseText);
      // Update review in list
      setReviews(reviews.map(r => {
        if (r._id === reviewId || r.id === reviewId) {
          return { ...r, adminResponse: responseText, respondedAt: new Date().toISOString() };
        }
        return r;
      }));
      setSelectedReview(null);
      alert('Respuesta enviada exitosamente');
    } catch (err) {
      console.error('Error responding to review:', err);
      alert(err.message || 'Error al responder la reseña');
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeBadge = (type) => {
    const types = {
      product: { text: 'Producto', color: 'bg-blue-100 text-blue-800' },
      order: { text: 'Orden', color: 'bg-purple-100 text-purple-800' },
      reservation: { text: 'Reserva', color: 'bg-orange-100 text-orange-800' }
    };
    const badge = types[type] || types.product;
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${badge.color}`}>{badge.text}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestion de Reseñas</h2>
          <p className="text-gray-800 font-medium mt-1">Modera y responde a las reseñas de los clientes</p>
        </div>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{reviews.length}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Por Tipo</p>
              <p className="text-sm text-gray-600 mt-1">
                Productos: {reviews.filter(r => r.type === 'product').length} |
                Ordenes: {reviews.filter(r => r.type === 'order').length} |
                Reservas: {reviews.filter(r => r.type === 'reservation').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Promedio Calificacion</p>
              <p className="text-2xl font-bold text-orange-600">
                {reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
                  : '-'
                }
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando reseñas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Reintentar
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay reseñas pendientes</h3>
          <p className="text-gray-500">Todas las reseñas han sido moderadas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id || review.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              {/* Review Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                    U{review.user}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Usuario #{review.user}</p>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ReviewStars rating={review.stars} readOnly size="md" />
                  <div className="flex gap-2">
                    {getTypeBadge(review.type)}
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Info */}
              <div className="mb-3 text-sm text-gray-500">
                {review.type === 'product' && `Producto ID: ${review.targetId}`}
                {review.type === 'order' && `Orden #: ${review.targetId}`}
                {review.type === 'reservation' && `Reserva ID: ${review.targetId}`}
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
              )}
              <p className="text-gray-600 mb-4">{review.comment}</p>

              {/* Admin Response (if any) */}
              {review.adminResponse && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-orange-600 mb-1">Tu respuesta:</p>
                  <p className="text-gray-600 text-sm">{review.adminResponse}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(review._id || review.id)}
                  disabled={actionLoading === (review._id || review.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aprobar
                </button>
                <button
                  onClick={() => handleReject(review._id || review.id)}
                  disabled={actionLoading === (review._id || review.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Rechazar
                </button>
                <button
                  onClick={() => setSelectedReview(review)}
                  disabled={actionLoading === (review._id || review.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Responder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Respond Modal */}
      {selectedReview && (
        <RespondModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onSubmit={(responseText) => handleRespond(selectedReview._id || selectedReview.id, responseText)}
          isLoading={actionLoading === (selectedReview._id || selectedReview.id)}
        />
      )}
    </div>
  );
}

// Respond Modal Component
function RespondModal({ review, onClose, onSubmit, isLoading }) {
  const [responseText, setResponseText] = useState(review.adminResponse || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (responseText.trim().length < 5) {
      alert('La respuesta debe tener al menos 5 caracteres');
      return;
    }
    onSubmit(responseText.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Responder Reseña</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Original Review */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <ReviewStars rating={review.stars} readOnly size="sm" />
            <span className="text-sm text-gray-500">por Usuario #{review.user}</span>
          </div>
          {review.title && <p className="font-medium text-gray-800 mb-1">{review.title}</p>}
          <p className="text-gray-600 text-sm">{review.comment}</p>
        </div>

        {/* Response Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Tu respuesta
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Escribe tu respuesta al cliente..."
              rows={4}
              maxLength={500}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none bg-white text-gray-900"
            />
            <p className="text-gray-800 font-medium text-xs mt-1 text-right">{responseText.length}/500</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || responseText.trim().length < 5}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg transition"
            >
              {isLoading ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
