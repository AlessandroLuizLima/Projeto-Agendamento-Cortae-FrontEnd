import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useServices(barbershopId = null) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===========================
  // 🔹 Buscar todos os serviços
  // ===========================
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Buscar TODOS os serviços (sem barbershopId)
      const response = await api.get('/services');
      
      // ✅ A API retorna { success: true, data: [...] }
      const servicesData = response.data.data || response.data;
      
      // ✅ Mapear campos do backend para o frontend
      const mappedServices = servicesData.map(service => ({
        id: service.id,
        nome: service.name,
        preco: parseFloat(service.price),
        duracao: parseInt(service.duration),
        category: service.category || 'corte',
        active: service.active,
        totalBookings: 0, // Adicione depois se tiver essa coluna
        created_at: service.created_at,
        updated_at: service.updated_at
      }));

      setServices(mappedServices);
    } catch (err) {
      console.error("❌ Erro ao buscar serviços:", err);
      setError(err.response?.data?.message || "Erro ao buscar serviços.");
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ===========================
  // 🔹 Criar serviço
  // ===========================
  const createService = async (data) => {
    try {
      setLoading(true);

      // ✅ Mapear campos do frontend para o backend
      const serviceData = {
        name: data.nome,
        price: parseFloat(data.preco),
        duration: parseInt(data.duracao),
        category: data.category,
        description: data.description || ''
      };

      const response = await api.post("/services", serviceData);
      
      // ✅ Recarregar lista após criar
      await fetchServices();
      
      return response.data.data;
    } catch (err) {
      console.error("❌ Erro ao criar serviço:", err);
      setError(err.response?.data?.message || "Erro ao criar serviço.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // 🔹 Atualizar serviço
  // ===========================
  const updateService = async (id, data) => {
    try {
      setLoading(true);

      // ✅ Mapear campos do frontend para o backend
      const serviceData = {
        name: data.nome,
        price: parseFloat(data.preco),
        duration: parseInt(data.duracao),
        category: data.category,
        description: data.description || '',
        active: data.active
      };

      const response = await api.put(`/services/${id}`, serviceData);
      
      // ✅ Recarregar lista após atualizar
      await fetchServices();
      
      return response.data.data;
    } catch (err) {
      console.error("❌ Erro ao atualizar serviço:", err);
      setError(err.response?.data?.message || "Erro ao atualizar serviço.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // 🔹 Deletar serviço
  // ===========================
  const deleteService = async (id) => {
    try {
      setLoading(true);

      await api.delete(`/services/${id}`);
      
      // ✅ Recarregar lista após deletar
      await fetchServices();
    } catch (err) {
      console.error("❌ Erro ao deletar serviço:", err);
      setError(err.response?.data?.message || "Erro ao deletar serviço.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // 🔹 Alternar status (ativo/inativo)
  // ===========================
  const toggleServiceStatus = async (id) => {
    try {
      setLoading(true);

      const response = await api.patch(`/services/${id}/toggle`);
      
      // ✅ Recarregar lista após toggle
      await fetchServices();
      
      return response.data.data;
    } catch (err) {
      console.error("❌ Erro ao alternar status do serviço:", err);
      setError(err.response?.data?.message || "Erro ao alternar status.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus
  };
}