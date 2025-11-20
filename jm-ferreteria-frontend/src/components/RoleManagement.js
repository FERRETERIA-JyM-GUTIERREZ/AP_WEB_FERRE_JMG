import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const RoleManagement = () => {
  const { user, hasPermission } = useAuth();
  const { isDarkMode } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState({});
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (hasPermission('usuarios.view')) {
      loadData();
    }
  }, [hasPermission]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesRes, rolesRes, permissionsRes] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/roles'),
        axios.get('/api/permissions')
      ]);

      // Validar y establecer datos con valores por defecto
      setEmployees(employeesRes.data?.employees || employeesRes.data?.data || []);
      setRoles(rolesRes.data?.roles || rolesRes.data?.data || {});
      setPermissions(permissionsRes.data?.permissions || permissionsRes.data?.data || {});
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos');
      // Asegurar que siempre haya valores por defecto
      setEmployees([]);
      setRoles({});
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (employee) => {
    setSelectedUser(employee);
    setShowModal(true);
  };

  const handleUpdateUser = async (formData) => {
    try {
      await axios.put(`/api/users/${selectedUser.id}/permissions`, formData);
      toast.success('Usuario actualizado correctamente');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  if (!hasPermission('usuarios.view')) {
    return (
      <div className={`border rounded-xl p-6 text-center transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
        <svg className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className={`text-lg font-semibold mb-2 transition-colors ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
          Acceso Denegado
        </h3>
        <p className={`transition-colors ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
          No tienes permisos para gestionar usuarios
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 transition-colors ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-xl shadow-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-slate-800/90 border border-slate-700/50 hover:border-slate-600' : 'bg-white hover:shadow-lg'}`}>
        <h2 className={`text-2xl font-bold mb-6 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Gestión de Roles y Permisos
        </h2>
        
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y transition-colors ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
            <thead className={`transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-slate-700/80 via-slate-700/60 to-slate-700/80 border-b-2 border-slate-600/50' : 'bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Empleado
                  </div>
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Rol
                  </div>
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estado
                  </div>
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Último Acceso
                  </div>
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'}`}>
              {(employees || []).map((employee, index) => (
                <tr 
                  key={employee.id} 
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? index % 2 === 0 
                        ? 'bg-slate-800 hover:bg-slate-750' 
                        : 'bg-slate-800/50 hover:bg-slate-750'
                      : index % 2 === 0 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`}>
                        <span className="text-white font-semibold text-sm">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {employee.name}
                        </div>
                        <div className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                      employee.rol === 'admin' 
                        ? isDarkMode ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'
                        : employee.rol === 'vendedor' 
                          ? isDarkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800'
                          : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {roles[employee.rol] || employee.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                      employee.activo 
                        ? isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'
                        : isDarkMode ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {employee.ultimo_acceso 
                      ? new Date(employee.ultimo_acceso).toLocaleDateString()
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(employee)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 border border-blue-500/50' 
                          : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para editar usuario */}
      {showModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          roles={roles}
          permissions={permissions}
          onClose={() => setShowModal(false)}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
};

const UserEditModal = ({ user, roles, permissions, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    rol: user.rol,
    permisos: user.permisos || [],
    activo: user.activo
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permission)
        ? prev.permisos.filter(p => p !== permission)
        : [...prev.permisos, permission]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`}>
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className={`text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Gestionar Permisos
              </h3>
              <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.name} - {user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`text-2xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Rol del Empleado
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
            >
              {Object.entries(roles || {})
                .filter(([key]) => key !== 'cliente') // Solo mostrar roles de empleados
                .map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
            </select>
            <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Solo puedes asignar roles de empleado (Administrador o Vendedor)
            </p>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Estado
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                className="mr-2"
              />
              <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Usuario activo</span>
            </label>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Permisos Específicos
            </label>
            <div className={`rounded-lg p-4 transition-colors ${isDarkMode ? 'bg-slate-700/50 border border-slate-600' : 'bg-gray-50 border border-gray-200'}`}>
              <p className={`text-sm mb-3 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Los permisos se asignan automáticamente según el rol del empleado. 
                <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}> Administradores:</strong> Acceso completo al sistema.
                <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}> Vendedores:</strong> Acceso a inventario, ventas y reportes.
              </p>
              <div className="space-y-2">
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
                }`}>
                  <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Inventario</span>
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    formData.rol === 'admin' || formData.rol === 'vendedor'
                      ? isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {formData.rol === 'admin' ? 'Completo' : formData.rol === 'vendedor' ? 'Completo' : 'Sin acceso'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
                }`}>
                  <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Ventas</span>
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    formData.rol === 'admin' || formData.rol === 'vendedor'
                      ? isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {formData.rol === 'admin' ? 'Completo' : formData.rol === 'vendedor' ? 'Completo' : 'Sin acceso'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
                }`}>
                  <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Reportes</span>
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    formData.rol === 'admin' || formData.rol === 'vendedor'
                      ? isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {formData.rol === 'admin' ? 'Completo' : formData.rol === 'vendedor' ? 'Completo' : 'Sin acceso'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
                }`}>
                  <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Gestión de Usuarios</span>
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    formData.rol === 'admin'
                      ? isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {formData.rol === 'admin' ? 'Completo' : 'Sin acceso'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Aplicar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleManagement;
