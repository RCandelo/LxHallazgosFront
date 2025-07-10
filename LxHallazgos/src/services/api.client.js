import axios from 'axios';
import { config, isDevelopment } from '../config/environment';
import { showError } from '../utils/NotificationManager';

// ✅ VALIDACIÓN DE CONFIGURACIÓN PARA VITE
if (!config.api.baseURL) {
  console.error('❌ VITE_API_BASE_URL no está configurada');
  throw new Error('API URL no configurada');
}

export const apiClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ Variable para controlar notificaciones automáticas
let autoNotifications = config.features.enableNotifications;

export const setAutoNotifications = (enabled) => {
  autoNotifications = enabled;
};

export const getApiConfig = () => ({ ...config.api });

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    // Solo mostrar logs en desarrollo
    if (isDevelopment()) {
      console.log('🔑 Request interceptor:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        baseURL: config.baseURL,
        hasToken: !!token
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ AGREGAR HEADERS SEGÚN AMBIENTE
    if (!isDevelopment()) {
      config.headers['X-Environment'] = 'production';
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    // Solo logs en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response interceptor:', {
        status: response.status,
        url: response.config.url
      });
    }
    
    return response.data;
  },
  (error) => {
    const errorDetails = {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message,
    };

    console.error('❌ Response interceptor error:', errorDetails);

    // ✅ MOSTRAR NOTIFICACIONES DE ERROR AUTOMÁTICAMENTE
    if (autoNotifications && error.response?.status) {
      const status = error.response.status;
      const message = error.response.data?.message;
      
      // Solo mostrar notificaciones para ciertos errores
      if (status === 401) {
        showError('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (status === 403) {
        showError('No tiene permisos para realizar esta acción');
      } else if (status === 500) {
        showError('Error interno del servidor. Contacte al administrador.');
      } else if (status >= 400 && status < 500 && message) {
        showError(message);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('currentCompany');
      
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000); // Dar tiempo a que se muestre la notificación
      }
    }

    const apiError = {
      response: {
        status: error.response?.status,
        data: error.response?.data
      },
      message: error.response?.data?.message || error.message
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;