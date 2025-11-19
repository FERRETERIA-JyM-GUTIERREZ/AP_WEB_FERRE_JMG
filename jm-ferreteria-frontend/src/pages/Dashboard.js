import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { saleService, productService, userService } from '../services/api';

const Dashboard = () => {
  const { user, isAdmin, isVendedor } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // Estados para datos reales
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ingresosHoy: 0,
    totalProductos: 0,
    totalClientes: 0,
    clientesUnicos: 0
  });
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [productosBajos, setProductosBajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (value) => {
    const numericValue = Number(value ?? 0);
    if (Number.isNaN(numericValue)) {
      return 'S/ 0.00';
    }
    return `S/ ${numericValue.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando datos del dashboard...');
      
      // Cargar estadísticas de ventas
      try {
        const ventasRes = await saleService.getStats();
        console.log('📊 Respuesta de estadísticas:', ventasRes);
        if (ventasRes.data?.success) {
          const ventasData = ventasRes.data.data;
          setStats(prev => ({
            ...prev,
            ventasHoy: Number(ventasData.ventas_hoy) || 0,
            ingresosHoy: Number(ventasData.ingresos_hoy) || 0,
            clientesUnicos: Number(ventasData.clientes_unicos) || prev.clientesUnicos || 0
          }));
          console.log('✅ Estadísticas cargadas:', ventasData);
        } else {
          console.warn('⚠️ Estadísticas no disponibles:', ventasRes.data);
        }
      } catch (err) {
        console.error('❌ Error cargando estadísticas:', err);
      }

      // Cargar ventas recientes
      try {
        const ventasRecientesRes = await saleService.getSales('limit=5');
        console.log('📋 Respuesta de ventas recientes:', ventasRecientesRes);
        if (ventasRecientesRes.data?.success) {
          setVentasRecientes(ventasRecientesRes.data.data || []);
          console.log('✅ Ventas recientes cargadas');
        } else {
          console.warn('⚠️ Ventas recientes no disponibles');
        }
      } catch (err) {
        console.error('❌ Error cargando ventas recientes:', err);
      }

      // Cargar productos con stock bajo
      try {
        const productosRes = await productService.getProducts();
        console.log('📦 Respuesta de productos:', productosRes);
        if (productosRes.data?.success) {
          const productos = productosRes.data.data || [];
          const productosConStockBajo = productos.filter(p => Number(p.stock) <= 3);
          setProductosBajos(productosConStockBajo.slice(0, 5));
          setStats(prev => ({
            ...prev,
            totalProductos: productos.length
          }));
          console.log('✅ Productos cargados:', productos.length);
        } else {
          console.warn('⚠️ Productos no disponibles');
        }
      } catch (err) {
        console.error('❌ Error cargando productos:', err);
      }

      // Cargar total de clientes
      try {
        const clientesRes = await userService.getClientes();
        console.log('👥 Respuesta de clientes:', clientesRes);
        if (clientesRes.data?.success) {
          const clientes = clientesRes.data.data || [];
          setStats(prev => ({
            ...prev,
            totalClientes: clientes.length,
            clientesUnicos: prev.clientesUnicos && prev.clientesUnicos > 0 ? prev.clientesUnicos : clientes.length
          }));
          console.log('✅ Clientas cargados:', clientes.length);
        } else {
          console.warn('⚠️ Clientes no disponibles');
        }
      } catch (err) {
        console.error('❌ Error cargando clientes:', err);
      }
      
      console.log('✅ Dashboard cargado completamente');
    } catch (err) {
      console.error('💥 Error completo cargando datos del dashboard:', err);
      console.error('📊 Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Error al cargar los datos del dashboard. Verifica la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar datos si no es cliente
    if (user?.rol !== 'cliente') {
      loadDashboardData();
    }
  }, [user?.rol]);

  // Si es cliente, mostrar dashboard simple
  if (user?.rol === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header para cliente */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Bienvenido, {user?.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Explora nuestros productos y encuentra todo lo que necesitas para tus proyectos
            </p>
          </div>

          {/* Tarjetas de acción para cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Catálogo */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Catálogo</h3>
              <p className="text-gray-600 mb-6">Explora todos nuestros productos disponibles</p>
              <button 
                onClick={() => navigate('/catalogo')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ver Productos
              </button>
            </div>

            {/* Mis Compras */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mis Compras</h3>
              <p className="text-gray-600 mb-6">Revisa el historial de tus pedidos</p>
              <button 
                onClick={() => navigate('/mis-compras')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Ver Compras
              </button>
            </div>

            {/* Favoritos */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Favoritos</h3>
              <p className="text-gray-600 mb-6">Guarda tus productos favoritos</p>
              <button 
                onClick={() => navigate('/favoritos')}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Ver Favoritos
              </button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">¿Necesitas ayuda?</h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo está aquí para ayudarte con cualquier consulta sobre nuestros productos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/contacto')}
                className="bg-gray-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Contactar
              </button>
              <button 
                onClick={() => navigate('/sobre-nosotros')}
                className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Sobre Nosotros
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Funciones para acciones rápidas
  const handleNuevaVenta = () => {
    navigate('/ventas');
  };

  const handleAgregarProducto = () => {
    navigate('/inventario');
  };

  const handleVerReportes = () => {
    navigate('/reportes');
  };

  const quickActions = [
    {
      label: 'Nueva Venta',
      icon: '💰',
      description: 'Registra una venta al instante',
      onClick: handleNuevaVenta,
      cardDark: 'border border-amber-400/45 bg-amber-400/18 shadow-[0_18px_36px_rgba(251,191,36,0.15)]',
      cardLight: 'border border-amber-200 bg-amber-50 shadow-[0_16px_32px_rgba(251,191,36,0.18)]',
      iconDark: 'border border-amber-300/60 bg-amber-400/20 text-amber-50',
      iconLight: 'border border-amber-200 bg-amber-100 text-amber-600',
      badgeDark: 'border border-amber-300/50 bg-amber-400/15 text-amber-100',
      badgeLight: 'border border-amber-200 bg-amber-100 text-amber-700',
    },
    {
      label: 'Agregar Producto',
      icon: '📦',
      description: 'Actualiza tu inventario y precios',
      onClick: handleAgregarProducto,
      cardDark: 'border border-emerald-400/45 bg-emerald-400/18 shadow-[0_18px_36px_rgba(16,185,129,0.15)]',
      cardLight: 'border border-emerald-200 bg-emerald-50 shadow-[0_16px_32px_rgba(16,185,129,0.18)]',
      iconDark: 'border border-emerald-300/60 bg-emerald-400/20 text-emerald-50',
      iconLight: 'border border-emerald-200 bg-emerald-100 text-emerald-600',
      badgeDark: 'border border-emerald-300/50 bg-emerald-400/15 text-emerald-100',
      badgeLight: 'border border-emerald-200 bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Ver Reportes',
      icon: '📊',
      description: 'Analiza el rendimiento de tu negocio',
      onClick: handleVerReportes,
      cardDark: 'border border-violet-400/45 bg-violet-400/18 shadow-[0_18px_36px_rgba(139,92,246,0.15)]',
      cardLight: 'border border-violet-200 bg-violet-50 shadow-[0_16px_32px_rgba(139,92,246,0.18)]',
      iconDark: 'border border-violet-300/60 bg-violet-400/20 text-violet-50',
      iconLight: 'border border-violet-200 bg-violet-100 text-violet-600',
      badgeDark: 'border border-violet-300/50 bg-violet-400/15 text-violet-100',
      badgeLight: 'border border-violet-200 bg-violet-100 text-violet-700',
    },
  ];

  const productosTopRowBaseClass = isDarkMode
    ? 'group odd:bg-slate-900/70 even:bg-slate-900/60 hover:bg-slate-900/40 transition-all duration-300'
    : 'group odd:bg-white/65 even:bg-white/45 hover:bg-white/80 transition-all duration-300';
  const getVentaEstadoClasses = (estado) => {
    const normalized = (estado || '').toLowerCase();
    const darkBase = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide shadow-sm';
    const lightBase = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide';
    const darkVariants = {
      completada: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
      pendiente: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
      anulada: 'border-rose-400/40 bg-rose-500/15 text-rose-200',
    };
    const lightVariants = {
      completada: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      pendiente: 'border-amber-200 bg-amber-50 text-amber-700',
      anulada: 'border-rose-200 bg-rose-50 text-rose-700',
    };
    const defaultDark = 'border-slate-600 bg-slate-800/80 text-slate-200';
    const defaultLight = 'border-gray-200 bg-gray-100 text-gray-700';

    return `${isDarkMode ? darkBase : lightBase} ${((isDarkMode ? darkVariants : lightVariants)[normalized]) || (isDarkMode ? defaultDark : defaultLight)}`;
  };

  const getStockBadgeClasses = (stock) => {
    const isCritical = Number(stock) <= 1;
    const darkVariant = isCritical ? 'border-rose-400/40 bg-rose-500/20 text-rose-200' : 'border-amber-400/40 bg-amber-500/20 text-amber-200';
    const lightVariant = isCritical ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-amber-200 bg-amber-50 text-amber-700';
    const base = isDarkMode
      ? 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide shadow-sm'
      : 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide';

    return `${base} ${isDarkMode ? darkVariant : lightVariant}`;
  };
  const todayIso = new Date().toISOString().substring(0, 10);

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={`mt-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Bienvenido, {user?.name}. Aquí puedes gestionar tu ferretería.
          </p>
          {error && (
            <div className={`mt-4 border px-4 py-3 rounded transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg shadow-lg p-6 transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ventas Hoy</p>
                <p className={`text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loading ? '...' : stats.ventasHoy}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-lg p-6 transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ingresos Hoy</p>
                <p className={`text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loading ? '...' : formatCurrency(stats.ingresosHoy)}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-lg p-6 transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Productos</p>
                <p className={`text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loading ? '...' : stats.totalProductos}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-lg p-6 transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clientes únicos</p>
                <p className={`text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loading ? '...' : (stats.clientesUnicos || stats.totalClientes)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`group relative overflow-hidden rounded-[20px] px-5 py-5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDarkMode
                  ? `${action.cardDark} text-slate-100 focus:ring-slate-500 focus:ring-offset-slate-900`
                  : `${action.cardLight} text-slate-900 focus:ring-sky-300 focus:ring-offset-white`
              }`}
            >
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-md ${
                      isDarkMode ? action.iconDark : action.iconLight
                    }`}
                  >
                    {action.icon}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      isDarkMode ? action.badgeDark : action.badgeLight
                    }`}
                  >
                    Acción rápida
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight drop-shadow-sm">{action.label}</h3>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-100/80' : 'text-slate-600'}`}>{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Ventas Recientes y Productos Bajos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas Recientes */}
          <div
            className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 shadow-[0_25px_80px_rgba(2,6,23,0.45)] transition-all duración-300 ${
              isDarkMode
                ? 'border-slate-700/60 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-850/80'
                : 'border-slate-100 bg-gradient-to-br from-white via-sky-50/80 to-indigo-50/85'
            }`}
          >
            <div className="pointer-events-none absolute -top-28 -right-20 h-60 w-60 rounded-full bg-sky-500/20 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-6rem] left-[-4rem] h-64 w-64 rounded-full bg-indigo-500/15 blur-[120px]" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Ventas Recientes</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Últimos movimientos registrados</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
                    isDarkMode ? 'border-white/15 bg-white/10 text-sky-200' : 'border-sky-200 bg-sky-100 text-sky-700'
                  }`}
                >
                  {ventasRecientes.length} ventas
                </span>
              </div>

              {loading ? (
                <div
                  className={`rounded-2xl border px-4 py-6 text-center text-sm ${
                    isDarkMode ? 'border-white/10 bg-white/5 text-slate-300' : 'border-sky-100 bg-white/80 text-slate-500'
                  }`}
                >
                  Cargando ventas recientes...
                </div>
              ) : ventasRecientes.length > 0 ? (
                <div className="space-y-4">
                  {ventasRecientes.map((venta) => {
                    const fecha = venta.created_at ? new Date(venta.created_at) : null;
                    return (
                      <div
                        key={venta.id}
                        className={`group relative flex items-center justify-between rounded-2xl border px-4 py-3 sm:px-5 sm:py-4 transition-all duration-200 ${
                          isDarkMode
                            ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 shadow-[0_12px_30px_rgba(2,6,23,0.45)]'
                            : 'border-slate-100 bg-white/90 hover:border-sky-200 hover:bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold ${
                              isDarkMode ? 'border-sky-400/40 bg-sky-500/15 text-sky-200' : 'border-sky-200 bg-sky-100 text-sky-700'
                            }`}
                          >
                            #{venta.id}
                          </div>
                          <div>
                            <p className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {venta.cliente_nombre || 'Cliente sin nombre'}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {fecha ? fecha.toLocaleDateString('es-PE') : 'Fecha desconocida'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-emerald-200' : 'text-emerald-600'}`}>
                            {formatCurrency(venta.total)}
                          </p>
                          <span className={getVentaEstadoClasses(venta.estado)}>{venta.estado || 'Sin estado'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={`rounded-2xl border px-4 py-6 text-center text-sm ${
                    isDarkMode ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  No hay ventas recientes registradas.
                </div>
              )}
            </div>
          </div>

          {/* Productos Bajos */}
          <div
            className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 shadow-[0_25px_80px_rgba(80,20,50,0.35)] transition-all duración-300 ${
              isDarkMode
                ? 'border-rose-500/25 bg-gradient-to-br from-slate-950/92 via-rose-950/40 to-slate-900/85'
                : 'border-rose-100 bg-gradient-to-br from-white via-rose-50/80 to-amber-50/80'
            }`}
          >
            <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-rose-500/25 blur-[120px]" />
            <div className="pointer-events-none absoluta bottom-[-5rem] left-[-3rem] h-60 w-60 rounded-full bg-amber-400/20 blur-[120px]" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-rose-100' : 'text-rose-700'}`}>Productos con stock bajo</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-rose-200/70' : 'text-rose-500/80'}`}>
                    Controla los artículos que necesitan reposición
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
                    isDarkMode ? 'border-rose-400/40 bg-rose-500/15 text-rose-200' : 'border-rose-200 bg-rose-100 text-rose-600'
                  }`}
                >
                  {productosBajos.length} productos
                </span>
              </div>

              {loading ? (
                <div
                  className={`rounded-2xl border px-4 py-6 text-center text-sm ${
                    isDarkMode ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-rose-100 bg-rose-50 text-rose-500'
                  }`}
                >
                  Cargando productos con stock bajo...
                </div>
              ) : productosBajos.length > 0 ? (
                <div className="space-y-4">
                  {productosBajos.map((producto) => (
                    <div
                      key={producto.id}
                      className={`group relative flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 sm:px-5 sm:py-4 transition-all duration-200 ${
                        isDarkMode
                          ? 'border-rose-400/25 bg-rose-500/10 hover:border-rose-400/40 hover:bg-rose-500/15 shadow-[0_12px_28px_rgba(80,20,50,0.35)]'
                          : 'border-rose-100 bg-rose-50/90 hover:border-rose-200 hover:bg-rose-50 shadow-[0_20px_35px_rgba(244,63,94,0.18)]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold ${
                            isDarkMode ? 'border-rose-400/50 bg-rose-500/20 text-rose-100' : 'border-rose-200 bg-rose-100 text-rose-600'
                          }`}
                        >
                          {producto.stock}
                        </div>
                        <div>
                          <p className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {producto.nombre}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {producto.categoria?.nombre || 'Sin categoría'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <span className={getStockBadgeClasses(producto.stock)}>Stock bajo</span>
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-rose-200/80' : 'text-rose-500/80'}`}>Actualiza inventario</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`rounded-2xl border px-4 py-6 text-center text-sm ${
                    isDarkMode ? 'border-rose-400/25 bg-rose-500/10 text-rose-200' : 'border-rose-100 bg-rose-50 text-rose-500'
                  }`}
                >
                  Todos los productos tienen stock suficiente.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;