// NotificationManager.js - Sistema global de notificaciones
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.subscribers = [];
    this.nextId = 1;
  }

  // Suscribirse a cambios de notificaciones
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Retornar función para desuscribirse
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notificar a todos los suscriptores
  notify() {
    this.subscribers.forEach(callback => {
      try {
        callback([...this.notifications]);
      } catch (error) {
        console.error('Error en callback de notificación:', error);
      }
    });
  }

  // Agregar notificación
  addNotification(message, type = 'info', duration = 5000, options = {}) {
    const notification = {
      id: this.nextId++,
      message,
      type,
      timestamp: new Date(),
      duration,
      isVisible: true,
      ...options
    };

    console.log('🔔 Agregando notificación:', notification);

    this.notifications.push(notification);
    this.notify();

    // Auto-remover después del duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }

    return notification.id;
  }

  // Remover notificación
  removeNotification(id) {
    console.log('🔕 Removiendo notificación:', id);
    
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notify();
    }
  }

  // Limpiar todas las notificaciones
  clearAll() {
    console.log('🧹 Limpiando todas las notificaciones');
    this.notifications = [];
    this.notify();
  }

  // Métodos de conveniencia
  success(message, duration = 4000, options = {}) {
    return this.addNotification(message, 'success', duration, options);
  }

  error(message, duration = 6000, options = {}) {
    return this.addNotification(message, 'error', duration, options);
  }

  warning(message, duration = 5000, options = {}) {
    return this.addNotification(message, 'warning', duration, options);
  }

  info(message, duration = 4000, options = {}) {
    return this.addNotification(message, 'info', duration, options);
  }

  // Obtener todas las notificaciones
  getNotifications() {
    return [...this.notifications];
  }

  // Verificar si hay notificaciones
  hasNotifications() {
    return this.notifications.length > 0;
  }

  // Obtener cantidad de notificaciones
  getCount() {
    return this.notifications.length;
  }
}

// Crear instancia global
export const notificationManager = new NotificationManager();

// Funciones de conveniencia para uso directo
export const showNotification = (message, type, duration, options) => {
  return notificationManager.addNotification(message, type, duration, options);
};

export const showSuccess = (message, duration, options) => {
  return notificationManager.success(message, duration, options);
};

export const showError = (message, duration, options) => {
  return notificationManager.error(message, duration, options);
};

export const showWarning = (message, duration, options) => {
  return notificationManager.warning(message, duration, options);
};

export const showInfo = (message, duration, options) => {
  return notificationManager.info(message, duration, options);
};

export default notificationManager;