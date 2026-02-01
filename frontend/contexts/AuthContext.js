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
  const [googleAuthStatus, setGoogleAuthStatus] = useState(null);

  // Check authentication status on mount and handle Google OAuth callback
  useEffect(() => {
    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuth = urlParams.get('google_auth');
    const error = urlParams.get('error');

    if (googleAuth === 'success') {
      setGoogleAuthStatus('success');
      // Clean URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setGoogleAuthStatus(error);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

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
   * Initiate Google OAuth login
   * Redirects to backend which handles the OAuth flow
   */
  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  /**
   * Clear Google auth status after it's been shown
   */
  const clearGoogleAuthStatus = () => {
    setGoogleAuthStatus(null);
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
        if (data.user) {
          // Login completo sin 2FA
          setUser(data.user);
          return { success: true, message: data.message };
        } else if (data.requiresTwoFactor && data.tempUserId) {
          // Necesita verificación 2FA
          return { 
            success: true, 
            requiresTwoFactor: true, 
            tempUserId: data.tempUserId,
            message: 'Se requiere verificación en dos pasos' 
          };
        }
      } else {
        return { success: false, message: data.message || 'Error en el inicio de sesión' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Error de conexión al servidor' };
    }
  };

  /**
   * Complete login with 2FA verification
   */
  const complete2FALogin = async (tempUserId, token = null, backupCode = null) => {
    try {
      const payload = { tempUserId };
      if (token) payload.token = token;
      if (backupCode) payload.backupCode = backupCode;

      const response = await fetch(`${API_URL}/api/auth/client/complete-login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Código inválido' };
      }
    } catch (error) {
      console.error('2FA login completion error:', error);
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
    complete2FALogin,
    register,
    logout,
    refreshUser,
    loginWithGoogle,
    googleAuthStatus,
    clearGoogleAuthStatus
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
