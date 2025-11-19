import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaShoppingCart, FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Perfil = () => {
  const { user, updateProfile, getUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dni: user?.dni || ''
  });

  // Obtener usuario completo al cargar el componente
  useEffect(() => {
    const loadFullUser = async () => {
      // Siempre obtener el usuario completo para asegurar que tenemos todos los datos (avatar, phone, address, etc.)
      if (user) {
        try {
          console.log('🔄 Perfil: Obteniendo usuario completo...');
          const fullUser = await getUser();
          console.log('✅ Perfil: Usuario completo obtenido:', fullUser);
        } catch (error) {
          console.error('❌ Perfil: Error al obtener usuario completo:', error);
        }
      }
    };
    
    loadFullUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar formData cuando el usuario cambie
  useEffect(() => {
    if (user) {
      console.log('👤 Perfil: Usuario actualizado:', user);
      console.log('🖼️ Perfil: Avatar del usuario:', user.avatar);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dni: user.dni || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
        toast.success('Perfil actualizado correctamente');
      } else {
        toast.error(result.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dni: user?.dni || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Gestiona tu información personal
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
          {/* Información del usuario */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 lg:mb-8">
            {user?.avatar && user.avatar.trim() !== '' ? (
              <img 
                key={user.avatar} // Forzar re-render si cambia el avatar
                src={user.avatar} 
                alt={user?.name || 'Avatar'} 
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-2 border-orange-200 object-cover mb-4 sm:mb-0 sm:mr-6 shadow-md"
                onError={(e) => {
                  console.error('❌ Error cargando avatar:', user.avatar);
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
                onLoad={() => {
                  console.log('✅ Avatar cargado correctamente:', user.avatar);
                }}
              />
            ) : (
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6"
              >
                {user?.name ? (
                  <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <FaUser className="text-2xl sm:text-3xl lg:text-4xl text-orange-600" />
                )}
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{user?.name}</h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                {user?.rol === 'admin' ? 'Administrador' : 
                 user?.rol === 'vendedor' ? 'Vendedor' : 
                 user?.rol === 'cliente' ? 'Cliente' : 'Usuario'}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              {isEditing ? <FaSave /> : <FaEdit />}
              {isEditing ? 'Guardar' : 'Editar'}
            </button>
          </div>

          {/* Formulario de perfil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Nombre */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                />
              ) : (
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-md">
                  <FaUser className="text-gray-400 mr-2 sm:mr-3" />
                  <span className="text-gray-900 text-sm sm:text-base">{user?.name || 'No especificado'}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                />
              ) : (
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-md">
                  <FaEnvelope className="text-gray-400 mr-2 sm:mr-3" />
                  <span className="text-gray-900 text-sm sm:text-base">{user?.email || 'No especificado'}</span>
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                />
              ) : (
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-md">
                  <FaPhone className="text-gray-400 mr-2 sm:mr-3" />
                  <span className="text-gray-900 text-sm sm:text-base">{user?.phone || 'No especificado'}</span>
                </div>
              )}
            </div>

            {/* DNI */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de DNI
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  maxLength="8"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                />
              ) : (
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-md">
                  <FaUser className="text-gray-400 mr-2 sm:mr-3" />
                  <span className="text-gray-900 text-sm sm:text-base">{user?.dni || 'No especificado'}</span>
                </div>
              )}
            </div>

            {/* Dirección */}
            <div className="sm:col-span-2 lg:col-span-2 xl:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                />
              ) : (
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-md">
                  <FaMapMarkerAlt className="text-gray-400 mr-2 sm:mr-3" />
                  <span className="text-gray-900 text-sm sm:text-base">{user?.address || 'No especificado'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaSave />
                Guardar Cambios
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {user?.rol === 'cliente' ? (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FaShoppingCart className="text-xl sm:text-2xl text-blue-600" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Compras Realizadas</h3>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">0</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FaHeart className="text-xl sm:text-2xl text-red-600" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Favoritos</h3>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600">0</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FaShoppingCart className="text-xl sm:text-2xl text-blue-600" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Ventas Realizadas</h3>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">0</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FaUser className="text-xl sm:text-2xl text-green-600" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Clientes Atendidos</h3>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">0</p>
              </div>
            </>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1 xl:col-span-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FaUser className="text-xl sm:text-2xl text-purple-600" />
            </div>
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Miembro desde</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-purple-600">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'Reciente'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
