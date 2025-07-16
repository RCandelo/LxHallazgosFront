import { useState, useEffect, useCallback } from 'react';
import { hallazgosService } from '../services/hallazgos.service';
import { usersService } from '../services/users.service';
import { authService } from '../services/auth.service';

export const getEmptyHallazgo = () => ({
  // Información básica
  proyecto: '',
  evaluador: '',
  zona: '',
  departamento: '',
  actividad_realizar: '',
  jt: '',
  actividad: '',
  resultado: '',
  bloque: '',
  observaciones: '',
  descripcion: '',
  // Información personal del hallazgo
  nombre: '',
  apellido: '',
  correo: '',
  cedula: '',
  // Fecha y estado
  dwh_create: new Date().toISOString().split('T')[0],
  estado: 'pendiente'
});

export const useHallazgos = ({ 
  newHallazgo, 
  setNewHallazgo, 
  setShowAddHallazgoModal, 
  setShowUploadModal 
}) => {
  const [hallazgos, setHallazgos] = useState([]);
  const [users, setUsers] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    en_proceso: 0,
    cerrados: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar hallazgos con mejor manejo de errores
  const loadHallazgos = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar autenticación antes de hacer la petición
      if (!authService.isAuthenticated()) {
        console.log('Usuario no autenticado, limpiando hallazgos');
        setHallazgos([]);
        return;
      }
      
      console.log('Loading hallazgos with filters:', filters);
      const data = await hallazgosService.getHallazgos(filters);
      
      console.log('Hallazgos loaded:', data?.length || 0);
      setHallazgos(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error('Error in loadHallazgos:', err);
      
      const errorMessage = err.message || 'Error al cargar hallazgos';
      setError(errorMessage);
      setHallazgos([]);
      
      // Solo mostrar error si no es de sesión expirada
      if (!err.message.includes('Sesión expirada')) {
        console.error('Error visible al usuario:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
  try {
    const currentUser = authService.getCurrentUser();
    
    // Solo admin puede ver todos los usuarios
    if (currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin') {
      console.log('Loading users for admin...');
      const data = await usersService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
      console.log('Users loaded:', data?.length || 0);
    } else {
      setUsers([]);
    }
  } catch (err) {
    console.error('Error loading users:', err);
    setUsers([]);
  }
}, []);


  // Cargar evaluadores
  const loadEvaluadores = useCallback(async () => {
    try {
      console.log('Loading evaluadores...');
      const data = await hallazgosService.getEvaluadores();
      console.log('Evaluadores loaded:', data?.length || 0);
      setEvaluadores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading evaluadores:', err);
      setEvaluadores([]);
    }
  }, []);

  // Cargar estadísticas
  const loadEstadisticas = useCallback(async () => {
    try {
      console.log('Loading estadisticas...');
      const data = await hallazgosService.getEstadisticas();
      console.log('Estadisticas loaded:', data);
      setEstadisticas(data || {
        total: 0,
        pendientes: 0,
        en_proceso: 0,
        cerrados: 0
      });
    } catch (err) {
      console.error('Error loading estadisticas:', err);
      // Mantener estadísticas por defecto en caso de error
    }
  }, []);

  // Crear hallazgo
  const handleAddHallazgo = async () => {
    try {
      console.log('Adding new hallazgo:', newHallazgo);
      await hallazgosService.createHallazgo(newHallazgo);
      
      // Recargar datos
      await Promise.all([
        loadHallazgos(),
        loadEstadisticas()
      ]);
      
      // Limpiar formulario y cerrar modal
      setNewHallazgo(getEmptyHallazgo());
      setShowAddHallazgoModal(false);
      
      return { success: true };
    } catch (err) {
      console.error('Error creating hallazgo:', err);
      throw err;
    }
  };

  // Editar hallazgo

  const handleEditHallazgo = async (hallazgoId, data) => {
    try {
      console.log('🔧 handleEditHallazgo - Iniciando edición:', {
        hallazgoId,
        data,
        data_keys: Object.keys(data),
        data_proyecto: data.proyecto,
        data_evaluador: data.evaluador
      });
      
      // ✅ Validar que tenemos los datos necesarios
      if (!hallazgoId || !data) {
        throw new Error('ID de hallazgo y datos son requeridos');
      }
      
      // ✅ Validar campos obligatorios
      if (!data.proyecto || !data.evaluador) {
        throw new Error('Proyecto y evaluador son campos obligatorios');
      }
      
      console.log('📤 Enviando actualización al backend...');
      const response = await hallazgosService.updateHallazgo(hallazgoId, data);
      console.log('📥 Respuesta del backend:', response);
      
      console.log('🔄 Recargando datos...');
      // Recargar datos para ver los cambios
      await Promise.all([
        loadHallazgos(),
        loadEstadisticas()
      ]);
      
      console.log('✅ Edición completada exitosamente');
      return { success: true };
    } catch (err) {
      console.error('❌ Error updating hallazgo:', err);
      console.error('📋 Detalles del error:', {
        message: err.message,
        hallazgoId,
        dataReceived: data
      });
      throw err;
    }
  };

  // Cerrar hallazgo con comentario
  const handleCerrarHallazgo = async (hallazgoId, comentario) => {
    try {
      console.log('Closing hallazgo:', { 
        hallazgoId, 
        comentario, 
        comentario_type: typeof comentario,
        comentario_length: comentario?.length 
      });
      
      // ✅ Validación robusta del comentario
      if (!comentario || typeof comentario !== 'string') {
        throw new Error('El comentario de cierre es obligatorio y debe ser texto');
      }
      
      const comentarioLimpio = comentario.trim();
      if (comentarioLimpio.length < 10) {
        throw new Error('El comentario de cierre debe tener al menos 10 caracteres');
      }
      
      await hallazgosService.closeHallazgo(hallazgoId, comentarioLimpio);
      
      // Recargar datos
      await Promise.all([
        loadHallazgos(),
        loadEstadisticas()
      ]);
      
      return { success: true };
    } catch (err) {
      console.error('Error closing hallazgo:', err);
      throw err;
    }
  };

  // ✅ REABRIR HALLAZGO CORREGIDO CON MOTIVO
  const handleReopenHallazgo = async (hallazgoId, motivo_reapertura) => {
    try {
      console.log('Reopening hallazgo:', { 
        hallazgoId, 
        motivo_reapertura,
        motivo_type: typeof motivo_reapertura,
        motivo_length: motivo_reapertura?.length 
      });
      
      // ✅ Validación robusta del motivo
      if (!motivo_reapertura || typeof motivo_reapertura !== 'string') {
        throw new Error('El motivo de reapertura es obligatorio y debe ser texto');
      }
      
      const motivoLimpio = motivo_reapertura.trim();
      if (motivoLimpio.length < 10) {
        throw new Error('El motivo de reapertura debe tener al menos 10 caracteres');
      }
      
      await hallazgosService.reopenHallazgo(hallazgoId, motivoLimpio);
      
      // Recargar datos
      await Promise.all([
        loadHallazgos(),
        loadEstadisticas()
      ]);
      
      return { success: true };
    } catch (err) {
      console.error('Error reopening hallazgo:', err);
      throw err;
    }
  };

  // Eliminar hallazgo
  const handleDeleteHallazgo = async (hallazgoId) => {
    try {
      const currentUser = authService.getCurrentUser(); // ✅ Sin await
      
      if (currentUser?.rol !== 'admin' && currentUser?.rol !== 'super_admin') {
        throw new Error('Solo los administradores pueden eliminar hallazgos');
      }
      
      console.log('Deleting hallazgo:', hallazgoId);
      await hallazgosService.deleteHallazgo(hallazgoId);
      
      // Recargar datos
      await Promise.all([
        loadHallazgos(),
        loadEstadisticas()
      ]);
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting hallazgo:', err);
      throw err;
    }
  };

  // Cerrar todos los hallazgos (solo admin)
  const handleCloseAllHallazgos = async (payload) => {
    try {
      const currentUser = authService.getCurrentUser(); // ✅ Sin await
      
      if (currentUser?.rol !== 'admin' && currentUser?.rol !== 'super_admin') {
        throw new Error('Solo los administradores pueden cerrar todos los hallazgos');
      }
      
      console.log('Closing all hallazgos:', payload);
      const result = await hallazgosService.closeAllHallazgos(payload);
      
      // Recargar datos
      await Promise.all([
        loadHallazgos(),
        loadEstadisticas()
      ]);
      
      return result;
    } catch (err) {
      console.error('Error closing all hallazgos:', err);
      throw err;
    }
  };

  // Cargar archivo
  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) {
        throw new Error('No se seleccionó ningún archivo');
      }

      console.log('Uploading file:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      await hallazgosService.uploadHallazgosFile(formData);
      
      // Recargar datos
      await Promise.all([
        loadHallazgos(),
        loadEstadisticas(),
        loadEvaluadores()
      ]);
      
      setShowUploadModal(false);
      return { success: true };
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

  // ✅ FUNCIONES DE PERMISOS CORREGIDAS - Sin async/await
  
  const canEditHallazgo = (hallazgo) => {
    try {
      const currentUser = authService.getCurrentUser(); // ✅ Sin await, manejo de errores
      
      if (!currentUser || !hallazgo) return false;
      
      // Admin siempre puede editar
      if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return true;
      
      // Usuario puede editar si tiene permiso y es su hallazgo
      if (authService.canEdit() && hallazgo.usuario_id === currentUser.id) {
        // No puede editar si está cerrado
        return hallazgo.estado !== 'cerrado';
      }
      
      return false;
    } catch (error) {
      console.error('Error in canEditHallazgo:', error);
      return false;
    }
  };
  

  const canCloseHallazgo = (hallazgo) => {
    try {
      const currentUser = authService.getCurrentUser(); // ✅ Sin await, manejo de errores
      
      console.log('canCloseHallazgo', { 
        hallazgo,
        currentUser, // ✅ Ahora será el objeto usuario directamente
        isAuthenticated: authService.isAuthenticated(),
        hallazgoUserId: hallazgo?.usuario_id,
        currentUserId: currentUser?.id // ✅ Ahora tendrá valor
      });
      
      if (!currentUser || !hallazgo) return false;
      
      // No se puede cerrar si ya está cerrado
      if (hallazgo.estado === 'cerrado') return false;
      
      // Admin siempre puede cerrar
      if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return true;
      
      // Usuario puede cerrar su propio hallazgo
      return hallazgo.usuario_id === currentUser.id;
    } catch (error) {
      console.error('Error in canCloseHallazgo:', error);
      return false;
    }
  };

  const canReopenHallazgo = (hallazgo) => {
    try {
      const currentUser = authService.getCurrentUser(); // ✅ Sin await, manejo de errores
      
      if (!currentUser || !hallazgo) return false;
      
      // Solo se puede reabrir si está cerrado
      if (hallazgo.estado !== 'cerrado') return false;
      
      // Admin siempre puede reabrir
      if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return true;
      
      // Usuario puede reabrir su propio hallazgo o si lo cerró él
      return hallazgo.usuario_id === currentUser.id || hallazgo.cerrado_por === currentUser.id;
    } catch (error) {
      console.error('Error in canReopenHallazgo:', error);
      return false;
    }
  };

  const canDeleteHallazgo = () => {
    try {
      const currentUser = authService.getCurrentUser(); // ✅ Sin await, manejo de errores
      return currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin';
    } catch (error) {
      console.error('Error in canDeleteHallazgo:', error);
      return false;
    }
  };

  const canCloseAllHallazgos = () => {
    try {
      const currentUser = authService.getCurrentUser(); // ✅ Sin await, manejo de errores
      return currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin';
    } catch (error) {
      console.error('Error in canCloseAllHallazgos:', error);
      return false;
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (authService.isAuthenticated()) {
      console.log('Loading initial data...');
      Promise.all([
        loadHallazgos(),
        loadUsers(),
        loadEvaluadores(),
        loadEstadisticas()
      ]).then(() => {
        console.log('Initial data loaded successfully');
      }).catch(err => {
        console.error('Error loading initial data:', err);
      });
    } else {
      console.log('User not authenticated, skipping data load');
    }
  }, [loadHallazgos, loadUsers, loadEvaluadores, loadEstadisticas]);

  return {
    // Datos
    hallazgos,
    users,
    evaluadores,
    estadisticas,
    isLoading,
    error,
    
    // Funciones de carga
    loadHallazgos,
    loadUsers,
    loadEvaluadores,
    loadEstadisticas,
    
    // Funciones CRUD
    handleAddHallazgo,
    handleEditHallazgo,
    handleCerrarHallazgo,
    handleReopenHallazgo,
    handleDeleteHallazgo,
    handleCloseAllHallazgos,
    handleFileUpload,
    
    // Funciones de permisos
    canEditHallazgo,
    canCloseHallazgo,
    canReopenHallazgo,
    canDeleteHallazgo,
    canCloseAllHallazgos
  };
};