import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaTools, FaIndustry, FaHome, FaShieldAlt, FaAward, FaUsers, FaHandshake, FaRocket, FaBullseye, FaEye } from 'react-icons/fa';

const SobreNosotros = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    setIsVisible(true);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setActiveSection(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const sections = [
    {
      title: "Nuestra Historia",
      icon: FaRocket,
      content: "J&M GUTIERREZ E.I.R.L. nació de la visión de proporcionar suministros industriales y de ferretería de alta calidad. Con más de 10 años de experiencia en el mercado, hemos crecido de ser una pequeña ferretería local a convertirnos en un referente de confianza en la región de Puno.",
      stats: { number: "10+", label: "Años de Experiencia" }
    },
    {
      title: "Nuestra Visión",
      icon: FaEye,
      content: "Ser reconocidos como la ferretería líder en Juliaca, Puno, Perú, destacándonos por nuestra calidad, innovación y compromiso, contribuyendo al crecimiento de nuestros clientes y la comunidad.",
      stats: { number: "Líder", label: "En Juliaca" }
    },
    {
      title: "Nuestra Misión",
      icon: FaBullseye,
      content: "Proveer soluciones confiables en suministros industriales y ferreteros, ofreciendo productos de alta calidad, asesoramiento experto y un servicio cercano para satisfacer las necesidades de nuestros clientes.",
      stats: { number: "1000+", label: "Clientes Satisfechos" }
    }
  ];

  const servicios = [
    {
      title: "Herramientas Profesionales",
      description: "Herramientas manuales y eléctricas de marcas como Stanley, DeWalt, Bosch, Makita y Milwaukee",
      icon: FaTools,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Materiales de Construcción",
      description: "Cementos, arenas, ladrillos, varillas, alambres y todos los materiales necesarios para construcción",
      icon: FaIndustry,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Artículos para el Hogar",
      description: "Plomería, electricidad, pintura, jardín, seguridad y todo lo necesario para el mantenimiento del hogar",
      icon: FaHome,
      color: "from-purple-500 to-purple-600"
    }
  ];

  // Marcas reales de la empresa
  const marcas = [
    { name: "Cantol", image: "/img/img_marcas/Cantol.png" },
    { name: "Forte", image: "/img/img_marcas/Forte.png" },
    { name: "Parma", image: "/img/img_marcas/Parma.png" },
    { name: "Total", image: "/img/img_marcas/Total.png" },
    { name: "Travex", image: "/img/img_marcas/Travex.png" },
    { name: "Truper", image: "/img/img_marcas/Truper.png" }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section con imagen del obrero */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo del obrero */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/img/sobre-nosotros-hero.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-white/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Columna izquierda - Texto */}
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
                  Sobre Nosotros
                </span>
              </h2>
              
              <div className="w-32 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-6 mx-auto md:mx-0"></div>
              
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-bold mb-4">
                Conoce más sobre <strong className="text-orange-600 font-extrabold">J&M GUTIERREZ E.I.R.L.</strong>
              </p>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-semibold">
                Tu proveedor de confianza para herramientas y materiales de construcción en Puno
              </p>
            </div>

            {/* Columna derecha - Imagen del obrero destacada */}
            <div className="relative order-first md:order-last">
              <div className="relative">
                {/* Marco decorativo con efecto de profundidad */}
                <div className="absolute -inset-6 bg-gradient-to-br from-orange-500/40 via-orange-600/40 to-red-600/40 rounded-3xl blur-2xl"></div>
                <div className="absolute -inset-3 bg-white/80 rounded-3xl"></div>
                
                {/* Imagen del obrero */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-orange-500/40 transform hover:scale-[1.02] transition-transform duration-300">
                  <img 
                    src="/img/sobre-nosotros-hero.jpg" 
                    alt="Equipo profesional de construcción" 
                    className="w-full h-[450px] md:h-[550px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 via-transparent to-transparent"></div>
                  
                  {/* Badge de experiencia en la esquina */}
                  <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border-2 border-orange-300/50">
                    <div className="text-3xl md:text-4xl font-black text-orange-600 mb-1">10+</div>
                    <div className="text-sm md:text-base font-bold text-gray-700">Años de Experiencia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <div className="relative bg-white overflow-hidden">
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
        
        {/* Overlay sutil para mejorar legibilidad sin ocultar la imagen */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/35 via-white/20 to-white/35"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/25"></div>
        
        {/* Efecto de brillo sutil en la imagen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/10 via-transparent to-transparent"></div>
        
        <div className="relative max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8 py-20 z-10">
          {/* Secciones principales con animaciones 3D */}
          <div className="space-y-6 md:space-y-8 mb-20">
            {sections.map((section, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index + 1] = el)}
                className="transition-all duration-1000 transform opacity-100"
              >
                <div className="group relative perspective-1000">
                  {/* Efecto 3D de profundidad */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 transform group-hover:scale-105"></div>
                  
                  {/* Card principal con efecto 3D */}
                  <div 
                    className="relative bg-white/98 backdrop-blur-lg rounded-2xl md:rounded-3xl shadow-2xl border-2 border-gray-300 hover:border-orange-400 transition-all duration-500 overflow-hidden transform group-hover:scale-[1.02] group-hover:shadow-2xl"
                    style={{
                      transformStyle: 'preserve-3d',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)'
                    }}
                  >
                    {/* Barra lateral con efecto 3D */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 transform group-hover:scale-y-110 transition-transform duration-500"></div>
                    
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Contenido */}
                    <div className="p-6 md:p-8 lg:p-10 pl-8 md:pl-10 lg:pl-12 relative z-10">
                      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
                        {/* Sección izquierda - Icono y título con efecto 3D */}
                        <div className="flex items-start gap-4 md:gap-6 w-full lg:w-auto">
                          {/* Icono con animación 3D */}
                          <div className="relative flex-shrink-0 transform group-hover:rotate-y-12 transition-transform duration-500" style={{ transformStyle: 'preserve-3d' }}>
                            {/* Sombra 3D */}
                            <div className="absolute -inset-3 bg-gray-200 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 group-hover:blur-2xl transition-all duration-500 transform group-hover:translate-z-[-10px]"></div>
                            
                            {/* Icono con profundidad */}
                            <div className="relative p-4 md:p-5 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl md:rounded-2xl shadow-xl border-2 border-gray-200 group-hover:shadow-2xl transition-all duration-500 transform group-hover:translate-z-10 group-hover:rotate-3">
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 to-transparent rounded-xl md:rounded-2xl"></div>
                              <section.icon className="relative w-8 h-8 md:w-10 md:h-10 text-orange-600 drop-shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />
                            </div>
                          </div>
                          
                          {/* Título con efecto 3D */}
                          <div className="pt-1 md:pt-2 flex-1 lg:flex-none transform group-hover:translate-x-2 transition-transform duration-500">
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 md:mb-3 tracking-tight">
                              <span className="text-gray-800 font-black drop-shadow-xl inline-block transform group-hover:scale-105 transition-transform duration-300" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility', textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>Nuestra </span>
                              <span className="text-orange-600 font-black drop-shadow-xl inline-block transform group-hover:scale-105 transition-transform duration-300" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility', textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>
                                {section.title.split(' ')[1]}
                              </span>
                            </h2>
                            <div className="w-12 md:w-16 lg:w-20 h-0.5 md:h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-md transform group-hover:scale-x-110 transition-transform duration-500"></div>
                          </div>
                        </div>
                        
                        {/* Sección central - Descripción con efecto 3D */}
                        <div className="flex-1 pt-0 lg:pt-2 w-full lg:w-auto transform group-hover:translate-x-1 transition-transform duration-500">
                          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-800 leading-relaxed font-bold tracking-wide drop-shadow-lg" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility', textShadow: '1px 1px 3px rgba(255,255,255,0.9)' }}>
                            {section.content}
                          </p>
                        </div>
                        
                        {/* Sección derecha - Estadística con animación 3D */}
                        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-start">
                          <div className="relative transform group-hover:translate-z-10 transition-transform duration-500" style={{ transformStyle: 'preserve-3d' }}>
                            {/* Sombra 3D profunda */}
                            <div className="absolute -inset-2 bg-gray-300 rounded-2xl blur-xl opacity-40 group-hover:opacity-50 group-hover:blur-2xl transition-all duration-500 transform group-hover:translate-z-[-10px]"></div>
                            
                            {/* Caja de estadística compacta con efecto 3D */}
                            <div className="relative bg-gradient-to-br from-white via-orange-50/30 to-white rounded-lg md:rounded-xl p-4 md:p-5 lg:p-6 shadow-2xl border-2 border-orange-300/70 w-[140px] md:w-[160px] lg:w-[180px] text-center transform group-hover:scale-105 group-hover:rotate-y-3 group-hover:translate-z-10 transition-all duration-500 backdrop-blur-sm" style={{ transformStyle: 'preserve-3d' }}>
                              {/* Acento naranja con efecto 3D */}
                              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-t-lg md:rounded-t-xl shadow-lg"></div>
                              
                              {/* Efecto de brillo interno */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-orange-50/20 to-transparent rounded-lg md:rounded-xl"></div>
                              
                              <div className="relative pt-2">
                                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-orange-600 mb-2 leading-none drop-shadow-xl tracking-tight transform group-hover:scale-105 transition-transform duration-500" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility', textShadow: '2px 2px 6px rgba(255,255,255,0.9)' }}>
                                  {section.stats.number}
                                </div>
                                <div className="w-8 md:w-10 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto rounded-full mb-2 shadow-sm"></div>
                                <div className="text-xs md:text-sm font-black text-gray-800 tracking-wide uppercase leading-tight drop-shadow-md" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility', textShadow: '1px 1px 3px rgba(255,255,255,0.9)' }}>
                                  {section.stats.label}
                                </div>
                              </div>
                              
                              {/* Efecto de borde 3D */}
                              <div className="absolute inset-0 rounded-lg md:rounded-xl border-2 border-white/70 shadow-inner"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Servicios */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-2 rounded-full mb-6 font-semibold text-sm shadow-md">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span>Nuestros Servicios</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
                  Lo que Ofrecemos
                </span>
              </h2>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent to-orange-500 rounded-full"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
                <div className="h-1 w-16 bg-gradient-to-l from-transparent to-orange-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {servicios.map((servicio, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="relative bg-white rounded-3xl p-8 border-2 border-orange-200/50 shadow-xl hover:shadow-2xl hover:border-orange-400/70 hover:-translate-y-2 transition-all duration-500">
                    <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl p-4 mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                      <servicio.icon className="relative w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                    
                    <h3 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent text-center mb-4">
                      {servicio.title}
                    </h3>
                    
                    <p className="text-gray-800 text-center leading-relaxed font-semibold">
                      {servicio.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marcas */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
                  Marcas que Confían
                </span>
              </h2>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent to-orange-500 rounded-full"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
                <div className="h-1 w-16 bg-gradient-to-l from-transparent to-orange-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {marcas.map((marca, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="relative bg-white rounded-3xl p-6 border-2 border-orange-200/50 text-center hover:border-orange-400/70 transition-all duration-500 hover:scale-110 hover:shadow-2xl shadow-xl">
                    <div className="w-full h-24 mb-4 flex items-center justify-center relative">
                      <img 
                        src={marca.image} 
                        alt={`Logo ${marca.name}`}
                        className="relative max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'block';
                          }
                        }}
                      />
                      <span 
                        className="text-xl font-bold text-gray-800 hidden"
                        style={{ display: 'none' }}
                      >
                        {marca.name}
                      </span>
                    </div>
                    
                    <div className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                      {marca.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="group relative mb-20">
            <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-orange-200/50 hover:border-orange-400/70 transition-all duration-500">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12">
              <span className="bg-gradient-to-r from-gray-900 via-orange-600 to-orange-700 bg-clip-text text-transparent">
                Información de Contacto
              </span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="group/item flex items-center space-x-4 p-6 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-2xl hover:bg-gradient-to-br hover:from-orange-200 hover:via-orange-100 hover:to-orange-50 transition-all duration-300 border-2 border-orange-300/60 hover:border-orange-500/80 hover:shadow-xl">
                  <div className="p-3 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl group-hover/item:scale-110 transition-transform duration-300 border-2 border-orange-400/30">
                    <FaPhone className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-extrabold text-lg">Teléfono</div>
                    <div className="text-orange-600 font-bold text-lg">+51 960 604 850</div>
                  </div>
                </div>
                
                <div className="group/item flex items-center space-x-4 p-6 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-2xl hover:bg-gradient-to-br hover:from-orange-200 hover:via-orange-100 hover:to-orange-50 transition-all duration-300 border-2 border-orange-300/60 hover:border-orange-500/80 hover:shadow-xl">
                  <div className="p-3 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl group-hover/item:scale-110 transition-transform duration-300 border-2 border-orange-400/30">
                    <FaEnvelope className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-extrabold text-lg">Email</div>
                    <div className="text-orange-600 font-bold">jymgutierrez2024@gmail.com</div>
                  </div>
                </div>
                
                <div className="group/item flex items-center space-x-4 p-6 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-2xl hover:bg-gradient-to-br hover:from-orange-200 hover:via-orange-100 hover:to-orange-50 transition-all duration-300 border-2 border-orange-300/60 hover:border-orange-500/80 hover:shadow-xl">
                  <div className="p-3 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl group-hover/item:scale-110 transition-transform duration-300 border-2 border-orange-400/30">
                    <FaMapMarkerAlt className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-extrabold text-lg">Ubicación</div>
                    <div className="text-gray-800 text-sm font-semibold">
                      PZA SAN JOSE NRO. 0 URB. SAN JOSE (PUESTO 4 PABELLON J BASE I) PUNO - SAN ROMAN - JULIACA
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="group/item flex items-center space-x-4 p-6 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-2xl hover:bg-gradient-to-br hover:from-orange-200 hover:via-orange-100 hover:to-orange-50 transition-all duration-300 border-2 border-orange-300/60 hover:border-orange-500/80 hover:shadow-xl">
                  <div className="p-3 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl group-hover/item:scale-110 transition-transform duration-300 border-2 border-orange-400/30">
                    <FaClock className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-extrabold text-lg">Horarios</div>
                    <div className="text-gray-800 text-sm font-bold">
                      <div className="text-orange-600">Lunes - Viernes: 8:00 AM - 6:00 PM</div>
                      <div className="text-orange-600">Sábados: 8:00 AM - 7:00 PM</div>
                      <div className="text-orange-600">Domingos: 8:00 AM - 5:00 PM</div>
                    </div>
                  </div>
                </div>
                
                <div className="group/item flex items-center space-x-4 p-6 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-2xl hover:bg-gradient-to-br hover:from-orange-200 hover:via-orange-100 hover:to-orange-50 transition-all duration-300 border-2 border-orange-300/60 hover:border-orange-500/80 hover:shadow-xl">
                  <div className="p-3 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl group-hover/item:scale-110 transition-transform duration-300 border-2 border-orange-400/30">
                    <FaAward className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-extrabold text-lg">RUC</div>
                    <div className="text-orange-600 font-bold text-lg">20611160012</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* CTA final */}
          <div className="text-center">
            <div className="relative bg-gradient-to-br from-white via-orange-50/50 to-white rounded-3xl p-12 shadow-2xl border-2 border-orange-200/50">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
                  ¿Listo para tu próximo proyecto?
                </span>
              </h2>
              
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
                Visita nuestro catálogo y descubre todo lo que tenemos para ofrecerte. 
                Nuestro equipo de expertos está listo para asesorarte.
              </p>
              
              <button className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white px-12 py-4 rounded-full font-bold text-lg hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-orange-500/50">
                Ver Catálogo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS para efectos 3D */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        @keyframes float3D {
          0%, 100% { 
            transform: translateY(0px) rotateX(0deg); 
          }
          25% { 
            transform: translateY(-8px) rotateX(2deg); 
          }
          50% { 
            transform: translateY(-4px) rotateX(0deg); 
          }
          75% { 
            transform: translateY(-12px) rotateX(-2deg); 
          }
        }
        
        @keyframes rotate3D {
          0% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          25% {
            transform: rotateY(5deg) rotateX(2deg);
          }
          50% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          75% {
            transform: rotateY(-5deg) rotateX(-2deg);
          }
          100% {
            transform: rotateY(0deg) rotateX(0deg);
          }
        }
        
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes glow3D {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.2), 0 0 60px rgba(0, 0, 0, 0.1);
          }
        }
        
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-bounce {
          animation: bounce 3s infinite;
        }
        
        .animate-spin {
          animation: spin 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SobreNosotros;
