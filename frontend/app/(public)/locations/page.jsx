'use client';

import { useState, useEffect } from 'react';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations?activeOnly=true`);
      const data = await response.json();

      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique cities
  const cities = ['all', ...new Set(locations.map(loc => loc.city))];

  // Filter locations by selected city
  const filteredLocations = selectedCity === 'all' 
    ? locations 
    : locations.filter(loc => loc.city === selectedCity);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Nuestras Ubicaciones</h1>
          <p className="text-gray-400 text-lg">
            Encuentra el restaurante Bocatto más cercano a ti
          </p>
        </div>

        {/* City Filter */}
        {cities.length > 1 && (
          <div className="flex justify-center mb-8 gap-3 flex-wrap">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCity === city
                    ? 'bg-orange-600 text-white'
                    : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                }`}
              >
                {city === 'all' ? 'Todas las ciudades' : city}
              </button>
            ))}
          </div>
        )}

        {/* Locations Grid */}
        {filteredLocations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">
              No hay ubicaciones disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLocations.map((location) => (
              <div
                key={location._id}
                className="bg-neutral-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {/* Location Image */}
                {location.imageUrl ? (
                  <img
                    src={location.imageUrl}
                    alt={location.name}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-neutral-700 flex items-center justify-center">
                    <span className="text-6xl">🏪</span>
                  </div>
                )}

                <div className="p-6">
                  {/* Location Name */}
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-2xl font-bold text-white">
                      {location.name}
                    </h3>
                    {location.isFlagship && (
                      <span className="bg-yellow-500 text-neutral-900 text-xs px-2 py-1 rounded-full font-bold">
                        Principal
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {location.description && (
                    <p className="text-gray-400 text-sm mb-4">
                      {location.description}
                    </p>
                  )}

                  {/* Location Details */}
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500">📍</span>
                      <div>
                        <p className="font-medium">{location.address}</p>
                        <p className="text-sm text-gray-400">{location.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">📞</span>
                      <a 
                        href={`tel:${location.phone}`}
                        className="hover:text-orange-500 transition-colors"
                      >
                        {location.phone}
                      </a>
                    </div>

                    {location.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-orange-500">✉️</span>
                        <a 
                          href={`mailto:${location.email}`}
                          className="hover:text-orange-500 transition-colors"
                        >
                          {location.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Opening Hours */}
                  <div className="mt-4 pt-4 border-t border-neutral-700">
                    <p className="text-sm font-semibold text-orange-500 mb-2">Horarios:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                      <div>
                        <p><span className="font-medium">Lun-Jue:</span> {location.openingHours.monday}</p>
                        <p><span className="font-medium">Vie-Sáb:</span> {location.openingHours.friday}</p>
                        <p><span className="font-medium">Domingo:</span> {location.openingHours.sunday}</p>
                      </div>
                    </div>
                  </div>

                  {/* View on Map Button */}
                  <a
                    href={`https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                  >
                    Ver en Google Maps 🗺️
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

