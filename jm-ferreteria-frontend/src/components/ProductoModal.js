import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getBackendBaseUrl } from '../services/api';

const ProductoModal = ({ producto, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState(1);
  if (!isOpen || !producto) return null;

  // Función para formatear el precio de forma segura
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0.00';
    return parseFloat(price).toFixed(2);
  };

  // Función para obtener el stock de forma segura
  const getStock = () => {
    const stock = producto.stock || 0;
    return stock > 0 ? `${stock} unidades` : 'Sin stock';
  };

  // Función para manejar agregar al carrito
  const handleAgregarAlCarrito = () => {
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
      const productoConCantidad = {
        ...producto,
        cantidad: cantidad
      };
      
      addToCart(productoConCantidad);
      toast.success('Producto agregado al carrito');
      setCantidad(1);
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  // Función para incrementar cantidad
  const incrementarCantidad = () => {
    setCantidad(prev => Math.min(prev + 1, producto.stock || 99));
  };

  // Función para decrementar cantidad
  const decrementarCantidad = () => {
    setCantidad(prev => Math.max(prev - 1, 1));
  };

  const modalContainerClasses = `rounded-lg shadow-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto transition-colors duration-300 border ${
    isDarkMode
      ? 'bg-slate-900 text-gray-100 border-slate-800 shadow-slate-900/60'
      : 'bg-white text-gray-900 border-gray-100'
  }`;
  const overlayClasses = `fixed inset-0 ${isDarkMode ? 'bg-black/70' : 'bg-black/50'} flex items-center justify-center z-50 p-4 backdrop-blur-sm`;
  const headerClasses = `flex justify-between items-center p-3 border-b ${
    isDarkMode
      ? 'bg-slate-800/70 border-slate-700 text-gray-100'
      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-900'
  }`;
  const softBlockClass = isDarkMode ? 'bg-slate-800/60 border border-slate-700 text-gray-100' : 'bg-gray-50 border border-gray-200 text-gray-700';
  const gradientPriceClass = isDarkMode
    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-blue-200'
    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-600';
  const categoryPillClass = isDarkMode
    ? 'text-blue-200 bg-blue-500/10 border border-blue-500/30'
    : 'text-blue-600 bg-blue-50';
  const closeBtnClasses = isDarkMode
    ? 'text-gray-300 hover:text-white hover:bg-slate-700'
    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200';
  const modalQuantityBtnClass = `w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 ${
    isDarkMode
      ? 'border-slate-600 text-gray-200 hover:bg-slate-800 hover:text-white disabled:opacity-40'
      : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40'
  }`;
  const modalQuantityValueClass = `text-sm font-medium min-w-[1.5rem] text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`;

  return (
    <div className={overlayClasses}>
      <div className={modalContainerClasses}>
        {/* Header del modal */}
        <div className={headerClasses}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Detalles del Producto</h2>
          </div>
          <button
            onClick={onClose}
            className={`${closeBtnClasses} transition-colors p-1 rounded-full`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Columna izquierda - Imagen pequeña */}
            <div className="lg:col-span-1">
              {/* Imagen del producto - mucho más pequeña */}
            <div className={`rounded-lg p-2 flex items-center justify-center mb-2 border ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <img
                  src={`${getBackendBaseUrl()}/img_productos/${producto.imagen}`}
                  alt={producto.nombre}
                  className="max-w-full max-h-24 object-contain"
                  onError={(e) => {
                    e.target.src = '/img/logo.png';
                  }}
                />
              </div>
              
              {/* Categoría */}
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryPillClass}`}>
                  {producto.categoria?.nombre || producto.categoria_nombre || 'Sin categoría'}
                </span>
              </div>
            </div>

            {/* Columna derecha - Información del producto */}
            <div className="lg:col-span-2 space-y-2">
              {/* Nombre del producto */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {producto.nombre}
                  </h3>
                </div>
              </div>

              {/* Precio y Stock en una fila */}
              <div className="grid grid-cols-2 gap-2">
                {/* Precio */}
                <div className={`p-2 rounded-lg ${gradientPriceClass}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Precio:</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      S/ {formatPrice(producto.precio)}
                    </span>
                  </div>
                </div>

                {/* Stock */}
                <div className={`flex items-center justify-between p-2 rounded-lg ${softBlockClass}`}>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Stock:</span>
                  </div>
                  <span className={`text-xs font-bold ${(producto.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {getStock()}
                  </span>
                </div>
              </div>

              {/* Descripción completa */}
              {producto.descripcion && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Descripción</h4>
                  </div>
                <div className={`p-2 rounded-lg ${softBlockClass}`}>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {producto.descripcion}
                    </p>
                  </div>
                </div>
              )}

              {/* Información técnica */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <h4 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Información Técnica</h4>
                </div>
                <div className={`p-2 rounded-lg ${softBlockClass}`}>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Código:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{producto.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Categoría:</span>
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{producto.categoria?.nombre || producto.categoria_nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Precio:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>S/ {formatPrice(producto.precio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stock:</span>
                      <span className={`font-semibold ${(producto.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {producto.stock || 0} unidades
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selector de cantidad */}
              <div className={`p-3 rounded-lg ${softBlockClass}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Cantidad:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={decrementarCantidad}
                      className={modalQuantityBtnClass}
                      disabled={cantidad <= 1}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className={modalQuantityValueClass}>
                      {cantidad}
                    </span>
                    <button
                      onClick={incrementarCantidad}
                      className={modalQuantityBtnClass}
                      disabled={cantidad >= (producto.stock || 99)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAgregarAlCarrito}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Agregar al Carrito
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoModal; 