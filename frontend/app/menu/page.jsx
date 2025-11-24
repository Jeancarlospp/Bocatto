'use client';

import { useEffect, useState } from 'react';
import { fetchMenu } from '@/lib/api';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await fetchMenu();
        setMenuItems(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900">
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-2">Nuestro Menú</h2>
          <p className="text-xl opacity-90">Descubre nuestros deliciosos platos</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          {loading && (
            <p className="text-center text-gray-400 text-xl">Cargando menú...</p>
          )}

          {error && (
            <p className="text-center text-red-500 text-xl">Error: {error}</p>
          )}

          {!loading && !error && menuItems.length === 0 && (
            <p className="text-center text-gray-400 text-xl">
              No hay productos. La base de datos está vacía.
            </p>
          )}

          {!loading && !error && menuItems.length > 0 && (
            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <div 
                  key={item._id || index} 
                  className="bg-neutral-800 p-6 rounded-lg border border-gray-700"
                >
                  <p className="text-white font-semibold text-lg mb-2">
                    <strong>Nombre:</strong> {item.name}
                  </p>
                  <p className="text-gray-400">
                    <strong>Descripción:</strong> {item.description || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
