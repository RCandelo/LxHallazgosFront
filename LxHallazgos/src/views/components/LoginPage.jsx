import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginView from '../pages/LoginView';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { 
    currentStep, 
    isAuthenticated,
    validatedCompany,
    rememberedCompany,
    isLoggingIn,
    loginError,
    login,
    changeCompany
  } = useAuth();

  // ✅ Redirección automática según el estado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else if (currentStep === 'company' || (!validatedCompany && !rememberedCompany)) {
      navigate('/');
    }
  }, [isAuthenticated, currentStep, validatedCompany, rememberedCompany, navigate]);

  // ✅ Sincronizar loading del contexto
  useEffect(() => {
    setLoading(isLoggingIn);
  }, [isLoggingIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const usuario = form.usuario.value;
    const contraseña = form.contraseña.value;
    const rememberCompany = form.rememberCompany?.checked || false;

    // ✅ Obtener empresa del contexto con fallback a localStorage
    let empresaId;
    
    if (validatedCompany) {
      empresaId = validatedCompany.empresa_id;
    } else if (rememberedCompany) {
      empresaId = rememberedCompany.empresa_id;
    } else {
      // ✅ Fallback a tu implementación original
      const currentCompany = JSON.parse(localStorage.getItem('currentCompany') || '{}');
      empresaId = currentCompany?.id;
    }

    if (!empresaId) {
      // ✅ Tu sistema de toast original
      const toast = document.createElement("div");
      toast.textContent = "No se encontró la empresa. Por favor seleccione una empresa primero.";
      toast.className = "fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-50";
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
      
      navigate('/');
      return;
    }

    setLoading(true);
    
    try {
      // ✅ Usar el login del contexto
      const result = await login(usuario, contraseña, rememberCompany);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        // ✅ Tu sistema de toast original
        const toast = document.createElement("div");
        toast.textContent = result.message || 'Error al iniciar sesión';
        toast.className = "fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-50";
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // ✅ Tu sistema de toast original
      const toast = document.createElement("div");
      toast.textContent = 'Error de conexión';
      toast.className = "fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCompany = () => {
    changeCompany();
    navigate('/');
  };

  // ✅ Si no hay empresa y no estamos cargando, mostrar loading
  if (!validatedCompany && !rememberedCompany && !localStorage.getItem('currentCompany')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <LoginView 
      onUserLogin={handleLogin} 
      loading={loading}
      validatedCompany={validatedCompany}
      rememberedCompany={rememberedCompany}
      onBackToCompany={handleBackToCompany}
    />
  );
};

export default LoginPage;