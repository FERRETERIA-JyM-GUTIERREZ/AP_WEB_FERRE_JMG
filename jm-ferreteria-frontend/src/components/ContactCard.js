import React, { useState, useEffect, useRef } from 'react';

const ContactCard = ({ 
  icon, 
  title, 
  detail, 
  color = 'orange',
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rainbowIndex, setRainbowIndex] = useState(0);
  const cardRef = useRef(null);
  const animationRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Animación suave de regreso al centro
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const startX = mousePosition.x;
      const startY = mousePosition.y;
      
      const animate = (progress) => {
        const currentX = startX + (centerX - startX) * progress;
        const currentY = startY + (centerY - startY) * progress;
        setMousePosition({ x: currentX, y: currentY });
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(() => animate(progress + 0.05));
        }
      };
      
      animate(0);
    }
  };

  // Animación de colores arcoíris
  useEffect(() => {
    const rainbowColors = [
      '#FF0000', // Rojo
      '#FF7F00', // Naranja
      '#FFFF00', // Amarillo
      '#00FF00', // Verde
      '#0000FF', // Azul
      '#4B0082', // Índigo
      '#9400D3'  // Violeta
    ];

    const interval = setInterval(() => {
      setRainbowIndex((prev) => (prev + 1) % rainbowColors.length);
    }, 1000); // Cambia cada segundo

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'from-red-500 to-red-600';
      case 'orange':
        return 'from-orange-500 to-orange-600';
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'pink':
        return 'from-pink-500 to-pink-600';
      case 'green':
        return 'from-green-500 to-green-600';
      default:
        return 'from-orange-500 to-orange-600';
    }
  };

  const getGlowColor = () => {
    switch (color) {
      case 'red':
        return 'shadow-red-500/50';
      case 'orange':
        return 'shadow-orange-500/50';
      case 'blue':
        return 'shadow-blue-500/50';
      case 'pink':
        return 'shadow-pink-500/50';
      case 'green':
        return 'shadow-green-500/50';
      default:
        return 'shadow-orange-500/50';
    }
  };

  const rotateX = isHovered ? ((mousePosition.y - 50) / 50) * 15 : 0;
  const rotateY = isHovered ? ((mousePosition.x - 50) / 50) * 15 : 0;

  const rainbowColors = [
    '#FF0000', // Rojo
    '#FF7F00', // Naranja
    '#FFFF00', // Amarillo
    '#00FF00', // Verde
    '#0000FF', // Azul
    '#4B0082', // Índigo
    '#9400D3'  // Violeta
  ];

  return (
    <div
      ref={cardRef}
      className={`relative w-full h-48 bg-gradient-to-br ${getColorClasses()} rounded-3xl p-6 cursor-pointer transition-all duration-500 transform-gpu ${
        isHovered ? 'scale-110' : 'scale-100'
      } ${getGlowColor()} shadow-2xl hover:shadow-3xl shine-effect tilt-effect`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        background: isHovered 
          ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.15) 0%, transparent 50%), linear-gradient(135deg, var(--tw-gradient-stops))`
          : undefined
      }}
    >
      {/* Efecto de brillo holográfico */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.3) 0%, transparent 50%)`,
          opacity: isHovered ? 1 : 0
        }}
      />
      
      {/* Efecto de partículas holográficas */}
      <div className="absolute inset-0 rounded-3xl particles-bg opacity-0 transition-opacity duration-700"
           style={{ opacity: isHovered ? 0.4 : 0 }} />
      
      {/* Borde holográfico */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent transition-all duration-500"
           style={{
             background: isHovered 
               ? `linear-gradient(45deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(255,255,255,0.4))`
               : 'transparent',
             borderColor: isHovered ? 'rgba(255,255,255,0.5)' : 'transparent'
           }} />
      
      {/* Contenido */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
        {/* Icono con efecto 3D */}
        <div className={`w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 backdrop-blur-sm ${
          isHovered ? 'scale-125 animate-pulse-slow shadow-2xl' : 'scale-100'
        }`}>
          <div className={`text-2xl transition-all duration-500 ${isHovered ? 'animate-bounce' : ''}`}>
            {icon}
          </div>
        </div>
        
        {/* Título con efecto 3D arcoíris */}
        <h3 className={`text-lg font-bold mb-2 text-center transition-all duration-500 ${
          isHovered ? 'scale-110' : ''
        }`}
        style={{
          textShadow: isHovered ? `0 0 10px ${rainbowColors[rainbowIndex]}, 0 0 20px ${rainbowColors[rainbowIndex]}, 0 0 30px ${rainbowColors[rainbowIndex]}` : 'none',
          color: isHovered ? rainbowColors[rainbowIndex] : 'white',
          transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)',
          transition: 'all 0.3s ease'
        }}>
          {title}
        </h3>
        
        {/* Detalle */}
        <p className="text-sm text-center opacity-90 transition-all duration-300 hover:opacity-100 leading-relaxed">
          {detail}
        </p>
      </div>

      {/* Efecto de ondas holográficas */}
      <div className={`absolute inset-0 rounded-3xl overflow-hidden ${isHovered ? 'animate-float' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-transform duration-1000"
             style={{ 
               transform: isHovered ? 'translateX(100%) skewX(-12deg)' : 'translateX(-100%) skewX(-12deg)',
               transition: 'transform 1s ease-in-out'
             }} />
      </div>

      {/* Efecto de profundidad holográfica */}
      <div className="absolute inset-0 rounded-3xl bg-black/20 opacity-0 transition-opacity duration-500"
           style={{ opacity: isHovered ? 1 : 0 }} />

      {/* Efecto de esquinas brillantes */}
      <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500"
           style={{ 
             opacity: isHovered ? 1 : 0,
             background: `
               linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%),
               linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)
             `
           }} />
    </div>
  );
};

export default ContactCard; 