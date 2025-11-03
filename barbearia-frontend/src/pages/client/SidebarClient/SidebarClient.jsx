import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome, FiCalendar, FiUser, FiLogOut, FiSun, FiMoon, FiMenu, FiX
} from "react-icons/fi";
import { useAuth } from "../../../contexts/authContext";
import './SidebarClient.css';

const SidebarClient = () => {
  const { user, signOut } = useAuth();
  const [isLightMode, setIsLightMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const body = document.body;
    if (isLightMode) {
      body.classList.add("light-mode");
    } else {
      body.classList.remove("light-mode");
    }
  }, [isLightMode]);

  const handleLogout = () => {
    signOut();
    navigate('/cliente/login');
  };

  return (
    <>
      <button 
        className="hamburger-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="profile">
          <div className="profile-icon">
            {user?.foto_perfil ? (
              <img src={user.foto_perfil} alt="Perfil" />
            ) : (
              <FiUser size={28} />
            )}
          </div>
          <div className="profile-text">
            <h2>Bem-vindo, {user?.nome?.split(' ')[0] || 'Cliente'}</h2>
            <p>Agende seus serviços</p>
          </div>
        </div>

        <nav className="menu">
          <ul>
            <li><Link to="/client" onClick={closeSidebar}><FiHome className="icon" /> Home</Link></li>
            <li><Link to="/client/agendamentos" onClick={closeSidebar}><FiCalendar className="icon" /> Agendamentos</Link></li>
            <li><Link to="/client/perfil" onClick={closeSidebar}><FiUser className="icon" /> Perfil</Link></li>
          </ul>
        </nav>

        <div className="bottom-options">
          <div className="mode-toggle" onClick={toggleTheme}>
            {isLightMode ? <FiMoon className="icon" /> : <FiSun className="icon" />}
            {isLightMode ? "Modo Escuro" : "Modo Claro"}
          </div>
          <div className="logout" onClick={handleLogout}>
            <FiLogOut className="icon" /> Sair
          </div>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
    </>
  );
};

export default SidebarClient;