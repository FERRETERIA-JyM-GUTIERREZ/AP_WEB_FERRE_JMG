import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getUser } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log('🔄 Procesando callback de Google...');
        console.log('📍 URL completa:', window.location.href);
        
        // Obtener los parámetros de la URL
        const success = searchParams.get('success');
        const userParam = searchParams.get('user');
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        console.log('📋 Parámetros recibidos:', { success, userParam: !!userParam, token: !!token, error });

        if (error) {
          console.error('❌ Error de Google:', error);
          toast.error(`Error al iniciar sesión con Google: ${error}`, {
            duration: 6000,
            id: 'google-callback-error', // ID único para evitar duplicados
          });
          navigate('/login');
          return;
        }

        if (success === 'false') {
          console.error('❌ Login fallido - success=false');
          const errorMsg = searchParams.get('error') || 'Error al procesar el login con Google';
          toast.error(errorMsg, {
            duration: 6000,
            id: 'google-callback-error', // ID único para evitar duplicados
          });
          navigate('/login');
          return;
        }

        if (success === 'true' && userParam && token) {
          console.log('✅ Google login exitoso');
          
          // Parsear los datos del usuario
          const user = JSON.parse(userParam);
          console.log('👤 Usuario recibido:', user);
          console.log('🖼️ Avatar del usuario recibido:', user.avatar);
          console.log('🔑 Token recibido:', token);
          
          // Guardar token en localStorage
          localStorage.setItem('token', token);
          
          // Guardar usuario inicial en localStorage (con avatar si viene)
          localStorage.setItem('user', JSON.stringify(user));
          
          // Obtener el usuario completo del backend para asegurar que tenemos todos los datos actualizados (incluyendo avatar)
          try {
            console.log('🔄 Obteniendo usuario completo del backend...');
            const fullUser = await getUser();
            console.log('✅ Usuario completo obtenido:', fullUser);
            console.log('🖼️ Avatar del usuario completo:', fullUser?.avatar);
            
            if (fullUser && fullUser.avatar) {
              console.log('✅ Avatar confirmado en usuario completo:', fullUser.avatar);
            }
          } catch (userError) {
            console.warn('⚠️ No se pudo obtener usuario completo, usando datos del callback:', userError);
            // Si falla, usar los datos que ya tenemos del callback
          }
          
          // Mostrar mensaje de bienvenida
          const userRole = user.rol;
          let welcomeMessage = '¡Bienvenido!';
          let redirectPath = '/';
          
          if (userRole === 'admin') {
            redirectPath = '/dashboard';
            welcomeMessage = '¡Bienvenido Administrador!';
          } else if (userRole === 'vendedor' || userRole === 'empleado') {
            redirectPath = '/inventario';
            welcomeMessage = '¡Bienvenido al sistema!';
          } else if (userRole === 'cliente') {
            redirectPath = '/';
            welcomeMessage = '¡Bienvenido de vuelta!';
          }
          
          toast.success(welcomeMessage);
          
          // Redirigir usando navigate (sin recargar la página completa)
          setTimeout(() => {
            console.log('🚀 Redirigiendo a:', redirectPath);
            navigate(redirectPath, { replace: true });
          }, 500);
          
        } else {
          console.error('❌ Parámetros faltantes en la URL');
          console.error('📋 Parámetros disponibles:', {
            success,
            hasUser: !!userParam,
            hasToken: !!token,
            error
          });
          toast.error('Error al procesar el login con Google. Faltan parámetros en la respuesta.', {
            duration: 6000,
            id: 'google-callback-error', // ID único para evitar duplicados
          });
          navigate('/login');
        }
        
      } catch (error) {
        console.error('💥 Error procesando callback:', error);
        console.error('💥 Stack trace:', error.stack);
        toast.error(`Error al procesar el login con Google: ${error.message}`, {
          duration: 6000,
          id: 'google-callback-error', // ID único para evitar duplicados
        });
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, getUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
        <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Procesando login con Google...</h2>
        <p className="text-gray-300">Por favor espera mientras completamos tu autenticación</p>
      </div>
    </div>
  );
};

export default GoogleCallback;