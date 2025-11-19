import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const StaffOnlyLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, logout } = useAuth();
  
  // Estados
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Redirigir si ya está autenticado (solo al cargar la página, no después del login)
  useEffect(() => {
    if (isAuthenticated() && !shouldRedirect) {
      console.log('🔄 Usuario ya autenticado al cargar StaffOnlyLogin, redirigiendo...');
      navigate('/');
    }
  }, [isAuthenticated, navigate, shouldRedirect]);

  // Función para limpiar completamente la sesión
  const clearSession = async () => {
    try {
      // Limpiar localStorage manualmente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      await logout();
      window.location.reload();
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 Intentando login de personal con:', credentials);
      const result = await login(credentials);
      
      if (result.success) {
        console.log('✅ Login de personal exitoso');
        const userRole = result.user?.rol;
        
        // Validar que sea realmente personal
        if (userRole === 'admin' || userRole === 'vendedor' || userRole === 'empleado') {
          // Los empleados funcionan en el formulario de personal
          console.log('✅ Empleado logueado correctamente, redirigiendo según rol');
          console.log('🔄 Redirigiendo empleado según su rol...');
          toast.success('¡Bienvenido al sistema!');
          setLoading(false);
          setShouldRedirect(true);
          
          // Redirigir según el rol
          let redirectPath = '/';
          if (userRole === 'admin') {
            redirectPath = '/dashboard';
          } else if (userRole === 'vendedor' || userRole === 'empleado') {
            redirectPath = '/inventario';
          }
          
          setTimeout(() => {
            console.log('🚀 Ejecutando navegación de empleado a:', redirectPath);
            navigate(redirectPath);
          }, 100);
        } else if (userRole === 'cliente') {
          // Los clientes NO funcionan en el formulario de personal
          console.log('🚨 Cliente intentando acceder como empleado:', userRole);
          toast.error('Este acceso es solo para personal autorizado. Los clientes deben usar el formulario de "Cliente".');
          setLoading(false);
          await clearSession();
          return;
        } else {
          // Rol desconocido
          toast.error('Tipo de usuario no reconocido. Contacta al administrador.');
          setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111a3d] via-[#0f1734] to-[#090f24] relative overflow-hidden flex items-center justify-center py-10 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="smoke absolute -top-24 -left-16 w-[28rem] h-[28rem] bg-cyan-500/20 rounded-full"></div>
        <div className="smoke smoke-delay-1 absolute top-1/3 -right-20 w-[24rem] h-[24rem] bg-indigo-500/20 rounded-full"></div>
        <div className="smoke smoke-delay-2 absolute bottom-0 left-1/4 w-[32rem] h-[32rem] bg-blue-400/15 rounded-full"></div>
      </div>
      <div className="max-w-md w-full relative z-10">
        {/* Formulario de Personal */}
        <div className="relative overflow-hidden rounded-[32px] bg-white/10 backdrop-blur-2xl border border-white/15 shadow-[0_35px_90px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 mix-blend-screen"></div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="smoke absolute -top-16 left-1/3 w-40 h-40 bg-white/15 rounded-full"></div>
            <div className="smoke smoke-delay-1 absolute bottom-0 right-6 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>

          {/* Form Content */}
          <div className="relative z-10 p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <img src="/img/iconoLogin.png" alt="Login" className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido!</h2>
              <p className="text-white/80 text-sm">Acceso para personal</p>
              <p className="text-white/60 text-xs mt-1">(Administradores, vendedores, empleados)</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-2">Correo corporativo</label>
                <div className="relative">
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    className="w-full px-4 py-3 pl-12 bg-white/15 text-white placeholder-blue-200 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                    placeholder="tusuario@jmg.com"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full px-4 py-3 pl-12 pr-12 bg-white/15 text-white placeholder-blue-200 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-blue-100">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-cyan-400 border-white/40 bg-transparent rounded focus:ring-cyan-400"
                  />
                  <span>Recordar sesión</span>
                </label>
                <Link to="/forgot-password" className="text-blue-200 hover:text-white transition-colors duration-200">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-[0_20px_45px_rgba(249,115,22,0.35)] hover:shadow-[0_25px_55px_rgba(249,115,22,0.45)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </div>
                ) : (
                  'INICIAR SESIÓN'
                )}
              </button>
            </form>

            {/* Restricted Access Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-700/30 to-indigo-700/30 backdrop-blur-md rounded-2xl border border-blue-500/30">
              <p className="text-white font-semibold text-sm">⚠️ Acceso Restringido</p>
              <p className="text-blue-100 text-xs mt-1">
                Solo personal autorizado. Las credenciales son proporcionadas por el administrador. No es posible registrarse aquí.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffOnlyLogin;














