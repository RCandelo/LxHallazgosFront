export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const errorHandler = {
  // Manejar errores de respuesta API
  handleApiError(error) {
    if (error.status === 401) {
      // No autorizado - sesión expirada
      return new ApiError('Sesión expirada. Por favor inicie sesión nuevamente.', 401, 'UNAUTHORIZED');
    }
    
    if (error.status === 403) {
      // Prohibido - sin permisos
      return new ApiError('No tiene permisos para realizar esta acción.', 403, 'FORBIDDEN');
    }
    
    if (error.status === 404) {
      // No encontrado
      return new ApiError('Recurso no encontrado.', 404, 'NOT_FOUND');
    }
    
    if (error.status === 422) {
      // Error de validación
      return new ApiError('Error de validación. Verifique los datos ingresados.', 422, 'VALIDATION_ERROR');
    }
    
    if (error.status === 500) {
      // Error del servidor
      return new ApiError('Error interno del servidor. Por favor intente más tarde.', 500, 'SERVER_ERROR');
    }
    
    // Error genérico
    return new ApiError(error.message || 'Error desconocido', error.status || 0, 'UNKNOWN_ERROR');
  },

  // Manejar errores de red
  handleNetworkError(error) {
    if (!navigator.onLine) {
      return new ApiError('Sin conexión a internet.', 0, 'NETWORK_OFFLINE');
    }
    
    if (error.message === 'Network request failed') {
      return new ApiError('Error de conexión. Verifique su conexión a internet.', 0, 'NETWORK_FAILED');
    }
    
    return new ApiError('Error de red.', 0, 'NETWORK_ERROR');
  },

  // Formatear mensaje de error para el usuario
  getUserMessage(error) {
    if (error instanceof ApiError) {
      return error.message;
    }
    
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Ha ocurrido un error inesperado.';
  }
};

