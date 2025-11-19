import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import calendarioNotasService, { CATEGORIAS_NOTA } from '../services/calendarioNotasService';
import { obtenerFechaHoraPeru, formatearFechaHoraPeru } from '../services/calendarioNotasService';
import toast from 'react-hot-toast';

const Notas = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // Estados de notas
  const [notas, setNotas] = useState([]);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [busquedaNotas, setBusquedaNotas] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha'); // fecha, titulo, categoria
  
  // Estados de formulario
  const [formNota, setFormNota] = useState({
    titulo: '',
    contenido: '',
    categoria: CATEGORIAS_NOTA.GENERAL,
    productoId: null
  });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setNotas(calendarioNotasService.getNotas());
  };

  // ============ FUNCIONES DE NOTAS ============

  const abrirModalNota = (nota = null) => {
    if (nota) {
      setNotaSeleccionada(nota);
      setFormNota({
        titulo: nota.titulo || '',
        contenido: nota.contenido || '',
        categoria: nota.categoria || CATEGORIAS_NOTA.GENERAL,
        productoId: nota.productoId || null
      });
    } else {
      setNotaSeleccionada(null);
      setFormNota({
        titulo: '',
        contenido: '',
        categoria: CATEGORIAS_NOTA.GENERAL,
        productoId: null
      });
    }
    setShowNotaModal(true);
  };

  const cerrarModalNota = () => {
    setShowNotaModal(false);
    setNotaSeleccionada(null);
    setFormNota({
      titulo: '',
      contenido: '',
      categoria: CATEGORIAS_NOTA.GENERAL,
      productoId: null
    });
  };

  const guardarNota = () => {
    if (!formNota.titulo) {
      toast.error('El título es obligatorio');
      return;
    }

    if (notaSeleccionada) {
      calendarioNotasService.updateNota(notaSeleccionada.id, formNota);
      toast.success('Nota actualizada');
    } else {
      calendarioNotasService.addNota(formNota);
      toast.success('Nota creada');
    }
    
    cargarDatos();
    cerrarModalNota();
  };

  const eliminarNota = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta nota?')) {
      calendarioNotasService.deleteNota(id);
      toast.success('Nota eliminada');
      cargarDatos();
    }
  };

  // Filtrar y ordenar notas
  const notasFiltradas = notas
    .filter(nota => {
      const coincideBusqueda = !busquedaNotas || 
        nota.titulo?.toLowerCase().includes(busquedaNotas.toLowerCase()) ||
        nota.contenido?.toLowerCase().includes(busquedaNotas.toLowerCase());
      
      const coincideCategoria = !filtroCategoria || nota.categoria === filtroCategoria;
      
      return coincideBusqueda && coincideCategoria;
    })
    .sort((a, b) => {
      switch (ordenarPor) {
        case 'titulo':
          return (a.titulo || '').localeCompare(b.titulo || '');
        case 'categoria':
          return (a.categoria || '').localeCompare(b.categoria || '');
        case 'fecha':
        default:
          return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
      }
    });

  // Obtener fecha y hora actual de Perú para mostrar
  const fechaHoraActual = obtenerFechaHoraPeru();
  const fechaActualStr = formatearFechaHoraPeru(fechaHoraActual);

  return (
    <div className={`min-h-screen py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            📝 Notas Temporales
          </h1>
          <p className={`mt-1 sm:mt-2 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Gestiona tus notas y recordatorios personales
          </p>
          <p className={`mt-1 text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Fecha y hora actual (Perú): {fechaActualStr}
          </p>
        </div>

        {/* Panel de Notas */}
        <div className={`rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h2 className={`text-lg sm:text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Mis Notas ({notasFiltradas.length})
            </h2>
            <button
              onClick={() => abrirModalNota()}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Nota
            </button>
          </div>

          {/* Filtros y búsqueda */}
          <div className="mb-4 space-y-2 sm:space-y-0 sm:flex sm:gap-3 lg:gap-4">
            <input
              type="text"
              placeholder="Buscar notas..."
              value={busquedaNotas}
              onChange={(e) => setBusquedaNotas(e.target.value)}
              className={`w-full sm:flex-1 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm sm:text-base ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`w-full sm:w-auto sm:min-w-[180px] px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm sm:text-base ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <option value="">Todas las categorías</option>
              {Object.values(CATEGORIAS_NOTA).map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              className={`w-full sm:w-auto sm:min-w-[150px] px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm sm:text-base ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <option value="fecha">Ordenar por fecha</option>
              <option value="titulo">Ordenar por título</option>
              <option value="categoria">Ordenar por categoría</option>
            </select>
          </div>

          {/* Lista de notas */}
          <div className="space-y-3 sm:space-y-4 max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] overflow-y-auto">
            {notasFiltradas.length > 0 ? (
              notasFiltradas.map(nota => (
                <div
                  key={nota.id}
                  onClick={() => abrirModalNota(nota)}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <h3 className={`font-semibold text-base sm:text-lg lg:text-xl transition-colors flex-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {nota.titulo}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      nota.categoria === CATEGORIAS_NOTA.URGENTE
                        ? 'bg-red-500 text-white'
                        : nota.categoria === CATEGORIAS_NOTA.RECORDATORIO
                        ? 'bg-yellow-500 text-white'
                        : nota.categoria === CATEGORIAS_NOTA.INVENTARIO
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-slate-600 text-gray-300'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {nota.categoria}
                    </span>
                  </div>
                  {nota.contenido && (
                    <p className={`text-sm sm:text-base lg:text-lg transition-colors line-clamp-2 sm:line-clamp-3 mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {nota.contenido}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <p className={`text-xs transition-colors ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {new Date(nota.fechaCreacion).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {nota.fechaActualizacion !== nota.fechaCreacion && (
                      <p className={`text-xs transition-colors ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        Editada
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-base sm:text-lg font-medium">No hay notas</p>
                <p className="text-sm mt-2">
                  {busquedaNotas || filtroCategoria 
                    ? 'No se encontraron notas con los filtros aplicados' 
                    : 'Crea tu primera nota haciendo clic en "Nueva Nota"'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Nota */}
        {showNotaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md relative transition-colors max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}>
              <button
                onClick={cerrarModalNota}
                className={`absolute top-2 right-2 text-2xl transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                ×
              </button>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {notaSeleccionada ? 'Editar Nota' : 'Nueva Nota'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formNota.titulo}
                    onChange={(e) => setFormNota({ ...formNota, titulo: e.target.value })}
                    className={`w-full border rounded px-3 py-2 transition-colors ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Título de la nota"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Categoría
                  </label>
                  <select
                    value={formNota.categoria}
                    onChange={(e) => setFormNota({ ...formNota, categoria: e.target.value })}
                    className={`w-full border rounded px-3 py-2 transition-colors ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    {Object.values(CATEGORIAS_NOTA).map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Contenido
                  </label>
                  <textarea
                    value={formNota.contenido}
                    onChange={(e) => setFormNota({ ...formNota, contenido: e.target.value })}
                    rows="6"
                    className={`w-full border rounded px-3 py-2 transition-colors ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Escribe tu nota aquí..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  {notaSeleccionada && (
                    <button
                      onClick={() => eliminarNota(notaSeleccionada.id)}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      Eliminar
                    </button>
                  )}
                  <button
                    onClick={cerrarModalNota}
                    className={`px-4 py-2 rounded transition-colors text-sm sm:text-base ${
                      isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarNota}
                    className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm sm:text-base"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notas;

