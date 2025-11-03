import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/authContext';
import api from '../../../services/api';
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from 'react-icons/fi';
import './ClientProfile.css';

function ClientProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        senha: '',
        novaSenha: '',
        confirmarSenha: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setProfile({ ...profile, telefone: formatted });
    if (errors.telefone) {
      setErrors({ ...errors, telefone: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!profile.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (profile.novaSenha) {
      if (profile.novaSenha.length < 6) {
        newErrors.novaSenha = 'Senha deve ter no mínimo 6 caracteres';
      }
      if (profile.novaSenha !== profile.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
      if (!profile.senha) {
        newErrors.senha = 'Digite sua senha atual para alterar';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      // Atualizar dados básicos
      const updateData = {
        nome: profile.nome,
        telefone: profile.telefone
      };

      await api.put('/users/profile', updateData);

      // Atualizar senha se fornecida
      if (profile.novaSenha) {
        await api.put('/users/change-password', {
          senha_atual: profile.senha,
          nova_senha: profile.novaSenha
        });
      }

      // Atualizar context
      updateUser({
        ...user,
        nome: profile.nome,
        telefone: profile.telefone
      });

      setSuccessMessage('Perfil atualizado com sucesso!');
      setProfile(prev => ({
        ...prev,
        senha: '',
        novaSenha: '',
        confirmarSenha: ''
      }));

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Erro ao atualizar perfil' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Meu Perfil</h1>
          <p>Atualize suas informações pessoais</p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="error-message-general">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="nome" className="form-label">
              <FiUser size={16} />
              Nome Completo *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={profile.nome}
              onChange={handleChange}
              className={`form-input ${errors.nome ? 'error' : ''}`}
              placeholder="Digite seu nome completo"
            />
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FiMail size={16} />
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="seuemail@example.com"
              disabled
              title="Email não pode ser alterado"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefone" className="form-label">
              <FiPhone size={16} />
              Telefone *
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={profile.telefone}
              onChange={handlePhoneChange}
              className={`form-input ${errors.telefone ? 'error' : ''}`}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
            {errors.telefone && <span className="error-message">{errors.telefone}</span>}
          </div>

          <div className="form-divider">
            <span>Alterar Senha</span>
          </div>

          <div className="form-group">
            <label htmlFor="senha" className="form-label">
              <FiLock size={16} />
              Senha Atual
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={profile.senha}
              onChange={handleChange}
              className={`form-input ${errors.senha ? 'error' : ''}`}
              placeholder="Digite sua senha atual"
            />
            {errors.senha && <span className="error-message">{errors.senha}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="novaSenha" className="form-label">
              <FiLock size={16} />
              Nova Senha
            </label>
            <input
              type="password"
              id="novaSenha"
              name="novaSenha"
              value={profile.novaSenha}
              onChange={handleChange}
              className={`form-input ${errors.novaSenha ? 'error' : ''}`}
              placeholder="Digite uma nova senha"
            />
            {errors.novaSenha && <span className="error-message">{errors.novaSenha}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha" className="form-label">
              <FiLock size={16} />
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              value={profile.confirmarSenha}
              onChange={handleChange}
              className={`form-input ${errors.confirmarSenha ? 'error' : ''}`}
              placeholder="Confirme a nova senha"
            />
            {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              'Salvando...'
            ) : (
              <>
                <FiSave size={18} />
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClientProfile;