import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyView from '../pages/CompanyView';
import { useAuth } from '../../context/AuthContext';

const CompanyPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { 
    currentStep, 
    isAuthenticated,
    validatedCompany,
    rememberedCompany,
    isValidatingCompany,
    companyError,
    handleCompanyValidation,
    forgetCompany
  } = useAuth();

  // ✅ Redirección automática según el estado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else if (currentStep === 'credentials') {
      navigate('/login');
    }
  }, [isAuthenticated, currentStep, navigate]);

  // ✅ Sincronizar estados del contexto con estados locales
  useEffect(() => {
    setLoading(isValidatingCompany);
  }, [isValidatingCompany]);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const companyName = form.companyName.value;

    if (!companyName.trim()) {
      // ✅ Tu sistema de toast original
      const toast = document.createElement("div");
      toast.textContent = "Por favor ingrese el nombre de la empresa";
      toast.className = "fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-50";
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
      return;
    }

    setLoading(true);
    const result = await handleCompanyValidation(companyName.trim());
    setLoading(false);

    if (result.success) {
      navigate('/login');
    } else {
      // ✅ Tu sistema de toast original
      const toast = document.createElement("div");
      toast.textContent = result.message || 'Error al validar empresa';
      toast.className = "fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-50";
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  };

  // ✅ Función para usar empresa recordada
  const handleUseRememberedCompany = () => {
    navigate('/login');
  };

  // ✅ Función para olvidar empresa recordada
  const handleForgetCompany = () => {
    forgetCompany();
  };

  return (
    <CompanyView
      onCompanySubmit={handleCompanySubmit}
      loading={loading}
      error={companyError}
      rememberedCompany={rememberedCompany}
      onUseRememberedCompany={handleUseRememberedCompany}
      onForgetCompany={handleForgetCompany}
    />
  );
};

export default CompanyPage;