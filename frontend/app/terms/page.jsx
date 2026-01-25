export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos de Servicio</h1>
        
        <div className="bg-white rounded-lg shadow px-6 py-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Aceptación de términos</h2>
            <p>
              Al utilizar los servicios de Bocatto Restaurant, aceptas estos términos y condiciones 
              en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, 
              no debes utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Uso de la cuenta</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Eres responsable de mantener la seguridad de tu cuenta</li>
              <li>Debes proporcionar información veraz y actualizada</li>
              <li>No puedes compartir tu cuenta con terceros</li>
              <li>Nos reservamos el derecho de suspender cuentas que violen estos términos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Pedidos y pagos</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Todos los pedidos están sujetos a disponibilidad</li>
              <li>Los precios pueden cambiar sin previo aviso</li>
              <li>Los pagos deben realizarse en el momento del pedido</li>
              <li>Las cancelaciones deben realizarse dentro del tiempo permitido</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Reservaciones</h2>
            <p>
              Las reservaciones están sujetas a disponibilidad y pueden ser canceladas 
              hasta 2 horas antes del horario reservado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitación de responsabilidad</h2>
            <p>
              Bocatto Restaurant no será responsable por daños indirectos, incidentales 
              o consecuentes que resulten del uso de nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contacto</h2>
            <p>
              Para preguntas sobre estos términos, contacta con nosotros en{' '}
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