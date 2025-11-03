// ==========================================
// src/services/api.js
// ==========================================
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@barbershop:token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Token expirado ou inválido
      if (error.response.status === 401) {
        localStorage.removeItem('@barbershop:token');
        localStorage.removeItem('@barbershop:user');
        localStorage.removeItem('@barbershop:barbershop');
        
        // Redireciona para login
        window.location.href = '/login';
      }
      
      // Erro de permissão
      if (error.response.status === 403) {
        console.error('Você não tem permissão para essa ação');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;