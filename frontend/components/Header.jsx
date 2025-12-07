import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-neutral-900 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-orange-500 text-2xl font-bold">
            Bocatto
          </Link>
          
          <ul className="flex gap-8 items-center">
            <li>
              <Link href="/" className="text-white hover:text-orange-500 transition">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/menu" className="text-white hover:text-orange-500 transition">
                Menú
              </Link>
            </li>
            <li>
              <Link href="/reservations" className="text-white hover:text-orange-500 transition">
                Reservaciones
              </Link>
            </li>
            <li>
              <Link href="/offers" className="text-white hover:text-orange-500 transition">
                Ofertas
              </Link>
            </li>
            <li>
              <Link href="/locations" className="text-white hover:text-orange-500 transition">
                Ubicaciones
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-white hover:text-orange-500 transition">
                Quiénes somos
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white hover:text-orange-500 transition">
                Contáctenos
              </Link>
            </li>
            <li>
              <Link href="/login" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition">
                Ingresar
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
