import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RolePermissionInfo from '../components/RolePermissionInfo';
import ReportChart from '../components/ReportChart';

const Reportes = () => {
  const { token, hasPermission, canViewReports } = useAuth();
  const { isDarkMode } = useTheme();
  const [reporteSeleccionado, setReporteSeleccionado] = useState('ventas');
  const [periodo, setPeriodo] = useState('hoy');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  const reportes = [
    {
      id: 'ventas',
      nombre: 'Reporte de Ventas',
      descripcion: 'Análisis detallado de ventas por período',
      icono: '📊'
    },
    {
      id: 'productos',
      nombre: 'Reporte de Productos',
      descripcion: 'Inventario y rendimiento de productos',
      icono: '📦'
    },
    {
      id: 'clientes',
      nombre: 'Reporte de Clientes',
      descripcion: 'Análisis de clientes y sus compras',
      icono: '👥'
    },
    {
      id: 'financiero',
      nombre: 'Reporte Financiero',
      descripcion: 'Balance e ingresos de la ferretería',
      icono: '💰'
    }
  ];

  // Función para generar reporte
  const generarReporte = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Generando reporte:', reporteSeleccionado);
      let params = new URLSearchParams();
      
      // Agregar parámetros según el período
      if (periodo === 'personalizado') {
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
      } else {
        params.append('periodo', periodo);
      }

      console.log('📊 Parámetros:', params.toString());

      let response;
      switch (reporteSeleccionado) {
        case 'ventas':
          response = await reportService.getSalesReport(params.toString());
          break;
        case 'productos':
          response = await reportService.getProductsReport(params.toString());
          break;
        case 'clientes':
          response = await reportService.getClientsReport(params.toString());
          break;
        case 'financiero':
          response = await reportService.getFinancialReport(params.toString());
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      console.log('📦 Respuesta del servidor:', response);

      if (response.data && response.data.success) {
        console.log('✅ Datos recibidos:', response.data.data);
        setReportData(response.data.data);
      } else {
        console.error('❌ Error en la respuesta:', response.data);
        setError(response.data?.message || 'Error al generar reporte');
      }
    } catch (err) {
      console.error('💥 Error completo:', err);
      setError('Error de conexión al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar PDF
  const exportarPDF = async () => {
    try {
      let params = new URLSearchParams();
      if (periodo === 'personalizado') {
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
      } else {
        params.append('periodo', periodo);
      }

      const response = await reportService.exportPDF(reporteSeleccionado, params.toString());
      
      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${reporteSeleccionado}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al exportar PDF');
      console.error('Error exportando PDF:', err);
    }
  };

  // Función para exportar Excel
  const exportarExcel = async () => {
    try {
      let params = new URLSearchParams();
      if (periodo === 'personalizado') {
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
      } else {
        params.append('periodo', periodo);
      }

      const response = await reportService.exportExcel(reporteSeleccionado, params.toString());
      
      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${reporteSeleccionado}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al exportar Excel');
      console.error('Error exportando Excel:', err);
    }
  };

  // Generar reporte automáticamente al cambiar de tipo
  useEffect(() => {
    if (token) {
      generarReporte();
    }
  }, [reporteSeleccionado]);

  // Verificar permisos después de todos los hooks
  if (!hasPermission('reportes.view')) {
    return (
      <div className={`min-h-screen py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-red-600 text-lg">
              No tienes permisos para acceder a los reportes.
            </p>
            <p className="text-red-500 mt-2">
              Contacta al administrador si necesitas acceso a esta funcionalidad.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Información de roles y permisos */}
        <RolePermissionInfo />
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reportes</h1>
          <p className={`mt-2 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Genera y visualiza reportes detallados de tu ferretería
          </p>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {reportes.map((reporte) => (
            <div
              key={reporte.id}
              className={`rounded-xl shadow-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                reporteSeleccionado === reporte.id
                  ? isDarkMode 
                    ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/40 border-2 border-blue-500/50 shadow-xl shadow-blue-500/20' 
                    : 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 shadow-xl'
                  : isDarkMode
                    ? 'bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-800/90 border border-slate-700/50 hover:border-slate-600 hover:shadow-xl'
                    : 'bg-white border border-gray-200 hover:shadow-xl hover:border-blue-300'
              }`}
              onClick={() => setReporteSeleccionado(reporte.id)}
            >
              <div className="flex items-center">
                <div className={`text-2xl sm:text-3xl mr-3 sm:mr-4 transition-transform duration-300 ${reporteSeleccionado === reporte.id ? 'scale-110' : ''}`}>{reporte.icono}</div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm sm:text-lg font-bold truncate transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {reporte.nombre}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 line-clamp-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {reporte.descripcion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`rounded-xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 border border-slate-700/50 hover:border-slate-600/70' : 'bg-white hover:shadow-lg border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className={`text-base sm:text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Configurar Reporte
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Período
              </label>
              <div className="relative">
                <select 
                  className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500/50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta Semana</option>
                  <option value="mes">Este Mes</option>
                  <option value="trimestre">Este Trimestre</option>
                  <option value="anio">Este Año</option>
                  <option value="personalizado">Personalizado</option>
                </select>
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Desde
              </label>
              <div className="relative">
                <input
                  type="date"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500/50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  disabled={periodo !== 'personalizado'}
                />
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Hasta
              </label>
              <div className="relative">
                <input
                  type="date"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500/50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  disabled={periodo !== 'personalizado'}
                />
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-end">
              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 sm:px-4 py-2.5 text-sm rounded-lg font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={generarReporte}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Generar Reporte
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 sm:mb-6 border px-3 sm:px-4 py-3 rounded text-sm transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* Report Content */}
        {reportData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-1">
                <div className={`rounded-xl shadow-xl p-4 sm:p-6 transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 border border-slate-700/50 hover:border-slate-600/70' : 'bg-white hover:shadow-lg border border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className={`text-base sm:text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Resumen
                    </h3>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {reporteSeleccionado === 'ventas' && reportData.stats && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Ventas</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.total_ventas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ingresos</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>S/ {Number(reportData.stats.ingresos_totales).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Productos Vendidos</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.productos_vendidos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clientes Únicos</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.clientes_unicos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promedio Venta</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>S/ {Number(reportData.stats.promedio_venta).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {reporteSeleccionado === 'productos' && reportData.stats && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Productos</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.total_productos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Con Stock</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{reportData.stats.productos_con_stock}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sin Stock</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{reportData.stats.productos_sin_stock}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock Bajo</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{reportData.stats.productos_stock_bajo}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Valor Inventario</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>S/ {Number(reportData.stats.valor_inventario).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {reporteSeleccionado === 'clientes' && reportData.stats && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Clientes</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.total_clientes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clientes Nuevos</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{reportData.stats.clientes_nuevos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Ventas</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{reportData.stats.total_ventas_clientes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promedio Compra</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>S/ {Number(reportData.stats.promedio_compra_cliente).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {reporteSeleccionado === 'financiero' && reportData.stats && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ingresos Totales</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>S/ {Number(reportData.stats.ingresos_totales).toFixed(2)}</span>
                        </div>
                <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Ventas</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.ventas_totales}</span>
                </div>
                <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ventas Anuladas</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{reportData.stats.ventas_anuladas}</span>
                </div>
                <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promedio Venta</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>S/ {Number(reportData.stats.promedio_venta).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Valor Inventario</span>
                          <span className={`font-semibold text-sm sm:text-base transition-colors ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>S/ {Number(reportData.stats.valor_inventario).toFixed(2)}</span>
                </div>
                      </>
                    )}
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="lg:col-span-2">
                <div className={`rounded-xl shadow-xl p-4 sm:p-6 transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 border border-slate-700/50 hover:border-slate-600/70' : 'bg-white hover:shadow-lg border border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className={`text-base sm:text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Gráfico de {reporteSeleccionado === 'ventas' ? 'Ventas' : reporteSeleccionado === 'productos' ? 'Productos' : reporteSeleccionado === 'clientes' ? 'Clientes' : 'Financiero'}
                    </h3>
                  </div>
                  <ReportChart 
                    tipo={reporteSeleccionado} 
                    data={reportData} 
                    loading={loading}
                  />
            </div>
          </div>
        </div>

        {/* Detailed Table */}
            <div className="mt-4 sm:mt-6">
          <div className={`rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-slate-800/90 border border-slate-700/50 hover:border-slate-600' : 'bg-white hover:shadow-lg'}`}>
                <div className={`px-3 sm:px-6 py-3 sm:py-4 border-b transition-colors ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className={`text-base sm:text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Detalle de {reporteSeleccionado === 'ventas' ? 'Ventas' : reporteSeleccionado === 'productos' ? 'Productos' : reporteSeleccionado === 'clientes' ? 'Clientes' : 'Financiero'}
                    </h3>
                  </div>
            </div>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y transition-colors ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                <thead className={`transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-slate-700/80 via-slate-700/60 to-slate-700/80 border-b-2 border-slate-600/50' : 'bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-200'}`}>
                      {reporteSeleccionado === 'ventas' && (
                  <tr>
                          <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Fecha
                            </div>
                    </th>
                          <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              Venta #
                            </div>
                    </th>
                          <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Cliente
                            </div>
                    </th>
                          <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              Productos
                            </div>
                    </th>
                          <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Total
                            </div>
                    </th>
                  </tr>
                      )}
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'bg-slate-800 divide-slate-700/50' : 'bg-white divide-gray-200'}`}>
                      {reporteSeleccionado === 'ventas' && reportData.detalle_ventas && (
                        reportData.detalle_ventas.map((venta, index) => (
                          <tr 
                            key={venta.id} 
                            className={`transition-all duration-200 hover:shadow-md ${
                              isDarkMode 
                                ? index % 2 === 0 
                                  ? 'bg-slate-800/80 hover:bg-slate-700/80 border-l-4 border-transparent hover:border-blue-500/50' 
                                  : 'bg-slate-800/50 hover:bg-slate-700/60 border-l-4 border-transparent hover:border-blue-500/50'
                                : index % 2 === 0 
                                  ? 'bg-white hover:bg-blue-50/30 border-l-4 border-transparent hover:border-blue-300' 
                                  : 'bg-gray-50/80 hover:bg-blue-50/40 border-l-4 border-transparent hover:border-blue-300'
                            }`}
                          >
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              <div className="flex items-center gap-2">
                                <svg className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">{new Date(venta.fecha).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              <span className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                {venta.numero || venta.id || 'N/A'}
                              </span>
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                    {venta.cliente_nombre?.charAt(0).toUpperCase() || 'C'}
                                  </span>
                                </div>
                                <span className="font-medium">{venta.cliente_nombre || 'Sin cliente'}</span>
                              </div>
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                {venta.productos_count} items
                              </span>
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-bold transition-colors ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/50' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                S/ {Number(venta.total).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Export Options */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              {hasPermission('reportes.export') && (
                <button 
                  className="w-full sm:w-auto bg-white text-red-600 px-4 sm:px-6 py-2.5 text-sm rounded-lg font-bold hover:bg-red-50 border-2 border-red-600 hover:border-red-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 flex items-center justify-center gap-2"
                  onClick={exportarPDF}
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Exportar PDF
                </button>
              )}
              {hasPermission('reportes.export') && (
                <button 
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-500 text-white px-4 sm:px-6 py-2.5 text-sm rounded-lg font-semibold hover:from-green-500 hover:to-green-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  onClick={exportarExcel}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar CSV
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reportes; 