import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Pedidos = () => {
  const { user, isAdmin, isVendedor } = useAuth();
  
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // Cargar pedidos
  const loadPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrders();
      if (res.data && res.data.success) {
        setPedidos(res.data.data);
      } else {
        setError('Error al cargar pedidos');
      }
    } catch (err) {
      setError('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  // Confirmar pedido
  const confirmarPedido = async (pedidoId) => {
    if (window.confirm('¿Está seguro de que desea confirmar este pedido? Se creará la venta correspondiente.')) {
      try {
        const res = await orderService.updateOrderStatus(pedidoId, 'confirmado');
        if (res.data && res.data.success) {
          loadPedidos();
          alert('Pedido confirmado exitosamente. Se ha creado la venta correspondiente.');
        } else {
          alert('Error al confirmar pedido: ' + (res.data?.message || 'Error desconocido'));
        }
      } catch (err) {
        alert('Error al confirmar pedido: ' + (err.response?.data?.message || 'Error de conexión'));
      }
    }
  };

  // Cancelar pedido
  const cancelarPedido = async (pedidoId) => {
    if (window.confirm('¿Está seguro de que desea cancelar este pedido?')) {
      try {
        const res = await orderService.updateOrderStatus(pedidoId, 'cancelado');
        if (res.data && res.data.success) {
          loadPedidos();
          alert('Pedido cancelado exitosamente.');
        } else {
          alert('Error al cancelar pedido: ' + (res.data?.message || 'Error desconocido'));
        }
      } catch (err) {
        alert('Error al cancelar pedido: ' + (err.response?.data?.message || 'Error de conexión'));
      }
    }
  };

  // Ver detalles del pedido
  const handleVerPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowDetail(true);
  };

  // Filtrar pedidos por estado
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosConfirmados = pedidos.filter(p => p.estado === 'confirmado');
  const pedidosCancelados = pedidos.filter(p => p.estado === 'cancelado');

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 rounded-full bg-orange-100 text-orange-600 mr-3 sm:mr-4 shadow-md">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Administra los pedidos de WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Pedidos Pendientes */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600 mb-2 shadow-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 text-center">Pendientes</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-yellow-600 drop-shadow-sm">
              {loading ? 'Cargando...' : pedidosPendientes.length}
            </span>
          </div>

          {/* Pedidos Confirmados */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 mb-2 shadow-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 text-center">Confirmados</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-green-600 drop-shadow-sm">
              {loading ? 'Cargando...' : pedidosConfirmados.length}
            </span>
          </div>

          {/* Pedidos Cancelados */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col items-center">
            <div className="p-2 sm:p-3 rounded-full bg-red-100 text-red-600 mb-2 shadow-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 text-center">Cancelados</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-red-600 drop-shadow-sm">
              {loading ? 'Cargando...' : pedidosCancelados.length}
            </span>
          </div>
        </div>

        {/* Tabla de Pedidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Lista de Pedidos WhatsApp ({pedidos.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NÚMERO</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENTE</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FECHA</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ITEMS</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTADO</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-6 sm:py-8 text-gray-500 text-sm">Cargando pedidos...</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="text-center py-6 sm:py-8 text-red-500 text-sm">{error}</td></tr>
                ) : pedidos.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-6 sm:py-8 text-gray-400 text-sm">No hay pedidos registrados.</td></tr>
                ) : (
                  pedidos.map((pedido, index) => (
                  <tr key={pedido.id} className={`hover:bg-orange-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-orange-25'}`}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {pedido.id}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {pedido.cliente_nombre || '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {pedido.fecha ? (typeof pedido.fecha === 'string' ? pedido.fecha.substring(0, 10) : new Date(pedido.fecha).toLocaleDateString()) : '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className="font-semibold text-green-700">
                        S/ {pedido.detalles ? pedido.detalles.reduce((acc, d) => acc + (d.precio_unitario * d.cantidad), 0).toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className="text-gray-900">
                        {pedido.detalles ? `${pedido.detalles.length} productos` : '0 productos'}
                      </span>
                      {pedido.detalles && pedido.detalles.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {pedido.detalles.map(d => d.producto?.nombre || 'Producto').join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                        pedido.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex space-x-2">
                        {pedido.estado === 'pendiente' && (
                          <>
                            <button
                              onClick={() => confirmarPedido(pedido.id)}
                              className="text-green-600 hover:text-green-900 font-semibold"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => cancelarPedido(pedido.id)}
                              className="text-red-600 hover:text-red-900 font-semibold"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleVerPedido(pedido)}
                          className="text-blue-600 hover:text-blue-900 font-semibold"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal de detalles del pedido */}
      {showDetail && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detalle del Pedido</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Número:</strong> {pedidoSeleccionado.id}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Cliente:</strong> {pedidoSeleccionado.cliente_nombre}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Teléfono:</strong> {pedidoSeleccionado.cliente_telefono || 'No proporcionado'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Email:</strong> {pedidoSeleccionado.cliente_email || 'No proporcionado'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Fecha:</strong> {pedidoSeleccionado.fecha ? (typeof pedidoSeleccionado.fecha === 'string' ? pedidoSeleccionado.fecha.substring(0, 10) : new Date(pedidoSeleccionado.fecha).toLocaleDateString()) : '-'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Hora:</strong> {pedidoSeleccionado.fecha ? (typeof pedidoSeleccionado.fecha === 'string' ? pedidoSeleccionado.fecha.substring(11, 16) : new Date(pedidoSeleccionado.fecha).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'})) : '-'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Tipo de Pedido:</strong> {pedidoSeleccionado.tipo_pedido || 'WhatsApp'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Estado:</strong> 
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  pedidoSeleccionado.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  pedidoSeleccionado.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                  pedidoSeleccionado.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pedidoSeleccionado.estado}
                </span>
              </p>
            </div>

            {/* Mensaje del cliente */}
            {pedidoSeleccionado.mensaje && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-1">Mensaje del Cliente:</h4>
                <p className="text-sm text-blue-700">{pedidoSeleccionado.mensaje}</p>
              </div>
            )}

            {/* Productos del pedido */}
            {pedidoSeleccionado.detalles && pedidoSeleccionado.detalles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Productos Solicitados</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pedidoSeleccionado.detalles.map((detalle, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {detalle.producto?.nombre || 'Producto no encontrado'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {detalle.cantidad}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            S/ {detalle.precio_unitario ? Number(detalle.precio_unitario).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-700">
                            S/ {detalle.subtotal ? Number(detalle.subtotal).toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right mt-3 text-lg font-bold text-green-700">
                  Total: S/ {pedidoSeleccionado.detalles.reduce((acc, d) => acc + (d.precio_unitario * d.cantidad), 0).toFixed(2)}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetail(false)}
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

export default Pedidos;

