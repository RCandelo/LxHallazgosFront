// components/layout/UserMenu.jsx
import React, { useState } from 'react';
import { Settings, User, Users, LogOut } from 'lucide-react';
import { canManage } from '../../../utils/permissions';

const UserMenu = ({ currentUser, onLogout, onShowProfile, onShowUserAdmin }) => {
  const [showMenu, setShowMenu] = useState(false);
  const canEditUsers = canManage(currentUser);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {currentUser?.nombre?.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block">
          <span className="text-sm font-medium text-gray-700">{currentUser?.nombre}</span>
          <div className="text-xs text-gray-500">{currentUser?.email}</div>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
            <button
              onClick={() => {
                setShowMenu(false);
                onShowProfile();
              }}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Mi Perfil</span>
            </button>

            {canEditUsers && (
              <>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onShowUserAdmin();
                  }}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Administrar Usuarios</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}

            <button
              onClick={() => {
                setShowMenu(false);
                onLogout();
              }}
              className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;