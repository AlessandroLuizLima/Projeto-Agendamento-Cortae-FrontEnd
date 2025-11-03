// ============================================
// src/components/ProtectedRoute.jsx
// Componente para proteger rotas que requerem autenticação
// ============================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const ProtectedRoute = ({ children, requiredType = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Carregando...
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    // Salvar a rota que o usuário estava tentando acessar
    return <Navigate to="/login?auth=c1a2b3" state={{ from: location }} replace />;
  }

  // Se requiredType foi especificado, verificar tipo do usuário
  if (requiredType && user?.tipo !== requiredType) {
    // Redirecionar para a página apropriada baseada no tipo do usuário
    if (user?.tipo === 'cliente') {
      return <Navigate to="/cliente" replace />;
    } else if (user?.tipo === 'barbeiro') {
      return <Navigate to="/dashboard" replace />;
    }
    // Se não tiver tipo válido, redirecionar para login
    return <Navigate to="/login?auth=c1a2b3" replace />;
  }

  // Se passou por todas as verificações, renderizar o componente filho
  return children;
};

export default ProtectedRoute;