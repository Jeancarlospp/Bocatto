'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMyOrders, createReview, getMyReviews } from '@/lib/api';
import ReviewStars from '@/components/ReviewStars';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModal, setReviewModal] = useState(null); // { orderId, orderNumber, type: 'order' | 'product', productId?, productName? }
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/menu');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, reviewsRes] = await Promise.all([
        getMyOrders(),
        getMyReviews().catch(() => ({ data: [] })) // Don't fail if reviews fetch fails
      ]);
      setOrders(ordersRes.data);
      setMyReviews(reviewsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has already reviewed an order or product
  const hasReviewed = (type, targetId) => {
    return myReviews.some(r => r.type === type && r.targetId === targetId);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      confirmed: { text: 'Confirmado', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      preparing: { text: 'Preparando', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      ready: { text: 'Listo', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
      delivered: { text: 'Entregado', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
      cancelled: { text: 'Cancelado', color: 'bg-red-500/20 text-red-300 border-red-500/30' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.text}
      </span>
    );
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

  // Extract order number as integer for targetId
  const getOrderNumberInt = (orderNumber) => {
    // orderNumber is like "ORD-000014", extract the number
    const match = orderNumber.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mis Ordenes</h1>
          <p className="text-gray-400">Historial de pedidos realizados</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando ordenes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
            >
              Reintentar
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-neutral-800 rounded-2xl border border-neutral-700">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-white mb-2">No tienes ordenes</h3>
            <p className="text-gray-400 mb-6">Aun no has realizado ningun pedido</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-semibold"
            >
              Ver Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-orange-600/50 transition"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Orden #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Order Items */}
                <div className="mb-4 space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <span className="text-white font-medium">
                          {item.quantity}x {item.name}
                        </span>
                        {item.customizations && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.customizations.removedIngredients?.length > 0 && (
                              <div>Sin: {item.customizations.removedIngredients.join(', ')}</div>
                            )}
                            {item.customizations.addedIngredients?.length > 0 && (
                              <div>Extra: {item.customizations.addedIngredients.join(', ')}</div>
                            )}
                            {item.customizations.allergyWarnings?.length > 0 && (
                              <div className="text-orange-400">
                                Alergias: {item.customizations.allergyWarnings.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Review button for product (only if order is delivered) */}
                        {order.status === 'delivered' && (
                          <div className="mt-1">
                            {hasReviewed('product', item.productId) ? (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Producto resenado
                              </span>
                            ) : (
                              <button
                                onClick={() => setReviewModal({
                                  orderId: order._id,
                                  orderNumber: order.orderNumber,
                                  type: 'product',
                                  productId: item.productId,
                                  productName: item.name
                                })}
                                className="text-xs text-orange-400 hover:text-orange-300 transition flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                Resenar producto
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-300 font-semibold ml-4">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="border-t border-neutral-700 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Tipo de entrega:</span>
                    <span className="text-white font-medium">
                      {order.deliveryType === 'pickup' ? '🏪 Recoger' : '🍽️ Comer Aqui'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Metodo de pago:</span>
                    <span className="text-white font-medium">
                      {order.paymentMethod === 'cash' && '💵 Efectivo'}
                      {order.paymentMethod === 'card' && '💳 Tarjeta'}
                      {order.paymentMethod === 'transfer' && '🏦 Transferencia'}
                    </span>
                  </div>
                  {order.customerNotes && (
                    <div className="text-sm">
                      <span className="text-gray-400">Notas: </span>
                      <span className="text-gray-300">{order.customerNotes}</span>
                    </div>
                  )}

                  {/* Pricing Details */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-gray-300">${(order.subtotalBeforeDiscount || order.subtotal || order.items.reduce((sum, item) => sum + item.subtotal, 0)).toFixed(2)}</span>
                    </div>

                    {/* Coupon Discount */}
                    {order.couponCode && order.couponDiscount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-400">Cupon ({order.couponCode}):</span>
                        <span className="text-green-400">-${order.couponDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">IVA (15%):</span>
                      <span className="text-gray-300">${(order.ivaAmount || (order.subtotal * 0.15)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-neutral-600">
                      <span className="text-white">Total:</span>
                      <span className="text-orange-500">${(order.totalPrice || (order.subtotal * 1.15)).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Review Order Button (only for delivered orders) */}
                  {order.status === 'delivered' && (
                    <div className="pt-4 border-t border-neutral-700">
                      {hasReviewed('order', getOrderNumberInt(order.orderNumber)) ? (
                        <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Ya resenaste esta orden
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewModal({
                            orderId: order._id,
                            orderNumber: order.orderNumber,
                            type: 'order',
                            targetId: getOrderNumberInt(order.orderNumber)
                          })}
                          className="w-full py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/50 text-orange-400 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Dejar Resena de la Orden
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          reviewData={reviewModal}
          onClose={() => setReviewModal(null)}
          onSuccess={() => {
            setReviewModal(null);
            fetchData(); // Refresh to update review status
          }}
        />
      )}
    </div>
  );
}

// Review Modal Component
function ReviewModal({ reviewData, onClose, onSuccess }) {
  const [stars, setStars] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (comment.length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const targetId = reviewData.type === 'product'
        ? reviewData.productId
        : reviewData.targetId;

      await createReview({
        type: reviewData.type,
        targetId,
        stars,
        title: title.trim() || null,
        comment: comment.trim()
      });

      alert('Resena enviada exitosamente. Sera visible despues de la aprobacion.');
      onSuccess();
    } catch (err) {
      console.error('Error creating review:', err);
      setError(err.message || 'Error al enviar la resena');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-neutral-800 rounded-2xl max-w-md w-full shadow-2xl border border-neutral-700">
        {/* Header */}
        <div className="border-b border-neutral-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Escribir Resena</h2>
            <p className="text-gray-400 text-sm mt-1">
              {reviewData.type === 'product'
                ? `Producto: ${reviewData.productName}`
                : `Orden: ${reviewData.orderNumber}`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-2 hover:bg-neutral-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-white font-semibold mb-3">Calificacion</label>
            <div className="flex items-center gap-3">
              <ReviewStars rating={stars} onRatingChange={setStars} size="lg" />
              <span className="text-gray-400">({stars} de 5)</span>
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Titulo <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumen de tu experiencia"
              maxLength={100}
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-white font-semibold mb-2">Comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuentanos tu experiencia (minimo 10 caracteres)"
              minLength={10}
              maxLength={1000}
              rows={4}
              required
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-gray-500 text-xs mt-1 text-right">{comment.length}/1000</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-neutral-700/50 rounded-lg p-3 text-gray-400 text-xs">
            Tu resena sera revisada antes de publicarse. Gracias por tu opinion.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || comment.length < 10}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Resena'}
          </button>
        </form>
      </div>
    </div>
  );
}
