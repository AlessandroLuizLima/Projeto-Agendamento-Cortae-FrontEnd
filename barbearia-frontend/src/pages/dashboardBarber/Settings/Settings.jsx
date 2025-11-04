import React, { useState, useRef, useEffect } from "react";
import { 
  FiSettings, 
  FiUser, 
  FiBell, 
  FiShield,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiSave,
  FiEdit,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiCalendar,
  FiImage,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiInfo
} from "react-icons/fi";
import api from '../../../services/api';
import { useAuth } from '../../../contexts/authContext';
import "./Settings.css";

export default function Settings() {
  // ✅ CORREÇÃO: Remover duplicação e simplificar
  const { user, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState("perfil");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nomeEstabelecimento: "",
    telefone: "",
    email: "",
    endereco: "",
    enderecoDetalhado: {
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      pontoReferencia: ""
    },
    diasAtendimento: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"],
    horarioInicio: "08:00",
    horarioFim: "18:00",
    logo: null,
    emailNotificacoes: "",
    descricao: ""
  });

  const [currentError, setCurrentError] = useState(null);

  // ✅ Carregar dados da barbearia ao montar
  useEffect(() => {
    const loadBarbershopData = async () => {
      if (!token) {
        console.log('⚠️ Sem token, não pode carregar dados da barbearia');
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        console.log('🔄 Carregando dados da barbearia...');
        
        const response = await api.get('/barbershops/me');
        const data = response.data.barbershop;

        console.log('✅ Dados da barbearia carregados:', data);

        if (data) {
          setFormData({
            nomeEstabelecimento: data.nome_estabelecimento || "",
            telefone: data.telefone || "",
            email: data.email || "",
            endereco: data.endereco || "",
            enderecoDetalhado: {
              rua: data.rua || "",
              numero: data.numero || "",
              bairro: data.bairro || "",
              cidade: data.cidade || "",
              estado: data.estado || "",
              pontoReferencia: data.ponto_referencia || ""
            },
            diasAtendimento: data.dias_atendimento || ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"],
            horarioInicio: data.horario_inicio?.substring(0, 5) || "08:00", // ✅ Remover segundos
            horarioFim: data.horario_fim?.substring(0, 5) || "18:00", // ✅ Remover segundos
            logo: data.logo || null,
            emailNotificacoes: data.email || "",
            descricao: data.descricao || ""
          });

          if (data.logo) {
            setLogoPreview(data.logo);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados da barbearia:', error);
        
        // ✅ Se não encontrar, usar dados padrões
        if (user) {
          setFormData(prev => ({
            ...prev,
            nomeEstabelecimento: user.nome || "",
            email: user.email || ""
          }));
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadBarbershopData();
  }, [token, user]);

  const tabs = [
    { key: "perfil", label: "Perfil da Empresa", icon: FiUser },
    { key: "notificacoes", label: "Notificações", icon: FiBell }
  ];

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getBusinessStats = () => {
    const diasSelecionados = formData.diasAtendimento.length;
    const horasPorDia = formData.horarioInicio && formData.horarioFim ? 
      calculateHours(formData.horarioInicio, formData.horarioFim) : 0;
    const horasSemanais = diasSelecionados * horasPorDia;

    return {
      diasSelecionados,
      horasPorDia,
      horasSemanais
    };
  };

  const calculateHours = (inicio, fim) => {
    if (!inicio || !fim) return 0;
    const [inicioH, inicioM] = inicio.split(':').map(Number);
    const [fimH, fimM] = fim.split(':').map(Number);
    const inicioMinutos = inicioH * 60 + inicioM;
    const fimMinutos = fimH * 60 + fimM;
    return Math.max(0, (fimMinutos - inicioMinutos) / 60);
  };

  const stats = getBusinessStats();

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (currentError?.field === name) {
      setCurrentError(null);
    }

    if (type === "file" && name === "logo") {
      const file = files && files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setCurrentError({ field: "logo", message: "O arquivo deve ter no máximo 5MB." });
          return;
        }

        setFormData(prev => ({ ...prev, logo: file }));
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target.result);
        reader.readAsDataURL(file);
      }
      return;
    }

    if (name.startsWith("endereco_")) {
      const fieldName = name.replace("endereco_", "");
      let newValue = value;
      
      if (["rua", "bairro", "cidade", "pontoReferencia"].includes(fieldName)) {
        if (value.length > 100) return;
        newValue = capitalizeWords(value);
      }
      
      if (fieldName === "numero") {
        newValue = value.replace(/\D/g, "");
        if (newValue.length > 10) return;
      }
      
      setFormData(prev => ({
        ...prev,
        enderecoDetalhado: {
          ...prev.enderecoDetalhado,
          [fieldName]: newValue
        }
      }));
      return;
    }

    if (name === "nomeEstabelecimento") {
      if (value.length > 100) return;
      setFormData(prev => ({ ...prev, [name]: capitalizeWords(value) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dia) => {
    setFormData(prev => ({
      ...prev,
      diasAtendimento: prev.diasAtendimento.includes(dia)
        ? prev.diasAtendimento.filter(d => d !== dia)
        : [...prev.diasAtendimento, dia]
    }));
  };

  const handleAddressSubmit = () => {
    const { rua, numero, bairro, cidade, estado, pontoReferencia } = formData.enderecoDetalhado;
    
    if (!rua || !numero || !bairro || !cidade || !estado) {
      setCurrentError({ field: "endereco", message: "Preencha todos os campos obrigatórios." });
      return;
    }

    const enderecoFormatado = `${rua}, ${numero}, ${bairro}, ${cidade}/${estado}`;
    const enderecoCompleto = pontoReferencia ? `${enderecoFormatado}, ${pontoReferencia}` : enderecoFormatado;
    
    setFormData(prev => ({ ...prev, endereco: enderecoCompleto }));
    setShowAddressModal(false);
    setCurrentError(null);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = (value || "").replace(/\D/g, '');
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 2) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, telefone: formatPhoneNumber(rawValue) }));
  };

  const validateForm = (tabType) => {
    setCurrentError(null);

    if (tabType === "perfil") {
      if (!formData.nomeEstabelecimento.trim()) {
        setCurrentError({ field: "nomeEstabelecimento", message: "Nome do estabelecimento é obrigatório." });
        return false;
      }

      if (!formData.telefone || formData.telefone.length < 15) {
        setCurrentError({ field: "telefone", message: "Telefone válido é obrigatório." });
        return false;
      }

      if (!formData.email || !formData.email.includes("@")) {
        setCurrentError({ field: "email", message: "Email válido é obrigatório." });
        return false;
      }

      if (!formData.endereco.trim()) {
        setCurrentError({ field: "endereco", message: "Endereço completo é obrigatório." });
        return false;
      }

      if (formData.diasAtendimento.length === 0) {
        setCurrentError({ field: "diasAtendimento", message: "Selecione pelo menos um dia de atendimento." });
        return false;
      }

      if (!formData.horarioInicio || !formData.horarioFim) {
        setCurrentError({ field: "horario", message: "Horário de funcionamento completo é obrigatório." });
        return false;
      }

      const horasCalculadas = calculateHours(formData.horarioInicio, formData.horarioFim);
      if (horasCalculadas <= 0) {
        setCurrentError({ field: "horario", message: "Horário de fim deve ser posterior ao de início." });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(activeTab)) {
      return;
    }

    setIsLoading(true);
    setCurrentError(null);

    try {
      const { rua, numero, bairro, cidade, estado, pontoReferencia } = formData.enderecoDetalhado;

      const dataToSend = {
        nome_estabelecimento: formData.nomeEstabelecimento,
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        ponto_referencia: pontoReferencia,
        dias_atendimento: formData.diasAtendimento,
        horario_inicio: formData.horarioInicio,
        horario_fim: formData.horarioFim,
        descricao: formData.descricao,
        logo: typeof formData.logo === 'string' ? formData.logo : null
      };

      console.log('📤 Enviando dados:', dataToSend);

      const response = await api.post('/barbershops', dataToSend);
      
      console.log('✅ Resposta do servidor:', response.data);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      const message = error.response?.data?.message || 'Erro ao salvar configurações';
      setCurrentError({ field: "general", message });
    } finally {
      setIsLoading(false);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'configuracoes-barbearia.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const estadosBrasil = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const diasSemana = [
    { value: "Segunda-feira", label: "Seg", full: "Segunda-feira" },
    { value: "Terça-feira", label: "Ter", full: "Terça-feira" },
    { value: "Quarta-feira", label: "Qua", full: "Quarta-feira" },
    { value: "Quinta-feira", label: "Qui", full: "Quinta-feira" },
    { value: "Sexta-feira", label: "Sex", full: "Sexta-feira" },
    { value: "Sábado", label: "Sáb", full: "Sábado" },
    { value: "Domingo", label: "Dom", full: "Domingo" }
  ];

  if (loadingData) {
    return (
      <div className="settings-page">
        <div className="container">
          <div className="loading">Carregando configurações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="container">
        <div className="header">
          <div>
            <h1>Configurações do Sistema</h1>
            <p>Gerencie todas as configurações da sua barbearia</p>
          </div>
        </div>

        <div className="tabs-section">
          <div className="tabs-nav" role="tablist">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="tab-content" role="tabpanel">
          {activeTab === "perfil" && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-section">
                <h3 className="form-section-title">
                  <FiUser size={20} />
                  Informações Básicas
                </h3>
                <div className="form-grid two-columns">
                  <div className="form-group">
                    <label className="form-label" htmlFor="nomeEstabelecimento">
                      Nome do Estabelecimento *
                    </label>
                    <input
                      type="text"
                      id="nomeEstabelecimento"
                      name="nomeEstabelecimento"
                      className={`form-input ${currentError?.field === "nomeEstabelecimento" ? "field-error" : ""}`}
                      placeholder="Ex: Barbearia Estilo"
                      value={formData.nomeEstabelecimento}
                      onChange={handleInputChange}
                      maxLength={100}
                      required
                    />
                    {currentError?.field === "nomeEstabelecimento" && (
                      <small className="error-message">{currentError.message}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Email Principal *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${currentError?.field === "email" ? "field-error" : ""}`}
                      placeholder="contato@suabarbearia.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {currentError?.field === "email" && (
                      <small className="error-message">{currentError.message}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="telefone">
                      Telefone para Contato *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      className={`form-input ${currentError?.field === "telefone" ? "field-error" : ""}`}
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      required
                    />
                    {currentError?.field === "telefone" && (
                      <small className="error-message">{currentError.message}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="logo-input">
                      Logo do Estabelecimento
                    </label>
                    <div className="logo-upload-section">
                      {!logoPreview ? (
                        <div className={`file-input-wrapper ${currentError?.field === "logo" ? "field-error" : ""}`}>
                          <input
                            id="logo-input"
                            ref={fileInputRef}
                            type="file"
                            name="logo"
                            className="file-input"
                            accept="image/*"
                            onChange={handleInputChange}
                          />
                          <div className="file-input-button">
                            <FiImage size={20} />
                            Escolher Logo
                          </div>
                          {currentError?.field === "logo" && (
                            <small className="error-message">{currentError.message}</small>
                          )}
                        </div>
                      ) : (
                        <div className="logo-preview-container">
                          <div className="logo-preview">
                            <img src={logoPreview} alt="Preview da logo" className="logo-image" />
                            <button
                              type="button"
                              className="remove-logo-button"
                              onClick={removeLogo}
                              title="Remover logo"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="endereco">
                    Endereço Completo *
                  </label>
                  <div className="address-input-wrapper">
                    <input
                      type="text"
                      id="endereco"
                      name="endereco"
                      className={`form-input ${currentError?.field === "endereco" ? "field-error" : ""}`}
                      placeholder="Clique para preencher o endereço"
                      value={formData.endereco}
                      onClick={() => setShowAddressModal(true)}
                      readOnly
                    />
                    <button
                      type="button"
                      className="address-edit-button"
                      onClick={() => setShowAddressModal(true)}
                      title="Editar endereço"
                    >
                      <FiEdit size={16} />
                    </button>
                  </div>
                  {currentError?.field === "endereco" && (
                    <small className="error-message">{currentError.message}</small>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">
                  <FiClock size={20} />
                  Horário de Funcionamento
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Dias de Atendimento *</label>
                    <div className={`days-selector ${currentError?.field === "diasAtendimento" ? "field-error" : ""}`}>
                      {diasSemana.map((dia) => (
                        <button
                          key={dia.value}
                          type="button"
                          className={`day-button ${formData.diasAtendimento.includes(dia.value) ? 'selected' : ''}`}
                          onClick={() => handleDayToggle(dia.value)}
                          title={dia.full}
                        >
                          {dia.label}
                        </button>
                      ))}
                    </div>
                    {currentError?.field === "diasAtendimento" && (
                      <small className="error-message">{currentError.message}</small>
                    )}
                    <small className="helper-text">
                      Clique nos dias para selecionar/desselecionar
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Horário de Atendimento *</label>
                    <div className={`time-inputs ${currentError?.field === "horario" ? "field-error" : ""}`}>
                      <input
                        type="time"
                        name="horarioInicio"
                        className="form-input"
                        value={formData.horarioInicio}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="time-separator">até</span>
                      <input
                        type="time"
                        name="horarioFim"
                        className="form-input"
                        value={formData.horarioFim}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {currentError?.field === "horario" && (
                      <small className="error-message">{currentError.message}</small>
                    )}
                    <small className="helper-text">
                      Total: {stats.horasPorDia.toFixed(1)}h por dia ({stats.horasSemanais.toFixed(1)}h semanais)
                    </small>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FiSave size={20} />
                      Salvar Configurações
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "notificacoes" && (
            <div className="form-section">
              <h3 className="form-section-title">
                <FiBell size={20} />
                Configurações de Notificações
              </h3>
              <p className="section-description">
                Em breve você poderá configurar suas preferências de notificações
              </p>
            </div>
          )}

          {showSuccess && (
            <div className="success-message" role="status">
              <FiCheck size={20} />
              Configurações salvas com sucesso!
            </div>
          )}

          {currentError?.field === "general" && (
            <div className="error-message-general" role="alert">
              <FiAlertTriangle size={20} />
              {currentError.message}
            </div>
          )}
        </div>
      </div>

      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3>
                <FiMapPin size={20} />
                Preencher Endereço Completo
              </h3>
              <button
                type="button"
                className="modal-close-button"
                onClick={() => setShowAddressModal(false)}
                title="Fechar modal"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid two-columns">
                <div className="form-group">
                  <label className="form-label" htmlFor="endereco_rua">
                    Rua *
                  </label>
                  <input
                    type="text"
                    id="endereco_rua"
                    name="endereco_rua"
                    className="form-input"
                    placeholder="Nome da rua"
                    value={formData.enderecoDetalhado.rua}
                    onChange={handleInputChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="endereco_numero">
                    Número *
                  </label>
                  <input
                    type="text"
                    id="endereco_numero"
                    name="endereco_numero"
                    className="form-input"
                    placeholder="Número"
                    value={formData.enderecoDetalhado.numero}
                    onChange={handleInputChange}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endereco_bairro">
                  Bairro *
                </label>
                <input
                  type="text"
                  id="endereco_bairro"
                  name="endereco_bairro"
                  className="form-input"
                  placeholder="Nome do bairro"
                  value={formData.enderecoDetalhado.bairro}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-grid two-columns">
                <div className="form-group">
                  <label className="form-label" htmlFor="endereco_cidade">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    id="endereco_cidade"
                    name="endereco_cidade"
                    className="form-input"
                    placeholder="Nome da cidade"
                    value={formData.enderecoDetalhado.cidade}
                    onChange={handleInputChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="endereco_estado">
                    Estado *
                  </label>
                  <select
                    id="endereco_estado"
                    name="endereco_estado"
                    className="form-select"
                    value={formData.enderecoDetalhado.estado}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o estado</option>
                    {estadosBrasil.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endereco_pontoReferencia">
                  Ponto de Referência (Opcional)
                </label>
                <input
                  type="text"
                  id="endereco_pontoReferencia"
                  name="endereco_pontoReferencia"
                  className="form-input"
                  placeholder="Ex: Próximo ao mercado"
                  value={formData.enderecoDetalhado.pontoReferencia}
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </div>

              {currentError?.field === "endereco" && (
                <div className="error-message-modal">
                  <FiAlertTriangle size={16} />
                  {currentError.message}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-button secondary"
                onClick={() => setShowAddressModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-button primary"
                onClick={handleAddressSubmit}
              >
                <FiCheck size={16} />
                Confirmar Endereço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}