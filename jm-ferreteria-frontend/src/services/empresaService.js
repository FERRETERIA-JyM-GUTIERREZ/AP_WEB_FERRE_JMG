import axios from 'axios';

class EmpresaService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  // Obtener datos completos de la empresa
  async obtenerDatosEmpresa() {
    try {
      // Datos fijos de la empresa (configurables)
      const datosEmpresa = {
        nombre: 'JM Ferretería',
        nombreCompleto: 'J&M GUTIÉRREZ',
        propietario: 'Juan Nativerio Quispe Gutiérrez',
        añosExperiencia: '9+ años',
        especialidad: 'Herramientas profesionales, maquinaria industrial y ferretería de alta calidad',
        descripcion: 'Especialistas en herramientas profesionales, maquinaria industrial y ferretería de alta calidad. Desde máquinas y sierras circulares hasta herramientas manuales, todo para hacer realidad tus proyectos.',
        
        // Información de contacto
        contacto: {
          telefono: '+51 960 604 850',
          email: 'jymgutierrez2024@gmail.com',
          whatsapp: '+51 960 604 850'
        },
        
        // Ubicación
        ubicacion: {
          direccion: 'PZA. SAN JOSÉ NRO. 0',
          distrito: 'URB. SAN JOSÉ (PUESTO 4 PABELLÓN J BASE II)',
          ciudad: 'PUNO - SAN ROMÁN - JULIACA',
          mapa: 'https://share.google/WOF02DX9KpPTMhSAR'
        },
        
        // Horarios
        horarios: {
          semana: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
          sabado: 'Sábados: 8:00 AM - 7:00 PM',
          domingo: 'Domingos: 8:00 AM - 5:00 PM',
          atencionFueraHorario: 'Atención todos los días del año'
        },
        
        // Métodos de pago
        metodosPago: {
          efectivo: ['Soles peruanos (PEN)', 'Dólares americanos (USD)'],
          tarjetas: ['Visa', 'Mastercard', 'Débito y Crédito'],
          transferencias: ['BCP', 'Interbank', 'Scotiabank'],
          digitales: ['Yape', 'Plin', 'Billetera digital']
        },
        
        // Servicios
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
        
        // Entregas
        entregas: {
          disponible: true,
          cobertura: 'Juliaca y alrededores',
          tiempo: '24-48 horas',
          condiciones: 'Pedido mínimo según zona',
          costo: 'Según distancia'
        },
        
        // Garantía
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
        }
      };

      return {
        success: true,
        data: datosEmpresa
      };
    } catch (error) {
      console.error('Error obteniendo datos de empresa:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  // Generar respuesta dinámica basada en datos reales
  generarRespuestaDinamica(tipo, datosEmpresa) {
    switch (tipo) {
      case 'bienvenida':
        return {
          text: `¡Bienvenido a ${datosEmpresa.nombre}! 🏪👋\n\nCon más de ${datosEmpresa.añosExperiencia} de experiencia, somos especialistas en ${datosEmpresa.especialidad.toLowerCase()}.`,
          options: ['🛍️ Ver productos', '📞 Contacto', '🕒 Horarios', '📍 Ubicación', '🚚 Entregas', '🛡️ Garantía']
        };

      case 'contacto':
        return {
          text: `📞 **CONTACTO**\n\n**Teléfono:** ${datosEmpresa.contacto.telefono}\n**Email:** ${datosEmpresa.contacto.email}\n\n**¿Cómo prefieres contactarnos?**\n\n1.- 📞 Llamar ahora\n2.- 📱 WhatsApp\n3.- ✉️ Enviar email\n4.- 📍 Visitar tienda\n\n**Escriba un número:**`,
          options: ['📞 Llamar ahora', '📱 WhatsApp', '✉️ Enviar email', '📍 Visitar tienda'],
          actions: [
            { type: 'call', label: '📞 Llamar ahora', action: 'call', data: datosEmpresa.contacto.telefono },
            { type: 'email', label: '✉️ Enviar email', action: 'email', data: datosEmpresa.contacto.email }
          ],
          opcionesNumeradas: true
        };

      case 'horarios':
        return {
          text: `🕒 **HORARIOS DE ATENCIÓN**\n\n**${datosEmpresa.horarios.semana}**\n**${datosEmpresa.horarios.sabado}**\n**${datosEmpresa.horarios.domingo}**\n\n${datosEmpresa.horarios.atencionFueraHorario}\n\n**¿Necesitas más información?**\n\n1.- 📞 Llamar ahora\n2.- 📱 WhatsApp\n3.- ✉️ Email\n4.- 📍 Ubicación\n\n**Escriba un número:**`,
          options: ['📞 Llamar ahora', '📱 WhatsApp', '✉️ Email', '📍 Ubicación'],
          opcionesNumeradas: true
        };

      case 'ubicacion':
        return {
          text: `📍 **NUESTRA UBICACIÓN**\n\n**Dirección:**\n${datosEmpresa.ubicacion.direccion}\n${datosEmpresa.ubicacion.distrito}\n${datosEmpresa.ubicacion.ciudad}\n\n**¿Cómo llegar?**\nEstamos en el centro comercial de Juliaca, es fácil llegar y tenemos estacionamiento disponible.\n\n**¿Qué necesitas?**\n\n1.- 📍 Ver en Google Maps\n2.- 📞 Contacto\n3.- 🕒 Horarios\n\n**Escriba un número:**`,
          options: ['📍 Ver en Google Maps', '📞 Contacto', '🕒 Horarios'],
          actions: [{ type: 'location', label: '📍 Ver en Google Maps', action: 'location', data: datosEmpresa.ubicacion.mapa }],
          opcionesNumeradas: true
        };

      case 'servicios':
        const serviciosTexto = datosEmpresa.servicios.venta.map((servicio, index) => 
          `${index + 1}.- ${servicio}`
        ).join('\n');
        
        return {
          text: `🛠️ **NUESTROS SERVICIOS**\n\n**Venta de Productos:**\n${serviciosTexto}\n\n**Servicios Adicionales:**\n• Asesoramiento técnico\n• Cotizaciones personalizadas\n• Entrega a domicilio\n• Garantía en productos`,
          options: ['🛍️ Ver productos', '💰 Solicitar cotización', '📞 Contactar vendedor']
        };

      case 'entregas':
        return {
          text: `🚚 **ENTREGA A DOMICILIO**\n\n**¿Hacemos entregas?** ¡Sí!\n\n**Cobertura:** ${datosEmpresa.entregas.cobertura}\n**Tiempo:** ${datosEmpresa.entregas.tiempo}\n**Condiciones:** ${datosEmpresa.entregas.condiciones}\n\n¿Quieres hacer un pedido?`,
          options: ['🛍️ Hacer pedido', '📞 Contactar vendedor', '📍 Ver ubicación']
        };

      case 'garantia':
        const garantiaTexto = datosEmpresa.garantia.incluida.map((item, index) => 
          `${index + 1}.- ${item}`
        ).join('\n');
        
        return {
          text: `🛡️ **GARANTÍA EN PRODUCTOS**\n\n**Garantía incluida en:**\n${garantiaTexto}\n\n**Términos:**\n• Garantía según fabricante\n• Servicio técnico disponible\n• Repuestos originales\n• Soporte post-venta`,
          options: ['🛍️ Ver productos con garantía', '📞 Servicio técnico', '🔧 Repuestos']
        };

      case 'metodosPago':
        return {
          text: `💳 **MÉTODOS DE PAGO ACEPTADOS**\n\n**Efectivo:**\n• ${datosEmpresa.metodosPago.efectivo.join('\n• ')}\n\n**Tarjetas:**\n• ${datosEmpresa.metodosPago.tarjetas.join('\n• ')}\n\n**Transferencias:**\n• ${datosEmpresa.metodosPago.transferencias.join('\n• ')}\n\n**Pagos Digitales:**\n• ${datosEmpresa.metodosPago.digitales.join('\n• ')}`,
          options: ['🛍️ Ver productos', '💰 Hacer pedido', '📞 Contactar vendedor']
        };

      default:
        return {
          text: '🤔 **¿EN QUÉ PUEDO AYUDARTE?**\n\nPuedo ayudarte con información sobre nuestros productos, servicios, horarios, ubicación y más.\n\n**Opciones disponibles:**\n\n1.- 🛍️ Ver productos\n2.- 📞 Contacto\n3.- 🕒 Horarios\n4.- 📍 Ubicación\n5.- 🚚 Entregas\n6.- 🛡️ Garantía\n\n**Escriba un número:**',
          options: ['🛍️ Ver productos', '📞 Contacto', '🕒 Horarios', '📍 Ubicación', '🚚 Entregas', '🛡️ Garantía'],
          opcionesNumeradas: true
        };
    }
  }
}

const empresaService = new EmpresaService();
export { empresaService };
export default empresaService;

