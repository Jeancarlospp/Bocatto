'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TwoFactorSetup from '@/components/TwoFactorSetup';

export default function SecuritySettings() {
  const { user, refreshUser } = useAuth();
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState(false);

  // Fetch 2FA status
  const fetch2FAStatus = async () => {
    try {
      setLoading(true);
      console.log('Fetching 2FA status...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/status`, {
        method: 'GET',
        credentials: 'include'
      });

      console.log('2FA Status Response:', response.status);
      const data = await response.json();
      console.log('2FA Status Data:', data);
      
      if (response.ok && data.success) {
        setTwoFactorStatus(data.twoFactorStatus);
      } else {
        console.error('Error fetching 2FA status:', data.message);
        setTwoFactorStatus({ enabled: false, error: data.message });
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      setTwoFactorStatus({ enabled: false, error: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetch2FAStatus();
    }
  }, [user]);

  const handleEnable2FA = () => {
    setShowSetup(true);
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    fetch2FAStatus(); // Refresh status
    if (refreshUser) refreshUser(); // Refresh user data
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
  };

  const handleDisable2FA = async () => {
    if (!confirm('¿Estás seguro de que deseas desactivar la autenticación en dos pasos? Esto hará tu cuenta menos segura.')) {
      return;
    }

    try {
      setDisabling(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTwoFactorStatus({ enabled: false });
        refreshUser();
        alert('Autenticación en dos pasos desactivada exitosamente');
      } else {
        alert('Error al desactivar 2FA: ' + data.message);
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('Error de conexión al desactivar 2FA');
    } finally {
      setDisabling(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder a la configuración de seguridad.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Seguridad</h1>
          <p className="mt-2 text-gray-600">Administra la seguridad de tu cuenta</p>
        </div>

        {/* Account Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Cuenta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-lg text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-lg text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <p className="mt-1 text-lg text-gray-900">{user.phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Cuenta</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                Cliente
              </span>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Autenticación en Dos Pasos (2FA)</h2>
              <p className="text-gray-600 mb-4">
                Añade una capa extra de seguridad a tu cuenta requiriendo un código adicional al iniciar sesión.
              </p>
              
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">Cargando estado...</span>
                </div>
              ) : twoFactorStatus ? (
                <div className="space-y-4">
                  {twoFactorStatus.error ? (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-600 text-sm">{twoFactorStatus.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          twoFactorStatus.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {twoFactorStatus.enabled ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Activado
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Desactivado
                            </>
                          )}
                        </span>
                      </div>

                      {twoFactorStatus.enabled && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-900 mb-2">Información de Configuración</h3>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Códigos de respaldo disponibles: {twoFactorStatus.backupCodesRemaining || 0}</li>
                            <li>• Configurado el: {twoFactorStatus.setupDate ? new Date(twoFactorStatus.setupDate).toLocaleDateString('es-ES') : 'Desconocido'}</li>
                            <li>• Aplicación de autenticación configurada</li>
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Error cargando estado</p>
              )}
            </div>

            <div className="ml-6 flex flex-col space-y-2">
              {!loading && twoFactorStatus && (
                <>
                  {!twoFactorStatus.enabled ? (
                    <button
                      onClick={handleEnable2FA}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Activar 2FA
                    </button>
                  ) : (
                    <button
                      onClick={handleDisable2FA}
                      disabled={disabling}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {disabling ? 'Desactivando...' : 'Desactivar 2FA'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Consejos de Seguridad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Usa contraseñas seguras</h3>
                <p className="text-sm text-gray-600">Combina letras, números y símbolos. Mínimo 8 caracteres.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Mantén tus apps actualizadas</h3>
                <p className="text-sm text-gray-600">Especialmente tu aplicación de autenticación.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Guarda códigos de respaldo</h3>
                <p className="text-sm text-gray-600">En un lugar seguro, separado de tu teléfono.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">No compartas información</h3>
                <p className="text-sm text-gray-600">Nunca compartas códigos de autenticación con nadie.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {showSetup && (
        <TwoFactorSetup
          onClose={handleSetupCancel}
          onSuccess={handleSetupComplete}
        />
      )}
    </div>
  );
}