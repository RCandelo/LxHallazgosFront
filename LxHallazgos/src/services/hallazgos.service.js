import { apiClient } from './api.client';
import { authService } from './auth.service';
import { showSuccess, showError, showInfo, showWarning } from '../utils/NotificationManager';

class HallazgosService {
  async getHallazgos(filters = {}) {
    try {
      console.log('Fetching hallazgos with filters:', filters);
      
      // Verificar que estamos autenticados
      if (!authService.isAuthenticated()) {
        throw new Error('Usuario no autenticado');
      }

      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.evaluador) queryParams.append('evaluador', filters.evaluador);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.year) queryParams.append('year', filters.year);
      
      const url = `/api/hallazgos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Request URL:', url);
      
      const response = await apiClient.get(url);
      
      return Array.isArray(response) ? response : [];
    } catch (error) {
      // Manejo específico de errores
      if (error.response?.status === 401) {
        authService.logout();
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response?.status === 403) {
        throw new Error('No tiene permisos para acceder a esta información');
      } else if (error.response?.status === 500) {
        throw new Error('Error del servidor. Contacte al administrador.');
      } else if (error.message.includes('Network Error')) {
        throw new Error('Error de conexión. Verifique su conexión a internet.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Error al obtener hallazgos');
      }
    }
  }

  // ✅ FUNCIÓN FALTANTE: getEvaluadores
  async getEvaluadores() {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Usuario no autenticado');
      }

      const response = await apiClient.get('/api/hallazgos/evaluadores');
      
      return Array.isArray(response) ? response : [];
    } catch (error) { 
      if (error.response?.status === 401) {
        authService.logout();
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener evaluadores');
    }
  }

  async createHallazgo(data) {
    try {
      // Validar datos requeridos
      if (!data.proyecto || !data.evaluador) {
        throw new Error('Proyecto y evaluador son campos obligatorios');
      }

      const response = await apiClient.post('/api/hallazgos', data);
      showSuccess('Hallazgo creado exitosamente');
    
    return response;
      } catch (error) {
        if (!error.response) {
          showError('Error de conexión. Verifique su internet.');
        }
        throw error;
      }
  }

  async updateHallazgo(id, data) {
    try {
      if (!id) {
        throw new Error('ID del hallazgo es requerido');
      }

      const response = await apiClient.put(`/api/hallazgos/${id}`, data);
      showSuccess('Hallazgo actualizado exitosamente');
    
      return response;
    } catch (error) {
      throw error;
    }
  }

  async closeHallazgo(id, comentario_cierre) {
    try {
      console.log('Closing hallazgo:', { id, comentario_length: comentario_cierre?.length });
      
      if (!comentario_cierre || comentario_cierre.trim().length < 10) {
        throw new Error('El comentario de cierre debe tener al menos 10 caracteres');
      }

      const response = await apiClient.put(`/api/hallazgos/${id}/close`, { 
        comentario_cierre: comentario_cierre.trim() 
      });
      
      showSuccess('Hallazgo cerrado exitosamente');
    
      return response;
    } catch (error) {
      throw error;
    }
  }

  // ✅ FUNCIÓN CORREGIDA: reopenHallazgo con motivo
  async reopenHallazgo(id, motivo_reapertura) {
    try {
      console.log('Reopening hallazgo:', { id, motivo_length: motivo_reapertura?.length });
      
      if (!motivo_reapertura || motivo_reapertura.trim().length < 10) {
        throw new Error('El motivo de reapertura debe tener al menos 10 caracteres');
      }

      const response = await apiClient.put(`/api/hallazgos/${id}/reopen`, {
        motivo_reapertura: motivo_reapertura.trim()
      });
      
       showSuccess('Hallazgo reabierto exitosamente');
    
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteHallazgo(id) {
    try {
      console.log('Deleting hallazgo:', id);
      
      if (!id) {
        throw new Error('ID del hallazgo es requerido');
      }

      const response = await apiClient.delete(`/api/hallazgos/${id}`);
      showSuccess('Hallazgo eliminado exitosamente');
    
      return response;
    } catch (error) {
      throw error;
    }
  }

  async uploadHallazgosFile(formData) {
    try {
      console.log('Uploading hallazgos file...');
      if (!formData) {
        showError('Archivo es requerido');
        throw new Error('Archivo es requerido');
      }

      // ✅ NOTIFICACIÓN DE INICIO (opcional)
      showInfo('Subiendo archivo...', 2000);

      const response = await apiClient.post('/api/hallazgos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('File uploaded:', response);
      
      // ✅ NOTIFICACIÓN DE ÉXITO
      showSuccess(
        response.message || 'Archivo cargado exitosamente', 
        4000
      );
      
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // ✅ NOTIFICACIONES ESPECÍFICAS POR TIPO DE ERROR
      if (error.response?.status === 401) {
        showError('Sesión expirada. Por favor inicie sesión nuevamente.');
        authService.logout();
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Archivo inválido o datos incorrectos';
        showError(errorMsg);
        throw new Error(errorMsg);
      } else if (error.response?.status === 413) {
        showError('El archivo es demasiado grande. Máximo 5MB permitido.');
        throw new Error('Archivo demasiado grande');
      } else if (error.response?.status === 415) {
        showError('Tipo de archivo no permitido. Solo CSV y Excel son válidos.');
        throw new Error('Tipo de archivo no válido');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error al cargar archivo';
        showError(errorMsg);
        throw new Error(errorMsg);
      }
    }}

  // ✅ FUNCIÓN ADICIONAL: getEstadisticas
  async getEstadisticas() {
    try {
      console.log('Fetching estadisticas...');
      
      if (!authService.isAuthenticated()) {
        throw new Error('Usuario no autenticado');
      }

      const response = await apiClient.get('/api/hallazgos/estadisticas');
      console.log('Estadisticas response:', response);
      
      return response || {
        total: 0,
        pendientes: 0,
        en_proceso: 0,
        cerrados: 0
      };
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
      
      if (error.response?.status === 401) {
        authService.logout();
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      
      // Retornar datos por defecto si hay error
      return {
        total: 0,
        pendientes: 0,
        en_proceso: 0,
        cerrados: 0
      };
    }
  }

  // ✅ FUNCIÓN ADICIONAL: closeAllHallazgos (para admin)
  async closeAllHallazgos(payload) {
    try {
      console.log('Closing all hallazgos:', payload);
      
      if (!payload.comentario_cierre || payload.comentario_cierre.trim().length < 10) {
        throw new Error('El comentario de cierre debe tener al menos 10 caracteres');
      }

      const response = await apiClient.put('/api/hallazgos/close-all', payload);
      console.log('All hallazgos closed:', response);
      
      return response;
    } catch (error) {
      console.error('Error closing all hallazgos:', error);
      
      if (error.response?.status === 401) {
        authService.logout();
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al cerrar todos los hallazgos');
    }
  }
  // Agregar esta función al servicio:
  async downloadTemplate() {
    try {
      console.log('📥 Descargando plantilla de hallazgos...');
      
      const response = await apiClient.get('/api/hallazgos/plantilla', {
        responseType: 'blob' // Importante para archivos
      });
      
      // Crear blob y descargar
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_hallazgos.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Plantilla descargada exitosamente');
    
      return { success: true };
    } catch (error) {
      console.error('❌ Error descargando plantilla:', error);
      
      // ✅ NOTIFICACIÓN DE ERROR
      showError('Error al descargar la plantilla');
      
      throw new Error('Error al descargar la plantilla');
    }
  }
}



export const hallazgosService = new HallazgosService();