import React, { useState, useEffect } from 'react';
import CreditCard from '../components/CreditCard';
import { creditService } from '../services/firebaseServices';
import './Simulator.css';

const Simulator = () => {
  const [credits, setCredits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [amountRange, setAmountRange] = useState(1000000);
  const [interestRange, setInterestRange] = useState(0);
  const [sortByInterest, setSortByInterest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    search: false,
    amount: false,
    interest: false,
    sort: false
  });
  
  // Cargar créditos desde Firebase
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoading(true);
        const creditsData = await creditService.getAllCredits();
        setCredits(creditsData);
        setError(null);
        
        // Calcular tasa de interés máxima disponible
        if (creditsData.length > 0) {
          const maxInterest = Math.max(...creditsData.map(c => Number(c.interestRate) || 0));
          setInterestRange(maxInterest);
        }
      } catch (err) {
        console.error("Error fetching credits:", err);
        setError("❌ Error al cargar los créditos. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  // Actualizar estado de filtros activos
  useEffect(() => {
    const newActiveFilters = {
      search: searchTerm.length > 0,
      amount: amountRange !== 1000000,
      interest: interestRange > 0,
      sort: sortByInterest
    };
    setActiveFilters(newActiveFilters);
  }, [searchTerm, amountRange, interestRange, sortByInterest]);

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    if (!credits.length) return;

    let filtered = credits.filter(credit => {
      // Filtro por búsqueda de nombre
      const matchesSearch = credit.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por monto máximo
      const minAmount = Number(credit.minAmount) || 0;
      const maxAmount = Number(credit.maxAmount) || Infinity;
      const matchesAmount = amountRange === 1000000 || 
        (minAmount <= amountRange && maxAmount >= amountRange);
      
      // Filtro por tasa de interés máxima
      const creditInterestRate = Number(credit.interestRate) || 0;
      const matchesInterest = interestRange === 0 || 
        creditInterestRate <= interestRange;
      
      return matchesSearch && matchesAmount && matchesInterest;
    });

    // Ordenar si es necesario
    if (sortByInterest) {
      filtered.sort((a, b) => {
        const rateA = Number(a.interestRate) || 0;
        const rateB = Number(b.interestRate) || 0;
        return rateA - rateB;
      });
    }

    setFilteredCredits(filtered);
  }, [credits, searchTerm, amountRange, interestRange, sortByInterest]);

  // Calcular valores mínimos y máximos para los sliders
  const maxAmountInCredits = credits.length > 0 
    ? Math.max(...credits.map(c => Number(c.maxAmount) || 0))
    : 500000000;

  const minAmountInCredits = credits.length > 0
    ? Math.min(...credits.map(c => Number(c.minAmount) || 0))
    : 1000000;

  const maxInterestInCredits = credits.length > 0
    ? Math.max(...credits.map(c => Number(c.interestRate) || 0))
    : 30;

  const minInterestInCredits = credits.length > 0
    ? Math.min(...credits.map(c => Number(c.interestRate) || 0))
    : 0;

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm('');
    setAmountRange(1000000);
    setInterestRange(maxInterestInCredits);
    setSortByInterest(false);
  };

  // Contar filtros activos
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  if (loading) {
    return (
      <div className="simulator-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>🔄 Cargando créditos...</p>
          <p className="firebase-info">Conectando</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simulator-container">
        <div className="error-message">
          <h3>❌ Error de Conexión</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>🔄 Reintentar</button>
          <p className="fallback-info">
            Si el problema persiste, verifica tu conexión a internet y a la base de datos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="simulator-container">
      <header className="simulator-header">
        <h1>🔍 Simulador de Crédito</h1>
        <p>Encuentra y compara las mejores opciones</p>
        
      </header>
      
      {/* Resumen de filtros activos */}
      {activeFilterCount > 0 && (
        <div className="active-filters-summary">
          <div className="filters-summary-header">
            <h4>🎯 Filtros activos ({activeFilterCount})</h4>
            <button 
              onClick={clearAllFilters}
              className="clear-all-filters-btn"
            >
              🗑️ Limpiar todos
            </button>
          </div>
          <div className="active-filters-list">
            {activeFilters.search && (
              <span className="active-filter-tag">
                🔍 Buscando: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}>✕</button>
              </span>
            )}
            {activeFilters.amount && (
              <span className="active-filter-tag">
                💰 Monto máximo: ${amountRange.toLocaleString()}
                <button onClick={() => setAmountRange(1000000)}>✕</button>
              </span>
            )}
            {activeFilters.interest && (
              <span className="active-filter-tag">
                📈 Tasa máxima: {interestRange}%
                <button onClick={() => setInterestRange(maxInterestInCredits)}>✕</button>
              </span>
            )}
            {activeFilters.sort && (
              <span className="active-filter-tag">
                📊 Ordenado por tasa
                <button onClick={() => setSortByInterest(false)}>✕</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="filters-section">
        {/* Búsqueda por nombre */}
        <div className="search-box">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Buscar por nombre de crédito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Filtros principales */}
        <div className="filters-main">
          {/* Filtro por monto */}
          <div className="filter-group">
            <div className="filter-header">
              <label htmlFor="amountRange">
                💰 Filtrar por monto máximo
              </label>
              <span className="filter-value">${amountRange.toLocaleString()}</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                id="amountRange"
                min={minAmountInCredits}
                max={maxAmountInCredits}
                step="1000000"
                value={amountRange}
                onChange={(e) => setAmountRange(Number(e.target.value))}
                className="amount-slider"
              />
              <div className="slider-labels">
                <span>${minAmountInCredits.toLocaleString()}</span>
                <span>${maxAmountInCredits.toLocaleString()}</span>
              </div>
            </div>
            <div className="slider-actions">
              <button 
                className="reset-slider-btn"
                onClick={() => setAmountRange(1000000)}
                disabled={amountRange === 1000000}
              >
                Reiniciar monto
              </button>
            </div>
          </div>

          {/* Filtro por tasa de interés - NUEVO */}
          <div className="filter-group">
            <div className="filter-header">
              <label htmlFor="interestRange">
                📈 Filtrar por tasa de interés máxima
              </label>
              <span className="filter-value">{interestRange}%</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                id="interestRange"
                min={minInterestInCredits}
                max={maxInterestInCredits}
                step="0.5"
                value={interestRange}
                onChange={(e) => setInterestRange(Number(e.target.value))}
                className="interest-slider"
              />
              <div className="slider-labels">
                <span>{minInterestInCredits}%</span>
                <span>{maxInterestInCredits}%</span>
              </div>
            </div>
            <div className="slider-actions">
              <button 
                className="reset-slider-btn"
                onClick={() => setInterestRange(maxInterestInCredits)}
                disabled={interestRange === maxInterestInCredits}
              >
                Reiniciar tasa
              </button>
            </div>
            <div className="interest-range-info">
              <span className="range-min">Mín: {minInterestInCredits}%</span>
              <span className="range-max">Máx: {maxInterestInCredits}%</span>
            </div>
          </div>
        </div>

        {/* Opciones de ordenamiento */}
        <div className="sorting-section">
          <div className="sort-options">
            <div className="sort-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={sortByInterest}
                  onChange={() => setSortByInterest(!sortByInterest)}
                  className="sort-checkbox-input"
                />
                <span className=""></span>
                📊 Ordenar por tasa de interés (menor a mayor)
              </label>
              <div className="sort-info">
                {sortByInterest ? "Orden ascendente por tasa" : "Orden predeterminado"}
              </div>
            </div>
          </div>

          {/* Estadísticas de filtrado */}
          <div className="filter-stats">
            <div className="stat-item">
              <span className="stat-label">Productos totales:</span>
              <span className="stat-value total">{credits.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mostrando:</span>
              <span className="stat-value showing">{filteredCredits.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tasa promedio:</span>
              <span className="stat-value avg">
                {credits.length > 0 
                  ? (credits.reduce((sum, c) => sum + Number(c.interestRate || 0), 0) / credits.length).toFixed(1)
                  : '0.0'
                }%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resultados */}
      <div className="results-section">
        <div className="results-header">
          <h3>
            {filteredCredits.length === credits.length 
              ? "Todos los productos crediticios disponibles" 
              : `Resultados filtrados (${filteredCredits.length} de ${credits.length})`
            }
          </h3>
          
          {/* Resumen de filtros aplicados */}
          <div className="filters-applied-summary">
            {activeFilters.search && (
              <span className="applied-filter">
                🔍 <strong>{searchTerm}</strong>
              </span>
            )}
            {activeFilters.amount && (
              <span className="applied-filter">
                💰 <strong>${amountRange.toLocaleString()}</strong>
              </span>
            )}
            {activeFilters.interest && (
              <span className="applied-filter">
                📈 <strong>{interestRange}% tasa máx</strong>
              </span>
            )}
            {activeFilters.sort && (
              <span className="applied-filter">
                📊 <strong>Ordenado por tasa</strong>
              </span>
            )}
          </div>
        </div>
        
        {filteredCredits.length > 0 ? (
          <>
            {/* Resumen de resultados */}
            <div className="results-summary">
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">📋 Productos encontrados:</span>
                  <span className="summary-value">{filteredCredits.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">💰 Monto máximo filtrado:</span>
                  <span className="summary-value">${amountRange.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">📈 Tasa máxima filtrada:</span>
                  <span className="summary-value">{interestRange}%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">🎯 Tasa promedio:</span>
                  <span className="summary-value">
                    {filteredCredits.length > 0 
                      ? (filteredCredits.reduce((sum, c) => sum + Number(c.interestRate || 0), 0) / filteredCredits.length).toFixed(1)
                      : '0.0'
                    }%
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de créditos */}
            <div className="credits-grid">
              {filteredCredits.map(credit => (
                <CreditCard key={credit.id} credit={credit} />
              ))}
            </div>

            {/* Resumen final */}
            <div className="final-summary">
              <p>
                🎯 Mostrando <strong>{filteredCredits.length}</strong> de <strong>{credits.length}</strong> productos crediticios
                {activeFilters.search && ` para "${searchTerm}"`}
                {activeFilters.amount && ` con monto máximo de $${amountRange.toLocaleString()}`}
                {activeFilters.interest && ` con tasa máxima de ${interestRange}%`}
                {activeFilters.sort && `, ordenados por tasa de interés`}
              </p>
              <div className="summary-actions">
                <button 
                  onClick={clearAllFilters}
                  className="summary-clear-btn"
                >
                  🗑️ Limpiar todos los filtros
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="summary-refresh-btn"
                >
                  🔄 Recargar datos
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No hay créditos disponibles con los filtros aplicados</h3>
            <p>Intenta con otros criterios de búsqueda:</p>
            <ul className="suggestions">
              <li>✅ Usa un término de búsqueda diferente</li>
              <li>✅ Aumenta el rango de monto máximo</li>
              <li>✅ Aumenta el rango de tasa de interés</li>
              <li>✅ Quita algunos filtros para ver todos los productos</li>
            </ul>
            <div className="no-results-actions">
              <button 
                onClick={clearAllFilters}
                className="reset-filters-btn"
              >
                🗑️ Limpiar todos los filtros
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="refresh-btn"
              >
                🔄 Recargar datos
              </button>
            </div>
            
            {/* Sugerencias de filtros */}
            <div className="filter-suggestions">
              <h4>💡 Sugerencias:</h4>
              <div className="suggestion-cards">
                <div className="suggestion-card">
                  <div className="suggestion-icon">💰</div>
                  <div className="suggestion-content">
                    <strong>Prueba con monto máximo:</strong>
                    <p>${maxAmountInCredits.toLocaleString()}</p>
                    <button 
                      onClick={() => setAmountRange(maxAmountInCredits)}
                      className="suggestion-btn"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
                <div className="suggestion-card">
                  <div className="suggestion-icon">📈</div>
                  <div className="suggestion-content">
                    <strong>Prueba con tasa máxima:</strong>
                    <p>{maxInterestInCredits}%</p>
                    <button 
                      onClick={() => setInterestRange(maxInterestInCredits)}
                      className="suggestion-btn"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
                <div className="suggestion-card">
                  <div className="suggestion-icon">🔍</div>
                  <div className="suggestion-content">
                    <strong>Busca por tipo:</strong>
                    <p>"Personal", "Vivienda", "Vehículo"</p>
                    <button 
                      onClick={() => setSearchTerm('Crédito')}
                      className="suggestion-btn"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulator;