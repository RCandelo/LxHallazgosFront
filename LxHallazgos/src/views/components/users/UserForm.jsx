import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Crown, Edit3, UserCheck, MapPin } from 'lucide-react';
import BaseModal from '../modals/BaseModal';
import { showNotification } from '../../../utils/NotificationManager'; // ✅ Importar directamente

const UserForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  // showNotification, // ❌ Ya no necesario como prop
  user = null,
  currentUser 
}) => {
  const isEditing = !!user;
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    confirmPassword: '',
    rol: 'usuario',
    activo: true,
    puede_editar: false,
    zona: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        correo: user.correo || '',
        password: '',
        confirmPassword: '',
        rol: user.rol || 'usuario',
        activo: user.estado ?? true,
        puede_editar: user.puede_editar ?? false,
        zona: user.zona || ''
      });
    } else {
      // Resetear para nuevo usuario
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        password: '',
        confirmPassword: '',
        rol: 'usuario',
        activo: true,
        puede_editar: false,
        zona: ''
      });
    }
    setErrors({});
  }, [isEditing, user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El correo no tiene un formato válido';
    }

    // Validaciones de contraseña para nuevos usuarios
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Debe confirmar la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (formData.password) {
      // Si está editando y quiere cambiar la contraseña
      if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim(),
        rol: formData.rol,
        activo: formData.activo,
        puede_editar: formData.puede_editar,
        zona: formData.zona.trim() || null
      };

      // Solo incluir password si se está creando o si se quiere cambiar
      if (!isEditing || formData.password) {
        userData.password = formData.password;
      }

      console.log('Guardando usuario:', { isEditing, userData });
      
      await onSave(userData, isEditing ? user.id : null);
      
      // ✅ Usar NotificationManager directamente
      showNotification(
        isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
        'success'
      );
      
      onClose();
      
    } catch (error) {
      console.error('Error guardando usuario:', error);
      
      // ✅ Usar NotificationManager directamente
      showNotification(
        error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} usuario`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      confirmPassword: '',
      rol: 'usuario',
      activo: true,
      puede_editar: false,
      zona: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
      icon={isEditing ? Edit3 : User}
      headerColor={isEditing ? "from-blue-600 to-blue-700" : "from-green-600 to-green-700"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre del usuario"
              disabled={isLoading}
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Apellido *
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.apellido ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Apellido del usuario"
              disabled={isLoading}
            />
            {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
          </div>

          {/* Correo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.correo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="usuario@empresa.com"
              disabled={isLoading}
            />
            {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={isEditing ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
              disabled={isLoading}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Confirmar Contraseña {!isEditing && '*'}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Repetir contraseña"
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Crown className="w-4 h-4 inline mr-2" />
              Rol
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="usuario">Usuario</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Zona (opcional)
            </label>
            <input
              type="text"
              name="zona"
              value={formData.zona}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Zona asignada"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              <UserCheck className="w-4 h-4 inline mr-2" />
              Usuario activo
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="puede_editar"
              name="puede_editar"
              checked={formData.puede_editar}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="puede_editar" className="ml-2 block text-sm text-gray-700">
              <Edit3 className="w-4 h-4 inline mr-2" />
              Puede editar hallazgos
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
              isEditing
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
              </>
            ) : (
              <>
                {isEditing ? <Edit3 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                <span>{isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default UserForm;