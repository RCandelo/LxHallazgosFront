import { useState, useEffect, useCallback } from 'react';
import { notificationManager } from '../utils/NotificationManager';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Suscribirse al manager cuando el componente se monta
  useEffect(() => {
    console.log('🔗 Suscribiendo al NotificationManager');
    
    // Obtener notificaciones iniciales
    setNotifications(notificationManager.getNotifications());

    // Suscribirse a cambios
    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      console.log('📢 Notificaciones actualizadas:', newNotifications.length);
      setNotifications(newNotifications);
    });

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desuscribiendo del NotificationManager');
      unsubscribe();
    };
  }, []);

  // Funciones de conveniencia
  const showNotification = useCallback((message, type = 'info', duration = 5000, options = {}) => {
    return notificationManager.addNotification(message, type, duration, options);
  }, []);

  const showSuccess = useCallback((message, duration = 4000, options = {}) => {
    return notificationManager.success(message, duration, options);
  }, []);

  const showError = useCallback((message, duration = 6000, options = {}) => {
    return notificationManager.error(message, duration, options);
  }, []);

  const showWarning = useCallback((message, duration = 5000, options = {}) => {
    return notificationManager.warning(message, duration, options);
  }, []);

  const showInfo = useCallback((message, duration = 4000, options = {}) => {
    return notificationManager.info(message, duration, options);
  }, []);

  const removeNotification = useCallback((id) => {
    notificationManager.removeNotification(id);
  }, []);

  const clearAll = useCallback(() => {
    notificationManager.clearAll();
  }, []);

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
    hasNotifications: notifications.length > 0,
    notificationCount: notifications.length
  };
};