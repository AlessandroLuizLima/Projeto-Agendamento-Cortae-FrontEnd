// src/routes/routeHome.jsx
import React from 'react';
import { Route } from 'react-router-dom';
import LandingPage from '../pages/landingPage/LandingPage';
import AuthPage from '../pages/auth/AuthPage';

const HomeRoutes = () => (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
  </>
);

export default HomeRoutes;
