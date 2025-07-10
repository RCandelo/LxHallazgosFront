const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Configuración de logging
const LOG_CONFIG = {
  development: {
    enableAll: true,
    enableInfo: true,
    enableWarning: true,
    enableError: true,
    enableDebug: true,
    enableNetwork: true,
    enableAuth: true
  },
  production: {
    enableAll: false,
    enableInfo: false,
    enableWarning: true,  // Mantener warnings en producción
    enableError: true,    // Mantener errores en producción
    enableDebug: false,
    enableNetwork: false,
    enableAuth: false
  }
};

const config = LOG_CONFIG[process.env.NODE_ENV] || LOG_CONFIG.development;

// Logger principal
class Logger {
  static log(...args) {
    if (config.enableAll || isDevelopment) {
      console.log(...args);
    }
  }

  static info(...args) {
    if (config.enableInfo || isDevelopment) {
      console.log('ℹ️', ...args);
    }
  }

  static warn(...args) {
    if (config.enableWarning) {
      console.warn('⚠️', ...args);
    }
  }

  static error(...args) {
    if (config.enableError) {
      console.error('❌', ...args);
    }
  }

  static debug(...args) {
    if (config.enableDebug || isDevelopment) {
      console.log('🐛', ...args);
    }
  }

  static success(...args) {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  }

  // Logging especializado
  static network(method, url, data = null) {
    if (config.enableNetwork || isDevelopment) {
      console.log(`🌐 ${method.toUpperCase()} ${url}`, data ? { data } : '');
    }
  }

  static auth(action, details = null) {
    if (config.enableAuth || isDevelopment) {
      console.log(`🔐 Auth: ${action}`, details || '');
    }
  }

  static service(serviceName, action, details = null) {
    if (isDevelopment) {
      console.log(`🔧 ${serviceName}: ${action}`, details || '');
    }
  }

  static ui(component, action, details = null) {
    if (isDevelopment) {
      console.log(`🎨 ${component}: ${action}`, details || '');
    }
  }

  // Para errores críticos que siempre deben aparecer
  static critical(...args) {
    console.error('🚨 CRITICAL:', ...args);
    
    // En producción, podrías enviar estos errores a un servicio de monitoreo
    if (isProduction) {
      // Aquí podrías integrar con Sentry, LogRocket, etc.
      // this.sendToErrorService(...args);
    }
  }

  // Grupos para organizar logs relacionados
  static group(title, callback) {
    if (isDevelopment) {
      console.group(title);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }

  // Timer para medir performance
  static time(label) {
    if (isDevelopment) {
      console.time(label);
    }
  }

  static timeEnd(label) {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Tabla para mostrar datos estructurados
  static table(data) {
    if (isDevelopment) {
      console.table(data);
    }
  }
}

// Funciones de conveniencia para import directo
export const log = Logger.log.bind(Logger);
export const logInfo = Logger.info.bind(Logger);
export const logWarn = Logger.warn.bind(Logger);
export const logError = Logger.error.bind(Logger);
export const logDebug = Logger.debug.bind(Logger);
export const logSuccess = Logger.success.bind(Logger);
export const logNetwork = Logger.network.bind(Logger);
export const logAuth = Logger.auth.bind(Logger);
export const logService = Logger.service.bind(Logger);
export const logUI = Logger.ui.bind(Logger);
export const logCritical = Logger.critical.bind(Logger);
export const logGroup = Logger.group.bind(Logger);
export const logTime = Logger.time.bind(Logger);
export const logTimeEnd = Logger.timeEnd.bind(Logger);
export const logTable = Logger.table.bind(Logger);

export default Logger;