import api from './api';

export const barbershopService = {
  // Buscar minha barbearia
  async getMyBarbershop() {
    const response = await api.get('/barbershops/me');
    return response.data.barbershop;
  },

  // Buscar barbearia por ID
  async getById(barbershopId) {
    const response = await api.get(`/barbershops/${barbershopId}`);
    return response.data.barbershop;
  },

  // Criar ou atualizar barbearia
  async createOrUpdate(barbershopData) {
    const response = await api.post('/barbershops', barbershopData);
    return response.data.barbershop;
  },

  // Listar todas as barbearias (público)
  async getAll() {
    const response = await api.get('/barbershops');
    return response.data;
  },

  // Deletar/Desativar barbearia
  async delete() {
    const response = await api.delete('/barbershops');
    return response.data;
  }
};