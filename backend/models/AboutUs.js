import mongoose from 'mongoose';

/**
 * About Us Configuration Schema
 * Stores all content for the "Quiénes somos" page
 */
const aboutUsSchema = new mongoose.Schema({
  // Hero Section
  hero: {
    title: {
      type: String,
      default: 'Nuestra Historia'
    },
    subtitle: {
      type: String,
      default: 'Más de 30 años creando experiencias gastronómicas extraordinarias'
    },
    stats: [{
      value: { type: String, default: '30+' },
      label: { type: String, default: 'Años de Experiencia' }
    }]
  },

  // Mission Section
  mission: {
    title: {
      type: String,
      default: 'Nuestra Misión'
    },
    description: {
      type: String,
      default: 'En Bocatto, nos dedicamos a crear momentos extraordinarios a través de sabores excepcionales.'
    },
    image: {
      type: String,
      default: ''
    },
    highlights: [{
      text: { type: String }
    }]
  },

  // Timeline/History Section
  timeline: [{
    year: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ''
    }
  }],

  // Values Section
  values: [{
    icon: {
      type: String,
      default: '❤️'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],

  // Team Section
  team: [{
    name: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    specialty: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    }
  }],

  // Gallery Section
  gallery: [{
    image: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    }
  }],

  // Call to Action Section
  cta: {
    title: {
      type: String,
      default: '¿Listo para vivir la experiencia Bocatto?'
    },
    description: {
      type: String,
      default: 'Ven y descubre por qué somos más que un restaurante.'
    }
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure only one active configuration exists
aboutUsSchema.statics.getActiveConfig = async function() {
  let config = await this.findOne({ isActive: true });
  
  if (!config) {
    // Create default configuration if none exists
    config = await this.create({
      hero: {
        title: 'Nuestra Historia',
        subtitle: 'Más de 30 años creando experiencias gastronómicas extraordinarias, una familia unida por la pasión de servir lo mejor.',
        stats: [
          { value: '30+', label: 'Años de Experiencia' },
          { value: '500K+', label: 'Clientes Satisfechos' },
          { value: '50+', label: 'Empleados' },
          { value: '5', label: 'Ubicaciones' }
        ]
      },
      mission: {
        title: 'Nuestra Misión',
        description: 'En Bocatto, nos dedicamos a crear momentos extraordinarios a través de sabores excepcionales. Combinamos técnicas culinarias tradicionales con innovación moderna para ofrecer una experiencia gastronómica que trasciende las expectativas.',
        image: '',
        highlights: [
          { text: 'Ingredientes frescos seleccionados diariamente de proveedores locales' },
          { text: 'Recetas familiares transmitidas por generaciones' },
          { text: 'Atención personalizada que te hace sentir como en casa' },
          { text: 'Innovación constante sin perder nuestra identidad' }
        ]
      },
      timeline: [
        {
          year: '1995',
          title: 'Los Inicios',
          description: 'Todo comenzó con una pequeña cocina familiar y un sueño: traer los sabores auténticos de la comida rápida gourmet a nuestra comunidad.',
          image: ''
        },
        {
          year: '2010',
          title: 'Expansión',
          description: 'Abrimos nuestro primer restaurante físico, manteniendo la calidad casera pero con un servicio profesional que nos caracteriza.',
          image: ''
        },
        {
          year: '2020',
          title: 'Innovación Digital',
          description: 'Nos adaptamos al mundo digital sin perder nuestra esencia, creando experiencias únicas para nuestros clientes.',
          image: ''
        },
        {
          year: '2026',
          title: 'El Futuro',
          description: 'Hoy somos más que un restaurante, somos una familia que conecta sabores, emociones y momentos especiales.',
          image: ''
        }
      ],
      values: [
        { icon: '❤️', title: 'Pasión', description: 'Cada plato es preparado con amor y dedicación.' },
        { icon: '🌱', title: 'Sostenibilidad', description: 'Trabajamos con proveedores locales y prácticas sustentables.' },
        { icon: '👨‍👩‍👧‍👦', title: 'Familia', description: 'Somos una gran familia que incluye a nuestro equipo y clientes.' },
        { icon: '🎯', title: 'Excelencia', description: 'Siempre buscamos la perfección en cada detalle.' },
        { icon: '🚀', title: 'Innovación', description: 'Fusionamos tradición con modernidad.' },
        { icon: '🤝', title: 'Compromiso', description: 'Nuestro compromiso es ofrecer la mejor calidad siempre.' }
      ],
      team: [
        {
          name: 'Carlos Rodriguez',
          position: 'Chef Ejecutivo',
          description: '25 años de experiencia en cocina internacional',
          specialty: 'Cocina de Autor',
          image: ''
        },
        {
          name: 'María González',
          position: 'Directora de Operaciones',
          description: 'Experta en gestión gastronómica',
          specialty: 'Gestión & Calidad',
          image: ''
        },
        {
          name: 'Antonio Silva',
          position: 'Maestro Panadero',
          description: 'Especialista en panes artesanales',
          specialty: 'Panadería Artesanal',
          image: ''
        },
        {
          name: 'Sofia Chen',
          position: 'Chef de Postres',
          description: 'Creadora de postres signature',
          specialty: 'Repostería Creativa',
          image: ''
        }
      ],
      gallery: [],
      cta: {
        title: '¿Listo para vivir la experiencia Bocatto?',
        description: 'Ven y descubre por qué somos más que un restaurante. Somos el lugar donde los sabores se convierten en recuerdos.'
      },
      isActive: true
    });
  }
  
  return config;
};

const AboutUs = mongoose.model('AboutUs', aboutUsSchema);

export default AboutUs;
