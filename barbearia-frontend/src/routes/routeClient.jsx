import React from 'react';
import { Route } from 'react-router-dom';

// Importações do cliente
import ClientHome from '../pages/client/ClientHome/ClientHome';
import ClientBooking from '../pages/client/ClientBooking/ClientBooking';
import ClientProfile from '../pages/client/ClientProfile/ClientProfile';
import BarberShopDetails from '../pages/client/BarberShopDetails/BarberShopDetails';

const ClientRoutes = () => {
  return (
    <>
      {/* Rota principal do cliente (index) */}
      <Route index element={<ClientHome />} />
      
      {/* Rotas do cliente (sem /cliente no path pois já está no parent) */}
      <Route path="agendamentos" element={<ClientBooking />} />
      <Route path="perfil" element={<ClientProfile />} />
      <Route path="barbearia/:id" element={<BarberShopDetails />} />
    </>
  );
};

export default ClientRoutes;