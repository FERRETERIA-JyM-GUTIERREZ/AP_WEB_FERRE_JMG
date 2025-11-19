import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaEye, FaSync, FaCloud } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import favoritosService from '../services/favoritosService';
import { getBackendBaseUrl } from '../services/api';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated(), user?.id]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      // Inicializar servicio de favoritos
      favoritosService.init(isAuthenticated(), user?.id);
      
      // Usar servicio unificado para obtener favoritos
      const favoritosData = await favoritosService.getFavoritos();
      
      // Convertir formato para mantener compatibilidad
      setWishlist({ items: favoritosData.map(producto => ({
        id: producto.id,
        producto_id: producto.id,
        producto: producto
      }))});
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      toast.error('Error al cargar favoritos');
      setWishlist({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productoId) => {
    try {
      const result = await favoritosService.removeFromFavoritos(productoId);
      if (result.success) {
        await fetchWishlist(); // Recargar favoritos
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error al eliminar de favoritos:', error);
      toast.error('Error al eliminar de favoritos');
    }
  };

  const addToCart = async (productoId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/carrito`, { 
        producto_id: productoId, 
        cantidad: 1 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Agregado al carrito');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  // Sincronizar favoritos locales con la API
  const sincronizarFavoritos = async () => {
    setSyncing(true);
    try {
      const result = await favoritosService.syncFavoritosToAPI();
      if (result.success) {
        toast.success(result.message);
        await fetchWishlist(); // Recargar favoritos sincronizados
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando favoritos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mis Favoritos
          </h1>
          <p className="text-gray-600 mb-4">
            Productos que te han gustado
          </p>
          
          {/* Información del sistema sincronizado */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <FaCloud className="text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Sistema de Favoritos Sincronizado
              </span>
            </div>
            <p className="text-xs text-green-600 mb-3">
              Tus favoritos se guardan en tu cuenta y están disponibles en todos tus dispositivos.
            </p>
            
            <button
              onClick={sincronizarFavoritos}
              disabled={syncing}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaSync className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Favoritos'}
            </button>
          </div>
        </div>
        
        {wishlist.items.length === 0 ? (
          <div className="text-center py-16">
            <FaHeart className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-500 mb-6">
              Agrega productos a tus favoritos para verlos aquí
            </p>
            <button
              onClick={() => navigate('/catalogo')}
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FaShoppingCart className="mr-2" />
              Explorar Productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden relative">
                {/* Imagen del producto */}
                <div className="relative overflow-hidden bg-gray-50 h-48">
                  {item.producto.imagen ? (
                <img
                  src={`${getBackendBaseUrl()}/img_productos/${item.producto.imagen}`}
                  alt={item.producto.nombre}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaHeart className="text-4xl" />
                    </div>
                  )}
                  
                  {/* Botón de favorito */}
                  <button
                    onClick={() => removeFromWishlist(item.producto_id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="Quitar de favoritos"
                  >
                    <FaHeart className="text-red-500 text-lg fill-current" />
                  </button>
                </div>

                {/* Contenido del producto */}
                <div className="p-4">
                  {/* Categoría */}
                  <div className="text-xs font-semibold text-orange-500 mb-1 uppercase tracking-wide">
                    {item.producto.categoria?.nombre || item.producto.categoria_nombre}
                  </div>

                  {/* Nombre del producto */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {item.producto.nombre}
                  </h3>

                  {/* Precio */}
                  <div className="text-lg font-bold text-orange-600 mb-3">
                    S/ {item.producto.precio ? Number(item.producto.precio).toFixed(2) : '0.00'}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item.producto_id)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart className="text-sm" />
                      Agregar
                    </button>
                    
                    <button
                      onClick={() => navigate(`/producto/${item.producto_id}`)}
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

export default Wishlist;






