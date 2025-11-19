import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaWhatsapp, FaFacebook, FaEnvelope, FaPhone, FaTimes, FaChevronUp } from 'react-icons/fa';
import { empresaService } from '../services/empresaService';

const FloatingContactButtons = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [datosEmpresa, setDatosEmpresa] = useState(null);

  // Cargar datos de la empresa
  useEffect(() => {
    const cargarDatos = async () => {
      const resultado = await empresaService.obtenerDatosEmpresa();
      if (resultado.success) {
        setDatosEmpresa(resultado.data);
      }
    };
    cargarDatos();
  }, []);

  const handleWhatsApp = () => {
    if (datosEmpresa?.contacto?.whatsapp) {
      // Remover todos los caracteres no numéricos excepto el +
      let numero = datosEmpresa.contacto.whatsapp.replace(/[\s\-\(\)]/g, '');
      // Si empieza con +, mantenerlo; si no, agregarlo
      if (!numero.startsWith('+')) {
        numero = '+' + numero;
      }
      const mensaje = encodeURIComponent('Hola, me interesa conocer más sobre sus productos y servicios.');
      window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
    }
  };

  const handleFacebook = () => {
    window.open('https://facebook.com/ferreteriajm', '_blank');
  };

  const handleEmail = () => {
    if (datosEmpresa?.contacto?.email) {
      const subject = encodeURIComponent('Consulta desde la web');
      const body = encodeURIComponent('Hola, me gustaría obtener más información sobre sus productos y servicios.');
      window.open(`mailto:${datosEmpresa.contacto.email}?subject=${subject}&body=${body}`, '_self');
    }
  };

  const handlePhone = () => {
    if (datosEmpresa?.contacto?.telefono) {
      const numero = datosEmpresa.contacto.telefono.replace(/\s/g, '');
      window.open(`tel:${numero}`, '_self');
    }
  };

  // No mostrar en páginas de catálogo, administración, gestión o login
  const rutasExcluidas = [
    '/catalogo',
    '/dashboard',
    '/inventario',
    '/ventas',
    '/pedidos',
    '/reportes',
    '/usuarios',
    '/gestion-roles',
    '/login',
    '/register',
    '/staff-login',
    '/admin-login',
    '/login-selector',
    '/staff-protected',
    '/client-login',
    '/unified-login',
    '/side-by-side-login',
    '/client-login-only',
    '/staff-only-login',
    '/smart-login',
    '/auth/google/callback'
  ];

  if (rutasExcluidas.includes(location.pathname)) {
    return null;
  }

  // En la página de inicio, mostrar en la esquina inferior izquierda para evitar confusión con el chatbot
  const isHomePage = location.pathname === '/';
  const positionClasses = isHomePage 
    ? 'fixed bottom-4 left-4 z-40 flex flex-col items-start gap-3 md:bottom-6 md:left-6'
    : 'fixed bottom-32 right-4 z-40 flex flex-col items-end gap-3 md:bottom-36 md:right-6';

  return (
    <div className={positionClasses}>
      {/* Botones de contacto flotantes */}
      <div className={`flex flex-col gap-3 transition-all duration-500 ease-out ${isExpanded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="group relative bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full p-3 md:p-4 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 active:scale-95"
          title="WhatsApp"
          style={{ animation: 'floatSlow 4s ease-in-out infinite' }}
        >
          <FaWhatsapp className="w-5 h-5 md:w-6 md:h-6" />
          {/* Tooltip - Solo en desktop */}
          <span className={`hidden md:block absolute ${isHomePage ? 'left-full ml-3' : 'left-full ml-3'} top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50`}>
            WhatsApp
            <div className={`absolute ${isHomePage ? 'right-full' : 'right-full'} top-1/2 -translate-y-1/2 border-4 border-transparent ${isHomePage ? 'border-r-gray-900' : 'border-r-gray-900'}`}></div>
          </span>
        </button>

        {/* Facebook */}
        <button
          onClick={handleFacebook}
          className="group relative bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-3 md:p-4 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 active:scale-95"
          title="Facebook"
          style={{ animation: 'floatSlow 4s ease-in-out infinite', animationDelay: '0.1s' }}
        >
          <FaFacebook className="w-5 h-5 md:w-6 md:h-6" />
          {/* Tooltip - Solo en desktop */}
          <span className={`hidden md:block absolute ${isHomePage ? 'left-full ml-3' : 'left-full ml-3'} top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50`}>
            Facebook
            <div className={`absolute ${isHomePage ? 'right-full' : 'right-full'} top-1/2 -translate-y-1/2 border-4 border-transparent ${isHomePage ? 'border-r-gray-900' : 'border-r-gray-900'}`}></div>
          </span>
        </button>

        {/* Email */}
        <button
          onClick={handleEmail}
          className="group relative bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full p-3 md:p-4 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 active:scale-95"
          title="Email"
          style={{ animation: 'floatSlow 4s ease-in-out infinite', animationDelay: '0.2s' }}
        >
          <FaEnvelope className="w-5 h-5 md:w-6 md:h-6" />
          {/* Tooltip - Solo en desktop */}
          <span className={`hidden md:block absolute ${isHomePage ? 'left-full ml-3' : 'left-full ml-3'} top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50`}>
            Email
            <div className={`absolute ${isHomePage ? 'right-full' : 'right-full'} top-1/2 -translate-y-1/2 border-4 border-transparent ${isHomePage ? 'border-r-gray-900' : 'border-r-gray-900'}`}></div>
          </span>
        </button>

        {/* Teléfono */}
        <button
          onClick={handlePhone}
          className="group relative bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-3 md:p-4 shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 active:scale-95"
          title="Llamar"
          style={{ animation: 'floatSlow 4s ease-in-out infinite', animationDelay: '0.3s' }}
        >
          <FaPhone className="w-5 h-5 md:w-6 md:h-6" />
          {/* Tooltip - Solo en desktop */}
          <span className={`hidden md:block absolute ${isHomePage ? 'left-full ml-3' : 'left-full ml-3'} top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50`}>
            Llamar
            <div className={`absolute ${isHomePage ? 'right-full' : 'right-full'} top-1/2 -translate-y-1/2 border-4 border-transparent ${isHomePage ? 'border-r-gray-900' : 'border-r-gray-900'}`}></div>
          </span>
        </button>
      </div>

      {/* Botón principal para expandir/contraer */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white rounded-full p-3 md:p-4 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
        title={isExpanded ? "Cerrar" : "Contactos"}
        style={{ animation: 'floatSlow 4s ease-in-out infinite' }}
      >
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        {isExpanded ? (
          <FaTimes className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
        ) : (
          <FaChevronUp className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
        )}
      </button>

      {/* Estilos para animación */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { 
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingContactButtons;

