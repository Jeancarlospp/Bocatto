'use client';

/**
 * Contact Information Component
 * Displays restaurant contact details and social media links
 * Follows Single Responsibility Principle - only displays static contact info
 */
export default function ContactInfo() {
  const contactDetails = getContactDetails();
  const socialLinks = getSocialLinks();

  return (
    <div className="space-y-8">
      {/* Contact Information Card */}
      <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          Información de Contacto
        </h2>

        <div className="space-y-6">
          {contactDetails.map((detail, index) => (
            <ContactDetailItem
              key={index}
              icon={detail.icon}
              label={detail.label}
              value={detail.value}
              link={detail.link}
            />
          ))}
        </div>
      </div>

      {/* Social Media Card */}
      <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          Síguenos en Redes Sociales
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {socialLinks.map((social, index) => (
            <SocialLinkButton
              key={index}
              icon={social.icon}
              name={social.name}
              url={social.url}
              color={social.color}
            />
          ))}
        </div>
      </div>

      {/* Business Hours Card */}
      <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          Horario de Atención
        </h2>

        <div className="space-y-3">
          <HoursItem day="Lunes - Jueves" hours="9:00 AM - 10:00 PM" />
          <HoursItem day="Viernes - Sábado" hours="9:00 AM - 11:00 PM" />
          <HoursItem day="Domingo" hours="10:00 AM - 9:00 PM" />
        </div>
      </div>
    </div>
  );
}

/**
 * Contact Detail Item Component
 * Displays a single contact detail with icon and optional link
 */
function ContactDetailItem({ icon, label, value, link }) {
  const content = (
    <>
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center text-orange-500 text-xl">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-neutral-400 mb-1">{label}</p>
        <p className="text-white font-medium">{value}</p>
      </div>
    </>
  );

  if (link) {
    return (
      <a 
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 hover:bg-neutral-700/50 p-3 rounded-lg transition-colors"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-4 p-3">
      {content}
    </div>
  );
}

/**
 * Social Link Button Component
 * Clickable social media button with icon and color
 */
function SocialLinkButton({ icon, name, url, color }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${color} hover:scale-105 transition-transform duration-200`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-white">{name}</span>
    </a>
  );
}

/**
 * Hours Item Component
 * Displays operating hours for a day/range
 */
function HoursItem({ day, hours }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-700 last:border-0">
      <span className="text-neutral-300">{day}</span>
      <span className="text-white font-medium">{hours}</span>
    </div>
  );
}

/**
 * Get contact details data
 * Centralized data source following DRY principle
 */
function getContactDetails() {
  return [
    {
      icon: '📍',
      label: 'Dirección Principal',
      value: 'Av. La Prensa N45-120 y Diego de Vásquez, Quito',
      link: null
    },
    {
      icon: '📞',
      label: 'Teléfono',
      value: '+593 99 307 1456',
      link: 'tel:+593993071456'
    },
    {
      icon: '📱',
      label: 'WhatsApp',
      value: '+593 99 940 9342',
      link: 'https://wa.me/593999409342'
    },
    {
      icon: '✉️',
      label: 'Email',
      value: 'bocattolaprensa@gmail.com',
      link: 'mailto:bocattolaprensa@gmail.com'
    }
  ];
}

/**
 * Get social media links data
 * Centralized data source following DRY principle
 */
function getSocialLinks() {
  return [
    {
      icon: '📘',
      name: 'Facebook',
      url: 'https://facebook.com/bocatto',
      color: 'border-blue-600 hover:bg-blue-600/10'
    },
    {
      icon: '📷',
      name: 'Instagram',
      url: 'https://instagram.com/bocatto',
      color: 'border-pink-600 hover:bg-pink-600/10'
    },
    {
      icon: '🐦',
      name: 'Twitter',
      url: 'https://twitter.com/bocatto',
      color: 'border-sky-500 hover:bg-sky-500/10'
    },
    {
      icon: '📺',
      name: 'TikTok',
      url: 'https://tiktok.com/@bocatto',
      color: 'border-white hover:bg-white/10'
    }
  ];
}
