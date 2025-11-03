import { useState, useEffect, useCallback } from "react";
import api from "../services/api"; // import da instância axios

export function useServices(barbershopId = null) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===========================
  // 🔹 Buscar serviços por barbearia
  // ===========================
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const url = barbershopId
        ? `/services/barbershop/${barbershopId}`
        : `/services/barbershop`;

      const response = await api.get(url, { headers });
      setServices(response.data);
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
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
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.post("/services", data, { headers });
      setServices((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error("Erro ao criar serviço:", err);
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
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.put(`/services/${id}`, data, { headers });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? response.data : s))
      );
      return response.data;
    } catch (err) {
      console.error("Erro ao atualizar serviço:", err);
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
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await api.delete(`/services/${id}`, { headers });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Erro ao deletar serviço:", err);
      setError(err.response?.data?.message || "Erro ao deletar serviço.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // 🔹 Alternar status (ativo/inativo)
  // ===========================
  const toggleStatus = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.patch(`/services/${id}/toggle`, {}, { headers });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: response.data.status } : s))
      );
      return response.data;
    } catch (err) {
      console.error("Erro ao alternar status do serviço:", err);
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
    toggleStatus,
  };
}
