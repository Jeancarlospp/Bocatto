'use client';

import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/api';

const STATUS_CONFIG = {
  pending:    { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-800', next: 'confirmed' },
  confirmed:  { label: 'Confirmado',  color: 'bg-blue-100 text-blue-800',     next: 'preparing' },
  preparing:  { label: 'Preparando',  color: 'bg-purple-100 text-purple-800', next: 'ready' },
  ready:      { label: 'Listo',       color: 'bg-green-100 text-green-800',   next: 'delivered' },
  delivered:  { label: 'Entregado',   color: 'bg-gray-100 text-gray-800',     next: null },
  cancelled:  { label: 'Cancelado',   color: 'bg-red-100 text-red-800',       next: null }
};

const DELIVERY_LABELS = {
  'pickup': 'Para llevar',
  'dine-in': 'En local'
};

const PAYMENT_LABELS = {
  'cash': 'Efectivo',
  'card': 'Tarjeta',
  'transfer': 'Transferencia'
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [filterStatus, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: 20 };
      if (filterStatus) params.status = filterStatus;

      const data = await getAllOrders(params);

      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      setError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
    if (!confirm(`¿Cambiar estado a "${statusLabel}"?`)) return;

    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Error al actualizar el estado');
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta orden?')) return;

    try {
      await updateOrderStatus(orderId, 'cancelled');
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Error al cancelar la orden');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Pedidos</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setFilterStatus(''); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === '' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => { setFilterStatus(key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === key ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Lista de Pedidos</h3>
          <button
            onClick={loadOrders}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No hay pedidos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const isExpanded = expandedOrder === order._id;

                  return (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(order._id)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">{order.items?.length || 0} producto(s)</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-gray-900">{DELIVERY_LABELS[order.deliveryType] || order.deliveryType}</div>
                          <div className="text-xs text-gray-500">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.totalPrice?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {status.next && (
                              <button
                                onClick={() => handleStatusChange(order._id, status.next)}
                                className="bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-700 transition"
                              >
                                {STATUS_CONFIG[status.next]?.label}
                              </button>
                            )}
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button
                                onClick={() => handleCancel(order._id)}
                                className="text-red-600 hover:text-red-800 text-xs px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <tr key={`${order._id}-detail`}>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Items */}
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Productos:</h4>
                                <ul className="space-y-1">
                                  {order.items?.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-700">
                                      {item.quantity}x {item.productName || item.name || 'Producto'} - ${item.price?.toFixed(2)}
                                      {item.customizations && item.customizations.length > 0 && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          ({item.customizations.map(c => c.name || c).join(', ')})
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Order Info */}
                              <div className="space-y-1 text-sm">
                                <div><span className="font-bold text-gray-900">Subtotal:</span> <span className="text-gray-700">${order.subtotal?.toFixed(2)}</span></div>
                                <div><span className="font-bold text-gray-900">IVA:</span> <span className="text-gray-700">${order.ivaAmount?.toFixed(2)}</span></div>
                                {order.couponCode && (
                                  <div><span className="font-bold text-gray-900">Cupón:</span> <span className="text-green-600">{order.couponCode} (-${order.couponDiscount?.toFixed(2)})</span></div>
                                )}
                                <div><span className="font-bold text-gray-900">Total:</span> <span className="text-gray-700 font-bold">${order.totalPrice?.toFixed(2)}</span></div>
                                {order.customerNotes && (
                                  <div><span className="font-bold text-gray-900">Nota del cliente:</span> <span className="text-gray-700">{order.customerNotes}</span></div>
                                )}
                                {order.staffNotes && (
                                  <div><span className="font-bold text-gray-900">Nota del staff:</span> <span className="text-gray-700">{order.staffNotes}</span></div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
