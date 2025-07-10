import React, { useState } from 'react';
import { User, Edit3, Save, Crown, Lock, Eye, EyeOff } from 'lucide-react';
import BaseModal from '../modals/BaseModal';
import { usersService } from '../../../services/users.service';

const UserProfileModal = ({ isOpen, onClose, currentUser, onUserUpdated, showNotification }) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: currentUser.nombre || '',
    apellido: currentUser.apellido || '',
    correo: currentUser.correo || currentUser.email || '',
    zona: currentUser.zona || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Validaciones
      if (!profileData.nombre.trim()) {
        showNotification('El nombre es obligatorio', 'error');
        return;
      }
      
      if (!profileData.correo.trim()) {
        showNotification('El correo es obligatorio', 'error');
        return;
      }

      // Validar contraseña si se está cambiando
      if (changingPassword) {
        if (!passwordData.currentPassword) {
          showNotification('Debe ingresar su contraseña actual', 'error');
          return;
        }
        
        if (passwordData.newPassword.length < 6) {
          showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
          return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          showNotification('Las contraseñas no coinciden', 'error');
          return;
        }
      }

      // Preparar datos para enviar
      const updateData = {
        nombre: profileData.nombre.trim(),
        apellido: profileData.apellido.trim(),
        correo: profileData.correo.trim()
      };

      if (changingPassword) {
        updateData.currentPassword = passwordData.currentPassword;
        updateData.password = passwordData.newPassword;
      }

      console.log('Actualizando perfil:', updateData);
      
      // Llamar al servicio
      const updatedUser = await usersService.updateProfile(updateData);
      
      // Actualizar usuario en el contexto/estado padre
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
      
      showNotification('Perfil actualizado exitosamente', 'success');
      setEditingProfile(false);
      setChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.message || 'Error al actualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'visualizador': return <Eye className="w-4 h-4 text-green-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleDisplayName = (role) => {
    const roles = {
      admin: 'Administrador',
      editor: 'Editor',
      usuario: 'Usuario',
      visualizador: 'Visualizador'
    };
    return roles[role] || role;
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mi Perfil"
      icon={User}
      headerColor="from-indigo-600 to-indigo-700"
      maxWidth="max-w-2xl"
    >
      <div className="p-6">
        {/* Header del perfil */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {currentUser.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {currentUser.nombre} {currentUser.apellido}
            </h3>
            <p className="text-gray-600">{currentUser.correo || currentUser.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              {getRoleIcon(currentUser.rol)}
              <span className="text-sm font-medium text-gray-700">
                {getRoleDisplayName(currentUser.rol)}
              </span>
              {currentUser.zona && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {currentUser.zona}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingProfile ? profileData.nombre : currentUser.nombre}
                onChange={(e) => editingProfile && setProfileData({...profileData, nombre: e.target.value})}
                disabled={!editingProfile}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={editingProfile ? profileData.apellido : (currentUser.apellido || '')}
                onChange={(e) => editingProfile && setProfileData({...profileData, apellido: e.target.value})}
                disabled={!editingProfile}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={editingProfile ? profileData.correo : (currentUser.correo || currentUser.email)}
              onChange={(e) => editingProfile && setProfileData({...profileData, correo: e.target.value})}
              disabled={!editingProfile}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <input
                type="text"
                value={getRoleDisplayName(currentUser.rol)}
                disabled
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
              />
            </div>
            
            {currentUser.zona && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona Asignada</label>
                <input
                  type="text"
                  value={currentUser.zona}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                />
              </div>
            )}
          </div>

          {/* Sección de cambio de contraseña */}
          {editingProfile && (
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </h4>
                <button
                  type="button"
                  onClick={() => setChangingPassword(!changingPassword)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {changingPassword ? 'Cancelar cambio' : 'Cambiar contraseña'}
                </button>
              </div>

              {changingPassword && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña Actual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ingrese su contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? 
                          <EyeOff className="w-4 h-4 text-gray-400" /> : 
                          <Eye className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? 
                          <EyeOff className="w-4 h-4 text-gray-400" /> : 
                          <Eye className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Repetir nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? 
                          <EyeOff className="w-4 h-4 text-gray-400" /> : 
                          <Eye className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>

                  {passwordData.newPassword && passwordData.confirmPassword && 
                   passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-sm text-red-600">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 mt-6">
          {editingProfile ? (
            <>
              <button
                onClick={() => {
                  setEditingProfile(false);
                  setChangingPassword(false);
                  setProfileData({
                    nombre: currentUser.nombre || '',
                    apellido: currentUser.apellido || '',
                    correo: currentUser.correo || currentUser.email || '',
                    zona: currentUser.zona || ''
                  });
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingProfile(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default UserProfileModal;