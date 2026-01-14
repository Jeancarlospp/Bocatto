'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMyOrders } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/menu');
      return;
    }

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mis Órdenes</h1>
          <p className="text-gray-400">Historial de pedidos realizados</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando órdenes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
            >
              Reintentar
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-neutral-800 rounded-2xl border border-neutral-700">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-white mb-2">No tienes órdenes</h3>
            <p className="text-gray-400 mb-6">Aún no has realizado ningún pedido</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-semibold"
            >
              Ver Menú
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
                                ⚠️ Alergias: {item.customizations.allergyWarnings.join(', ')}
                              </div>
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
                      {order.deliveryType === 'pickup' ? '🏪 Recoger' : '🍽️ Comer Aquí'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Método de pago:</span>
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
                      <span className="text-gray-300">${(order.items.reduce((sum, item) => sum + item.subtotal, 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">IVA (15%):</span>
                      <span className="text-gray-300">${(order.items.reduce((sum, item) => sum + item.subtotal, 0) * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-neutral-600">
                      <span className="text-white">Total:</span>
                      <span className="text-orange-500">${(order.items.reduce((sum, item) => sum + item.subtotal, 0) * 1.15).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
