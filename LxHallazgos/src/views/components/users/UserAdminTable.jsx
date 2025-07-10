import React from 'react';
import { Edit3, Trash2, Crown, User } from 'lucide-react';
import { showNotification } from '../../../utils/NotificationManager'; // ✅ Importar directamente

const UserAdminTable = ({ 
  users, 
  onEditUser, 
  onDeleteUser, 
  currentUser
  // showNotification // ❌ Ya no necesario como prop
}) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-4 h-4 text-red-500" />;
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor': return <Edit3 className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-yellow-100 text-yellow-800',
      editor: 'bg-blue-100 text-blue-800',
      usuario: 'bg-gray-100 text-gray-800',
      visualizador: 'bg-green-100 text-green-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[role] || colors.usuario}`;
  };

  const handleEditUser = (user) => {
    console.log('Editando usuario:', user);
    onEditUser(user);
  };

  const handleDeleteUser = async (user) => {
    // No permitir eliminar super_admin
    if (user.rol === 'super_admin') {
      showNotification('No se puede eliminar un Super Administrador', 'error');
      return;
    }

    // No permitir que el admin se desactive a sí mismo
    if (user.id === currentUser?.id) {
      showNotification('No puedes desactivar tu propia cuenta', 'error');
      return;
    }

    const activeAdminCount = users.filter(u => (u.rol === 'admin' || u.rol === 'super_admin') && u.estado).length;
    
    if ((user.rol === 'admin' || user.rol === 'super_admin') && user.estado && activeAdminCount <= 1) {
      showNotification('No puedes desactivar el último administrador activo', 'error');
      return;
    }

    const action = user.estado ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} al usuario "${user.nombre} ${user.apellido}"?`)) {
      try {
        await onDeleteUser(user.id);
        showNotification(`Usuario ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`, 'success');
      } catch (error) {
        console.error('Error modificando usuario:', error);
        showNotification(error.message || `Error al ${action} usuario`, 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No hay usuarios registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4 font-medium text-gray-700">Usuario</th>
            <th className="text-left p-4 font-medium text-gray-700">Rol</th>
            <th className="text-left p-4 font-medium text-gray-700">Permisos</th>
            <th className="text-left p-4 font-medium text-gray-700">Estado</th>
            <th className="text-left p-4 font-medium text-gray-700">Último Acceso</th>
            <th className="text-left p-4 font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.nombre} {user.apellido}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-blue-600">(Tú)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{user.correo}</div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.rol)}
                  <span className={getRoleBadge(user.rol)}>
                    {user.rol === 'super_admin' ? 'Super Admin' : 
                    user.rol?.charAt(0)?.toUpperCase() + user.rol?.slice(1) || 'Usuario'}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col space-y-1">
                  {user.puede_editar && (
                    <span className="text-xs text-green-600">✓ Puede editar</span>
                  )}
                  {user.zona && (
                    <span className="text-xs text-blue-600">Zona: {user.zona}</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-600">
                {formatDate(user.ultimo_acceso)}
              </td>
              <td className="p-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    title="Editar usuario"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className={`p-2 rounded-full transition-colors ${
                      user.estado 
                        ? 'text-red-600 hover:bg-red-100' 
                        : 'text-green-600 hover:bg-green-100'
                    } ${user.rol === 'super_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={
                      user.rol === 'super_admin' ? 'No se puede eliminar Super Admin' :
                      user.estado ? 'Desactivar usuario' : 'Activar usuario'
                    }
                    disabled={user.id === currentUser?.id || user.rol === 'super_admin'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserAdminTable;