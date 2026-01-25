'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const router = useRouter();
  const { login, register, loginWithGoogle, googleAuthStatus, clearGoogleAuthStatus } = useAuth();
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'client'
  const [clientView, setClientView] = useState('login'); // 'login' or 'register' for client tab
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle Google OAuth status from URL redirect
  useEffect(() => {
    if (googleAuthStatus === 'success') {
      clearGoogleAuthStatus();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else if (googleAuthStatus && googleAuthStatus !== 'success') {
      // Handle Google auth errors
      const errorMessages = {
        'google_auth_failed': 'Error al iniciar sesión con Google. Intenta nuevamente.',
        'account_inactive': 'Tu cuenta está inactiva. Contacta con soporte.',
        'google_auth_error': 'Error durante la autenticación. Intenta nuevamente.'
      };
      setError(errorMessages[googleAuthStatus] || 'Error desconocido con Google OAuth.');
      clearGoogleAuthStatus();
    }
  }, [googleAuthStatus, clearGoogleAuthStatus, onLoginSuccess]);

  // Close modal and reset form
  const handleClose = () => {
    setFormData({ 
      email: '', 
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: ''
    });
    setError('');
    setClientView('login');
    onClose();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };

  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login successful
        handleClose();
        router.push('/admin'); // Redirect to admin dashboard
      } else {
        // Login failed
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle client login
  const handleClientLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        handleClose();
        // Trigger parent component callback if provided
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Client login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle client registration
  const handleClientRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Todos los campos obligatorios deben ser completados');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        address: formData.address || undefined
      });
      
      if (result.success) {
        handleClose();
        // Trigger parent component callback if provided
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Client registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError('');
    // Redirect to backend OAuth endpoint
    loginWithGoogle();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Iniciar Sesión</h2>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => {
              setActiveTab('admin');
              setError('');
            }}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              activeTab === 'admin'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Administrador
          </button>
          <button
            onClick={() => {
              setActiveTab('client');
              setError('');
            }}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              activeTab === 'client'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cliente
          </button>
        </div>

        {/* Admin login form */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="admin@bocatto.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar como Admin'}
            </button>
          </form>
        )}

        {/* Client tab content */}
        {activeTab === 'client' && (
          <div className="space-y-4">
            {/* Toggle between login and register */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setClientView('login');
                  setError('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  clientView === 'login'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  setClientView('register');
                  setError('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  clientView === 'register'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Registrarse
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Client Login Form */}
            {clientView === 'login' && (
              <form onSubmit={handleClientLogin} className="space-y-4">
                <div>
                  <label htmlFor="client-email" className="block text-sm font-bold text-gray-900 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="client-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="client-password" className="block text-sm font-bold text-gray-900 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="client-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">o continúa con</span>
                  </div>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full bg-white border border-gray-300 text-gray-900 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Conectando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar con Google
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Client Registration Form */}
            {clientView === 'register' && (
              <form onSubmit={handleClientRegister} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-bold text-gray-900 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                      placeholder="Juan"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-bold text-gray-900 mb-1">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-bold text-gray-900 mb-1">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-bold text-gray-900 mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="+593 999 999 999"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-bold text-gray-900 mb-1">
                    Dirección (opcional)
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Av. Principal 123"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">o regístrate con</span>
                  </div>
                </div>

                {/* Google Register Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Conectando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Registrarse con Google
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
