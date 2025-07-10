import { HardHat, ArrowLeft } from "lucide-react";

const LoginView = ({ 
  onUserLogin, 
  loading, 
  validatedCompany,
  onBackToCompany,
  rememberedCompany 
}) => {
  // ✅ Usar empresa validada o recordada, fallback a localStorage para compatibilidad
  const getCurrentCompany = () => {
    if (validatedCompany) return validatedCompany;
    if (rememberedCompany) return rememberedCompany;
    
    // Fallback a tu implementación original
    const currentCompany = JSON.parse(localStorage.getItem('currentCompany') || '{}');
    return currentCompany;
  };

  const company = getCurrentCompany();
  const companyName = company?.nombre || 'Empresa';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-2">
          <span className="text-orange-500">S</span>
          <span className="text-blue-600">H</span>
          <span className="text-green-500">E</span>
          <span className="text-orange-500">E</span>
          <span className="text-blue-600">Q</span>
        <div className="text-gray-600 text-sm">Consulting</div>
      </div>
          <h2 className="text-2xl font-bold text-gray-800">Bienvenido</h2>
          <p className="text-gray-600 mt-2">{companyName}</p>
        </div>
        
        <form onSubmit={onUserLogin} className="space-y-4">
          <div>
            <input
              type="email"
              name="usuario"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="correo@ejemplo.com"
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>
          
          <div>
            <input
              type="password"
              name="contraseña"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ingrese su contraseña"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* ✅ Checkbox para recordar empresa */}
          <div className="flex items-center pt-2">
            <input
              id="rememberCompany"
              name="rememberCompany"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberCompany" className="ml-2 block text-sm text-gray-700">
              Recordar esta empresa
            </label>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center space-y-2">
          {/* ✅ Opción para cambiar empresa */}
          {onBackToCompany && (
            <button 
              onClick={onBackToCompany}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center space-x-1"
              disabled={loading}
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Cambiar empresa</span>
            </button>
          )}
          
          {/* ✅ Fallback a tu implementación original */}
          {!onBackToCompany && (
            <a 
              href="/" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cambiar empresa
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;