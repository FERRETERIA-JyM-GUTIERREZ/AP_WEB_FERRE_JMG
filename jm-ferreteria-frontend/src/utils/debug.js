// Utilidades para depurar la conexión con el backend
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || window.location.origin;
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

export const debugAPI = {
  async testConnection() {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/catalogo/productos`);
      const data = await response.json();
      console.log('✅ Conexión exitosa:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return { success: false, error: error.message };
    }
  },

  async testProductService() {
    try {
      const { productService } = await import('../services/productService');
      const result = await productService.getCatalog();
      console.log('✅ ProductService funcionando:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en ProductService:', error);
      return { success: false, error: error.message };
    }
  }
};

// Función para limpiar caché de imágenes
export const clearImageCache = () => {
  // Forzar recarga de imágenes
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.src) {
      const originalSrc = img.src;
      img.src = '';
      img.src = originalSrc;
    }
  });
};

// Función para forzar recarga de página
export const forceReload = () => {
  window.location.reload(true);
};

// Función para limpiar caché específico de logo
export const clearLogoCache = () => {
  const logoImages = document.querySelectorAll('img[src*="logo"]');
  logoImages.forEach(img => {
    const originalSrc = img.src;
    img.src = '';
    img.src = originalSrc;
  });
}; 