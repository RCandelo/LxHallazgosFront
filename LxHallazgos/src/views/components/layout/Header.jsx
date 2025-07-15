import React from 'react';
import { Shield, BarChart3 } from 'lucide-react';
import UserMenu from './UserMenu';

const Header = ({ currentUser, onLogout, onShowProfile, onShowUserAdmin, canEditUsers, onShowDashboard }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y rol */}
          <div className="flex items-center space-x-6">
            {/* Logo SHEEQ */}
            <div className="flex flex-col leading-none">
              <div className="flex space-x-0 text-2xl font-bold">
                <span className="text-orange-500">S</span>
                <span className="text-blue-600">H</span>
                <span className="text-green-500">E</span>
                <span className="text-orange-500">E</span>
                <span className="text-blue-600">Q</span>
              </div>
              <div className="text-xs text-gray-600">Consulting</div>
            </div>

            {/* Título y rol */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Cierre de Hallazgos
              </h1>

              {currentUser?.rol && (
                <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 capitalize">{currentUser?.rol}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Button y Menú de usuario */}
          <div className="flex items-center space-x-4">
            {/* NUEVO BOTÓN DASHBOARD */}
            <button
              onClick={onShowDashboard}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
              title="Ver Dashboard Avanzado"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </button>

            {/* Menú de usuario */}
            <UserMenu 
              currentUser={currentUser}
              onLogout={onLogout}
              onShowProfile={onShowProfile}
              onShowUserAdmin={onShowUserAdmin}
              canEditUsers={canEditUsers}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;