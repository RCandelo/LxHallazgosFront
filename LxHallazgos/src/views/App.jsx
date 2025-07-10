import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import CompanyPage from './components/CompanyPage';
import LoginPage from './components/LoginPage';
import DashboardView from './pages/DashboardView';
import './App.css';

// ✅ Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentStep } = useAuth();
  
  if (isAuthenticated) {
    return children;
  }
  
  // Redirigir según el paso actual
  if (currentStep === 'credentials') {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to="/" replace />;
};

// ✅ Componente para rutas públicas (cuando ya está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// ✅ Componente para validar empresa antes del login
const CompanyValidatedRoute = ({ children }) => {
  const { currentStep, validatedCompany } = useAuth();
  
  // Si no hay empresa validada y el paso no es 'credentials', ir a validar empresa
  if (currentStep !== 'credentials' && !validatedCompany) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Ruta para validar empresa */}
    <Route 
      path="/" 
      element={
        <PublicRoute>
          <CompanyPage />
        </PublicRoute>
      } 
    />
    
    {/* Ruta para credenciales - requiere empresa validada */}
    <Route 
      path="/login" 
      element={
        <PublicRoute>
          <CompanyValidatedRoute>
            <LoginPage />
          </CompanyValidatedRoute>
        </PublicRoute>
      } 
    />
    
    {/* Ruta protegida - dashboard */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardView />
        </ProtectedRoute>
      }
    />
    
    {/* Redirigir cualquier ruta no encontrada */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <Router>
    {/* ✅ OPCIONAL: Mostrar info de desarrollo */}
    {process.env.NODE_ENV === 'development' && (
      <div style={{
        position: 'fixed', 
        top: 0, 
        right: 0, 
        background: '#333', 
        color: 'white', 
        padding: '5px', 
        fontSize: '12px',
        zIndex: 9999
      }}>
        HashRouter Mode
      </div>
    )}
    
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </Router>
);

export default App;

