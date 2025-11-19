import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaShoppingBag, FaTruck, FaCheckCircle, FaClock, FaEye, FaShoppingCart } from 'react-icons/fa';
import { saleService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MisCompras = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = async () => {
    setLoading(true);
    try {
      const response = await saleService.getSales();
      if (response.data && response.data.success) {
        // Filtrar solo las ventas del usuario actual
        // Primero intenta por usuario_id (para compras normales)
        // Luego por cliente_nombre (para compras por WhatsApp)
        const ventasDelUsuario = response.data.data.filter(venta => {
          // Compras registradas con usuario_id del cliente
          if (venta.usuario_id === user?.id) return true;
          
          // Compras por WhatsApp donde coincide el nombre del cliente
          if (venta.cliente_nombre && user?.name && 
              venta.cliente_nombre.toLowerCase().trim() === user.name.toLowerCase().trim()) {
            return true;
          }
          
          return false;
        });
        setCompras(ventasDelUsuario);
        console.log('✅ Compras cargadas:', ventasDelUsuario.length, 'Usuario:', user?.name);
      } else {
        setCompras([]);
      }
    } catch (error) {
      console.error('Error al cargar compras:', error);
      toast.error('Error al cargar tus compras');
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'completada':
        return { icon: FaCheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Completada' };
      case 'confirmado':
        return { icon: FaClock, color: 'text-blue-600', bgColor: 'bg-blue-100', text: 'Confirmado' };
      case 'pendiente':
        return { icon: FaClock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: 'Pendiente' };
      case 'anulada':
        return { icon: FaClock, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Anulada' };
      case 'cancelada':
        return { icon: FaClock, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Cancelada' };
      default:
        return { icon: FaClock, color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'Pendiente' };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleVerDetalles = (compra) => {
    setVentaSeleccionada(compra);
    setShowDetalleModal(true);
  };

  const handleSeguirComprando = () => {
    navigate('/catalogo');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 pt-20">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            {/* Icono SVG con gradiente */}
            <svg 
              className="w-20 h-20 mr-4 animate-bounce" 
              fill="none" 
              stroke="url(#gradient1)" 
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4" 
              />
            </svg>
            
            {/* Título con gradiente */}
            <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mis Compras
            </h1>
          </div>
          
          <p className="text-gray-500 text-xl animate-fade-in font-medium">
            Historial de todas tus compras realizadas
          </p>
        </div>

        {compras.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="mb-6">
              <FaShoppingBag className="mx-auto text-9xl text-gray-200 mb-4 opacity-50" />
            </div>
            <h3 className="text-3xl font-black text-gray-600 mb-3">
              No tienes compras aún
            </h3>
            <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
              Realiza tu primera compra para ver el historial aquí y disfrutar de nuestros productos
            </p>
            <button
              onClick={handleSeguirComprando}
              className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              🛒 Seguir Comprando
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {compras.map((compra) => {
              const estadoInfo = getEstadoInfo(compra.estado);
              const EstadoIcon = estadoInfo.icon;
              
              return (
                <div key={compra.id} className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-indigo-300 animate-slide-in hover:scale-[1.01]">
                  {/* Header de la compra - Gradiente sutil */}
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-indigo-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Icono animado con colores */}
                        <div className={`w-14 h-14 ${estadoInfo.bgColor} rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300 border-2 ${estadoInfo.color.replace('text', 'border')}`}>
                          <svg className={`w-7 h-7 ${estadoInfo.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                            🛍️ Compra #{compra.id}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1 font-semibold">
                            <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(compra.fecha)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Total</p>
                        <p className="text-3xl font-black bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                          {formatPrice(compra.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Productos de la compra */}
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-5 flex items-center pb-4 border-b-2 border-indigo-200">
                      <svg className="w-6 h-6 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      🛒 Productos:
                    </h4>
                    <div className="space-y-3">
                      {compra.detalles && compra.detalles.length > 0 ? (
                        compra.detalles.map((detalle, idx) => (
                          <div key={detalle.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:from-indigo-100 hover:to-blue-100 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-[1.02]">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">{idx + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 text-lg">{detalle.producto?.nombre || 'Producto'}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    {detalle.cantidad} unid.
                                  </span>
                                  <span className="text-sm text-gray-600 font-semibold">
                                    @ {formatPrice(detalle.precio_unitario)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Subtotal</p>
                              <p className="text-2xl font-black bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                                {formatPrice(detalle.subtotal || (detalle.precio_unitario * detalle.cantidad))}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-6 italic">No hay productos registrados</p>
                      )}
                    </div>

                    {/* Estado y acciones */}
                    <div className="mt-6 pt-6 border-t-2 border-indigo-200">
                      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${estadoInfo.bgColor} ${estadoInfo.color} border-2 shadow-md`}>
                            {estadoInfo.text}
                          </span>
                        </div>
                        <div className="flex space-x-3 w-full sm:w-auto">
                          <button 
                            onClick={() => handleVerDetalles(compra)}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-bold transform hover:scale-105"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver Detalles
                          </button>
                          {compra.estado === 'enviado' && (
                            <button className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-bold transform hover:scale-105">
                              <FaTruck />
                              Rastrear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Botón Seguir Comprando */}
            <div className="text-center py-12">
              <button
                onClick={handleSeguirComprando}
                className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                🛒 Seguir Comprando
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de detalles de la venta */}
      {showDetalleModal && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Detalle de la Compra #{ventaSeleccionada.id}</h3>
              <button
                onClick={() => setShowDetalleModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600"><strong>Fecha:</strong> {formatDate(ventaSeleccionada.fecha)}</p>
                  <p className="text-sm text-gray-600"><strong>Cliente:</strong> {ventaSeleccionada.cliente_nombre}</p>
                  <p className="text-sm text-gray-600"><strong>Teléfono:</strong> {ventaSeleccionada.cliente_telefono || 'No proporcionado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600"><strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}</p>
                  <p className="text-sm text-gray-600"><strong>Monto Pagado:</strong> {formatPrice(ventaSeleccionada.monto_pagado || ventaSeleccionada.total)}</p>
                  <p className="text-sm text-gray-600"><strong>Estado:</strong> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoInfo(ventaSeleccionada.estado).bgColor} ${getEstadoInfo(ventaSeleccionada.estado).color}`}>
                      {getEstadoInfo(ventaSeleccionada.estado).text}
                    </span>
                  </p>
                </div>
              </div>

              {/* Productos */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Productos:</h4>
                <div className="space-y-2">
                  {ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0 ? (
                    ventaSeleccionada.detalles.map((detalle) => (
                      <div key={detalle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
                            <FaShoppingBag className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{detalle.producto?.nombre || 'Producto'}</p>
                            <p className="text-sm text-gray-600">
                              Cantidad: {detalle.cantidad} x {formatPrice(detalle.precio_unitario)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(detalle.subtotal || (detalle.precio_unitario * detalle.cantidad))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay productos registrados</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(ventaSeleccionada.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetalleModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisCompras;
