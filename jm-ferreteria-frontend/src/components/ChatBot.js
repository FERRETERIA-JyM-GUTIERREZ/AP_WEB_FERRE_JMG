import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPhone, FaMapMarkerAlt, FaClock, FaCreditCard, FaTruck, FaShieldAlt, FaEnvelope, FaTimes, FaComments, FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
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
  // Estados para flujo de envíos
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Estados para funcionalidad de voz
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [synthesisSupported, setSynthesisSupported] = useState(false);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const lastTranscriptRef = useRef('');

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

  // Función para enviar mensaje desde voz (definida antes del useEffect)
  const sendMessageFromVoice = async (transcript) => {
    if (!transcript.trim()) return;
    
    setInput(transcript);
    await processMessage(transcript);
  };

  // Verificar soporte de APIs de voz al montar
  useEffect(() => {
    // Verificar soporte de reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setRecognitionSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-PE';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        lastTranscriptRef.current = transcript;
        setInput(transcript);
        setIsListening(false);
        // Enviar el mensaje automáticamente después de reconocer
        setTimeout(() => {
          sendMessageFromVoice(transcript);
        }, 300);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setIsListening(false);
        lastTranscriptRef.current = '';
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Si hay texto reconocido cuando termina el reconocimiento, enviarlo automáticamente
        const transcript = lastTranscriptRef.current.trim();
        if (transcript && transcript.length > 0) {
          setTimeout(() => {
            sendMessageFromVoice(transcript);
            lastTranscriptRef.current = '';
          }, 100);
        }
      };
    }
    
    // Verificar soporte de síntesis de voz
    if ('speechSynthesis' in window) {
      setSynthesisSupported(true);
    }
  }, []);

  // Función para iniciar/detener reconocimiento de voz
  const toggleListening = () => {
    if (!recognitionSupported) {
      alert('Tu navegador no soporta reconocimiento de voz. Por favor, usa Chrome o Edge.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error al iniciar reconocimiento:', error);
        setIsListening(false);
      }
    }
  };

  // Función para hablar el texto
  const speakText = (text) => {
    if (!synthesisSupported) return;
    
    // Detener cualquier síntesis anterior
    window.speechSynthesis.cancel();
    
    // Limpiar HTML tags del texto
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    
    if (cleanText) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-PE';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Función para detener la síntesis
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

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
    
    setIsTyping(true);
    
    // Si NO es un número, usar Gemini AI o detectar intenciones específicas
    if (!esNumeroValido(mensajeLimpio)) {
      try {
        const mensajeLower = mensajeLimpio.toLowerCase();
        
        // Detectar si pregunta por productos
        const preguntaProductos = /producto|catálogo|catalogo|categoría|categoria|qué tienen|que tienen|qué venden|que venden/i.test(mensajeLimpio);
        
        // Detectar si pregunta por envíos
        const preguntaEnvios = /envío|envio|entrega|shalom|shalon|departamento|distrito|ciudad|ubicación|ubicacion/i.test(mensajeLimpio);
        
        // PRIMERO: Verificar si mencionan un lugar específico (antes de mostrar lista genérica)
        if (preguntaEnvios) {
          const departamentosData = await chatbotService.obtenerDepartamentos();
          const mensajeLower = mensajeLimpio.toLowerCase();
          
          if (departamentosData.success && departamentosData.departamentos.length > 0) {
            // Buscar si mencionan algún departamento o ciudad específica
            const departamentoMencionado = departamentosData.departamentos.find(dept => {
              const deptLower = dept.toLowerCase();
              // Buscar si el mensaje contiene el nombre del departamento
              return mensajeLower.includes(deptLower) || deptLower.includes(mensajeLower.split(' ').find(word => word.length > 3) || '');
            });
            
            // Si encontraron un departamento específico, responder directamente
            if (departamentoMencionado) {
              const ciudadesData = await chatbotService.obtenerCiudadesPorDepartamento(departamentoMencionado);
              
              if (ciudadesData.success && ciudadesData.ciudades.length > 0) {
                let textoRespuesta = `<strong>✅ SÍ, hacemos envíos a ${departamentoMencionado.toUpperCase()}</strong><br><br>`;
                textoRespuesta += `Tenemos disponibles las siguientes ciudades/provincias en ${departamentoMencionado}:<br><br>`;
                
                ciudadesData.ciudades.forEach((ciudad, idx) => {
                  textoRespuesta += `${idx + 1}. ${ciudad}<br>`;
                });
                
                textoRespuesta += `<br><strong>Total: ${ciudadesData.ciudades.length} ciudades/provincias disponibles.</strong><br><br>`;
                textoRespuesta += `Puedes elegir entre:<br>`;
                textoRespuesta += `✈️ Envío aéreo (Shalom Aéreo)<br>`;
                textoRespuesta += `🚚 Envío terrestre<br><br>`;
                textoRespuesta += `<strong>💡 Para más información o realizar un pedido, contacta a nuestro vendedor.</strong><br><br>`;
                textoRespuesta += `<strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>`;
                
                const botMessage = {
                  id: Date.now() + 1,
                  text: textoRespuesta,
                  sender: 'bot',
                  timestamp: new Date().toLocaleTimeString(),
                  type: 'envios',
                  opcionesNumeradas: true
                };
                setMessages(prev => [...prev, botMessage]);
                setCurrentState('menu_principal');
                setIsTyping(false);
                return;
              } else {
                // Departamento mencionado pero no hay ciudades disponibles
                let textoRespuesta = `<strong>❌ No hacemos envíos a ${departamentoMencionado.toUpperCase()}</strong><br><br>`;
                textoRespuesta += `Actualmente no tenemos cobertura de envío para ${departamentoMencionado}.<br><br>`;
                textoRespuesta += `Sin embargo, hacemos envíos a nivel nacional a muchos otros departamentos.<br><br>`;
                textoRespuesta += `<strong>💡 Para consultar otros destinos disponibles o más información, contacta a nuestro vendedor.</strong><br><br>`;
                textoRespuesta += `<strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Ver otros destinos disponibles<br><br><strong>Escriba un número:</strong>`;
                
                const botMessage = {
                  id: Date.now() + 1,
                  text: textoRespuesta,
                  sender: 'bot',
                  timestamp: new Date().toLocaleTimeString(),
                  type: 'envios',
                  opcionesNumeradas: true
                };
                setMessages(prev => [...prev, botMessage]);
                setCurrentState('menu_principal');
                setIsTyping(false);
                return;
              }
            }
          }
        }
        
        // Detectar si mencionan una ciudad específica y obtener información detallada
        // PRIORIDAD: Buscar primero en agencias (más ciudades disponibles), luego en destinos
        let ciudadMencionada = null;
        let tipoEnvioCiudad = null;
        let agenciasCiudad = [];
        let tieneEnvioAereo = false; // Solo para ciudades principales (capitales de departamento)
        
        if (preguntaEnvios) {
          // PRIMERO: Buscar en ciudades con agencias (prioridad porque tiene más ciudades)
          const ciudadesData = await chatbotService.obtenerCiudadesConAgencias();
          
          if (ciudadesData.success && ciudadesData.ciudades.length > 0) {
            const ciudadEncontrada = ciudadesData.ciudades.find(ciudad => {
              const nombreCiudad = ciudad.ciudad.toLowerCase();
              const palabrasMensaje = mensajeLower.split(' ').filter(word => word.length > 3);
              return mensajeLower.includes(nombreCiudad) || nombreCiudad.includes(palabrasMensaje[0] || '');
            });
            
            if (ciudadEncontrada) {
              ciudadMencionada = ciudadEncontrada.ciudad;
              
              // Obtener agencias de esa ciudad (Shalom terrestre)
              const agenciasData = await chatbotService.obtenerAgenciasPorCiudad(ciudadEncontrada.ciudad);
              if (agenciasData.success && agenciasData.agencias.length > 0) {
                agenciasCiudad = agenciasData.agencias;
              }
              
              // Por defecto es terrestre (90% de preferencia)
              tipoEnvioCiudad = 'terrestre';
              
              // Verificar si también tiene envío aéreo (solo para capitales de departamento)
              const destinosData = await chatbotService.obtenerDestinosEnvio();
              if (destinosData.success && destinosData.destinos.length > 0) {
                const destinoAereo = destinosData.destinos.find(d => 
                  d.nombre.toLowerCase() === ciudadEncontrada.ciudad.toLowerCase() && 
                  d.tipo_envio === 'aereo'
                );
                if (destinoAereo) {
                  tieneEnvioAereo = true; // Tiene ambos, pero priorizamos terrestre
                }
              }
            }
          }
          
          // SEGUNDO: Si no se encontró en agencias, buscar en destinos_envio (solo capitales)
          if (!ciudadMencionada) {
            const destinosData = await chatbotService.obtenerDestinosEnvio();
            
            if (destinosData.success && destinosData.destinos.length > 0) {
              const ciudadEncontrada = destinosData.destinos.find(destino => {
                const nombreDestino = destino.nombre.toLowerCase();
                const palabrasMensaje = mensajeLower.split(' ').filter(word => word.length > 3);
                return mensajeLower.includes(nombreDestino) || nombreDestino.includes(palabrasMensaje[0] || '');
              });
              
              if (ciudadEncontrada) {
                ciudadMencionada = ciudadEncontrada.nombre;
                tipoEnvioCiudad = ciudadEncontrada.tipo_envio; // 'aereo' o 'terrestre'
                
                // Intentar obtener agencias de esa ciudad (puede que tenga agencias terrestres también)
                const agenciasData = await chatbotService.obtenerAgenciasPorCiudad(ciudadEncontrada.nombre);
                if (agenciasData.success && agenciasData.agencias.length > 0) {
                  agenciasCiudad = agenciasData.agencias;
                  // Si tiene agencias, también tiene terrestre
                  if (tipoEnvioCiudad === 'aereo') {
                    tieneEnvioAereo = true;
                    tipoEnvioCiudad = 'terrestre'; // Priorizar terrestre
                  }
                }
              }
            }
          }
        }
        
        // Si pregunta por productos, mostrar productos reales
        if (preguntaProductos) {
          const categoriasData = await chatbotService.obtenerCategorias();
          const productosData = await chatbotService.obtenerProductos();
          
          if (categoriasData.success && categoriasData.categorias.length > 0) {
            setCategorias(categoriasData.categorias);
            
            // Agrupar productos por categoría
            const productosPorCategoria = {};
            if (productosData.success && productosData.productos.length > 0) {
              productosData.productos.forEach(producto => {
                const categoria = producto.categoria?.nombre || 'Sin categoría';
                if (!productosPorCategoria[categoria]) {
                  productosPorCategoria[categoria] = [];
                }
                productosPorCategoria[categoria].push(producto);
              });
            }
            
            let textoProductos = '<strong>🛍️ NUESTROS PRODUCTOS</strong><br><br>';
            textoProductos += 'Tenemos productos en las siguientes categorías:<br><br>';
            
            Object.keys(productosPorCategoria).forEach((categoria, idx) => {
              textoProductos += `<strong>${idx + 1}. ${categoria}</strong><br>`;
              const productosCategoria = productosPorCategoria[categoria].slice(0, 5);
              productosCategoria.forEach(producto => {
                textoProductos += `   • ${producto.nombre}${producto.precio ? ` - S/ ${producto.precio}` : ''}<br>`;
              });
              if (productosPorCategoria[categoria].length > 5) {
                textoProductos += `   ... y ${productosPorCategoria[categoria].length - 5} productos más<br>`;
              }
              textoProductos += '<br>';
            });
            
            textoProductos += '<strong>💡 Para ver más productos o hacer una compra, contacta a nuestro vendedor.</strong><br><br>';
            textoProductos += '<strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>';
            
            const botMessage = {
              id: Date.now() + 1,
              text: textoProductos,
              sender: 'bot',
              timestamp: new Date().toLocaleTimeString(),
              type: 'productos',
              opcionesNumeradas: true
            };
            setMessages(prev => [...prev, botMessage]);
            setCurrentState('menu_productos');
            setIsTyping(false);
            return;
          }
        }
        
        // Si pregunta genéricamente por envíos nacionales (sin mencionar lugar específico)
        const preguntaEnviosNacionales = /envíos? nacionales?|a qué partes? hacen envíos?|dónde hacen envíos?|donde hacen envios?|qué lugares? hacen envíos?|que lugares hacen envios?/i.test(mensajeLimpio);
        
        if (preguntaEnvios && preguntaEnviosNacionales && currentState !== 'menu_envio_departamento' && currentState !== 'menu_envio_ciudad') {
          const departamentosData = await chatbotService.obtenerDepartamentos();
          
          if (departamentosData.success && departamentosData.departamentos.length > 0) {
            setDepartamentos(departamentosData.departamentos);
            
            let textoEnvios = '<strong>🚚 ENVÍOS NACIONALES</strong><br><br>';
            textoEnvios += 'Sí, hacemos envíos a nivel nacional.<br><br>';
            textoEnvios += '<strong>Departamentos disponibles:</strong><br><br>';
            
            departamentosData.departamentos.forEach((dept, idx) => {
              textoEnvios += `${idx + 1}. ${dept}<br>`;
            });
            
            textoEnvios += `<br><strong>Total: ${departamentosData.departamentos.length} departamentos disponibles.</strong><br><br>`;
            textoEnvios += 'Puedes elegir entre envío aéreo (Shalom Aéreo) o terrestre.<br><br>';
            textoEnvios += '<strong>💡 Para consultar ciudades disponibles de un departamento específico, pregunta por ese departamento.</strong><br><br>';
            textoEnvios += '<strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>';
            
            const botMessage = {
              id: Date.now() + 1,
              text: textoEnvios,
              sender: 'bot',
              timestamp: new Date().toLocaleTimeString(),
              type: 'envios',
              opcionesNumeradas: true
            };
            setMessages(prev => [...prev, botMessage]);
            setCurrentState('menu_principal');
            setIsTyping(false);
            return;
          }
        }
        
        // Si está en flujo de envíos y menciona un departamento
        if (currentState === 'menu_envio_departamento') {
          const deptEncontrado = departamentos.find(dept => 
            dept.toLowerCase().includes(mensajeLower) || mensajeLower.includes(dept.toLowerCase())
          );
          
          if (deptEncontrado) {
            setDepartamentoSeleccionado(deptEncontrado);
            const ciudadesData = await chatbotService.obtenerCiudadesPorDepartamento(deptEncontrado);
            
            if (ciudadesData.success && ciudadesData.ciudades.length > 0) {
              setCiudades(ciudadesData.ciudades);
              
              let textoCiudades = `<strong>📍 CIUDADES/DISTRITOS EN ${deptEncontrado.toUpperCase()}</strong><br><br>`;
              textoCiudades += '<strong>Seleccione la ciudad o distrito:</strong><br><br>';
              
              ciudadesData.ciudades.forEach((ciudad, idx) => {
                textoCiudades += `${idx + 1}. ${ciudad}<br>`;
              });
              
              textoCiudades += '<br><strong>Escriba el nombre de la ciudad o un número:</strong>';
              
              const botMessage = {
                id: Date.now() + 1,
                text: textoCiudades,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString(),
                type: 'envios',
                opcionesNumeradas: false
              };
              setMessages(prev => [...prev, botMessage]);
              setCurrentState('menu_envio_ciudad');
              setIsTyping(false);
              return;
            }
          }
        }
        
        // Si está en flujo de ciudades y menciona una ciudad
        if (currentState === 'menu_envio_ciudad') {
          const ciudadEncontrada = ciudades.find(ciudad => 
            ciudad.toLowerCase().includes(mensajeLower) || mensajeLower.includes(ciudad.toLowerCase())
          );
          
          if (ciudadEncontrada) {
            setCiudadSeleccionada(ciudadEncontrada);
            const agenciasData = await chatbotService.obtenerAgenciasPorCiudad(ciudadEncontrada);
            
            if (agenciasData.success && agenciasData.agencias.length > 0) {
              let textoAgencias = `<strong>📍 AGENCIAS SHALOM EN ${ciudadEncontrada.toUpperCase()}</strong><br><br>`;
              
              agenciasData.agencias.forEach((agencia, idx) => {
                textoAgencias += `<strong>${idx + 1}. ${agencia.nombre}</strong><br>`;
                textoAgencias += `📍 Dirección: ${agencia.direccion}<br>`;
                if (agencia.referencia) {
                  textoAgencias += `📍 Referencia: ${agencia.referencia}<br>`;
                }
                if (agencia.telefono) {
                  textoAgencias += `📞 Teléfono: ${agencia.telefono}<br>`;
                }
                if (agencia.horarios) {
                  textoAgencias += `🕒 Horarios: ${agencia.horarios}<br>`;
                }
                textoAgencias += '<br>';
              });
              
              textoAgencias += '<strong>💡 Para realizar un pedido, contacta a nuestro vendedor.</strong><br><br>';
              textoAgencias += '<strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>';
              
              const botMessage = {
                id: Date.now() + 1,
                text: textoAgencias,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString(),
                type: 'envios',
                opcionesNumeradas: true
              };
              setMessages(prev => [...prev, botMessage]);
              setCurrentState('menu_principal');
              setIsTyping(false);
              return;
            }
          }
        }
        
        // Validar que datosEmpresa esté cargado
        if (!datosEmpresa) {
          // Esperar un momento y reintentar, o usar datos por defecto
          const errorMessage = {
            id: Date.now() + 1,
            text: '⏳ <strong>Cargando información...</strong><br><br>Por favor, espera un momento e intenta de nuevo.<br><br><strong>Opciones:</strong><br><br>1.- 🔄 Reintentar<br>2.- 📞 Contacto directo<br><br><strong>Escriba un número:</strong>',
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
            type: 'error',
            opcionesNumeradas: true
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
          return;
        }
        
        // Detectar si mencionan un departamento específico
        const departamentosData = await chatbotService.obtenerDepartamentos();
        let departamentoMencionado = null;
        let ciudadesDelDepartamento = [];
        let provinciasPuno = [];
        
        if (departamentosData.success && departamentosData.departamentos.length > 0) {
          // Buscar si mencionan algún departamento en el mensaje
          const mensajeLower = mensajeLimpio.toLowerCase();
          departamentoMencionado = departamentosData.departamentos.find(dept => 
            mensajeLower.includes(dept.toLowerCase()) || dept.toLowerCase().includes(mensajeLower.split(' ').find(word => word.length > 3) || '')
          );
          
          // Si encontraron un departamento, obtener sus ciudades
          if (departamentoMencionado) {
            const ciudadesData = await chatbotService.obtenerCiudadesPorDepartamento(departamentoMencionado);
            if (ciudadesData.success && ciudadesData.ciudades.length > 0) {
              ciudadesDelDepartamento = ciudadesData.ciudades;
            }
          }
          
          // Si preguntan por Puno específicamente, obtener provincias
          if (mensajeLower.includes('puno') && (mensajeLower.includes('provincia') || mensajeLower.includes('departamento') || mensajeLower.includes('envío') || mensajeLower.includes('envio'))) {
            const ciudadesPunoData = await chatbotService.obtenerCiudadesPorDepartamento('PUNO');
            if (ciudadesPunoData.success && ciudadesPunoData.ciudades.length > 0) {
              provinciasPuno = ciudadesPunoData.ciudades;
            }
          }
        }
        
        // Obtener historial reciente para contexto
        const historialReciente = messages.slice(-10).map(msg => ({
          sender: msg.sender,
          text: msg.sender === 'user' ? msg.text : msg.text.replace(/<[^>]*>/g, '') // Remover HTML para contexto
        }));
        
        // Obtener productos, categorías y destinos de envío para contexto
        const productosData = await chatbotService.obtenerProductos();
        const categoriasData = await chatbotService.obtenerCategorias();
        const destinosEnvioData = await chatbotService.obtenerDestinosEnvio();
        
        // Obtener URL base del frontend para el catálogo
        const frontendUrl = window.location.origin;
        const catalogoUrl = `${frontendUrl}/catalogo`;
        
        // Procesar con Gemini (pasar información del departamento si se detectó)
        const respuestaGemini = await chatbotService.procesarConGemini(
          mensajeLimpio, 
          datosEmpresa, 
          historialReciente,
          productosData,
          categoriasData,
          destinosEnvioData,
          departamentoMencionado,
          ciudadesDelDepartamento,
          provinciasPuno,
          departamentosData.success ? departamentosData.departamentos : [],
          ciudadMencionada,
          tipoEnvioCiudad,
          agenciasCiudad,
          catalogoUrl,
          tieneEnvioAereo
        );
        
        if (respuestaGemini.success) {
          // Respuesta exitosa de Gemini
          const botMessage = {
            id: Date.now() + 1,
            text: respuestaGemini.text.replace(/\n/g, '<br>'), // Convertir saltos de línea a HTML
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
            type: 'ai_message',
            opcionesNumeradas: false
          };
          setMessages(prev => [...prev, botMessage]);
          
          // Leer la respuesta con voz (después de un pequeño delay para que se renderice)
          setTimeout(() => {
            speakText(respuestaGemini.text);
          }, 500);
        } else {
          // Error en Gemini, ofrecer usar menús
          const errorText = `🤖 ${respuestaGemini.error || 'No pude procesar tu mensaje.'}<br><br><strong>💡 Puedes usar el sistema de menús:</strong><br><br>1.- 🛍️ Ver productos<br>2.- 📞 Contacto<br>3.- 🕒 Horarios<br>4.- 📍 Ubicación<br>5.- 🚚 Entregas<br>6.- 🛡️ Garantía<br><br><strong>Escriba un número o intente otra pregunta:</strong>`;
          const errorMessage = {
            id: Date.now() + 1,
            text: errorText,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
            type: 'error',
            opcionesNumeradas: true
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Error al procesar con Gemini:', error);
        // Fallback a menús si hay error
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
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Si es un número, usar el sistema de menús tradicional
    const numeroSeleccionado = parseInt(mensajeLimpio);

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
        
        // NO ejecutar acciones automáticamente al mostrar el menú
        // Las acciones se ejecutarán solo cuando el usuario seleccione una opción específica
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
          // No hay categorías disponibles
          setCategorias([]);
          return {
            text: `🛍️ <strong>NUESTROS PRODUCTOS</strong><br><br>Actualmente no hay categorías disponibles en nuestro catálogo.<br><br>Por favor, contacta a nuestro vendedor para más información sobre nuestros productos.<br><br><strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true,
            type: 'productos',
            nuevoEstado: 'menu_productos'
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

    // Si no hay categorías, solo permitir contactar vendedor o volver
    if (categorias.length === 0) {
      if (numero === 1) {
        return {
          ...chatbotService.generarRespuesta('contacto', datosEmpresa),
          nuevoEstado: 'menu_contacto'
        };
      } else if (numero === 2) {
        return volverAlMenuPrincipal();
      } else {
        return {
          ...chatbotService.generarRespuesta('error_invalido', datosEmpresa, {
            numero: numero,
            maximo: 2
          }),
          nuevoEstado: 'menu_productos'
        };
      }
    }

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
        if (categoriasData.success && categoriasData.categorias.length > 0) {
          setCategorias(categoriasData.categorias);
          return {
            ...chatbotService.generarRespuesta('productos', datosEmpresa, {
              categorias: categoriasData.categorias
            }),
            nuevoEstado: 'menu_productos'
          };
        } else {
          // No hay categorías disponibles
          setCategorias([]);
          return {
            text: `🛍️ <strong>NUESTROS PRODUCTOS</strong><br><br>Actualmente no hay categorías disponibles en nuestro catálogo.<br><br>Por favor, contacta a nuestro vendedor para más información sobre nuestros productos.<br><br><strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true,
            nuevoEstado: 'menu_productos'
          };
        }
      
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

    // Obtener las acciones del menú de entregas
    const respuestaShalon = chatbotService.generarRespuesta('pedidos_shalon', datosEmpresa);
    const acciones = respuestaShalon.acciones || [];

    switch (numero) {
      case 1: // Llamar para consultar
        if (acciones[0] && acciones[0].tipo === 'llamar') {
          chatbotService.manejarAccion(acciones[0].tipo, acciones[0].datos);
        }
        return {
            text: `📞 <strong>LLAMANDO...</strong><br><br>Abriendo aplicación de teléfono para llamar a:<br><strong>${datosEmpresa.contacto.telefono}</strong><br><br><strong>Opciones:</strong><br><br>1.- 🏠 Volver al menú principal<br>2.- 📱 WhatsApp<br>3.- ✉️ Email<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true,
            nuevoEstado: 'menu_contacto'
          };
      
      case 2: // WhatsApp - Pedido Shalon
        if (acciones[1] && acciones[1].tipo === 'whatsapp_mensaje') {
          chatbotService.manejarAccion(acciones[1].tipo, acciones[1].datos);
        }
        return {
          text: `📱 <strong>ABRIENDO WHATSAPP...</strong><br><br>Abriendo WhatsApp para pedido por Shalon.<br><br><strong>Opciones:</strong><br><br>1.- 🏠 Volver al menú principal<br>2.- 📞 Llamar<br>3.- ✉️ Email<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          nuevoEstado: 'menu_contacto'
        };
      
      case 3: // WhatsApp - Otros transportes
        if (acciones[2] && acciones[2].tipo === 'whatsapp_mensaje') {
          chatbotService.manejarAccion(acciones[2].tipo, acciones[2].datos);
        }
        return {
          text: `📱 <strong>ABRIENDO WHATSAPP...</strong><br><br>Abriendo WhatsApp para consultar otros transportes.<br><br><strong>Opciones:</strong><br><br>1.- 🏠 Volver al menú principal<br>2.- 📞 Llamar<br>3.- ✉️ Email<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          nuevoEstado: 'menu_contacto'
          };
      
      case 4: // WhatsApp - Cotización envío
        if (acciones[3] && acciones[3].tipo === 'whatsapp_mensaje') {
          chatbotService.manejarAccion(acciones[3].tipo, acciones[3].datos);
        }
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
  };

  // Manejar menú de garantía
  const manejarMenuGarantia = async (numero) => {
    if (!datosEmpresa) return null;

    switch (numero) {
      case 1: // Ver productos con garantía
        const categoriasData = await chatbotService.obtenerCategorias();
        if (categoriasData.success && categoriasData.categorias.length > 0) {
          setCategorias(categoriasData.categorias);
          return {
            ...chatbotService.generarRespuesta('productos', datosEmpresa, {
              categorias: categoriasData.categorias
            }),
            nuevoEstado: 'menu_productos'
          };
        } else {
          // No hay categorías disponibles
          setCategorias([]);
          return {
            text: `🛍️ <strong>NUESTROS PRODUCTOS</strong><br><br>Actualmente no hay categorías disponibles en nuestro catálogo.<br><br>Por favor, contacta a nuestro vendedor para más información sobre nuestros productos con garantía.<br><br><strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true,
            nuevoEstado: 'menu_productos'
          };
        }
      
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
            <div className="flex space-x-2">
              {/* Botón de micrófono */}
              {recognitionSupported && (
                <button
                  onClick={toggleListening}
                  disabled={isTyping}
                  className={`px-4 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed`}
                  title={isListening ? 'Detener grabación' : 'Hablar (micrófono)'}
                >
                  {isListening ? <FaMicrophoneSlash className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
                </button>
              )}
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "🎤 Escuchando..." : "Escriba tu pregunta o un número..."}
                className="flex-1 border-2 border-orange-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm"
                disabled={isTyping || isListening}
              />
              
              {/* Botón para detener voz */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  title="Detener voz"
                >
                  <FaVolumeMute className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping || isListening}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold"
              >
                Enviar
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-600 text-center font-medium flex-1">
                💡 Escriba tu pregunta en texto libre o un número para usar menús
              </p>
              {recognitionSupported && (
                <p className="text-xs text-blue-600 ml-2">
                  {isListening ? '🎤 Escuchando...' : '🎤 Presiona el micrófono para hablar'}
                </p>
              )}
            </div>
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
