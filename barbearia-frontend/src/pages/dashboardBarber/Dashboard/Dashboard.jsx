import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiCalendar,
  FiScissors,
  FiDollarSign,
  FiClock,
  FiStar,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '../../../contexts/authContext';
import api from '../../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, barbershop } = useAuth();
  const [showValues, setShowValues] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayAppointments: 0,
    totalClients: 0,
    totalServices: 0,
    monthRevenue: 0,
    weekRevenue: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados reais da API
      const [appointmentsRes, servicesRes] = await Promise.all([
        api.get('/appointments/barber-appointments').catch(() => ({ data: { appointments: [] } })),
        api.get(`/services/barbershop/${barbershop?.id}`).catch(() => ({ data: [] }))
      ]);

      const appointments = appointmentsRes.data.appointments || [];
      const services = servicesRes.data || [];

      // Calcular estatísticas
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(apt => 
        apt.data_agendamento === today && apt.status !== 'cancelado'
      ).length;

      const totalRevenue = appointments
        .filter(apt => apt.status === 'concluido')
        .reduce((sum, apt) => sum + (apt.service?.preco || 0), 0);

      setStats({
        totalRevenue,
        todayAppointments,
        totalClients: appointments.length,
        totalServices: services.length,
        monthRevenue: totalRevenue * 0.8, // Mock
        weekRevenue: totalRevenue * 0.3 // Mock
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!showValues) return '***';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!showValues) return '***';
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="loading">Carregando dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <h1>Dashboard</h1>
            <p>Visão geral do seu negócio - {barbershop?.nome_barbearia || 'Barbearia'}</p>
          </div>
          <div className="header-actions">
            <button
              className="visibility-toggle"
              onClick={() => setShowValues(!showValues)}
              title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
            >
              {showValues ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Faturamento Total</p>
                <p className="stat-number total">{formatCurrency(stats.totalRevenue)}</p>
                <div className="stat-change positive">
                  <FiTrendingUp size={16} />
                  <span>+12.5% vs mês anterior</span>
                </div>
              </div>
              <div className="stat-icon blue">
                <FiDollarSign size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Agendamentos Hoje</p>
                <p className="stat-number new">{formatNumber(stats.todayAppointments)}</p>
                <div className="stat-change neutral">
                  <FiCalendar size={16} />
                  <span>Agendamentos confirmados</span>
                </div>
              </div>
              <div className="stat-icon green">
                <FiCalendar size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Total de Clientes</p>
                <p className="stat-number average">{formatNumber(stats.totalClients)}</p>
                <div className="stat-change positive">
                  <FiUsers size={16} />
                  <span>+8.2% este mês</span>
                </div>
              </div>
              <div className="stat-icon purple">
                <FiUsers size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Serviços Cadastrados</p>
                <p className="stat-number period">{formatNumber(stats.totalServices)}</p>
                <div className="stat-change neutral">
                  <FiScissors size={16} />
                  <span>Serviços ativos</span>
                </div>
              </div>
              <div className="stat-icon red">
                <FiScissors size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Informações rápidas */}
        <div className="quick-info">
          <div className="info-card">
            <h3>Bem-vindo, {user?.nome?.split(' ')[0]}!</h3>
            <p>Gerencie sua barbearia de forma eficiente e acompanhe todos os indicadores importantes do seu negócio.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;