import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ IMPORTAR EL AUTH CONTEXT
import { useAuth } from '../../context/AuthContext';

// Hooks
import { useHallazgos, getEmptyHallazgo } from '../../hooks/useHallazgos';

import { 
  canEditHallazgo,
  canCreateHallazgo,
  canCloseHallazgo,
  canViewAllHallazgos,
  canReopenHallazgo,
  canDeleteHallazgo
} from '../../utils/permissions';

// ✅ Notificaciones globales - Ya no necesitas pasar como props
import { showError, showSuccess, showWarning, showInfo } from '../../utils/NotificationManager';

// Componentes
import Header from '../components/layout/Header';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import HallazgosStats from '../components/hallazgos/HallazgosStats';
import HallazgosFilters from '../components/hallazgos/HallazgosFilters';
import HallazgosTable from '../components/hallazgos/HallazgosTable';
import HallazgosCalendar from '../components/hallazgos/HallazgosCalendar';
import AddHallazgoModal from '../components/modals/AddHallazgoModal';
import UploadFileModal from '../components/modals/UploadFileModal';
import UserAdminModal from '../components/modals/UserAdminModal';
import UserProfileModal from '../components/modals/UserProfileModal';
import EditHallazgoModal from '../components/modals/EditHallazgoModal';
import CloseHallazgoModal from '../components/modals/CloseHallazgoModal';
import ReopenHallazgoModal from '../components/modals/ReopenHallazgoModal';
import HallazgoDetailModal from '../components/modals/HallazgoDetailModal';
import AdvancedDashboardModal from '../components/modals/AdvancedDashboardModal';

// ✅ Componente de notificaciones
import NotificationContainer from '../components/common/NotificationContainer';

// Config
import { isDevelopment } from '../../config/environment';

const DashboardView = () => {
  const navigate = useNavigate();
  
  // ✅ USAR EL AUTH CONTEXT EN LUGAR DE MANEJAR ESTADO PROPIO
  const { 
    isAuthenticated, 
    currentUser, 
    loading: authLoading, 
    handleLogout 
  } = useAuth();
  
  // Estados de carga inicial solo para hallazgos
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Estados de UI
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({ 
    evaluador: "",
    search: "",
    dateRange: null
  });
  
  // Estados de modales
  const [showAddHallazgoModal, setShowAddHallazgoModal] = useState(false);
  const [showEditHallazgoModal, setShowEditHallazgoModal] = useState(false);
  const [showCloseHallazgoModal, setShowCloseHallazgoModal] = useState(false);
  const [showReopenHallazgoModal, setShowReopenHallazgoModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUserAdmin, setShowUserAdmin] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdvancedDashboard, setShowAdvancedDashboard] = useState(false);
  
  // Estado para hallazgos
  const [newHallazgo, setNewHallazgo] = useState(getEmptyHallazgo());
  const [selectedHallazgo, setSelectedHallazgo] = useState(null);

  // ✅ VERIFICAR AUTENTICACIÓN DESDE EL CONTEXTO
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Hook de hallazgos - DEBE estar antes de los useEffect que usan sus valores
  const {
    hallazgos,
    users,
    evaluadores,
    isLoading: hallazgosLoading,
    error,
    handleCerrarHallazgo,
    handleAddHallazgo,
    handleEditHallazgo,
    handleReopenHallazgo,
    handleDeleteHallazgo,
    handleFileUpload,
    loadHallazgos,
    loadUsers,
    canEditHallazgo: checkCanEdit,
    canCloseHallazgo: checkCanClose,
    canReopenHallazgo: checkCanReopen,
    canDeleteHallazgo: checkCanDelete
  } = useHallazgos({
    newHallazgo,
    setNewHallazgo,
    setShowAddHallazgoModal,
    setShowUploadModal
  });

  // Función applyFilters - DEBE estar antes del useEffect que la usa
  const applyFilters = () => {
    const apiFilters = {};
    
    if (filters.search) {
      apiFilters.search = filters.search;
    }
    
    if (filters.evaluador) {
      apiFilters.evaluador = filters.evaluador;
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.type === 'range') {
        apiFilters.startDate = filters.dateRange.startDate;
        apiFilters.endDate = filters.dateRange.endDate;
      } else if (filters.dateRange.type === 'month') {
        apiFilters.month = parseInt(filters.dateRange.month);
        apiFilters.year = parseInt(filters.dateRange.year);
      }
    }
    
    if (isDevelopment()) {
      console.log('🔄 Aplicando filtros:', apiFilters);
    }
    loadHallazgos(apiFilters);
  };

  // Detectar cuando termina la carga inicial - AHORA hallazgosLoading está disponible
  useEffect(() => {
    if (!hallazgosLoading && isInitialLoad) {
      setIsInitialLoad(false);
      if (isDevelopment()) {
        console.log('✅ Carga inicial completada');
      }
    }
  }, [hallazgosLoading, isInitialLoad]);

  // Aplicar filtros con debounce - AHORA applyFilters está disponible
  useEffect(() => {
    if (currentUser && !authLoading && isAuthenticated) {
      const delayDebounce = setTimeout(() => {
        applyFilters();
      }, 300);

      return () => clearTimeout(delayDebounce);
    }
  }, [filters, currentUser, authLoading, isAuthenticated]);

  // Verificar permisos
  const permissions = currentUser ? {
    canCreate: canCreateHallazgo(currentUser),
    canEditUsers: currentUser.rol === 'admin' || currentUser.rol === 'super_admin',
    canViewAll: canViewAllHallazgos(currentUser),
    isAdmin: currentUser.rol === 'admin' || currentUser.rol === 'super_admin',
    isSuperAdmin: currentUser.rol === 'super_admin'
  } : {
    canCreate: false,
    canEditUsers: false,
    canViewAll: false,
    isAdmin: false,
    isSuperAdmin: false
  };

  // ✅ USAR EL HANDLELOGOUT DEL CONTEXTO
  const onLogout = async () => {
    try {
      await handleLogout();
      // El AuthContext se encarga de actualizar el estado
      // y el useEffect de arriba redirigirá automáticamente
    } catch (error) {
      showError('Error al cerrar sesión');
    }
  };

  const handleOpenEditModal = (hallazgo) => {
    if (!checkCanEdit(hallazgo)) {
      showError('No tienes permisos para editar este hallazgo');
      return;
    }
    setNewHallazgo(hallazgo);
    setSelectedHallazgo(hallazgo);
    setShowEditHallazgoModal(true);
  };

  const handleOpenCloseModal = (hallazgo) => {
    if (!checkCanClose(hallazgo)) {
      showError('No tienes permisos para cerrar este hallazgo');
      return;
    }
    setSelectedHallazgo(hallazgo);
    setShowCloseHallazgoModal(true);
  };

  const handleReopen = async (hallazgo) => {
    if (!checkCanReopen(hallazgo)) {
      showError('No tienes permisos para reabrir este hallazgo');
      return;
    }
    setSelectedHallazgo(hallazgo);
    setShowReopenHallazgoModal(true);
  };

  const handleDelete = async (hallazgo) => {
    if (!checkCanDelete()) {
      showError('Solo los administradores pueden eliminar hallazgos');
      return;
    }
    
    if (window.confirm('¿Está seguro de eliminar este hallazgo? Esta acción no se puede deshacer.')) {
      try {
        await handleDeleteHallazgo(hallazgo.id);
        // ✅ La notificación de éxito la maneja el servicio automáticamente
      } catch (error) {
        // ✅ La notificación de error la maneja el interceptor automáticamente
        if (isDevelopment()) {
          console.error('Error deleting hallazgo:', error);
        }
      }
    }
  };

  const handleConfirmClose = async (hallazgoId, comentario) => {
    try {
      await handleCerrarHallazgo(hallazgoId, comentario);
      setShowCloseHallazgoModal(false);
      setSelectedHallazgo(null);
      // ✅ La notificación de éxito la maneja el servicio automáticamente
    } catch (error) {
      if (isDevelopment()) {
        console.error('Error in handleConfirmClose:', error);
      }
      // ✅ La notificación de error la maneja el interceptor automáticamente
    }
  };

  const handleConfirmReopen = async (hallazgoId, motivo) => {
    try {
      await handleReopenHallazgo(hallazgoId, motivo);
      setShowReopenHallazgoModal(false);
      setSelectedHallazgo(null);
      // ✅ La notificación de éxito la maneja el servicio automáticamente
    } catch (error) {
      if (isDevelopment()) {
        console.error('Error in handleConfirmReopen:', error);
      }
      // ✅ La notificación de error la maneja el interceptor automáticamente
    }
  };
  const handleViewDetail = (hallazgo) => {
      setSelectedHallazgo(hallazgo);
      setShowDetailModal(true);
  };
  const handleShowDashboard = () => {
    setShowAdvancedDashboard(true);
  };

  const handleSaveHallazgo = async () => {
    try {
      if (isDevelopment()) {
        console.log('💾 handleSaveHallazgo - Iniciando...');
        console.log('🎯 Modal de edición:', showEditHallazgoModal);
        console.log('📋 Hallazgo seleccionado:', selectedHallazgo?.id);
      }
      
      if (showEditHallazgoModal && selectedHallazgo) {
        await handleEditHallazgo(selectedHallazgo.id, newHallazgo);
      } else {
        await handleAddHallazgo();
      }
      
      // Limpiar estados y cerrar modales
      setShowAddHallazgoModal(false);
      setShowEditHallazgoModal(false);
      setSelectedHallazgo(null);
      setNewHallazgo(getEmptyHallazgo());
      
      // ✅ Las notificaciones de éxito las manejan los servicios automáticamente
    } catch (error) {
      if (isDevelopment()) {
        console.error('❌ Error en handleSaveHallazgo:', error);
      }
      // ✅ Las notificaciones de error las maneja el interceptor automáticamente
    }
  };

  // ✅ Handler para actualizar perfil de usuario
  const handleUpdateUserProfile = (updatedData) => {
    // ✅ TAMBIÉN NECESITAS ACTUALIZAR EL CONTEXTO AQUÍ
    // Pero por ahora, solo actualizamos localmente
    showSuccess('Perfil actualizado exitosamente');
  };

  // ✅ EARLY RETURNS AFTER ALL HOOKS
  // Estados de carga
  if (authLoading || !isAuthenticated || isInitialLoad) {
    return <LoadingState message="Cargando datos..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        currentUser={currentUser}
        onLogout={onLogout}
        onShowProfile={() => setShowUserProfile(true)}
        onShowUserAdmin={() => setShowUserAdmin(true)}
        onShowDashboard={handleShowDashboard} 
        canEditUsers={permissions.canEditUsers}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estadísticas */}
        <HallazgosStats 
          hallazgos={hallazgos}
          currentUser={currentUser}
          canViewAll={permissions.canViewAll}
        />

        {/* Filtros y botones */}
        <HallazgosFilters
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFiltersChange={setFilters}
          users={evaluadores}
          canCreate={permissions.canCreate}
          canViewAll={permissions.canViewAll}
          onAddNew={() => setShowAddHallazgoModal(true)}
          onUpload={() => setShowUploadModal(true)}
        />

        {/* Indicador de carga durante búsquedas */}
        {hallazgosLoading && !isInitialLoad && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Buscando...</span>
            </div>
          </div>
        )}

        {/* Vista Calendario o Lista */}
        {viewMode === "calendar" ? (
          <HallazgosCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            hallazgos={hallazgos}
            filters={filters}
            currentUser={currentUser}
            onEdit={handleOpenEditModal}
            onClose={handleOpenCloseModal}
            onReopen={handleReopen}
            onDelete={handleDelete}
          />
        ) : (
          <HallazgosTable
            hallazgos={hallazgos}
            users={users}
            currentUser={currentUser}
            filters={filters}
            permissions={permissions}
            onEdit={handleOpenEditModal}
            onClose={handleOpenCloseModal}
            onReopen={handleReopen}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}  // ← AGREGAR ESTA LÍNEA
            canEditHallazgo={checkCanEdit}
            canCloseHallazgo={checkCanClose}
            canReopenHallazgo={checkCanReopen}
            canDeleteHallazgo={checkCanDelete}
          />
        )}
      </div>

      {/* Modales */}
      {showAddHallazgoModal && (
        <AddHallazgoModal
          isOpen={showAddHallazgoModal}
          onClose={() => {
            setShowAddHallazgoModal(false);
            setNewHallazgo(getEmptyHallazgo());
          }}
          newHallazgo={newHallazgo}
          onHallazgoChange={setNewHallazgo}
          onSubmit={handleSaveHallazgo}
          users={users}
          currentUser={currentUser}
        />
      )}

      {showEditHallazgoModal && selectedHallazgo && (
        <EditHallazgoModal
          isOpen={showEditHallazgoModal}
          onClose={() => {
            setShowEditHallazgoModal(false);
            setSelectedHallazgo(null);
            setNewHallazgo(getEmptyHallazgo());
          }}
          hallazgo={selectedHallazgo}
          onHallazgoChange={setNewHallazgo}
          onSubmit={handleSaveHallazgo}
          users={users}
          currentUser={currentUser}
        />
      )}

      {showCloseHallazgoModal && selectedHallazgo && (
        <CloseHallazgoModal
          isOpen={showCloseHallazgoModal}
          onClose={() => {
            setShowCloseHallazgoModal(false);
            setSelectedHallazgo(null);
          }}
          hallazgo={selectedHallazgo}
          onConfirm={handleConfirmClose}
        />
      )}

      {showReopenHallazgoModal && selectedHallazgo && (
        <ReopenHallazgoModal
          isOpen={showReopenHallazgoModal}
          onClose={() => {
            setShowReopenHallazgoModal(false);
            setSelectedHallazgo(null);
          }}
          hallazgo={selectedHallazgo}
          onConfirm={handleConfirmReopen}
        />
      )}

      {showUploadModal && (
        <UploadFileModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFileUpload={handleFileUpload}
        />
      )}

      {showUserAdmin && (
        <UserAdminModal
          isOpen={showUserAdmin}
          onClose={() => setShowUserAdmin(false)}
          users={users}
          onReloadUsers={loadUsers}
          currentUser={currentUser}
        />
      )}
  
      {showUserProfile && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUserProfile}
        />
      )}
      {showDetailModal && selectedHallazgo && (
        <HallazgoDetailModal
          hallazgo={selectedHallazgo}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedHallazgo(null);
          }}
        />
      )}
      {showAdvancedDashboard && (
        <AdvancedDashboardModal
          hallazgos={hallazgos}
          isOpen={showAdvancedDashboard}
          onClose={() => setShowAdvancedDashboard(false)}
          currentUser={currentUser}
          canViewAll={permissions.canViewAll}
        />
      )}
      {/* ✅ Contenedor de notificaciones - Se mostrará en toda la aplicación */}
      <NotificationContainer />
    </div>
  );
};

export default DashboardView;