// config/environment.js - Configuración centralizada para Vite

const env = import.meta.env;

// ✅ VALIDACIÓN DE VARIABLES REQUERIDAS
const requiredEnvVars = [
  'VITE_API_BASE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars);
  throw new Error(`Variables de entorno requeridas: ${missingVars.join(', ')}`);
}

// ✅ CONFIGURACIÓN PRINCIPAL
export const config = {
  // API Configuration
  api: {
    baseURL: env.VITE_API_BASE_URL,
    timeout: parseInt(env.VITE_TIMEOUT) || 10000,
    retryAttempts: parseInt(env.VITE_API_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(env.VITE_API_RETRY_DELAY) || 1000
  },

  // App Configuration
  app: {
    name: env.VITE_APP_NAME || 'Sistema de Hallazgos',
    version: env.VITE_APP_VERSION || '1.0.0',
    environment: env.VITE_ENVIRONMENT || env.MODE || 'development',
    buildTime: env.VITE_BUILD_TIME || new Date().toISOString(),
    mode: env.MODE, // 'development' | 'production'
    isDev: env.DEV, // boolean
    isProd: env.PROD // boolean
  },

  // Feature Flags
  features: {
    enableNotifications: env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    enableAnalytics: env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugMode: env.VITE_DEBUG_MODE === 'true',
    enableOfflineMode: env.VITE_ENABLE_OFFLINE === 'true'
  },

  // Logging Configuration
  logging: {
    level: env.VITE_LOG_LEVEL || 'debug',
    enableConsole: env.MODE !== 'production',
    enableRemote: env.VITE_ENABLE_REMOTE_LOGGING === 'true',
    remoteUrl: env.VITE_REMOTE_LOG_URL
  },

  // Security Configuration
  security: {
    enableCSP: env.VITE_ENABLE_CSP === 'true',
    apiKey: env.VITE_API_KEY,
    encryptionKey: env.VITE_ENCRYPTION_KEY
  },

  // Third Party Services
  services: {
    analytics: {
      googleAnalyticsId: env.VITE_GA_ID,
      mixpanelToken: env.VITE_MIXPANEL_TOKEN
    },
    monitoring: {
      sentryDsn: env.VITE_SENTRY_DSN,
      logRocketId: env.VITE_LOGROCKET_ID
    },
    storage: {
      awsS3Bucket: env.VITE_S3_BUCKET,
      cloudinaryUrl: env.VITE_CLOUDINARY_URL
    }
  }
};

// ✅ FUNCIONES DE UTILIDAD
export const isProduction = () => config.app.isProd || config.app.environment === 'production';
export const isDevelopment = () => config.app.isDev || config.app.environment === 'development';
export const isStaging = () => config.app.environment === 'staging';

export const getApiUrl = (endpoint = '') => {
  return `${config.api.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getAppInfo = () => ({
  name: config.app.name,
  version: config.app.version,
  environment: config.app.environment,
  buildTime: config.app.buildTime,
  mode: config.app.mode
});

// ✅ VALIDACIÓN DE CONFIGURACIÓN
export const validateConfig = () => {
  const errors = [];

  // Validar URL de API
  try {
    new URL(config.api.baseURL);
  } catch (error) {
    errors.push('VITE_API_BASE_URL no es una URL válida');
  }

  // Validar timeout
  if (config.api.timeout < 1000) {
    errors.push('VITE_TIMEOUT debe ser mayor a 1000ms');
  }

  // Validar nivel de log
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(config.logging.level)) {
    errors.push('VITE_LOG_LEVEL debe ser: debug, info, warn, o error');
  }

  if (errors.length > 0) {
    console.error('❌ Errores de configuración:', errors);
    return false;
  }

  return true;
};

// ✅ LOG DE CONFIGURACIÓN EN DESARROLLO
if (isDevelopment()) {
  console.log('🔧 App Configuration (Vite):', {
    environment: config.app.environment,
    mode: config.app.mode,
    apiBaseURL: config.api.baseURL,
    features: config.features,
    version: config.app.version,
    isDev: config.app.isDev,
    isProd: config.app.isProd
  });
}

// ✅ VALIDAR CONFIGURACIÓN AL CARGAR
validateConfig();

// ✅ EXPORTAR CONFIGURACIÓN POR DEFECTO
export default config;