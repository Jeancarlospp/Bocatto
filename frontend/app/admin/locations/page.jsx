'use client';

import { useState, useEffect } from 'react';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

export default function LocationsManagement() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    lat: '',
    lng: '',
    description: '',
    isFlagship: false,
    openingHours: {
      monday: '09:00 - 22:00',
      tuesday: '09:00 - 22:00',
      wednesday: '09:00 - 22:00',
      thursday: '09:00 - 22:00',
      friday: '09:00 - 23:00',
      saturday: '09:00 - 23:00',
      sunday: '10:00 - 21:00'
    },
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setLocations(data.data);
      } else {
        setError('Error al cargar las ubicaciones');
      }
    } catch (err) {
      console.error('Fetch locations error:', err);
      setError('Error de conexión al cargar las ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHoursChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validate
      if (!formData.name || !formData.address || !formData.city || !formData.phone || !formData.lat || !formData.lng) {
        setError('Los campos: nombre, dirección, ciudad, teléfono y coordenadas son requeridos');
        setSubmitting(false);
        return;
      }

      // Prepare form data
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('lat', formData.lat);
      submitData.append('lng', formData.lng);
      submitData.append('description', formData.description);
      submitData.append('isFlagship', formData.isFlagship);
      submitData.append('openingHours', JSON.stringify(formData.openingHours));
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const url = editingLocation
        ? `${process.env.NEXT_PUBLIC_API_URL}/locations/${editingLocation._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/locations`;

      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        await fetchLocations();
        resetForm();
        alert(editingLocation ? 'Sucursal actualizada exitosamente' : 'Sucursal creada exitosamente');
      } else {
        setError(data.message || 'Error al guardar la sucursal');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Error de conexión al guardar la sucursal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      phone: location.phone,
      email: location.email || '',
      lat: location.coordinates.lat.toString(),
      lng: location.coordinates.lng.toString(),
      description: location.description || '',
      isFlagship: location.isFlagship,
      openingHours: location.openingHours,
      image: null
    });
    if (location.imageUrl) {
      setImagePreview(location.imageUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta sucursal? Se marcará como inactiva.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchLocations();
        alert('Sucursal eliminada exitosamente');
      } else {
        alert('Error al eliminar la sucursal');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error de conexión al eliminar la sucursal');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/${id}/toggle`, {
        method: 'PATCH',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchLocations();
        alert(data.message);
      } else {
        alert('Error al cambiar el estado');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      alert('Error de conexión');
    }
  };

  const resetForm = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      lat: '',
      lng: '',
      description: '',
      isFlagship: false,
      openingHours: {
        monday: '09:00 - 22:00',
        tuesday: '09:00 - 22:00',
        wednesday: '09:00 - 22:00',
        thursday: '09:00 - 22:00',
        friday: '09:00 - 23:00',
        saturday: '09:00 - 23:00',
        sunday: '10:00 - 21:00'
      },
      image: null
    });
    setImagePreview(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Sucursales</h2>
        <p className="text-gray-800 font-medium mt-2">
          Administra las ubicaciones de los restaurantes Bocatto
        </p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {editingLocation ? 'Editar Sucursal' : 'Agregar Nueva Sucursal'}
        </h3>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Nombre de la Sucursal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Ej: Bocatto Centro Histórico"
                required
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Ej: Quito"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Ej: Av. Amazonas N24-155 y Colón"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Ej: +593 2 123 4567"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Ej: centro@bocatto.com"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Latitud <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="lat"
                value={formData.lat}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Ej: -0.1807"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Longitud <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="lng"
                value={formData.lng}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Ej: -78.4678"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Describe esta ubicación..."
              maxLength="500"
            />
          </div>

          {/* Opening Hours */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Horarios de Atención
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DAYS_OF_WEEK.map(day => (
                <div key={day.key} className="flex items-center gap-2">
                  <label className="w-24 text-sm text-gray-900 font-medium">{day.label}:</label>
                  <input
                    type="text"
                    value={formData.openingHours[day.key]}
                    onChange={(e) => handleHoursChange(day.key, e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="09:00 - 22:00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Flagship checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFlagship"
              name="isFlagship"
              checked={formData.isFlagship}
              onChange={handleInputChange}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="isFlagship" className="text-sm font-bold text-gray-900">
              Marcar como sucursal principal (Flagship)
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Imagen de la Sucursal
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
            />
            <p className="text-xs text-gray-800 font-medium mt-1">
              Formatos: JPEG, PNG, WEBP. Máx: 5MB
            </p>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Guardando...' : (editingLocation ? 'Actualizar Sucursal' : 'Agregar Sucursal')}
            </button>
            {editingLocation && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Locations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Sucursales Registradas ({locations.length})
        </h3>

        {locations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay sucursales registradas aún. Agrega la primera sucursal arriba.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <div
                key={location._id}
                className={`border rounded-lg overflow-hidden transition-all hover:shadow-md ${
                  !location.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Location Image */}
                {location.imageUrl && (
                  <img
                    src={location.imageUrl}
                    alt={location.name}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4">
                  {/* Location Name */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      {location.name}
                      {location.isFlagship && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      location.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {location.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  {/* Location Details */}
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <p>📍 {location.address}</p>
                    <p>🏙️ {location.city}</p>
                    <p>📞 {location.phone}</p>
                    {location.email && <p>✉️ {location.email}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(location)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(location._id)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                        location.isActive
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {location.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(location._id)}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
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
