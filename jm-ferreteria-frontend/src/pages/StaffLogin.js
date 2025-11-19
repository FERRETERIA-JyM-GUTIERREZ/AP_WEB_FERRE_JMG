import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const StaffLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 Intentando login de personal con:', credentials);
      const result = await login(credentials);
      
      if (result.success) {
        // Validar que el usuario tiene rol de personal
        const userRole = result.user?.rol;
        if (userRole !== 'admin' && userRole !== 'vendedor' && userRole !== 'empleado') {
          console.log('❌ Usuario no autorizado:', userRole);
          toast.error('❌ No tienes permisos para acceder como personal');
          // Limpiar sesión
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }

        console.log('✅ Login de personal exitoso con rol:', userRole);
        toast.success('¡Bienvenido al sistema!');
        
        // Redirigir según el rol
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'vendedor' || userRole === 'empleado') {
          navigate('/inventario');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.log('❌ Error en login:', result.message);
        toast.error(result.message || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('💥 Error en login:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1221] relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Smoke / Light layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="smoke absolute w-[30rem] h-[30rem] bg-blue-500/30 top-0 -left-16 rounded-full"></div>
        <div className="smoke smoke-delay-1 absolute w-[24rem] h-[24rem] bg-indigo-500/25 -bottom-10 right-0 rounded-full"></div>
        <div className="smoke smoke-delay-2 absolute w-[34rem] h-[34rem] bg-cyan-400/20 top-1/2 left-1/2 rounded-full"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900/70 to-slate-950/90"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-float-up flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-orange-400 via-pink-500 to-red-500 flex items-center justify-center shadow-[0_20px_45px_rgba(0,0,0,0.4)] animate-rotate-3d">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-blue-200 mb-2">Portal Corporativo</p>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)]">¡Bienvenido!</h1>
            <p className="text-blue-100 font-medium">
              Acceso exclusivo para administradores, vendedores y empleados
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-b from-[#111b34]/90 via-[#0e162b]/90 to-[#0b1221]/95 backdrop-blur-2xl rounded-[32px] shadow-[0_35px_90px_rgba(0,0,0,0.65)] border border-[#3b82f6]/20 p-8 space-y-8 animate-float-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Identifícate</p>
            <h2 className="text-2xl font-bold text-white">Control de Accesos</h2>
            <p className="text-blue-100 text-sm">
              Ingresa tus credenciales asignadas por el administrador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-blue-100">
                Correo corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition duration-200"
                  placeholder="tusuario@jmg.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-blue-100">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition duration-200"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-200 hover:text-white transition"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-blue-100 text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500 border-white/30 bg-transparent" />
                <span>Recordar sesión</span>
              </label>
              <button type="button" className="hover:underline text-blue-200">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-[0_15px_35px_rgba(249,115,22,0.35)] hover:shadow-[0_20px_45px_rgba(249,115,22,0.45)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-500/20 border border-blue-400/40 rounded-2xl p-4 shadow-inner space-y-2">
            <h3 className="text-white font-semibold flex items-center space-x-2">
              <span>⚠️</span>
              <span>Acceso Restringido</span>
            </h3>
            <p className="text-sm text-blue-100">
              Solo personal autorizado. Tus credenciales son gestionadas por el administrador. No es posible registrarse desde esta pantalla.
            </p>
          </div>

          {/* Client Access Link */}
          <div className="text-center">
            <p className="text-xs text-blue-200 mb-2">¿Necesitas ver el portal de clientes?</p>
            <Link
              to="/login"
              className="text-sm font-semibold text-orange-200 hover:text-yellow-200 underline transition-colors"
            >
              ← Volver al portal principal
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-blue-200 text-xs">
          © 2024 J&M GUTIÉRREZ · Sistema interno seguro
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
