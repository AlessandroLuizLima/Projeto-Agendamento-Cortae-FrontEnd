// src/App.jsx
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext';
import './assets/css/App.css';

// Importação das rotas
import HomeRoutes from './routes/routeHome';
import BarberRoutes from './routes/routeBarber';
import ClientRoutes from './routes/routeClient';

// Importação dos Sidebars
import Sidebar from './pages/dashboardBarber/Sidebar/Sidebar';
import SidebarClient from './pages/client/SidebarClient/SidebarClient';

// Componente de Loading
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    Carregando...
  </div>
);

// Componente de Rota Protegida
const ProtectedRoute = ({ children, requiredType }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // CORREÇÃO: Usa os hashes corretos em vez de ?tipo=
    const isClientPath = location.pathname.startsWith('/cliente');
    const authHash = isClientPath ? 'c1a2b3' : 'b4r5b6';
    
    console.log('Usuário não autenticado, redirecionando para:', `/login?auth=${authHash}`);
    
    return <Navigate to={`/login?auth=${authHash}`} replace state={{ from: location }} />;
  }

  // Verifica se o tipo de usuário corresponde ao tipo necessário
  if (requiredType && user?.tipo !== requiredType) {
    console.log('Tipo incorreto. Usuário é:', user?.tipo, 'mas precisa ser:', requiredType);
    
    // Redireciona para a área correta baseado no tipo real do usuário
    if (user?.tipo === 'cliente') {
      return <Navigate to="/cliente" replace />;
    }
    if (user?.tipo === 'barbeiro') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Verifica se a URL atual está dentro do dashboard barbeiro ou cliente
  const isDashboardBarber = location.pathname.startsWith('/dashboard');
  const isClient = location.pathname.startsWith('/cliente');

  // Verifica se deve mostrar sidebar (apenas se estiver logado e na área correta)
  const shouldShowBarberSidebar = isDashboardBarber && isAuthenticated && user?.tipo === 'barbeiro';
  const shouldShowClientSidebar = isClient && isAuthenticated && user?.tipo === 'cliente';

  return (
    <div className="app-container">
      {shouldShowBarberSidebar && <Sidebar />}
      {shouldShowClientSidebar && <SidebarClient />}

      <div className="main-content">
        <Routes>
          {/* Rotas públicas da Home/Landing e Auth */}
          {HomeRoutes()}

          {/* Rotas protegidas do Dashboard Barbeiro */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute requiredType="barbeiro">
              <Routes>
                {BarberRoutes()}
              </Routes>
            </ProtectedRoute>
          } />

          {/* Rotas protegidas do Cliente */}
          <Route path="/cliente/*" element={
            <ProtectedRoute requiredType="cliente">
              <Routes>
                {ClientRoutes()}
              </Routes>
            </ProtectedRoute>
          } />

          {/* Rota fallback para páginas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;