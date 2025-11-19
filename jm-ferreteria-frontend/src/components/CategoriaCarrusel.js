import React, { useState, useRef, useEffect } from 'react';
import ProductoCard from './ProductoCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const CategoriaCarrusel = ({ 
  categoria, 
  productos, 
  onWhatsApp, 
  onFormulario, 
  onVerDetalles 
}) => {
  const { isDarkMode } = useTheme();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [maxScrollWidth, setMaxScrollWidth] = useState(0);
  const carouselRef = useRef(null);

  // Detectar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Recalcular posición de scroll cuando cambia el tamaño
      if (carouselRef.current) {
        setScrollPosition(carouselRef.current.scrollLeft || 0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recalcular si hay más contenido cuando cambia el ancho de ventana
  useEffect(() => {
    if (carouselRef.current) {
      // Forzar actualización del estado después de que el DOM se actualice
      setTimeout(() => {
        const container = carouselRef.current;
        if (container) {
          setScrollPosition(container.scrollLeft);
        }
      }, 100);
    }
  }, [windowWidth]);

  // Usar ResizeObserver para detectar cambios en el tamaño del contenedor
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Recalcular cuando el contenedor cambia de tamaño
      setScrollPosition(container.scrollLeft);
      setMaxScrollWidth(container.scrollWidth - container.clientWidth);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Calcular ancho de scroll dinámico según tamaño de pantalla
  const getScrollAmount = () => {
    if (windowWidth < 640) return 300; // Móvil pequeño
    if (windowWidth < 768) return 360; // Móvil grande
    if (windowWidth < 1024) return 450; // Tablet
    return 480; // Desktop
  };

  const scroll = (direction) => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollAmount = getScrollAmount();
    let newPosition = scrollPosition;

    if (direction === 'left') {
      newPosition = Math.max(0, scrollPosition - scrollAmount);
    } else {
      const maxScroll = container.scrollWidth - container.clientWidth;
      newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
    }

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    setScrollPosition(carouselRef.current?.scrollLeft || 0);
  };

  const maxScroll = maxScrollWidth > 0 ? maxScrollWidth : (carouselRef.current 
    ? Math.max(0, carouselRef.current.scrollWidth - carouselRef.current.clientWidth)
    : 0);

  // Mostrar flechas si hay contenido para desplazar
  const hasScroll = maxScroll > 5; // Buffer pequeño para evitar parpadeos
  const showLeftArrow = hasScroll && scrollPosition > 5;
  const showRightArrow = hasScroll && scrollPosition < maxScroll - 5;

  return (
    <div className={`mb-4 sm:mb-6 lg:mb-8 px-0 transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Encabezado de la categoría - Responsivo y Bonito */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          {/* Barra lateral decorativa */}
          <div className="flex items-center gap-3 sm:gap-4 flex-grow">
            {/* Línea decorativa izquierda */}
            <div className="w-1 sm:w-1.5 h-7 sm:h-9 bg-gradient-to-b from-orange-600 via-orange-500 to-orange-400 rounded-full shadow-lg shadow-orange-500/50"></div>
            
            {/* Título con estilos premium */}
            <h2 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold truncate"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ff8c00 50%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: isDarkMode ? '0 0 18px rgba(249, 115, 22, 0.45)' : '0 2px 4px rgba(249, 115, 22, 0.15)',
                letterSpacing: '-0.01em',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {categoria.toUpperCase()}
            </h2>
            
            {/* Badge de cantidad */}
            <span className="ml-auto flex-shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-orange-500/40 whitespace-nowrap">
              {productos.length} {productos.length !== 1 ? 'Productos' : 'Producto'}
            </span>
          </div>
        </div>
        
        {/* Línea decorativa inferior animada */}
        <div className="flex gap-2">
          <div className={`h-1.5 sm:h-2 w-24 sm:w-32 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 rounded-full shadow-lg ${isDarkMode ? 'shadow-orange-400/50' : 'shadow-orange-500/50'}`}></div>
          <div className={`h-1.5 sm:h-2 w-12 sm:w-16 bg-gradient-to-r from-orange-400 to-orange-300 rounded-full shadow-lg ${isDarkMode ? 'shadow-orange-300/40 opacity-80' : 'shadow-orange-400/30 opacity-60'}`}></div>
          <div className={`h-1.5 sm:h-2 w-6 sm:w-8 bg-gradient-to-r from-orange-300 to-orange-200 rounded-full shadow-lg ${isDarkMode ? 'shadow-orange-200/30 opacity-70' : 'shadow-orange-300/20 opacity-40'}`}></div>
        </div>
      </div>

      {/* Contenedor del carrusel con controles */}
      <div className="relative group">
        {/* Carrusel - Responsivo */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scroll-smooth pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4"
        >
          {productos.map(producto => (
            <div
              key={producto.id}
              className={`flex-shrink-0 ${
                windowWidth < 640 
                  ? 'w-80' 
                  : windowWidth < 768 
                  ? 'w-96' 
                  : windowWidth < 1024 
                  ? 'w-full' 
                  : 'w-full'
              }`}
              style={{
                maxWidth: windowWidth < 640 ? '320px' : windowWidth < 768 ? '384px' : 'calc(25% - 16px)'
              }}
            >
              <ProductoCard
                producto={producto}
                onWhatsApp={onWhatsApp}
                onFormulario={onFormulario}
                onVerDetalles={onVerDetalles}
              />
            </div>
          ))}
        </div>

        {/* Flechas de navegación - Izquierda - Bonitas y Responsivas */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 hover:scale-125 active:scale-110 flex items-center justify-center group"
            style={{
              marginLeft: windowWidth < 640 ? '2px' : '0px'
            }}
            title="Desplazar izquierda"
            aria-label="Desplazar productos hacia la izquierda"
          >
            {/* Fondo del círculo */}
            <div className={`absolute rounded-full bg-gradient-to-r from-orange-500 to-orange-400 
              shadow-lg ${isDarkMode ? 'shadow-orange-500/30' : 'shadow-orange-500/50'} group-hover:shadow-orange-600/80 transition-all duration-300
              ${windowWidth < 640 ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-12 h-12 lg:w-14 lg:h-14'}`}
            />
            
            {/* Icono */}
            <FaChevronLeft className={`relative z-10 text-white font-bold transition-all duration-300
              group-hover:scale-110 group-hover:text-yellow-50
              ${windowWidth < 640 ? 'text-sm sm:text-lg' : 'text-lg lg:text-xl'}`} 
            />
            
            {/* Brillo adicional hover */}
            <div className={`absolute rounded-full ${isDarkMode ? 'bg-white/60' : 'bg-white'} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm
              ${windowWidth < 640 ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-12 h-12 lg:w-14 lg:h-14'}`}
            />
          </button>
        )}

        {/* Flechas de navegación - Derecha - Bonitas y Responsivas */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 hover:scale-125 active:scale-110 flex items-center justify-center group"
            style={{
              marginRight: windowWidth < 640 ? '2px' : '0px'
            }}
            title="Desplazar derecha"
            aria-label="Desplazar productos hacia la derecha"
          >
            {/* Fondo del círculo */}
            <div className={`absolute rounded-full bg-gradient-to-r from-orange-400 to-orange-500 
              shadow-lg ${isDarkMode ? 'shadow-orange-500/30' : 'shadow-orange-500/50'} group-hover:shadow-orange-600/80 transition-all duration-300
              ${windowWidth < 640 ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-12 h-12 lg:w-14 lg:h-14'}`}
            />
            
            {/* Icono */}
            <FaChevronRight className={`relative z-10 text-white font-bold transition-all duration-300
              group-hover:scale-110 group-hover:text-yellow-50
              ${windowWidth < 640 ? 'text-sm sm:text-lg' : 'text-lg lg:text-xl'}`}
            />
            
            {/* Brillo adicional hover */}
            <div className={`absolute rounded-full ${isDarkMode ? 'bg-white/60' : 'bg-white'} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm
              ${windowWidth < 640 ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-12 h-12 lg:w-14 lg:h-14'}`}
            />
          </button>
        )}

        {/* Indicador de scroll - Responsivo */}
        <div className={`h-0.5 mt-3 sm:mt-4 rounded-full overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/70' : 'bg-gray-200'}`}>
          <div
            className={`h-full transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400' : 'bg-gradient-to-r from-orange-500 to-orange-400'}`}
            style={{
              width: `${maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoriaCarrusel;

