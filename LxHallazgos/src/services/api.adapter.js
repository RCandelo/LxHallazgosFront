import { apiClient } from './api.client';
import { mockApiService } from './mockApi.service';
import { config } from '../config/environment';

class ApiAdapter {
  constructor() {
    this.useMock = !config.useRealAPI;
  }

  async request(method, endpoint, data = null, options = {}) {
    if (this.useMock) {
      return this.handleMockRequest(method, endpoint, data);
    }
    
    // Usar API real
    switch (method) {
      case 'GET':
        return apiClient.get(endpoint, data);
      case 'POST':
        return apiClient.post(endpoint, data);
      case 'PUT':
        return apiClient.put(endpoint, data);
      case 'PATCH':
        return apiClient.patch(endpoint, data);
      case 'DELETE':
        return apiClient.delete(endpoint);
      case 'UPLOAD':
        return apiClient.upload(endpoint, data);
      default:
        throw new Error(`Método no soportado: ${method}`);
    }
  }

  async handleMockRequest(method, endpoint, data) {
    const route = `${method} ${endpoint}`;
    
    try {
      // Auth routes
      if (route === 'GET /api/empresas/public') {
        return mockApiService.getEmpresas();
      }
      
      if (route === 'POST /api/auth/login') {
        return mockApiService.login(data.correo, data.password, data.empresa_id);
      }
      
      if (route === 'POST /api/auth/register') {
        return mockApiService.register(data);
      }
      
      // Hallazgos routes
      if (route.startsWith('GET /api/hallazgos')) {

        return mockApiService.getHallazgos(data);
      }
      
      if (route.match(/^GET \/hallazgos\/(.+)$/)) {
        const id = endpoint.split('/api')[2];
        return mockApiService.getHallazgoById(id);
      }
      
      if (route === 'GET /api/hallazgos/evaluadores') {
        return mockApiService.getEvaluadores();
      }
      
      if (route === 'POST /api/hallazgos') {
        return mockApiService.createHallazgo(data);
      }
      
      if (route.match(/^PUT \/hallazgos\/(.+)$/)) {
        const id = endpoint.split('/api')[2];
        return mockApiService.updateHallazgo(id, data);
      }
      
      if (route.match(/^PATCH \/hallazgos\/(.+)\/cerrar$/)) {
        const id = endpoint.split('/api')[2];
        return mockApiService.closeHallazgo(id, data.comentario_cierre);
      }
      
      if (route.match(/^PATCH \/hallazgos\/(.+)\/reabrir$/)) {
        const id = endpoint.split('/api/')[2];
        return mockApiService.reopenHallazgo(id);
      }
      
      if (route.match(/^DELETE \/hallazgos\/(.+)$/)) {
        const id = endpoint.split('/api')[2];
        return mockApiService.deleteHallazgo(id);
      }
      
      if (route === 'UPLOAD /api/hallazgos/upload') {
        return mockApiService.uploadHallazgosFile(data);
      }
      
      // Users routes
      if (route === 'GET /api/usuarios') {
        return mockApiService.getUsers(data);
      }
      
      if (route === 'POST /api/usuarios') {
        return mockApiService.createUser(data);
      }
      
      if (route.match(/^PUT \/usuarios\/(.+)$/)) {
        const id = endpoint.split('/api')[2];
        
        if (id === 'profile') {
          return mockApiService.updateProfile(data);
        }
        
        return mockApiService.updateUser(parseInt(id), data);
      }
      
      if (route.match(/^DELETE \/usuarios\/(.+)$/)) {
        const id = parseInt(endpoint.split('/api')[2]);
        return mockApiService.deleteUser(id);
      }
      
      // Empresas routes
      if (route === 'GET /api/empresas/current') {
        return mockApiService.getCurrentEmpresa();
      }
      
      throw new Error(`Ruta no implementada en mock: ${route}`);
      
    } catch (error) {
      if (error.status) {
        throw error;
      }
      
      throw {
        status: 500,
        message: error.message || 'Error interno del servidor'
      };
    }
  }
}

export const apiAdapter = new ApiAdapter();