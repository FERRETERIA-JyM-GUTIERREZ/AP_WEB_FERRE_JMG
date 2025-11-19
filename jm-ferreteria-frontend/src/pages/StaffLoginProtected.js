import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StaffLoginProtected = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      console.log('🔄 Usuario ya autenticado en StaffLoginProtected, redirigiendo...');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const CORRECT_PASSWORD = 'FERRETERIAGUTIERREZ26';
  const MAX_ATTEMPTS = 3;
  const BLOCK_DURATION = 30000; // 30 segundos

  const handleImageClick = () => {
    if (isBlocked) {
      toast.error('Acceso bloqueado temporalmente. Intenta más tarde.');
      return;
    }
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      toast.success('¡Acceso autorizado!');
      setShowPasswordModal(false);
      navigate('/staff-login');
      setPassword('');
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        toast.error('Demasiados intentos fallidos. Acceso bloqueado por 30 segundos.');
        setShowPasswordModal(false);
        setPassword('');
        
        // Desbloquear después de 30 segundos
        setTimeout(() => {
          setIsBlocked(false);
          setAttempts(0);
          toast.info('Acceso desbloqueado. Puedes intentar nuevamente.');
        }, BLOCK_DURATION);
      } else {
        toast.error(`Contraseña incorrecta. Intentos restantes: ${MAX_ATTEMPTS - newAttempts}`);
        setPassword('');
      }
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPassword('');
  };

  // No necesitamos mostrar el login aquí, se redirige a /login
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Pantalla de Camuflaje */}
      <div className="relative w-full max-w-md mx-auto">
        {/* Imagen de Camuflaje */}
        <div 
          className="relative cursor-pointer group transition-transform duration-300 hover:scale-105"
          onClick={handleImageClick}
        >
          <img 
            src="/img/logoLogin.jpg" 
            alt="J&M Gutiérrez - Ferretería" 
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
          
          {/* Overlay sutil para indicar que es clickeable */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-2xl flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Texto descriptivo */}
        <div className="text-center mt-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">J&M Gutiérrez</h1>
          <p className="text-gray-600 text-sm">Ferretería y Construcción</p>
          <p className="text-gray-500 text-xs mt-2">Haz clic en la imagen para acceder</p>
        </div>
      </div>

      {/* Modal de Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            {/* Header del Modal */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
              <p className="text-gray-600 text-sm">Ingresa la contraseña para continuar</p>
            </div>

            {/* Formulario de Contraseña */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña de Acceso
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ingresa la contraseña"
                  autoFocus
                  required
                />
              </div>

              {/* Información de intentos */}
              {attempts > 0 && (
                <div className="text-center">
                  <p className="text-sm text-orange-600">
                    Intentos fallidos: {attempts}/{MAX_ATTEMPTS}
                  </p>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-500 hover:from-orange-500 hover:via-yellow-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Acceder
                </button>
              </div>
            </form>

            {/* Información de Seguridad */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Acceso Restringido:</strong> Solo personal autorizado. 
                    Las credenciales son proporcionadas por el administrador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffLoginProtected;
