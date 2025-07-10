import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ Estados para el login progresivo
  const [state, setState] = useState({
    // Estados de autenticación
    isAuthenticated: false,
    currentUser: null,
    loading: true,
    
    // Estados del flujo progresivo
    currentStep: 'company', // 'company' | 'credentials' | 'authenticated'
    validatedCompany: null,
    rememberedCompany: null,
    
    // Estados de UI
    isValidatingCompany: false,
    isLoggingIn: false,
    
    // Errores
    companyError: null,
    loginError: null
  });

  useEffect(() => {
    const init = async () => {
      try {
        console.log('🔄 Inicializando AuthContext...');
        
        // ✅ Verificar si hay sesión autenticada
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          console.log('✅ Sesión persistente encontrada:', user.id);
          
          setState(prevState => ({
            ...prevState,
            isAuthenticated: true,
            currentUser: user,
            currentStep: 'authenticated',
            loading: false
          }));
          
          return;
        }
        
        // ✅ Verificar si hay empresa recordada
        const rememberedCompany = localStorage.getItem('rememberedCompany');
        if (rememberedCompany) {
          try {
            const companyData = JSON.parse(rememberedCompany);
            console.log('💾 Empresa recordada encontrada:', companyData.nombre);
            
            setState(prevState => ({
              ...prevState,
              rememberedCompany: companyData,
              validatedCompany: companyData,
              currentStep: 'credentials', // Ir directo a credenciales
              loading: false
            }));
            
            return;
          } catch (error) {
            console.warn('❌ Error parsing empresa recordada:', error);
            localStorage.removeItem('rememberedCompany');
          }
        }
        
        // ✅ Verificar empresa en currentCompany (tu implementación actual)
        const currentCompany = localStorage.getItem('currentCompany');
        if (currentCompany) {
          try {
            const companyData = JSON.parse(currentCompany);
            console.log('📁 Empresa actual encontrada:', companyData.nombre);
            
            // Convertir a formato del contexto
            const normalizedCompany = {
              empresa_id: companyData.id,
              nombre: companyData.nombre,
              id: companyData.id // mantener compatibilidad
            };
            
            setState(prevState => ({
              ...prevState,
              validatedCompany: normalizedCompany,
              currentStep: 'credentials',
              loading: false
            }));
            
            return;
          } catch (error) {
            console.warn('❌ Error parsing currentCompany:', error);
            localStorage.removeItem('currentCompany');
          }
        }
        
        // ✅ No hay sesión ni empresa - empezar desde el principio
        console.log('🏁 Iniciando flujo desde validación de empresa');
        setState(prevState => ({
          ...prevState,
          currentStep: 'company',
          loading: false
        }));
        
      } catch (error) {
        console.error('❌ Error inicializando auth:', error);
        
        // Limpiar todo en caso de error
        authService.logout();
        localStorage.removeItem('rememberedCompany');
        localStorage.removeItem('currentCompany');
        
        setState(prevState => ({
          ...prevState,
          isAuthenticated: false,
          currentUser: null,
          currentStep: 'company',
          validatedCompany: null,
          rememberedCompany: null,
          loading: false
        }));
      }
    };

    init();
  }, []);

  // ✅ Función para validar empresa
  const handleCompanyValidation = async (empresaInput) => {
    try {
      console.log('🔍 Validando empresa:', empresaInput);
      
      setState(prevState => ({
        ...prevState,
        isValidatingCompany: true,
        companyError: null
      }));
      
      const result = await authService.validateCompany(empresaInput);
      
      if (result.valid) {
        console.log('✅ Empresa válida:', result.nombre);
        
        // ✅ Guardar en formato del contexto
        const normalizedCompany = {
          empresa_id: result.empresa_id,
          nombre: result.nombre,
          id: result.empresa_id // mantener compatibilidad
        };
        
        // ✅ También guardar en currentCompany para compatibilidad
        localStorage.setItem('currentCompany', JSON.stringify({
          id: result.empresa_id,
          nombre: result.nombre
        }));
        
        setState(prevState => ({
          ...prevState,
          validatedCompany: normalizedCompany,
          currentStep: 'credentials',
          isValidatingCompany: false,
          companyError: null
        }));
        
        return { success: true, company: normalizedCompany };
      } else {
        console.log('❌ Empresa no válida');
        
        setState(prevState => ({
          ...prevState,
          isValidatingCompany: false,
          companyError: 'Empresa no encontrada. Verifique el nombre, NIT o ID.'
        }));
        
        return { success: false, message: 'Empresa no encontrada' };
      }
      
    } catch (error) {
      console.error('❌ Error validando empresa:', error);
      
      setState(prevState => ({
        ...prevState,
        isValidatingCompany: false,
        companyError: 'Error de conexión. Intente nuevamente.'
      }));
      
      return { success: false, message: 'Error de conexión' };
    }
  };

  // ✅ Función para login con credenciales (compatible con tu estructura)
  const login = async (usuario, contraseña, rememberCompany = false) => {
    try {
      // ✅ Obtener empresa actual
      const empresa = state.validatedCompany || 
                     JSON.parse(localStorage.getItem('currentCompany') || '{}');
      
      const empresaId = empresa?.id || empresa?.empresa_id;
      
      if (!empresaId) {
        throw new Error('No hay empresa validada');
      }
      
      console.log('🔐 Intentando login:', { usuario, empresa: empresa.nombre });
      
      setState(prevState => ({
        ...prevState,
        isLoggingIn: true,
        loginError: null
      }));
      
      // ✅ Usar authService con tu estructura de parámetros
      const result = await authService.login(usuario, contraseña, empresaId);
      
      if (result.success) {
        console.log('✅ Login exitoso');
        
        // ✅ Recordar empresa si se solicita
        if (rememberCompany) {
          localStorage.setItem('rememberedCompany', JSON.stringify(empresa));
          console.log('💾 Empresa guardada para recordar');
        } else {
          localStorage.removeItem('rememberedCompany');
        }
        
        setState(prevState => ({
          ...prevState,
          isAuthenticated: true,
          currentUser: result.user,
          currentStep: 'authenticated',
          isLoggingIn: false,
          loginError: null
        }));
        
        return { success: true };
      } else {
        console.log('❌ Login fallido:', result.message);
        
        setState(prevState => ({
          ...prevState,
          isLoggingIn: false,
          loginError: result.message
        }));
        
        return result;
      }
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      setState(prevState => ({
        ...prevState,
        isLoggingIn: false,
        loginError: 'Error al iniciar sesión. Intente nuevamente.'
      }));
      
      return {
        success: false,
        message: 'Error al iniciar sesión'
      };
    }
  };

  // ✅ Función para logout (mantiene empresa si está recordada)
  const handleLogout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Verificar si hay empresa recordada ANTES de limpiar
      const rememberedCompany = localStorage.getItem('rememberedCompany');
      let companyToRestore = null;
      
      if (rememberedCompany) {
        try {
          companyToRestore = JSON.parse(rememberedCompany);
          console.log('💾 Manteniendo empresa recordada:', companyToRestore.nombre);
        } catch (error) {
          console.warn('❌ Error parsing empresa recordada');
        }
      }
      
      // Limpiar sesión de usuario pero mantener currentCompany
      await authService.logout();
      // NO eliminar currentCompany aquí para mantener compatibilidad
      
      // Restaurar estado según empresa recordada
      if (companyToRestore) {
        setState(prevState => ({
          ...prevState,
          isAuthenticated: false,
          currentUser: null,
          currentStep: 'credentials', // Volver a credenciales
          validatedCompany: companyToRestore,
          rememberedCompany: companyToRestore,
          isLoggingIn: false,
          loginError: null,
          loading: false
        }));
      } else {
        localStorage.removeItem('currentCompany'); // Solo eliminar si no hay empresa recordada
        setState(prevState => ({
          ...prevState,
          isAuthenticated: false,
          currentUser: null,
          currentStep: 'company',
          validatedCompany: null,
          rememberedCompany: null,
          isLoggingIn: false,
          loginError: null,
          companyError: null,
          loading: false
        }));
      }
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  };

  // ✅ Función para cambiar de empresa (olvida la empresa actual)
  const changeCompany = () => {
    console.log('🔄 Cambiando empresa...');
    
    localStorage.removeItem('rememberedCompany');
    localStorage.removeItem('currentCompany');
    
    setState(prevState => ({
      ...prevState,
      currentStep: 'company',
      validatedCompany: null,
      rememberedCompany: null,
      companyError: null,
      loginError: null
    }));
  };

  // ✅ Función para olvidar empresa recordada
  const forgetCompany = () => {
    console.log('🗑️ Olvidando empresa recordada...');
    
    localStorage.removeItem('rememberedCompany');
    
    setState(prevState => ({
      ...prevState,
      rememberedCompany: null
    }));
  };

  // ✅ Valores del contexto
  const value = {
    // Estados
    ...state,
    
    // Funciones principales
    handleCompanyValidation,
    login,
    handleLogout,
    
    // Funciones auxiliares
    changeCompany,
    forgetCompany
  };

  // ✅ Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};