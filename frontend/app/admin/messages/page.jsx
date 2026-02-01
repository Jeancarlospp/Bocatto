'use client';

import { useState, useEffect } from 'react';
import MessageList from '@/components/admin/MessageList';
import MessageDetail from '@/components/admin/MessageDetail';
import MessageStats from '@/components/admin/MessageStats';

/**
 * Admin Messages Page
 * Displays and manages contact form submissions
 * Follows Clean Code and Single Responsibility Principle
 */
export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, new, read, responded, archived

  useEffect(() => {
    loadMessages();
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  /**
   * Load messages from API
   */
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bocatto.onrender.com';
      const url = filter === 'all' 
        ? `${apiUrl}/api/contact`
        : `${apiUrl}/api/contact?status=${filter}`;

      const response = await fetch(url, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(data.data.messages);
      } else {
        throw new Error(data.message || 'Error loading messages');
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Error al cargar los mensajes. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load statistics from API
   */
  const loadStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bocatto.onrender.com';
      const response = await fetch(`${apiUrl}/api/contact/stats`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  /**
   * Handle message selection
   */
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
  };

  /**
   * Handle message status update
   */
  const handleStatusUpdate = async (messageId, newStatus, adminNotes = '') => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bocatto.onrender.com';
      const response = await fetch(`${apiUrl}/api/contact/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, adminNotes }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setMessages(messages.map(msg => 
          msg.id === messageId ? data.data : msg
        ));
        
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(data.data);
        }

        await loadStats();
        return { success: true };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      return { success: false, message: err.message };
    }
  };

  /**
   * Handle message deletion
   */
  const handleDeleteMessage = async (messageId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bocatto.onrender.com';
      const response = await fetch(`${apiUrl}/api/contact/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(messages.filter(msg => msg.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        await loadStats();
        return { success: true };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Error al eliminar el mensaje');
      return { success: false };
    }
  };

  /**
   * Handle close detail panel
   */
  const handleCloseDetail = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Mensajes de Contacto
        </h1>
        <p className="text-gray-600">
          Administra los mensajes recibidos desde el formulario de contacto
        </p>
      </div>

      {/* Statistics */}
      {stats && <MessageStats stats={stats} />}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex flex-wrap gap-1">
        <FilterButton
          label="Todos"
          count={stats?.totalMessages}
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterButton
          label="Nuevos"
          count={stats?.messagesByStatus?.new}
          isActive={filter === 'new'}
          onClick={() => setFilter('new')}
          badge="bg-blue-600"
        />
        <FilterButton
          label="Leídos"
          count={stats?.messagesByStatus?.read}
          isActive={filter === 'read'}
          onClick={() => setFilter('read')}
        />
        <FilterButton
          label="Respondidos"
          count={stats?.messagesByStatus?.responded}
          isActive={filter === 'responded'}
          onClick={() => setFilter('responded')}
        />
        <FilterButton
          label="Archivados"
          count={stats?.messagesByStatus?.archived}
          isActive={filter === 'archived'}
          onClick={() => setFilter('archived')}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={loadMessages}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <MessageList
            messages={messages}
            loading={loading}
            selectedId={selectedMessage?.id}
            onSelectMessage={handleSelectMessage}
          />
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <MessageDetail
              message={selectedMessage}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteMessage}
              onClose={handleCloseDetail}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Filter Button Component
 */
function FilterButton({ label, count, isActive, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium transition-colors relative ${
        isActive
          ? 'bg-orange-600 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
            isActive
              ? 'bg-white text-orange-600'
              : badge || 'bg-gray-200 text-gray-700'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">📧</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Selecciona un mensaje
      </h3>
      <p className="text-gray-600">
        Haz clic en un mensaje de la lista para ver sus detalles
      </p>
    </div>
  );
}
