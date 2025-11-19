import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated, user } = useAuth();

  // Solo mostrar footer para clientes y usuarios no autenticados
  if (isAuthenticated() && (user?.rol === 'admin' || user?.rol === 'vendedor')) {
    return null;
  }

  return (
    <footer className="bg-ferreteria-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center">
              🛠️ J&M GUTIERREZ E.I.R.L.
            </h3>
            <p className="text-ferreteria-200 leading-relaxed">
              Tu ferretería de confianza con más de 20 años de experiencia 
              en el mercado. Ofrecemos productos de calidad y un servicio 
              excepcional.
            </p>
            <p className="text-ferreteria-300 text-sm">
              RUC: 20611160012
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-ferreteria-200">
                <FaPhone className="text-ferreteria-400" />
                <span>+51 960 604 850</span>
              </div>
              <div className="flex items-center space-x-3 text-ferreteria-200">
                <FaEnvelope className="text-ferreteria-400" />
                <span>info@ferreteria-jmg.com</span>
              </div>
              <div className="flex items-center space-x-3 text-ferreteria-200">
                <FaMapMarkerAlt className="text-ferreteria-400" />
                <span>PZA SAN JOSE NRO. 0 URB. SAN JOSE (PUESTO 4 PABELLON J BASE I) PUNO - SAN ROMAN - JULIACA</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Horarios</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-ferreteria-200">
                <FaClock className="text-ferreteria-400" />
                <span>Lunes - Viernes: 8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center space-x-3 text-ferreteria-200">
                <FaClock className="text-ferreteria-400" />
                <span>Sábados: 8:00 AM - 7:00 PM</span>
              </div>
              <div className="flex items-center space-x-3 text-ferreteria-200">
                <FaClock className="text-ferreteria-400" />
                <span>Domingos: 8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="/catalogo" className="text-ferreteria-200 hover:text-white transition-colors">
                  Catálogo
                </a>
              </li>
              <li>
                <a href="/catalogo" className="text-ferreteria-200 hover:text-white transition-colors">
                  Productos
                </a>
              </li>
              <li>
                <a href="/catalogo" className="text-ferreteria-200 hover:text-white transition-colors">
                  Ofertas
                </a>
              </li>
              <li>
                <a href="/catalogo" className="text-ferreteria-200 hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ferreteria-700 mt-8 pt-8 text-center">
          <p className="text-ferreteria-200">&copy; 2024 J&M GUTIERREZ E.I.R.L. Todos los derechos reservados.</p>
          <p className="text-ferreteria-300 mt-2">Desarrollado con ❤️ para la comunidad</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 