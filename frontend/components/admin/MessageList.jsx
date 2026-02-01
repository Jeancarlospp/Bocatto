'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Message List Component
 * Displays list of contact messages with status indicators
 */
export default function MessageList({ messages, loading, selectedId, onSelectMessage }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-gray-600 font-medium">No hay mensajes</p>
        <p className="text-sm text-gray-500 mt-1">
          Los mensajes aparecerán aquí cuando los usuarios envíen el formulario
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isSelected={message.id === selectedId}
            onClick={() => onSelectMessage(message)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Message Item Component
 */
function MessageItem({ message, isSelected, onClick }) {
  const statusConfig = {
    new: { color: 'bg-blue-600', label: 'Nuevo' },
    read: { color: 'bg-gray-400', label: 'Leído' },
    responded: { color: 'bg-green-600', label: 'Respondido' },
    archived: { color: 'bg-yellow-600', label: 'Archivado' }
  };

  const config = statusConfig[message.status] || statusConfig.new;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-orange-50 border-l-4 border-orange-600' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${
            message.status === 'new' ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {message.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">{message.email}</p>
        </div>
        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${config.color} flex-shrink-0`}>
          {config.label}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
        {message.message}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {formatDistanceToNow(new Date(message.createdAt), { 
            addSuffix: true,
            locale: es 
          })}
        </span>
        {message.company && (
          <span className="text-gray-400">🏢 {message.company}</span>
        )}
      </div>
    </button>
  );
}
