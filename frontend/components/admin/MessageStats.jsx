'use client';

/**
 * Message Statistics Component
 * Displays contact message statistics in card format
 */
export default function MessageStats({ stats }) {
  const cards = [
    {
      title: 'Total Mensajes',
      value: stats.totalMessages,
      icon: '📧',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Nuevos',
      value: stats.messagesByStatus.new,
      icon: '🔔',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Respondidos',
      value: stats.messagesByStatus.responded,
      icon: '✅',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Últimos 7 días',
      value: stats.recentMessages.count,
      icon: '📊',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
