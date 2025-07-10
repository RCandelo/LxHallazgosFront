import React, { useState } from 'react';
import { Users, Search, UserPlus } from 'lucide-react';
import BaseModal from './BaseModal';
import UserAdminTable from '../users/UserAdminTable';
import UserForm from '../users/UserForm';
import { usersService } from '../../../services/users.service';

const UserAdminModal = ({ 
  isOpen, 
  onClose, 
  users, 
  onReloadUsers, 
  showNotification, 
  currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = users.filter(user =>
    user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    console.log('Editando usuario desde modal:', user);
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      console.log('Desactivando usuario:', userId);
      await usersService.deleteUser(userId);
      await onReloadUsers();
      return Promise.resolve();
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  };

  const handleSaveUser = async (userData, userId = null) => {
    try {
      console.log('Guardando usuario:', { userData, userId, isEditing: !!userId });
      
      if (userId) {
        // Editando usuario existente
        await usersService.updateUser(userId, userData);
      } else {
        // Creando nuevo usuario
        await usersService.createUser(userData);
      }
      
      // Recargar lista de usuarios
      await onReloadUsers();
      
      // Cerrar formulario
      setShowUserForm(false);
      setEditingUser(null);
      
    } catch (error) {
      console.error('Error saving user:', error);
      throw error; // Re-throw para que UserForm maneje el error
    }
  };

  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Administración de Usuarios"
        icon={Users}
        maxWidth="max-w-6xl"
      >
        <div className="flex flex-col h-[calc(90vh-5rem)]">
          {/* Toolbar */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {filteredUsers.length} de {users.length} usuarios
                </span>
              </div>
              <button
                onClick={handleAddUser}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nuevo Usuario</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <UserAdminTable
              users={filteredUsers}
              currentUser={currentUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              showNotification={showNotification}
            />
          </div>
        </div>
      </BaseModal>

      {/* Modal para agregar/editar usuario */}
      {showUserForm && (
        <UserForm
          isOpen={showUserForm}
          onClose={handleCloseUserForm}
          onSave={handleSaveUser}
          user={editingUser}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default UserAdminModal;
