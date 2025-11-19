import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import permissionService from '../services/permissionService';

const RolePermissionInfo = () => {
  const { user, getCurrentRoleInfo } = useAuth();
  const { isDarkMode } = useTheme();
  const [roleInfo, setRoleInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      const info = getCurrentRoleInfo();
      setRoleInfo(info);
    }
  }, [user, getCurrentRoleInfo]);

  if (!user || !roleInfo) {
    return null;
  }

  const permissions = permissionService.getAllPermissions();
  const userPermissions = roleInfo.permissions;

  return (
    <div className={`rounded-xl shadow-xl p-6 mb-6 transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 border border-slate-700/50 hover:border-slate-600/70' : 'bg-white hover:shadow-lg border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {user.name}
            </h3>
            <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {roleInfo.name} • {userPermissions.length} permisos
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 border border-blue-500/50' 
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400'
          }`}
        >
          {showDetails ? 'Ocultar' : 'Ver'} Detalles
        </button>
      </div>

      {showDetails && (
        <div className={`border-t pt-4 transition-colors ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <h4 className={`text-md font-bold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Permisos del Usuario
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userPermissions.map(permission => (
              <div
                key={permission}
                className={`flex items-center p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-green-900/20 border-green-700/50 hover:bg-green-900/30' 
                    : 'bg-green-50 border-green-200 hover:bg-green-100'
                }`}
              >
                <svg className={`w-5 h-5 mr-2 transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {permissions[permission] || permission}
                </span>
              </div>
            ))}
          </div>
          
          {userPermissions.length === 0 && (
            <div className={`text-center py-8 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg className={`w-12 h-12 mx-auto mb-2 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p>No tienes permisos asignados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RolePermissionInfo;


