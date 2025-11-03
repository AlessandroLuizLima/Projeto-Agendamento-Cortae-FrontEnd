// ==========================================
// src/pages/auth/AuthPage.jsx
// ==========================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineUser,
  AiOutlinePhone,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineKey
} from 'react-icons/ai';
import { MdSecurity } from 'react-icons/md';
import { useAuth } from '../../contexts/authContext';
import './AuthPage.css';

// Mapeamento de hashes para tipos de usuário
const AUTH_HASH_MAP = {
  'c1a2b3': 'cliente',
  'b4r5b6': 'barbeiro'
};

function FormInput({
  label,
  icon: Icon,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  autoComplete,
  error,
  required,
  showToggle,
  onToggle,
  showValue
}) {
  return (
    <div className="form-group">
      <label className={`form-label ${required ? 'required' : ''}`}>
        {Icon && <Icon size={16} style={{ marginRight: 6 }} />}
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={showToggle ? (showValue ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={`form-input ${error ? 'error' : ''} ${value && !error ? 'success' : ''}`}
          style={{ paddingRight: showToggle ? '60px' : '12px' }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="password-toggle"
            aria-label={showValue ? "Ocultar" : "Mostrar"}
          >
            {showValue ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
          </button>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

function PasswordStrengthMeter({ strength }) {
  const getColor = () => {
    if (strength < 40) return '#ef4444';
    if (strength < 70) return '#f59e0b';
    return '#10b981';
  };

  const getText = () => {
    if (strength < 40) return 'Senha Fraca';
    if (strength < 70) return 'Senha Média';
    return 'Senha Forte';
  };

  return (
    <div className="password-strength">
      <div className="strength-bar" aria-hidden>
        <div
          className="strength-fill"
          style={{
            width: `${strength}%`,
            backgroundColor: getColor()
          }}
        />
      </div>
      <div className="strength-text" style={{ color: getColor() }}>
        {getText()}
      </div>
    </div>
  );
}

function SuccessNotification({ message }) {
  return (
    <div className="success-notification" role="status" aria-live="polite">
      <div className="success-icon">
        <AiOutlineCheckCircle size={20} />
      </div>
      <p>{message}</p>
    </div>
  );
}

function ModeToggle({ isLogin, onToggle }) {
  return (
    <div className="mode-toggle" role="tablist" aria-label="Modo">
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`toggle-btn ${isLogin ? 'active' : ''}`}
        role="tab"
        aria-selected={isLogin}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`toggle-btn ${!isLogin ? 'active' : ''}`}
        role="tab"
        aria-selected={!isLogin}
      >
        Cadastro
      </button>
    </div>
  );
}

function AuthHeader({ title, subtitle }) {
  return (
    <div className="auth-header">
      <div className="auth-logo" aria-hidden>
        <MdSecurity size={32} color="white" />
      </div>
      <h1 className="auth-title">{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>
    </div>
  );
}

function SecurityBadge({ text }) {
  return (
    <div className="security-badge" aria-hidden>
      <MdSecurity size={16} />
      {text}
    </div>
  );
}

function ToggleText({ question, linkText, onClick }) {
  return (
    <div className="toggle-text">
      <p>
        {question}
        <button
          type="button"
          onClick={onClick}
          className="toggle-link"
        >
          {linkText}
        </button>
      </p>
    </div>
  );
}

function SubmitButton({ disabled, text }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`btn-primary ${disabled ? 'btn-loading' : ''}`}
    >
      {text}
    </button>
  );
}

// Componente Principal
const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // Ler hash 
  const query = new URLSearchParams(location.search);
  const authHash = query.get('auth') || 'c1a2b3'; // Default para cliente

  // Detecta tipo com base no mapeamento
  const detectedTipo = AUTH_HASH_MAP[authHash] || 'cliente';

  // Estado inicial: se pathname é /login → modo login, se /register → registro
  const initialIsLogin = location.pathname === '/login';

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    codigoAcesso: ''
  });

  // Reset quando muda entre login/register ou quando muda query/path
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setErrors({});
    setPasswordStrength(0);
    setSuccessMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAccessCode(false);
    setForm({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      telefone: '',
      codigoAcesso: ''
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const formatTelefone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;
    return { strength: (strength / 5) * 100, checks };
  };

  const validatePassword = (password) => {
    const result = calculatePasswordStrength(password);
    return {
      isValid: result.strength >= 60,
      strength: result.strength,
      checks: result.checks
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'telefone':
        formattedValue = formatTelefone(value);
        break;
      case 'nome':
        formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        break;
      case 'codigoAcesso':
        formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;
      case 'senha':
        if (!isLogin) {
          const validation = validatePassword(value);
          setPasswordStrength(validation.strength);
        }
        break;
      default:
        formattedValue = value;
    }

    setForm(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!form.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (!isLogin) {
      const passwordValidation = validatePassword(form.senha);
      if (!passwordValidation.isValid) {
        newErrors.senha = 'Senha deve ter no mínimo 8 caracteres com letras e números';
      }
    } else if (form.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!isLogin) {
      if (!form.nome) {
        newErrors.nome = 'Nome é obrigatório';
      } else if (form.nome.trim().length < 3) {
        newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
      }

      if (!form.telefone) {
        newErrors.telefone = 'Telefone é obrigatório';
      } else if (form.telefone.replace(/\D/g, '').length < 10) {
        newErrors.telefone = 'Telefone inválido';
      }

      if (!form.confirmarSenha) {
        newErrors.confirmarSenha = 'Confirme sua senha';
      } else if (form.senha !== form.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }

      // Validação do código de acesso para barbeiros
      if (detectedTipo === 'barbeiro') {
        if (!form.codigoAcesso) {
          newErrors.codigoAcesso = 'Código de acesso é obrigatório para barbeiros';
        } else if (form.codigoAcesso.length < 6) {
          newErrors.codigoAcesso = 'Código de acesso deve ter no mínimo 6 caracteres';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Limpar erros anteriores

    try {
      if (isLogin) {
        // LOGIN
        console.log('Tentando fazer login com:', { email: form.email, tipo: detectedTipo });
        
        const response = await auth.signIn(form.email, form.senha, detectedTipo);
        
        console.log('Response completo do signIn:', response);
        
        // O signIn retorna response.data.data que contém { user, token }
        const userTipo = response?.user?.tipo || detectedTipo;
        
        console.log('Tipo do usuário:', userTipo);
        
        setSuccessMessage('Login realizado com sucesso!');
        
        // Redirecionar baseado no tipo
        setTimeout(() => {
          if (userTipo === 'cliente') {
            console.log('Redirecionando para /cliente');
            navigate('/cliente', { replace: true });
          } else if (userTipo === 'barbeiro') {
            console.log('Redirecionando para /dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.warn('Tipo desconhecido, redirecionando para /cliente');
            navigate('/cliente', { replace: true });
          }
        }, 800);

      } else {
        // CADASTRO
        const payload = {
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone,
          tipo: detectedTipo
        };

        if (detectedTipo === 'barbeiro') {
          payload.codigoAcesso = form.codigoAcesso;
        }

        console.log('Tentando cadastrar com:', payload);

        await auth.signUp(payload);

        setSuccessMessage('Cadastro realizado! Redirecionando para o login...');
        
        setTimeout(() => {
          navigate(`/login?auth=${authHash}`, { replace: true });
        }, 1500);
      }

      // Limpar formulário
      setForm({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        telefone: '',
        codigoAcesso: ''
      });

    } catch (error) {
      console.error('Erro completo:', error);
      
      let errorMessage = 'Erro ao processar solicitação';
      
      if (error.response) {
        // Erro vindo do servidor
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.message) {
        // Erro da biblioteca ou rede
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Alterna entre /login e /register preservando auth hash
  const handleModeToggle = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    if (nextIsLogin) {
      navigate(`/login?auth=${authHash}`, { replace: true });
    } else {
      navigate(`/register?auth=${authHash}`, { replace: true });
    }
  };

  // Botões de alternância texto inferior
  const handleToggleTextClick = () => {
    if (isLogin) {
      navigate(`/register?auth=${authHash}`);
    } else {
      navigate(`/login?auth=${authHash}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box" role="main">
        {successMessage && <SuccessNotification message={successMessage} />}

        <AuthHeader
          title={isLogin ? 'Bem-vindo de volta!' : 'Criar nova conta'}
          subtitle={isLogin
            ? `Entre com suas credenciais ${detectedTipo === 'cliente' ? 'de cliente' : 'de barbeiro'}`
            : `Cadastre-se como ${detectedTipo === 'cliente' ? 'cliente' : 'barbeiro'}`
          }
        />

        <ModeToggle isLogin={isLogin} onToggle={handleModeToggle} />

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <FormInput
              label="Nome completo"
              icon={AiOutlineUser}
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              maxLength={100}
              error={errors.nome}
              required={true}
              showToggle={false}
            />
          )}

          <FormInput
            label="Email"
            icon={AiOutlineMail}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email}
            required={true}
            showToggle={false}
          />

          {!isLogin && (
            <FormInput
              label="Telefone"
              icon={AiOutlinePhone}
              type="tel"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(11) 91234-5678"
              maxLength={15}
              error={errors.telefone}
              required={true}
              showToggle={false}
            />
          )}

          {!isLogin && detectedTipo === 'barbeiro' && (
            <FormInput
              label="Código de Acesso (Barbeiro)"
              icon={AiOutlineKey}
              name="codigoAcesso"
              value={form.codigoAcesso}
              onChange={handleChange}
              placeholder="Digite o código de acesso"
              maxLength={20}
              error={errors.codigoAcesso}
              required={true}
              showToggle={true}
              onToggle={() => setShowAccessCode(!showAccessCode)}
              showValue={showAccessCode}
            />
          )}

          <FormInput
            label="Senha"
            icon={AiOutlineLock}
            name="senha"
            value={form.senha}
            onChange={handleChange}
            placeholder={isLogin ? "Digite sua senha" : "Mínimo 8 caracteres"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            error={errors.senha}
            required={true}
            showToggle={true}
            onToggle={() => setShowPassword(!showPassword)}
            showValue={showPassword}
          />

          {!isLogin && form.senha && (
            <PasswordStrengthMeter strength={passwordStrength} />
          )}

          {!isLogin && (
            <FormInput
              label="Confirmar senha"
              icon={AiOutlineLock}
              name="confirmarSenha"
              value={form.confirmarSenha}
              onChange={handleChange}
              placeholder="Digite a senha novamente"
              autoComplete="new-password"
              error={errors.confirmarSenha}
              required={true}
              showToggle={true}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              showValue={showConfirmPassword}
            />
          )}

          {errors.submit && (
            <div className="error-message" style={{ marginTop: '16px', textAlign: 'center' }}>
              {errors.submit}
            </div>
          )}

          <SubmitButton
            disabled={isLoading}
            text={isLoading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta')}
          />
        </form>

        <ToggleText
          question={isLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
          linkText={isLogin ? 'Criar conta' : 'Fazer login'}
          onClick={handleToggleTextClick}
        />

        <SecurityBadge text="Seus dados estão protegidos com criptografia de ponta a ponta" />
      </div>
    </div>
  );
};

export default AuthPage;