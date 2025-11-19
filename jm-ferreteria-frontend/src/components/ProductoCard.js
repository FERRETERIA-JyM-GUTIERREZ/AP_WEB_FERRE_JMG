import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import favoritosService from '../services/favoritosService';
import { getBackendBaseUrl } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const ProductoCard = ({ producto, onVerDetalles, onWhatsApp, onFormulario }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [cantidad, setCantidad] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Inicializar servicio de favoritos y verificar estado
  useEffect(() => {
    favoritosService.init(isAuthenticated(), user?.id);
    checkIfFavorite();
  }, [isAuthenticated(), user?.id, producto.id]);

  // Verificar si el producto está en favoritos (versión rápida)
  const checkIfFavorite = () => {
    try {
      const favorite = favoritosService.isFavoriteSync(producto.id);
      console.log('🔍 Verificando favorito para producto', producto.id, ':', favorite);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    }
  };

  // Manejar toggle de favoritos
  const handleToggleFavorite = async () => {
    if (loadingFavorite) return;
    
    console.log('❤️ Toggle favorito para producto:', producto.id, 'Estado actual:', isFavorite);
    setLoadingFavorite(true);
    
    // Actualizar estado inmediatamente para mejor UX
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    try {
      if (!newFavoriteState) {
        // Remover de favoritos
        console.log('🗑️ Removiendo de favoritos...');
        const result = await favoritosService.removeFromFavoritos(producto.id);
        console.log('Resultado remover:', result);
        if (result.success) {
          toast.success(result.message);
        } else {
          // Revertir estado si falla
          setIsFavorite(true);
          toast.error(result.message);
        }
      } else {
        // Agregar a favoritos
        console.log('➕ Agregando a favoritos...');
        const result = await favoritosService.addToFavoritos(producto);
        console.log('Resultado agregar:', result);
        if (result.success) {
          toast.success(result.message);
        } else {
          // Revertir estado si falla
          setIsFavorite(false);
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error('Error al manejar favoritos:', error);
      // Revertir estado si falla
      setIsFavorite(!newFavoriteState);
      toast.error('Error al actualizar favoritos');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleCarrito = () => {
    console.log('🛒 ProductoCard: Botón Agregar al Carrito clickeado');
    console.log('🛒 ProductoCard: Producto a agregar:', producto);
    console.log('🛒 ProductoCard: Cantidad:', cantidad);
    
    // Verificar si el usuario está autenticado y es cliente
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    if (user?.rol !== 'cliente') {
      toast.error('Solo los clientes pueden agregar productos al carrito');
      return;
    }
    
    try {
      // Crear copia del producto con la cantidad seleccionada
      const productoConCantidad = {
        ...producto,
        cantidad: cantidad
      };
      
      addToCart(productoConCantidad);
      console.log('✅ ProductoCard: addToCart ejecutado exitosamente');
      
      // Resetear cantidad después de agregar
      setCantidad(1);
    } catch (error) {
      console.error('❌ ProductoCard: Error en addToCart:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  const incrementarCantidad = () => {
    setCantidad(prev => Math.min(prev + 1, producto.stock || 99));
  };

  const decrementarCantidad = () => {
    setCantidad(prev => Math.max(prev - 1, 1));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  const cardClasses = `rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden group h-full flex flex-col ${
    isDarkMode
      ? 'bg-slate-900/80 border-slate-700 shadow-slate-900/40 text-gray-100'
      : 'bg-white border-gray-100 hover:shadow-md text-gray-900'
  }`;
  const imageWrapperClasses = `relative overflow-hidden h-48 flex-shrink-0 transition-colors duration-300 ${
    isDarkMode
      ? 'bg-slate-900/40 border-b border-slate-800'
      : 'bg-gray-50 border-b border-gray-100'
  }`;
  const placeholderTextClass = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const contentWrapperClasses = `p-4 flex-1 flex flex-col transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`;
  const labelClasses = `block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const quantityBtnClasses = `w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-200 ${
    isDarkMode
      ? 'border-slate-600 text-gray-200 hover:bg-slate-800 hover:text-white disabled:opacity-40'
      : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40'
  }`;
  const quantityValueClasses = `text-lg font-medium min-w-[2rem] text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`;
  const detailsBtnClasses = `flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium border ${
    isDarkMode
      ? 'bg-slate-800/70 border-slate-700 text-gray-100 hover:bg-slate-700'
      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
  }`;
  const favoriteBtnClasses = isFavorite
    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
    : isDarkMode
      ? 'bg-slate-900/70 border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-red-400'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500';

  return (
    <div className={cardClasses}>
      {/* Imagen del producto - Bien contenida */}
      <div className={imageWrapperClasses}>
        {producto.imagen ? (
          <img 
            src={`https://apwebferrejmg-production.up.railway.app/img_productos/${producto.imagen}`}
            alt={producto.nombre} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onLoad={() => console.log('✅ Imagen cargada exitosamente:', producto.imagen)}
            onError={(e) => {
              console.error('❌ Error al cargar imagen:', producto.imagen);
              console.error('❌ Ruta completa:', `https://apwebferrejmg-production.up.railway.app/img_productos/${producto.imagen}`);
              // Si la imagen falla, mostrar placeholder SVG
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : (
          console.log('⚠️ Producto sin imagen:', producto.nombre)
        )}
        
        {/* Placeholder SVG cuando no hay imagen o falla */}
        <div className={`w-full h-full flex flex-col items-center justify-center ${placeholderTextClass} ${producto.imagen ? 'hidden' : 'block'}`}>
          <svg className="w-full h-full" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="200" fill={isDarkMode ? '#0f172a' : '#f5f5f5'} stroke="#e5e7eb" strokeWidth="1"/>
            <text x="150" y="90" fontFamily="Arial, sans-serif" fontSize="18" fill="#9ca3af" textAnchor="middle" dominantBaseline="middle">
              {producto.categoria?.nombre?.split(' ')[0] || 'PRODUCTO'}
            </text>
            <text x="150" y="120" fontFamily="Arial, sans-serif" fontSize="12" fill="#9ca3af" textAnchor="middle" dominantBaseline="middle">
              {producto.nombre.substring(0, 20)}...
            </text>
          </svg>
        </div>
        
        {/* Botón de Favoritos - Posicionado absolutamente */}
        <button
          onClick={handleToggleFavorite}
          disabled={loadingFavorite}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md border transition-all duration-200 ${favoriteBtnClasses} ${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <FaHeart className={`text-sm ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Contenido del producto */}
      <div className={contentWrapperClasses}>
        {/* Categoría */}
        <div className="text-xs font-semibold text-orange-500 mb-1 uppercase tracking-wide">
          {producto.categoria?.nombre || producto.categoria_nombre}
        </div>

        {/* Nombre del producto */}
        <h3 className={`font-semibold text-sm mb-2 line-clamp-2 flex-shrink-0 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {producto.nombre}
        </h3>

        {/* Precio */}
        <div className="text-lg font-bold text-orange-600 mb-3 flex-shrink-0">
          {formatPrice(producto.precio)}
        </div>

        {/* Controles de cantidad */}
        <div className="mb-3 flex-shrink-0">
          <label className={labelClasses}>
            Cantidad
          </label>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={decrementarCantidad}
              className={quantityBtnClasses}
              disabled={cantidad <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className={quantityValueClasses}>
              {cantidad}
            </span>
            
            <button
              onClick={incrementarCantidad}
              className={quantityBtnClasses}
              disabled={cantidad >= (producto.stock || 99)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          {/* Botón Ver Detalles - Solo icono en móvil */}
          <button
            onClick={() => onVerDetalles(producto)}
            className={detailsBtnClasses}
          >
            <FaEye className="text-sm" />
            <span className="hidden sm:inline">Detalles</span>
          </button>

          {/* Botón Agregar al Carrito */}
          <button
            onClick={handleCarrito}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoCard; 