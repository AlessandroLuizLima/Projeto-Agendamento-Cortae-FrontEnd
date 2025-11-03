import { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../contexts/authContext';

export const useAppointments = () => {
  const { barbershop } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = async (params = {}) => {
    if (!barbershop?.id) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await appointmentService.getAll(params);
      setAppointments(data.appointments || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      setError(err.response?.data?.message || 'Erro ao carregar agendamentos');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [barbershop?.id]);

  const createAppointment = async (appointmentData) => {
    try {
      await appointmentService.create(appointmentData);
      await loadAppointments();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erro ao criar agendamento');
    }
  };

  const updateAppointment = async (appointmentId, appointmentData) => {
    try {
      await appointmentService.update(appointmentId, appointmentData);
      await loadAppointments();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar agendamento');
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await appointmentService.updateStatus(appointmentId, status);
      await loadAppointments();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      await appointmentService.delete(appointmentId);
      await loadAppointments();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erro ao deletar agendamento');
    }
  };

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    refreshAppointments: loadAppointments
  };
};