import { apiClient } from './api.client';
import { showSuccess, showError } from '../utils/NotificationManager';

class UsersService {
  // Obtener todos los usuarios
  async getUsers(filters = {}) {
    try {
      console.log('📋 Obteniendo usuarios...', filters);
      const response = await apiClient.get('/api/usuarios', { params: filters });
      console.log('✅ Usuarios obtenidos:', response?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  // Obtener un usuario por ID
  async getUserById(userId) {
    try {
      console.log('👤 Obteniendo usuario:', userId);
      const response = await apiClient.get(`/api/usuarios/${userId}`);
      console.log('✅ Usuario obtenido:', response.correo);
      return response;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw error;
    }
  }

  // Crear nuevo usuario
  async createUser(userData) {
    try {
      console.log('➕ Creando usuario:', userData.correo);
      
      // Validaciones básicas
      if (userData.rol === 'super_admin') {
        throw new Error('No se puede crear usuarios con rol Super Admin desde la interfaz');
      }
      if (!userData.nombre || !userData.apellido || !userData.correo || !userData.password) {
        throw new Error('Todos los campos obligatorios deben ser completados');
      }

      if (userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // ✅ Mapear campos al formato del backend
      const backendData = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.correo,
        password: userData.password,
        rol: userData.rol || 'usuario',
        puede_editar: userData.puede_editar || false,
        zona: userData.zona || null
      };

      const response = await apiClient.post('/api/usuarios', backendData);
      showSuccess(`Usuario ${userData.nombre} creado exitosamente`);
    
    return response;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario existente
  async updateUser(userId, userData) {
     try {
      console.log('📝 Actualizando usuario:', userId, userData.correo);

      if (userData.rol === 'super_admin') {
        throw new Error('No se puede asignar rol Super Admin desde la interfaz');
      }
      if (!userData.nombre || !userData.apellido || !userData.correo) {
        throw new Error('Nombre, apellido y correo son obligatorios');
      }

      // Si se incluye password, validar longitud
      if (userData.password && userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // ✅ Mapear campos al formato del backend
      const backendData = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.correo,
        rol: userData.rol,
        puede_editar: userData.puede_editar,
        estado: userData.activo, // ✅ Mapear activo -> estado
        zona: userData.zona || null
      };

      // Solo incluir password si se proporciona
      if (userData.password) {
        backendData.password = userData.password;
      }

      const response = await apiClient.put(`/api/usuarios/${userId}`, backendData);
      showSuccess(`Usuario ${userData.nombre} actualizado exitosamente`);
    
    return response;
    } catch (error) {
      throw error;
    }
  }

  // ✅ "Eliminar" usuario (en realidad desactiva según tu backend)
  async deleteUser(userId) {
      try {
      console.log('🗑️ Desactivando usuario:', userId);
      
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      const response = await apiClient.delete(`/api/usuarios/${userId}`);
      showSuccess('Usuario desactivado correctamente');
    
    return { success: true, message: 'Usuario desactivado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar perfil del usuario actual
  async updateProfile(userData) {
    try {
      console.log('👤 Actualizando perfil...');
      
      const response = await apiClient.put('/api/usuarios/profile', userData);
      
      // ✅ Actualizar la sesión local con los nuevos datos (tu implementación)
      const sessionStr = localStorage.getItem('userSession');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        session.currentUser = {
          ...session.currentUser,
          ...response
        };
        localStorage.setItem('userSession', JSON.stringify(session));
      }
      
      console.log('✅ Perfil actualizado');
      return response;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('🔒 Cambiando contraseña...');
      
      if (!currentPassword || !newPassword) {
        throw new Error('Contraseña actual y nueva son requeridas');
      }

      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      // ✅ Usar tu estructura de API
      const response = await apiClient.put('/api/usuarios/profile', {
        currentPassword,
        password: newPassword
      });
      
      console.log('✅ Contraseña cambiada');
      return response;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Contraseña actual incorrecta');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Datos inválidos');
      }
      
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  }

  // ✅ Activar/Desactivar usuario (función adicional útil)
  async toggleUserStatus(userId, estado) {
    try {
      console.log('🔄 Cambiando estado usuario:', userId, estado ? 'activar' : 'desactivar');
      
      const response = await apiClient.put(`/api/usuarios/${userId}`, { estado });
      console.log('✅ Estado de usuario cambiado:', response.estado);
      return response;
    } catch (error) {
      console.error('❌ Error changing user status:', error);
      throw new Error(error.message || 'Error al cambiar estado del usuario');
    }
  }
}

export const usersService = new UsersService();