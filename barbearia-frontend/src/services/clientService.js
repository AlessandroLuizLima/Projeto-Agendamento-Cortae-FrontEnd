import api from './api';

export const clientService = {
  // Listar todos os clientes
  async getAll(params = {}) {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  // Buscar cliente por ID
  async getById(clientId) {
    const response = await api.get(`/clients/${clientId}`);
    return response.data.client;
  },

  // Criar novo cliente
  async create(clientData) {
    const response = await api.post('/clients', clientData);
    return response.data.client;
  },

  // Atualizar cliente
  async update(clientId, clientData) {
    const response = await api.put(`/clients/${clientId}`, clientData);
    return response.data.client;
  },

  // Deletar cliente
  async delete(clientId) {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
  },

  // Buscar histórico do cliente
  async getHistory(clientId) {
    const response = await api.get(`/clients/${clientId}/history`);
    return response.data.history;
  },

  // Buscar estatísticas de clientes
  async getStats() {
    const response = await api.get('/clients/stats');
    return response.data;
  }
};