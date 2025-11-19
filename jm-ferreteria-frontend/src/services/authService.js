import axios from 'axios';

// Configuración de URL de API
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // En producción, usa la variable de entorno o asume que está en el mismo dominio
    return process.env.REACT_APP_API_URL || window.location.origin;
  }
  // En desarrollo, usa localhost o variable de entorno
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

const API_URL = getApiUrl();

// Configurar axios para incluir el token en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axios.interceptors.response.use(
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

export const authService = {
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      console.log('🌐 AuthService: Enviando registro a:', `${API_URL}/api/auth/register`);
      console.log('📤 AuthService: Datos enviados:', userData);
      
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      console.log('📥 AuthService: Respuesta recibida:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('💥 AuthService: Error en register:', error);
      console.error('💥 AuthService: Error response:', error.response);
      console.error('💥 AuthService: Error data:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Error en el registro',
        message: error.response?.data?.message || 'Error en el registro'
      };
    }
  },

  async validateToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { valid: false };
      }

      // Aquí podrías hacer una petición al backend para validar el token
      // Por ahora, solo verificamos que existe
      return { valid: true };
    } catch (error) {
      console.error('Error validando token:', error);
      return { valid: false };
    }
  },

  async logout() {
    try {
      const response = await axios.post(`${API_URL}/api/auth/logout`);
      return response;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  },

  async getUser() {
    try {
      const response = await axios.get(`${API_URL}/api/auth/user`);
      return response;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await axios.put(`${API_URL}/api/auth/user`, profileData);
      return response;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  async getGoogleUrl() {
    try {
      const response = await axios.get(`${API_URL}/api/auth/google/url`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo URL de Google:', error);
      // Si el error tiene un mensaje del backend, lanzarlo con ese mensaje
      if (error.response?.data?.message) {
        const customError = new Error(error.response.data.message);
        customError.response = error.response;
        throw customError;
      }
      throw error;
    }
  },

  async handleGoogleCallback(code) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google/callback`, { code });
      return response.data;
    } catch (error) {
      console.error('Error en callback de Google:', error);
      throw error;
    }
  }
}; 