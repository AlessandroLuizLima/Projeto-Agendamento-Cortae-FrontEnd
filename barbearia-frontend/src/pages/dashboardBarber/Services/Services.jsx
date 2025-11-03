import React, { useState } from "react";
import { 
  FiEdit, 
  FiTrash2, 
  FiX, 
  FiAlertTriangle,
  FiSearch,
  FiPlus,
  FiScissors,
  FiClock,
  FiDollarSign,
  FiStar,
  FiEye,
  FiEyeOff,
  FiBarChart
} from "react-icons/fi";
import { useServices } from "../../../hooks/useServices";
import "./Services.css";

const Services = () => {
  const { 
    services, 
    loading, 
    error, 
    createService, 
    updateService, 
    deleteService,
    toggleServiceStatus
  } = useServices();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [formService, setFormService] = useState({ 
    nome: "", 
    preco: "", 
    duracao: "", 
    category: "corte"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("name");

  const categories = [
    { key: "todos", label: "Todos", icon: FiBarChart },
    { key: "corte", label: "Cortes", icon: FiScissors },
    { key: "barba", label: "Barba", icon: FiScissors },
    { key: "combo", label: "Combos", icon: FiStar },
    { key: "extras", label: "Extras", icon: FiScissors },
    { key: "tratamento", label: "Tratamentos", icon: FiClock }
  ];

  // Estatísticas simplificadas
  const totalServices = services.length;
  const mostPerformed = services.length > 0 
    ? services.reduce((prev, current) => 
        (prev.totalBookings > current.totalBookings) ? prev : current, services[0]
      ) 
    : null;

  // Filtro e ordenação
  const getFilteredAndSortedServices = () => {
    let filtered = services.filter(service => {
      const matchesSearch = service.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "todos" || service.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.nome.localeCompare(b.nome);
        case "price":
          return b.preco - a.preco;
        case "duration":
          return b.duracao - a.duracao;
        default:
          return 0;
      }
    });
  };

  const filteredServices = getFilteredAndSortedServices();

  const formatName = (name) =>
    name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const formatDuration = (duration) => {
    const numbers = duration.toString().replace(/\D/g, "");
    return numbers ? parseInt(numbers) : 30;
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormService({ 
      nome: "", 
      preco: "", 
      duracao: "", 
      category: "corte"
    });
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormService({
      nome: service.nome,
      preco: service.preco.toString(),
      duracao: service.duracao.toString(),
      category: service.category || "corte"
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormService({ 
      nome: "", 
      preco: "", 
      duracao: "", 
      category: "corte"
    });
  };

  const openDeleteConfirm = (service) => {
    setServiceToDelete(service);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setServiceToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormService((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formService.nome || !formService.preco || !formService.duracao) return;

    const formattedName = formatName(formService.nome);
    const formattedDuration = formatDuration(formService.duracao);

    const serviceData = {
      nome: formattedName,
      preco: parseFloat(formService.preco),
      duracao: formattedDuration,
      category: formService.category
    };

    try {
      if (editingService) {
        await updateService(editingService.id, serviceData);
        alert('Serviço atualizado com sucesso!');
      } else {
        await createService(serviceData);
        alert('Serviço cadastrado com sucesso!');
      }
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const confirmRemove = async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete.id);
        alert('Serviço deletado com sucesso!');
        closeDeleteConfirm();
      } catch (error) {
        alert(error.message);
        closeDeleteConfirm();
      }
    }
  };

  const handleToggleStatus = async (serviceId) => {
    try {
      await toggleServiceStatus(serviceId);
    } catch (error) {
      alert(error.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.key === category);
    const IconComponent = categoryData ? categoryData.icon : FiScissors;
    return <IconComponent size={16} />;
  };

  if (loading) {
    return (
      <div className="services-page">
        <div className="container">
          <div className="loading">Carregando serviços...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-page">
        <div className="container">
          <div className="error">Erro: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <h1>Gestão de Serviços</h1>
            <p>Configure e gerencie todos os serviços da barbearia</p>
          </div>
        </div>

        {/* Cards de Estatísticas - Simplificado */}
        <div className="stats-grid-simple">
          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Total de Serviços</p>
                <p className="stat-number total">{totalServices}</p>
                <div className="stat-change neutral">
                  <FiScissors size={16} />
                  <span>Serviços cadastrados</span>
                </div>
              </div>
              <div className="stat-icon blue">
                <FiScissors size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Mais Realizado</p>
                <p className="stat-number period">{mostPerformed?.nome || 'N/A'}</p>
                <div className="stat-change neutral">
                  <FiStar size={16} />
                  <span>{mostPerformed?.totalBookings || 0} agendamentos</span>
                </div>
              </div>
              <div className="stat-icon red">
                <FiStar size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Controles de busca e filtro */}
        <div className="search-section">
          <div className="search-controls">
            <div className="search-container">
              <FiSearch className="search-icon" size={20} />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar serviços por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters-container">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Ordenar por Nome</option>
                <option value="price">Maior Preço</option>
                <option value="duration">Maior Duração</option>
              </select>
            </div>

            <button className="add-button" onClick={openAddModal}>
              <FiPlus size={20} />
              Novo Serviço
            </button>
          </div>
        </div>

        {/* Lista de Serviços */}
        <div className="services-list">
          <div className="services-list-header">
            <h2>Lista de Serviços ({filteredServices.length})</h2>
          </div>
          
          <div className="services-list-content">
            {filteredServices.length === 0 ? (
              <div className="no-services">
                <FiScissors size={48} />
                <h3>Nenhum serviço encontrado</h3>
                <p>
                  {searchTerm || filterCategory !== "todos"
                    ? 'Tente alterar os filtros ou termos de busca'
                    : 'Cadastre seu primeiro serviço para começar'}
                </p>
              </div>
            ) : (
              filteredServices.map(service => (
                <div key={service.id} className="service-item">
                  <div className="service-content">
                    <div className="service-left">
                      <div className="service-icon">
                        {getCategoryIcon(service.category)}
                      </div>
                      <div className="service-info">
                        <div className="service-name-row">
                          <h3>{service.nome}</h3>
                          <span className={`status-badge ${service.active ? 'status-active' : 'status-inactive'}`}>
                            {service.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="service-meta">
                          <span className="category">
                            {categories.find(cat => cat.key === service.category)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="service-right">
                      <div className="service-stats-simple">
                        <div className="stat-item">
                          <span className="stat-label">Preço</span>
                          <span className="stat-value primary">{formatPrice(service.preco)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Duração</span>
                          <span className="stat-value">
                            <FiClock size={14} />
                            {service.duracao} min
                          </span>
                        </div>
                      </div>
                      
                      <div className="service-actions">
                        <button
                          onClick={() => handleToggleStatus(service.id)}
                          className={`action-button toggle ${service.active ? 'active' : 'inactive'}`}
                          title={service.active ? 'Desativar serviço' : 'Ativar serviço'}
                        >
                          {service.active ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => openEditModal(service)}
                          className="action-button edit"
                          title="Editar serviço"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(service)}
                          className="action-button delete"
                          title="Excluir serviço"
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

        {/* Modal de Cadastro/Edição */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingService ? "Editar Serviço" : "Cadastrar Novo Serviço"}</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-content">
                  <div className="form-grid">
                    <div className="form-group form-group-full">
                      <label className="form-label">Nome do Serviço *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ex: Corte Masculino"
                        name="nome"
                        value={formService.nome}
                        onChange={handleInputChange}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Categoria *</label>
                      <select
                        className="form-input"
                        name="category"
                        value={formService.category}
                        onChange={handleInputChange}
                        required
                      >
                        {categories.slice(1).map(category => (
                          <option key={category.key} value={category.key}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preço (R$) *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Ex: 45.00"
                        step="0.01"
                        min="0"
                        name="preco"
                        value={formService.preco}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Duração (min) *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Ex: 45"
                        min="5"
                        max="180"
                        name="duracao"
                        value={formService.duracao}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="button-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="button-primary">
                    {editingService ? "Salvar Alterações" : "Cadastrar Serviço"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Exclusão */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal modal-delete">
              <div className="modal-header">
                <h2>
                  <FiAlertTriangle className="alert-icon" />
                  Confirmar Exclusão
                </h2>
                <button className="modal-close" onClick={closeDeleteConfirm}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="modal-content">
                <p>
                  Deseja realmente excluir o serviço <strong>{serviceToDelete?.nome}</strong>?
                </p>
                <div className="delete-warning">
                  <FiAlertTriangle size={16} />
                  <span>Esta ação não pode ser desfeita</span>
                </div>
              </div>

              <div className="modal-footer">
                <button className="button-secondary" onClick={closeDeleteConfirm}>
                  Cancelar
                </button>
                <button className="button-primary danger" onClick={confirmRemove}>
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;