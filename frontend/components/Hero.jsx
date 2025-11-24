import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-32 text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-5xl font-bold mb-4">Bienvenido a Bocatto</h2>
        <p className="text-xl mb-8 opacity-90">Experiencia culinaria excepcional</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            href="/menu" 
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-transparent hover:text-white hover:border-2 hover:border-white transition"
          >
            Ver Menú
          </Link>
        </div>
      </div>
    </section>
  );
}
