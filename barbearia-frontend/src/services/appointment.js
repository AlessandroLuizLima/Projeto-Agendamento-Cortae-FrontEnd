import api from './api';

export const appointmentService = {
  // Listar todos os agendamentos
  async getAll(params = {}) {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  // Buscar agendamento por ID
  async getById(appointmentId) {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data.appointment;
  },

  // Criar novo agendamento
  async create(appointmentData) {
    const response = await api.post('/appointments', appointmentData);
    return response.data.appointment;
  },

  // Atualizar agendamento
  async update(appointmentId, appointmentData) {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data.appointment;
  },

  // Atualizar status do agendamento
  async updateStatus(appointmentId, status) {
    const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
    return response.data.appointment;
  },

  // Deletar agendamento
  async delete(appointmentId) {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Buscar estatísticas de agendamentos
  async getStats(params = {}) {
    const response = await api.get('/appointments/stats', { params });
    return response.data;
  }
};