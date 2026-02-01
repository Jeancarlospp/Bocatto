'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchProductById, updateProduct } from '@/lib/api';
import IngredientManager from '@/components/IngredientManager';

// Categorías de fallback por si la API falla
const FALLBACK_CATEGORIES = [
  'Entradas y Snacks',
  'Platos Fuertes',
  'Postres',
  'Bebidas',
  'Ensaladas',
  'Hamburguesas',
  'Pizzas',
  'Pastas'
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    currentStock: '0',
    available: true,
    ingredients: []
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState('');

  // Cargar categorías desde la API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?activeOnly=true`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          setCategories(data.data.map(cat => cat.name));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Mantiene las categorías de fallback
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Loading product with ID:', productId);
        const response = await fetchProductById(productId);
        
        console.log('Product data received:', response);
        
        if (response.success && response.data) {
          const product = response.data;
          
          // Parse ingredients correctly
          let parsedIngredients = [];
          if (Array.isArray(product.ingredients)) {
            // Check if items are already objects with name/customizable
            if (product.ingredients.length > 0 && typeof product.ingredients[0] === 'object' && product.ingredients[0].name) {
              parsedIngredients = product.ingredients;
            } else {
              // Convert string array to object array
              parsedIngredients = product.ingredients.map(ing => ({
                name: typeof ing === 'string' ? ing : String(ing),
                customizable: false
              }));
            }
          } else if (typeof product.ingredients === 'string' && product.ingredients.trim()) {
            // Legacy format: comma-separated string
            parsedIngredients = product.ingredients
              .split(',')
              .map(i => i.trim())
              .filter(i => i)
              .map(name => ({ name, customizable: false }));
          }
          
          // Set form data with product information
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            currentStock: product.currentStock?.toString() || '0',
            available: product.available !== undefined ? product.available : true,
            ingredients: parsedIngredients
          });
          
          // Set current image URL
          if (product.img) {
            setCurrentImage(product.img);
          }
          
          console.log('Product loaded successfully');
        } else {
          throw new Error('No se recibieron datos del producto');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Error al cargar el producto. Verifica que el producto existe.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProductData();
    }
  }, [productId]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    setSuccess(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten imágenes (JPEG, PNG, WEBP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar 5MB');
        return;
      }

      setImageFile(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    // Validations
    if (!formData.name.trim()) {
      setError('Product name is required');
      setSubmitting(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      setSubmitting(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      setSubmitting(false);
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      setSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add image only if new one was selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory.trim());
      formDataToSend.append('currentStock', parseInt(formData.currentStock) || 0);
      formDataToSend.append('available', formData.available);
      
      // Send ingredients as JSON
      if (formData.ingredients && formData.ingredients.length > 0) {
        formDataToSend.append('ingredients', JSON.stringify(formData.ingredients));
      }

      const response = await updateProduct(productId, formDataToSend);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Error al actualizar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando información del producto...</p>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="max-w-4xl mx-auto py-20">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">{error}</h3>
          <p className="text-red-600 mb-4">No se pudo cargar el producto con ID: {productId}</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Editar Producto</h2>
        <p className="text-gray-800 font-medium mt-2">Actualiza la información del producto</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Producto actualizado correctamente. Redirigiendo...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
              Nombre del Producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Ej: Alitas BBQ Clásicas"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Descripción detallada del producto"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-bold text-gray-900 mb-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="0.00"
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="currentStock" className="block text-sm font-bold text-gray-900 mb-2">
              Stock Disponible
            </label>
            <input
              type="number"
              id="currentStock"
              name="currentStock"
              value={formData.currentStock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="0"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
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
            <label htmlFor="subcategory" className="block text-sm font-bold text-gray-900 mb-2">
              Subcategoría
            </label>
            <input
              type="text"
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Ej: Alitas, Nachos, etc."
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label htmlFor="image" className="block text-sm font-bold text-gray-900 mb-2">
              Imagen del Producto {imageFile ? '' : '(Actual se mantiene si no subes una nueva)'}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-sm text-gray-900 font-medium">
                      {imageFile ? imageFile.name : 'Haz clic para cambiar la imagen'}
                    </p>
                    <p className="text-xs text-gray-800 font-medium mt-1">
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
              <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview || currentImage || '/placeholder.png'}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Ingredientes del Producto
            </label>
            <IngredientManager
              ingredients={formData.ingredients}
              onChange={(updated) => setFormData(prev => ({ ...prev, ingredients: updated }))}
            />
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
              <span className="ml-2 text-sm font-bold text-gray-900">
                Producto disponible para venta
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting || success}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Actualizando...' : success ? 'Actualizado ✓' : 'Actualizar Producto'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
