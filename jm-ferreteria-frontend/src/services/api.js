import axios from 'axios';

// Configuración base de axios
// Usa la IP local si está definida en .env, sino usa localhost
export const getApiBaseUrl = () => {
  // En producción, usa la variable de entorno
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || '/api';
  }
  
  // En desarrollo, detecta automáticamente la IP local
  if (process.env.NODE_ENV === 'development') {
    const hostname = window.location.hostname;
    // Si no es localhost, usa el hostname actual (será la IP cuando accedas desde otro dispositivo)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8000/api`;
    }
  }
  
  // Usa variable de entorno o localhost por defecto
  return process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
};

// Función helper para obtener la URL base del backend (sin /api)
export const getBackendBaseUrl = () => {
  // URL de producción del backend
  const backendUrl = 'https://apwebferrejmg-production.up.railway.app';
  
  // En desarrollo, intentar usar localhost si está disponible
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  
  // Siempre devolver la URL de producción
  return backendUrl;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
                    // Lista de rutas públicas que no necesitan token
                const publicRoutes = [
                  '/api/catalogo/productos',
                  '/api/catalogo/categorias',
                  '/api/buscar-cliente-por-dni',
                  '/api/buscar-dni',
                  '/api/pedidos/publico',
                  '/api/login',
                  '/api/test'
                ];
    
    // Solo agregar token si no es una ruta pública
    // Verificar tanto la URL completa como la ruta relativa
    const urlCompleta = config.url.startsWith('http') ? config.url : `${config.baseURL || ''}${config.url}`;
    const isPublicRoute = publicRoutes.some(route => 
        config.url.includes(route) || urlCompleta.includes(route) || config.url === route.replace('/api/', '')
    );
    
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

// Servicios de productos
export const productService = {
  getProducts: () => api.get('/productos'),
  getProduct: (id) => api.get(`/productos/${id}`),
  createProduct: (data) => api.post('/productos', data),
  updateProduct: (id, data) => api.put(`/productos/${id}`, data),
  deleteProduct: (id) => api.delete(`/productos/${id}`),
  getCatalog: () => api.get('/catalogo/productos'),
};

// Servicios de categorías
export const categoryService = {
  getCategories: () => api.get('/categorias'),
  getCategory: (id) => api.get(`/categorias/${id}`),
  createCategory: (data) => api.post('/categorias', data),
  updateCategory: (id, data) => api.put(`/categorias/${id}`, data),
  deleteCategory: (id) => api.delete(`/categorias/${id}`),
  getCatalog: () => api.get('/catalogo/categorias'),
};

// Servicios de ventas
export const saleService = {
  getSales: (params = '') => api.get(`/ventas${params ? `?${params}` : ''}`),
  getSale: (id) => api.get(`/ventas/${id}`),
  createSale: (data) => api.post('/ventas', data),
  getStats: () => api.get('/ventas/estadisticas'),
  getProductosMasVendidos: () => api.get('/ventas/productos-mas-vendidos'),
  buscarClientePorDni: (dni) => api.get(`/buscar-cliente-por-dni/${dni}`),
  anularVenta: (id, data) => api.put(`/ventas/${id}/anular`, data),
};

// Servicios de reportes
export const reportService = {
  getSalesReport: (params = '') => api.get(`/reportes/ventas${params ? `?${params}` : ''}`),
  getProductsReport: (params = '') => api.get(`/reportes/productos${params ? `?${params}` : ''}`),
  getClientsReport: (params = '') => api.get(`/reportes/clientes${params ? `?${params}` : ''}`),
  getFinancialReport: (params = '') => api.get(`/reportes/financiero${params ? `?${params}` : ''}`),
  exportPDF: (tipo, params = '') => api.get(`/reportes/${tipo}/pdf${params ? `?${params}` : ''}`, { responseType: 'blob' }),
  exportExcel: (tipo, params = '') => api.get(`/reportes/${tipo}/excel${params ? `?${params}` : ''}`, { responseType: 'blob' }),
};

// Servicios de pedidos
export const orderService = {
  getOrders: () => api.get('/pedidos'),
  getOrder: (id) => api.get(`/pedidos/${id}`),
  createOrder: (data) => api.post('/pedidos/publico', data),
  updateOrderStatus: (id, status) => api.put(`/pedidos/${id}/estado`, { estado: status }),
};

// Servicios de usuarios
export const userService = {
  getUsers: () => api.get('/usuarios'),
  getUser: (id) => api.get(`/usuarios/${id}`),
  createUser: (data) => api.post('/usuarios', data),
  updateUser: (id, data) => api.put(`/usuarios/${id}`, data),
  deleteUser: (id) => api.delete(`/usuarios/${id}`),
  getFrequentClients: () => api.get('/clientes-frecuentes'),
  sugerirClientes: () => api.get('/sugerir-clientes'),
  getClientes: () => api.get('/clientes'), // Obtener solo clientes
};

export default api; 