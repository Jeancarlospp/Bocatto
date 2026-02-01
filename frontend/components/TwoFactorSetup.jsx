'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function TwoFactorSetup({ onClose, onSuccess }) {
  const [step, setStep] = useState('setup'); // 'setup', 'verify', 'success'
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup 2FA - get QR code
  const setup2FA = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/setup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrCode(data.data.qrCode);
        setSecret(data.data.secret);
        setStep('verify');
      } else {
        setError(data.message || 'Error al configurar 2FA');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('2FA setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verify and enable 2FA
  const verify2FA = async () => {
    try {
      setLoading(true);
      setError('');

      if (verificationCode.length !== 6) {
        setError('Ingresa un código de 6 dígitos');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBackupCodes(data.data.backupCodes);
        setStep('success');
        if (onSuccess) onSuccess();
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

  // Start setup on component mount
  useEffect(() => {
    setup2FA();
  }, []);

  // Download backup codes as text file
  const downloadBackupCodes = () => {
    const codesText = `CÓDIGOS DE RESPALDO - BOCATTO RESTAURANT\n\nGuarda estos códigos en un lugar seguro.\nCada código solo puede usarse una vez.\n\n${backupCodes.join('\n')}\n\nGenerado: ${new Date().toLocaleDateString()}`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bocatto-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Configurar Autenticación en Dos Pasos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Setup Step */}
        {step === 'setup' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Configurando 2FA...</p>
          </div>
        )}

        {/* Verification Step */}
        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Escanea el código QR con tu aplicación de autenticación
              </h3>
              
              {/* QR Code */}
              {qrCode && (
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <QRCodeSVG value={qrCode} size={200} />
                  </div>
                </div>
              )}

              {/* Manual entry option */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  ¿No puedes escanear? Ingresa este código manualmente:
                </p>
                <p className="font-mono text-sm break-all bg-white p-2 rounded border">
                  {secret}
                </p>
              </div>

              {/* Apps recommendation */}
              <div className="text-sm text-gray-600 mb-6">
                <p className="mb-2">Aplicaciones recomendadas:</p>
                <ul className="text-left space-y-1">
                  <li>• Google Authenticator</li>
                  <li>• Microsoft Authenticator</li>
                  <li>• Authy</li>
                </ul>
              </div>
            </div>

            {/* Verification input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Ingresa el código de 6 dígitos de tu aplicación:
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                placeholder="123456"
                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={6}
              />
            </div>

            <button
              onClick={verify2FA}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Verificar y Activar 2FA'}
            </button>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ¡2FA Activado Exitosamente!
              </h3>
              <p className="text-gray-600 mb-6">
                Tu cuenta ahora está protegida con autenticación en dos pasos.
              </p>
            </div>

            {/* Backup codes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-3">
                ⚠️ Códigos de Respaldo Importantes
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu aplicación de autenticación.
              </p>
              
              <div className="bg-white p-3 rounded border font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="py-1">
                    {code}
                  </div>
                ))}
              </div>

              <button
                onClick={downloadBackupCodes}
                className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
              >
                📁 Descargar Códigos
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Completar Configuración
            </button>
          </div>
        )}
      </div>
    </div>
  );
}