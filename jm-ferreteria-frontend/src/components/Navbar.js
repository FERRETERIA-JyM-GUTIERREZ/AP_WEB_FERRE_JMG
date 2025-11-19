import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { orderService } from '../services/api';
import toast from 'react-hot-toast';
import { FaMoon, FaSun } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isVendedor, hasPermission } = useAuth();
  const { cart } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isCatalogPage = location.pathname?.toLowerCase().startsWith('/catalogo');

  const ThemeToggleButton = ({ className = '' }) => (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-lg transition-all group flex items-center justify-center ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300' : 'bg-orange-100 hover:bg-orange-200 text-indigo-600'} ${className}`}
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDarkMode ? (
        <FaSun className="w-5 h-5 group-hover:scale-125 transition-transform" />
      ) : (
        <FaMoon className="w-5 h-5 group-hover:scale-125 transition-transform" />
      )}
    </button>
  );

  // Log del estado de autenticación
  console.log('🎭 Navbar renderizado - Usuario:', user);
  console.log('🎭 Navbar renderizado - isAuthenticated:', isAuthenticated());
  console.log('🎭 Navbar renderizado - Rol:', user?.rol);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.loading('Cerrando sesión...', { id: 'logout' });
    
    try {
      await logout();
      toast.success('Sesión cerrada correctamente', { id: 'logout' });
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      toast.error('Error al cerrar sesión', { id: 'logout' });
      setIsLoggingOut(false);
    }
  };

  // Cargar pedidos pendientes para notificación
  const loadPedidosPendientes = async () => {
    if (isAuthenticated() && (isAdmin() || isVendedor())) {
      try {
        const res = await orderService.getOrders();
        if (res.data && res.data.success) {
          const pendientes = res.data.data.filter(p => p.estado === 'pendiente');
          setPedidosPendientes(pendientes.length);
        }
      } catch (err) {
        // Silenciar error para no afectar la navegación
      }
    }
  };

  useEffect(() => {
    loadPedidosPendientes();
    // Recargar cada 30 segundos
    const interval = setInterval(loadPedidosPendientes, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isAdmin, isVendedor]);

  // Navegación pública para usuarios no logeados
  if (!isAuthenticated()) {
    return (
      <>
        {/* Barra superior con logo y nombre */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Logo y nombre */}
              <Link to="/" className="flex items-center space-x-4 group">
                <div className="relative">
                  <img 
                    src="/img/logo.png" 
                    alt="J&M GUTIÉRREZ" 
                    className="h-16 w-auto transition-transform group-hover:scale-110 duration-300 drop-shadow-md"
                  />
                </div>
                <div>
                  <h1 className="text-gray-900 font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-tight">
                    <span className="inline-block letter-animate-0">F</span>
                    <span className="inline-block letter-animate-1">E</span>
                    <span className="inline-block letter-animate-2">R</span>
                    <span className="inline-block letter-animate-3">R</span>
                    <span className="inline-block letter-animate-4">E</span>
                    <span className="inline-block letter-animate-5">T</span>
                    <span className="inline-block letter-animate-6">E</span>
                    <span className="inline-block letter-animate-7">R</span>
                    <span className="inline-block letter-animate-8">I</span>
                    <span className="inline-block letter-animate-9">A</span>
                    <span className="mx-2 text-orange-600 font-bold text-3xl md:text-4xl lg:text-5xl drop-shadow-md">J&M</span>
                    <span className="inline-block letter-animate-10">G</span>
                    <span className="inline-block letter-animate-11">U</span>
                    <span className="inline-block letter-animate-12">T</span>
                    <span className="inline-block letter-animate-13">I</span>
                    <span className="inline-block letter-animate-14">E</span>
                    <span className="inline-block letter-animate-15">R</span>
                    <span className="inline-block letter-animate-16">R</span>
                    <span className="inline-block letter-animate-17">E</span>
                    <span className="inline-block letter-animate-18">Z</span>
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">Ferretería y Construcción</p>
                </div>
              </Link>
              
              {/* Información adicional */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700 font-semibold">
                <svg className="w-7 h-5 shadow-md rounded-sm" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Bandera del Perú - Rojo izquierda */}
                  <rect x="0" y="0" width="8" height="16" fill="#DC143C"/>
                  {/* Bandera del Perú - Blanco centro */}
                  <rect x="8" y="0" width="8" height="16" fill="#FFFFFF"/>
                  {/* Bandera del Perú - Rojo derecha */}
                  <rect x="16" y="0" width="8" height="16" fill="#DC143C"/>
                </svg>
                <span className="text-base">Envíos a todo el Perú</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navbar principal */}
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Enlaces de navegación pública */}
              <div className="hidden lg:flex items-center space-x-1">
                <Link to="/" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Inicio
                </Link>
                <Link to="/catalogo" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Catálogo
                </Link>
                <Link to="/sobre-nosotros" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Sobre Nosotros
                </Link>
                <Link to="/contacto" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Contacto
                </Link>
              </div>

              {/* Botones de login/registro */}
              <div className="flex items-center space-x-3">
                {/* Botón menú móvil */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden text-gray-700 hover:text-orange-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Botón de autenticación */}
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                >
                  Iniciar Sesión
                </Link>
                {isCatalogPage && (
                  <ThemeToggleButton />
                )}
              </div>
            </div>

            {/* Menú móvil - Sidebar compacto */}
            {/* Overlay oscuro */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
            
            {/* Sidebar compacto - ajustado al contenido */}
            <div className={`fixed top-40 left-0 z-50 w-auto min-w-[220px] max-w-[65vw] bg-white shadow-2xl border-r-2 border-orange-100 rounded-r-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              {/* Menú de navegación - altura automática */}
              <nav className="px-3 pt-5 pb-6 space-y-1">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Inicio
                </Link>
                <Link 
                  to="/catalogo" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Catálogo
                </Link>
                <Link 
                  to="/sobre-nosotros" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Sobre Nosotros
                </Link>
                <Link 
                  to="/contacto" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Contacto
                </Link>
                <div className="pt-4 mt-2 border-t border-gray-200 flex flex-col gap-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Iniciar Sesión
                  </Link>
                  {isCatalogPage && (
                    <ThemeToggleButton className="w-full justify-center" />
                  )}
                </div>
              </nav>
            </div>
          </div>
        </nav>
      </>
    );
  }

  // Navegación horizontal para clientes
  if (isAuthenticated() && user?.rol === 'cliente') {
    console.log('🎭 Navbar: Mostrando navbar de cliente para usuario:', user);
    return (
      <>
        {/* Barra superior con logo y nombre */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Logo y nombre */}
              <Link to="/" className="flex items-center space-x-4 group">
                <div className="relative">
                  <img 
                    src="/img/logo.png" 
                    alt="J&M GUTIÉRREZ" 
                    className="h-16 w-auto transition-transform group-hover:scale-110 duration-300 drop-shadow-md"
                  />
                </div>
                <div>
                  <h1 className="text-gray-900 font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-tight">
                    <span className="inline-block letter-animate-0">F</span>
                    <span className="inline-block letter-animate-1">E</span>
                    <span className="inline-block letter-animate-2">R</span>
                    <span className="inline-block letter-animate-3">R</span>
                    <span className="inline-block letter-animate-4">E</span>
                    <span className="inline-block letter-animate-5">T</span>
                    <span className="inline-block letter-animate-6">E</span>
                    <span className="inline-block letter-animate-7">R</span>
                    <span className="inline-block letter-animate-8">I</span>
                    <span className="inline-block letter-animate-9">A</span>
                    <span className="mx-2 text-orange-600 font-bold text-3xl md:text-4xl lg:text-5xl drop-shadow-md">J&M</span>
                    <span className="inline-block letter-animate-10">G</span>
                    <span className="inline-block letter-animate-11">U</span>
                    <span className="inline-block letter-animate-12">T</span>
                    <span className="inline-block letter-animate-13">I</span>
                    <span className="inline-block letter-animate-14">E</span>
                    <span className="inline-block letter-animate-15">R</span>
                    <span className="inline-block letter-animate-16">R</span>
                    <span className="inline-block letter-animate-17">E</span>
                    <span className="inline-block letter-animate-18">Z</span>
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">Ferretería y Construcción</p>
                </div>
              </Link>
              
              {/* Información adicional */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700 font-semibold">
                <svg className="w-7 h-5 shadow-md rounded-sm" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Bandera del Perú - Rojo izquierda */}
                  <rect x="0" y="0" width="8" height="16" fill="#DC143C"/>
                  {/* Bandera del Perú - Blanco centro */}
                  <rect x="8" y="0" width="8" height="16" fill="#FFFFFF"/>
                  {/* Bandera del Perú - Rojo derecha */}
                  <rect x="16" y="0" width="8" height="16" fill="#DC143C"/>
                </svg>
                <span className="text-base">Envíos a todo el Perú</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navbar principal */}
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Enlaces de navegación */}
              <div className="hidden lg:flex items-center space-x-1">
                <Link to="/" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Inicio
                </Link>
                <Link to="/catalogo" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Catálogo
                </Link>
                <Link to="/sobre-nosotros" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Sobre Nosotros
                </Link>
                <Link to="/contacto" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Contacto
                </Link>
                <Link to="/carrito" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm flex items-center relative">
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Carrito
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Link>
                <Link to="/mis-compras" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Mis Compras
                </Link>
                <Link to="/favoritos" className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm">
                  Favoritos
                </Link>
              </div>

              {/* Menú móvil y usuario */}
              <div className="flex items-center space-x-3">
                {/* Botón menú móvil */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden text-gray-700 hover:text-orange-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Botón tema solo en catálogo */}
                {isCatalogPage && (
                  <ThemeToggleButton />
                )}

                {/* Usuario */}
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                  {/* Foto de perfil */}
                  {user?.avatar && user.avatar.trim() !== '' ? (
                    <img 
                      key={user.avatar} // Forzar re-render si cambia el avatar
                      src={user.avatar.replace(/=s\d+-c$/, '=s200-c')} 
                      alt={user?.name || 'Avatar'} 
                      className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-orange-500 transition-colors cursor-pointer object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        console.error('❌ Error cargando avatar:', user.avatar);
                        // Si es una URL de Google, intentar sin parámetros de tamaño
                        if (user.avatar.includes('googleusercontent.com')) {
                          const baseUrl = user.avatar.split('=')[0];
                          const newUrl = baseUrl + '=s200';
                          console.log('🔄 Intentando con URL modificada (sin -c):', newUrl);
                          if (e.target.src !== newUrl) {
                            e.target.src = newUrl;
                            return;
                          }
                        }
                        // Si falla completamente, mostrar placeholder
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        console.log('✅ Avatar cargado correctamente:', user.avatar);
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer ${user?.avatar && user.avatar.trim() !== '' ? 'hidden' : 'flex'}`}
                  >
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">Cliente</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-orange-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    title="Cerrar sesión"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Menú móvil - Sidebar compacto */}
            {/* Overlay oscuro */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
            
            {/* Sidebar compacto - ajustado al contenido */}
            <div className={`fixed top-40 left-0 z-50 w-auto min-w-[220px] max-w-[65vw] bg-white shadow-2xl border-r-2 border-orange-100 rounded-r-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              {/* Menú de navegación - altura automática */}
              <nav className="px-3 pt-5 pb-6 space-y-1">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Inicio
                </Link>
                <Link 
                  to="/catalogo" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Catálogo
                </Link>
                <Link 
                  to="/sobre-nosotros" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Sobre Nosotros
                </Link>
                <Link 
                  to="/contacto" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Contacto
                </Link>
                <Link 
                  to="/carrito" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm flex items-center justify-between whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  <span>Mi Carrito</span>
                  {cart.length > 0 && (
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center ml-2 shadow-md">
                      {cart.length}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/mis-compras" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Mis Compras
                </Link>
                <Link 
                  to="/favoritos" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Favoritos
                </Link>
                <Link 
                  to="/perfil" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all font-medium text-sm whitespace-nowrap hover:shadow-sm hover:translate-x-1"
                >
                  Mi Perfil
                </Link>
              </nav>
            </div>
          </div>
        </nav>
      </>
    );
  }

  // Sidebar para empleados (admin/vendedor)
  console.log('🎭 Navbar: Mostrando sidebar de empleados para usuario:', user);
  return (
    <>
      {/* Overlay para móviles */}
      {isAuthenticated() && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar para usuarios autenticados */}
      {isAuthenticated() && (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-slate-700/50 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0`}>
          {/* Header del sidebar */}
          <div className="flex items-center justify-between h-20 px-4 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 shadow-xl border-b border-slate-600/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 shadow-lg border-2 border-orange-400/50">
                <span className="text-white font-bold text-sm">J&M</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm tracking-tight leading-tight">Gestión Ferretera</h1>
                <p className="text-xs text-orange-400 font-semibold">J&M GUTIÉRREZ</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Botón de cambio de tema */}
              <button
                onClick={toggleTheme}
                className="text-gray-300 hover:text-white hover:bg-slate-600/50 rounded-lg p-2 transition-all duration-200"
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDarkMode ? (
                  <FaSun className="w-5 h-5" />
                ) : (
                  <FaMoon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-slate-600/50 rounded-lg p-2 transition-all duration-200 lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Menú de navegación */}
          <nav className="mt-6 px-3 overflow-y-auto flex-1">
            {/* Menú administrativo */}
            <div className="mb-6">
              <p className="text-xs text-orange-400 uppercase tracking-wider mb-4 px-3 font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Administración
              </p>
              <div className="space-y-2">
                <Link to="/dashboard" className="group flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 border border-transparent hover:border-blue-500/30">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Dashboard</span>
                </Link>
                {hasPermission('inventario.view') && (
                  <Link to="/inventario" className="group flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-green-500/20 hover:shadow-lg hover:shadow-green-500/20 border border-transparent hover:border-green-500/30">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-1.5 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="font-semibold">Inventario</span>
                  </Link>
                )}
                {hasPermission('ventas.view') && (
                  <Link to="/ventas" className="group flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/20 border border-transparent hover:border-emerald-500/30">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mr-1.5 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <span className="font-semibold">Ventas</span>
                  </Link>
                )}
                {hasPermission('usuarios.view') && (
                  <Link to="/usuarios" className="group flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 border border-transparent hover:border-purple-500/30">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-1.5 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <span className="font-semibold">Usuarios</span>
                  </Link>
                )}
                {hasPermission('reportes.view') && (
                  <Link to="/reportes" className="group flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-600/20 hover:to-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20 border border-transparent hover:border-cyan-500/30">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mr-1.5 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="font-semibold">Reportes</span>
                  </Link>
                )}
                <Link to="/gestion-roles" className="group flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-600/20 hover:to-amber-500/20 hover:shadow-lg hover:shadow-amber-500/20 border border-transparent hover:border-amber-500/30">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mr-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Gestión de Roles</span>
                </Link>
              </div>
            </div>

            {/* Sección de Herramientas */}
            <div className="mb-6">
              <p className="text-xs text-cyan-400 uppercase tracking-wider mb-4 px-3 font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Herramientas
              </p>
              <div className="space-y-2">
                <Link to="/calendario" className="group flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-pink-500/20 hover:shadow-lg hover:shadow-pink-500/20 border border-transparent hover:border-pink-500/30">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mr-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Calendario</span>
                </Link>
                <Link to="/notas" className="group flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/20 border border-transparent hover:border-indigo-500/30">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mr-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Notas</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Información del usuario */}
          <div className="px-3 py-4 border-t border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm mt-auto">
            <div className="flex items-center mb-4 px-2">
              {/* Foto de perfil móvil */}
              {user?.avatar && user.avatar.trim() !== '' ? (
                <img 
                  key={user.avatar} // Forzar re-render si cambia el avatar
                  src={user.avatar.replace(/=s\d+-c$/, '=s200-c')} 
                  alt={user?.name || 'Avatar'} 
                  className="w-12 h-12 rounded-xl border-2 border-orange-500/50 mr-3 shadow-lg object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    console.error('❌ Error cargando avatar en sidebar:', user.avatar);
                    // Si es una URL de Google, intentar sin parámetros de tamaño
                    if (user.avatar.includes('googleusercontent.com')) {
                      const baseUrl = user.avatar.split('=')[0];
                      const newUrl = baseUrl + '=s200';
                      console.log('🔄 Intentando con URL modificada en sidebar (sin -c):', newUrl);
                      if (e.target.src !== newUrl) {
                        e.target.src = newUrl;
                        return;
                      }
                    }
                    // Si falla completamente, mostrar placeholder
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Avatar cargado correctamente en sidebar:', user.avatar);
                  }}
                />
              ) : null}
              <div 
                className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 shadow-lg border border-orange-400/30 ${user?.avatar && user.avatar.trim() !== '' ? 'hidden' : 'flex'}`}
              >
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <p className="text-xs text-orange-400 capitalize font-semibold">{user?.rol}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 border border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cerrando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Botón para abrir menú móvil */}
      {isAuthenticated() && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-30 lg:hidden bg-gradient-to-r from-orange-600 to-orange-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 border border-orange-400/30"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
};

export default Navbar;