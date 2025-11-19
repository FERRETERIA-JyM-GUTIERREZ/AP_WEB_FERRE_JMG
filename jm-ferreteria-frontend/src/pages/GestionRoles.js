import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RoleManagement from '../components/RoleManagement';
import RolePermissionInfo from '../components/RolePermissionInfo';

const GestionRoles = () => {
  const { hasPermission } = useAuth();
  const { isDarkMode } = useTheme();

  if (!hasPermission('usuarios.view')) {
    return (
      <div className={`min-h-screen py-8 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`border rounded-xl p-8 text-center transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
            <svg className={`w-16 h-16 mx-auto mb-4 transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className={`text-2xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
              Acceso Denegado
            </h2>
            <p className={`text-lg transition-colors ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
              No tienes permisos para acceder a la gestión de roles y permisos.
            </p>
            <p className={`mt-2 transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
              Contacta al administrador si necesitas acceso a esta funcionalidad.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Información del usuario actual */}
        <RolePermissionInfo />
        
        {/* Gestión de roles */}
        <RoleManagement />
      </div>
    </div>
  );
};

export default GestionRoles;


