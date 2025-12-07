import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Custom hook for client authentication
 * Provides client authentication state and methods
 * 
 * Returns:
 * - user: Current authenticated client user or null
 * - loading: Boolean indicating if auth state is being loaded
 * - login: Function to log in a client
 * - register: Function to register a new client
 * - logout: Function to log out the current client
 * - refreshUser: Function to manually refresh user data
 */
export function useClientAuth() {
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
        credentials: 'include', // Include cookies
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
   * @param {Object} userData - { firstName, lastName, email, password, phone?, address? }
   * @returns {Promise<Object>} Response with success status and message
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
   * @param {string} email - Client email
   * @param {string} password - Client password
   * @returns {Promise<Object>} Response with success status and message
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
   * @returns {Promise<Object>} Response with success status and message
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

      // Clear user state regardless of response
      setUser(null);

      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Error al cerrar sesión' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state on error
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

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser
  };
}
