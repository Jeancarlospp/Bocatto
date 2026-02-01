'use client';

import { useState } from 'react';
import ContactForm from '@/components/ContactForm';
import ContactInfo from '@/components/ContactInfo';
import ContactMap from '@/components/ContactMap';

/**
 * Contact Page Component
 * Main page for contact information and messaging system
 * Follows Single Responsibility Principle - only orchestrates layout
 */
export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleFormSuccess = () => {
    setSubmitStatus('success');
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  const handleFormError = () => {
    setSubmitStatus('error');
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">
              Contáctanos
            </h1>
            <p className="text-xl text-orange-100">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
            </p>
          </div>
        </div>
      </section>

      {/* Status Messages */}
      {submitStatus && (
        <div className="container mx-auto px-6 mt-8">
          <div className={`max-w-4xl mx-auto p-4 rounded-lg ${
            submitStatus === 'success' 
              ? 'bg-green-600/20 border border-green-600 text-green-400' 
              : 'bg-red-600/20 border border-red-600 text-red-400'
          }`}>
            {submitStatus === 'success' 
              ? '✓ Mensaje enviado exitosamente. Te responderemos pronto.' 
              : '✗ Error al enviar el mensaje. Por favor intenta nuevamente.'}
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              <ContactInfo />
              <ContactMap />
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm 
                onSuccess={handleFormSuccess}
                onError={handleFormError}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-neutral-800/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-6">
              <FAQItem 
                question="¿Cuál es el horario de atención?"
                answer="Nuestro restaurante está abierto de lunes a domingo. Lunes a jueves: 9:00 AM - 10:00 PM. Viernes y sábado: 9:00 AM - 11:00 PM. Domingo: 10:00 AM - 9:00 PM."
              />
              <FAQItem 
                question="¿Hacen entregas a domicilio?"
                answer="Sí, hacemos entregas a domicilio en toda la ciudad. Puedes hacer tu pedido a través de nuestra plataforma web o llamando directamente."
              />
              <FAQItem 
                question="¿Necesito reservación?"
                answer="Las reservaciones son recomendadas, especialmente los fines de semana. Puedes reservar en línea o llamar directamente."
              />
              <FAQItem 
                question="¿Tienen opciones vegetarianas y veganas?"
                answer="Sí, contamos con una amplia selección de platillos vegetarianos y veganos. Nuestro menú está claramente identificado."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * FAQ Item Component
 * Displays a single FAQ question and answer
 * @param {Object} props - Component props
 * @param {string} props.question - FAQ question
 * @param {string} props.answer - FAQ answer
 */
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-700/50 transition-colors"
      >
        <span className="text-lg font-semibold text-white">{question}</span>
        <span className={`text-orange-500 text-2xl transition-transform ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 text-neutral-300 bg-neutral-900/50 border-t border-neutral-700">
          {answer}
        </div>
      )}
    </div>
  );
}
