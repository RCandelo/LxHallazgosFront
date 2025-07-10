// components/users/UserProfile.jsx
import React from 'react';
import { User, Crown, Edit3, Mail, Calendar, Shield } from 'lucide-react';

const UserProfile = ({ user, isEditing = false }) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'editor': return <Edit3 className="w-5 h-5 text-blue-500" />;
      default: return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Administrador'
      },
      editor: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Editor'
      },
      usuario: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Usuario'
      }
    };

    const roleConfig = config[role] || config.usuario;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleConfig.bg} ${roleConfig.text}`}>
        {roleConfig.label}
      </span>
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <div className="flex items-center space-x-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {getInitials(user.nombre)}
          </div>
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md">
            {getRoleIcon(user.rol)}
          </div>
        </div>

        {/* Información básica */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900">{user.nombre}</h3>
          <div className="flex items-center space-x-2 mt-1 text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            {getRoleBadge(user.rol)}
            {user.activo ? (
              <span className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Activo
              </span>
            ) : (
              <span className="flex items-center text-sm text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Inactivo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID de Usuario</label>
            <p className="mt-1 text-sm text-gray-900">{user.usuario || user.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
            <p className="mt-1 text-sm text-gray-900">
              {user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString('es-ES') : 'No disponible'}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Último Acceso</label>
            <p className="mt-1 text-sm text-gray-900">
              {user.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleDateString('es-ES') : 'Nunca'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Permisos</label>
            <div className="mt-1 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                {user.puede_editar ? 'Puede editar hallazgos' : 'Solo lectura'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas del usuario (opcional) */}
      {user.estadisticas && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Estadísticas</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{user.estadisticas.hallazgos_creados || 0}</p>
              <p className="text-sm text-gray-600">Hallazgos Creados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{user.estadisticas.hallazgos_cerrados || 0}</p>
              <p className="text-sm text-gray-600">Hallazgos Cerrados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{user.estadisticas.hallazgos_abiertos || 0}</p>
              <p className="text-sm text-gray-600">Hallazgos Abiertos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;