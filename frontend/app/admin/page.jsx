'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Bienvenido al Dashboard
      </h2>

      {/* Dashboard statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Productos</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">--</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
              🍔
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Reservaciones</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">--</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              📅
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clientes</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">--</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pedidos Hoy</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">--</p>
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
