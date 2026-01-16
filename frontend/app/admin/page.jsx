'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalReservations: 0,
    totalClients: 0,
    ordersToday: 0,
    activeReservations: 0,
    revenueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Cargando estadísticas del dashboard...');
      
      const data = await getDashboardStats();
      console.log('✅ Estadísticas cargadas:', data);
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Error al cargar estadísticas');
      }
    } catch (err) {
      console.error('❌ Error loading dashboard stats:', err);
      setError('Error al cargar estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Bienvenido al Dashboard
      </h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
          <button 
            onClick={loadStats}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Dashboard statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Productos</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? (
                  <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                ) : (
                  stats.totalProducts
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
              🍔
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Reservaciones</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? (
                  <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                ) : (
                  stats.totalReservations
                )}
              </p>
              {!loading && stats.activeReservations > 0 && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  {stats.activeReservations} activas
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              📅
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Clientes</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? (
                  <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                ) : (
                  stats.totalClients
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pedidos Hoy</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? (
                  <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                ) : (
                  stats.ordersToday
                )}
              </p>
              {!loading && stats.revenueToday > 0 && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  ${stats.revenueToday.toFixed(2)}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
              🛒
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin/products/create"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition text-left block"
          >
            <div className="text-2xl mb-2">➕</div>
            <p className="font-medium text-gray-800">Agregar Producto</p>
            <p className="text-sm text-gray-500">Crear nuevo producto</p>
          </Link>

          <Link 
            href="/admin/reservations"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition text-left block"
          >
            <div className="text-2xl mb-2">📋</div>
            <p className="font-medium text-gray-800">Ver Reservaciones</p>
            <p className="text-sm text-gray-500">Gestionar reservas</p>
          </Link>

          <Link 
            href="/admin/offers"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition text-left block"
          >
            <div className="text-2xl mb-2">🎁</div>
            <p className="font-medium text-gray-800">Crear Oferta</p>
            <p className="text-sm text-gray-500">Nueva promoción</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
