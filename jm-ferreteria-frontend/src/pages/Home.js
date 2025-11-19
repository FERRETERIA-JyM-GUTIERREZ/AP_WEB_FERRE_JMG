import React, { useState, useEffect, useRef } from 'react';
import ChatBot from '../components/ChatBot';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock, FaTruck, FaCreditCard, FaMoneyBillWave, FaExchangeAlt, FaMobileAlt, FaTimes, FaRocket, FaEye, FaBullseye } from 'react-icons/fa';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [animatedElements, setAnimatedElements] = useState({
    hero: false,
    cards: false,
    cta: false
  });
  
  const [currentPaymentSlide, setCurrentPaymentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activePanel, setActivePanel] = useState(null); // 'sobre-nosotros' o 'contacto'

  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const ctaRef = useRef(null);
  const carouselRef = useRef(null);

  // Detectar cambios en la URL para abrir paneles
  useEffect(() => {
    if (location.pathname === '/sobre-nosotros') {
      setActivePanel('sobre-nosotros');
    } else if (location.pathname === '/contacto') {
      setActivePanel('contacto');
    } else {
      setActivePanel(null);
    }
  }, [location.pathname]);

  // Animación del hero con JavaScript
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedElements(prev => ({ ...prev, hero: true }));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Animación de las tarjetas con IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements(prev => ({ ...prev, cards: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (cardsRef.current) {
      observer.observe(cardsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animación del CTA con IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements(prev => ({ ...prev, cta: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Función para animar tarjetas con delay escalonado
  const animateCard = (index) => {
    const isVisible = animatedElements.cards;
    
    return `bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-700 ease-out transform ${
      isVisible 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 translate-y-12 scale-95'
    } hover:scale-105`;
  };

  // Carrusel automático de formas de pago
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentPaymentSlide((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Pausar autoplay al hacer hover
  const handleCarouselHover = () => setIsAutoPlaying(false);
  const handleCarouselLeave = () => setIsAutoPlaying(true);

  // Navegación manual del carrusel
  const goToSlide = (index) => {
    setCurrentPaymentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 2000);
  };

  // Renderiza texto animado letra por letra usando solo clases de Tailwind
  const renderAnimatedText = (text) => {
    return text.split('').map((character, index) => (
      <span
        key={`char-${index}`}
        className={`inline-block will-change-transform transition-all duration-700 ease-out transform text-orange-900 ${
          animatedElements.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } hover:-translate-y-1`}
        style={{
          transitionDelay: `${index * 40}ms`,
          animation: 'bounce 6s ease-in-out infinite, pulse 4s ease-in-out infinite',
          animationDelay: `${index * 80}ms`
        }}
        aria-hidden="true"
      >
        {character === ' ' ? '\u00A0' : character}
      </span>
    ));
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/img/fondo-principal.jpg)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}>
      {/* Elementos decorativos sutiles */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-10">
        {/* Círculos decorativos sutiles */}
        <div className="absolute w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full blur-3xl" style={{ top: '5%', left: '10%' }}></div>
        <div className="absolute w-24 h-24 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full blur-2xl" style={{ top: '20%', right: '15%' }}></div>
        <div className="absolute w-40 h-40 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full blur-3xl" style={{ bottom: '20%', left: '20%' }}></div>
        <div className="absolute w-28 h-28 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full blur-2xl" style={{ bottom: '10%', right: '25%' }}></div>
        
        {/* Líneas sutiles */}
        <div className="absolute w-px h-32 bg-gradient-to-b from-transparent via-orange-200 to-transparent" style={{ left: '25%', top: '15%' }}></div>
        <div className="absolute w-px h-24 bg-gradient-to-b from-transparent via-orange-100 to-transparent" style={{ right: '30%', top: '25%' }}></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Imagen de fondo como marca de agua - Fondo principal */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/img/watermark.jpg)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.4,
            filter: 'brightness(0.9)',
          }}
        ></div>
        
        {/* Capa oscura sutil para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Fondo con patrón sutil para textura */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_50%),_radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.08),transparent_50%)]" />
        
        {/* Overlay oscuro cuando hay panel abierto */}
        {activePanel && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => {
              setActivePanel(null);
              navigate('/');
            }}
          ></div>
        )}

        {/* Panel deslizante pequeño para Sobre Nosotros */}
        {activePanel === 'sobre-nosotros' && (
          <div className="fixed top-24 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] animate-slide-down">
            <div 
              className="bg-white rounded-lg shadow-2xl border-2 border-orange-200 p-4 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-orange-900">Sobre Nosotros</h2>
                <button 
                  onClick={() => {
                    setActivePanel(null);
                    navigate('/');
                  }}
                  className="text-gray-400 hover:text-orange-600 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <FaRocket className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-orange-900 mb-1 text-sm">Nuestra Historia</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">J&M GUTIERREZ E.I.R.L. nació de la visión de proporcionar suministros industriales y de ferretería de alta calidad. Con más de 10 años de experiencia en el mercado.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <FaEye className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-orange-900 mb-1 text-sm">Nuestra Visión</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">Ser reconocidos como la ferretería líder en Juliaca, Puno, Perú, destacándonos por nuestra calidad, innovación y compromiso.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <FaBullseye className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-orange-900 mb-1 text-sm">Nuestra Misión</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">Proveer soluciones confiables en suministros industriales y ferreteros, ofreciendo productos de alta calidad y asesoramiento experto.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel deslizante pequeño para Contacto */}
        {activePanel === 'contacto' && (
          <div className="fixed top-24 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] animate-slide-down">
            <div 
              className="bg-white rounded-lg shadow-2xl border-2 border-orange-200 p-4 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-orange-900">Contacto</h2>
                <button 
                  onClick={() => {
                    setActivePanel(null);
                    navigate('/');
                  }}
                  className="text-gray-400 hover:text-orange-600 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <a href="tel:+51960604850" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <FaPhone className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">Teléfono</p>
                    <p className="text-xs text-gray-600">+51 960 604 850</p>
                  </div>
                </a>
                <a href="https://wa.me/51960604850" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <FaWhatsapp className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">WhatsApp</p>
                    <p className="text-xs text-gray-600">+51 960 604 850</p>
                  </div>
                </a>
                <a href="mailto:info@ferreteria-jmg.com" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <FaEnvelope className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">Email</p>
                    <p className="text-xs text-gray-600">info@ferreteria-jmg.com</p>
                  </div>
                </a>
                <div className="flex items-start space-x-2 p-2 rounded-lg">
                  <FaMapMarkerAlt className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">Ubicación</p>
                    <p className="text-xs text-gray-600">Juliaca, Puno, Perú</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8 py-24 lg:py-32">
          <div ref={heroRef} className="text-center">
            {/* Badge de confianza */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8 transition-all duration-1000 ease-out transform ${
              animatedElements.hero ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Más de 9 años de experiencia
            </div>
            
            <h1 
              className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 ease-out transform ${
                animatedElements.hero ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
              }`}
              aria-label="FERRETERÍA J&M GUTIÉRREZ"
            >
              <span className="text-white drop-shadow-2xl">
                FERRETERÍA J&M GUTIÉRREZ
              </span>
            </h1>
            
            <p 
              className={`text-xl md:text-2xl mb-4 text-white font-medium transition-all duration-1000 ease-out delay-200 transform ${
                animatedElements.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Juan Nativerio Quispe Gutiérrez
            </p>
            
            <p 
              className={`text-lg md:text-xl mb-12 text-orange-100 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 ease-out delay-400 transform ${
                animatedElements.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Especialistas en herramientas profesionales, maquinaria industrial y ferretería de alta calidad. 
              Desde máquinas y sierras circulares hasta herramientas manuales, todo para hacer realidad tus proyectos.
            </p>
            
            <div 
              className={`flex justify-center transition-all duration-1000 ease-out delay-600 transform ${
                animatedElements.hero ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <Link
                to="/catalogo"
                className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-10 py-5 rounded-xl font-semibold text-xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-3 hover:rotate-1"
                style={{transformStyle: 'preserve-3d', perspective: '1000px'}}
              >
                <span className="flex items-center justify-center transform hover:translateZ(20px) transition-transform duration-300">
                  Explorar Catálogo
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 group-hover:rotate-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Ventajas */}
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
        {/* Elementos decorativos sutiles */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-amber-100 rounded-full blur-2xl opacity-40"></div>
        </div>

        <div className="relative z-20 max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8">
          <div ref={cardsRef} className="text-center mb-20">
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-orange-100 border border-orange-300 text-orange-700 text-sm font-medium mb-6 transition-all duration-1000 ease-out transform ${
              animatedElements.cards ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Calidad Garantizada
            </div>
            
            <h2 
              className={`text-4xl lg:text-6xl font-bold text-orange-900 mb-8 transition-all duration-1000 ease-out transform ${
                animatedElements.cards ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
              }`}
            >
              ¿Por qué elegirnos?
            </h2>
            
            <div className="w-32 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 rounded-full mx-auto mb-8"></div>
            
            <p 
              className={`text-xl lg:text-2xl text-orange-800 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 ease-out delay-200 transform ${
                animatedElements.cards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <strong className="text-orange-900">J&M GUTIÉRREZ</strong> es una ferretería que ha proporcionado suministros industriales y de ferretería de alta calidad durante más de 9 años. 
              Ubicados en Juliaca, Puno, Perú, crecemos constantemente, comprometidos con ofrecer las mejores marcas y asesoramiento experto.
            </p>
          </div>

          {/* Grid de Tarjetas de Ventajas - Responsive como catálogo */}
          <div className="flex flex-wrap justify-center gap-3 px-4">
            {/* Experiencia */}
            <div className={`group bg-white rounded-lg p-4 border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] w-full max-w-[240px] ${animateCard(0)}`}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-transparent animate-pulse"></div>
                <svg className="w-6 h-6 text-white relative z-10 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-orange-900 mb-1.5 group-hover:text-orange-600 transition-colors duration-300 text-center">Más de 9 años</h3>
              <p className="text-xs text-orange-700 leading-relaxed text-center">De experiencia en el mercado, conociendo las necesidades de nuestros clientes</p>
            </div>

            {/* Calidad */}
            <div className={`group bg-white rounded-lg p-4 border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] w-full max-w-[240px] ${animateCard(1)}`}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105 group-hover:-rotate-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/40 to-transparent animate-pulse"></div>
                <svg className="w-6 h-6 text-white relative z-10 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-orange-900 mb-1.5 group-hover:text-amber-600 transition-colors duration-300 text-center">Mejores marcas</h3>
              <p className="text-xs text-orange-700 leading-relaxed text-center">Trabajamos únicamente con marcas reconocidas y de calidad garantizada</p>
            </div>

            {/* Asesoramiento */}
            <div className={`group bg-white rounded-lg p-4 border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] w-full max-w-[240px] ${animateCard(2)}`}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-transparent animate-pulse"></div>
                <svg className="w-6 h-6 text-white relative z-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-orange-900 mb-1.5 group-hover:text-red-600 transition-colors duration-300 text-center">Asesoramiento experto</h3>
              <p className="text-xs text-orange-700 leading-relaxed text-center">Nuestro equipo te guía para elegir la mejor opción para tu proyecto</p>
            </div>

            {/* Variedad */}
            <div className={`group bg-white rounded-lg p-4 border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] w-full max-w-[240px] ${animateCard(3)}`}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200/40 to-transparent animate-pulse"></div>
                <svg className="w-6 h-6 text-white relative z-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-orange-900 mb-1.5 group-hover:text-orange-600 transition-colors duration-300 text-center">Amplia variedad</h3>
              <p className="text-xs text-orange-700 leading-relaxed text-center">Desde herramientas básicas hasta maquinaria industrial especializada</p>
            </div>

            {/* Entrega */}
            <div className={`group bg-white rounded-lg p-4 border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] w-full max-w-[240px] ${animateCard(4)}`}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-300/30 to-transparent animate-pulse"></div>
                <svg className="w-6 h-6 text-white relative z-10 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-orange-900 mb-1.5 group-hover:text-red-600 transition-colors duration-300 text-center">Entrega rápida</h3>
              <p className="text-xs text-orange-700 leading-relaxed text-center">Servicio eficiente y puntual para no retrasar tus proyectos</p>
            </div>

            {/* Atención */}
            <div className={`group bg-white rounded-lg p-4 border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] w-full max-w-[240px] ${animateCard(5)}`}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/40 to-transparent animate-pulse"></div>
                <svg className="w-6 h-6 text-white relative z-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-orange-900 mb-1.5 group-hover:text-amber-600 transition-colors duration-300 text-center">Atención personalizada</h3>
              <p className="text-xs text-orange-700 leading-relaxed text-center">Cada cliente es especial y merece nuestro mejor servicio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección CTA */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600">
        {/* Imagen de fondo principal */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/img/fondo-principal.jpg)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.7,
          }}
        ></div>
        
        {/* Capa de color sutil para mantener el tono naranja */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/50 via-orange-600/40 to-red-600/50"></div>
        
        {/* Elementos decorativos sutiles */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div ref={ctaRef} className="relative z-10 max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8 transition-all duration-1000 ease-out transform ${
            animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            ¡Comienza tu proyecto hoy!
          </div>
          
          <h2 
            className={`text-4xl lg:text-5xl font-bold text-white mb-6 transition-all duration-1000 ease-out transform ${
              animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}
          >
            ¿Buscas las mejores herramientas?
          </h2>
          
          <p 
            className={`text-xl lg:text-2xl text-orange-50 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 ease-out delay-200 transform ${
              animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Explora nuestro catálogo completo y encuentra todo lo que necesitas para hacer realidad tus ideas. 
            Nuestro equipo está listo para asesorarte.
          </p>
          
          <div 
            className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 ease-out delay-400 transform ${
              animatedElements.cta ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <Link
              to="/catalogo"
              className="group bg-white text-orange-600 px-10 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-orange-50"
            >
              <span className="flex items-center justify-center">
                Explorar Catálogo
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </span>
            </Link>
            
            <Link
              to="/contacto"
              className="group border-2 border-white text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 hover:border-white/80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
            >
              <span className="flex items-center justify-center">
                Contáctanos
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Formas de Pedido */}
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
        {/* Elementos decorativos sutiles */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-20 w-48 h-48 bg-orange-200 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-amber-200 rounded-full blur-2xl opacity-50"></div>
        </div>
        
        <div className="relative z-20 max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium mb-8 shadow-lg transition-all duration-1000 ease-out transform ${
            animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Múltiples opciones de pedido
          </div>
          
            <h2 
            className={`text-4xl lg:text-5xl font-bold text-orange-900 mb-8 transition-all duration-1000 ease-out transform ${
              animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}
          >
            Formas de Pedido
          </h2>
          
          <p 
            className={`text-xl text-orange-700 max-w-4xl mx-auto mb-16 leading-relaxed transition-all duration-1000 ease-out delay-200 transform ${
              animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Realiza tus pedidos de la manera que más te convenga. Ofrecemos múltiples canales para tu comodidad.
          </p>
          
          <style>{`
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes scaleInCard {
              0% {
                transform: scale(0.9);
                opacity: 0;
              }
              50% {
                transform: scale(1.02);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            .order-card-1 { animation: slideInUp 0.6s ease-out 0s; }
            .order-card-2 { animation: slideInUp 0.6s ease-out 0.1s; }
            .order-card-3 { animation: slideInUp 0.6s ease-out 0.2s; }
            .order-card-4 { animation: slideInUp 0.6s ease-out 0.3s; }
          `}</style>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
            {/* Efectivo */}
            <div className={`order-card-1 group relative bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-400 transform hover:scale-105 hover:-translate-y-2 border-l-4 border-t-4 border-green-500 overflow-hidden ${
              animatedElements.cta ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Icono grande */}
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-700 mb-1 text-center">Efectivo</h3>
              <p className="text-sm text-green-600 text-center leading-relaxed">Dólares y Soles</p>
            </div>

            {/* Tarjeta */}
            <div className={`order-card-2 group relative bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-400 transform hover:scale-105 hover:-translate-y-2 border-l-4 border-t-4 border-blue-500 overflow-hidden ${
              animatedElements.cta ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Icono grande */}
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-blue-700 mb-1 text-center">Tarjeta</h3>
              <p className="text-sm text-blue-600 text-center leading-relaxed">Visa, Mastercard</p>
            </div>

            {/* Transferencia */}
            <div className={`order-card-3 group relative bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-400 transform hover:scale-105 hover:-translate-y-2 border-l-4 border-t-4 border-purple-500 overflow-hidden ${
              animatedElements.cta ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Icono grande */}
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-700 mb-1 text-center">Transferencia</h3>
              <p className="text-sm text-purple-600 text-center leading-relaxed">BCP, Interbank, Scotiabank</p>
            </div>

            {/* Digital */}
            <div className={`order-card-4 group relative bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-400 transform hover:scale-105 hover:-translate-y-2 border-l-4 border-t-4 border-amber-500 overflow-hidden ${
              animatedElements.cta ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Icono grande */}
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-amber-700 mb-1 text-center">Digital</h3>
              <p className="text-sm text-amber-600 text-center leading-relaxed">Yape, Plin, Izipay y más</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Formas de Pago */}
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
        {/* Elementos decorativos 3D */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200 rounded-full blur-2xl opacity-40 animate-pulse transform hover:scale-110 transition-transform duration-3000 ease-in-out" 
               style={{animation: 'float 8s ease-in-out infinite'}}></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50 animate-pulse transform hover:scale-125 transition-transform duration-4000 ease-in-out" 
               style={{animation: 'float 6s ease-in-out infinite reverse'}}></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-orange-100 rounded-full blur-xl opacity-30 transform -translate-x-1/2 -translate-y-1/2 animate-pulse transform hover:rotate-180 transition-transform duration-5000 ease-in-out" 
               style={{animation: 'float 10s ease-in-out infinite'}}></div>
          
          {/* Líneas 3D flotantes */}
          <div className="absolute top-1/3 left-10 w-1 h-32 bg-gradient-to-b from-transparent via-orange-200 to-transparent opacity-50 transform rotate-12 animate-pulse" 
               style={{animation: 'float 7s ease-in-out infinite'}}></div>
          <div className="absolute bottom-1/3 right-20 w-1 h-24 bg-gradient-to-b from-transparent via-orange-100 to-transparent opacity-40 transform -rotate-12 animate-pulse" 
               style={{animation: 'float 9s ease-in-out infinite reverse'}}></div>
        </div>
        
        <div className="relative z-20 max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium mb-6 shadow-lg transition-all duration-1000 ease-out transform ${
            animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Múltiples métodos de pago
          </div>
          
          <h2 
            className={`text-4xl lg:text-5xl font-bold text-orange-900 mb-4 transition-all duration-1000 ease-out transform ${
              animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}
          >
            Formas de Pago
          </h2>
          
          <p 
            className={`text-lg text-orange-700 max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-1000 ease-out delay-200 transform ${
              animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Aceptamos múltiples métodos de pago para tu comodidad y seguridad en todas las transacciones.
          </p>
          
          {/* Grid de Formas de Pago - Bonito y Responsive */}
          <div 
            className={`flex flex-wrap justify-center gap-8 transition-all duration-1000 ease-out delay-300 transform ${
              animatedElements.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
              <style>{`
                @keyframes cardBorderGlowCash {
                  0%, 100% { 
                    box-shadow: 0 0 12px rgba(34, 197, 94, 0.4), 
                                0 0 20px rgba(34, 197, 94, 0.2);
                  }
                  50% { 
                    box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 
                                0 0 30px rgba(34, 197, 94, 0.4);
                  }
                }
                @keyframes cardBorderGlowCard {
                  0%, 100% { 
                    box-shadow: 0 0 12px rgba(59, 130, 246, 0.4), 
                                0 0 20px rgba(59, 130, 246, 0.2);
                  }
                  50% { 
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 
                                0 0 30px rgba(59, 130, 246, 0.4);
                  }
                }
                @keyframes cardBorderGlowBank {
                  0%, 100% { 
                    box-shadow: 0 0 12px rgba(168, 85, 247, 0.4), 
                                0 0 20px rgba(168, 85, 247, 0.2);
                  }
                  50% { 
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 
                                0 0 30px rgba(168, 85, 247, 0.4);
                  }
                }
                @keyframes cardBorderGlowDigital {
                  0%, 100% { 
                    box-shadow: 0 0 12px rgba(251, 191, 36, 0.4), 
                                0 0 20px rgba(251, 191, 36, 0.2);
                  }
                  50% { 
                    box-shadow: 0 0 20px rgba(251, 191, 36, 0.6), 
                                0 0 30px rgba(251, 191, 36, 0.4);
                  }
                }
                .payment-form-cash { border: 3px solid #22c55e; animation: cardBorderGlowCash 2s ease-in-out infinite; }
                .payment-form-card { border: 3px solid #3b82f6; animation: cardBorderGlowCard 2.2s ease-in-out infinite; }
                .payment-form-bank { border: 3px solid #a855f7; animation: cardBorderGlowBank 2.4s ease-in-out infinite; }
                .payment-form-digital { border: 3px solid #fbbf24; animation: cardBorderGlowDigital 2.6s ease-in-out infinite; }
              `}</style>

              {/* Efectivo */}
              <div className={`payment-form-cash group bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs`}>
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 mx-auto mb-4 flex items-center justify-center gap-3">
                    {/* Dólar */}
                    <div className="w-13 h-13 bg-gradient-to-br from-green-50 to-emerald-100 rounded flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-green-400">
                      <img 
                        src="/img/logos/dolar.png" 
                        alt="Dólar" 
                        className="w-11 h-11 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <svg className="w-5 h-5 text-green-600 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    {/* Soles */}
                    <div className="w-13 h-13 bg-gradient-to-br from-green-50 to-emerald-100 rounded flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-green-400">
                      <img 
                        src="/img/logos/efectivo.png" 
                        alt="Soles" 
                        className="w-11 h-11 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <svg className="w-5 h-5 text-green-600 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-1">Efectivo</h3>
                  <p className="text-sm text-gray-600 mb-3">Dólares y Soles</p>
                </div>
              </div>

              {/* Tarjetas de Crédito/Débito */}
              <div className={`payment-form-card group bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs`}>
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 mx-auto mb-4 flex items-center justify-center gap-3">
                    {/* Visa */}
                    <div className="w-13 h-13 bg-white rounded flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-blue-400">
                      <img 
                        src="/img/logos/visa.jpg" 
                        alt="Visa" 
                        className="w-11 h-11 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <FaCreditCard className="w-5 h-5 text-blue-600 hidden" />
                    </div>
                    {/* Mastercard */}
                    <div className="w-13 h-13 bg-white rounded flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-blue-400">
                      <img 
                        src="/img/logos/MasterCard.png" 
                        alt="Mastercard" 
                        className="w-11 h-11 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <FaCreditCard className="w-5 h-5 text-blue-600 hidden" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-blue-600 mb-1">Tarjeta</h3>
                  <p className="text-sm text-gray-600 mb-3">Visa, Mastercard</p>
                </div>
              </div>

              {/* Transferencia Bancaria */}
              <div className={`payment-form-bank group bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs`}>
                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 mx-auto mb-4 flex items-center justify-center gap-4">
                    {/* BCP */}
                    <div className="w-18 h-18 bg-white rounded flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-purple-400">
                      <img 
                        src="/img/logos/bcp.png" 
                        alt="BCP" 
                        className="w-14 h-14 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <FaExchangeAlt className="w-4 h-4 text-purple-600 hidden" />
                    </div>
                    {/* Interbank */}
                    <div className="w-18 h-18 bg-white rounded flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-purple-400">
                      <img 
                        src="/img/logos/interbank.png" 
                        alt="Interbank" 
                        className="w-14 h-14 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <FaExchangeAlt className="w-4 h-4 text-purple-600 hidden" />
                    </div>
                    {/* Scotiabank */}
                    <div className="w-18 h-18 bg-white rounded flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-purple-400">
                      <img 
                        src="/img/logos/scotiabank.png" 
                        alt="Scotiabank" 
                        className="w-14 h-14 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <FaExchangeAlt className="w-4 h-4 text-purple-600 hidden" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-purple-600 mb-1">Transferencia</h3>
                  <p className="text-sm text-gray-600 mb-3">BCP, Interbank, Scotiabank</p>
                </div>
              </div>

              {/* Pagos Digitales */}
              <div className={`payment-form-digital group bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs`}>
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 mx-auto mb-4 flex items-center justify-center gap-3">
                    {/* Yape */}
                    <div className="w-13 h-13 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-amber-400">
                      <img 
                        src="/img/logos/yape.png" 
                        alt="Yape" 
                        className="w-11 h-11 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <FaMobileAlt className="w-5 h-5 text-amber-600 hidden" />
                    </div>
                    {/* Plin */}
                    <div className="w-13 h-13 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2 border-amber-400">
                      <img 
                        src="/img/logos/plin.png" 
                        alt="Plin" 
                        className="w-11 h-11 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <FaMobileAlt className="w-5 h-5 text-amber-600 hidden" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-amber-600 mb-1">Digital</h3>
                  <p className="text-sm text-gray-600 mb-3">Yape, Plin, Izipay y más</p>
                </div>
              </div>
            </div>

          {/* Información adicional - Estilo claro */}
          <div className={`mt-12 relative overflow-hidden bg-white rounded-3xl p-8 lg:p-12 border border-gray-200 transition-all duration-1000 ease-out delay-400 transform shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_35px_70px_-12px_rgba(0,0,0,0.12)] ${
            animatedElements.cta ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}>
            
            {/* Background Elements 3D */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-4 w-32 h-32 bg-gray-100 rounded-full blur-2xl animate-pulse transform rotate-12"></div>
              <div className="absolute top-20 right-8 w-24 h-24 bg-gray-100 rounded-full blur-xl animate-pulse transform -rotate-6" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-8 left-1/4 w-40 h-40 bg-gray-100 rounded-full blur-3xl animate-pulse transform rotate-45" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-gray-100 rounded-full blur-lg animate-bounce transform rotate-90" style={{animationDelay: '0.5s'}}></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                {/* Badge decorativo */}
                <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-orange-100 border-2 border-orange-300 text-orange-700 text-sm font-semibold mb-6 shadow-md">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Información de Pago
                </div>
                
                <h3 className="text-4xl lg:text-5xl font-extrabold mb-4">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 bg-clip-text text-transparent">
                    Información de Pago
                  </span>
                </h3>
                
                {/* Línea decorativa */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-1 w-16 bg-gradient-to-r from-transparent to-orange-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
                  <div className="h-1 w-16 bg-gradient-to-l from-transparent to-orange-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                {/* Ventajas - Mejorado */}
                <div className="group bg-white/85 backdrop-blur-md rounded-3xl p-8 border-2 border-green-200/60 hover:border-green-400 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 w-full max-w-md relative overflow-hidden" style={{transformStyle: 'preserve-3d', perspective: '1000px'}}>
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Barra superior decorativa */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-green-600 to-green-500 rounded-t-3xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-8">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-green-400/40 to-green-600/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-green-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6" style={{transformStyle: 'preserve-3d'}}>
                          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24" style={{transform: 'translateZ(20px)'}}>
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                      <h4 className="text-3xl font-extrabold ml-6 bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent" style={{transform: 'translateZ(10px)'}}>Ventajas</h4>
                    </div>
                    <ul className="space-y-5">
                      <li className="flex items-center text-gray-800 transition-all duration-300 transform hover:translate-x-3 group-hover:translate-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-4 animate-pulse shadow-lg flex-shrink-0"></div>
                        <span className="text-lg font-bold">Múltiples opciones de pago</span>
                    </li>
                      <li className="flex items-center text-gray-800 transition-all duration-300 transform hover:translate-x-3 group-hover:translate-x-2" style={{animationDelay: '0.1s'}}>
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-4 animate-pulse shadow-lg flex-shrink-0" style={{animationDelay: '0.2s'}}></div>
                        <span className="text-lg font-bold">Facturación electrónica</span>
                    </li>
                      <li className="flex items-center text-gray-800 transition-all duration-300 transform hover:translate-x-3 group-hover:translate-x-2" style={{animationDelay: '0.2s'}}>
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-4 animate-pulse shadow-lg flex-shrink-0" style={{animationDelay: '0.4s'}}></div>
                        <span className="text-lg font-bold">Garantía en todos los productos</span>
                    </li>
                      <li className="flex items-center text-gray-800 transition-all duration-300 transform hover:translate-x-3 group-hover:translate-x-2" style={{animationDelay: '0.3s'}}>
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-4 animate-pulse shadow-lg flex-shrink-0" style={{animationDelay: '0.6s'}}></div>
                        <span className="text-lg font-bold">Descuentos por volumen</span>
                    </li>
                  </ul>
                  </div>
                </div>

                {/* Contacto - Mejorado */}
                <div className="group bg-white/85 backdrop-blur-md rounded-3xl p-8 border-2 border-orange-200/60 hover:border-orange-400 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 w-full max-w-md relative overflow-hidden" style={{transformStyle: 'preserve-3d', perspective: '1000px'}}>
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-50/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Barra superior decorativa */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 rounded-t-3xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-8">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-orange-300/40 to-orange-500/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-orange-400/50 transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-6" style={{transformStyle: 'preserve-3d'}}>
                          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24" style={{transform: 'translateZ(20px)'}}>
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </div>
                  </div>
                      <h4 className="text-3xl font-extrabold ml-6 bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent" style={{transform: 'translateZ(10px)'}}>Contacto</h4>
                    </div>
                    <ul className="space-y-5">
                      <li className="flex items-center text-gray-800 transition-all duration-300 transform hover:translate-x-3 group-hover:translate-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mr-4 animate-pulse shadow-lg flex-shrink-0"></div>
                        <span className="text-lg font-bold">Consultas sobre precios</span>
                    </li>
                      <li className="flex items-center text-gray-800 transition-all duration-300 transform hover:translate-x-3 group-hover:translate-x-2" style={{animationDelay: '0.1s'}}>
                        <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mr-4 animate-pulse shadow-lg flex-shrink-0" style={{animationDelay: '0.2s'}}></div>
                        <span className="text-lg font-bold">Cotizaciones personalizadas</span>
                    </li>
                      <li className="flex items-center text-gray-800 transition-all duration-300 transform hover:translate-x-3 group-hover:translate-x-2" style={{animationDelay: '0.2s'}}>
                        <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mr-4 animate-pulse shadow-lg flex-shrink-0" style={{animationDelay: '0.4s'}}></div>
                        <span className="text-lg font-bold">Soporte técnico</span>
                    </li>
                      <li className="flex items-center text-gray-800 transition-all duration-300 transform hover:translate-x-3 group-hover:translate-x-2" style={{animationDelay: '0.3s'}}>
                        <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mr-4 animate-pulse shadow-lg flex-shrink-0" style={{animationDelay: '0.6s'}}></div>
                        <span className="text-lg font-bold">Entrega a domicilio</span>
                    </li>
                  </ul>
                  </div>
                </div>
              </div>

              {/* Call to Action - Mejorado */}
              <div className="mt-16 text-center">
                <div className="group relative inline-flex items-center bg-white border-2 border-orange-400 rounded-full px-10 py-5 hover:bg-orange-50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-500 transform hover:scale-110 cursor-pointer overflow-hidden">
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-50/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                    <span className="text-orange-700 font-extrabold text-xl group-hover:text-orange-800 transition-colors duration-300">
                    ¡Confía en nosotros para tu próximo proyecto!
                  </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Final - Redes Sociales y Métodos de Pago */}
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
        
        {/* Elementos decorativos sutiles */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-100/40 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título de la sección */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium mb-6 shadow-lg">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Conecta con nosotros
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-orange-900 mb-6">
              Redes Sociales y Métodos de Pago
            </h2>
            
            <p className="text-xl text-orange-700 max-w-3xl mx-auto leading-relaxed">
              Síguenos en nuestras redes sociales y conoce todas las formas de pago que aceptamos para tu comodidad.
            </p>
          </div>

          {/* Grid de contenido - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* Redes Sociales */}
            <div className="bg-white/75 backdrop-blur-sm rounded-lg p-8 border border-orange-200/80 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-center min-h-full">
              <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                
                <h3 className="text-lg font-bold text-orange-900 mb-2">¡Síguenos en:</h3>
                <p className="text-sm text-orange-700 mb-6">Mantente conectado con las últimas novedades</p>
                
                <div className="flex justify-center gap-4 flex-wrap">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-all duration-300 cursor-pointer group border-2 border-orange-400 hover:scale-110 hover:shadow-lg">
                    <svg className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-all duration-300 cursor-pointer group border-2 border-orange-400 hover:scale-110 hover:shadow-lg">
                    <svg className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-all duration-300 cursor-pointer group border-2 border-orange-400 hover:scale-110 hover:shadow-lg">
                    <svg className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </div>
                  
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-all duration-300 cursor-pointer group border-2 border-orange-400 hover:scale-110 hover:shadow-lg">
                    <svg className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de Pago y Pago Online - Lado Derecho */}
            <div className="flex flex-col gap-6">
              {/* Pago Online */}
              <div className="bg-white/75 backdrop-blur-sm rounded-lg p-6 border border-orange-200/80 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-sm font-bold text-orange-900 mb-3">Pago Online</h3>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Próximamente</span>
                  </div>
                </div>
              </div>

              {/* Métodos de Pago */}
              <div className="bg-white/75 backdrop-blur-sm rounded-lg p-6 border border-orange-200/80 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                
                <h3 className="text-sm font-bold text-orange-900 mb-4">Métodos de Pago</h3>
                
                <style>{`
                  @keyframes borderGlow {
                    0%, 100% { 
                      box-shadow: 0 0 8px var(--glow-color, rgba(34, 197, 94, 0.4)), 
                                  0 0 16px var(--glow-color, rgba(34, 197, 94, 0.2));
                    }
                    50% { 
                      box-shadow: 0 0 16px var(--glow-color, rgba(34, 197, 94, 0.6)), 
                                  0 0 24px var(--glow-color, rgba(34, 197, 94, 0.4));
                    }
                  }
                  
                  @keyframes imageZoom {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                  }
                  
                  .payment-card-dolar { border: 3px solid #22c55e; --glow-color: rgba(34, 197, 94, 0.5); animation: borderGlow 2s ease-in-out infinite; }
                  .payment-card-soles { border: 3px solid #16a34a; --glow-color: rgba(22, 163, 74, 0.5); animation: borderGlow 2.1s ease-in-out infinite; }
                  .payment-card-visa { border: 3px solid #1e40af; --glow-color: rgba(30, 64, 175, 0.5); animation: borderGlow 2.2s ease-in-out infinite; }
                  .payment-card-mastercard { border: 3px solid #dc2626; --glow-color: rgba(220, 38, 38, 0.5); animation: borderGlow 2.3s ease-in-out infinite; }
                  .payment-card-bcp { border: 3px solid #0f172a; --glow-color: rgba(15, 23, 42, 0.5); animation: borderGlow 2.4s ease-in-out infinite; }
                  .payment-card-interbank { border: 3px solid #ea580c; --glow-color: rgba(234, 88, 12, 0.5); animation: borderGlow 2.5s ease-in-out infinite; }
                  .payment-card-scotiabank { border: 3px solid #7e22ce; --glow-color: rgba(126, 34, 206, 0.5); animation: borderGlow 2.6s ease-in-out infinite; }
                  .payment-card-yape { border: 3px solid #22c55e; --glow-color: rgba(34, 197, 94, 0.5); animation: borderGlow 2.7s ease-in-out infinite; }
                  .payment-card-plin { border: 3px solid #06b6d4; --glow-color: rgba(6, 182, 212, 0.5); animation: borderGlow 2.8s ease-in-out infinite; }
                  
                  .payment-img { transition: transform 0.3s ease-in-out; }
                  .payment-card:hover .payment-img { transform: scale(1.25); }
                `}</style>
                
                <div className="flex flex-wrap justify-center gap-4">
                  {/* Dólar - Verde */}
                  <div className="payment-card payment-card-dolar w-24 h-20 bg-gradient-to-br from-green-50 to-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/dolar.png" alt="Dólar" className="payment-img w-18 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-16 text-green-600 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  {/* Soles - Verde oscuro */}
                  <div className="payment-card payment-card-soles w-24 h-20 bg-gradient-to-br from-green-50 to-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/efectivo.png" alt="Soles" className="payment-img w-18 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-16 text-green-700 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>

                  {/* Visa - Azul */}
                  <div className="payment-card payment-card-visa w-24 h-20 bg-gradient-to-br from-blue-50 to-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/visa.jpg" alt="Visa" className="payment-img w-18 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-16 text-blue-900 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  {/* Mastercard - Rojo */}
                  <div className="payment-card payment-card-mastercard w-24 h-20 bg-gradient-to-br from-red-50 to-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/MasterCard.png" alt="Mastercard" className="payment-img w-18 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-16 text-red-600 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>

                  {/* BCP - Azul marino */}
                  <div className="payment-card payment-card-bcp w-24 h-20 bg-gradient-to-br from-slate-50 to-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/bcp.png" alt="BCP" className="payment-img w-18 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-16 text-slate-900 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  {/* Interbank - Naranja */}
                  <div className="payment-card payment-card-interbank w-24 h-20 bg-gradient-to-br from-orange-50 to-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/interbank.png" alt="Interbank" className="payment-img w-18 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-16 text-orange-600 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  {/* Scotiabank - Púrpura */}
                  <div className="payment-card payment-card-scotiabank w-24 h-20 bg-gradient-to-br from-purple-50 to-white rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/scotiabank.png" alt="Scotiabank" className="payment-img w-18 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-16 text-purple-700 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 10h18M7 15h1m2 0h1m-1 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>

                  {/* Yape - Verde */}
                  <div className="payment-card payment-card-yape w-24 h-24 bg-gradient-to-br from-green-50 to-white rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/yape.png" alt="Yape" className="payment-img w-14 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-20 text-green-600 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  {/* Plin - Azul celeste */}
                  <div className="payment-card payment-card-plin w-24 h-24 bg-gradient-to-br from-cyan-50 to-white rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                    <img src="/img/logos/plin.png" alt="Plin" className="payment-img w-14 h-14 object-contain" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                    <svg className="payment-img w-20 h-20 text-cyan-500 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Call to Action final */}
          <div className="text-center">
            <div className="group inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-110 cursor-pointer">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg group-hover:text-orange-50 transition-colors duration-300">
                ¡Confía en nosotros para tu próximo proyecto!
              </span>
            </div>
          </div>
        </div>
      </section>
      
      {/* ChatBot */}
      <ChatBot />
    </div>
  );
};

export default Home;

// Estilos CSS personalizados para animaciones 3D
const styles = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg) scale(1);
    }
    25% {
      transform: translateY(-20px) rotate(90deg) scale(1.1);
    }
    50% {
      transform: translateY(-40px) rotate(180deg) scale(0.9);
    }
    75% {
      transform: translateY(-20px) rotate(270deg) scale(1.05);
    }
  }
  
  @keyframes float-reverse {
    0%, 100% {
      transform: translateY(0px) rotate(0deg) scale(1);
    }
    25% {
      transform: translateY(20px) rotate(-90deg) scale(0.9);
    }
    50% {
      transform: translateY(40px) rotate(-180deg) scale(1.1);
    }
    75% {
      transform: translateY(20px) rotate(-270deg) scale(0.95);
    }
  }
`;

// Inyectar estilos en el head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 