import { useState, useEffect, useCallback } from 'react';
import { User } from '@/interfaces/UserInterface';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check authentication status
  const checkAuth = useCallback(() => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      setUser(null);
      setError('Session expired. Please login again.');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      setUser(response.user);
      navigate('/casino'); // Or wherever you want to redirect after login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(username, email, password);
      setUser(response.user);
      navigate('/casino'); // Or wherever you want to redirect after registration
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
    navigate('/login');
  }, [navigate]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for storage events (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  // Handle token expiration
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Basic token expiration check
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds

        if (Date.now() >= expirationTime) {
          logout();
        } else {
          // Set up expiration timeout
          const timeout = setTimeout(logout, expirationTime - Date.now());
          return () => clearTimeout(timeout);
        }
      } catch (err) {
        logout();
      }
    }
  }, [logout]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };
};