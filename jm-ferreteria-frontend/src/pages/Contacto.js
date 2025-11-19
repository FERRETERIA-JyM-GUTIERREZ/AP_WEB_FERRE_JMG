import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp, FaFacebook, FaInstagram } from 'react-icons/fa';
import PrismaticContactCard from '../components/PrismaticContactCard';

const Contacto = () => {
  const handleContactClick = (type) => {
    switch (type) {
      case 'phone':
        window.open('tel:+51960604850', '_blank');
        break;
      case 'email':
        window.open('mailto:jymgutierrez2024@gmail.com', '_blank');
        break;
      case 'facebook':
        window.open('https://facebook.com/ferreteriajm', '_blank');
        break;
      case 'instagram':
        window.open('https://instagram.com/ferreteriajm', '_blank');
        break;
      case 'whatsapp':
        window.open('https://wa.me/51960604850', '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section con imagen de fondo - Mejorado */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo - Más visible */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700 hover:scale-100"
          style={{
            backgroundImage: 'url(/img/contacto-hero.jpg)',
          }}
        >
          {/* Overlay blanco más transparente para que se vea mejor la imagen */}
          <div className="absolute inset-0 bg-white/60"></div>
          {/* Overlay naranja más visible */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-orange-400/15 to-transparent"></div>
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent"></div>
        </div>
        
        {/* Contenido del Hero - Más destacado */}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8 text-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-orange-200/50 inline-block">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
              Contáctanos
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-6 text-gray-800 font-semibold">
              Estamos aquí para ayudarte con todo lo que necesites
            </p>
            <div className="w-32 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto rounded-full shadow-lg"></div>
          </div>
        </div>
      </section>

      {/* Sección de Contacto Principal */}
      <section className="py-20 relative overflow-hidden">
        {/* Imagen de fondo - más visible y destacada */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/img/sobre-nosotros-fondo.jpg)',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            opacity: 0.7
          }}
        ></div>
        
        {/* Overlay muy sutil para mejorar legibilidad sin ocultar la imagen */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/15"></div>
        
        {/* Efecto de brillo sutil en la imagen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/5 via-transparent to-transparent"></div>
        
          {/* Contenido */}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8">
          <div className="text-center mb-20">
            {/* Badge decorativo */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-2 rounded-full mb-6 font-semibold text-sm shadow-md">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <span>Contáctanos</span>
            </div>
            
            {/* Título mejorado */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
                Nuestros Canales de
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Contacto
              </span>
            </h2>
            
            {/* Línea decorativa */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent to-orange-500 rounded-full"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
              <div className="h-1 w-16 bg-gradient-to-l from-transparent to-orange-500 rounded-full"></div>
            </div>
            
            {/* Descripción mejorada */}
            <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-4">
                Elige la forma más conveniente para comunicarte con nosotros
              </p>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Estamos disponibles para atenderte todos los días del año
              </p>
            </div>
          </div>

          {/* Contact Cards Grid - Diseño mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {/* Teléfono */}
            <div 
              onClick={() => handleContactClick('phone')}
              className="bg-white/75 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-orange-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Efecto de fondo animado */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-2 group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300 mx-auto shadow-sm group-hover:shadow-md group-hover:scale-110">
                  <FaPhone className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 text-center group-hover:text-orange-600 transition-colors">Teléfono</h3>
                <p className="text-xs text-gray-600 text-center mb-1">Llámanos directamente</p>
                <p className="text-sm font-bold text-orange-600 text-center group-hover:text-orange-700">+51 960 604 850</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div 
              onClick={() => handleContactClick('whatsapp')}
              className="bg-white/75 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-green-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-2 group-hover:from-green-500 group-hover:to-green-600 transition-all duration-300 mx-auto shadow-sm group-hover:shadow-md group-hover:scale-110">
                  <FaWhatsapp className="w-5 h-5 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 text-center group-hover:text-green-600 transition-colors">WhatsApp</h3>
                <p className="text-xs text-gray-600 text-center mb-1">Chatea con nosotros</p>
                <p className="text-sm font-bold text-green-600 text-center group-hover:text-green-700">+51 960 604 850</p>
              </div>
            </div>

            {/* Email */}
            <div 
              onClick={() => handleContactClick('email')}
              className="bg-white/75 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-orange-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-2 group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300 mx-auto shadow-sm group-hover:shadow-md group-hover:scale-110">
                  <FaEnvelope className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 text-center group-hover:text-orange-600 transition-colors">Email</h3>
                <p className="text-xs text-gray-600 text-center mb-1">Envíanos un mensaje</p>
                <p className="text-xs font-bold text-orange-600 text-center break-all group-hover:text-orange-700">jymgutierrez2024@gmail.com</p>
              </div>
            </div>

            {/* Facebook */}
            <div 
              onClick={() => handleContactClick('facebook')}
              className="bg-white/75 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-2 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300 mx-auto shadow-sm group-hover:shadow-md group-hover:scale-110">
                  <FaFacebook className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 text-center group-hover:text-blue-600 transition-colors">Facebook</h3>
                <p className="text-xs text-gray-600 text-center mb-1">Síguenos en Facebook</p>
                <p className="text-xs font-bold text-blue-600 text-center group-hover:text-blue-700">Ferretería J&M Gutiérrez</p>
              </div>
            </div>

            {/* Instagram */}
            <div 
              onClick={() => handleContactClick('instagram')}
              className="bg-white/75 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-pink-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg mb-2 group-hover:from-pink-500 group-hover:to-pink-600 transition-all duration-300 mx-auto shadow-sm group-hover:shadow-md group-hover:scale-110">
                  <FaInstagram className="w-5 h-5 text-pink-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 text-center group-hover:text-pink-600 transition-colors">Instagram</h3>
                <p className="text-xs text-gray-600 text-center mb-1">Síguenos en Instagram</p>
                <p className="text-xs font-bold text-pink-600 text-center group-hover:text-pink-700">@ferreteriajm</p>
              </div>
            </div>

            {/* Ubicación */}
            <div className="bg-white/75 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-orange-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-2 group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300 mx-auto shadow-sm group-hover:shadow-md group-hover:scale-110">
                  <FaMapMarkerAlt className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 text-center group-hover:text-orange-600 transition-colors">Ubicación</h3>
                <p className="text-xs text-gray-600 text-center mb-1">Visítanos en nuestra tienda</p>
                <p className="text-xs font-bold text-orange-600 text-center leading-relaxed group-hover:text-orange-700">
                  Plaza San José - Puesto 4<br />
                  Pabellón J Base II<br />
                  Juliaca, Puno
                </p>
              </div>
            </div>
          </div>

          {/* Google Maps Section - Mejorado */}
          <div className="bg-gradient-to-br from-white via-orange-50/30 to-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-100 relative">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-transparent to-orange-50/30"></div>
            
            <div className="h-[450px] bg-gradient-to-br from-gray-100 via-gray-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
              {/* Patrón de fondo sutil */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-32 h-32 border-4 border-orange-400 rounded-full"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-orange-300 rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-orange-200 rounded-full"></div>
              </div>
              
              <div className="text-center z-10 relative bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-orange-200/50 max-w-md mx-4">
                {/* Icono mejorado */}
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <FaMapMarkerAlt className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
                  Ubicación en Google Maps
                </h3>
                
                <div className="mb-8">
                  <p className="text-lg text-gray-700 font-medium mb-2">📍 Nuestra Dirección</p>
                  <p className="text-gray-600 leading-relaxed">
                    Plaza San José - Puesto 4<br />
                    Pabellón Base 2, Juliaca
                  </p>
                </div>
                
                <button 
                  className="group relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white px-12 py-6 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-orange-500/60 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                  onClick={() => window.open('https://share.google/WOF02DX9KpPTMhSAR', '_blank')}
                >
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Contenido del botón */}
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors duration-300">
                      <FaMapMarkerAlt className="w-6 h-6" />
                    </div>
                    <span className="tracking-wide">Ver en Google Maps</span>
                  </div>
                  
                  {/* Efecto de borde brillante */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horarios Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Imagen de fondo - más visible y destacada */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/img/sobre-nosotros-fondo.jpg)',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            opacity: 0.7
          }}
        ></div>
        
        {/* Overlay muy sutil para mejorar legibilidad sin ocultar la imagen */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/15"></div>
        
        {/* Efecto de brillo sutil en la imagen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/5 via-transparent to-transparent"></div>
        
        <div className="relative z-10 max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8">
          <div className="text-center mb-16">
            {/* Badge decorativo */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-2 rounded-full mb-6 font-semibold text-sm shadow-md">
              <FaClock className="w-4 h-4" />
              <span>Horarios</span>
            </div>
            
            {/* Título mejorado */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
                Horarios de
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Atención
              </span>
            </h2>
            
            {/* Línea decorativa */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent to-orange-500 rounded-full"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
              <div className="h-1 w-16 bg-gradient-to-l from-transparent to-orange-500 rounded-full"></div>
            </div>
            
            {/* Descripción mejorada */}
            <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed max-w-3xl mx-auto">
              Estamos disponibles para atenderte todos los días del año
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {/* Tarjeta de Horarios - Mejorada */}
            <div className="bg-white/65 backdrop-blur-sm rounded-lg p-4 shadow-md border-2 border-orange-100/50 hover:border-orange-200 transition-all duration-300 relative overflow-hidden group">
              {/* Efecto de fondo decorativo */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/15 rounded-full -mr-8 -mt-8 group-hover:bg-orange-200/25 transition-colors duration-300"></div>
              
              <div className="relative z-10">
                {/* Icono mejorado */}
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-2 mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <FaClock className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-extrabold text-gray-900 mb-3 text-center bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
                  Días Laborables
                </h3>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center p-2.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-sm transition-all duration-300">
                    <span className="font-bold text-gray-900 text-xs">Lunes - Viernes:</span>
                    <span className="text-orange-600 font-extrabold text-xs bg-white px-2 py-0.5 rounded-lg shadow-sm">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-sm transition-all duration-300">
                    <span className="font-bold text-gray-900 text-xs">Sábados:</span>
                    <span className="text-orange-600 font-extrabold text-xs bg-white px-2 py-0.5 rounded-lg shadow-sm">8:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-sm transition-all duration-300">
                    <span className="font-bold text-gray-900 text-xs">Domingos:</span>
                    <span className="text-orange-600 font-extrabold text-xs bg-white px-2 py-0.5 rounded-lg shadow-sm">8:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tarjeta de Información Adicional - Mejorada */}
            <div className="bg-white/65 backdrop-blur-sm rounded-lg p-4 shadow-md border-2 border-orange-100/50 hover:border-orange-200 transition-all duration-300 relative overflow-hidden group">
              {/* Efecto de fondo decorativo */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/15 rounded-full -mr-8 -mt-8 group-hover:bg-orange-200/25 transition-colors duration-300"></div>
              
              <div className="relative z-10">
                {/* Icono mejorado */}
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-2 mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <FaMapMarkerAlt className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-extrabold text-gray-900 mb-3 text-center bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
                  Información Adicional
                </h3>
                
                <div className="space-y-2">
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-sm transition-all duration-300">
                    <div className="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                      <div className="bg-orange-500 rounded-lg p-1">
                        <FaMapMarkerAlt className="text-white w-3 h-3" />
                      </div>
                      <span className="text-xs">Dirección:</span>
                    </div>
                    <p className="text-gray-800 font-medium text-xs ml-8">Plaza San José - Puesto 4, Pabellón Base 2, Juliaca</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-sm transition-all duration-300">
                    <div className="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                      <div className="bg-orange-500 rounded-lg p-1">
                        <FaPhone className="text-white w-3 h-3" />
                      </div>
                      <span className="text-xs">Teléfono:</span>
                    </div>
                    <p className="text-gray-800 font-medium text-xs ml-8">+51 960 604 850</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-sm transition-all duration-300">
                    <div className="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                      <div className="bg-orange-500 rounded-lg p-1">
                        <FaEnvelope className="text-white w-3 h-3" />
                      </div>
                      <span className="text-xs">Email:</span>
                    </div>
                    <p className="text-gray-800 font-medium text-xs ml-8 break-all">jymgutierrez2024@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mejorado */}
      <section className="py-24 relative overflow-hidden">
        {/* Imagen de fondo - más visible y destacada */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/img/sobre-nosotros-fondo.jpg)',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            opacity: 0.7
          }}
        ></div>
        
        {/* Overlay muy sutil para mejorar legibilidad sin ocultar la imagen */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/15"></div>
        
        {/* Efecto de brillo sutil en la imagen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/5 via-transparent to-transparent"></div>
        
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 border-4 border-orange-300 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 border-4 border-orange-200 rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge decorativo */}
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-2 rounded-full mb-6 font-semibold text-sm shadow-md">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span>¿Necesitas ayuda?</span>
          </div>
          
          {/* Título mejorado */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
              ¿Tienes alguna
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              pregunta?
            </span>
          </h2>
          
          {/* Línea decorativa */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-orange-500 rounded-full"></div>
          </div>
          
          {/* Descripción mejorada */}
          <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-12 max-w-3xl mx-auto">
            No dudes en contactarnos, estamos aquí para ayudarte con todo lo que necesites
          </p>
          
          {/* Botones mejorados */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleContactClick('whatsapp')}
              className="group relative bg-gradient-to-r from-green-500 via-green-600 to-green-500 text-white px-8 py-4 rounded-xl font-semibold text-base overflow-hidden transition-all duration-300 shadow-xl hover:shadow-green-500/50 transform hover:scale-105 active:scale-95"
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Contenido del botón */}
              <div className="relative z-10 flex items-center justify-center gap-2">
                <div className="bg-white/20 rounded-full p-1.5 group-hover:bg-white/30 transition-colors duration-300">
                  <FaWhatsapp className="w-4 h-4" />
                </div>
                <span>WhatsApp</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleContactClick('phone')}
              className="group relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-base overflow-hidden transition-all duration-300 shadow-xl hover:shadow-orange-500/50 transform hover:scale-105 active:scale-95"
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Contenido del botón */}
              <div className="relative z-10 flex items-center justify-center gap-2">
                <div className="bg-white/20 rounded-full p-1.5 group-hover:bg-white/30 transition-colors duration-300">
                  <FaPhone className="w-4 h-4" />
                </div>
                <span>Llamar Ahora</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacto;
