import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [destinos, setDestinos] = useState([]);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState('');
  const [tipoEnvioSeleccionado, setTipoEnvioSeleccionado] = useState('terrestre');
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: '',
    telefono: '',
    dni: '',
    ciudad: ''
  });
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchDestinos();
    if (user) {
      setDatosEnvio(prev => ({
        ...prev,
        nombre: user.name || '',
        telefono: user.telefono || ''
      }));
    }
  }, []);

  const fetchDestinos = async () => {
    try {
      const response = await api.get('/envios/destinos');
      setDestinos(response.data.data);
      if (response.data.data.length > 0) {
        setDestinoSeleccionado(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar destinos:', error);
      // Destinos por defecto
      setDestinos([
        { id: 1, nombre: 'Lima', costo: 15.00, tipo_envio: 'terrestre' },
        { id: 2, nombre: 'Arequipa', costo: 25.00, tipo_envio: 'aereo' },
        { id: 3, nombre: 'Trujillo', costo: 22.00, tipo_envio: 'aereo' },
        { id: 4, nombre: 'Chiclayo', costo: 23.00, tipo_envio: 'aereo' },
        { id: 5, nombre: 'Piura', costo: 26.00, tipo_envio: 'aereo' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTotalProductos = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((total, item) => {
      const precio = item.precio || item.precio_unitario || item.precio_venta || 0;
      const precioNum = typeof precio === 'string' ? parseFloat(precio) || 0 : precio;
      return total + (precioNum * item.cantidad);
    }, 0);
  };

  const getTotalGeneral = () => {
    return getTotalProductos();
  };

  const getDestinoInfo = () => {
    return destinos.find(d => d.id == destinoSeleccionado);
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
    return `S/ ${numPrice.toFixed(2)}`;
  };

  const handleInputChange = (e) => {
    setDatosEnvio({
      ...datosEnvio,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckout = async () => {
    console.log('🚀 Botón de checkout presionado');
    console.log('📋 Estado actual de datosEnvio:', datosEnvio);
    console.log('📍 Destino seleccionado:', destinoSeleccionado);
    
    // Validar campos obligatorios con mensajes específicos
    const camposFaltantes = [];
    
    if (!datosEnvio.nombre || !datosEnvio.nombre.trim()) {
      camposFaltantes.push('Nombre completo');
    }
    
    if (!datosEnvio.telefono || !datosEnvio.telefono.trim()) {
      camposFaltantes.push('Teléfono');
    }
    
    // DNI es opcional, pero si se ingresa debe tener 8 dígitos
    if (datosEnvio.dni && datosEnvio.dni.trim() && datosEnvio.dni.length !== 8) {
      toast.error('El DNI debe tener 8 dígitos o dejarlo vacío', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }
    
    if (!datosEnvio.ciudad || !datosEnvio.ciudad.trim()) {
      camposFaltantes.push('Ciudad');
    }

    if (!destinoSeleccionado || destinoSeleccionado === '') {
      camposFaltantes.push('Destino de envío');
    }

    // Validar que el carrito tenga productos
    if (!cart || cart.length === 0) {
      toast.error('Tu carrito está vacío. Agrega productos antes de completar la compra.', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    // Mostrar error si faltan campos obligatorios
    if (camposFaltantes.length > 0) {
      const mensaje = camposFaltantes.length === 1 
        ? `⚠️ Por favor, completa el campo: ${camposFaltantes[0]}`
        : `⚠️ Por favor, completa los siguientes campos: ${camposFaltantes.join(', ')}`;
      console.log('❌ Campos faltantes detectados:', camposFaltantes);
      console.log('📝 Mensaje de error a mostrar:', mensaje);
      
      // Mostrar toast de error
      toast.error(mensaje, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
        },
      });
      
      return;
    }

    console.log('✅ Validaciones pasadas, procediendo con checkout');
    console.log('🛒 Carrito:', cart);
    console.log('📝 Datos de envío:', datosEnvio);
    console.log('📍 Destino seleccionado:', destinoSeleccionado);

    setCheckoutLoading(true);

    // Preparar datos para el mensaje de WhatsApp
    const ventaData = {
      items: cart.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio || item.precio_unitario || item.precio_venta || 0,
        nombre: item.nombre
      })),
      envio: {
        destino_id: destinoSeleccionado,
        datos: datosEnvio
      },
      total: getTotalGeneral()
    };

    let pedidoId = null;

    try {
      console.log('📱 Creando pedido en el backend...');
      
      // Crear pedido en el backend
      const pedidoData = {
        cliente_nombre: datosEnvio.nombre,
        cliente_telefono: datosEnvio.telefono,
        cliente_email: user?.email || '',
        mensaje: `Pedido desde checkout - Destino: ${getDestinoInfo()?.nombre || 'No especificado'}, Tipo: ${tipoEnvioSeleccionado}`,
        tipo_pedido: 'whatsapp',
        productos: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad
        }))
      };

      console.log('📊 Datos del pedido:', pedidoData);

      // Intentar crear el pedido en el backend (puede fallar si no hay permisos)
      try {
        const response = await orderService.createOrder(pedidoData);
        console.log('✅ Pedido creado en backend:', response.data);

        if (response.data.success && response.data.data?.id) {
          pedidoId = response.data.data.id;
          console.log('🆔 ID del pedido creado:', pedidoId);
        }
      } catch (backendError) {
        console.warn('⚠️ No se pudo crear el pedido en el backend, pero continuaremos con WhatsApp:', backendError);
        // Continuar aunque falle la creación del pedido
      }

      // Generar mensaje de WhatsApp (con o sin ID de pedido)
      const mensaje = generarMensajeWhatsApp({ id: pedidoId || 'PENDIENTE' }, ventaData);
      console.log('💬 Mensaje de WhatsApp generado:', mensaje);
      
      // Usar función helper para crear URL de forma segura
      const urlWhatsApp = crearUrlWhatsApp(mensaje);
      
      // Limpiar carrito del frontend
      clearCart();
      console.log('🗑️ Carrito limpiado');

      toast.success('¡Redirigiendo a WhatsApp para completar tu compra...', {
        duration: 3000,
        position: 'top-center',
      });
      
      // Abrir WhatsApp (siempre, incluso si falló la creación del pedido)
      console.log('🚀 Abriendo WhatsApp...');
      
      // Intentar abrir WhatsApp de múltiples formas para asegurar que funcione
      try {
        // Verificar que la URL sea válida y use https://
        if (!urlWhatsApp.startsWith('https://wa.me/')) {
          console.error('❌ URL de WhatsApp inválida:', urlWhatsApp);
          toast.error('Error al generar la URL de WhatsApp. Por favor, intenta de nuevo.');
          setCheckoutLoading(false);
          return;
        }
        
        // Intentar abrir en nueva pestaña
        const whatsappWindow = window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
        
        // Si window.open falla (bloqueado por el navegador), usar location.replace como fallback
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
          console.warn('⚠️ window.open fue bloqueado, usando fallback...');
          // Esperar un momento antes de redirigir para que el usuario vea el mensaje
          setTimeout(() => {
            // Usar replace en lugar de href para evitar que el navegador use protocolos nativos
            window.location.replace(urlWhatsApp);
          }, 500);
        } else {
          console.log('✅ WhatsApp abierto correctamente');
        }
      } catch (error) {
        console.error('❌ Error al abrir WhatsApp:', error);
        // Fallback: redirigir directamente usando replace
        window.location.replace(urlWhatsApp);
      }
      
      // Redirigir a mis compras después de un delay
      setTimeout(() => {
        console.log('🔄 Redirigiendo a mis compras...');
        navigate('/mis-compras');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error inesperado en checkout:', error);
      
      // Aún así, intentar abrir WhatsApp con un mensaje básico
      const mensajeBasico = `🛒 *NUEVA COMPRA - J&M GUTIÉRREZ*

👤 *DATOS DEL CLIENTE:*
• *Nombre:* ${datosEnvio.nombre}
• *Teléfono:* ${datosEnvio.telefono}
${datosEnvio.dni && datosEnvio.dni.trim() ? `• *DNI:* ${datosEnvio.dni}` : '• *DNI:* No proporcionado'}
• *Ciudad:* ${datosEnvio.ciudad}

🛍️ *PRODUCTOS SOLICITADOS:*
${cart.map((item, index) => {
  const precio = item.precio || item.precio_unitario || item.precio_venta || 0;
  return `${index + 1}. ${item.cantidad}x ${item.nombre || 'Producto'} - S/ ${precio}`;
}).join('\n')}

💰 *Total:* S/ ${getTotalGeneral().toFixed(2)}

Por favor, confirma disponibilidad y costo de envío.`;
      
      // Usar función helper para crear URL de forma segura
      const urlWhatsApp = crearUrlWhatsApp(mensajeBasico);
      
      // Verificar que la URL sea válida
      if (!urlWhatsApp.startsWith('https://wa.me/')) {
        console.error('❌ URL de WhatsApp inválida:', urlWhatsApp);
        toast.error('Error al generar la URL de WhatsApp. Por favor, intenta de nuevo.');
        return;
      }
      
      // Intentar abrir WhatsApp con fallback
      try {
        const whatsappWindow = window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
          setTimeout(() => {
            window.location.replace(urlWhatsApp);
          }, 500);
        }
      } catch (error) {
        console.error('❌ Error al abrir WhatsApp:', error);
        window.location.replace(urlWhatsApp);
      }
      
      toast.error('Hubo un error, pero se abrió WhatsApp. Por favor, completa tu pedido allí.', {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Función helper para crear URL de WhatsApp de forma segura
  const crearUrlWhatsApp = (mensaje) => {
    // Limpiar el mensaje de caracteres problemáticos y codificarlo correctamente
    let mensajeLimpio = mensaje
      .replace(/\uFFFD/g, '') // Eliminar caracteres de reemplazo UTF-8
      .replace(/\u200B/g, '') // Eliminar espacios de ancho cero
      .replace(/[\u0000-\u001F]/g, '') // Eliminar caracteres de control
      .trim();
    
    // Asegurarse de que el mensaje no esté vacío
    if (!mensajeLimpio) {
      mensajeLimpio = 'Hola, me interesa hacer una compra.';
    }
    
    // Codificar el mensaje de forma segura
    let mensajeCodificado;
    try {
      mensajeCodificado = encodeURIComponent(mensajeLimpio);
    } catch (error) {
      console.error('❌ Error al codificar mensaje:', error);
      // Si falla, usar un mensaje simple
      mensajeCodificado = encodeURIComponent('Hola, me interesa hacer una compra.');
    }
    
    // SIEMPRE usar https://wa.me/ (nunca whatsapp://)
    // Forzar https para evitar que el navegador use protocolos nativos
    const url = `https://wa.me/51960604850?text=${mensajeCodificado}`;
    
    console.log('🔗 URL de WhatsApp generada:', url.substring(0, 100) + '...');
    return url;
  };

  const generarMensajeWhatsApp = (venta, ventaData) => {
    console.log('🔍 generarMensajeWhatsApp - venta:', venta);
    console.log('🔍 generarMensajeWhatsApp - ventaData:', ventaData);
    console.log('🔍 generarMensajeWhatsApp - ventaData.items:', ventaData.items);
    
    const destino = getDestinoInfo();
    const tipoEnvio = destino?.tipo_envio === 'aereo' ? '✈️ AÉREO' : '🚚 TERRESTRE';
    const fecha = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `🛒 *NUEVA COMPRA - J&M GUTIÉRREZ*

📋 *Pedido #${venta.id || 'PENDIENTE'}*
⏰ *Fecha y Hora:* ${fecha}

👤 *DATOS DEL CLIENTE:*
• *Nombre:* ${datosEnvio.nombre}
• *Teléfono:* ${datosEnvio.telefono}
${datosEnvio.dni && datosEnvio.dni.trim() ? `• *DNI:* ${datosEnvio.dni}` : '• *DNI:* No proporcionado'}
• *Ciudad:* ${datosEnvio.ciudad}

📍 *DATOS DE ENVÍO:*
• *Destino:* ${destino?.nombre || 'Por definir'}
• *Tipo de Envío:* ${tipoEnvio}
• *Terminal:* Por coordinar

🛍️ *PRODUCTOS SOLICITADOS:*
${ventaData.items.map((item, index) => {
  console.log(`🔍 Item ${index}:`, item);
  console.log(`🔍 Item ${index} precio_unitario:`, item.precio_unitario, 'tipo:', typeof item.precio_unitario);
  
  const precio = parseFloat(item.precio_unitario) || 0;
  console.log(`🔍 Item ${index} precio parseado:`, precio);
  
  const subtotal = precio * item.cantidad;
  console.log(`🔍 Item ${index} subtotal:`, subtotal);
  
  return `${index + 1}. ${item.cantidad}x ${item.nombre || 'Producto'} 
   💰 Precio: S/ ${precio.toFixed(2)}
   📊 Subtotal: S/ ${subtotal.toFixed(2)}`;
}).join('\n\n')}

💰 *RESUMEN FINANCIERO:*
• *Total Productos:* ${formatPrice(getTotalProductos())}
• *Costo de Envío:* Por coordinar
• *Total General:* Por definir

📝 *INSTRUCCIONES:*
1. Confirma la disponibilidad de todos los productos
2. Proporciona el costo de envío exacto
3. Indica la terminal más cercana al cliente
4. Coordina el método de pago
5. Confirma la fecha de envío

🔔 *ESTADO:* Pendiente de confirmación

---
*Este mensaje fue generado automáticamente por el sistema de J&M GUTIÉRREZ*
*Cliente esperando respuesta para proceder con el pago*`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando checkout...</div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-500 text-lg mb-8">
              Agrega productos al carrito para proceder con la compra
            </p>
            <button
              onClick={() => navigate('/catalogo')}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 text-lg font-medium"
            >
              Ir al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar destinos por tipo de envío seleccionado
  const destinosFiltrados = destinos.filter(d => d.tipo_envio === tipoEnvioSeleccionado);

  return (
    <div className="min-h-screen bg-white py-8 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">🛒 Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de envío */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">📍 Datos de Envío</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={datosEnvio.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    datosEnvio.nombre.trim() ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={datosEnvio.telefono}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    datosEnvio.telefono.trim() ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 960 604 850"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nro de DNI <span className="text-gray-500 text-xs">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="dni"
                  value={datosEnvio.dni}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    datosEnvio.dni.trim() && datosEnvio.dni.length === 8 ? 'border-emerald-300 bg-emerald-50' : 
                    datosEnvio.dni.trim() && datosEnvio.dni.length !== 8 ? 'border-rose-300 bg-rose-50' : 
                    'border-gray-300'
                  }`}
                  maxLength="8"
                  placeholder="12345678 (Opcional)"
                />
                {datosEnvio.dni && datosEnvio.dni.length !== 8 && (
                  <p className="text-sm text-red-500 mt-1">El DNI debe tener exactamente 8 dígitos o dejarlo vacío</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={datosEnvio.ciudad}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    datosEnvio.ciudad.trim() ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Lima, Arequipa, Trujillo"
                  required
                />
              </div>

              {/* Selector de tipo de envío */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  🚚 Tipo de Envío *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative flex items-center p-3 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 transition-all" style={{borderColor: tipoEnvioSeleccionado === 'terrestre' ? '#10b981' : '#d1d5db'}}>
                    <input
                      type="radio"
                      className="form-radio text-emerald-600 w-4 h-4"
                      name="tipoEnvio"
                      value="terrestre"
                      checked={tipoEnvioSeleccionado === 'terrestre'}
                      onChange={() => {
                        setTipoEnvioSeleccionado('terrestre');
                        setDestinoSeleccionado('');
                      }}
                    />
                    <span className="ml-2 font-semibold text-gray-800">🚚 Terrestre</span>
                    <span className="ml-auto text-xs text-gray-600">Económico</span>
                  </label>
                  <label className="relative flex items-center p-3 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-sky-400 transition-all" style={{borderColor: tipoEnvioSeleccionado === 'aereo' ? '#0ea5e9' : '#d1d5db'}}>
                    <input
                      type="radio"
                      className="form-radio text-sky-600 w-4 h-4"
                      name="tipoEnvio"
                      value="aereo"
                      checked={tipoEnvioSeleccionado === 'aereo'}
                      onChange={() => {
                        setTipoEnvioSeleccionado('aereo');
                        setDestinoSeleccionado('');
                      }}
                    />
                    <span className="ml-2 font-semibold text-gray-800">✈️ Aéreo</span>
                    <span className="ml-auto text-xs text-gray-600">Rápido</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  📍 Destino de envío *
                </label>
                <select
                  value={destinoSeleccionado}
                  onChange={(e) => setDestinoSeleccionado(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold text-gray-800 bg-white hover:border-indigo-300"
                  required
                >
                  <option value="">Selecciona un destino</option>
                  {destinosFiltrados.map(destino => (
                    <option key={destino.id} value={destino.id}>
                      {destino.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resumen de compra */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">💳 Resumen de Compra</h2>
            
            {/* Productos */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.map((item, idx) => {
                const precio = item.precio || item.precio_unitario || item.precio_venta || 0;
                const precioNum = typeof precio === 'string' ? parseFloat(precio) || 0 : precio;
                const subtotal = precioNum * item.cantidad;
                
                return (
                  <div key={item.id} className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-400 hover:shadow-md transition-all">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.nombre}</p>
                      <p className="text-sm text-gray-600">{item.cantidad} x {formatPrice(precioNum)}</p>
                    </div>
                    <p className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{formatPrice(subtotal)}</p>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="space-y-3 border-t-2 border-purple-200 pt-4">
              <div className="flex justify-between text-lg items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-300">
                <span className="font-bold text-gray-800">Total Productos:</span>
                <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{formatPrice(getTotalGeneral())}</span>
              </div>
            </div>

            {/* Información del destino */}
            {getDestinoInfo() && (
              <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border-2 border-sky-300 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-sky-900">
                  📍 <strong>Destino Seleccionado:</strong> {getDestinoInfo().nombre}
                </p>
                <p className="text-sm text-sky-800 mt-2">
                  <strong>{getDestinoInfo().tipo_envio === 'aereo' ? '✈️ Aéreo' : '🚚 Terrestre'}</strong> - {getDestinoInfo().tipo_envio === 'aereo' ? 'Más rápido' : 'Más económico'}
                </p>
                <p className="text-xs text-sky-700 mt-2 font-semibold">
                  ℹ️ El costo de envío se coordinarán por WhatsApp
                </p>
              </div>
            )}

            {/* Botón de compra */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-2xl transform hover:scale-105 font-black text-lg border-2 border-emerald-400"
            >
              {checkoutLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando compra...
                </span>
              ) : (
                <>
                  <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.378-5.03c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                   COMPLETAR COMPRA POR WHATSAPP
                </>
              )}
            </button>

            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl hover:shadow-md transition-all">
              <div className="flex items-center justify-center text-emerald-900 mb-3">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-black text-lg">¿Cómo funciona?</span>
              </div>
              <ul className="text-sm text-emerald-800 space-y-2 font-semibold">
                <li>✅ Se abrirá WhatsApp automáticamente</li>
                <li>✅ Se enviará un mensaje con todos tus datos</li>
                <li>✅ Coordinarás el pago y envío directamente</li>
                <li>💬 Número: +51 960 604 850</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
