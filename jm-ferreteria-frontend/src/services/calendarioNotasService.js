/**
 * Servicio para gestionar calendario y notas temporales
 * Almacena todo en localStorage (sin base de datos)
 * Configurado para zona horaria de Perú (America/Lima)
 */

const STORAGE_KEY_EVENTOS = 'calendario_eventos';
const STORAGE_KEY_NOTAS = 'calendario_notas';

// Zona horaria de Perú
const ZONA_HORARIA_PERU = 'America/Lima';

/**
 * Obtener fecha y hora actual de Perú
 */
export const obtenerFechaHoraPeru = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: ZONA_HORARIA_PERU }));
};

/**
 * Formatear fecha a string en formato YYYY-MM-DD usando zona horaria de Perú
 */
export const formatearFechaPeru = (fecha) => {
  if (!fecha) return '';
  
  // Si es un string, convertirlo a Date
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  // Obtener la fecha en zona horaria de Perú
  const fechaPeru = new Date(fechaObj.toLocaleString('en-US', { timeZone: ZONA_HORARIA_PERU }));
  
  const año = fechaPeru.getFullYear();
  const mes = String(fechaPeru.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaPeru.getDate()).padStart(2, '0');
  
  return `${año}-${mes}-${dia}`;
};

/**
 * Formatear fecha y hora completa de Perú
 */
export const formatearFechaHoraPeru = (fecha) => {
  if (!fecha) return '';
  
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const fechaPeru = new Date(fechaObj.toLocaleString('en-US', { timeZone: ZONA_HORARIA_PERU }));
  
  return fechaPeru.toLocaleString('es-PE', {
    timeZone: ZONA_HORARIA_PERU,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Tipos de eventos
export const TIPOS_EVENTO = {
  REABASTECIMIENTO: 'reabastecimiento',
  PROMOCION: 'promocion',
  TAREA: 'tarea',
  RECORDATORIO: 'recordatorio',
  GENERAL: 'general'
};

// Colores por tipo de evento
export const COLORES_EVENTO = {
  [TIPOS_EVENTO.REABASTECIMIENTO]: '#ef4444', // rojo
  [TIPOS_EVENTO.PROMOCION]: '#f97316', // naranja
  [TIPOS_EVENTO.TAREA]: '#3b82f6', // azul
  [TIPOS_EVENTO.RECORDATORIO]: '#eab308', // amarillo
  [TIPOS_EVENTO.GENERAL]: '#8b5cf6' // morado
};

// Categorías de notas
export const CATEGORIAS_NOTA = {
  URGENTE: 'urgente',
  RECORDATORIO: 'recordatorio',
  GENERAL: 'general',
  INVENTARIO: 'inventario'
};

class CalendarioNotasService {
  // ============ EVENTOS ============
  
  /**
   * Obtener todos los eventos
   */
  getEventos() {
    try {
      const eventos = localStorage.getItem(STORAGE_KEY_EVENTOS);
      return eventos ? JSON.parse(eventos) : [];
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      return [];
    }
  }

  /**
   * Guardar eventos
   */
  saveEventos(eventos) {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTOS, JSON.stringify(eventos));
      return true;
    } catch (error) {
      console.error('Error al guardar eventos:', error);
      return false;
    }
  }

  /**
   * Agregar un nuevo evento
   */
  addEvento(evento) {
    const eventos = this.getEventos();
    const fechaPeru = obtenerFechaHoraPeru();
    const nuevoEvento = {
      id: this.generateId(),
      ...evento,
      fechaCreacion: fechaPeru.toISOString(),
      fechaActualizacion: fechaPeru.toISOString()
    };
    eventos.push(nuevoEvento);
    this.saveEventos(eventos);
    return nuevoEvento;
  }

  /**
   * Actualizar un evento
   */
  updateEvento(id, datosActualizados) {
    const eventos = this.getEventos();
    const index = eventos.findIndex(e => e.id === id);
    if (index !== -1) {
      const fechaPeru = obtenerFechaHoraPeru();
      eventos[index] = {
        ...eventos[index],
        ...datosActualizados,
        fechaActualizacion: fechaPeru.toISOString()
      };
      this.saveEventos(eventos);
      return eventos[index];
    }
    return null;
  }

  /**
   * Eliminar un evento
   */
  deleteEvento(id) {
    const eventos = this.getEventos();
    const eventosFiltrados = eventos.filter(e => e.id !== id);
    this.saveEventos(eventosFiltrados);
    return eventosFiltrados.length < eventos.length;
  }

  /**
   * Obtener eventos por fecha
   */
  getEventosPorFecha(fecha) {
    const eventos = this.getEventos();
    return eventos.filter(e => e.fecha === fecha);
  }

  /**
   * Obtener eventos por rango de fechas
   */
  getEventosPorRango(fechaInicio, fechaFin) {
    const eventos = this.getEventos();
    return eventos.filter(e => {
      const fechaEvento = new Date(e.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return fechaEvento >= inicio && fechaEvento <= fin;
    });
  }

  // ============ NOTAS ============

  /**
   * Obtener todas las notas
   */
  getNotas() {
    try {
      const notas = localStorage.getItem(STORAGE_KEY_NOTAS);
      return notas ? JSON.parse(notas) : [];
    } catch (error) {
      console.error('Error al obtener notas:', error);
      return [];
    }
  }

  /**
   * Guardar notas
   */
  saveNotas(notas) {
    try {
      localStorage.setItem(STORAGE_KEY_NOTAS, JSON.stringify(notas));
      return true;
    } catch (error) {
      console.error('Error al guardar notas:', error);
      return false;
    }
  }

  /**
   * Agregar una nueva nota
   */
  addNota(nota) {
    const notas = this.getNotas();
    const fechaPeru = obtenerFechaHoraPeru();
    const nuevaNota = {
      id: this.generateId(),
      ...nota,
      fechaCreacion: fechaPeru.toISOString(),
      fechaActualizacion: fechaPeru.toISOString()
    };
    notas.push(nuevaNota);
    this.saveNotas(notas);
    return nuevaNota;
  }

  /**
   * Actualizar una nota
   */
  updateNota(id, datosActualizados) {
    const notas = this.getNotas();
    const index = notas.findIndex(n => n.id === id);
    if (index !== -1) {
      const fechaPeru = obtenerFechaHoraPeru();
      notas[index] = {
        ...notas[index],
        ...datosActualizados,
        fechaActualizacion: fechaPeru.toISOString()
      };
      this.saveNotas(notas);
      return notas[index];
    }
    return null;
  }

  /**
   * Eliminar una nota
   */
  deleteNota(id) {
    const notas = this.getNotas();
    const notasFiltradas = notas.filter(n => n.id !== id);
    this.saveNotas(notasFiltradas);
    return notasFiltradas.length < notas.length;
  }

  /**
   * Buscar notas por texto
   */
  buscarNotas(texto) {
    const notas = this.getNotas();
    const textoLower = texto.toLowerCase();
    return notas.filter(n => 
      n.titulo?.toLowerCase().includes(textoLower) ||
      n.contenido?.toLowerCase().includes(textoLower)
    );
  }

  /**
   * Obtener notas por categoría
   */
  getNotasPorCategoria(categoria) {
    const notas = this.getNotas();
    return notas.filter(n => n.categoria === categoria);
  }

  /**
   * Obtener notas por producto
   */
  getNotasPorProducto(productoId) {
    const notas = this.getNotas();
    return notas.filter(n => n.productoId === productoId);
  }

  // ============ UTILIDADES ============

  /**
   * Generar ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Limpiar todos los datos (útil para testing o reset)
   */
  clearAll() {
    localStorage.removeItem(STORAGE_KEY_EVENTOS);
    localStorage.removeItem(STORAGE_KEY_NOTAS);
  }

  /**
   * Exportar datos como JSON
   */
  exportarDatos() {
    return {
      eventos: this.getEventos(),
      notas: this.getNotas(),
      fechaExportacion: new Date().toISOString()
    };
  }

  /**
   * Importar datos desde JSON
   */
  importarDatos(datos) {
    if (datos.eventos) {
      this.saveEventos(datos.eventos);
    }
    if (datos.notas) {
      this.saveNotas(datos.notas);
    }
    return true;
  }
}

export const calendarioNotasService = new CalendarioNotasService();
export default calendarioNotasService;

