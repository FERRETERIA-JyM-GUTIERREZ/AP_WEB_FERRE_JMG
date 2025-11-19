import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPhone, FaMapMarkerAlt, FaClock, FaCreditCard, FaTruck, FaShieldAlt, FaEnvelope, FaTimes, FaComments } from 'react-icons/fa';
import chatbotService from '../services/chatbotService';
import { empresaService } from '../services/empresaService';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentState, setCurrentState] = useState('menu_principal'); // Estado actual del chat
  const [datosEmpresa, setDatosEmpresa] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const messagesEndRef = useRef(null);

  // Cargar datos de la empresa al montar
  useEffect(() => {
    const cargarDatos = async () => {
      const resultado = await empresaService.obtenerDatosEmpresa();
      if (resultado.success) {
        setDatosEmpresa(resultado.data);
      }
    };
    cargarDatos();
  }, []);

  // Mostrar mensaje de bienvenida al cargar la página por primera vez
  useEffect(() => {
    let hideTimer = null;
    let fadeOutTimer = null;
    const showTimer = setTimeout(() => {
      if (!isOpen) {
        setIsFadingOut(false);
        setShowWelcomeMessage(true);
        // Iniciar animación de desaparición 6.5 segundos después (0.5s antes de desaparecer)
        fadeOutTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 6500);
        // Ocultar completamente después de 7 segundos
        hideTimer = setTimeout(() => {
          setShowWelcomeMessage(false);
          setIsFadingOut(false);
        }, 7000); // Desaparece después de 7 segundos
      }
    }, 500); // Pequeño delay para que la página cargue

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
    };
  }, []); // Solo se ejecuta al montar

  // Ocultar mensaje cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      setIsFadingOut(true);
      setTimeout(() => {
        setShowWelcomeMessage(false);
        setIsFadingOut(false);
      }, 500);
    }
  }, [isOpen]);

  // Mensaje de bienvenida automático
  useEffect(() => {
    if (isOpen && messages.length === 0 && datosEmpresa) {
      const welcomeMessage = chatbotService.generarRespuesta('bienvenida', datosEmpresa);
      const botMessage = {
        id: Date.now(),
        text: welcomeMessage.text,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        type: 'welcome',
        opcionesNumeradas: true
      };
      setMessages([botMessage]);
      setCurrentState('menu_principal');
    }
  }, [isOpen, datosEmpresa]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Validar que la entrada sea solo un número
  const esNumeroValido = (texto) => {
    const numero = parseInt(texto.trim());
    return !isNaN(numero) && numero > 0;
  };

  // Función auxiliar para volver al menú principal
  const volverAlMenuPrincipal = () => {
    if (!datosEmpresa) return null;
    return {
      ...chatbotService.generarRespuesta('bienvenida', datosEmpresa),
      nuevoEstado: 'menu_principal'
    };
  };

  // Procesar mensaje del usuario
  const processMessage = async (userMessage) => {
    const mensajeLimpio = userMessage.trim();
    
    // Validar que sea un número
    if (!esNumeroValido(mensajeLimpio)) {
    setIsTyping(true);
    setTimeout(() => {
        const errorMessage = chatbotService.generarRespuesta('error_numero', datosEmpresa);
      const botMessage = {
        id: Date.now() + 1,
          text: errorMessage.text,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          opcionesNumeradas: true
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      }, 500);
      return;
    }

    const numeroSeleccionado = parseInt(mensajeLimpio);
    setIsTyping(true);

    // Procesar según el estado actual
    setTimeout(async () => {
      let respuesta = null;
      let nuevoEstado = currentState;

      switch (currentState) {
        case 'menu_principal':
          respuesta = await manejarMenuPrincipal(numeroSeleccionado);
          break;
        
        case 'menu_productos':
          respuesta = await manejarMenuProductos(numeroSeleccionado);
          break;
        
        case 'menu_contacto':
          respuesta = await manejarMenuContacto(numeroSeleccionado);
          break;
        
        case 'menu_categoria':
          respuesta = await manejarMenuCategoria(numeroSeleccionado);
          break;
        
        case 'menu_entregas':
          respuesta = await manejarMenuEntregas(numeroSeleccionado);
          break;
        
        case 'menu_garantia':
          respuesta = await manejarMenuGarantia(numeroSeleccionado);
          break;
        
        default:
          respuesta = chatbotService.generarRespuesta('bienvenida', datosEmpresa);
          nuevoEstado = 'menu_principal';
      }

      if (respuesta) {
        const botMessage = {
          id: Date.now() + 1,
          text: respuesta.text,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          type: respuesta.type || 'message',
          opcionesNumeradas: respuesta.opcionesNumeradas !== false,
          acciones: respuesta.acciones || []
        };

        setMessages(prev => [...prev, botMessage]);
        setCurrentState(respuesta.nuevoEstado || nuevoEstado);
        
        // Ejecutar acciones si las hay
        if (respuesta.acciones && respuesta.acciones.length > 0) {
          respuesta.acciones.forEach(accion => {
            if (accion.tipo && accion.datos) {
              chatbotService.manejarAccion(accion.tipo, accion.datos);
            }
          });
        }
      }

      setIsTyping(false);
    }, 800);
  };

  // Manejar menú principal
  const manejarMenuPrincipal = async (numero) => {
    if (!datosEmpresa) return null;

    switch (numero) {
      case 1: // Ver productos
        const categoriasData = await chatbotService.obtenerCategorias();
        if (categoriasData.success && categoriasData.categorias.length > 0) {
          setCategorias(categoriasData.categorias);
          const respuesta = chatbotService.generarRespuesta('productos', datosEmpresa, {
            categorias: categoriasData.categorias
          });
          return { ...respuesta, type: 'productos', nuevoEstado: 'menu_productos' };
        } else {
        return {
            text: `🛍️ <strong>NUESTROS PRODUCTOS</strong><br><br>Estamos cargando nuestras categorías. Por favor, intente nuevamente en un momento.<br><br><strong>Opciones:</strong><br><br>1.- 🔄 Volver al menú principal<br>2.- 📞 Contactar vendedor<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true,
            type: 'productos',
            nuevoEstado: 'menu_principal'
          };
        }
      
      case 2: // Contacto
        return {
          ...chatbotService.generarRespuesta('contacto', datosEmpresa),
          nuevoEstado: 'menu_contacto'
        };
      
      case 3: // Horarios
        return {
          ...chatbotService.generarRespuesta('horarios', datosEmpresa),
          nuevoEstado: 'menu_principal'
        };
      
      case 4: // Ubicación
        return {
          ...chatbotService.generarRespuesta('ubicacion', datosEmpresa),
          nuevoEstado: 'menu_principal'
        };
      
      case 5: // Entregas Región Puno
        return {
          ...chatbotService.generarRespuesta('entregas', datosEmpresa),
          nuevoEstado: 'menu_entregas'
        };
      
      case 6: // Garantía
        return {
          ...chatbotService.generarRespuesta('garantia', datosEmpresa),
          nuevoEstado: 'menu_garantia'
        };
      
      case 7: // Entregas Nacional Shalon
        return {
          ...chatbotService.generarRespuesta('pedidos_shalon', datosEmpresa),
          nuevoEstado: 'menu_entregas'
        };
      
      default:
        return {
          ...chatbotService.generarRespuesta('error_invalido', datosEmpresa, {
            numero: numero,
            maximo: 7
          }),
          nuevoEstado: 'menu_principal'
        };
    }
  };

  // Manejar menú de productos
  const manejarMenuProductos = async (numero) => {
    if (!datosEmpresa) return null;

    const maxOpciones = categorias.length + 1; // Categorías + Contactar vendedor

    if (numero < 1 || numero > maxOpciones) {
        return {
        ...chatbotService.generarRespuesta('error_invalido', datosEmpresa, {
          numero: numero,
          maximo: maxOpciones
        }),
        nuevoEstado: 'menu_productos'
      };
    }

    // Si seleccionó la última opción (Contactar vendedor)
    if (numero === maxOpciones) {
        return {
        ...chatbotService.generarRespuesta('contacto', datosEmpresa),
        nuevoEstado: 'menu_contacto'
      };
    }

    // Seleccionó una categoría
    const categoriaSeleccionada = categorias[numero - 1];
    if (categoriaSeleccionada) {
      setCategoriaSeleccionada(categoriaSeleccionada);
      const productosData = await chatbotService.obtenerProductos(categoriaSeleccionada.nombre);
      
      if (productosData.success) {
        setProductos(productosData.productos);
        return {
          ...chatbotService.generarRespuesta('productos_categoria', datosEmpresa, {
            productos: productosData.productos,
            categoria: categoriaSeleccionada.nombre,
            total: productosData.total
          }),
          nuevoEstado: 'menu_categoria'
        };
      } else {
        return {
          text: `🔧 <strong>${categoriaSeleccionada.nombre.toUpperCase()}</strong><br><br>No hay productos disponibles en esta categoría en este momento.<br><br><strong>Opciones:</strong><br><br>1.- 🔄 Ver otras categorías<br>2.- 📞 Contactar vendedor<br>3.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          nuevoEstado: 'menu_categoria'
        };
      }
    }

    return null;
  };

  // Manejar menú de categoría (después de ver productos)
  const manejarMenuCategoria = async (numero) => {
    if (!datosEmpresa) return null;

    switch (numero) {
      case 1: // Ver otras categorías
        const categoriasData = await chatbotService.obtenerCategorias();
        if (categoriasData.success) {
          setCategorias(categoriasData.categorias);
        return {
            ...chatbotService.generarRespuesta('productos', datosEmpresa, {
              categorias: categoriasData.categorias
            }),
            nuevoEstado: 'menu_productos'
          };
        }
        break;
      
      case 2: // Contactar vendedor
        return {
          ...chatbotService.generarRespuesta('contacto', datosEmpresa),
          nuevoEstado: 'menu_contacto'
        };
      
      case 3: // Buscar específico
        return {
          text: `🔍 <strong>BÚSQUEDA DE PRODUCTOS</strong><br><br>Para buscar un producto específico, por favor contacte a nuestro vendedor que podrá ayudarle mejor.<br><br><strong>Opciones:</strong><br><br>1.- 📞 Llamar ahora<br>2.- 📱 WhatsApp<br>3.- ✉️ Email<br>4.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          nuevoEstado: 'menu_contacto'
        };
      
      default:
        return {
          ...chatbotService.generarRespuesta('error_invalido', datosEmpresa, {
            numero: numero,
            maximo: 3
          }),
          nuevoEstado: 'menu_categoria'
        };
    }

    return null;
  };

  // Manejar menú de contacto
  const manejarMenuContacto = async (numero) => {
    if (!datosEmpresa) return null;

    // Si el estado actual es menu_contacto y selecciona 1, volver al menú principal
    if (currentState === 'menu_contacto' && numero === 1) {
      return volverAlMenuPrincipal();
    }

    const respuesta = chatbotService.manejarOpcionContacto(numero, datosEmpresa);
    
    if (numero >= 1 && numero <= 4) {
        return {
        ...respuesta,
        nuevoEstado: 'menu_contacto'
      };
    }

    return respuesta;
  };

  // Manejar menú de entregas
  const manejarMenuEntregas = async (numero) => {
    if (!datosEmpresa) return null;

    switch (numero) {
      case 1: // Consultar cobertura / Llamar
        // Si viene del menú de entregas, llamar directamente
        if (currentState === 'menu_entregas') {
          chatbotService.manejarAccion('llamar', datosEmpresa.contacto.telefono);
        return {
            text: `📞 <strong>LLAMANDO...</strong><br><br>Abriendo aplicación de teléfono para llamar a:<br><strong>${datosEmpresa.contacto.telefono}</strong><br><br><strong>Opciones:</strong><br><br>1.- 🏠 Volver al menú principal<br>2.- 📱 WhatsApp<br>3.- ✉️ Email<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true,
            nuevoEstado: 'menu_contacto'
          };
        }
        // Si viene del menú de contacto, volver al principal
        return volverAlMenuPrincipal();
      
      case 2: // WhatsApp - Cotización envío
        const numeroLimpio = datosEmpresa.contacto.whatsapp.replace(/[\s\-\(\)]/g, '');
        const mensaje = datosEmpresa.mensajesWhatsApp?.cotizacionEnvio || 'Hola, necesito información sobre entregas';
        chatbotService.manejarAccion('whatsapp_mensaje', { numero: numeroLimpio, mensaje: mensaje });
        return {
          text: `📱 <strong>ABRIENDO WHATSAPP...</strong><br><br>Abriendo WhatsApp para contactar a:<br><strong>${datosEmpresa.contacto.whatsapp}</strong><br><br><strong>Opciones:</strong><br><br>1.- 🏠 Volver al menú principal<br>2.- 📞 Llamar<br>3.- ✉️ Email<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          nuevoEstado: 'menu_contacto'
        };
      
      case 3: // Ver ubicación / Otros transportes
        if (currentState === 'menu_entregas') {
        return {
            ...chatbotService.generarRespuesta('ubicacion', datosEmpresa),
            nuevoEstado: 'menu_principal'
          };
        }
        break;
      
      case 4: // Cotización envío
        const numeroLimpio2 = datosEmpresa.contacto.whatsapp.replace(/[\s\-\(\)]/g, '');
        chatbotService.manejarAccion('whatsapp_mensaje', { 
          numero: numeroLimpio2, 
          mensaje: datosEmpresa.mensajesWhatsApp?.cotizacionEnvio || 'Hola, me gustaría una cotización para envío' 
        });
        return {
          text: `📱 <strong>ABRIENDO WHATSAPP...</strong><br><br>Abriendo WhatsApp para cotización de envío.<br><br><strong>Opciones:</strong><br><br>1.- 🏠 Volver al menú principal<br>2.- 📞 Llamar<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          nuevoEstado: 'menu_contacto'
        };
      
      default:
        return {
          ...chatbotService.generarRespuesta('error_invalido', datosEmpresa, {
            numero: numero,
            maximo: 4
          }),
          nuevoEstado: 'menu_entregas'
        };
    }

    return null;
  };

  // Manejar menú de garantía
  const manejarMenuGarantia = async (numero) => {
    if (!datosEmpresa) return null;

    switch (numero) {
      case 1: // Ver productos con garantía
        const categoriasData = await chatbotService.obtenerCategorias();
        if (categoriasData.success) {
          setCategorias(categoriasData.categorias);
        return {
            ...chatbotService.generarRespuesta('productos', datosEmpresa, {
              categorias: categoriasData.categorias
            }),
            nuevoEstado: 'menu_productos'
          };
        }
        break;
      
      case 2: // Servicio técnico
        return {
          ...chatbotService.generarRespuesta('contacto', datosEmpresa),
          nuevoEstado: 'menu_contacto'
        };
      
      case 3: // Repuestos
        return {
          text: `🔧 <strong>REPUESTOS</strong><br><br>Contamos con repuestos originales para nuestros productos. Para más información, contacte a nuestro servicio técnico.<br><br><strong>Opciones:</strong><br><br>1.- 📞 Llamar ahora<br>2.- 📱 WhatsApp<br>3.- ✉️ Email<br>4.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          nuevoEstado: 'menu_contacto'
        };
      
      default:
        return {
          ...chatbotService.generarRespuesta('error_invalido', datosEmpresa, {
            numero: numero,
            maximo: 3
          }),
          nuevoEstado: 'menu_garantia'
        };
    }

    return null;
  };

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const inputValue = input;
    setInput('');
    processMessage(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setCurrentState('menu_principal');
      setCategoriaSeleccionada(null);
      setProductos([]);
    }
  };

  const minimizeChat = () => {
    setIsOpen(false);
    setCurrentState('menu_principal');
    setCategoriaSeleccionada(null);
    setProductos([]);
  };

  // Renderizar mensaje con HTML
  const renderMessage = (text) => {
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="fixed bottom-8 right-4 z-50">
      {/* Mensaje flotante de bienvenida */}
      {showWelcomeMessage && !isOpen && (
        <div className={`absolute bottom-24 right-0 mb-2 ${isFadingOut ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
          <p className="text-sm font-bold text-orange-600 drop-shadow-2xl whitespace-nowrap px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-orange-200">
            👋 ¿Necesitas ayuda?
          </p>
        </div>
      )}

      {/* Contenedor del botón y contador */}
      <div className="relative">
        {/* Contador de mensajes - fuera del botón */}
        {!isOpen && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center animate-bounce shadow-xl border-2 border-white z-10">
            !
          </span>
        )}
        
        {/* Botón flotante del chatbot */}
      <button
        onClick={toggleChat}
          className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700 text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-orange-500/50 relative overflow-hidden group"
        style={{
            animation: 'floatSlow 4s ease-in-out infinite'
        }}
        title="Chat Asistente JM Ferretería"
      >
          {/* Efecto de brillo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Icono de robot */}
          <div className="relative z-10">
            <FaRobot className="w-8 h-8" />
          </div>
      </button>
      </div>

      {/* Ventana del chatbot */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-orange-200">
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white px-4 py-3 shadow-lg">
            <div className="flex justify-between items-center gap-3">
              {/* Lado izquierdo: Icono y título */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="bg-white/20 rounded-lg p-1.5 backdrop-blur-sm flex-shrink-0">
                  <FaRobot className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h3 className="font-bold text-base leading-tight drop-shadow-sm truncate">Asistente Ferretería</h3>
                  {/* Indicador de estado - inline con el título */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium opacity-90">Activo ahora</span>
                </div>
              </div>
              </div>
              
              {/* Lado derecho: Botones de acción */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Botón de llamada directa */}
                <button
                  onClick={() => {
                    if (datosEmpresa?.contacto?.telefono) {
                      window.open(`tel:${datosEmpresa.contacto.telefono.replace(/\s/g, '')}`, '_self');
                    }
                  }}
                  className="hover:bg-white/30 rounded-lg p-1.5 transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Llamar ahora"
                >
                  <FaPhone className="w-3.5 h-3.5" />
                </button>
                {/* Botón de cerrar */}
                <button
                  onClick={minimizeChat}
                  className="hover:bg-white/30 rounded-lg p-1.5 transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Cerrar chat"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-gray-50 to-gray-100 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-md transition-all duration-200 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-200'
                      : 'bg-white text-gray-800 border border-orange-100 shadow-sm'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    renderMessage(message.text)
                  ) : (
                    <p className="text-sm font-medium">{message.text}</p>
                  )}
                  <span className={`text-xs mt-2 block ${message.sender === 'user' ? 'opacity-80' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-orange-100 bg-gradient-to-b from-white to-gray-50 p-5 shadow-inner">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escriba un número para seleccionar..."
                className="flex-1 border-2 border-orange-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold"
              >
                Enviar
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center font-medium">
              💡 Escriba solo números para seleccionar una opción
            </p>
          </div>
        </div>
      )}

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-15px);
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.8);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(0.95);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.8);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-fadeOut {
          animation: fadeOut 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
