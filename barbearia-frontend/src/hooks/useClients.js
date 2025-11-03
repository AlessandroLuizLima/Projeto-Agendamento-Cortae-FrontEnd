import { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';
import { useAuth } from '../contexts/authContext';

export const useClients = () => {
  const { barbershop } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = async () => {
    if (!barbershop?.id) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await clientService.getAll();
      setClients(data.clients || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError(err.response?.data?.message || 'Erro ao carregar clientes');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [barbershop?.id]);

  const createClient = async (clientData) => {
    try {
      await clientService.create(clientData);
      await loadClients();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erro ao criar cliente');
    }
  };

  const updateClient = async (clientId, clientData) => {
    try {
      await clientService.update(clientId, clientData);
      await loadClients();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar cliente');
    }
  };

  const deleteClient = async (clientId) => {
    try {
      await clientService.delete(clientId);
      await loadClients();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Erro ao deletar cliente');
    }
  };

  const getClientHistory = async (clientId) => {
    try {
      const history = await clientService.getHistory(clientId);
      return history;
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  };

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    getClientHistory,
    refreshClients: loadClients
  };
};