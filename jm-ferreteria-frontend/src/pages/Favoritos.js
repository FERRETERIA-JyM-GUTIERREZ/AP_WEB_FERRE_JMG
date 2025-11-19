import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaHeart, FaShoppingCart, FaEye, FaUserPlus, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';
import favoritosService from '../services/favoritosService';
import { getBackendBaseUrl } from '../services/api';

const Favoritos = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadFavoritos();
  }, [user?.id, isAuthenticated()]);

  const loadFavoritos = async () => {
    setLoading(true);
    try {
      // Inicializar servicio de favoritos
      favoritosService.init(isAuthenticated(), user?.id);
      
      // Para usuarios no autenticados, cargar inmediatamente desde localStorage
      if (!isAuthenticated()) {
        const favoritosData = favoritosService.getFavoritosSync();
        setFavoritos(favoritosData);
        setLoading(false);
        return;
      }
      
      // Para usuarios autenticados, cargar desde API
      const favoritosData = await favoritosService.getFavoritos();
      setFavoritos(favoritosData);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (producto) => {
    try {
      if (isAuthenticated()) {
        // Usar servicio unificado para usuarios autenticados
        const result = await favoritosService.removeFromFavoritos(producto.id);
        if (result.success) {
          // Actualizar inmediatamente sin recargar
          setFavoritos(prev => prev.filter(fav => fav.id !== producto.id));
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } else {
        // Lógica local para usuarios no autenticados (más rápida)
        setFavoritos(prev => {
          const isFavorite = prev.find(fav => fav.id === producto.id);
          let newFavorites;
          
          if (isFavorite) {
            // Remover de favoritos
            newFavorites = prev.filter(fav => fav.id !== producto.id);
            toast.success('Producto removido de favoritos');
          } else {
            // Agregar a favoritos
            newFavorites = [...prev, producto];
            toast.success('Producto agregado a favoritos');
          }
          
          // Guardar en localStorage
          localStorage.setItem('favoritos_guest', JSON.stringify(newFavorites));
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('Error al manejar favoritos:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const agregarAlCarrito = (producto) => {
    addToCart(producto);
    toast.success('Producto agregado al carrito');
  };

  // Sincronizar favoritos locales con la API (cuando el usuario se registra/logea)
  const sincronizarFavoritos = async () => {
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para sincronizar favoritos');
      return;
    }

    setSyncing(true);
    try {
      const result = await favoritosService.syncFavoritosToAPI();
      if (result.success) {
        toast.success(result.message);
        await loadFavoritos(); // Recargar favoritos sincronizados
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error al sincronizar favoritos:', error);
      toast.error('Error al sincronizar favoritos');
    } finally {
      setSyncing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {/* Icono SVG con gradiente */}
            <svg 
              className="w-16 h-16 mr-4" 
              fill="none" 
              stroke="url(#gradientHeart)" 
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient id="gradientHeart" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            
            {/* Título con gradiente */}
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 bg-clip-text text-transparent">
              Mis Favoritos
            </h1>
            
            {/* Icono SVG con gradiente */}
            <svg 
              className="w-16 h-16 ml-4" 
              fill="none" 
              stroke="url(#gradientHeart2)" 
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient id="gradientHeart2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            Productos que te han gustado
          </p>
          
          {/* Información del sistema híbrido */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <FaHeart className="text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                {isAuthenticated() ? 'Sistema de Favoritos Sincronizado' : 'Favoritos Locales'}
              </span>
            </div>
            <p className="text-xs text-blue-600 mb-3">
              {isAuthenticated() 
                ? 'Tus favoritos se guardan en tu cuenta y están disponibles en todos tus dispositivos.'
                : 'Tus favoritos se guardan localmente. Inicia sesión para sincronizarlos con tu cuenta.'
              }
            </p>
            
            {!isAuthenticated() && favoritos.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaUserPlus className="mr-2" />
                  Iniciar Sesión
                </button>
                <button
                  onClick={sincronizarFavoritos}
                  disabled={syncing}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FaSync className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {favoritos.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg 
                  className="w-24 h-24 text-pink-300" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">+</span>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              💖 Agrega productos a tus favoritos para verlos aquí 💖
            </p>
            <a
              href="/catalogo"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Ir al Catálogo
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritos.map((producto) => (
              <div key={producto.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Imagen del producto */}
                <div className="relative overflow-hidden bg-gray-50 h-48">
                  {producto.imagen ? (
                    <img 
                      src={`${getBackendBaseUrl()}/img_productos/${producto.imagen}`}
                      alt={producto.nombre} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaHeart className="text-4xl" />
                    </div>
                  )}
                  
                  {/* Botón de favorito */}
                  <button
                    onClick={() => toggleFavorito(producto)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <FaHeart className="text-red-500 text-lg" />
                  </button>
                </div>

                {/* Contenido del producto */}
                <div className="p-4">
                  {/* Categoría */}
                  <div className="text-xs font-semibold text-orange-500 mb-1 uppercase tracking-wide">
                    {producto.categoria?.nombre || producto.categoria_nombre}
                  </div>

                  {/* Nombre del producto */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {producto.nombre}
                  </h3>

                  {/* Precio */}
                  <div className="text-lg font-bold text-orange-600 mb-3">
                    {formatPrice(producto.precio)}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart className="text-sm" />
                      Agregar
                    </button>
                    
                    <button
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FaEye className="text-sm" />
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;





