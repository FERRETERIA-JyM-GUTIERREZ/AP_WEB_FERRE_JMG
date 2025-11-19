import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const SideBySideLogin = () => {
  const location = useLocation();
  const isFromProtected = location.state?.fromProtected || false;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [clientCredentials, setClientCredentials] = useState({
    email: '',
    password: ''
  });
  const [staffCredentials, setStaffCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [activeForm, setActiveForm] = useState('client'); // Solo cliente por defecto
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { login, loginWithGoogle, logout } = useAuth();
  
  // Redirigir si ya está autenticado (solo al cargar la página, no después del login)
  useEffect(() => {
    if (isAuthenticated() && !shouldRedirect) {
      console.log('🔄 Usuario ya autenticado al cargar página, redirigiendo...');
      navigate('/');
    }
  }, [isAuthenticated, navigate, shouldRedirect]);

  // Función para limpiar completamente la sesión
  const clearSession = async () => {
    try {
      // Limpiar localStorage manualmente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Llamar al logout del contexto
      await logout();
      
      // Forzar limpieza del estado
      window.location.reload();
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 Intentando login de cliente con:', clientCredentials);
      console.log('🔍 ANTES del login - isAuthenticated():', isAuthenticated());
      console.log('🔍 ANTES del login - user:', user);
      
      const result = await login(clientCredentials);
      
      console.log('🔍 DESPUÉS del login - result:', result);
      console.log('🔍 DESPUÉS del login - isAuthenticated():', isAuthenticated());
      console.log('🔍 DESPUÉS del login - user:', user);
      
      if (result.success) {
        console.log('✅ Login de cliente exitoso');
        console.log('👤 Usuario completo:', result.user);
        console.log('🎭 Rol del usuario:', result.user?.rol);
        const userRole = result.user?.rol;
        
        // Validar que sea realmente un cliente
        if (userRole === 'cliente') {
          // Los clientes funcionan en el formulario de cliente
          console.log('🔄 Redirigiendo cliente a página principal...');
          console.log('👤 Usuario después del login:', result.user);
          console.log('🔑 Token guardado:', localStorage.getItem('token'));
          toast.success('¡Bienvenido de vuelta!');
          setLoading(false);
          setShouldRedirect(true);
          
          // Redirigir según el rol
          let redirectPath = '/';
          
          setTimeout(() => {
            console.log('🚀 Ejecutando navegación a:', redirectPath);
            console.log('🔍 Verificando estado después del login:');
            console.log('  - Usuario en AuthContext:', user);
            console.log('  - Token en localStorage:', localStorage.getItem('token'));
            console.log('  - Usuario en localStorage:', localStorage.getItem('user'));
            console.log('  - isAuthenticated():', isAuthenticated());
            navigate(redirectPath);
          }, 100);
        } else if (userRole === 'admin' || userRole === 'vendedor' || userRole === 'empleado') {
          // Los empleados NO funcionan en el formulario de cliente
          console.log('🚨 Empleado intentando acceder como cliente:', userRole);
          toast.error('Este formulario es solo para clientes. Los empleados deben usar el acceso de "Personal".');
          setLoading(false);
          await clearSession();
          return;
        } else {
          // Rol desconocido
          console.log('❓ Rol desconocido:', userRole);
          toast.error('Tipo de usuario no reconocido. Contacta al administrador.');
          setLoading(false);
          await clearSession();
          return;
        }
      } else {
        console.log('❌ Error en login:', result.message);
        toast.error(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('💥 Error completo en login:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 Intentando login de personal con:', staffCredentials);
      const result = await login(staffCredentials);
      
      if (result.success) {
        console.log('✅ Login de personal exitoso');
        const userRole = result.user?.rol;
        
        // Validar que sea realmente personal (no cliente)
        if (userRole === 'admin' || userRole === 'vendedor' || userRole === 'empleado') {
          toast.success('¡Bienvenido al sistema!');
          
          // Redirigir según el rol del usuario
          if (userRole === 'admin') {
            navigate('/dashboard');
          } else if (userRole === 'vendedor' || userRole === 'empleado') {
            navigate('/inventario');
          } else {
            navigate('/dashboard');
          }
        } else if (userRole === 'cliente') {
          // Si es cliente, hacer logout y cambiar al formulario correcto
          await logout();
          toast.error('Este formulario es solo para personal. Los clientes deben usar el formulario de "Cliente".');
          setActiveForm('client'); // Cambiar al formulario de cliente
          setLoading(false);
          return;
        } else {
          // Rol desconocido
          console.log('❓ Rol desconocido:', userRole);
          toast.error('Tipo de usuario no reconocido. Contacta al administrador.');
          setLoading(false);
          await clearSession();
          return;
        }
      } else {
        console.log('❌ Error en login:', result.message);
        toast.error(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('💥 Error completo en login:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      const result = await loginWithGoogle();
      
      if (result.success) {
        console.log('✅ Google login exitoso');
        console.log('👤 Usuario completo:', result.user);
        console.log('🎭 Rol del usuario:', result.user?.rol);
        const userRole = result.user?.rol;
        
        // Validar que sea realmente un cliente
        if (userRole === 'cliente') {
          // Los clientes funcionan en el formulario de cliente
          console.log('🔄 Redirigiendo cliente con Google a página principal...');
          toast.success('¡Inicio de sesión con Google exitoso!');
          setLoading(false);
          setShouldRedirect(true);
          
          setTimeout(() => {
            console.log('🚀 Ejecutando navegación con Google a: /');
            navigate('/');
          }, 100);
        } else if (userRole === 'admin' || userRole === 'vendedor' || userRole === 'empleado') {
          // Los empleados NO funcionan en el formulario de cliente
          console.log('🚨 Empleado intentando acceder como cliente con Google:', userRole);
          toast.error('Este formulario es solo para clientes. Los empleados deben usar el acceso de "Personal".');
          setLoading(false);
          await clearSession();
          return;
        } else {
          // Rol desconocido
          console.log('❓ Rol desconocido en Google:', userRole);
          toast.error('Tipo de usuario no reconocido. Contacta al administrador.');
          setLoading(false);
          await clearSession();
          return;
        }
      } else {
        toast.error(result.message || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Error en Google login:', error);
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src="/img/logo.png" alt="J&M GUTIÉRREZ" className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">J&M GUTIÉRREZ</h1>
          <p className="text-gray-600 text-sm">Ferretería y Construcción</p>
        </div>

        {/* Dos formularios lado a lado */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario de Personal - Camuflado con imagen */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer group" onClick={() => navigate('/staff-protected')}>
            {/* Imagen de Camuflaje */}
            <img 
              src="/img/logoLogin.jpg" 
              alt="J&M Gutiérrez - Ferretería" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Formulario de Cliente */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-rose-900/50"></div>
            </div>
            
            {/* Animated Smoke Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute top-1/4 -right-5 w-16 h-16 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-1/4 -left-8 w-24 h-24 bg-white/8 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white/6 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-1/3 right-1/3 w-18 h-18 bg-white/7 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>
            
            {/* Form Content */}
            <div className="relative z-10 p-6 h-full min-h-[500px] flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <img src="/img/iconoLogin.png" alt="Login" className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido!</h2>
                <p className="text-white/80 text-sm">Acceso para clientes</p>
                <p className="text-white/60 text-xs mt-1">(Solo usuarios con rol "cliente")</p>
              </div>

              <form onSubmit={handleStaffSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-4 border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                      placeholder="admin@ferreteria.com"
                      value={staffCredentials.email}
                      onChange={(e) => setStaffCredentials({ ...staffCredentials, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showStaffPassword ? "text" : "password"}
                      required
                      className="block w-full pl-10 pr-12 py-3 border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                      placeholder="********"
                      value={staffCredentials.password}
                      onChange={(e) => setStaffCredentials({ ...staffCredentials, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors duration-200"
                    >
                      {showStaffPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="remember-me-staff"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-white/30 rounded bg-white/10"
                  />
                  <label htmlFor="remember-me-staff" className="ml-2 block text-sm text-white">
                    Acepto los términos de uso
                  </label>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando...
                    </>
                  ) : (
                    'INICIAR SESIÓN'
                  )}
                </button>

                {/* Register Button */}
                <div className="mt-4">
                  <Link
                    to="/register"
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    ¡Regístrate aquí!
                  </Link>
                </div>

                {/* Google Login */}
                <div className="mt-4">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Iniciar sesión con Google
                  </button>
                </div>

                {/* Access Info */}
                <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-200">
                        Información Importante
                      </h3>
                      <div className="mt-2 text-sm text-blue-300">
                        <p>
                          Registro gratuito disponible. Puedes usar tu cuenta de Google para mayor comodidad.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 J&M GUTIÉRREZ. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideBySideLogin;
