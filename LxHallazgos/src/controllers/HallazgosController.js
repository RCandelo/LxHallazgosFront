// controllers/HallazgosController.js
import HallazgosModel from '../models/HallazgosModel.js';

class HallazgosController {
  /**
   * @param {HallazgosModel} hallazgosModel - An instance of HallazgosModel to interact with the data layer.
   */
  constructor(hallazgosModel) {
    if (!(hallazgosModel instanceof HallazgosModel)) {
      throw new Error('HallazgosController requires an instance of HallazgosModel');
    }   
    this.model = hallazgosModel;
    this.listeners = [];
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  async loadHallazgos(userId) {
    const hallazgos = await this.model.getHallazgos(userId);
    this.notifyListeners();
    return hallazgos;
  }

  async cerrarHallazgo(hallazgoId, comentarioCierre, currentUser) {
    try {
      // Validar que el comentario no esté vacío
      if (!comentarioCierre || comentarioCierre.trim().length < 10) {
        throw new Error('El comentario de cierre debe tener al menos 10 caracteres');
      }

      const updateData = {
        estado: 'cerrado',
        comentario_cierre: comentarioCierre,
        fecha_cierre: new Date().toISOString(),
        cerrado_por: currentUser.id
      };

      const result = await this.model.updateHallazgo(hallazgoId, updateData);
      if (result) {
        this.notifyListeners();
      }
      return result;
    } catch (error) {
      console.error('Error al cerrar hallazgo:', error);
      throw error;
    }
  }

  async reabrirHallazgo(hallazgoId, currentUser) {
    try {
      const hallazgo = await this.model.getHallazgoById(hallazgoId);
      
      // Verificar permisos
      if (!this.canUserReopenHallazgo(currentUser, hallazgo)) {
        throw new Error('No tiene permisos para reabrir este hallazgo');
      }

      const updateData = {
        estado: 'pendiente',
        fecha_reapertura: new Date().toISOString(),
        reabierto_por: currentUser.id
      };

      const result = await this.model.updateHallazgo(hallazgoId, updateData);
      if (result) {
        this.notifyListeners();
      }
      return result;
    } catch (error) {
      console.error('Error al reabrir hallazgo:', error);
      throw error;
    }
  }

  async updateHallazgo(hallazgoId, hallazgoData, currentUser) {
    try {
      const hallazgo = await this.model.getHallazgoById(hallazgoId);
      
      // Verificar permisos
      if (!this.canUserEditHallazgo(currentUser, hallazgo)) {
        throw new Error('No tiene permisos para editar este hallazgo');
      }

      const updateData = {
        ...hallazgoData,
        fecha_modificacion: new Date().toISOString(),
        modificado_por: currentUser.id
      };

      const result = await this.model.updateHallazgo(hallazgoId, updateData);
      if (result) {
        this.notifyListeners();
      }
      return result;
    } catch (error) {
      console.error('Error al actualizar hallazgo:', error);
      throw error;
    }
  }

  async createHallazgo(hallazgoData) {
    try {
      const result = await this.model.createHallazgo(hallazgoData);
      if (result) {
        this.notifyListeners();
      }
      return result;
    } catch (error) {
      console.error('Error en controller al crear hallazgo:', error);
      throw error;
    }
  }

  async uploadHallazgos(file, currentUser) {
    try {
      const result = await this.model.uploadHallazgosFromFile(file, currentUser);
      if (result) {
        this.notifyListeners();
      }
      return result;
    } catch (error) {
      console.error('Error en controller al cargar archivo:', error);
      throw error;
    }
  }

  updateFilters(filters) {
    this.model.setFilters(filters);
    this.notifyListeners();
  }

  getHallazgos() {
    return this.model.getFilteredHallazgos();
  }

  // Métodos de administración de usuarios
  async getUsers(empresaId) {
    return await this.model.getUsers(empresaId);
  }

  async createUser(userData) {
    try {
      const result = await this.model.createUser(userData);
      return result;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const result = await this.model.updateUser(userId, userData);
      return result;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const result = await this.model.deleteUser(userId);
      return result;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Verificar permisos
  canUserManage(user) {
    return user.rol === 'admin';
  }

  canUserCreateHallazgos(user) {
    return user.rol === 'admin' || user.rol === 'editor';
  }

  canUserEditHallazgo(user, hallazgo) {
    // Admin puede editar todo
    if (user.rol === 'admin') return true;
    
    // Usuario con permiso puede_editar puede editar sus propios hallazgos abiertos
    if (user.puede_editar && hallazgo.usuario_id === user.id && hallazgo.estado !== 'cerrado') {
      return true;
    }
    
    return false;
  }

  canUserReopenHallazgo(user, hallazgo) {
    // Admin puede reabrir cualquier hallazgo
    if (user.rol === 'admin') return true;
    
    // El usuario puede reabrir hallazgos que él mismo cerró
    if (hallazgo.cerrado_por === user.id || hallazgo.usuario_id === user.id) {
      return true;
    }
    
    return false;
  }
}

export default HallazgosController;