'use client';

import { useState, useEffect } from 'react';

export default function OffersManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [{ name: '', quantity: 1 }],
    originalPrice: '',
    offerPrice: '',
    validDays: [],
    startDate: '',
    endDate: '',
    badge: { text: 'Oferta', color: 'red', icon: '🔥' },
    featured: false,
    active: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const dayOptions = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const colorOptions = [{ value: 'red', label: 'Rojo' }, { value: 'blue', label: 'Azul' }, { value: 'green', label: 'Verde' }, { value: 'orange', label: 'Naranja' }, { value: 'purple', label: 'Morado' }];
  const iconOptions = ['🔥', '⭐', '💥', '🎁', '💯', '🎉'];

  // Fetch offers on mount
  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setOffers(data.data);
      } else {
        setError('Error al cargar las ofertas');
      }
    } catch (err) {
      console.error('Fetch offers error:', err);
      setError('Error de conexión al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('badge.')) {
      const badgeProperty = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        badge: {
          ...prev.badge,
          [badgeProperty]: value
        }
      }));
    } else if (type === 'checkbox') {
      if (name === 'validDays') {
        setFormData(prev => ({
          ...prev,
          validDays: checked 
            ? [...prev.validDays, value]
            : prev.validDays.filter(day => day !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' ? Number(value) : value
    };
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      items: [{ name: '', quantity: 1 }],
      originalPrice: '',
      offerPrice: '',
      validDays: [],
      startDate: '',
      endDate: '',
      badge: { text: 'Oferta', color: 'red', icon: '🔥' },
      featured: false,
      active: true,
      image: null
    });
    setImagePreview(null);
    setEditingOffer(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('items', JSON.stringify(formData.items));
      submitData.append('originalPrice', formData.originalPrice);
      submitData.append('offerPrice', formData.offerPrice);
      submitData.append('validDays', JSON.stringify(formData.validDays));
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('badge', JSON.stringify(formData.badge));
      submitData.append('featured', formData.featured);
      submitData.append('active', formData.active);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const url = editingOffer 
        ? `${process.env.NEXT_PUBLIC_API_URL}/offers/${editingOffer._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/offers`;
      
      const method = editingOffer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        await fetchOffers();
        resetForm();
      } else {
        setError(data.message || 'Error al guardar la oferta');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Error de conexión al guardar la oferta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      items: offer.items,
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      validDays: offer.validDays,
      startDate: offer.startDate ? offer.startDate.split('T')[0] : '',
      endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
      badge: offer.badge,
      featured: offer.featured,
      active: offer.active,
      image: null
    });
    if (offer.imageUrl) {
      setImagePreview(offer.imageUrl);
    }
  };

  const handleDelete = async (offerId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/${offerId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchOffers();
      } else {
        setError(data.message || 'Error al eliminar la oferta');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error de conexión al eliminar la oferta');
    }
  };

  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice);
    const offer = parseFloat(formData.offerPrice);
    if (original && offer && original > offer) {
      return Math.round(((original - offer) / original) * 100);
    }
    return 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getBadgeClass = (color) => {
    const classes = {
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    return classes[color] || classes.red;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Ofertas</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {editingOffer ? 'Editar Oferta' : 'Nueva Oferta'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Oferta *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                placeholder="Ej: Combo Lunes Familiar"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de la Oferta
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {formData.image ? formData.image.name : 'Haz clic para seleccionar una imagen'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, WEBP hasta 5MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Describe los productos incluidos en la oferta..."
            />
          </div>

          {/* Items in Combo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Productos del Combo *
            </label>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Cant."
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Nombre del producto"
                  required
                />
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    ➖
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition"
            >
              ➕ Agregar Producto
            </button>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Original *
              </label>
              <input
                type="number"
                step="0.01"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Oferta *
              </label>
              <input
                type="number"
                step="0.01"
                name="offerPrice"
                value={formData.offerPrice}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">
                {calculateDiscount()}%
              </div>
            </div>
          </div>

          {/* Valid Days */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Días Válidos *
            </label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map(day => (
                <label key={day} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="validDays"
                    value={day}
                    checked={formData.validDays.includes(day)}
                    onChange={handleInputChange}
                  />
                  <span className="capitalize text-gray-900">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>



          {/* Badge Customization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Texto del Badge
              </label>
              <input
                type="text"
                name="badge.text"
                value={formData.badge.text}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                placeholder="Ej: ¡Oferta!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Color del Badge
              </label>
              <select
                name="badge.color"
                value={formData.badge.color}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900"
              >
                {colorOptions.map(color => (
                  <option key={color.value} value={color.value} className="text-gray-900">
                    {color.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Icono
              </label>
              <select
                name="badge.icon"
                value={formData.badge.icon}
                onChange={handleInputChange}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon} className="text-gray-900">
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-900">Destacada</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-900">Activa</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : editingOffer ? 'Actualizar Oferta' : 'Crear Oferta'}
            </button>
            
            {editingOffer && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Offers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Lista de Ofertas</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Cargando ofertas...
          </div>
        ) : offers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay ofertas registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oferta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vigencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {offer.imageUrl ? (
                        <img
                          src={offer.imageUrl}
                          alt={offer.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          🎁
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {offer.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getBadgeClass(offer.badge.color)}`}>
                            {offer.badge.icon} {offer.badge.text}
                          </span>
                          {offer.featured && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              ⭐ Destacada
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {offer.items.length} producto{offer.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-400">
                          Válido: {offer.validDays.join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-500 line-through">
                          ${offer.originalPrice}
                        </div>
                        <div className="text-green-600 font-medium">
                          ${offer.offerPrice}
                        </div>
                        <div className="text-xs text-gray-400">
                          -{offer.discount}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(offer.startDate)}</div>
                      <div>{formatDate(offer.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        offer.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.active ? '🟢 Activa' : '🔴 Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="text-blue-600 hover:text-blue-900 transition"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="text-red-600 hover:text-red-900 transition"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}