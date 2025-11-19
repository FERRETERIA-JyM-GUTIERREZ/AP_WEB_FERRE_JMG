import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ArbolNavidad = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Rutas donde se debe mostrar: página principal y páginas de cliente
    const allowedPaths = [
      '/', // Página principal
      '/catalogo',
      '/carrito',
      '/mis-compras',
      '/favoritos',
      '/wishlist',
      '/perfil',
      '/checkout',
      '/producto'
    ];

    // Verificar si la ruta actual está permitida
    const isAllowedPath = allowedPaths.some(path => {
      if (path === '/producto') {
        return location.pathname.startsWith('/producto');
      }
      return location.pathname === path;
    });

    setIsVisible(isAllowedPath);
  }, [location.pathname]);

  if (!isVisible) return null;

  // URLs de las animaciones Lottie
  const deerUrl = "https://lottie.host/1c46b0b9-64d9-45a8-ac57-7e61ea131fb2/uozVTZZlTA.lottie"; // Venaditos (centro)
  const christmasUrl = "https://lottie.host/857ce5b4-391d-4eba-9450-4668be4f321e/5vGQSSfBYf.lottie"; // Nueva animación navideña

  return (
    <div className="fixed left-0 w-full z-40 pointer-events-none overflow-visible" style={{ bottom: '-20px', height: 'auto' }}>
      {/* Animación de venaditos - Esquina inferior izquierda */}
      <div className="absolute deer-animation-container" style={{ bottom: '-70px', left: '16px' }}>
        <div className="deer-animation-wrapper">
          <DotLottieReact
            src={deerUrl}
            loop={true}
            autoplay={true}
            className="deer-lottie"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
      
      {/* Animación navideña - Esquina inferior derecha */}
      <div className="absolute christmas-message" style={{ bottom: '20px', right: '16px' }}>
        <div className="christmas-animation-side">
          <DotLottieReact
            src={christmasUrl}
            loop={true}
            autoplay={true}
            className="christmas-lottie"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Estilos de animación */}
      <style>{`
        /* Contenedor de la animación navideña - Pequeña en esquina */
        .christmas-animation-side {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Contenedor de la animación de venaditos - Esquina izquierda, Responsive */
        .deer-animation-container {
          position: relative;
          width: 250px;
          height: 200px;
          max-width: 35vw;
          min-width: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Estilos para la animación navideña lateral */
        .christmas-lottie {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
        }
        
        .christmas-animation-side *,
        .christmas-animation-side canvas,
        .christmas-animation-side iframe,
        .christmas-animation-side [class*="dotlottie"] {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* Wrapper de la animación - Responsive */
        .deer-animation-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }
        
        /* Responsive para diferentes tamaños de pantalla */
        @media (min-width: 640px) {
          .christmas-animation-side {
            width: 100px;
            height: 100px;
          }
          .deer-animation-container {
            width: 280px;
            height: 220px;
            max-width: 30vw;
          }
        }
        
        @media (min-width: 768px) {
          .christmas-animation-side {
            width: 120px;
            height: 120px;
          }
          .deer-animation-container {
            width: 320px;
            height: 250px;
            max-width: 28vw;
          }
        }
        
        @media (min-width: 1024px) {
          .christmas-animation-side {
            width: 140px;
            height: 140px;
          }
          .deer-animation-container {
            width: 360px;
            height: 280px;
            max-width: 25vw;
          }
        }
        
        @media (min-width: 1280px) {
          .christmas-animation-side {
            width: 160px;
            height: 160px;
          }
          .deer-animation-container {
            width: 400px;
            height: 320px;
            max-width: 22vw;
          }
        }
        
        /* Estilos para la animación Lottie */
        .deer-lottie {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
        }
        
        /* Remover fondo blanco y asegurar visibilidad */
        .deer-lottie *,
        .deer-animation-wrapper canvas,
        .deer-animation-wrapper iframe,
        .deer-animation-wrapper [class*="dotlottie"],
        .deer-animation-wrapper > * {
          background: transparent !important;
          background-color: transparent !important;
          display: block !important;
        }
        
        /* Asegurar que el contenedor de Lottie sea visible y no se recorte */
        .deer-animation-wrapper > * {
          width: 100% !important;
          height: 100% !important;
          min-height: 200px !important;
          overflow: visible !important;
        }
        
        /* Mensaje de Navidad en esquina */
        .christmas-message {
          position: absolute;
          z-index: 50;
        }
        
        /* Estilos para el mensaje navideño */
        .christmas-message-text {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(6, 182, 212, 0.2));
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 8px 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(34, 197, 94, 0.3);
        }
        
        .christmas-text-animated {
          display: flex;
          align-items: center;
          gap: 2px;
          text-shadow: 
            0 0 5px rgba(34, 197, 94, 0.5),
            0 0 10px rgba(220, 38, 38, 0.3);
        }
        
        .christmas-text-animated span {
          display: inline-block;
          animation: letterBounce 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .christmas-text-animated span:nth-child(1) { animation-delay: 0.1s; }
        .christmas-text-animated span:nth-child(2) { animation-delay: 0.15s; }
        .christmas-text-animated span:nth-child(3) { animation-delay: 0.2s; }
        .christmas-text-animated span:nth-child(4) { animation-delay: 0.25s; }
        .christmas-text-animated span:nth-child(5) { animation-delay: 0.3s; }
        .christmas-text-animated span:nth-child(6) { animation-delay: 0.35s; }
        .christmas-text-animated span:nth-child(7) { animation-delay: 0.4s; }
        .christmas-text-animated span:nth-child(8) { animation-delay: 0.45s; }
        .christmas-text-animated span:nth-child(9) { animation-delay: 0.5s; }
        .christmas-text-animated span:nth-child(10) { animation-delay: 0.55s; }
        .christmas-text-animated span:nth-child(11) { animation-delay: 0.6s; }
        .christmas-text-animated span:nth-child(12) { animation-delay: 0.65s; }
        .christmas-text-animated span:nth-child(13) { animation-delay: 0.7s; }
        .christmas-text-animated span:nth-child(14) { animation-delay: 0.75s; }
        .christmas-text-animated span:nth-child(15) { animation-delay: 0.8s; }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        /* Animación de entrada y salida continua para cada letra */
        @keyframes letterBounce {
          0% {
            opacity: 0;
            transform: translateY(-30px) scale(0.3) rotate(-10deg);
          }
          20% {
            opacity: 1;
            transform: translateY(5px) scale(1.15) rotate(5deg);
          }
          40% {
            transform: translateY(-5px) scale(0.95) rotate(-3deg);
          }
          60% {
            transform: translateY(3px) scale(1.05) rotate(2deg);
          }
          80% {
            transform: translateY(-2px) scale(0.98) rotate(-1deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }
        
        /* Animación continua de movimiento */
        @keyframes letterFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.05);
          }
        }
        
        .letter-animate {
          opacity: 0;
        }
        
        /* Contorno animado para las letras - Más visible */
        @keyframes outlineGlow {
          0%, 100% {
            text-shadow: 
              -3px -3px 0px #ff4500,
              -3px -2px 0px #ff4500,
              -3px -1px 0px #ff4500,
              -3px 0px 0px #ff4500,
              -3px 1px 0px #ff4500,
              -3px 2px 0px #ff4500,
              -3px 3px 0px #ff4500,
              3px -3px 0px #ff4500,
              3px -2px 0px #ff4500,
              3px -1px 0px #ff4500,
              3px 0px 0px #ff4500,
              3px 1px 0px #ff4500,
              3px 2px 0px #ff4500,
              3px 3px 0px #ff4500,
              -2px -3px 0px #ff4500,
              -1px -3px 0px #ff4500,
              0px -3px 0px #ff4500,
              1px -3px 0px #ff4500,
              2px -3px 0px #ff4500,
              -2px 3px 0px #ff4500,
              -1px 3px 0px #ff4500,
              0px 3px 0px #ff4500,
              1px 3px 0px #ff4500,
              2px 3px 0px #ff4500,
              0px 0px 15px rgba(255, 69, 0, 1),
              0px 0px 25px rgba(255, 69, 0, 0.9),
              0px 0px 35px rgba(255, 69, 0, 0.7);
          }
          50% {
            text-shadow: 
              -4px -4px 0px #ff4500,
              -4px -3px 0px #ff4500,
              -4px -2px 0px #ff4500,
              -4px -1px 0px #ff4500,
              -4px 0px 0px #ff4500,
              -4px 1px 0px #ff4500,
              -4px 2px 0px #ff4500,
              -4px 3px 0px #ff4500,
              -4px 4px 0px #ff4500,
              4px -4px 0px #ff4500,
              4px -3px 0px #ff4500,
              4px -2px 0px #ff4500,
              4px -1px 0px #ff4500,
              4px 0px 0px #ff4500,
              4px 1px 0px #ff4500,
              4px 2px 0px #ff4500,
              4px 3px 0px #ff4500,
              4px 4px 0px #ff4500,
              -3px -4px 0px #ff4500,
              -2px -4px 0px #ff4500,
              -1px -4px 0px #ff4500,
              0px -4px 0px #ff4500,
              1px -4px 0px #ff4500,
              2px -4px 0px #ff4500,
              3px -4px 0px #ff4500,
              -3px 4px 0px #ff4500,
              -2px 4px 0px #ff4500,
              -1px 4px 0px #ff4500,
              0px 4px 0px #ff4500,
              1px 4px 0px #ff4500,
              2px 4px 0px #ff4500,
              3px 4px 0px #ff4500,
              0px 0px 20px rgba(255, 69, 0, 1),
              0px 0px 30px rgba(255, 69, 0, 1),
              0px 0px 40px rgba(255, 69, 0, 0.9);
          }
        }
        
        .letter-outline {
          animation: letterBounce 1.2s ease-out forwards, letterFloat 3s ease-in-out infinite, outlineGlow 2s ease-in-out infinite;
          color: #ff3300 !important;
          font-weight: 900;
          font-size: 1.3em;
          text-rendering: optimizeLegibility;
          -webkit-text-stroke: 4px #ffffff;
          text-stroke: 4px #ffffff;
          paint-order: stroke fill;
          text-shadow: 
            -4px -4px 0px #ffffff,
            -4px -3px 0px #ffffff,
            -4px -2px 0px #ffffff,
            -4px -1px 0px #ffffff,
            -4px 0px 0px #ffffff,
            -4px 1px 0px #ffffff,
            -4px 2px 0px #ffffff,
            -4px 3px 0px #ffffff,
            -4px 4px 0px #ffffff,
            4px -4px 0px #ffffff,
            4px -3px 0px #ffffff,
            4px -2px 0px #ffffff,
            4px -1px 0px #ffffff,
            4px 0px 0px #ffffff,
            4px 1px 0px #ffffff,
            4px 2px 0px #ffffff,
            4px 3px 0px #ffffff,
            4px 4px 0px #ffffff,
            -3px -4px 0px #ffffff,
            -2px -4px 0px #ffffff,
            -1px -4px 0px #ffffff,
            0px -4px 0px #ffffff,
            1px -4px 0px #ffffff,
            2px -4px 0px #ffffff,
            3px -4px 0px #ffffff,
            -3px 4px 0px #ffffff,
            -2px 4px 0px #ffffff,
            -1px 4px 0px #ffffff,
            0px 4px 0px #ffffff,
            1px 4px 0px #ffffff,
            2px 4px 0px #ffffff,
            3px 4px 0px #ffffff,
            0px 0px 15px rgba(255, 51, 0, 1),
            0px 0px 25px rgba(255, 51, 0, 1),
            0px 0px 35px rgba(255, 51, 0, 0.9);
          filter: drop-shadow(0 0 12px rgba(255, 51, 0, 1)) drop-shadow(0 0 18px rgba(255, 51, 0, 0.9)) brightness(1.2);
        }
        
        /* Asegurar que en móviles se vea completa sin recortes y responsive */
        @media (max-width: 639px) {
          .christmas-animation-side {
            width: 70px;
            height: 70px;
          }
          .deer-animation-container {
            width: 200px;
            height: 160px;
            max-width: 40vw;
            min-width: 150px;
          }
          .deer-animation-wrapper {
            overflow: visible !important;
            height: 100% !important;
          }
          .deer-lottie {
            overflow: visible !important;
          }
        }
        
        /* Responsive para tablets pequeñas */
        @media (min-width: 480px) and (max-width: 639px) {
          .deer-animation-container {
            width: 220px;
            height: 175px;
            max-width: 38vw;
          }
        }
      `}</style>
    </div>
  );
};

export default ArbolNavidad;

