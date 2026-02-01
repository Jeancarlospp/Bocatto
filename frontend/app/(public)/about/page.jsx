'use client';

import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [activeStory, setActiveStory] = useState(0);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default data in case API fails
  const defaultData = {
    hero: {
      title: "Nuestra Historia",
      subtitle: "Más de 30 años creando experiencias gastronómicas extraordinarias, una familia unida por la pasión de servir lo mejor.",
      stats: [
        { value: "30+", label: "Años de Experiencia" },
        { value: "500K+", label: "Clientes Satisfechos" },
        { value: "50+", label: "Empleados" },
        { value: "5", label: "Ubicaciones" }
      ]
    },
    mission: {
      title: "Nuestra Misión",
      description: "En Bocatto, nos dedicamos a crear momentos extraordinarios a través de sabores excepcionales. Combinamos técnicas culinarias tradicionales con innovación moderna para ofrecer una experiencia gastronómica que trasciende las expectativas.",
      highlights: [
        { text: "Ingredientes frescos seleccionados diariamente de proveedores locales" },
        { text: "Recetas familiares transmitidas por generaciones" },
        { text: "Atención personalizada que te hace sentir como en casa" },
        { text: "Innovación constante sin perder nuestra identidad" }
      ]
    },
    timeline: [
      { year: "1995", title: "Los Inicios", description: "Todo comenzó con una pequeña cocina familiar y un sueño: traer los sabores auténticos de la comida rápida gourmet a nuestra comunidad." },
      { year: "2010", title: "Expansión", description: "Abrimos nuestro primer restaurante físico, manteniendo la calidad casera pero con un servicio profesional que nos caracteriza." },
      { year: "2020", title: "Innovación Digital", description: "Nos adaptamos al mundo digital sin perder nuestra esencia, creando experiencias únicas para nuestros clientes tanto presencial como virtualmente." },
      { year: "2026", title: "El Futuro", description: "Hoy somos más que un restaurante, somos una familia que conecta sabores, emociones y momentos especiales en cada experiencia Bocatto." }
    ],
    values: [
      { icon: "❤️", title: "Pasión", description: "Cada plato es preparado con amor y dedicación, transmitiendo nuestra pasión por la gastronomía en cada bocado." },
      { icon: "🌱", title: "Sostenibilidad", description: "Trabajamos con proveedores locales y prácticas sustentables para cuidar nuestro planeta mientras te alimentamos." },
      { icon: "👨‍👩‍👧‍👦", title: "Familia", description: "Bocatto es más que un restaurante, somos una gran familia que incluye a nuestro equipo y nuestros queridos clientes." },
      { icon: "🎯", title: "Excelencia", description: "Nunca nos conformamos. Siempre buscamos la perfección en cada ingrediente, cada preparación, cada servicio." },
      { icon: "🚀", title: "Innovación", description: "Fusionamos tradición con modernidad, creando experiencias culinarias únicas que sorprenden y deleitan." },
      { icon: "🤝", title: "Compromiso", description: "Nuestro compromiso es contigo, ofreciendo siempre la mejor calidad, frescura y servicio en cada visita." }
    ],
    team: [
      { name: "Carlos Rodriguez", position: "Chef Ejecutivo", description: "25 años de experiencia en cocina internacional", specialty: "Cocina de Autor" },
      { name: "María González", position: "Directora de Operaciones", description: "Experta en gestión gastronómica y atención al cliente", specialty: "Gestión & Calidad" },
      { name: "Antonio Silva", position: "Maestro Panadero", description: "Especialista en panes artesanales y masas frescas", specialty: "Panadería Artesanal" },
      { name: "Sofia Chen", position: "Chef de Postres", description: "Creadora de nuestros postres signature", specialty: "Repostería Creativa" }
    ],
    gallery: [],
    cta: {
      title: "¿Listo para vivir la experiencia Bocatto?",
      description: "Ven y descubre por qué somos más que un restaurante. Somos el lugar donde los sabores se convierten en recuerdos."
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`);
      const data = await response.json();
      if (data.success && data.data) {
        setConfig(data.data);
      } else {
        setConfig(defaultData);
      }
    } catch (error) {
      console.error('Error fetching about config:', error);
      setConfig(defaultData);
    } finally {
      setLoading(false);
    }
  };

  // Use config data or default
  const hero = config?.hero || defaultData.hero;
  const mission = config?.mission || defaultData.mission;
  const timeline = config?.timeline || defaultData.timeline;
  const values = config?.values || defaultData.values;
  const team = config?.team || defaultData.team;
  const gallery = config?.gallery || defaultData.gallery;
  const cta = config?.cta || defaultData.cta;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 to-orange-700 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-6xl font-bold mb-6">{hero.title}</h1>
          <p className="text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            {hero.subtitle}
          </p>
          {hero.stats && hero.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-12">
              {hero.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-10">🍽️</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-10">👨‍🍳</div>
        <div className="absolute top-1/2 left-1/4 text-4xl opacity-10">🥖</div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl opacity-10">🍷</div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-neutral-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8">{mission.title}</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-12">
              {mission.description}
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                {mission.image ? (
                  <img 
                    src={mission.image} 
                    alt={mission.title}
                    className="w-full h-96 object-cover rounded-2xl"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl h-96 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🏪</div>
                      <p className="text-lg opacity-90">Vista panorámica del restaurante</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-6">Lo que nos hace únicos</h3>
                <ul className="space-y-4 text-gray-300">
                  {mission.highlights?.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-3 text-xl">✓</span>
                      <span>{highlight.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-neutral-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Nuestro Recorrido</h2>
          
          {timeline && timeline.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {timeline.map((story, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStory(index)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      activeStory === index
                        ? 'bg-orange-600 text-white'
                        : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                    }`}
                  >
                    {story.year}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                  {timeline[activeStory]?.image ? (
                    <img 
                      src={timeline[activeStory].image} 
                      alt={timeline[activeStory].title}
                      className="w-full h-96 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl h-96 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-4">📸</div>
                        <p className="text-lg opacity-90">{timeline[activeStory]?.year} - {timeline[activeStory]?.title}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="order-1 lg:order-2">
                  <div className="bg-neutral-800 p-8 rounded-2xl">
                    <div className="text-orange-500 text-6xl font-bold mb-4">
                      {timeline[activeStory]?.year}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {timeline[activeStory]?.title}
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {timeline[activeStory]?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-neutral-800">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Nuestros Valores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-neutral-900 p-8 rounded-2xl text-center hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl group"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-neutral-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-8">Nuestro Equipo</h2>
          <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
            Conoce a las personas apasionadas que hacen posible cada experiencia Bocatto
          </p>
          
          {team && team.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="bg-neutral-800 rounded-2xl overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 group"
                >
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 h-64 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">👨‍🍳</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-orange-500 font-semibold mb-2">{member.position}</p>
                    <p className="text-gray-400 text-sm mb-3">{member.description}</p>
                    {member.specialty && (
                      <div className="bg-neutral-900 px-3 py-1 rounded-full text-xs text-orange-400 inline-block">
                        {member.specialty}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {cta.title}
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            {cta.description}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="/menu"
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
            >
              Ver Nuestro Menú
            </a>
            <a 
              href="/reservations"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Hacer Reservación
            </a>
            <a 
              href="/locations"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Nuestras Ubicaciones
            </a>
          </div>
        </div>
      </section>

      {/* Photo Gallery Preview */}
      <section className="py-20 bg-neutral-800">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Galería de Momentos</h2>
          
          {gallery && gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {gallery.map((item, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group relative"
                >
                  <img 
                    src={item.image} 
                    alt={item.caption || `Galería ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {item.caption && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity px-4 text-center text-sm">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div 
                  key={item}
                  className="bg-gradient-to-br from-orange-500 to-orange-600 aspect-square rounded-lg flex items-center justify-center hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-center text-white">
                    <div className="text-2xl mb-2">📸</div>
                    <p className="text-xs opacity-75">Galería #{item}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
