import { hallazgosService } from '../services/hallazgos.service';
import { usersService } from '../services/users.service';

class HallazgosModel {
  constructor(authModel) {
    this.auth = authModel;
    this.hallazgosCache = [];
    this.usersCache = [];
    this.lastFetchTime = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  async getHallazgos(filters = {}) {
    try {
      const currentUser = this.auth.currentUser;
      if (!this.auth.isAuthenticated || !currentUser) {
        return [];
      }

      // Aplicar filtros según permisos del usuario
      // La API ya debería devolver solo los hallazgos que el usuario puede ver
      const apiFilters = {
        ...filters,
        empresa_id: currentUser.empresa_id
      };

      const hallazgos = await hallazgosService.getHallazgos(apiFilters);
      this.hallazgosCache = hallazgos;
      this.lastFetchTime = Date.now();
      
      return hallazgos;
    } catch (error) {
      console.error('Error fetching hallazgos:', error);
      return this.hallazgosCache || [];
    }
  }

  async getUsers() {
    try {
      const currentUser = this.auth.currentUser;
      if (!this.auth.isAuthenticated || !currentUser) {
        return [];
      }

      // La API debe filtrar usuarios según los permisos
      const filters = {
        empresa_id: currentUser.empresa_id
      };

      const users = await usersService.getUsers(filters);
      this.usersCache = users;
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return this.usersCache || [];
    }
  }

  async createHallazgo(hallazgoData) {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const dataToSend = {
        ...hallazgoData,
        usuario_id: currentUser.id,
        empresa_id: currentUser.empresa_id,
        estado: 'pendiente',
        fecha_creacion: new Date().toISOString()
      };

      const newHallazgo = await hallazgosService.createHallazgo(dataToSend);
      
      // Actualizar caché
      if (this.hallazgosCache) {
        this.hallazgosCache.unshift(newHallazgo);
      }
      
      return newHallazgo;
    } catch (error) {
      console.error('Error creating hallazgo:', error);
      throw error;
    }
  }

  async updateHallazgo(id, hallazgoData) {
    try {
      const updatedHallazgo = await hallazgosService.updateHallazgo(id, hallazgoData);
      
      // Actualizar caché
      if (this.hallazgosCache) {
        const index = this.hallazgosCache.findIndex(h => h.id === id);
        if (index !== -1) {
          this.hallazgosCache[index] = updatedHallazgo;
        }
      }
      
      return updatedHallazgo;
    } catch (error) {
      console.error('Error updating hallazgo:', error);
      throw error;
    }
  }

  async cerrarHallazgo(hallazgoId) {
    try {
      const closedHallazgo = await hallazgosService.closeHallazgo(hallazgoId);
      
      // Actualizar caché
      if (this.hallazgosCache) {
        const index = this.hallazgosCache.findIndex(h => h.id === hallazgoId);
        if (index !== -1) {
          this.hallazgosCache[index] = closedHallazgo;
        }
      }
      
      return closedHallazgo;
    } catch (error) {
      console.error('Error closing hallazgo:', error);
      throw error;
    }
  }

  async uploadHallazgosFromFile(file) {
    try {
      const result = await hallazgosService.uploadHallazgosFile(file);
      
      // Refrescar caché después de la carga
      await this.getHallazgos();
      
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Métodos de gestión de usuarios
  async createUser(userData) {
    try {
      const currentUser = this.auth.currentUser;
      const dataToSend = {
        ...userData,
        empresa_id: currentUser.empresa_id
      };

      const newUser = await usersService.createUser(dataToSend);
      
      // Actualizar caché
      if (this.usersCache) {
        this.usersCache.push(newUser);
      }
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const updatedUser = await usersService.updateUser(userId, userData);
      
      // Actualizar caché
      if (this.usersCache) {
        const index = this.usersCache.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.usersCache[index] = updatedUser;
        }
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      await usersService.deleteUser(userId);
      
      // Actualizar caché
      if (this.usersCache) {
        this.usersCache = this.usersCache.filter(u => u.id !== userId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Método para limpiar caché
  clearCache() {
    this.hallazgosCache = [];
    this.usersCache = [];
    this.lastFetchTime = null;
  }

  // Verificar si el caché está vigente
  isCacheValid() {
    if (!this.lastFetchTime) return false;
    return (Date.now() - this.lastFetchTime) < this.cacheTimeout;
  }
}

export default HallazgosModel;