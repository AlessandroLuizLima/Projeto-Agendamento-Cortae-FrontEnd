// ============================================
// src/contexts/authContext.jsx
// Context de Autenticação para React
// ============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// URL base da API
const API_URL = 'http://localhost:3000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se existe token salvo ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          // Verificar se o token ainda é válido
          const response = await axios.get(`${API_URL}/verify`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });

          if (response.data.success) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          } else {
            // Token inválido, limpar storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Token inválido:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // SIGN UP (Cadastro)
  const signUp = async (userData) => {
    try {
      console.log('AuthContext - Enviando dados de cadastro:', userData);
      
      const response = await axios.post(`${API_URL}/register`, userData);

      console.log('AuthContext - Response do cadastro:', response.data);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Cadastro realizado com sucesso!'
        };
      } else {
        throw new Error(response.data.message || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      console.error('AuthContext - Erro no cadastro:', error);
      
      // Melhor tratamento de erro
      if (error.response) {
        // Erro vindo do servidor
        throw {
          message: error.response.data?.message || error.response.data?.error || 'Erro ao realizar cadastro',
          response: error.response
        };
      } else if (error.request) {
        // Erro de rede
        throw {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
          request: error.request
        };
      } else {
        // Outro tipo de erro
        throw {
          message: error.message || 'Erro desconhecido ao realizar cadastro'
        };
      }
    }
  };

  // SIGN IN (Login)
  const signIn = async (email, senha, tipo = 'cliente') => {
    try {
      console.log('AuthContext - Tentando login:', { email, tipo });
      
      const response = await axios.post(`${API_URL}/login`, {
        email,
        senha,
        tipo
      });

      console.log('AuthContext - Response completo do login:', response.data);

      if (response.data.success) {
        // Extrair dados do usuário e token
        const { user: userData, token: userToken } = response.data.data;

        console.log('AuthContext - Dados do usuário:', userData);
        console.log('AuthContext - Token:', userToken);

        // Salvar no state
        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(true);

        // Salvar no localStorage
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Retornar os dados para o componente
        return {
          user: userData,
          token: userToken,
          success: true
        };
      } else {
        throw new Error(response.data.message || 'Erro ao realizar login');
      }
    } catch (error) {
      console.error('AuthContext - Erro no login:', error);
      
      // Melhor tratamento de erro
      if (error.response) {
        // Erro vindo do servidor (401, 400, etc)
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Credenciais inválidas';
        
        throw {
          message: errorMessage,
          status: error.response.status,
          response: error.response
        };
      } else if (error.request) {
        // Erro de rede
        throw {
          message: 'Erro de conexão. Verifique se o servidor está rodando.',
          request: error.request
        };
      } else {
        // Outro tipo de erro
        throw {
          message: error.message || 'Erro desconhecido ao fazer login'
        };
      }
    }
  };

  // SIGN OUT (Logout)
  const signOut = () => {
    console.log('AuthContext - Fazendo logout');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ATUALIZAR PERFIL
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error.response?.data || error;
    }
  };

  // ALTERAR SENHA
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(
        `${API_URL}/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error.response?.data || error;
    }
  };

  // OBTER PERFIL ATUALIZADO
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error.response?.data || error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;