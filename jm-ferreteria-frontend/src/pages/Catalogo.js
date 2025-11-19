import React, { useState, useEffect } from 'react';
import ProductoCard from '../components/ProductoCard';
import ProductoModal from '../components/ProductoModal';
import FormularioPedido from '../components/FormularioPedido';
import CarritoModal from '../components/CarritoModal';
import CarritoFlotante from '../components/CarritoFlotante';
import CategoriaCarrusel from '../components/CategoriaCarrusel';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getApiBaseUrl } from '../services/api';

const Catalogo = () => {
  const { isDarkMode } = useTheme();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFormulario, setShowFormulario] = useState(false);
  const [showCarrito, setShowCarrito] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalProducto, setModalProducto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      setLoading(true);
      
      // Usar la llamada directa a la API que SÍ funciona
      const response = await axios.get(`${getApiBaseUrl()}/catalogo/productos`);
      console.log('📦 Respuesta completa del servicio:', response);
      
      if (response.data && response.data.success) {
        console.log('✅ Productos cargados:', response.data.data);
        setProductos(response.data.data);
        // Extraer categorías únicas del catálogo
        const uniqueCategories = [...new Set(response.data.data.map(p => p.categoria?.nombre).filter(Boolean))];
        console.log('📂 Categorías encontradas:', uniqueCategories);
        setCategorias(uniqueCategories);
      } else {
        console.log('❌ Error en la respuesta:', response);
        setProductos([]);
        setCategorias([]);
        toast.error('Error al cargar productos');
      }
    } catch (error) {
      console.error('💥 Error completo:', error);
      setProductos([]);
      setCategorias([]);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (producto) => {
    const message = `Hola, me interesa el producto: ${producto.nombre} - Precio: S/ ${producto.precio}`;
    const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFormulario = (producto) => {
    setSelectedProduct(producto);
    setShowFormulario(true);
  };

  const handleVerDetalles = (producto) => {
    setModalProducto(producto);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalProducto(null);
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || producto.categoria?.nombre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Agrupar productos por categoría
  const productosPorCategoria = {};
  filteredProductos.forEach(producto => {
    const nombreCategoria = producto.categoria?.nombre || 'Sin categoría';
    if (!productosPorCategoria[nombreCategoria]) {
      productosPorCategoria[nombreCategoria] = [];
    }
    productosPorCategoria[nombreCategoria].push(producto);
  });

  // Convertir a array ordenado
  const categoriasConProductos = Object.entries(productosPorCategoria).map(([nombre, items]) => ({
    nombre,
    productos: items
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ferreteria-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-3 sm:py-4 pt-16 sm:pt-20 transition-colors duration-300" style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' 
        : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-6 xl:px-8">
        {/* Header + Filtros sticky - Compacto */}
        <div className="sticky top-0 z-30 pt-3 pb-3 mb-4 sm:mb-6 shadow-lg backdrop-blur-md transition-all duration-300"
          style={{
            background: isDarkMode
              ? 'rgba(15, 23, 42, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: isDarkMode 
              ? '1px solid rgba(249, 115, 22, 0.2)'
              : '1px solid rgba(249, 115, 22, 0.3)'
          }}
        >

          {/* Título y subtítulo compactos con animación */}
          <div className="mb-3 sm:mb-4 text-center">
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 relative animate-fade-in flex justify-center flex-wrap drop-shadow-lg ${isDarkMode ? 'text-white' : 'text-orange-600'}`}
              style={isDarkMode ? {
                animation: 'fadeInDown 1s cubic-bezier(0.23, 1, 0.32, 1)',
                letterSpacing: '0.01em',
                textShadow: '0 0 10px rgba(249, 115, 22, 0.8), 0 0 20px rgba(249, 115, 22, 0.4)',
              } : {
                animation: 'fadeInDown 1s cubic-bezier(0.23, 1, 0.32, 1)',
                letterSpacing: '0.01em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              {"Catálogo de Productos".split("").map((letra, i) => (
                <span
                  key={i}
                  className="inline-block animate-wave"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {letra === " " ? '\u00A0' : letra}
                </span>
              ))}
              <span className="block absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-1/2 h-1 bg-gradient-to-r from-orange-400 via-yellow-300 to-yellow-400 rounded-md animate-underline"></span>
            </h1>
            <p className={`text-sm sm:text-base mt-2 animate-fade-in-slow transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Encuentra todo lo que necesitas para tus proyectos</p>
          </div>
          
          {/* Buscador y categorías en layout compacto */}
          <div className="space-y-3">
            {/* Buscador compacto */}
            <div className={`flex items-center w-full rounded-lg shadow-md px-3 py-2 focus-within:ring-2 focus-within:ring-orange-400 transition-all border ${isDarkMode ? 'bg-slate-800 border-orange-400/30' : 'bg-white border-orange-400/50'}`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full outline-none bg-transparent text-sm sm:text-base font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}`}
              />
              <button
                className="ml-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-orange-500 text-white text-sm sm:text-base font-semibold shadow hover:bg-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 flex-shrink-0"
                onClick={() => {}}
                tabIndex={-1}
                type="button"
              >
                Buscar
              </button>
            </div>
            
            {/* Selector de categorías - Scroll horizontal en móviles */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold shadow-sm border transition-all whitespace-nowrap flex-shrink-0
                  ${selectedCategory === ''
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500'
                    : isDarkMode ? 'bg-slate-700 text-orange-400 border-orange-400/50 hover:bg-slate-600' : 'bg-gray-200 text-orange-600 border-orange-300 hover:bg-gray-300'}
                `}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="hidden sm:inline">Todas las categorías</span>
                <span className="sm:hidden">Todas</span>
              </button>
              {categorias.map(categoria => (
                <button
                  key={categoria}
                  onClick={() => setSelectedCategory(categoria)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold shadow-sm border transition-all whitespace-nowrap flex-shrink-0
                    ${selectedCategory === categoria
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500'
                      : isDarkMode ? 'bg-slate-700 text-blue-400 border-blue-400/50 hover:bg-slate-600' : 'bg-gray-200 text-blue-600 border-blue-300 hover:bg-gray-300'}
                  `}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {categoria}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultados - Compacto */}
        <div className={`mb-6 sm:mb-8 text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {filteredProductos.length} producto{filteredProductos.length !== 1 ? 's' : ''} encontrado{filteredProductos.length !== 1 ? 's' : ''}
        </div>

        {/* Carruseles por categoría */}
        {categoriasConProductos.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {categoriasConProductos.map((categoria) => (
              <CategoriaCarrusel
                key={categoria.nombre}
                categoria={categoria.nombre}
                productos={categoria.productos}
                onWhatsApp={handleWhatsApp}
                onFormulario={handleFormulario}
                onVerDetalles={handleVerDetalles}
              />
            ))}
          </div>
        ) : (
          <div className="text-center mt-16">
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>No se encontraron productos</h3>
            <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Intenta con otros términos de búsqueda o categorías</p>
          </div>
        )}
      </div>
      {/* Modales */}
      {showFormulario && selectedProduct && (
        <FormularioPedido
          producto={selectedProduct}
          onClose={() => {
            setShowFormulario(false);
            setSelectedProduct(null);
          }}
        />
      )}
      <CarritoModal
        isOpen={showCarrito}
        onClose={() => setShowCarrito(false)}
      />
      {/* Modal de detalles del producto */}
      <ProductoModal
        producto={modalProducto}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Carrito Flotante */}
      <CarritoFlotante />
    </div>
  );
};

export default Catalogo; 