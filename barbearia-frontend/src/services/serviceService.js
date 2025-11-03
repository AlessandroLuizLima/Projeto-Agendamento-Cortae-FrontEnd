import api from './api';

export const serviceService = {
  // Buscar serviços por barbearia
  async getByBarbershop(barbershopId) {
    const response = await api.get(`/services/barbershop/${barbershopId}`);
    return response.data.services;
  },

  // Buscar serviço por ID
  async getById(serviceId) {
    const response = await api.get(`/services/${serviceId}`);
    return response.data.service;
  },

  // Criar novo serviço
  async create(serviceData) {
    const response = await api.post('/services', serviceData);
    return response.data.service;
  },

  // Atualizar serviço
  async update(serviceId, serviceData) {
    const response = await api.put(`/services/${serviceId}`, serviceData);
    return response.data.service;
  },

  // Deletar serviço
  async delete(serviceId) {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  },

  // Alternar status do serviço
  async toggleStatus(serviceId) {
    const response = await api.patch(`/services/${serviceId}/toggle`);
    return response.data.service;
  },

  // Buscar por categoria
  async getByCategory(category, barbershopId) {
    const response = await api.get(`/services/category/${category}`, {
      params: { barbershop_id: barbershopId }
    });
    return response.data.services;
  }
};