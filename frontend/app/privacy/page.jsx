export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
        
        <div className="bg-white rounded-lg shadow px-6 py-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Información que recopilamos</h2>
            <p>Cuando utilizas Google OAuth para iniciar sesión, recopilamos:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Tu nombre y apellido</li>
              <li>Tu dirección de correo electrónico</li>
              <li>Tu foto de perfil de Google</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cómo utilizamos tu información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Crear y mantener tu cuenta en Bocatto</li>
              <li>Procesar tus pedidos y reservaciones</li>
              <li>Personalizar tu experiencia en nuestra plataforma</li>
              <li>Enviarte notificaciones importantes sobre tu cuenta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Protección de datos</h2>
            <p>
              Nos comprometemos a proteger tu información personal. No vendemos, 
              alquilamos ni compartimos tu información con terceros sin tu consentimiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad, contacta con nosotros en{' '}
              <a href="mailto:info@bocatto.com" className="text-orange-600 hover:text-orange-700">
                info@bocatto.com
              </a>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            Última actualización: Enero 2026
          </p>
        </div>
      </div>
    </div>
  );
}