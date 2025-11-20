// Servicio para manejar productos en el chatbot
const getApiBaseUrl = () => {
  let baseUrl;
  
  if (process.env.NODE_ENV === 'production') {
    baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
  } else {
    baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }
  
  // Normalizar: quitar barra final si existe
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Si ya termina en /api, devolver tal cual (sin añadir otro /api)
  if (baseUrl.endsWith('/api')) {
    console.log('🔧 API_BASE_URL (ya tiene /api):', baseUrl);
    return baseUrl;
  }
  
  // Si no tiene /api, añadirlo
  const finalUrl = `${baseUrl}/api`;
  console.log('🔧 API_BASE_URL (añadido /api):', finalUrl);
  return finalUrl;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔧 API_BASE_URL final:', API_BASE_URL);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

class ProductService {
  // Buscar productos
  async buscarProductos(query, categoria = '', precioMin = 0, precioMax = 999999) {
    try {
      const params = new URLSearchParams({
        q: query,
        categoria: categoria,
        precio_min: precioMin,
        precio_max: precioMax
      });
      
      const response = await fetch(`${API_BASE_URL}/catalogo/buscar?${params}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          productos: data.data,
          total: data.total,
          query: data.query
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error en la búsqueda'
        };
      }
    } catch (error) {
      console.error('Error buscando productos:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Obtener todas las categorías
  async obtenerCategorias() {
    try {
      const response = await fetch(`${API_BASE_URL}/catalogo/categorias`);
      const data = await response.json();
      
      if (data.success) {
        return { 
            success: true, 
          categorias: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener categorías'
        };
      }
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Obtener productos por categoría
  async obtenerProductosPorCategoria(categoria) {
    try {
      const response = await fetch(`${API_BASE_URL}/catalogo/buscar?categoria=${encodeURIComponent(categoria)}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          productos: data.data,
          total: data.total
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener productos'
        };
      }
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Obtener productos destacados
  async obtenerProductosDestacados() {
    try {
      const response = await fetch(`${API_BASE_URL}/catalogo/productos`);
      const data = await response.json();
      
      if (data.success) {
        // Tomar los primeros 6 productos como destacados
        const destacados = data.data.slice(0, 6);
        return {
          success: true,
          productos: destacados
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener productos destacados'
        };
      }
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Agregar producto al carrito (requiere autenticación)
  async agregarAlCarrito(productoId, cantidad = 1) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
      return {
        success: false,
          message: 'Debes iniciar sesión para agregar productos al carrito'
        };
      }

      const response = await fetch(`${API_BASE_URL}/carrito`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          producto_id: productoId,
          cantidad: cantidad
        })
      });

      const data = await response.json();
      
      if (data.success) {
      return {
          success: true,
          message: 'Producto agregado al carrito'
        };
      } else {
      return {
        success: false,
          message: data.message || 'Error al agregar al carrito'
        };
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Formatear precio para mostrar
  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }

  // Formatear descripción para mostrar en el chat
  formatearDescripcion(descripcion, maxLength = 100) {
    if (!descripcion) return 'Sin descripción';
    if (descripcion.length <= maxLength) return descripcion;
    return descripcion.substring(0, maxLength) + '...';
  }

  // Método para obtener categorías reales
  async obtenerCategorias() {
    try {
      const response = await this.api.get('/catalogo/categorias');
      if (response.data.success) {
        return {
          success: true,
          categorias: response.data.data,
          total: response.data.data.length
        };
      }
      return { success: false, categorias: [], total: 0 };
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return { success: false, categorias: [], total: 0 };
    }
  }

  // Método para obtener productos destacados
  async obtenerProductosDestacados() {
    try {
      const response = await this.api.get('/catalogo/productos');
      if (response.data.success) {
        // Tomar los primeros 6 productos como destacados
        const productosDestacados = response.data.data.slice(0, 6);
        return {
          success: true,
          productos: productosDestacados,
          total: productosDestacados.length
        };
      }
      return { success: false, productos: [], total: 0 };
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      return { success: false, productos: [], total: 0 };
    }
  }

  // ========== MÉTODOS PARA GESTIÓN DE INVENTARIO ==========
  
  // Obtener todos los productos (para inventario)
  async getAllProducts() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/productos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          productos: data.data || []
        };
      }
      return {
        success: false,
        error: data.message || 'Error al obtener productos',
        productos: []
      };
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return {
        success: false,
        error: 'Error de conexión',
        productos: []
      };
    }
  }

  // Obtener todas las categorías (para inventario)
  async getAllCategorias() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categorias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data || []
        };
      }
      return {
        success: false,
        error: data.message || 'Error al obtener categorías',
        data: []
      };
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return {
        success: false,
        error: 'Error de conexión',
        data: []
      };
    }
  }

  // Crear producto
  async createProduct(productData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      
      return {
        success: data.success || false,
        data: data.data,
        error: data.message || (data.success ? null : 'Error al crear producto')
      };
    } catch (error) {
      console.error('Error creando producto:', error);
      return {
        success: false,
        error: 'Error de conexión al crear producto'
      };
    }
  }

  // Actualizar producto
  async updateProduct(productData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/productos/${productData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      
      return {
        success: data.success || false,
        data: data.data,
        error: data.message || (data.success ? null : 'Error al actualizar producto')
      };
    } catch (error) {
      console.error('Error actualizando producto:', error);
      return {
        success: false,
        error: 'Error de conexión al actualizar producto'
      };
    }
  }

  // Eliminar producto
  async deleteProduct(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      return {
        success: data.success || false,
        error: data.message || (data.success ? null : 'Error al eliminar producto')
      };
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return {
        success: false,
        error: 'Error de conexión al eliminar producto'
      };
    }
  }

  // Crear categoría
  async createCategoria(categoriaData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(categoriaData)
      });
      const data = await response.json();
      
      return {
        success: data.success || false,
        data: data.data,
        error: data.message || (data.success ? null : 'Error al crear categoría')
      };
    } catch (error) {
      console.error('Error creando categoría:', error);
      return {
        success: false,
        error: 'Error de conexión al crear categoría'
      };
    }
  }

  // Actualizar categoría
  async updateCategoria(categoriaData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categorias/${categoriaData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(categoriaData)
      });
      const data = await response.json();
      
      return {
        success: data.success || false,
        data: data.data,
        error: data.message || (data.success ? null : 'Error al actualizar categoría')
      };
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      return {
        success: false,
        error: 'Error de conexión al actualizar categoría'
      };
    }
  }

  // Eliminar categoría
  async deleteCategoria(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      return {
        success: data.success || false,
        error: data.message || (data.success ? null : 'Error al eliminar categoría')
      };
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      return {
        success: false,
        error: 'Error de conexión al eliminar categoría'
      };
    }
  }

  // Subir imagen de producto
  async uploadImage(file) {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('imagen', file);
      
      console.log('📤 Subiendo imagen a:', `${API_BASE_URL}/productos/upload`);
      console.log('📁 Archivo:', file.name, 'Tamaño:', file.size);
      
      const response = await fetch(`${API_BASE_URL}/productos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
          // NO incluir 'Content-Type' para FormData, el navegador lo hace automáticamente
        },
        body: formData
      });
      
      console.log('📥 Respuesta del servidor:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, data);
        return {
          success: false,
          error: data.message || `Error ${response.status}: ${response.statusText}`
        };
      }
      
      return {
        success: data.success || false,
        data: data.data,
        error: data.message || (data.success ? null : 'Error al subir imagen')
      };
    } catch (error) {
      console.error('💥 Error completo subiendo imagen:', error);
      return {
        success: false,
        error: `Error de conexión al subir imagen: ${error.message}`
      };
    }
  }
}

const productService = new ProductService();
export { productService };
export default productService;