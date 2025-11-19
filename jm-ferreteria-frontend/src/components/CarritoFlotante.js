import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CarritoFlotante = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleVerCarrito = () => {
    navigate('/carrito');
  };

  // No mostrar si no hay productos en el carrito
  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-48 sm:top-52 md:top-56 lg:top-60 right-3 sm:right-4 md:right-6 lg:right-8 z-40">
      {/* Carrito Flotante - Altura del Título */}
      <button
        onClick={handleVerCarrito}
        className="relative group transition-all duration-300 hover:scale-125 focus:outline-none active:scale-95"
        title={`${cart.length} producto${cart.length !== 1 ? 's' : ''} en el carrito`}
      >
        {/* SVG del Carrito - Más pequeño */}
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-orange-500 drop-shadow-lg hover:drop-shadow-xl transition-all"
          fill="currentColor"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Carrito de compras simplificado */}
          <g>
            {/* Asa del carrito */}
            <path d="M20 15C18 15 18 18 18 18L22 65C22 70 26 74 32 74H72C78 74 82 70 82 65L86 18C86 18 86 15 84 15H20Z" 
                  fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Línea del carrito que divide */}
            <line x1="25" y1="30" x2="80" y2="30" stroke="currentColor" strokeWidth="2"/>
            
            {/* Ruedas */}
            <circle cx="35" cy="75" r="5" fill="currentColor"/>
            <circle cx="70" cy="75" r="5" fill="currentColor"/>
            
            {/* Símbolo de agregar (círculo rojo con +) */}
            <circle cx="70" cy="40" r="18" fill="#DC2626" opacity="0.9"/>
            <line x1="70" y1="32" x2="70" y2="48" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="62" y1="40" x2="78" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </g>
        </svg>

        {/* Contador - Badge Compacto y Rojo (Arriba) */}
        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:-top-3 md:-right-3 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-red-700 transition-colors">
          <span className="text-white font-black text-xs">
            {cart.length}
          </span>
        </div>

        {/* Tooltip al pasar el mouse */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          {cart.length} producto{cart.length !== 1 ? 's' : ''} en carrito
        </div>

        {/* Pulse animation sutil */}
        <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-pulse pointer-events-none"></div>
      </button>
    </div>
  );
};

export default CarritoFlotante;
