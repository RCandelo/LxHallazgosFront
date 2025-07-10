// services/mockApi.service.js
import MockDatabase from '../models/MockDatabase';

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simular respuestas de API
class MockApiService {
  constructor() {
    this.token = null;
    this.currentUser = null;
  }

  // Generar token fake
  generateToken(userId) {
    return `mock-jwt-token-${userId}-${Date.now()}`;
  }

  // Auth endpoints
  async validateCompany(companyName) {
    await delay(300);
    
    // Simular validación de empresa
    const validCompanies = ['empresa1', 'empresa2', 'empresa3'];
    const isValid = validCompanies.includes(companyName.toLowerCase());
    
    return {
      valid: isValid,
      message: isValid ? 'Empresa válida' : 'Empresa no encontrada'
    };
  }

  async login(username, password, company) {
    await delay(500);
    
    // Buscar usuario en MockDatabase
    const user = MockDatabase.findUserByCredentials(username, password, company);
    
    if (!user) {
      throw {
        status: 401,
        message: 'Credenciales inválidas'
      };
    }

    // Generar token
    this.token = this.generateToken(user.id);
    this.currentUser = user;
    
    // Simular respuesta de login con estructura real
    return {
      success: true,
      token: this.token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        empresa_id: user.empresa_id,
        empresa: {
          id: user.empresa_id,
          nombre: user.company,
          ruc: `20${user.empresa_id}23456789`
        },
        permisos: this.getPermisosForRole(user.rol),
        ultimo_acceso: new Date().toISOString(),
        activo: true
      }
    };
  }

  async logout() {
    await delay(200);
    this.token = null;
    this.currentUser = null;
    return { success: true };
  }

  async getCurrentUser() {
    await delay(200);
    
    if (!this.token) {
      throw {
        status: 401,
        message: 'No autorizado'
      };
    }

    // Obtener usuario del token simulado
    const userId = parseInt(this.token.split('-')[3]);
    const user = MockDatabase.users.find(u => u.id === userId);
    
    if (!user) {
      throw {
        status: 401,
        message: 'Usuario no encontrado'
      };
    }

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        empresa_id: user.empresa_id,
        empresa: {
          id: user.empresa_id,
          nombre: user.company
        },
        permisos: this.getPermisosForRole(user.rol)
      }
    };
  }

  async refreshToken() {
    await delay(300);
    
    if (!this.token) {
      throw {
        status: 401,
        message: 'No autorizado'
      };
    }

    // Generar nuevo token
    const userId = parseInt(this.token.split('-')[3]);
    this.token = this.generateToken(userId);
    
    return {
      success: true,
      token: this.token
    };
  }

  // Hallazgos endpoints
  async getHallazgos(filters = {}) {
    await delay(400);
    
    if (!this.token) {
      throw {
        status: 401,
        message: 'No autorizado'
      };
    }

    // Obtener usuario actual
    const userId = parseInt(this.token.split('-')[3]);
    const user = MockDatabase.users.find(u => u.id === userId);
    
    let hallazgos = MockDatabase.hallazgos;

    // Filtrar por empresa
    if (filters.empresa_id) {
      hallazgos = hallazgos.filter(h => h.empresa_id === filters.empresa_id);
    }

    // Filtrar según permisos
    const permisos = this.getPermisosForRole(user.rol);
    if (!permisos.puede_ver_todos_hallazgos) {
      hallazgos = hallazgos.filter(h => h.usuario_id === user.id);
    }

    // Mapear a estructura de API
    const mappedHallazgos = hallazgos.map(h => ({
      id: h.id,
      evaluador: h.evaluador,
      evaluador_id: h.usuario_id,
      fecha_inspeccion: h.fecha_inspeccion ? `${h.fecha_inspeccion}T10:00:00Z` : null,
      fecha_creacion: h.fecha ? new Date(h.fecha).toISOString() : new Date().toISOString(),
      tipo: h.tipo,
      zona: h.zona,
      departamento: h.departamento,
      actividad: h.actividad,
      resultado: h.resultado,
      estado: h.estado,
      proyecto: h.proyecto,
      jt: h.jt,
      bloque: h.bloque,
      observaciones: h.observaciones,
      descripcion: h.descripcion,
      usuario_id: h.usuario_id,
      empresa_id: h.empresa_id,
      archivos: [],
      historial: [
        {
          fecha: new Date().toISOString(),
          usuario: h.evaluador,
          accion: 'creado',
          descripcion: 'Hallazgo creado'
        }
      ]
    }));

    return {
      success: true,
      data: mappedHallazgos,
      pagination: {
        page: 1,
        per_page: 20,
        total: mappedHallazgos.length,
        total_pages: Math.ceil(mappedHallazgos.length / 20)
      }
    };
  }

  async getHallazgoById(id) {
    await delay(300);
    
    const hallazgo = MockDatabase.hallazgos.find(h => h.id === id);
    
    if (!hallazgo) {
      throw {
        status: 404,
        message: 'Hallazgo no encontrado'
      };
    }

    return {
      success: true,
      data: {
        ...hallazgo,
        fecha_creacion: new Date().toISOString(),
        archivos: [],
        historial: []
      }
    };
  }

  async createHallazgo(hallazgoData) {
    await delay(500);
    
    if (!this.token) {
      throw {
        status: 401,
        message: 'No autorizado'
      };
    }

    // Validaciones
    if (!hallazgoData.evaluador || !hallazgoData.proyecto) {
      throw {
        status: 422,
        message: 'Error de validación',
        details: {
          evaluador: !hallazgoData.evaluador ? ['El campo evaluador es requerido'] : [],
          proyecto: !hallazgoData.proyecto ? ['El campo proyecto es requerido'] : []
        }
      };
    }

    const userId = parseInt(this.token.split('-')[3]);
    const newHallazgo = MockDatabase.createHallazgo({
      ...hallazgoData,
      usuario_id: userId
    });

    return {
      success: true,
      message: 'Hallazgo creado exitosamente',
      data: {
        ...newHallazgo,
        fecha_creacion: new Date().toISOString()
      }
    };
  }

  async updateHallazgo(id, hallazgoData) {
    await delay(400);
    
    const updated = MockDatabase.updateHallazgo(id, hallazgoData);
    
    if (!updated) {
      throw {
        status: 404,
        message: 'Hallazgo no encontrado'
      };
    }

    return {
      success: true,
      data: updated
    };
  }

  async closeHallazgo(id) {
    await delay(400);
    
    const success = MockDatabase.updateHallazgoEstado(id, 'cerrado');
    
    if (!success) {
      throw {
        status: 404,
        message: 'Hallazgo no encontrado'
      };
    }

    const userId = parseInt(this.token.split('-')[3]);
    const user = MockDatabase.users.find(u => u.id === userId);

    return {
      success: true,
      message: 'Hallazgo cerrado exitosamente',
      data: {
        id: id,
        estado: 'cerrado',
        fecha_cierre: new Date().toISOString(),
        cerrado_por: {
          id: user.id,
          nombre: user.nombre
        }
      }
    };
  }

  async deleteHallazgo(id) {
    await delay(400);
    
    const index = MockDatabase.hallazgos.findIndex(h => h.id === id);
    
    if (index === -1) {
      throw {
        status: 404,
        message: 'Hallazgo no encontrado'
      };
    }

    MockDatabase.hallazgos.splice(index, 1);
    
    return {
      success: true,
      message: 'Hallazgo eliminado exitosamente'
    };
  }

  async uploadHallazgosFile(file) {
    await delay(1500); // Simular procesamiento de archivo
    
    return {
      success: true,
      message: 'Archivo procesado exitosamente',
      data: {
        processed: 5,
        created: 4,
        updated: 1,
        errors: 0,
        details: [
          { row: 1, status: 'created', id: `h-${Date.now()}-1` },
          { row: 2, status: 'created', id: `h-${Date.now()}-2` },
          { row: 3, status: 'created', id: `h-${Date.now()}-3` },
          { row: 4, status: 'created', id: `h-${Date.now()}-4` },
          { row: 5, status: 'updated', id: MockDatabase.hallazgos[0]?.id }
        ]
      }
    };
  }

  // Users endpoints
  async getUsers(filters = {}) {
    await delay(300);
    
    let users = MockDatabase.users;
    
    if (filters.empresa_id) {
      users = users.filter(u => u.empresa_id === filters.empresa_id);
    }

    const mappedUsers = users.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      empresa_id: u.empresa_id,
      activo: true,
      ultimo_acceso: new Date().toISOString(),
      permisos: this.getPermisosForRole(u.rol)
    }));

    return {
      success: true,
      data: mappedUsers
    };
  }

  async createUser(userData) {
    await delay(500);
    
    const newId = MockDatabase.users.length + 1;
    const newUser = {
      id: newId,
      ...userData,
      password: '1234' // En producción nunca haríamos esto
    };

    MockDatabase.users.push(newUser);

    return {
      success: true,
      data: {
        id: newId,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        empresa_id: userData.empresa_id,
        activo: true,
        permisos: this.getPermisosForRole(userData.rol)
      }
    };
  }

  async updateUser(id, userData) {
    await delay(400);
    
    const userIndex = MockDatabase.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw {
        status: 404,
        message: 'Usuario no encontrado'
      };
    }

    MockDatabase.users[userIndex] = {
      ...MockDatabase.users[userIndex],
      ...userData
    };

    return {
      success: true,
      data: {
        ...MockDatabase.users[userIndex],
        permisos: this.getPermisosForRole(MockDatabase.users[userIndex].rol)
      }
    };
  }

  async deleteUser(id) {
    await delay(400);
    
    const index = MockDatabase.users.findIndex(u => u.id === id);
    
    if (index === -1) {
      throw {
        status: 404,
        message: 'Usuario no encontrado'
      };
    }

    MockDatabase.users.splice(index, 1);
    
    return {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };
  }

  // Helper para obtener permisos según rol
  getPermisosForRole(rol) {
    const permisosPorRol = {
      admin: {
        puede_crear_hallazgos: true,
        puede_cerrar_hallazgos: true,
        puede_editar_hallazgos: true,
        puede_ver_todos_hallazgos: true,
        puede_administrar_usuarios: true,
        puede_exportar_datos: true,
        puede_eliminar_hallazgos: true
      },
      editor: {
        puede_crear_hallazgos: true,
        puede_cerrar_hallazgos: true,
        puede_editar_hallazgos: true,
        puede_ver_todos_hallazgos: true,
        puede_administrar_usuarios: false,
        puede_exportar_datos: true,
        puede_eliminar_hallazgos: false
      },
      usuario: {
        puede_crear_hallazgos: false,
        puede_cerrar_hallazgos: true,
        puede_editar_hallazgos: false,
        puede_ver_todos_hallazgos: false,
        puede_administrar_usuarios: false,
        puede_exportar_datos: false,
        puede_eliminar_hallazgos: false
      }
    };

    return permisosPorRol[rol] || permisosPorRol.usuario;
  }
}

// Singleton
export const mockApiService = new MockApiService();