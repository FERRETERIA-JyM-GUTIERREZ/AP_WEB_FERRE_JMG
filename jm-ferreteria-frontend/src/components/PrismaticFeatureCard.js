import React, { useState, useRef } from 'react';

const PrismaticFeatureCard = ({ 
  icon, 
  title, 
  description
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

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
  };

  const rotateX = isHovered ? ((mousePosition.y - 50) / 50) * 5 : 0;
  const rotateY = isHovered ? ((mousePosition.x - 50) / 50) * 5 : 0;

  return (
    <div
      ref={cardRef}
      className="relative w-full h-48 bg-gradient-to-b from-orange-500 to-orange-600 rounded-xl p-4 cursor-pointer transition-all duration-300 transform-gpu shadow-md hover:shadow-lg"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.02 : 1})`,
        background: isHovered 
          ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%), linear-gradient(to bottom, #f97316, #ea580c)`
          : 'linear-gradient(to bottom, #f97316, #ea580c)'
      }}
    >
      {/* Efecto de brillo simple */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          opacity: isHovered ? 1 : 0
        }}
      />
      
      {/* Borde simple */}
      <div 
        className="absolute inset-0 rounded-xl border border-transparent transition-all duration-300"
        style={{
          borderColor: isHovered ? 'rgba(255,255,255,0.3)' : 'transparent',
        }}
      />
      
      {/* Efecto de ondas simple */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 transition-transform duration-800"
             style={{ 
               transform: isHovered ? 'translateX(100%) skewX(-12deg)' : 'translateX(-100%) skewX(-12deg)',
               transition: 'transform 0.8s ease-in-out'
             }} />
      </div>

      {/* Contenido */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center">
        {/* Icono */}
        <div className={`w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
          isHovered ? 'scale-110 shadow-md' : 'scale-100'
        }`}
        style={{
          boxShadow: isHovered ? '0 0 15px rgba(255, 165, 0, 0.4)' : 'none'
        }}>
          <div className={`text-xl transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}>
            {icon}
          </div>
        </div>
        
        {/* Título */}
        <h3 className={`text-base font-bold mb-2 transition-all duration-300 ${
          isHovered ? 'scale-105' : ''
        }`}
        style={{
          color: isHovered ? 'rgba(255,255,255,1)' : 'white',
          transform: isHovered ? 'translateZ(10px)' : 'translateZ(0px)',
          transition: 'all 0.3s ease'
        }}>
          {title}
        </h3>
        
        {/* Descripción */}
        <p className="text-xs opacity-90 transition-all duration-300 leading-relaxed px-2">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PrismaticFeatureCard; 