import { apiClient } from './api.client';

class AuthService {
  async getEmpresas() {
    try {
      console.log('📋 Obteniendo empresas...');
      const response = await apiClient.get('/api/empresas/public');
      console.log('✅ Empresas obtenidas:', response.length);
      return response;
    } catch (error) {
      console.error('❌ Error fetching empresas:', error);
      throw error;
    }
  }

  async validateCompany(empresaInput) {
    try {
      console.log('🔍 Validando empresa:', empresaInput);
      const empresas = await this.getEmpresas();
      
      const empresa = empresas.find(e => 
        e.id === parseInt(empresaInput) || 
        e.nombre.toLowerCase() === empresaInput.toLowerCase() || 
        e.nit === empresaInput
      );

      if (!empresa) {
        console.log('❌ Empresa no encontrada');
        return { valid: false };
      }

      console.log('✅ Empresa válida:', empresa.nombre);
      return { 
        valid: true, 
        empresa_id: empresa.id, 
        nombre: empresa.nombre 
      };
    } catch (error) {
      console.error('❌ Error validando empresa:', error);
      return { valid: false };
    }
  }

  async login(correo, password, empresaId) {
    try {
      console.log('🔐 Intentando login:', { correo, empresa_id: empresaId });
      
      const response = await apiClient.post('/api/auth/login', {
        correo,
        password,
        empresa_id: parseInt(empresaId)
      });
      
      console.log('📥 Respuesta del login:', response);
      
      if (!response || !response.token || !response.user) {
        console.error('❌ Respuesta de login inválida:', response);
        return {
          success: false,
          message: 'Respuesta del servidor inválida'
        };
      }

      localStorage.setItem('authToken', response.token);
      
      const userSession = {
        currentUser: response.user,
        empresa: response.user.empresa,
        token: response.token,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('userSession', JSON.stringify(userSession));
      
      console.log('✅ Login exitoso, sesión guardada');
      
      return {
        success: true,
        user: response.user,
        token: response.token,
        message: response.message || 'Login exitoso'
      };
      
    } catch (error) {
      console.error('❌ Error durante login:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const message = data?.message;
        
        console.log('🔍 Error response details:', { status, data });
        
        const errorMessages = {
          400: message || 'Datos de login inválidos',
          401: 'Credenciales incorrectas',
          403: 'Usuario inactivo o sin permisos',
          404: 'Usuario no encontrado',
          422: 'Datos de validación incorrectos',
          500: 'Error interno del servidor'
        };
        
        return { 
          success: false, 
          message: errorMessages[status] || message || 'Error al iniciar sesión'
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  getCurrentUser() {
    try {
      const session = this.getSession();
      if (!session || !session.currentUser) {
        throw new Error('No hay sesión activa');
      }
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      console.log('✅ Usuario actual obtenido de sesión:', session.currentUser.id);
      return session.currentUser;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      throw error;
    }
  }

  // ✅ MÉTODO SIMPLIFICADO - Solo validación local
  verifyToken() {
    try {
      console.log('🔍 Verificando token localmente...');
      const session = this.getSession();
      const token = localStorage.getItem('authToken');
      
      if (!session || !token || !session.currentUser) {
        console.log('❌ Token o sesión inválidos');
        return Promise.reject(new Error('Token inválido'));
      }
      
      // Verificar si la sesión no es muy antigua (opcional)
      if (session.loginTime) {
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        // Si la sesión tiene más de 24 horas, considerarla expirada
        if (hoursDiff > 24) {
          console.log('❌ Sesión expirada por tiempo');
          return Promise.reject(new Error('Sesión expirada'));
        }
      }
      
      console.log('✅ Token verificado localmente');
      return Promise.resolve({ 
        valid: true, 
        user: session.currentUser 
      });
    } catch (error) {
      console.error('❌ Error en verificación local:', error);
      return Promise.reject(error);
    }
  }

  async logout() {
    try {
      console.log('🚪 Cerrando sesión...');
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('currentCompany');
      
      console.log('✅ Sesión limpiada');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      throw error;
    }
  }

  getSession() {
    try {
      const sessionStr = localStorage.getItem('userSession');
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch (error) {
      console.error('❌ Error parsing session:', error);
      return null;
    }
  }

  isAuthenticated() {
    try {
      const session = this.getSession();
      const token = localStorage.getItem('authToken');
      const isAuth = session && session.isAuthenticated && !!token && !!session.currentUser;
      
      console.log('🔍 Check authentication:', {
        hasSession: !!session,
        sessionAuth: session?.isAuthenticated,
        hasToken: !!token,
        hasUser: !!session?.currentUser,
        result: isAuth
      });
      
      return isAuth;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  }

  hasRole(role) {
    try {
      const session = this.getSession();
      return session && session.currentUser && session.currentUser.rol === role;
    } catch (error) {
      console.error('❌ Error checking role:', error);
      return false;
    }
  }

  canEdit() {
    try {
      const session = this.getSession();
      if (!session || !session.currentUser) return false;
      
      const user = session.currentUser;
      return user.rol === 'admin' || user.puede_editar;
    } catch (error) {
      console.error('❌ Error checking edit permission:', error);
      return false;
    }
  }
}

export const authService = new AuthService();