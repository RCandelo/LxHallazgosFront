import { authService } from '../services/auth.service';

const MODO_DESARROLLO = false; // ⚠️ CAMBIAR A false para usar validación real

class AuthModel {
  constructor() {
    this.currentUser = null;
    this.currentCompany = null;
    this.isAuthenticated = false;
    this.authToken = null;
    this.loadingSession = false;
  }

  async loadPersistedSession() {
    if (this.loadingSession) return; // Evitar múltiples cargas simultáneas
    
    try {
      this.loadingSession = true;
      console.log('🔄 Cargando sesión persistida...');
      
      const token = localStorage.getItem('authToken');
      const savedCompany = localStorage.getItem('currentCompany');
      const userSession = localStorage.getItem('userSession');

      console.log('🔍 Datos encontrados:', {
        hasToken: !!token,
        hasCompany: !!savedCompany,
        hasSession: !!userSession
      });

      if (token && userSession) {
        this.authToken = token;
        
        if (savedCompany) {
          try {
            this.currentCompany = JSON.parse(savedCompany);
          } catch {
            this.currentCompany = { nombre: savedCompany };
          }
        }

        if (MODO_DESARROLLO) {
          console.log('🧪 Modo desarrollo: cargando sesión local');
          const parsedSession = JSON.parse(userSession);
          this.currentUser = parsedSession.currentUser;
          this.isAuthenticated = true;
          return;
        }

        // Modo producción: validar token con el backend
        try {
          console.log('🔐 Modo producción: verificando token...');
          const verifyResponse = await authService.verifyToken();
          
          if (verifyResponse && verifyResponse.user) {
            console.log('✅ Token válido, sesión restaurada');
            this.currentUser = verifyResponse.user;
            this.isAuthenticated = true;
            return;
          }
        } catch (error) {
          console.log('❌ Token inválido o expirado:', error.message);
        }
      }
      this.clearSession();
    } catch (error) {
      this.clearSession();
    } finally {
      this.loadingSession = false;
    }
  }

  saveSession() {
    if (this.isAuthenticated && this.currentUser && this.currentCompany) {
      localStorage.setItem('currentCompany', JSON.stringify(this.currentCompany));
    }
  }

  clearSession() {
    console.log('🧹 Limpiando sesión completa...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentCompany');
    localStorage.removeItem('userSession');
    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentCompany = null;
    this.authToken = null;  
  }

  async validateCompany(companyName) {
    console.log('🏢 Validando empresa:', companyName);
    try {
      const response = await authService.validateCompany(companyName);

      if (response.valid && response.empresa_id) {
        this.currentCompany = {
          id: response.empresa_id,
          nombre: response.nombre
        };
        localStorage.setItem('currentCompany', JSON.stringify(this.currentCompany));
        console.log('✅ Empresa válida y guardada:', this.currentCompany);
        return true;
      }

      console.log('❌ Empresa no válida');
      return false;
    } catch (error) {
      console.error('❌ Error validando empresa:', error);
      return false;
    }
  }

  async login(username, password) {
    try {
      const empresaId = this.currentCompany?.id;
      
      console.log('🔐 Iniciando login:', { username, empresaId });
      
      if (!empresaId) {
        console.error('❌ No hay empresa seleccionada');
        return { success: false, error: 'Debe seleccionar una empresa primero' };
      }

      const response = await authService.login(username, password, empresaId);
      console.log('📥 Respuesta de login:', response);

      if (response.success && response.user && response.token) {
        this.isAuthenticated = true;
        this.currentUser = response.user;
        this.authToken = response.token;

        this.saveSession();
        console.log('✅ Login exitoso, estado actualizado');

        return { success: true };
      }
      
      console.log('❌ Login fallido:', response.message);
      return { 
        success: false, 
        error: response.message || 'Error al iniciar sesión' 
      };
    } catch (error) {
      console.error('❌ Error durante login:', error);
      return { 
        success: false, 
        error: error.message || 'Error al conectar con el servidor' 
      };
    }
  }

  async logout() {
    try {
      console.log('🚪 Ejecutando logout...');
      await authService.logout();
    } finally {
      this.clearSession();
    }
  }

  async refreshUserPermissions() {
    try {
      console.log('🔄 Actualizando permisos de usuario...');
      const user = await authService.getCurrentUser();
      if (user) {
        this.currentUser = user;
        console.log('✅ Permisos actualizados');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error actualizando permisos:', error);
      return false;
    }
  }

  getState() {
    return {
      isAuthenticated: this.isAuthenticated,
      currentUser: this.currentUser,
      currentCompany: this.currentCompany,
      authToken: this.authToken,
    };
  }
}

export default AuthModel;