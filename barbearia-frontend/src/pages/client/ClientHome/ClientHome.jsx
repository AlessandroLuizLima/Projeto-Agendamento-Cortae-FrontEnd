import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaBell, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import api from '../../../services/api';
import './ClientHome.css';

function Header({ greeting, date, onNotificationClick, user }) {
  return (
    <header className="header">
      <div>
        <h1 className="greeting">{greeting}</h1>
        <p className="date">{date}</p>
      </div>
      <button 
        className="notification-btn"
        onClick={onNotificationClick}
        aria-label="Notificações"
      >
        <FaBell size={24} />
      </button>
    </header>
  );
}

function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="search-container">
      <div className="search-wrapper">
        <FaSearch className="search-icon" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          className="search-input"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function BarbershopCard({ name, address, distance, onClick }) {
  return (
    <div className="barbershop-card" onClick={onClick}>
      <div className="card-left">
        <div className="avatar">
          <div className="avatar-icon">👤</div>
        </div>
        <div className="card-info">
          <h3 className="barbershop-name">{name}</h3>
          <p className="barbershop-address">{address}</p>
        </div>
      </div>
      <div className="card-right">
        <FaMapMarkerAlt size={18} className="location-icon" />
        <span className="distance">{distance}</span>
      </div>
    </div>
  );
}

const ClientHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBarbershops();
  }, []);

  const loadBarbershops = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbershops', {
        params: { page: 1, limit: 20 }
      });
      
      const data = response.data.barbershops || [];
      setBarbershops(data.map(shop => ({
        id: shop.id,
        name: shop.nome_barbearia,
        address: `${shop.cidade || ''}, ${shop.estado || ''}`,
        distance: '1.2km' // Mock - você pode calcular depois
      })));
    } catch (error) {
      console.error('Erro ao carregar barbearias:', error);
      // Usar dados mock em caso de erro
      setBarbershops([
        { id: 1, name: 'Barbearia Faustino', address: 'Centro', distance: '1.2km' },
        { id: 2, name: 'Barbearia Style', address: 'Jardim', distance: '1.6km' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarbershops = barbershops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNotificationClick = () => {
    alert('Notificações');
  };

  const handleCardClick = (id) => {
    navigate(`/client/barbearia/${id}`);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">Carregando barbearias...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header 
        greeting={`Olá, ${user?.nome?.split(' ')[0] || 'Cliente'}`}
        date={getCurrentDate()}
        onNotificationClick={handleNotificationClick}
        user={user}
      />

      <SearchBar 
        placeholder="Encontrar barbearia"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <main className="main-content">
        <h2 className="section-title">Barbearias Disponíveis</h2>
        <div className="barbershop-list">
          {filteredBarbershops.length === 0 ? (
            <div className="no-results">
              <p>Nenhuma barbearia encontrada</p>
            </div>
          ) : (
            filteredBarbershops.map((shop) => (
              <BarbershopCard 
                key={shop.id}
                name={shop.name}
                address={shop.address}
                distance={shop.distance}
                onClick={() => handleCardClick(shop.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientHome;