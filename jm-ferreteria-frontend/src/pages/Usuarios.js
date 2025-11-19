import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RolePermissionInfo from '../components/RolePermissionInfo';

// Configuración de URL de API
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || window.location.origin;
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

const API_BASE = getApiUrl();
const API_URL = `${API_BASE}/api/usuarios`;
const API_USER = `${API_BASE}/api/user`;

const initialForm = { name: '', email: '', password: '', rol: 'vendedor' };

const Usuarios = () => {
  const { hasPermission, canManageUsers } = useAuth();
  const { isDarkMode } = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [filtros, setFiltros] = useState({ buscar: '', rol: '', estado: '' });
  const [userName, setUserName] = useState('');
  const [userRol, setUserRol] = useState('');
  const [showSaludo, setShowSaludo] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    let userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || '');
        setUserRol(user.rol || '');
      } catch {
        setUserName('');
        setUserRol('');
      }
    } else {
      // Si no hay usuario en localStorage, pedirlo a la API
      const token = localStorage.getItem('token');
      if (token) {
        axios.get(API_USER, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            if (res.data && res.data.user) {
              localStorage.setItem('user', JSON.stringify(res.data.user));
              setUserName(res.data.user.name || '');
              setUserRol(res.data.user.rol || '');
            }
          })
          .catch(() => {
            setUserName('');
            setUserRol('');
          });
      }
    }
  }, []);

  useEffect(() => {
    if (!showSaludo) return;
    const handleClick = () => setShowSaludo(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showSaludo]);

  // Verificar permisos después de todos los hooks
  if (!hasPermission('usuarios.view')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-red-600 text-lg">
              No tienes permisos para acceder a la gestión de usuarios.
            </p>
            <p className="text-red-500 mt-2">
              Contacta al administrador si necesitas acceso a esta funcionalidad.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fetchUsuarios = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${API_URL}${query ? `?${query}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data.data);
    } catch (err) {
      setError('Error al obtener usuarios');
    }
    setLoading(false);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (err) {
      alert('Error al eliminar usuario');
    }
  };

  const openModal = (usuario = null) => {
    setFormError(null);
    if (usuario) {
      setEditId(usuario.id);
      setForm({
        name: usuario.name,
        email: usuario.email,
        password: '',
        rol: usuario.rol
      });
    } else {
      setEditId(null);
      setForm(initialForm);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    fetchUsuarios(filtros);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const token = localStorage.getItem('token');
      if (editId) {
        // Editar usuario
        await axios.put(`${API_URL}/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Crear usuario
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      closeModal();
      fetchUsuarios();
    } catch (err) {
      setFormError('Error al guardar usuario');
    }
  };

  // Mensaje de bienvenida dinámico
  let saludo = '';
  if (userName) {
    saludo = `¡Bienvenido, ${userName}!`;
  } else if (userRol === 'admin') {
    saludo = '¡Bienvenido Administrador!';
  } else if (userRol === 'vendedor') {
    saludo = '¡Bienvenido Vendedor!';
  } else {
    saludo = '¡Bienvenido al panel de usuarios!';
  }

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Información de roles y permisos */}
        <RolePermissionInfo />
        
        {/* Header */}
        {/* El mensaje grande de instrucciones se elimina */}
        <div className="relative mb-8">
          {/* Encabezado con icono y texto principal, centrado */}
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`text-lg md:text-xl font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Administra los usuarios del sistema</span>
            </div>
          </div>
          {/* Saludo destacado, que se puede cerrar al hacer click */}
          {showSaludo && (
            <div className="flex justify-center">
              <div className={`flex items-center gap-2 rounded-lg px-6 py-3 shadow-lg mt-8 text-lg font-semibold cursor-pointer select-none transition-colors ${isDarkMode ? 'bg-blue-900/30 border border-blue-700 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-900'}`} onClick={() => setShowSaludo(false)}>
                <svg className={`w-7 h-7 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                </svg>
                <span>{userName ? `¡Bienvenido, ${userName}!` : '¡Bienvenido!'}</span>
              </div>
            </div>
          )}
          {/* Botón Agregar Usuario */}
          <div className="flex justify-end mt-6">
            <button
              className="flex items-center gap-2 bg-green-600 text-white px-7 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-green-300"
              onClick={() => openModal()}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 8h-2m1-1v2" />
              </svg>
              Agregar Usuario
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl shadow-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-blue-500/30' : 'bg-white hover:shadow-blue-200'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Empleados</p>
                <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-900'}`}>{usuarios.length}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-green-500/30' : 'bg-white hover:shadow-green-200'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Activos</p>
                <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-green-400' : 'text-gray-900'}`}>
                  {usuarios.filter(u => u.activo === true).length}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-yellow-500/30' : 'bg-white hover:shadow-yellow-200'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Admins</p>
                <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-yellow-400' : 'text-gray-900'}`}>
                  {usuarios.filter(u => u.rol === 'admin').length}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-purple-500/30' : 'bg-white hover:shadow-purple-200'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2.5 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Vendedores</p>
                <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-purple-400' : 'text-gray-900'}`}>
                  {usuarios.filter(u => u.rol === 'vendedor').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-xl shadow-xl p-6 mb-6 transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 border border-slate-700/50 hover:border-slate-600/70' : 'bg-white hover:shadow-lg border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className={`text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Filtros de Búsqueda</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="buscar"
                  value={filtros.buscar}
                  onChange={handleFiltroChange}
                  placeholder="Buscar usuarios..."
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500/50' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                />
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Rol
              </label>
              <div className="relative">
                <select
                  name="rol"
                  value={filtros.rol}
                  onChange={handleFiltroChange}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white focus:ring-orange-500 focus:border-orange-500/50' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                >
                  <option value="">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                </select>
                <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estado
              </label>
              <div className="relative">
                <select
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white focus:ring-orange-500 focus:border-orange-500/50' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-end">
              <button
                className={`w-full px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 border border-orange-500/50' 
                    : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400'
                }`}
                onClick={handleFiltrar}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className={`rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-slate-800/90 border border-slate-700/50 hover:border-slate-600' : 'bg-white hover:shadow-lg'}`}>
          <div className={`px-6 py-4 border-b transition-colors ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Empleados ({usuarios.length})
            </h3>
            <p className={`text-sm mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Solo se muestran usuarios con roles de administrador y vendedor. Los clientes se gestionan por separado.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y transition-colors ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              <thead className={`transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-slate-700/80 via-slate-700/60 to-slate-700/80 border-b-2 border-slate-600/50' : 'bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-200'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Usuario
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Fecha Creación
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
                {usuarios.map((usuario, index) => (
                  <tr 
                    key={usuario.id} 
                    className={`transition-colors duration-200 ${
                      isDarkMode 
                        ? index % 2 === 0 
                          ? 'bg-slate-800 hover:bg-slate-750' 
                          : 'bg-slate-800/50 hover:bg-slate-750'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-orange-600' : 'bg-orange-600'}`}>
                            <span className="text-white font-semibold">
                              {usuario.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {usuario.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                        usuario.rol === 'admin' 
                          ? isDarkMode ? 'bg-purple-900/40 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800'
                          : isDarkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {usuario.rol === 'admin' ? 'Administrador' : 'Vendedor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'}`}>
                        Activo
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {usuario.created_at ? usuario.created_at.substring(0, 10) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className={`px-3 py-1.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-1.5 ${
                            isDarkMode 
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/30 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20' 
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200 hover:border-yellow-400 hover:shadow-md'
                          }`} 
                          onClick={() => openModal(usuario)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button 
                          className={`px-3 py-1.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-1.5 ${
                            isDarkMode 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20' 
                              : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 hover:border-red-400 hover:shadow-md'
                          }`} 
                          onClick={() => handleEliminar(usuario.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de agregar/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4 py-8">
          <div
            className={`relative w-full max-w-lg overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-[0_30px_90px_rgba(15,23,42,0.55)] transition-all duration-300 ${
              isDarkMode
                ? 'border-slate-700/60 bg-gradient-to-br from-slate-950/95 via-slate-900/88 to-slate-850/85 text-slate-100'
                : 'border-slate-100 bg-white text-slate-900'
            }`}
          >
            <div className="pointer-events-none absolute -top-28 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-6rem] left-[-3rem] h-60 w-60 rounded-full bg-sky-500/18 blur-[120px]" />
            <div className="relative z-10">
              <button
                className={`absolute top-4 right-4 text-2xl font-semibold transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-orange-200' : 'text-slate-400 hover:text-slate-600'
                }`}
                onClick={closeModal}
                aria-label="Cerrar"
              >
                ×
              </button>

              <div className="mb-6 pr-8">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                    isDarkMode
                      ? 'border-orange-400/60 bg-gradient-to-r from-orange-500/25 via-orange-400/25 to-rose-400/25 text-orange-100'
                      : 'border-orange-300 bg-gradient-to-r from-orange-100 via-orange-200 to-rose-100 text-orange-700'
                  }`}
                >
                  Gestión interna
                </span>
                <h2 className={`mt-3 text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {editId ? 'Editar Usuario' : 'Agregar Usuario'}
                </h2>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-300/80' : 'text-slate-500'}`}>
                  Ingresa las credenciales del colaborador que tendrá acceso al sistema.
                </p>
              </div>

              {formError && (
                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                    isDarkMode ? 'border-rose-500/40 bg-rose-500/15 text-rose-100' : 'border-rose-200 bg-rose-50 text-rose-600'
                  }`}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-[0.28em] mb-2 ${isDarkMode ? 'text-slate-300/90' : 'text-slate-500'}`}>
                    Nombre completo
                  </label>
                  <div
                    className={`rounded-2xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'border-slate-700/60 bg-slate-900/65 focus-within:border-orange-400/70'
                        : 'border-slate-200 bg-white focus-within:border-orange-400'
                    }`}
                  >
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Ej. María Gonzales"
                      className={`w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors ${
                        isDarkMode ? 'bg-transparent text-white placeholder-slate-500' : 'bg-transparent text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-[0.28em] mb-2 ${isDarkMode ? 'text-slate-300/90' : 'text-slate-500'}`}>
                    Email corporativo
                  </label>
                  <div
                    className={`rounded-2xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'border-slate-700/60 bg-slate-900/65 focus-within:border-orange-400/70'
                        : 'border-slate-200 bg-white focus-within:border-orange-400'
                    }`}
                  >
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="correo@empresa.com"
                      className={`w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors ${
                        isDarkMode ? 'bg-transparent text-white placeholder-slate-500' : 'bg-transparent text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-[0.28em] mb-2 ${isDarkMode ? 'text-slate-300/90' : 'text-slate-500'}`}>
                    Contraseña
                    {editId && (
                      <span className={`ml-2 text-[11px] font-normal normal-case tracking-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        (déjalo vacío si no deseas cambiarla)
                      </span>
                    )}
                  </label>
                  <div
                    className={`rounded-2xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'border-slate-700/60 bg-slate-900/65 focus-within:border-orange-400/70'
                        : 'border-slate-200 bg-white focus-within:border-orange-400'
                    }`}
                  >
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder={editId ? '••••••••' : 'Mínimo 6 caracteres'}
                      className={`w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors ${
                        isDarkMode ? 'bg-transparent text-white placeholder-slate-500' : 'bg-transparent text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-[0.28em] mb-2 ${isDarkMode ? 'text-slate-300/90' : 'text-slate-500'}`}>
                    Rol del usuario
                  </label>
                  <div
                    className={`rounded-2xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'border-slate-700/60 bg-slate-900/70 focus-within:border-orange-400/80'
                        : 'border-slate-200 bg-white focus-within:border-orange-400'
                    }`}
                  >
                    <select
                      name="rol"
                      value={form.rol}
                      onChange={handleChange}
                      required
                      className={`w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors ${
                        isDarkMode ? 'bg-slate-900/80 text-white focus:bg-slate-900 focus:text-white' : 'bg-white text-slate-900'
                      }`}
                    >
                      <option value="admin">Administrador</option>
                      <option value="vendedor">Vendedor</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-600/60'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`rounded-full px-5 py-2 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(251,146,60,0.35)] transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 hover:from-orange-400 hover:via-orange-500 hover:to-rose-500'
                        : 'bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 hover:from-orange-400 hover:via-orange-500 hover:to-rose-500'
                    }`}
                  >
                    {editId ? 'Guardar Cambios' : 'Agregar Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios; 