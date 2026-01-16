'use client';

/**
 * ReviewStars Component
 * Displays stars for rating - can be interactive (for input) or read-only (for display)
 *
 * @param {number} rating - Current rating value (1-5)
 * @param {function} onRatingChange - Callback when rating changes (if interactive)
 * @param {boolean} readOnly - If true, stars are not clickable
 * @param {string} size - Size of stars: 'sm', 'md', 'lg'
 * @param {boolean} showValue - Show numeric value next to stars
 */
export default function ReviewStars({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = 'md',
  showValue = false
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizes[size] || sizes.md;

  const handleClick = (starIndex) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readOnly}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform focus:outline-none disabled:cursor-default`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`${starSize} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-500 fill-gray-500'
            } transition-colors`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-gray-400 text-sm">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}

/**
 * ReviewCard Component
 * Displays a single review with user info, stars, comment, and optional admin response
 */
export function ReviewCard({ review, showStatus = false }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isApproved, isVisible) => {
    if (!isVisible) {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Rechazada</span>;
    }
    if (isApproved) {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Aprobada</span>;
    }
    return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pendiente</span>;
  };

  const getTypeBadge = (type) => {
    const types = {
      product: { text: 'Producto', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      order: { text: 'Orden', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      reservation: { text: 'Reserva', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
    };
    const badge = types[type] || types.product;
    return <span className={`px-2 py-0.5 text-xs rounded-full border ${badge.color}`}>{badge.text}</span>;
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 hover:border-neutral-600 transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
            {review.user ? String(review.user).charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-white font-semibold">Usuario #{review.user}</p>
            <p className="text-gray-500 text-xs">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ReviewStars rating={review.stars} readOnly size="sm" />
          {showStatus && (
            <div className="flex gap-2">
              {getTypeBadge(review.type)}
              {getStatusBadge(review.isApproved, review.isVisible)}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="text-white font-semibold mb-2">{review.title}</h4>
      )}

      {/* Comment */}
      <p className="text-gray-300 text-sm mb-3">{review.comment}</p>

      {/* Target Info */}
      {showStatus && (
        <p className="text-gray-500 text-xs mb-3">
          {review.type === 'product' && `Producto ID: ${review.targetId}`}
          {review.type === 'order' && `Orden: ${review.targetId}`}
          {review.type === 'reservation' && `Reserva ID: ${review.targetId}`}
        </p>
      )}

      {/* Admin Response */}
      {review.adminResponse && (
        <div className="mt-3 pt-3 border-t border-neutral-700">
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-500 text-xs font-semibold">Respuesta del restaurante</span>
              {review.respondedAt && (
                <span className="text-gray-500 text-xs">{formatDate(review.respondedAt)}</span>
              )}
            </div>
            <p className="text-gray-300 text-sm">{review.adminResponse}</p>
          </div>
        </div>
      )}
    </div>
  );
}
