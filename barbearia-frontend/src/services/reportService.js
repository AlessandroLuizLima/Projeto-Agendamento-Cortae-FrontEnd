import api from './api';

export const reportService = {
  // Relatório financeiro
  async financial(params = {}) {
    const response = await api.get('/reports/financial', { params });
    return response.data;
  },

  // Relatório de clientes
  async clients(params = {}) {
    const response = await api.get('/reports/clients', { params });
    return response.data;
  },

  // Relatório de serviços
  async services(params = {}) {
    const response = await api.get('/reports/services', { params });
    return response.data;
  },

  // Horários de pico
  async peakHours(params = {}) {
    const response = await api.get('/reports/peak-hours', { params });
    return response.data;
  },

  // Dashboard geral
  async dashboard() {
    const response = await api.get('/reports/dashboard');
    return response.data;
  }
};