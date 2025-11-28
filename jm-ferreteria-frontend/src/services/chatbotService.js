import axios from 'axios';

class ChatbotService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    // API Key de Google Gemini (configurar en variables de entorno)
    this.geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    // Usar gemini-2.5-flash (modelo estable disponible según la lista de modelos)
    this.geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  // Obtener datos reales de la empresa
  async obtenerDatosEmpresa() {
    return {
      nombre: 'JM Ferretería',
      propietario: 'Juan Nativerio Quispe Gutiérrez',
      añosExperiencia: '9+ años',
      especialidad: 'Herramientas profesionales, maquinaria industrial y ferretería de alta calidad',
      
      contacto: {
        telefono: '+51 960 604 850',
        email: 'jymgutierrez2024@gmail.com',
        whatsapp: '+51 960 604 850'
      },
      
      ubicacion: {
        direccion: 'PZA. SAN JOSÉ NRO. 0',
        distrito: 'URB. SAN JOSÉ (PUESTO 4 PABELLÓN J BASE II)',
        ciudad: 'PUNO - SAN ROMÁN - JULIACA',
        mapa: 'https://share.google/WOF02DX9KpPTMhSAR'
      },
      
      horarios: {
        semana: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
        sabado: 'Sábados: 8:00 AM - 7:00 PM',
        domingo: 'Domingos: 8:00 AM - 5:00 PM',
        atencionFueraHorario: 'Atención todos los días del año'
      },
      
      metodosPago: {
        efectivo: ['Soles peruanos (PEN)', 'Dólares americanos (USD)'],
        tarjetas: ['Visa', 'Mastercard', 'Débito y Crédito'],
        transferencias: ['BCP', 'Interbank', 'Scotiabank'],
        digitales: ['Yape', 'Plin', 'Billetera digital']
      },
      
      servicios: {
        venta: [
          'Herramientas profesionales',
          'Maquinaria industrial', 
          'Materiales de construcción',
          'Ferretería general'
        ],
        adicionales: [
          'Asesoramiento técnico',
          'Cotizaciones personalizadas',
          'Entrega a domicilio',
          'Garantía en productos',
          'Servicio post-venta'
        ]
      },
      
      entregas: {
        disponible: true,
        cobertura: 'Juliaca y alrededores',
        tiempo: '24-48 horas',
        condiciones: 'Pedido mínimo según zona',
        costo: 'Según distancia',
        servicioDomicilio: 'Entregas a domicilio en Juliaca y alrededores',
        terminalesTransporte: 'Para otros lugares de la región Puno, entregamos en el terminal final de su empresa de transportes preferida',
        empresasTransporte: [
          'Terminal Terrestre Juliaca',
          'Terminal de Transportes San Román',
          'Terminal de Buses Puno',
          'Terminal de Transportes Arequipa',
          'Terminal de Transportes Cusco'
        ]
      },
      
      garantia: {
        incluida: [
          'Herramientas eléctricas',
          'Maquinaria industrial',
          'Productos de marca'
        ],
        terminos: [
          'Garantía según fabricante',
          'Servicio técnico disponible',
          'Repuestos originales',
          'Soporte post-venta'
        ]
      },
      
      destinosShalon: [
        'Juliaca Centro',
        'San Román',
        'Puno Centro',
        'Arequipa Centro',
        'Cusco Centro',
        'Tacna Centro',
        'Moquegua Centro',
        'Abancay Centro',
        'Ayacucho Centro',
        'Huancavelica Centro',
        'Huánuco Centro',
        'Cerro de Pasco Centro',
        'Huancayo Centro',
        'Ica Centro',
        'Lima Centro',
        'Callao Centro',
        'Chiclayo Centro',
        'Piura Centro',
        'Tumbes Centro',
        'Cajamarca Centro',
        'Chachapoyas Centro',
        'Moyobamba Centro',
        'Iquitos Centro',
        'Pucallpa Centro',
        'Tarapoto Centro',
        'Yurimaguas Centro',
        'Puerto Maldonado Centro',
        'Andahuaylas Centro',
        'Espinar Centro',
        'Sicuani Centro'
      ],
      
      mensajesWhatsApp: {
        pedidoShalon: 'Hola, me interesa hacer un pedido por Shalon. ¿Podrían ayudarme con la información de envío?',
        consultaTransporte: 'Hola, necesito información sobre otros medios de transporte para mi pedido. ¿Qué opciones tienen disponibles?',
        cotizacionEnvio: 'Hola, me gustaría una cotización para envío a mi destino. ¿Podrían ayudarme?',
        seguimientoPedido: 'Hola, necesito información sobre el seguimiento de mi pedido. ¿Podrían ayudarme?'
      }
    };
  }

  // Obtener categorías reales de la base de datos
  async obtenerCategorias() {
    try {
      const response = await this.api.get('/catalogo/categorias');
      if (response.data.success) {
        return {
          success: true,
          categorias: response.data.data,
          total: response.data.data.length
        };
      }
      return { success: false, categorias: [], total: 0 };
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return { success: false, categorias: [], total: 0 };
    }
  }

  // Obtener productos reales de la base de datos
  async obtenerProductos(categoria = null) {
    try {
      let url = '/catalogo/productos';
      if (categoria) {
        url += `?categoria=${encodeURIComponent(categoria)}`;
      }
      
      const response = await this.api.get(url);
      if (response.data.success) {
        return {
          success: true,
          productos: response.data.data,
          total: response.data.data.length
        };
      }
      return { success: false, productos: [], total: 0 };
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return { success: false, productos: [], total: 0 };
    }
  }

  // Buscar productos reales
  async buscarProductos(termino) {
    try {
      const response = await this.api.get('/catalogo/buscar', {
        params: { q: termino }
      });
      if (response.data.success) {
        return {
          success: true,
          productos: response.data.data,
          total: response.data.total,
          query: termino
        };
      }
      return { success: false, productos: [], total: 0 };
    } catch (error) {
      console.error('Error buscando productos:', error);
      return { success: false, productos: [], total: 0 };
    }
  }

  // Manejar opciones de contacto
  manejarOpcionContacto(numero, datosEmpresa) {
    switch (numero) {
      case 1: // Llamar ahora
        chatbotService.manejarAccion('llamar', datosEmpresa.contacto.telefono);
        return {
          text: `📞 <strong>LLAMANDO...</strong><br><br>Abriendo aplicación de teléfono para llamar a:<br><strong>${datosEmpresa.contacto.telefono}</strong><br><br>¿Necesitas algo más?<br><br>1.- 🏠 Volver al menú principal<br>2.- 📱 WhatsApp<br>3.- ✉️ Email<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };
      
      case 2: // WhatsApp
        chatbotService.manejarAccion('whatsapp', datosEmpresa.contacto.whatsapp);
        return {
          text: `📱 <strong>ABRIENDO WHATSAPP...</strong><br><br>Abriendo WhatsApp para contactar a:<br><strong>${datosEmpresa.contacto.whatsapp}</strong><br><br>¿Necesitas algo más?<br><br>1.- 🏠 Volver al menú principal<br>2.- 📞 Llamar<br>3.- ✉️ Email<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };
      
      case 3: // Enviar email
        chatbotService.manejarAccion('email', datosEmpresa.contacto.email);
        return {
          text: `✉️ <strong>ABRIENDO EMAIL...</strong><br><br>Abriendo aplicación de email para enviar a:<br><strong>${datosEmpresa.contacto.email}</strong><br><br>¿Necesitas algo más?<br><br>1.- 🏠 Volver al menú principal<br>2.- 📞 Llamar<br>3.- 📱 WhatsApp<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };
      
      case 4: // Visitar tienda
        chatbotService.manejarAccion('mapa', datosEmpresa.ubicacion.mapa);
        return {
          text: `📍 <strong>ABRIENDO MAPA...</strong><br><br>Abriendo Google Maps para llegar a:<br><strong>${datosEmpresa.ubicacion.direccion}</strong><br><strong>${datosEmpresa.ubicacion.ciudad}</strong><br><br>¿Necesitas algo más?<br><br>1.- 🏠 Volver al menú principal<br>2.- 📞 Contacto<br>3.- 🕒 Horarios<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };
      
      default:
        return {
          text: `❌ <strong>Número inválido</strong><br><br>El número ${numero} no es válido. Las opciones disponibles son del 1 al 4.<br><br><strong>Escriba un número válido:</strong>`,
          opcionesNumeradas: true
        };
    }
  }

  // Generar respuesta del chatbot
  generarRespuesta(tipo, datosEmpresa, datosAdicionales = {}) {
    switch (tipo) {
      case 'bienvenida':
        return {
          text: `¡Bienvenido a ${datosEmpresa.nombre}! 🛠️💼<br><br>Con más de ${datosEmpresa.añosExperiencia} de experiencia, somos especialistas en ${datosEmpresa.especialidad.toLowerCase()}.<br><br><strong>¿En qué puedo ayudarte?</strong><br><br>1.- 🛍️ Ver productos<br>2.- 📞 Contacto<br>3.- 🕒 Horarios<br>4.- 📍 Ubicación<br>5.- 🚚 Entregas Región Puno y Juliaca<br>6.- 🛡️ Garantía<br>7.- 🚚 Entregas a Nivel Nacional por Shalon<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };

      case 'productos':
        const categorias = datosAdicionales.categorias || [];
        if (categorias.length > 0) {
          const categoriasTexto = categorias.map((cat, index) => 
            `${index + 1}.- 🔧 ${cat.nombre}`
          ).join('<br>');
          
          return {
            text: `🛍️ <strong>NUESTROS PRODUCTOS</strong><br><br>¿Qué tipo de producto te interesa?<br><br>${categoriasTexto}<br><br>${categorias.length + 1}.- 📞 Contactar vendedor<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true,
            categorias: categorias
          };
        } else {
          return {
            text: `🛍️ <strong>NUESTROS PRODUCTOS</strong><br><br>Actualmente no hay categorías disponibles en nuestro catálogo.<br><br>Por favor, contacta a nuestro vendedor para más información sobre nuestros productos.<br><br><strong>Opciones:</strong><br><br>1.- 📞 Contactar vendedor<br>2.- 🏠 Volver al menú principal<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true
          };
        }

      case 'contacto':
        return {
          text: `📞 <strong>CONTACTO</strong><br><br><strong>Teléfono:</strong> ${datosEmpresa.contacto.telefono}<br><strong>Email:</strong> ${datosEmpresa.contacto.email}<br><br><strong>¿Cómo prefieres contactarnos?</strong><br><br>1.- 📞 Llamar ahora<br>2.- 📱 WhatsApp<br>3.- ✉️ Enviar email<br>4.- 📍 Visitar tienda<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          acciones: [
            { tipo: 'llamar', datos: datosEmpresa.contacto.telefono },
            { tipo: 'whatsapp', datos: datosEmpresa.contacto.whatsapp },
            { tipo: 'email', datos: datosEmpresa.contacto.email },
            { tipo: 'mapa', datos: datosEmpresa.ubicacion.mapa }
          ]
        };

      case 'horarios':
        return {
          text: `🕒 <strong>HORARIOS DE ATENCIÓN</strong><br><br><strong>${datosEmpresa.horarios.semana}</strong><br><strong>${datosEmpresa.horarios.sabado}</strong><br><strong>${datosEmpresa.horarios.domingo}</strong><br><br>${datosEmpresa.horarios.atencionFueraHorario}<br><br><strong>¿Necesitas más información?</strong><br><br>1.- 📞 Llamar ahora<br>2.- 📱 WhatsApp<br>3.- ✉️ Email<br>4.- 📍 Ubicación<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };

      case 'ubicacion':
        return {
          text: `📍 <strong>NUESTRA UBICACIÓN</strong><br><br><strong>Dirección:</strong><br>${datosEmpresa.ubicacion.direccion}<br>${datosEmpresa.ubicacion.distrito}<br>${datosEmpresa.ubicacion.ciudad}<br><br><strong>¿Cómo llegar?</strong><br>Estamos en el centro comercial de Juliaca, es fácil llegar y tenemos estacionamiento disponible.<br><br><strong>¿Qué necesitas?</strong><br><br>1.- 📍 Ver en Google Maps<br>2.- 📞 Contacto<br>3.- 🕒 Horarios<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          acciones: [
            { tipo: 'mapa', datos: datosEmpresa.ubicacion.mapa }
          ]
        };

      case 'entregas':
        return {
          text: `🚚 <strong>ENTREGAS REGIÓN PUNO Y JULIACA</strong><br><br><strong>📍 Juliaca y Alrededores:</strong><br>• ${datosEmpresa.entregas.servicioDomicilio}<br>• Tiempo: ${datosEmpresa.entregas.tiempo}<br>• Costo: ${datosEmpresa.entregas.costo}<br><br><strong>🚌 Región Puno:</strong><br>• ${datosEmpresa.entregas.terminalesTransporte}<br><br><strong>¿Qué necesitas?</strong><br><br>1.- 📞 Consultar cobertura<br>2.- 📱 WhatsApp - Cotización envío<br>3.- 📍 Ver ubicación<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };

      case 'garantia':
        const garantiaIncluida = datosEmpresa?.garantia?.incluida || [];
        const garantiaTexto = garantiaIncluida.length > 0
          ? garantiaIncluida.map((item, index) => 
              `${index + 1}.- ${item}`
            ).join('<br>')
          : 'Garantía según fabricante';
        
        return {
          text: `🛡️ <strong>GARANTÍA EN PRODUCTOS</strong><br><br><strong>Garantía incluida en:</strong><br>${garantiaTexto}<br><br><strong>Términos:</strong><br>• Garantía según fabricante<br>• Servicio técnico disponible<br>• Repuestos originales<br>• Soporte post-venta<br><br><strong>¿Necesitas información específica?</strong><br><br>1.- 🛍️ Ver productos con garantía<br>2.- 📞 Servicio técnico<br>3.- 🔧 Repuestos<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };

      case 'pedidos_shalon':
        const destinosShalon = datosEmpresa?.destinosShalon || [];
        const destinosTexto = destinosShalon.length > 0 
          ? destinosShalon.map((destino, index) => 
              `${index + 1}.- 🚚 ${destino}`
            ).join('<br>')
          : 'No hay destinos disponibles en este momento.';
        
        const mensajesWhatsApp = datosEmpresa?.mensajesWhatsApp || {};
        const contacto = datosEmpresa?.contacto || {};
        
        return {
          text: `🚚 <strong>ENTREGAS A NIVEL NACIONAL POR SHALON</strong><br><br><strong>📦 Modalidad de Entrega:</strong><br>• Se realiza la entrega en el terminal de la agencia Shalon de su localidad<br>• El cliente puede recoger su pedido en el terminal<br>• Disponible en todo el Perú<br><br><strong>Destinos disponibles:</strong><br>${destinosTexto}<br><br><strong>¿Qué necesitas?</strong><br><br>1.- 📞 Llamar para consultar<br>2.- 📱 WhatsApp - Pedido Shalon<br>3.- 📱 WhatsApp - Otros transportes<br>4.- 📱 WhatsApp - Cotización envío<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true,
          acciones: [
            { tipo: 'llamar', datos: contacto.telefono || '' },
            { tipo: 'whatsapp_mensaje', datos: { numero: contacto.whatsapp || '', mensaje: mensajesWhatsApp.pedidoShalon || 'Hola, me interesa hacer un pedido por Shalon.' } },
            { tipo: 'whatsapp_mensaje', datos: { numero: contacto.whatsapp || '', mensaje: mensajesWhatsApp.consultaTransporte || 'Hola, necesito información sobre otros medios de transporte.' } },
            { tipo: 'whatsapp_mensaje', datos: { numero: contacto.whatsapp || '', mensaje: mensajesWhatsApp.cotizacionEnvio || 'Hola, me gustaría una cotización para envío.' } }
          ]
        };

      case 'productos_categoria':
        const productos = datosAdicionales.productos || [];
        const categoria = datosAdicionales.categoria || '';
        
        if (productos.length > 0) {
          const productosTexto = productos.slice(0, 4).map((prod, index) => 
            `${index + 1}.- ${prod.nombre} - ${this.formatearPrecio(prod.precio)}`
          ).join('<br>');
          
          return {
            text: `🔧 <strong>${categoria.toUpperCase()}</strong><br><br>Encontré ${datosAdicionales.total} productos en esta categoría:<br><br>${productosTexto}<br><br>${productos.length > 4 ? `Y ${productos.length - 4} productos más...` : ''}<br><br><strong>¿Qué necesitas?</strong><br><br>1.- 🔄 Ver otras categorías<br>2.- 📞 Contactar vendedor<br>3.- 🔍 Buscar específico<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true,
            productos: productos
          };
        } else {
          return {
            text: `🔧 <strong>${categoria.toUpperCase()}</strong><br><br>No hay productos disponibles en esta categoría en este momento.<br><br><strong>Opciones:</strong><br><br>1.- 🔄 Ver otras categorías<br>2.- 📞 Contactar vendedor<br>3.- 🔍 Buscar específico<br><br><strong>Escriba un número:</strong>`,
            opcionesNumeradas: true
          };
        }

      case 'error_numero':
        return {
          text: `❌ <strong>Por favor, escriba un número</strong><br><br>Debe seleccionar una opción escribiendo el número correspondiente.<br><br><strong>Ejemplo:</strong><br>• Escriba "1" para ver productos<br>• Escriba "2" para contacto<br>• Escriba "3" para horarios<br><br>¿Qué opción desea?<br><br>1.- 🔄 Ver opciones<br>2.- 📞 Contacto directo<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };

      case 'error_invalido':
        const numero = datosAdicionales.numero || '';
        const maximo = datosAdicionales.maximo || 6;
        
        return {
          text: `❌ <strong>Número inválido</strong><br><br>El número ${numero} no es válido. Las opciones disponibles son del 1 al ${maximo}.<br><br><strong>Escriba un número válido:</strong>`,
          opcionesNumeradas: true
        };

      default:
        return {
          text: `🤔 <strong>¿EN QUÉ PUEDO AYUDARTE?</strong><br><br>Puedo ayudarte con información sobre nuestros productos, servicios, horarios, ubicación y más.<br><br><strong>Opciones disponibles:</strong><br><br>1.- 🛍️ Ver productos<br>2.- 📞 Contacto<br>3.- 🕒 Horarios<br>4.- 📍 Ubicación<br>5.- 🚚 Entregas<br>6.- 🛡️ Garantía<br><br><strong>Escriba un número:</strong>`,
          opcionesNumeradas: true
        };
    }
  }

  // Formatear precio
  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }

  // Manejar acciones
  manejarAccion(tipo, datos) {
    switch (tipo) {
      case 'llamar':
        window.open(`tel:${datos}`, '_self');
        break;
      case 'whatsapp':
        // Limpiar el número de WhatsApp (quitar espacios y caracteres especiales)
        const numeroLimpio = datos.replace(/[\s\-\(\)]/g, '');
        window.open(`https://wa.me/${numeroLimpio}`, '_blank');
        break;
      case 'whatsapp_mensaje':
        // Enviar mensaje predeterminado por WhatsApp
        const numeroLimpio2 = datos.numero.replace(/[\s\-\(\)]/g, '');
        const mensajeCodificado = encodeURIComponent(datos.mensaje);
        window.open(`https://wa.me/${numeroLimpio2}?text=${mensajeCodificado}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${datos}`, '_self');
        break;
      case 'mapa':
        window.open(datos, '_blank');
        break;
      default:
        break;
    }
  }

  // Generar contexto para Gemini con información de la empresa
  generarContextoGemini(datosEmpresa, historialMensajes = []) {
    const contexto = `Eres un asistente virtual de ${datosEmpresa.nombre}, una ferretería con ${datosEmpresa.añosExperiencia} de experiencia.

INFORMACIÓN DE LA EMPRESA:
- Nombre: ${datosEmpresa.nombre}
- Propietario: ${datosEmpresa.propietario}
- Especialidad: ${datosEmpresa.especialidad}

CONTACTO:
- Teléfono: ${datosEmpresa.contacto.telefono}
- WhatsApp: ${datosEmpresa.contacto.whatsapp}
- Email: ${datosEmpresa.contacto.email}

UBICACIÓN:
- Dirección: ${datosEmpresa.ubicacion.direccion}
- ${datosEmpresa.ubicacion.distrito}
- ${datosEmpresa.ubicacion.ciudad}

HORARIOS:
- ${datosEmpresa.horarios.semana}
- ${datosEmpresa.horarios.sabado}
- ${datosEmpresa.horarios.domingo}

SERVICIOS:
- Venta de herramientas profesionales, maquinaria industrial y ferretería
- Asesoramiento técnico
- Cotizaciones personalizadas
- Entrega a domicilio en Juliaca y alrededores
- Entregas a nivel nacional por Shalon
- Garantía en productos
- Servicio post-venta

MÉTODOS DE PAGO:
- Efectivo (Soles y Dólares)
- Tarjetas (Visa, Mastercard)
- Transferencias bancarias
- Yape, Plin, Billetera digital

INSTRUCCIONES:
1. Responde de forma amigable y profesional
2. Si el usuario pregunta por productos, sugiere que puede ver el catálogo o contactar al vendedor
3. Si pregunta por precios, indica que debe contactar al vendedor para cotización
4. Si pregunta por entregas, menciona las opciones disponibles
5. Mantén las respuestas concisas pero informativas
6. Usa emojis de forma moderada
7. Si no sabes algo, ofrece contactar al vendedor

IMPORTANTE: Si el usuario quiere ver productos, categorías o hacer una compra, sugiere contactar al vendedor o usar el menú del chatbot.`;

    return contexto;
  }

  // Procesar mensaje con Google Gemini AI
  async procesarConGemini(mensajeUsuario, datosEmpresa, historialMensajes = []) {
    // Verificar si hay API key configurada
    if (!this.geminiApiKey || this.geminiApiKey === '') {
      console.warn('⚠️ Gemini API Key no configurada');
      return {
        success: false,
        error: 'Servicio de IA no configurado. Por favor, use el sistema de menús numerados.'
      };
    }

    try {
      // Generar contexto con información de la empresa
      const contexto = this.generarContextoGemini(datosEmpresa, historialMensajes);
      
      // Preparar el prompt con contexto
      const prompt = `${contexto}\n\nUsuario: ${mensajeUsuario}\nAsistente:`;

      // Lista de modelos a probar en orden de preferencia
      // Modelos verificados disponibles según la lista de la API
      const modelosAPrueba = [
        { version: 'v1beta', model: 'gemini-2.5-flash' },              // Modelo estable recomendado
        { version: 'v1beta', model: 'gemini-2.0-flash-001' },         // Versión estable 2.0
        { version: 'v1beta', model: 'gemini-2.5-pro' },               // Modelo más potente
        { version: 'v1beta', model: 'gemini-flash-latest' },          // Última versión
        { version: 'v1beta', model: 'gemini-2.0-flash' }              // Alternativa 2.0
      ];

      let lastError = null;
      
      // Intentar con cada modelo hasta que uno funcione
      for (const modeloConfig of modelosAPrueba) {
        const apiUrl = `https://generativelanguage.googleapis.com/${modeloConfig.version}/models/${modeloConfig.model}:generateContent`;
        
        console.log(`🔄 Probando modelo: ${modeloConfig.model} (${modeloConfig.version})`);
        
        try {
          const response = await fetch(`${apiUrl}?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            
            // Extraer la respuesta de Gemini
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              const respuestaTexto = data.candidates[0].content.parts[0].text;
              console.log(`✅ Modelo funcionando: ${modeloConfig.model} (${modeloConfig.version})`);
              
              return {
                success: true,
                text: respuestaTexto,
                type: 'ai_message'
              };
            }
          } else {
            const errorData = await response.json();
            lastError = { status: response.status, error: errorData, modelo: modeloConfig };
            console.warn(`❌ Modelo ${modeloConfig.model} (${modeloConfig.version}) falló:`, response.status);
            
            // Si es 404, continuar con el siguiente modelo
            if (response.status === 404) {
              continue;
            }
            
            // Si es otro error (403, 400), puede ser problema de permisos/configuración
            break;
          }
        } catch (error) {
          console.error(`Error al probar modelo ${modeloConfig.model}:`, error);
          lastError = { error: error.message, modelo: modeloConfig };
          continue;
        }
      }
      
      // Si llegamos aquí, todos los modelos fallaron
      console.error('❌ Todos los modelos fallaron. Último error:', lastError);
      
      let errorMessage = 'Error al procesar tu mensaje. Por favor, intenta usar el sistema de menús numerados.';
      if (lastError && lastError.status === 404) {
        errorMessage = 'Ningún modelo de Gemini está disponible. Verifica que la API de Gemini esté habilitada y que tu API key tenga acceso a los modelos.';
      } else if (lastError && lastError.status === 403) {
        errorMessage = 'Acceso denegado. Verifica que la API key sea correcta y tenga permisos para usar Gemini API.';
      } else if (lastError && lastError.status === 400) {
        errorMessage = 'Solicitud inválida. Verifica la configuración de la API.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    } catch (error) {
      console.error('Error al llamar a Gemini API:', error);
      return {
        success: false,
        error: 'Error de conexión. Por favor, intenta usar el sistema de menús numerados (escribe un número).'
      };
    }
  }
}

const chatbotService = new ChatbotService();
export default chatbotService;





















