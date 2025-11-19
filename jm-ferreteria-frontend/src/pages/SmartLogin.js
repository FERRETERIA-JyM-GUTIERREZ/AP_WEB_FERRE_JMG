import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SmartLogin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, loginWithGoogle, logout } = useAuth();
  
  // Estados
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated() && !shouldRedirect) {
      console.log('🔄 Usuario ya autenticado, redirigiendo...');
      navigate('/');
    }
  }, [isAuthenticated, navigate, shouldRedirect]);

  // Función para limpiar completamente la sesión
  const clearSession = async () => {
    try {
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
      console.log('🔐 Intentando login inteligente con:', credentials);
      console.log('🔍 ANTES del login - isAuthenticated():', isAuthenticated());
      console.log('🔍 ANTES del login - user:', user);
      
      const result = await login(credentials);
      
      console.log('🔍 DESPUÉS del login - result:', result);
      console.log('🔍 DESPUÉS del login - isAuthenticated():', isAuthenticated());
      console.log('🔍 DESPUÉS del login - user:', user);
      
      if (result.success) {
        console.log('✅ Login exitoso');
        console.log('👤 Usuario completo:', result.user);
        console.log('🎭 Rol del usuario:', result.user?.rol);
        const userRole = result.user?.rol;
        
        // Detección automática de rol y redirección inteligente
        let redirectPath = '/';
        let welcomeMessage = '¡Bienvenido!';
        
        if (userRole === 'admin') {
          redirectPath = '/dashboard';
          welcomeMessage = '¡Bienvenido Administrador!';
        } else if (userRole === 'vendedor' || userRole === 'empleado') {
          redirectPath = '/inventario';
          welcomeMessage = '¡Bienvenido al sistema!';
        } else if (userRole === 'cliente') {
          redirectPath = '/';
          welcomeMessage = '¡Bienvenido de vuelta!';
        } else {
          console.log('❓ Rol desconocido:', userRole);
          toast.error('Tipo de usuario no reconocido. Contacta al administrador.');
          setLoading(false);
          await clearSession();
          return;
        }
        
        console.log('🔄 Redirigiendo automáticamente a:', redirectPath);
        toast.success(welcomeMessage);
        setLoading(false);
        setShouldRedirect(true);
        
        setTimeout(() => {
          console.log('🚀 Ejecutando navegación inteligente a:', redirectPath);
          navigate(redirectPath);
        }, 100);
        
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
      console.log('🔄 Iniciando login con Google...');
      
      const result = await loginWithGoogle();
      console.log('📥 Resultado de loginWithGoogle:', result);
      
      if (result.success) {
        // Si el login fue exitoso, la redirección a Google ya se hizo
        // No necesitamos hacer nada más aquí
        console.log('✅ Redirección a Google exitosa');
        return;
      } else {
        // Mostrar el mensaje de error específico del backend
        console.error('❌ Error en loginWithGoogle:', result.message);
        toast.error(result.message || 'Error al iniciar sesión con Google', {
          duration: 6000,
          id: 'google-login-error', // ID único para evitar duplicados
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Error completo en Google login:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión con Google';
      toast.error(errorMessage, {
        duration: 6000,
        id: 'google-login-error', // ID único para evitar duplicados
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center p-4">
      {/* Fondo animado con humo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/img/iconoLogin.png" 
            alt="J&M GUTIÉRREZ" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white mb-2">J&M GUTIÉRREZ</h1>
          <p className="text-white/80 text-sm">Ferretería y Construcción</p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-white/80 text-sm">
              El sistema detecta automáticamente tu tipo de usuario
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? 'bg-white/20 text-white/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-white/60 text-sm">o</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              loading
                ? 'bg-white/20 text-white/60 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Información */}
          <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Sistema Inteligente</h4>
                <p className="text-white/70 text-xs">
                  El sistema detecta automáticamente si eres cliente, empleado o administrador y te redirige a la sección correspondiente.
                </p>
              </div>
            </div>
          </div>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-white hover:text-orange-200 transition-colors font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartLogin;






























