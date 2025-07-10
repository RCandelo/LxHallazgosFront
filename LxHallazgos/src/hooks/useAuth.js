// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar sesión persistida al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const savedCompany = localStorage.getItem('currentCompany');
        
        if (token) {
          const user = await authService.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setCurrentCompany(savedCompany || user.empresa?.nombre);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Login con validación de empresa
  const handleLogin = useCallback(async (usuario, contraseña, empresa) => {
    try {
      setError(null);
      const response = await authService.login(usuario, contraseña, empresa);

      if (response.success && response.user) {
        setCurrentUser(response.user);
        setCurrentCompany(empresa);
        localStorage.setItem('currentCompany', empresa);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.message || 'Credenciales inválidas' 
        };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión' 
      };
    }
  }, []);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      setCurrentCompany(null);
      window.location.href = '/';
    }
  }, []);

  // Actualizar permisos del usuario
  const refreshUserPermissions = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing permissions:', error);
      return false;
    }
  }, []);

  // Validar empresa
  const validateCompany = useCallback(async (companyName) => {
    try {
      const response = await authService.validateCompany(companyName);
      return response.valid;
    } catch (error) {
      console.error('Error validating company:', error);
      return false;
    }
  }, []);

  const isAuthenticated = !isLoading && currentUser !== null;

  return {
    currentUser,
    currentCompany,
    isLoading,
    error,
    isAuthenticated,
    handleLogin,
    handleLogout,
    refreshUserPermissions,
    validateCompany,
    setCurrentCompany
  };
};

