import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import permissionService from '../services/permissionService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      permissionService.init(userData);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔄 AuthContext: Iniciando login...');
      const response = await authService.login(credentials);
      const { user: loginUser, token } = response.data;
      
      console.log('👤 AuthContext: Usuario recibido del login:', loginUser);
      console.log('🔑 AuthContext: Token recibido:', token);
      
      // Guardar token primero
      localStorage.setItem('token', token);
      
      // Obtener el usuario completo con todos los campos (phone, address, dni, created_at, etc.)
      try {
        const userResponse = await authService.getUser();
        const fullUser = userResponse.data.user;
        console.log('👤 AuthContext: Usuario completo obtenido:', fullUser);
        
        // Guardar usuario completo en localStorage
        localStorage.setItem('user', JSON.stringify(fullUser));
        setUser(fullUser);
        permissionService.init(fullUser);
        
        console.log('✅ AuthContext: Login completado, usuario completo establecido:', fullUser);
        return { success: true, user: fullUser };
      } catch (userError) {
        console.warn('⚠️ AuthContext: No se pudo obtener usuario completo, usando datos del login:', userError);
        // Si falla obtener el usuario completo, usar los datos del login
        localStorage.setItem('user', JSON.stringify(loginUser));
        setUser(loginUser);
        permissionService.init(loginUser);
        return { success: true, user: loginUser };
      }
    } catch (error) {
      console.error('❌ AuthContext: Error en login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  const register = async (formData) => {
    try {
      console.log('🔄 AuthContext: Iniciando registro...');
      const data = await authService.register(formData);
      console.log('📦 AuthContext: Datos recibidos:', data);
      
      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        permissionService.init(data.user);
        console.log('✅ AuthContext: Usuario registrado y logueado');
        return { success: true };
      }
      console.log('❌ AuthContext: No se recibieron token o usuario');
      return { success: false, message: data?.message || 'Error al registrarse' };
    } catch (error) {
      console.error('💥 AuthContext: Error en registro:', error);
      return { success: false, message: error.response?.data?.message || 'Error al registrarse' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const response = await authService.getGoogleUrl();
      
      if (response.success && response.url) {
        window.location.href = response.url;
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Error al obtener la URL de Google' 
        };
      }
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión con Google. Verifique que las credenciales de Google OAuth estén configuradas en el backend.';
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      permissionService.init(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      const updatedUser = response.data.user;
      
      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al actualizar perfil' 
      };
    }
  };

  const getUser = async () => {
    try {
      const response = await authService.getUser();
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      permissionService.init(userData);
      return userData;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const isAdmin = () => {
    return user?.rol === 'admin';
  };

  const isVendedor = () => {
    return user?.rol === 'vendedor' || user?.rol === 'admin';
  };

  // Funciones de permisos
  const hasPermission = (permission) => {
    return permissionService.hasPermission(permission);
  };

  const hasAnyPermission = (permissions) => {
    return permissionService.hasAnyPermission(permissions);
  };

  const hasAllPermissions = (permissions) => {
    return permissionService.hasAllPermissions(permissions);
  };

  const canManageInventory = () => {
    return permissionService.canManageInventory();
  };

  const canViewReports = () => {
    return permissionService.canViewReports();
  };

  const canManageUsers = () => {
    return permissionService.canManageUsers();
  };

  const getCurrentRoleInfo = () => {
    return permissionService.getCurrentRoleInfo();
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    getUser,
    updateProfile,
    isAuthenticated,
    isAdmin,
    isVendedor,
    // Funciones de permisos
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageInventory,
    canViewReports,
    canManageUsers,
    getCurrentRoleInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 