import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class FavoritosService {
  constructor() {
    this.isAuthenticated = false;
    this.userId = null;
  }

  // Inicializar el servicio con el estado del usuario
  init(isAuthenticated, userId) {
    this.isAuthenticated = isAuthenticated;
    this.userId = userId;
  }

  // Obtener favoritos (localStorage o API según el usuario)
  async getFavoritos() {
    if (this.isAuthenticated && this.userId) {
      return await this.getFavoritosFromAPI();
    } else {
      return this.getFavoritosFromLocalStorage();
    }
  }

  // Obtener favoritos de forma síncrona (más rápido para localStorage)
  getFavoritosSync() {
    if (this.isAuthenticated && this.userId) {
      // Para usuarios autenticados, devolver array vacío temporalmente
      // La carga real se hace de forma asíncrona
      return [];
    } else {
      return this.getFavoritosFromLocalStorage();
    }
  }

  // Obtener favoritos desde localStorage
  getFavoritosFromLocalStorage() {
    try {
      const favoritos = localStorage.getItem('favoritos_guest');
      return favoritos ? JSON.parse(favoritos) : [];
    } catch (error) {
      console.error('Error al cargar favoritos desde localStorage:', error);
      return [];
    }
  }

  // Obtener favoritos desde API
  async getFavoritosFromAPI() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        // Convertir formato de API a formato de localStorage
        return response.data.data.items.map(item => ({
          id: item.producto.id,
          nombre: item.producto.nombre,
          precio: item.producto.precio,
          descripcion: item.producto.descripcion,
          imagen: item.producto.imagen,
          categoria: item.producto.categoria,
          categoria_nombre: item.producto.categoria?.nombre,
          stock: item.producto.stock,
          activo: item.producto.activo
        }));
      }
      return [];
    } catch (error) {
      console.error('Error al cargar favoritos desde API:', error);
      return [];
    }
  }

  // Agregar a favoritos
  async addToFavoritos(producto) {
    if (this.isAuthenticated && this.userId) {
      return await this.addToFavoritosAPI(producto.id);
    } else {
      return this.addToFavoritosLocalStorage(producto);
    }
  }

  // Agregar a favoritos en localStorage
  addToFavoritosLocalStorage(producto) {
    try {
      console.log('➕ Agregando a localStorage:', producto);
      const favoritos = this.getFavoritosFromLocalStorage();
      console.log('➕ Favoritos actuales en localStorage:', favoritos);
      
      const exists = favoritos.find(fav => fav.id === producto.id);
      
      if (!exists) {
        const newFavoritos = [...favoritos, producto];
        localStorage.setItem('favoritos_guest', JSON.stringify(newFavoritos));
        console.log('✅ Agregado a localStorage:', newFavoritos);
        return { success: true, message: 'Agregado a favoritos' };
      } else {
        console.log('⚠️ Producto ya existe en favoritos');
        return { success: true, message: 'Producto ya estaba en favoritos' };
      }
    } catch (error) {
      console.error('Error al agregar a favoritos en localStorage:', error);
      return { success: false, message: 'Error al agregar a favoritos' };
    }
  }

  // Agregar a favoritos en API
  async addToFavoritosAPI(productoId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/wishlist`, {
        producto_id: productoId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al agregar a favoritos en API:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al agregar a favoritos' 
      };
    }
  }

  // Remover de favoritos
  async removeFromFavoritos(productoId) {
    if (this.isAuthenticated && this.userId) {
      return await this.removeFromFavoritosAPI(productoId);
    } else {
      return this.removeFromFavoritosLocalStorage(productoId);
    }
  }

  // Remover de favoritos en localStorage
  removeFromFavoritosLocalStorage(productoId) {
    try {
      const favoritos = this.getFavoritosFromLocalStorage();
      const newFavoritos = favoritos.filter(fav => fav.id !== productoId);
      localStorage.setItem('favoritos_guest', JSON.stringify(newFavoritos));
      return { success: true, message: 'Eliminado de favoritos' };
    } catch (error) {
      console.error('Error al remover de favoritos en localStorage:', error);
      return { success: false, message: 'Error al eliminar de favoritos' };
    }
  }

  // Remover de favoritos en API
  async removeFromFavoritosAPI(productoId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/wishlist/${productoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al remover de favoritos en API:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al eliminar de favoritos' 
      };
    }
  }

  // Verificar si un producto está en favoritos (versión rápida)
  isFavoriteSync(productoId) {
    try {
      const favoritos = this.getFavoritosSync();
      const isFav = favoritos.some(fav => fav.id === productoId);
      return isFav;
    } catch (error) {
      console.error('Error al verificar si es favorito:', error);
      return false;
    }
  }

  // Verificar si un producto está en favoritos (versión async para API)
  async isFavorite(productoId) {
    try {
      const favoritos = await this.getFavoritos();
      const isFav = favoritos.some(fav => fav.id === productoId);
      return isFav;
    } catch (error) {
      console.error('Error al verificar si es favorito:', error);
      return false;
    }
  }

  // Sincronizar favoritos de localStorage a API (cuando el usuario se registra/logea)
  async syncFavoritosToAPI() {
    if (!this.isAuthenticated || !this.userId) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    try {
      const favoritosLocal = this.getFavoritosFromLocalStorage();
      const favoritosAPI = await this.getFavoritosFromAPI();
      
      // Agregar favoritos locales que no están en la API
      for (const favorito of favoritosLocal) {
        const existsInAPI = favoritosAPI.some(fav => fav.id === favorito.id);
        if (!existsInAPI) {
          await this.addToFavoritosAPI(favorito.id);
        }
      }

      // Limpiar localStorage después de sincronizar
      localStorage.removeItem('favoritos_guest');
      
      return { success: true, message: 'Favoritos sincronizados correctamente' };
    } catch (error) {
      console.error('Error al sincronizar favoritos:', error);
      return { success: false, message: 'Error al sincronizar favoritos' };
    }
  }

  // Obtener contador de favoritos
  async getFavoritosCount() {
    const favoritos = await this.getFavoritos();
    return favoritos.length;
  }
}

// Crear instancia singleton
const favoritosService = new FavoritosService();
export default favoritosService;
