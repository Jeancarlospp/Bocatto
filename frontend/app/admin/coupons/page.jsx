'use client';

import { useState, useEffect } from 'react';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon } from '@/lib/api';

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showList, setShowList] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    usagePerUser: '1',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllCoupons();

      if (data.success) {
        setCoupons(data.data);
      } else {
        setError('Error al cargar los cupones');
      }
    } catch (err) {
      console.error('Fetch coupons error:', err);
      setError('Error de conexión al cargar los cupones');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      usagePerUser: '1',
      isActive: true
    });
    setEditingCoupon(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        usagePerUser: Number(formData.usagePerUser) || 1,
        isActive: formData.isActive
      };

      let data;

      if (editingCoupon) {
        data = await updateCoupon(editingCoupon._id, submitData);
      } else {
        data = await createCoupon(submitData);
      }

      if (data.success) {
        await loadCoupons();
        resetForm();
      } else {
        setError(data.message || 'Error al guardar el cupón');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Error de conexión al guardar el cupón');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase ? coupon.minPurchase.toString() : '',
      maxDiscount: coupon.maxDiscount ? coupon.maxDiscount.toString() : '',
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      usagePerUser: coupon.usagePerUser ? coupon.usagePerUser.toString() : '1',
      isActive: coupon.isActive
    });
    setShowList(false);
  };

  const handleDelete = async (couponId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cupón?')) {
      return;
    }

    try {
      const data = await deleteCoupon(couponId);

      if (data.success) {
        await loadCoupons();
      } else {
        setError(data.message || 'Error al eliminar el cupón');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error de conexión al eliminar el cupón');
    }
  };

  const handleToggle = async (couponId) => {
    try {
      const data = await toggleCoupon(couponId);

      if (data.success) {
        await loadCoupons();
      } else {
        setError(data.message || 'Error al cambiar el estado del cupón');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      setError('Error de conexión al cambiar el estado');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);

    if (!coupon.isActive) {
      return { text: 'Inactivo', color: 'bg-gray-100 text-gray-800' };
    }
    if (now < start) {
      return { text: 'Programado', color: 'bg-blue-100 text-blue-800' };
    }
    if (now > end) {
      return { text: 'Expirado', color: 'bg-red-100 text-red-800' };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { text: 'Agotado', color: 'bg-orange-100 text-orange-800' };
    }
    return { text: 'Activo', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Cupones</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Código del Cupón *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                maxLength={20}
                pattern="[A-Za-z0-9]+"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 uppercase"
                placeholder="Ej: DESCUENTO20"
              />
              <p className="text-xs text-gray-500 mt-1">Solo letras y números, máx. 20 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Descripción *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                placeholder="Ej: 20% de descuento en tu pedido"
              />
            </div>
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Tipo de Descuento *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Valor del Descuento *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                required
                min="0"
                max={formData.discountType === 'percentage' ? '100' : undefined}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                placeholder={formData.discountType === 'percentage' ? 'Ej: 20' : 'Ej: 5.00'}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Descuento Máximo
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                placeholder="Opcional"
              />
              <p className="text-xs text-gray-500 mt-1">Tope máximo de descuento en $</p>
            </div>
          </div>

          {/* Min Purchase and Usage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Compra Mínima
              </label>
              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Límite de Usos Totales
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                placeholder="Sin límite"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Usos por Usuario *
              </label>
              <input
                type="number"
                name="usagePerUser"
                value={formData.usagePerUser}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                placeholder="1"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Fecha de Fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-gray-900">Cupón Activo</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : editingCoupon ? 'Actualizar Cupón' : 'Crear Cupón'}
            </button>

            {editingCoupon && (
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

      {/* Toggle List Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowList(!showList)}
          className="flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition"
        >
          <span>{showList ? 'Ocultar Lista' : 'Ver Lista de Cupones'}</span>
          <span className="bg-orange-600 text-white text-sm px-2 py-0.5 rounded-full">
            {coupons.length}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showList ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Coupons List */}
      {showList && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Lista de Cupones</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Cargando cupones...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay cupones registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descuento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requisitos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vigencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uso
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
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <tr key={coupon._id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-gray-900 font-mono">
                              {coupon.code}
                            </div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {coupon.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-green-600 font-bold">
                              {coupon.discountType === 'percentage'
                                ? `${coupon.discountValue}%`
                                : `$${coupon.discountValue.toFixed(2)}`}
                            </div>
                            {coupon.maxDiscount && (
                              <div className="text-xs text-gray-500">
                                Máx: ${coupon.maxDiscount.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.minPurchase > 0 ? (
                            <div>Min: ${coupon.minPurchase.toFixed(2)}</div>
                          ) : (
                            <div className="text-gray-400">Sin mínimo</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{formatDate(coupon.startDate)}</div>
                          <div>{formatDate(coupon.endDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-gray-900">
                            {coupon.usageCount} / {coupon.usageLimit || '∞'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {coupon.usagePerUser} por usuario
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggle(coupon._id)}
                              className={`transition ${coupon.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                              title={coupon.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {coupon.isActive ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => handleEdit(coupon)}
                              className="text-blue-600 hover:text-blue-900 transition"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(coupon._id)}
                              className="text-red-600 hover:text-red-900 transition"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
