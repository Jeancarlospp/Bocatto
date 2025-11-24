export default function Features() {
  const features = [
    { icon: '🍽️', title: 'Comida Fresca', description: 'Ingredientes frescos todos los días' },
    { icon: '👨‍🍳', title: 'Chefs Expertos', description: 'Equipo culinario de primera clase' },
    { icon: '🚚', title: 'Delivery Rápido', description: 'Entrega en 30 minutos o menos' },
    { icon: '⭐', title: 'Calidad Premium', description: 'Excelencia en cada plato' },
  ];

  return (
    <section className="py-20 bg-neutral-800">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-white mb-12">¿Por qué elegirnos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-neutral-900 p-8 rounded-lg text-center hover:transform hover:-translate-y-2 transition shadow-lg"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
