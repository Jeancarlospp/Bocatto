'use client';

import { useState, useEffect } from 'react';

const EMOJI_OPTIONS = ['🍽️', '🍔', '🍕', '🍝', '🥗', '🥬', '🍖', '🍰', '🥤', '🍟', '🌮', '🍣', '🍜', '🥪', '☕', '🍺', '🍷', '🧁', '🍩', '🥐'];

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🍽️',
    displayOrder: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        setError('Error al cargar las categorías');
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError('Error de conexión al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmojiSelect = (emoji) => {
    setFormData(prev => ({
      ...prev,
      icon: emoji
    }));
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        setError('El nombre de la categoría es requerido');
        setSubmitting(false);
        return;
      }

      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          icon: formData.icon,
          displayOrder: parseInt(formData.displayOrder) || 0
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        resetForm();
        setSuccess(editingCategory ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al guardar la categoría');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Error de conexión al guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '🍽️',
      displayOrder: category.displayOrder || 0
    });
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name, productCount) => {
    if (productCount > 0) {
      alert(`No se puede eliminar la categoría "${name}" porque tiene ${productCount} productos asociados.\n\nPrimero mueve o elimina los productos de esta categoría.`);
      return;
    }

    if (!confirm(`¿Está seguro de eliminar la categoría "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        setSuccess('Categoría eliminada exitosamente');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al eliminar la categoría');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error de conexión al eliminar la categoría');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}/toggle`, {
        method: 'PATCH',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        setSuccess(data.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Error al cambiar el estado');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      setError('Error de conexión');
    }
  };

  const handleSeedCategories = async () => {
    if (!confirm('¿Deseas crear las categorías predeterminadas?\n\nEsto solo funcionará si no hay categorías existentes.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/seed`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        setSuccess(data.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al crear categorías');
      }
    } catch (err) {
      console.error('Seed error:', err);
      setError('Error de conexión');
    }
  };

  const handleResetCategories = async () => {
    if (!confirm('⚠️ ADVERTENCIA: Esto eliminará TODAS las categorías existentes y creará las predeterminadas.\n\n¿Estás seguro de continuar?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/reset`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        setSuccess(data.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al resetear categorías');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('Error de conexión');
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '🍽️',
      displayOrder: 0
    });
    setError('');
    setShowEmojiPicker(false);
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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestión de Categorías</h2>
          <p className="text-gray-800 font-medium mt-2">
            Administra las categorías del menú del restaurante
          </p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <button
              onClick={handleSeedCategories}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              🌱 Crear Categorías Predeterminadas
            </button>
          )}
          {categories.length > 0 && categories.length < 8 && (
            <button
              onClick={handleResetCategories}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              🔄 Resetear Categorías
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Icon Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Icono
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center gap-2 hover:bg-gray-50"
                >
                  <span className="text-2xl">{formData.icon}</span>
                  <span className="text-gray-500">Click para cambiar</span>
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 grid grid-cols-5 gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-2xl p-2 hover:bg-gray-100 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Orden de visualización
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="0"
              />
              <p className="text-xs text-gray-800 font-medium mt-1">Menor número = aparece primero</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Nombre de la Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Ej: Platos Fuertes"
              required
              maxLength="50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Descripción
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Descripción breve de la categoría"
              maxLength="200"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Guardando...' : (editingCategory ? 'Actualizar Categoría' : 'Agregar Categoría')}
            </button>
            {editingCategory && (
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

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Categorías Registradas ({categories.length})
        </h3>

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-6xl mb-4">📂</p>
            <p className="text-gray-500">
              No hay categorías registradas aún.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Crea tu primera categoría arriba o usa el botón para crear las categorías predeterminadas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Productos</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr 
                    key={category._id} 
                    className={`hover:bg-gray-50 ${!category.isActive ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {category.displayOrder}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-medium text-gray-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.productCount > 0 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.productCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(category._id)}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            category.isActive
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {category.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(category._id, category.name, category.productCount)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          disabled={category.productCount > 0}
                          title={category.productCount > 0 ? 'No se puede eliminar: tiene productos asociados' : 'Eliminar categoría'}
                        >
                          Eliminar
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
