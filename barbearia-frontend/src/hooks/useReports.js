import { useState } from 'react';
import { reportService } from '../services/reportService';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFinancialReport = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.financial(params);
      return data;
    } catch (err) {
      console.error('Erro ao buscar relatório financeiro:', err);
      setError(err.response?.data?.message || 'Erro ao buscar relatório');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getClientsReport = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.clients(params);
      return data;
    } catch (err) {
      console.error('Erro ao buscar relatório de clientes:', err);
      setError(err.response?.data?.message || 'Erro ao buscar relatório');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getServicesReport = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.services(params);
      return data;
    } catch (err) {
      console.error('Erro ao buscar relatório de serviços:', err);
      setError(err.response?.data?.message || 'Erro ao buscar relatório');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPeakHours = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.peakHours(params);
      return data;
    } catch (err) {
      console.error('Erro ao buscar horários de pico:', err);
      setError(err.response?.data?.message || 'Erro ao buscar relatório');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.dashboard();
      return data;
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
      setError(err.response?.data?.message || 'Erro ao buscar dashboard');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getFinancialReport,
    getClientsReport,
    getServicesReport,
    getPeakHours,
    getDashboard
  };
};