'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ onLogout }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  // Menu items configuration
  const menuItems = [
    {
      section: 'Dashboard',
      items: [
        { label: 'Panel Principal', href: '/admin'}
      ]
    },
    {
      section: 'Productos',
      items: [
        { label: 'Ver Productos', href: '/admin/products'},
        { label: 'Categorías', href: '/admin/categories'}
      ]
    },
    {
      section: 'Reservaciones',
      items: [
        { label: 'Ver Reservaciones', href: '/admin/reservations'},
        { label: 'Ambientes', href: '/admin/areas'}
      ]
    },
    {
      section: 'Clientes',
      items: [
        { label: 'Lista de Clientes', href: '/admin/clients'},
        { label: 'Resenas', href: '/admin/reviews' }
      ]
    },
    {
      section: 'Pedidos',
      items: [
        { label: 'Ver Pedidos', href: '/admin/orders' },
        { label: 'Carritos', href: '/admin/carts'}
      ]
    },
    {
      section: 'Marketing',
      items: [
        { label: 'Ofertas', href: '/admin/offers'},
        { label: 'Notificaciones', href: '/admin/notifications' }
      ]
    },
    {
      section: 'Restaurante',
      items: [
        { label: 'Sucursales', href: '/admin/locations'}
      ]
    },
    {
      section: 'Administración',
      items: [
        { label: 'Usuarios Admin', href: '/admin/admins'},
        { label: 'Reportes', href: '/admin/reports' }
      ]
    }
  ];

  return (
    <aside
      className={`bg-neutral-900 text-white h-screen sticky top-0 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Sidebar header */}
      <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
        {isExpanded && (
          <Link href="/admin" className="text-orange-500 text-xl font-bold">
            Bocatto Admin
          </Link>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white hover:text-orange-500 transition"
          title={isExpanded ? 'Contraer menú' : 'Expandir menú'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isExpanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="overflow-y-auto h-[calc(100vh-180px)] py-4">
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {isExpanded && (
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.section}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                        isActive
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                      title={!isExpanded ? item.label : ''}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {isExpanded && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout button */}
      <div className="absolute bottom-0 w-full p-4 border-t border-neutral-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          title={!isExpanded ? 'Cerrar sesión' : ''}
        >
          <span className="text-xl">🚪</span>
          {isExpanded && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
