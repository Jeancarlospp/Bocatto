'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    currentStock: '0',
    available: true,
    ingredients: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    'Entradas y Snacks',
    'Platos Fuertes',
    'Postres',
    'Bebidas',
    'Ensaladas',
    'Hamburguesas',
    'Pizzas',
    'Pastas'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten imágenes (JPEG, PNG, WEBP)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar 5MB');
        return;
      }

      setImageFile(file);
      setError('');

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
    setLoading(true);
    setError('');

    // Validations
    if (!formData.name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      setLoading(false);
      return;
    }

    if (!imageFile) {
      setError('Product image is required');
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('image', imageFile);
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory.trim());
      formDataToSend.append('currentStock', parseInt(formData.currentStock) || 0);
      formDataToSend.append('available', formData.available);
      
      // Process ingredients
      if (formData.ingredients.trim()) {
        formDataToSend.append('ingredients', formData.ingredients.trim());
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
        // Don't set Content-Type header - browser will set it automatically with boundary
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error creating product');
      }

      // Success - redirect to products list
      router.push('/admin/products');
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Error creating product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Crear Nuevo Producto</h2>
        <p className="text-gray-600 mt-2">Complete el formulario para agregar un producto al menú</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: Alitas BBQ Clásicas"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Descripción detallada del producto"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Precio ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Disponible
            </label>
            <input
              type="number"
              id="currentStock"
              name="currentStock"
              value={formData.currentStock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
              Subcategoría
            </label>
            <input
              type="text"
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: Alitas, Nachos, etc."
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Producto <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : 'Haz clic para seleccionar una imagen'}
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
                  required
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

          {/* Ingredients */}
          <div className="md:col-span-2">
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
              Ingredientes
            </label>
            <input
              type="text"
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Separados por comas: pollo, salsa BBQ, especias"
            />
            <p className="text-sm text-gray-500 mt-1">Ingrese los ingredientes separados por comas</p>
          </div>

          {/* Available */}
          <div className="md:col-span-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Producto disponible para venta
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creando...' : 'Crear Producto'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
