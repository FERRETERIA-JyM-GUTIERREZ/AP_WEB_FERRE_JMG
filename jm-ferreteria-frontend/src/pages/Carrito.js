import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getBackendBaseUrl } from '../services/api';

const Carrito = () => {
  const { isAuthenticated } = useAuth();
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Redirigir si no está autenticado
  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  // Función helper para obtener el precio seguro
  const getSafePrice = (item) => {
    // Intentar diferentes campos de precio
    const precio = item.precio || item.precio_unitario || item.precio_venta || 0;
    // Convertir a número si es string
    return typeof precio === 'string' ? parseFloat(precio) || 0 : precio;
  };

  // Función helper para formatear precio
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
    return `S/ ${numPrice.toFixed(2)}`;
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  // Debug: mostrar estructura del carrito
  console.log('🛒 Carrito en página Carrito:', cart);
  if (cart.length > 0) {
    console.log('🔍 Primer item del carrito:', cart[0]);
    console.log('🔍 Campos del primer item:', Object.keys(cart[0]));
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white py-8 pt-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12 border-2 border-indigo-100 hover:shadow-2xl transition-all">
            <FaShoppingCart className="text-8xl bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 text-lg mb-8 font-semibold">
              Agrega algunos productos de nuestro catálogo para comenzar 🛍️
            </p>
            <button
              onClick={() => navigate('/catalogo')}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 text-lg font-black shadow-lg hover:shadow-2xl transform hover:scale-105 border border-indigo-400"
            >
              ➜ Ir al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">🛒 Mi Carrito</h1>
        
        {/* Lista de productos */}
        <div className="space-y-4 mb-8">
          {cart.map((item, idx) => {
            const precio = getSafePrice(item);
            const subtotal = precio * item.cantidad;
            
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-md border-2 border-indigo-100 p-4 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="flex items-center gap-4">
                  {/* Imagen del producto */}
                  <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 flex-shrink-0">
                    {item.imagen ? (
                      <img
                        src={`${getBackendBaseUrl()}/img_productos/${item.imagen}`}
                        alt={item.nombre}
                        className="w-16 h-16 object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
                        onLoad={() => console.log('✅ Imagen del carrito cargada:', item.imagen)}
                        onError={(e) => {
                          console.error('❌ Error al cargar imagen del carrito:', item.imagen);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    
                    {/* Placeholder cuando no hay imagen o falla */}
                    <div className={`w-16 h-16 flex items-center justify-center text-indigo-300 ${item.imagen ? 'hidden' : 'block'}`}>
                      <FaShoppingCart className="text-2xl" />
                    </div>
                  </div>
                  
                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{item.nombre}</h3>
                    <p className="text-xs text-gray-600 mb-2 font-semibold">
                      📦 <span className="bg-indigo-100 px-2 py-0.5 rounded-full text-xs">{item.categoria?.nombre || 'Sin categoría'}</span>
                    </p>
                    <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(precio)}
                    </p>
                  </div>
                  
                  {/* Controles de cantidad */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border-2 border-indigo-300 bg-indigo-50 rounded-lg p-0.5">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                        className="px-2 py-1 text-indigo-600 hover:bg-indigo-100 transition-all duration-200 font-bold rounded disabled:opacity-50"
                        disabled={item.cantidad <= 1}
                      >
                        <FaMinus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1 font-bold text-center text-sm min-w-[2rem] text-gray-900">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                        className="px-2 py-1 text-indigo-600 hover:bg-indigo-100 transition-all duration-200 font-bold rounded"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Subtotal del item */}
                    <div className="text-right bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-lg border-2 border-emerald-300 min-w-max">
                      <p className="text-xs text-emerald-700 font-bold">Subtotal</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {formatPrice(subtotal)}
                      </p>
                    </div>
                    
                    {/* Botón eliminar */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 transition-all duration-200 p-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 font-bold"
                      title="Eliminar del carrito"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Resumen y acciones */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100 p-5 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-purple-200">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">💳 Resumen</h2>
            <div className="text-right bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-lg border-2 border-emerald-300">
              <p className="text-xs text-emerald-700 font-bold">Total ({cart.length})</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{formatPrice(total)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleClearCart}
              className="bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-slate-400"
            >
              🗑️ Vaciar
            </button>
            <button
              onClick={handleCheckout}
              className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-emerald-400"
            >
              ✅ Proceder al Pago
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg border-2 border-sky-300">
            <p className="text-xs text-sky-800 text-center font-semibold">
              ℹ️ Al proceder, serás redirigido al formulario de envío
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
