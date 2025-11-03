import React from 'react';
import { Route } from 'react-router-dom';

// Importações do dashboard barbeiro
import Dashboard from '../pages/dashboardBarber/Dashboard/Dashboard';
import Agenda from '../pages/dashboardBarber/Schedule/Schedule';
import Clients from '../pages/dashboardBarber/Clients/Clients';
import Services from '../pages/dashboardBarber/Services/Services';
import Products from '../pages/dashboardBarber/Products/Products';
import Financial from '../pages/dashboardBarber/Financial/Financial';
import Report from '../pages/dashboardBarber/Report/Report';
import Settings from '../pages/dashboardBarber/Settings/Settings';

const BarberRoutes = () => {
  return (
    <>
      {/* Rota principal do dashboard (index) */}
      <Route index element={<Dashboard />} />
      
      {/* Rotas do dashboard barbeiro (sem /dashboard no path pois já está no parent) */}
      <Route path="agenda" element={<Agenda />} />
      <Route path="clientes" element={<Clients />} />
      <Route path="servicos" element={<Services />} />
      <Route path="produtos" element={<Products />} />
      <Route path="financeiro" element={<Financial />} />
      <Route path="relatorio" element={<Report />} />
      <Route path="configuracoes" element={<Settings />} />
    </>
  );
};

export default BarberRoutes;