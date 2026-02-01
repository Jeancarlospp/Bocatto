'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Message Detail Component
 * Displays full message details and actions
 */
export default function MessageDetail({ message, onStatusUpdate, onDelete, onClose }) {
  const [showNotes, setShowNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState(message.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Handle status change
   */
  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    const result = await onStatusUpdate(message.id, newStatus, adminNotes);
    setIsUpdating(false);
    
    if (result.success) {
      setShowNotes(false);
    }
  };

  /**
   * Handle reply action - opens email client
   */
  const handleReply = () => {
    const subject = encodeURIComponent(`Re: ${message.name} - Contacto Bocatto`);
    const body = encodeURIComponent(`Hola ${message.name},\n\nGracias por contactarnos.\n\n---\nMensaje original:\n${message.message}`);
    window.location.href = `mailto:${message.email}?subject=${subject}&body=${body}`;
    
    // Mark as responded
    handleStatusChange('responded');
  };

  const statusConfig = {
    new: { color: 'bg-blue-600', label: 'Nuevo', icon: '🔔' },
    read: { color: 'bg-gray-400', label: 'Leído', icon: '👁️' },
    responded: { color: 'bg-green-600', label: 'Respondido', icon: '✅' },
    archived: { color: 'bg-yellow-600', label: 'Archivado', icon: '📦' }
  };

  const config = statusConfig[message.status] || statusConfig.new;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {message.name}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${config.color}`}>
                {config.icon} {config.label}
              </span>
            </div>
            
            <div className="space-y-1">
              <a
                href={`mailto:${message.email}`}
                className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2"
              >
                ✉️ {message.email}
              </a>
              {message.company && (
                <p className="text-gray-600 flex items-center gap-2">
                  🏢 {message.company}
                </p>
              )}
              <p className="text-sm text-gray-500">
                📅 {format(new Date(message.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Message Content */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Mensaje
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {message.message}
          </p>
        </div>

        {/* Admin Notes Section */}
        {(message.adminNotes || showNotes) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Notas Administrativas
            </h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Agregar notas sobre este mensaje..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleReply}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            <span>✉️</span>
            Responder por Email
          </button>

          {message.status === 'new' && (
            <button
              onClick={() => handleStatusChange('read')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              <span>👁️</span>
              Marcar como Leído
            </button>
          )}

          {!showNotes && !message.adminNotes && (
            <button
              onClick={() => setShowNotes(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <span>📝</span>
              Agregar Notas
            </button>
          )}

          {(showNotes || message.adminNotes) && (
            <button
              onClick={() => handleStatusChange(message.status)}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {isUpdating ? '⏳' : '💾'} Guardar Notas
            </button>
          )}

          {message.status !== 'archived' && (
            <button
              onClick={() => handleStatusChange('archived')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              <span>📦</span>
              Archivar
            </button>
          )}

          <button
            onClick={() => onDelete(message.id)}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors ml-auto"
          >
            <span>🗑️</span>
            Eliminar
          </button>
        </div>

        {/* Response History */}
        {message.respondedAt && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <span className="text-green-600">✅</span>
              <div>
                <p className="font-medium">Respondido</p>
                <p className="text-gray-500">
                  {format(new Date(message.respondedAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
