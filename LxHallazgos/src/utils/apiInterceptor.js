import { apiClient } from '../services/api.client';
import { authService } from '../services/auth.service';

let isRefreshing = false;
let refreshSubscribers = [];

// Suscribir callbacks mientras se refresca el token
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

// Notificar a todos los suscriptores cuando el token se refresca
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// Interceptor para manejar tokens expirados
export const setupApiInterceptor = () => {
  // Interceptor de respuesta para manejar 401
  const originalRequest = apiClient.request.bind(apiClient);
  
  apiClient.request = async function(endpoint, options = {}) {
    try {
      const response = await originalRequest(endpoint, options);
      return response;
    } catch (error) {
      if (error.status === 401 && !options._retry) {
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            const refreshResponse = await authService.refreshToken();
            const newToken = refreshResponse.token;
            
            isRefreshing = false;
            onTokenRefreshed(newToken);
            
            // Reintentar la petición original con el nuevo token
            options._retry = true;
            return originalRequest(endpoint, options);
          } catch (refreshError) {
            isRefreshing = false;
            // El refresh falló, redirigir a login
            localStorage.clear();
            window.location.href = '/login';
            throw refreshError;
          }
        }
        
        // Esperar a que el token se refresque
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            options._retry = true;
            resolve(originalRequest(endpoint, options));
          });
        });
      }
      
      throw error;
    }
  };
};
