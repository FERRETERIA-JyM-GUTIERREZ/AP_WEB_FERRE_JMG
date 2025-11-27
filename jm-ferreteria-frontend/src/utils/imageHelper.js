import { getBackendBaseUrl } from '../services/api';

/**
 * Obtiene la URL completa de una imagen de producto
 * Soporta URLs de Cloudinary (completas) y rutas relativas
 */
export const getProductImageUrl = (imagen) => {
  if (!imagen) return null;
  
  // Si ya es una URL completa (Cloudinary), devolverla tal cual
  if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
    return imagen;
  }
  
  // Si es una ruta relativa, construir URL completa
  return `${getBackendBaseUrl()}/img_productos/${imagen}`;
};

