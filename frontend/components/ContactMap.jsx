'use client';

/**
 * Contact Map Component
 * Displays embedded Google Maps with restaurant location
 * Follows Single Responsibility Principle - only handles map display
 */
export default function ContactMap() {
  const mapConfig = getMapConfiguration();

  return (
    <div className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Nuestra Ubicación
        </h2>
        <p className="text-neutral-400 mb-4">
          Visítanos en nuestra ubicación principal
        </p>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[400px] bg-neutral-900">
        <iframe
          src={mapConfig.embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Bocatto Restaurant Location"
          className="w-full h-full"
        ></iframe>

        {/* Overlay with direct link */}
        <div className="absolute bottom-4 right-4">
          <a
            href={mapConfig.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
          >
            <span>📍</span>
            <span className="font-medium">Ver en Google Maps</span>
          </a>
        </div>
      </div>

      {/* Additional Location Info */}
      <div className="p-6 bg-neutral-900/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚗</span>
          <div>
            <h3 className="text-white font-semibold mb-1">Cómo Llegar</h3>
            <p className="text-neutral-400 text-sm">
              Estacionamiento disponible. Acceso directo desde la Av. Principal. 
              También puedes llegar en transporte público con las líneas 12, 45 y 78.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get map configuration
 * Centralized configuration following Single Responsibility
 * 
 * To update coordinates:
 * 1. Find your location on Google Maps
 * 2. Right-click and select "What's here?"
 * 3. Copy the coordinates
 * 4. Update latitude and longitude below
 */
function getMapConfiguration() {
  // Restaurant coordinates - Av. La Prensa N45-120, Quito
  const latitude = -0.1142;  // Av. La Prensa area coordinates
  const longitude = -78.4834;

  // Google Maps embed URL
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7997!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMTAnNTAuNSJTIDc4wrAyOCcwNC4xIlc!5e0!3m2!1ses!2sec!4v1234567890`;

  // Direct link to Google Maps directions
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return {
    latitude,
    longitude,
    embedUrl,
    directionsUrl
  };
}
