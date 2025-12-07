'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';
import { useClientAuth } from '@/hooks/useClientAuth';

export default function Header() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, loading, logout, refreshUser } = useClientAuth();

  const handleLogout = async () => {
    const result = await logout();
    setShowUserMenu(false);
    
    if (result.success) {
      // Redirect to home after logout
      router.push('/');
    }
  };

  const handleLoginSuccess = () => {
    // Force refresh user data after successful login/register
    refreshUser();
  };

  return (
    <>
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
              
              {/* Authentication Section */}
              <li>
                {loading ? (
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                ) : user ? (
                  // User is authenticated - Show user menu
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{user.firstName}</span>
                      <svg className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        
                        {/* TODO: Add "Mi cuenta" link when profile page is ready */}
                        {/* <Link
                          href="/my-account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mi cuenta
                        </Link> */}
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // User is not authenticated - Show login button
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
                  >
                    Ingresar
                  </button>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
