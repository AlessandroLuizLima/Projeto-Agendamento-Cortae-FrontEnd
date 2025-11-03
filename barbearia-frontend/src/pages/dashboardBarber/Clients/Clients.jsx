import React, { useState } from 'react';
import { 
  FiSearch, 
  FiPlus, 
  FiUser, 
  FiCalendar, 
  FiUsers,
  FiPhone,
  FiMail,
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiTrendingUp,
  FiStar,
  FiX,
  FiScissors,
  FiClock
} from 'react-icons/fi';
import './Clients.css';
import { useClients } from '../../../hooks/useClients';	

const Clients = () => {
  const { 
    clients, 
    loading, 
    error, 
    createClient, 
    updateClient, 
    deleteClient,
    getClientHistory 
  } = useClients();

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('name');
  const [showValues, setShowValues] = useState(true);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Proteções contra undefined
  const safeClients = clients || [];

  // Calcular estatísticas
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

  const totalRevenue = safeClients.reduce((acc, client) => {
    const val = Number((client && client.totalSpent) || 0);
    return acc + val;
  }, 0);

  const averageSpent = totalClients > 0 ? totalRevenue / totalClients : 0;
  const averageVisits = totalClients > 0 ? safeClients.reduce((acc, client) => acc + Number((client && client.visits) || 0), 0) / totalClients : 0;
  const averageRating = totalClients > 0 ? safeClients.reduce((acc, client) => acc + Number((client && client.rating) || 0), 0) / totalClients : 0;

  const topClients = [...safeClients]
    .sort((a, b) => (Number(b && b.totalSpent) || 0) - (Number(a && a.totalSpent) || 0))
    .slice(0, 3);

  // Filtros e ordenação
  const getFilteredAndSortedClients = () => {
    const searchLower = (searchTerm || '').toLowerCase();

    let filtered = safeClients.filter(client => {
      const name = (client && client.name) ? String(client.name).toLowerCase() : '';
      const email = (client && client.email) ? String(client.email).toLowerCase() : '';
      const phone = (client && client.phone) ? String(client.phone) : '';

      const matchesSearch =
        (searchLower && (name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchTerm))) ||
        (!searchLower);

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
        case 'rating':
          return (Number(b && b.rating) || 0) - (Number(a && a.rating) || 0);
        default:
          return 0;
      }
    });
  };

  const filteredClients = getFilteredAndSortedClients();

  const handleAddClient = async () => {
    if (newClient.name && newClient.phone) {
      try {
        await createClient(newClient);
        setNewClient({ name: '', phone: '', email: '', address: '' });
        setShowModal(false);
        alert('Cliente cadastrado com sucesso!');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleEditClient = async () => {
    if (selectedClient && newClient.name && newClient.phone) {
      try {
        await updateClient(selectedClient.id, newClient);
        setShowEditModal(false);
        setSelectedClient(null);
        setNewClient({ name: '', phone: '', email: '', address: '' });
        alert('Cliente atualizado com sucesso!');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteClient(clientId);
        alert('Cliente deletado com sucesso!');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleClientClick = async (client) => {
    setSelectedClient(client);
    try {
      const history = await getClientHistory(client.id);
      setClientHistory(history);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setClientHistory([]);
    }
    setShowReportModal(true);
  };

  const handleEditClick = (client, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedClient(client);
    setNewClient({
      name: client && client.name ? client.name : '',
      phone: client && client.phone ? client.phone : '',
      email: client && client.email ? client.email : '',
      address: client && client.address ? client.address : ''
    });
    setShowEditModal(true);
  };

  const formatCurrency = (value) => {
    if (!showValues) return '***';
    const val = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
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

  const renderStars = (rating) => {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={16}
        className={i < r ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="clients-page">
        <div className="container">
          <div className="loading">Carregando clientes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clients-page">
        <div className="container">
          <div className="error">Erro: {error}</div>
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
            <p>Gerencie e acompanhe todos os clientes da barbearia</p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Total de Clientes</p>
                <p className="stat-number total">{totalClients}</p>
                <div className="stat-change neutral">
                  <FiUsers size={16} />
                  <span>{activeClients} ativos</span>
                </div>
              </div>
              <div className="stat-icon blue">
                <FiUsers size={24} />
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
                    { totalClients > 0 ? `+${Math.round((newClientsThisMonth / totalClients) * 100)}% da base` : '+' }
                  </span>
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
                <p>Avaliação Média</p>
                <p className="stat-number period">{showValues ? averageRating.toFixed(1) : '***'}</p>
                <div className="stat-change neutral">
                  <FiStar size={16} />
                  <span>{averageVisits.toFixed(1)} visitas/cliente</span>
                </div>
              </div>
              <div className="stat-icon red">
                <FiStar size={24} />
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
                placeholder="Pesquisar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
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
                <option value="spent">Valor Gasto</option>
                <option value="visits">Número de Visitas</option>
                <option value="rating">Avaliação</option>
              </select>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="add-button"
            >
              <FiPlus size={20} />
              Novo Cliente
            </button>
          </div>
        </div>

        {/* Top Clientes */}
        <div className="top-clients-section">
          <div className="section-header">
            <h2>Top Clientes</h2>
            <p>Clientes com maior faturamento</p>
          </div>
          <div className="top-clients-grid">
            {topClients.map((client, index) => (
              <div key={client && client.id ? client.id : index} className={`top-client-card rank-${index + 1}`}>
                <div className="rank-badge">{index + 1}º</div>
                <div className="client-avatar">
                  <FiUser size={20} />
                </div>
                <div className="top-client-info">
                  <h4>{(client && client.name) || '—'}</h4>
                  <p className="top-client-spent">{formatCurrency(client && client.totalSpent)}</p>
                  <div className="top-client-stats">
                    <span>{(client && client.visits) || 0} visitas</span>
                    <div className="rating-stars">
                      {renderStars(client && client.rating)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="clients-list">
          <div className="clients-list-header">
            <h2>Lista de Clientes ({filteredClients.length})</h2>
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
                    : 'Cadastre seu primeiro cliente para começar'
                  }
                </p>
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
                          <span><FiPhone size={14} /> {(client && client.phone) || '—'}</span>
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
                        <div className="stat-item">
                          <span className="stat-label">Avaliação</span>
                          <div className="rating-display">
                            {renderStars(client && client.rating)}
                            <span className="rating-number">({(client && client.rating) || 0})</span>
                          </div>
                        </div>
                      </div>
                      <div className="client-actions">
                        <button
                          onClick={(e) => handleEditClick(client, e)}
                          className="action-button edit"
                          title="Editar cliente"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClient(client && client.id);
                          }}
                          className="action-button delete"
                          title="Excluir cliente"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Cadastrar Novo Cliente</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="form-input"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="form-input"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="form-input"
                    placeholder="cliente@email.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Endereço</label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="form-input"
                    placeholder="Rua, número, bairro"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddClient}
                disabled={!newClient.name || !newClient.phone}
                className="button-primary"
              >
                Cadastrar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Editar Cliente</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="form-input"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="form-input"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="form-input"
                    placeholder="cliente@email.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Endereço</label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="form-input"
                    placeholder="Rua, número, bairro"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditClient}
                disabled={!newClient.name || !newClient.phone}
                className="button-primary"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relatório */}
      {showReportModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal modal-report">
            <div className="modal-header">
              <h2>Relatório Detalhado</h2>
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
                      <span><FiPhone size={14} /> {selectedClient && selectedClient.phone}</span>
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
                    <div className="rating-display">
                      {renderStars(selectedClient && selectedClient.rating)}
                    </div>
                    <span className="stat-label">Avaliação</span>
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
                className="button-secondary"
              >
                Fechar Relatório
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  handleEditClick(selectedClient, { stopPropagation: () => {} });
                }}
                className="button-primary"
              >
                Editar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;