'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the application to provide authentication state globally
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated by verifying session with backend
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/client/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new client
   */
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/client/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Error en el registro' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Error de conexión al servidor' };
    }
  };

  /**
   * Log in an existing client
   */
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/client/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Error en el inicio de sesión' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Error de conexión al servidor' };
    }
  };

  /**
   * Log out the current client
   */
  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/client/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      setUser(null);

      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Error al cerrar sesión' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      return { success: false, message: 'Error de conexión al servidor' };
    }
  };

  /**
   * Manually refresh user data from backend
   */
  const refreshUser = () => {
    checkAuth();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
