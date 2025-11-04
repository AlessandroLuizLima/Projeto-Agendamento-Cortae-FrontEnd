import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiUser, 
  FiCalendar, 
  FiUsers,
  FiPhone,
  FiMail,
  FiMapPin,
  FiTrendingUp,
  FiX,
  FiScissors,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiActivity
} from 'react-icons/fi';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('name');
  const [showValues, setShowValues] = useState(true);

  const API_URL = 'http://localhost:3000/api/clients';

  // ===== CARREGAR CLIENTES =====
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando clientes em:', API_URL);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Resposta da API:', result);
      
      const clientsData = result.data || result;
      setClients(clientsData);
      console.log('Clientes carregados:', clientsData.length);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== ESTATÍSTICAS =====
  const safeClients = clients || [];
  const totalClients = safeClients.length;
  const activeClients = safeClients.filter(client => 
    client && (client.status || '').toLowerCase() === 'ativo'
  ).length;
  
  const currentDate = new Date();
  const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
  const newClientsThisMonth = safeClients.filter(client => {
    const dateStr = client && client.registrationDate;
    if (!dateStr) return false;
    const clientDate = new Date(dateStr);
    return clientDate >= oneMonthAgo;
  }).length;

  // ===== FILTROS E ORDENAÇÃO MELHORADOS =====
  const getFilteredAndSortedClients = () => {
    const searchLower = (searchTerm || '').toLowerCase().trim();

    let filtered = safeClients.filter(client => {
      if (!searchLower) return true;

      const name = (client && client.name) ? String(client.name).toLowerCase() : '';
      const email = (client && client.email) ? String(client.email).toLowerCase() : '';
      const phone = (client && client.phone) ? String(client.phone).replace(/\D/g, '') : '';
      const address = (client && client.address) ? String(client.address).toLowerCase() : '';
      
      // Busca mais inteligente
      const searchDigits = searchTerm.replace(/\D/g, '');
      
      const matchesSearch = 
        name.includes(searchLower) || 
        email.includes(searchLower) || 
        address.includes(searchLower) ||
        (searchDigits && phone.includes(searchDigits));

      const statusNormalized = (client && client.status) ? String(client.status).toLowerCase() : '';
      const matchesStatus = filterStatus === 'todos' || statusNormalized === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (String(a && a.name || '')).localeCompare(String(b && b.name || ''));
        case 'date':
          return new Date(b && b.registrationDate) - new Date(a && a.registrationDate);
        case 'spent':
          return (Number(b && b.totalSpent) || 0) - (Number(a && a.totalSpent) || 0);
        case 'visits':
          return (Number(b && b.visits) || 0) - (Number(a && a.visits) || 0);
        default:
          return 0;
      }
    });
  };

  const filteredClients = getFilteredAndSortedClients();

  // ===== BUSCAR HISTÓRICO =====
  const handleClientClick = async (client) => {
    setSelectedClient(client);
    
    try {
      console.log('📊 Buscando histórico do cliente:', client.id);
      
      const response = await fetch(`${API_URL}/${client.id}/history`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar histórico');
      }
      
      const result = await response.json();
      const history = result.data || result;
      
      console.log('Histórico carregado:', history.length);
      setClientHistory(history);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setClientHistory([]);
    }
    
    setShowReportModal(true);
  };

  // ===== FORMATAÇÕES =====
  const formatCurrency = (value) => {
    if (!showValues) return '***';
    const val = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const formatPhone = (phone) => {
    if (!phone) return '—';
    const digits = String(phone).replace(/\D/g, '');
    
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    
    return phone;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Nunca';
    return d.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    return (status && status.toLowerCase() === 'ativo') ? 'status-active' : 'status-inactive';
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="clients-page">
        <div className="container">
          <div className="loading">
            <FiUsers size={48} />
            <p>Carregando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="clients-page">
        <div className="container">
          <div className="error">
            <FiAlertCircle size={48} />
            <h3>Erro ao carregar clientes</h3>
            <p>{error}</p>
            <button className="button-primary" onClick={fetchClients}>
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <h1>Gestão de Clientes</h1>
            <p>Visualize e acompanhe todos os clientes da barbearia</p>
          </div>
        </div>

        {/* Cards de Estatísticas - APENAS 2 CARDS */}
        <div className="stats-grid-two">
          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Total de Clientes</p>
                <p className="stat-number total">{totalClients}</p>
                <div className="stat-change neutral">
                  <FiUsers size={16} />
                  <span>{activeClients} clientes ativos</span>
                </div>
              </div>
              <div className="stat-icon blue">
                <FiUsers size={32} />
              </div>
            </div>
          </div>

          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Novos Clientes (30 dias)</p>
                <p className="stat-number new">{newClientsThisMonth}</p>
                <div className="stat-change positive">
                  <FiTrendingUp size={16} />
                  <span>
                    { totalClients > 0 ? `+${Math.round((newClientsThisMonth / totalClients) * 100)}% da base` : '+0%' }
                  </span>
                </div>
              </div>
              <div className="stat-icon green">
                <FiCalendar size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Busca e Filtros */}
        <div className="search-section">
          <div className="search-controls">
            <div className="search-container">
              <FiSearch className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Busque por nome, telefone, email ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  title="Limpar busca"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            
            <div className="filters-container">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Ordenar por Nome</option>
                <option value="date">Data de Cadastro</option>
                <option value="spent">Mais Gastos</option>
                <option value="visits">Mais Visitas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="clients-list">
          <div className="clients-list-header">
            <h2>Lista de Clientes ({filteredClients.length})</h2>
            <div className="list-header-info">
              {searchTerm && (
                <span className="search-badge">
                  <FiSearch size={14} /> 
                  Buscando: "{searchTerm}"
                </span>
              )}
              {sortBy === 'spent' && <span className="filter-badge"><FiDollarSign size={14} /> Ordenado por Gastos</span>}
              {sortBy === 'visits' && <span className="filter-badge"><FiActivity size={14} /> Ordenado por Visitas</span>}
              {sortBy === 'date' && <span className="filter-badge"><FiCalendar size={14} /> Ordenado por Data</span>}
            </div>
          </div>
          
          <div className="clients-list-content">
            {filteredClients.length === 0 ? (
              <div className="no-clients">
                <div className="no-clients-icon">
                  <FiUsers size={48} />
                </div>
                <h3>{searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</h3>
                <p>
                  {searchTerm 
                    ? 'Tente alterar os filtros ou termos de busca'
                    : 'Aguardando cadastro de clientes no sistema'
                  }
                </p>
                {searchTerm && (
                  <button 
                    className="button-primary"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpar Busca
                  </button>
                )}
              </div>
            ) : (
              filteredClients.map((client) => (
                <div 
                  key={client && client.id ? client.id : Math.random()}
                  className="client-item"
                  onClick={() => handleClientClick(client)}
                >
                  <div className="client-content">
                    <div className="client-left">
                      <div className="client-avatar">
                        <FiUser size={24} />
                      </div>
                      <div className="client-info">
                        <div className="client-name-row">
                          <h3>{(client && client.name) || '—'}</h3>
                          <span className={`status-badge ${getStatusBadge(client && client.status)}`}>
                            {(client && client.status) || '—'}
                          </span>
                        </div>
                        <div className="client-contact">
                          <span><FiPhone size={14} /> {formatPhone(client && client.phone)}</span>
                          {(client && client.email) && <span><FiMail size={14} /> {client.email}</span>}
                        </div>
                        <div className="client-meta">
                          <span>Cadastrado: {formatDate(client && client.registrationDate)}</span>
                          <span>Última visita: {formatDate(client && client.lastVisit)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="client-right">
                      <div className="client-stats">
                        <div className="stat-item">
                          <span className="stat-label">Total Gasto</span>
                          <span className="stat-value primary">{formatCurrency(client && client.totalSpent)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Visitas</span>
                          <span className="stat-value">{(client && client.visits) || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Relatório */}
      {showReportModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal modal-report" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Relatório do Cliente</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="modal-close"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="client-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <FiUser size={32} />
                  </div>
                  <div className="profile-info">
                    <h3>{selectedClient && selectedClient.name}</h3>
                    <div className="profile-details">
                      <span><FiPhone size={14} /> {formatPhone(selectedClient && selectedClient.phone)}</span>
                      {selectedClient && selectedClient.email && <span><FiMail size={14} /> {selectedClient.email}</span>}
                      {selectedClient && selectedClient.address && <span><FiMapPin size={14} /> {selectedClient.address}</span>}
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusBadge(selectedClient && selectedClient.status)}`}>
                    {selectedClient && selectedClient.status}
                  </span>
                </div>

                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="stat-number">{formatCurrency(selectedClient && selectedClient.totalSpent)}</span>
                    <span className="stat-label">Total Gasto</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">{(selectedClient && selectedClient.visits) || 0}</span>
                    <span className="stat-label">Visitas</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">{formatDate(selectedClient && selectedClient.registrationDate)}</span>
                    <span className="stat-label">Cliente Desde</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">{formatDate(selectedClient && selectedClient.lastVisit)}</span>
                    <span className="stat-label">Última Visita</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="report-table">
              <div className="table-header">
                <h3>Histórico de Serviços</h3>
              </div>
              <div className="services-table">
                <div className="table-row table-header-row">
                  <div>Serviço</div>
                  <div>Data</div>
                  <div>Barbeiro</div>
                  <div>Duração</div>
                  <div>Valor</div>
                </div>
                
                {clientHistory && clientHistory.length > 0 ? (
                  clientHistory.map((service, index) => (
                    <div key={index} className="table-row">
                      <div className="service-name">
                        <FiScissors size={16} />
                        {service.service}
                      </div>
                      <div className="service-date">{formatDate(service.date)}</div>
                      <div className="service-barber">{service.barber}</div>
                      <div className="service-duration">
                        <FiClock size={14} />
                        {service.duration}min
                      </div>
                      <div className="service-value">{formatCurrency(service.value)}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-services">
                    <FiScissors size={32} />
                    <p>Nenhum serviço realizado ainda</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowReportModal(false)}
                className="button-primary"
              >
                Fechar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;