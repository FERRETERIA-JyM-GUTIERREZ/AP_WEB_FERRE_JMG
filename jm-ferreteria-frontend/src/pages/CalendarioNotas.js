import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import calendarioNotasService, { TIPOS_EVENTO, COLORES_EVENTO, CATEGORIAS_NOTA } from '../services/calendarioNotasService';
import toast from 'react-hot-toast';

const CalendarioNotas = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // Estados del calendario
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  
  // Estados de notas
  const [notas, setNotas] = useState([]);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [busquedaNotas, setBusquedaNotas] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  
  // Estados de formularios
  const [formEvento, setFormEvento] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    tipo: TIPOS_EVENTO.GENERAL,
    productoId: null
  });
  
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
    setEventos(calendarioNotasService.getEventos());
    setNotas(calendarioNotasService.getNotas());
  };

  // ============ FUNCIONES DEL CALENDARIO ============

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay();

    const dias = [];
    
    // Días del mes anterior (para completar la primera semana)
    for (let i = diaInicio - 1; i >= 0; i--) {
      const fecha = new Date(año, mes, -i);
      dias.push({ fecha, esDelMes: false });
    }
    
    // Días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(año, mes, i);
      dias.push({ fecha, esDelMes: true });
    }
    
    // Días del mes siguiente (para completar la última semana)
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(año, mes + 1, i);
      dias.push({ fecha, esDelMes: false });
    }
    
    return dias;
  };

  const formatearFecha = (fecha) => {
    return fecha.toISOString().split('T')[0];
  };

  const obtenerEventosDelDia = (fecha) => {
    const fechaStr = formatearFecha(fecha);
    return eventos.filter(e => e.fecha === fechaStr);
  };

  const cambiarMes = (direccion) => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + direccion, 1));
  };

  const irAHoy = () => {
    setFechaActual(new Date());
  };

  const abrirModalEvento = (fecha = null, evento = null) => {
    if (evento) {
      setEventoSeleccionado(evento);
      setFormEvento({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        fecha: evento.fecha || '',
        tipo: evento.tipo || TIPOS_EVENTO.GENERAL,
        productoId: evento.productoId || null
      });
    } else {
      setEventoSeleccionado(null);
      setFormEvento({
        titulo: '',
        descripcion: '',
        fecha: fecha ? formatearFecha(fecha) : formatearFecha(new Date()),
        tipo: TIPOS_EVENTO.GENERAL,
        productoId: null
      });
    }
    setFechaSeleccionada(fecha);
    setShowEventoModal(true);
  };

  const cerrarModalEvento = () => {
    setShowEventoModal(false);
    setEventoSeleccionado(null);
    setFechaSeleccionada(null);
    setFormEvento({
      titulo: '',
      descripcion: '',
      fecha: '',
      tipo: TIPOS_EVENTO.GENERAL,
      productoId: null
    });
  };

  const guardarEvento = () => {
    if (!formEvento.titulo || !formEvento.fecha) {
      toast.error('El título y la fecha son obligatorios');
      return;
    }

    if (eventoSeleccionado) {
      calendarioNotasService.updateEvento(eventoSeleccionado.id, formEvento);
      toast.success('Evento actualizado');
    } else {
      calendarioNotasService.addEvento(formEvento);
      toast.success('Evento creado');
    }
    
    cargarDatos();
    cerrarModalEvento();
  };

  const eliminarEvento = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este evento?')) {
      calendarioNotasService.deleteEvento(id);
      toast.success('Evento eliminado');
      cargarDatos();
      cerrarModalEvento();
    }
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

  // Filtrar notas
  const notasFiltradas = notas.filter(nota => {
    const coincideBusqueda = !busquedaNotas || 
      nota.titulo?.toLowerCase().includes(busquedaNotas.toLowerCase()) ||
      nota.contenido?.toLowerCase().includes(busquedaNotas.toLowerCase());
    
    const coincideCategoria = !filtroCategoria || nota.categoria === filtroCategoria;
    
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            📅 Calendario y Notas Temporales
          </h1>
          <p className={`mt-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Gestiona tus eventos y notas personales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ============ CALENDARIO ============ */}
          <div className={`rounded-xl shadow-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Calendario
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => cambiarMes(-1)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={irAHoy}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => cambiarMes(1)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className={`text-lg font-semibold text-center transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </h3>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {diasSemana.map((dia, idx) => (
                <div
                  key={idx}
                  className={`text-center text-xs font-semibold py-2 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {obtenerDiasDelMes().map((dia, idx) => {
                const eventosDelDia = obtenerEventosDelDia(dia.fecha);
                const esHoy = formatearFecha(dia.fecha) === formatearFecha(new Date());
                
                return (
                  <button
                    key={idx}
                    onClick={() => abrirModalEvento(dia.fecha)}
                    className={`
                      aspect-square p-1 rounded-lg transition-all duration-200
                      ${dia.esDelMes 
                        ? isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                        : isDarkMode 
                          ? 'bg-slate-800/50 text-gray-600' 
                          : 'bg-gray-50 text-gray-400'
                      }
                      ${esHoy ? 'ring-2 ring-orange-500' : ''}
                      hover:scale-105
                    `}
                  >
                    <div className="text-xs font-semibold mb-1">
                      {dia.fecha.getDate()}
                    </div>
                    {eventosDelDia.length > 0 && (
                      <div className="flex gap-0.5 justify-center">
                        {eventosDelDia.slice(0, 3).map((evento, eIdx) => (
                          <div
                            key={eIdx}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: COLORES_EVENTO[evento.tipo] || COLORES_EVENTO[TIPOS_EVENTO.GENERAL] }}
                            title={evento.titulo}
                          />
                        ))}
                        {eventosDelDia.length > 3 && (
                          <span className="text-xs">+{eventosDelDia.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lista de eventos del mes */}
            <div className="mt-6">
              <h4 className={`text-sm font-semibold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Eventos de {meses[fechaActual.getMonth()]}
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {eventos
                  .filter(e => {
                    const fechaEvento = new Date(e.fecha);
                    return fechaEvento.getMonth() === fechaActual.getMonth() &&
                           fechaEvento.getFullYear() === fechaActual.getFullYear();
                  })
                  .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                  .map(evento => (
                    <div
                      key={evento.id}
                      onClick={() => abrirModalEvento(null, evento)}
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                        isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      style={{ borderLeft: `4px solid ${COLORES_EVENTO[evento.tipo] || COLORES_EVENTO[TIPOS_EVENTO.GENERAL]}` }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {evento.titulo}
                          </p>
                          <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(evento.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: COLORES_EVENTO[evento.tipo] || COLORES_EVENTO[TIPOS_EVENTO.GENERAL] }}
                        >
                          {evento.tipo}
                        </span>
                      </div>
                    </div>
                  ))}
                {eventos.filter(e => {
                  const fechaEvento = new Date(e.fecha);
                  return fechaEvento.getMonth() === fechaActual.getMonth() &&
                         fechaEvento.getFullYear() === fechaActual.getFullYear();
                }).length === 0 && (
                  <p className={`text-sm text-center py-4 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    No hay eventos este mes
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ============ NOTAS ============ */}
          <div className={`rounded-xl shadow-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Notas Temporales
              </h2>
              <button
                onClick={() => abrirModalNota()}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Nota
              </button>
            </div>

            {/* Filtros de notas */}
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="Buscar notas..."
                value={busquedaNotas}
                onChange={(e) => setBusquedaNotas(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300'
                }`}
              />
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
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
            </div>

            {/* Lista de notas */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {notasFiltradas.length > 0 ? (
                notasFiltradas.map(nota => (
                  <div
                    key={nota.id}
                    onClick={() => abrirModalNota(nota)}
                    className={`p-4 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                      isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {nota.titulo}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
                    <p className={`text-sm transition-colors line-clamp-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {nota.contenido}
                    </p>
                    <p className={`text-xs mt-2 transition-colors ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {new Date(nota.fechaCreacion).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No hay notas aún</p>
                  <p className="text-sm mt-2">Crea tu primera nota haciendo clic en "Nueva Nota"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============ MODAL DE EVENTO ============ */}
        {showEventoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg shadow-lg p-6 w-full max-w-md relative transition-colors ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}>
              <button
                onClick={cerrarModalEvento}
                className={`absolute top-2 right-2 text-2xl transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                ×
              </button>
              <h2 className={`text-2xl font-bold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {eventoSeleccionado ? 'Editar Evento' : 'Nuevo Evento'}
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
                    value={formEvento.titulo}
                    onChange={(e) => setFormEvento({ ...formEvento, titulo: e.target.value })}
                    className={`w-full border rounded px-3 py-2 transition-colors ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Reabastecer martillos"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formEvento.fecha}
                    onChange={(e) => setFormEvento({ ...formEvento, fecha: e.target.value })}
                    className={`w-full border rounded px-3 py-2 transition-colors ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tipo
                  </label>
                  <select
                    value={formEvento.tipo}
                    onChange={(e) => setFormEvento({ ...formEvento, tipo: e.target.value })}
                    className={`w-full border rounded px-3 py-2 transition-colors ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    {Object.values(TIPOS_EVENTO).map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Descripción
                  </label>
                  <textarea
                    value={formEvento.descripcion}
                    onChange={(e) => setFormEvento({ ...formEvento, descripcion: e.target.value })}
                    rows="3"
                    className={`w-full border rounded px-3 py-2 transition-colors ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Detalles adicionales del evento..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {eventoSeleccionado && (
                    <button
                      onClick={() => eliminarEvento(eventoSeleccionado.id)}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                  <button
                    onClick={cerrarModalEvento}
                    className={`px-4 py-2 rounded transition-colors ${
                      isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarEvento}
                    className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ MODAL DE NOTA ============ */}
        {showNotaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg shadow-lg p-6 w-full max-w-md relative transition-colors ${
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
              <h2 className={`text-2xl font-bold mb-4 transition-colors ${
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
                    rows="5"
                    className={`w-full border rounded px-3 py-2 transition-colors ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="Escribe tu nota aquí..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {notaSeleccionada && (
                    <button
                      onClick={() => eliminarNota(notaSeleccionada.id)}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                  <button
                    onClick={cerrarModalNota}
                    className={`px-4 py-2 rounded transition-colors ${
                      isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarNota}
                    className="px-4 py-2 rounded bg-pink-500 text-white hover:bg-pink-600 transition-colors"
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

export default CalendarioNotas;

