import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import calendarioNotasService, { TIPOS_EVENTO, COLORES_EVENTO } from '../services/calendarioNotasService';
import { obtenerFechaHoraPeru, formatearFechaPeru, formatearFechaHoraPeru } from '../services/calendarioNotasService';
import toast from 'react-hot-toast';

const Calendario = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // Estados del calendario
  const [fechaActual, setFechaActual] = useState(obtenerFechaHoraPeru());
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  
  // Estados de formulario
  const [formEvento, setFormEvento] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    tipo: TIPOS_EVENTO.GENERAL,
    productoId: null
  });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setEventos(calendarioNotasService.getEventos());
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

  const obtenerEventosDelDia = (fecha) => {
    const fechaStr = formatearFechaPeru(fecha);
    return eventos.filter(e => e.fecha === fechaStr);
  };

  const cambiarMes = (direccion) => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + direccion, 1));
  };

  const irAHoy = () => {
    setFechaActual(obtenerFechaHoraPeru());
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
        fecha: fecha ? formatearFechaPeru(fecha) : formatearFechaPeru(obtenerFechaHoraPeru()),
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

  // Obtener fecha y hora actual de Perú para mostrar
  const fechaHoraActual = obtenerFechaHoraPeru();
  const fechaActualStr = formatearFechaHoraPeru(fechaHoraActual);

  return (
    <div className={`min-h-screen py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            📅 Calendario
          </h1>
          <p className={`mt-1 sm:mt-2 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Gestiona tus eventos y recordatorios
          </p>
          <p className={`mt-1 text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Fecha y hora actual (Perú): {fechaActualStr}
          </p>
        </div>

        {/* Calendario */}
        <div className={`rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h2 className={`text-lg sm:text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Calendario
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => cambiarMes(-1)}
                className={`flex-1 sm:flex-none p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                aria-label="Mes anterior"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={irAHoy}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
              >
                Hoy
              </button>
              <button
                onClick={() => cambiarMes(1)}
                className={`flex-1 sm:flex-none p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                aria-label="Mes siguiente"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <h3 className={`text-base sm:text-lg font-semibold text-center transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
            </h3>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map((dia, idx) => (
              <div
                key={idx}
                className={`text-center text-xs font-semibold py-1 sm:py-2 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <span className="hidden sm:inline">{dia}</span>
                <span className="sm:hidden">{dia.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {obtenerDiasDelMes().map((dia, idx) => {
              const eventosDelDia = obtenerEventosDelDia(dia.fecha);
              const fechaHoy = formatearFechaPeru(obtenerFechaHoraPeru());
              const fechaDia = formatearFechaPeru(dia.fecha);
              const esHoy = fechaDia === fechaHoy;
              
              return (
                <button
                  key={idx}
                  onClick={() => abrirModalEvento(dia.fecha)}
                  className={`
                    aspect-square p-1 sm:p-2 rounded-lg transition-all duration-200 text-xs sm:text-sm
                    ${dia.esDelMes 
                      ? isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                      : isDarkMode 
                        ? 'bg-slate-800/50 text-gray-600' 
                        : 'bg-gray-50 text-gray-400'
                    }
                    ${esHoy ? 'ring-2 ring-orange-500 font-bold' : ''}
                    hover:scale-105 active:scale-95
                  `}
                >
                  <div className="font-semibold mb-0.5 sm:mb-1">
                    {dia.fecha.getDate()}
                  </div>
                  {eventosDelDia.length > 0 && (
                    <div className="flex gap-0.5 justify-center flex-wrap">
                      {eventosDelDia.slice(0, 2).map((evento, eIdx) => (
                        <div
                          key={eIdx}
                          className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full"
                          style={{ backgroundColor: COLORES_EVENTO[evento.tipo] || COLORES_EVENTO[TIPOS_EVENTO.GENERAL] }}
                          title={evento.titulo}
                        />
                      ))}
                      {eventosDelDia.length > 2 && (
                        <span className="text-[10px] sm:text-xs leading-none">+{eventosDelDia.length - 2}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lista de eventos del mes */}
          <div className="mt-4 sm:mt-6">
            <h4 className={`text-sm sm:text-base lg:text-lg font-semibold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Eventos de {meses[fechaActual.getMonth()]}
            </h4>
            <div className="space-y-2 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold transition-colors truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {evento.titulo}
                        </p>
                        <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(evento.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {evento.descripcion && (
                          <p className={`text-xs mt-1 transition-colors line-clamp-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {evento.descripcion}
                          </p>
                        )}
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-full text-white whitespace-nowrap"
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

        {/* Modal de Evento */}
        {showEventoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md relative transition-colors max-h-[90vh] overflow-y-auto ${
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
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 transition-colors ${
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
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  {eventoSeleccionado && (
                    <button
                      onClick={() => eliminarEvento(eventoSeleccionado.id)}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      Eliminar
                    </button>
                  )}
                  <button
                    onClick={cerrarModalEvento}
                    className={`px-4 py-2 rounded transition-colors text-sm sm:text-base ${
                      isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarEvento}
                    className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm sm:text-base"
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

export default Calendario;

