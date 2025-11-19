import React, { useState, useRef } from 'react';
import { 
  FaPhone, 
  FaEnvelope, 
  FaFacebook, 
  FaInstagram, 
  FaWhatsapp 
} from 'react-icons/fa';

const PrismaticContactCard = ({ 
  icon, 
  title, 
  detail, 
  color = 'orange',
  onClick 
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

  // Función para obtener el icono oficial según el tipo
  const getOfficialIcon = (iconType) => {
    switch (iconType) {
      case 'phone':
        return <FaPhone className="text-2xl" />;
      case 'email':
        return <FaEnvelope className="text-2xl" />;
      case 'facebook':
        return <FaFacebook className="text-2xl" />;
      case 'instagram':
        return <FaInstagram className="text-2xl" />;
      case 'whatsapp':
        return <FaWhatsapp className="text-2xl" />;
      default:
        return <span className="text-2xl">{icon}</span>;
    }
  };

  // Colores originales de las redes sociales
  const getIconColor = (iconType) => {
    switch (iconType) {
      case 'phone':
        return '#25D366'; // Verde WhatsApp
      case 'email':
        return '#EA4335'; // Rojo Gmail
      case 'facebook':
        return '#1877F2'; // Azul Facebook
      case 'instagram':
        return '#E4405F'; // Rosa Instagram
      case 'whatsapp':
        return '#25D366'; // Verde WhatsApp
      default:
        return '#FF6B35'; // Naranja por defecto
    }
  };

  // Efectos simplificados para cada icono
  const getIconEffects = (iconType) => {
    const baseColor = getIconColor(iconType);
    
        return {
          color: baseColor,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease-out',
      filter: isHovered ? `drop-shadow(0 0 10px ${baseColor})` : 'none',
    };
  };

  const rotateX = isHovered ? ((mousePosition.y - 50) / 50) * 10 : 0;
  const rotateY = isHovered ? ((mousePosition.x - 50) / 50) * 10 : 0;

  return (
      <div
        ref={cardRef}
      className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 cursor-pointer text-white shadow-lg hover:shadow-xl transition-all duration-300 transform-gpu"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.05 : 1})`,
          background: isHovered 
          ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%), linear-gradient(to bottom right, #f97316, #ea580c)`
          : 'linear-gradient(to bottom right, #f97316, #ea580c)'
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
      <div className="relative z-10 text-center">
        {/* Icono con efectos simplificados */}
        <div className="flex justify-center mb-4">
          <div 
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={getIconEffects(icon)}
          >
              {getOfficialIcon(icon)}
            </div>
          </div>
          
        {/* Título */}
        <h3 className="text-lg font-bold mb-2 transition-all duration-300">
            {title}
          </h3>
          
        {/* Detalle */}
        <p className="text-sm opacity-90">
            {detail}
          </p>
        </div>
      </div>
  );
};

export default PrismaticContactCard;