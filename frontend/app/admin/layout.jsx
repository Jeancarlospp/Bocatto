'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verify authentication on mount
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/verify`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setLoading(false);
        } else {
          router.replace('/');
        }
      } else {
        // Not authenticated, redirect to home
        router.replace('/');
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      router.replace('/');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear client-side cache to prevent back button access
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/');
        }
        router.replace('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar with user info */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Panel de Administración
            </h1>
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.adminAcceso}</p>
                </div>
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
