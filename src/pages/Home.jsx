import React, { useState, useEffect } from 'react';
import CreditCard from '../components/CreditCard';
import { creditService } from '../services/firebaseServices';
import './Home.css';

const Home = () => {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoading(true);
        const creditsData = await creditService.getAllCredits();
        setCredits(creditsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching credits:", err);
        setError("Error al cargar los productos crediticios. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando productos crediticios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">
          <h3> Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

      return (
        <div className="home-container">
          <section className="banner">
            <h2>Encuentra el crédito ideal para ti</h2>
            <p>Compara y solicita entre más de 5 tipos de crédito con las mejores tasas del mercado</p>
          </section>
          
          <h2 class="section-title">Catálogo de Créditos Disponibles</h2>
      
      <div className="credits-grid">
        {credits.map((credit) => (
          <CreditCard key={credit.id} credit={credit} />
        ))}
      </div>
    </div>
  );
};

export default Home;