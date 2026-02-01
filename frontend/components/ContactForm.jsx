'use client';

import { useState } from 'react';

/**
 * Contact Form Component
 * Handles user contact message submission
 * Applies Single Responsibility Principle - only manages form state and submission
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback when form submits successfully
 * @param {Function} props.onError - Callback when form submission fails
 */
export default function ContactForm({ onSuccess, onError }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Handle input changes
   * Updates form state and clears field-specific errors
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * Validate form data
   * Returns true if valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.company.trim().length > 100) {
      newErrors.company = 'El nombre de la compañía no puede exceder 100 caracteres';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'El mensaje no puede exceder 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Validates, submits, and resets form on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API endpoint in Part 2
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success - reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          message: ''
        });
        onSuccess?.();
      } else {
        throw new Error(data.message || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      onError?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        Envíanos un Mensaje
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <FormField
          label="Nombre Completo"
          required
          error={errors.name}
        >
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={getInputClassName(errors.name)}
            placeholder="Tu nombre completo"
            disabled={isSubmitting}
          />
        </FormField>

        {/* Email Field */}
        <FormField
          label="Correo Electrónico"
          required
          error={errors.email}
        >
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={getInputClassName(errors.email)}
            placeholder="tu@email.com"
            disabled={isSubmitting}
          />
        </FormField>

        {/* Company Field */}
        <FormField
          label="Compañía"
          error={errors.company}
        >
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={getInputClassName(errors.company)}
            placeholder="Nombre de tu compañía (opcional)"
            disabled={isSubmitting}
          />
        </FormField>

        {/* Message Field */}
        <FormField
          label="Mensaje"
          required
          error={errors.message}
        >
          <textarea
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className={getInputClassName(errors.message)}
            placeholder="Escribe tu mensaje aquí..."
            rows={6}
            disabled={isSubmitting}
          />
          <div className="text-sm text-neutral-400 mt-1">
            {formData.message.length} / 1000 caracteres
          </div>
        </FormField>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </span>
          ) : (
            'Enviar Mensaje'
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * Form Field Component
 * Reusable form field with label and error display
 */
function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-2">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Get input class name based on error state
 * Applies Clean Code principle - DRY (Don't Repeat Yourself)
 */
function getInputClassName(hasError) {
  const baseClasses = "w-full px-4 py-3 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
  const errorClasses = hasError 
    ? "border-red-500 focus:ring-red-500" 
    : "border-neutral-600 focus:ring-orange-500 focus:border-transparent";
  
  return `${baseClasses} ${errorClasses}`;
}
