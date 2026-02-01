'use client';

import { useState } from 'react';

export default function TwoFactorVerification({ tempUserId, onSuccess, onCancel }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        tempUserId: tempUserId
      };

      if (useBackupCode) {
        if (!backupCode.trim()) {
          setError('Ingresa un código de respaldo');
          setLoading(false);
          return;
        }
        payload.backupCode = backupCode.trim().toUpperCase();
      } else {
        if (verificationCode.length !== 6) {
          setError('Ingresa un código de 6 dígitos');
          setLoading(false);
          return;
        }
        payload.token = verificationCode;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/client/complete-login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data.user);
      } else {
        setError(data.message || 'Código inválido');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('2FA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleVerification();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verificación en Dos Pasos
          </h2>
          <p className="text-gray-600">
            Para completar el inicio de sesión, ingresa tu código de autenticación
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!useBackupCode ? (
            <>
              {/* TOTP Code Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Código de tu aplicación de autenticación:
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Código de 6 dígitos de Google Authenticator, Microsoft Authenticator, etc.
                </p>
              </div>

              <button
                onClick={handleVerification}
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>

              {/* Switch to backup code */}
              <div className="text-center">
                <button
                  onClick={() => setUseBackupCode(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  ¿No tienes acceso a tu teléfono? Usar código de respaldo
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Backup Code Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Código de respaldo:
                </label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setBackupCode(value);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="XXXX-XXXX"
                  className="w-full px-4 py-3 text-center font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa uno de los códigos de respaldo que guardaste al configurar 2FA
                </p>
              </div>

              <button
                onClick={handleVerification}
                disabled={loading || !backupCode.trim()}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Usar Código de Respaldo'}
              </button>

              {/* Switch back to TOTP */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setUseBackupCode(false);
                    setBackupCode('');
                    setError('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  ← Volver a código de aplicación
                </button>
              </div>
            </>
          )}

          {/* Cancel */}
          <button
            onClick={onCancel}
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}