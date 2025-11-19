import React from 'react';
import { Link } from 'react-router-dom';

const LoginSelector = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
      backgroundImage: 'url(/img/security-shield-bg.svg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay oscuro para mejor legibilidad */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-float-up flex flex-col items-center space-y-4">
          <div className="transform hover:scale-110 transition-transform duration-300 animate-rotate-3d drop-shadow-2xl">
            <img src="/img/iconoLogin.png" alt="Login Icon" className="h-20 w-20" />
          </div>
          
          {/* Banner minimalista */}
          <div className="px-6 py-3 bg-gradient-to-r from-red-600/10 via-orange-500/10 to-red-400/10 rounded-2xl border border-red-300/70 shadow-lg animate-pulse-glow">
            <div className="flex items-center justify-center space-x-2 text-red-600 font-semibold text-sm drop-shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>Acceso para Personal</p>
            </div>
          </div>
        </div>

        {/* Card con efecto 3D */}
        <div className="bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 transform hover:scale-105 transition-all duration-300 animate-float-up" style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(239, 68, 68, 0.3)',
          animationDelay: '0.2s'
        }}>
          {/* Header del card con gradiente rojo/naranja */}
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 px-6 py-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white">
                🔐 Acceso Personal
              </h2>
              <p className="text-red-100 text-xs font-medium">
                Zona exclusiva para administradores y vendedores
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Description */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Eres administrador o vendedor?
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Acceso exclusivo para el personal autorizado de J&M GUTIÉRREZ. Administra inventario, ventas y reportes de manera segura.
              </p>
            </div>

            {/* Info Alert - 3D Elegante */}
            <div className="relative mb-6 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-300 via-red-400 to-red-500 rounded-xl blur-sm opacity-60 animate-pulse-glow"></div>
              <div className="relative bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 border-3 border-red-400/60 rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300" style={{
                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
              }}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg transform hover:scale-110 transition-transform">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="text-sm font-bold text-red-900 mb-2 drop-shadow-md">
                      🔐 Acceso Restringido
                    </h4>
                    <p className="text-xs text-red-800 leading-relaxed drop-shadow-sm">
                      Solo personal autorizado. Tu cuenta debe ser creada por el administrador.
                      <strong className="text-red-900 block mt-1"> No es posible registrarse aquí.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <Link
              to="/staff-login"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-red-600 via-orange-500 to-red-600 hover:from-red-700 hover:via-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 animate-slide-in-right"
              style={{ animationDelay: '0.6s' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Iniciar Sesión - Personal
            </Link>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/50 text-gray-600 font-medium">o</span>
              </div>
            </div>

            {/* Back to Login */}
            <div className="text-center pt-4 animate-slide-in-left" style={{ animationDelay: '0.8s' }}>
              <Link
                to="/login"
                className="text-sm font-bold transition-colors duration-200 underline drop-shadow-lg"
                style={{ color: '#0000FF' }}
                onMouseEnter={(e) => e.target.style.color = '#0066FF'}
                onMouseLeave={(e) => e.target.style.color = '#0000FF'}
              >
                ← Volver al Login de Clientes
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 drop-shadow-lg">
            © 2024 J&M GUTIÉRREZ. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-400 mt-2 drop-shadow-lg">
            Selecciona correctamente tu tipo de acceso para garantizar la seguridad de tu cuenta.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelector;
