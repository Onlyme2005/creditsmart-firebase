import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/firebaseServices';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    email: '',
    creditType: '',
    minAmount: '',
    maxAmount: '',
    status: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' o 'mine'

  // Cargar todas las solicitudes desde Firebase
  useEffect(() => {
    const loadAllApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar la función que obtiene todas las aplicaciones
        const allApps = await applicationService.getAllApplications();
        setApplications(allApps);
        
        if (allApps.length === 0) {
          setError('No se encontraron solicitudes de crédito en la base de datos.');
        }
      } catch (err) {
        console.error("Error fetching all applications:", err);
        setError(" Error al cargar las solicitudes. Verifica tu conexión.");
      } finally {
        setLoading(false);
      }
    };

    loadAllApplications();
  }, []);

  // Manejar cambio de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Aplicar filtros
  const filteredApplications = applications.filter(app => {
    // Filtro por email
    const matchesEmail = !filters.email || 
      app.email?.toLowerCase().includes(filters.email.toLowerCase());
    
    // Filtro por tipo de crédito
    const matchesCreditType = !filters.creditType || 
      app.creditType === filters.creditType;
    
    // Filtro por monto mínimo
    const matchesMinAmount = !filters.minAmount || 
      app.amount >= Number(filters.minAmount);
    
    // Filtro por monto máximo
    const matchesMaxAmount = !filters.maxAmount || 
      app.amount <= Number(filters.maxAmount);
    
    // Filtro por estado
    const matchesStatus = !filters.status || 
      app.status === filters.status;
    
    // Filtro de búsqueda general
    const matchesSearch = !searchQuery || 
      app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.creditType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id?.includes(searchQuery) ||
      app.fullName?.includes(searchQuery) ||
      app.email?.includes(searchQuery);

    return matchesEmail && matchesCreditType && matchesMinAmount && 
           matchesMaxAmount && matchesStatus && matchesSearch;
  });

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({
      email: '',
      creditType: '',
      minAmount: '',
      maxAmount: '',
      status: ''
    });
    setSearchQuery('');
  };

  // Obtener valores únicos para los dropdowns
  const uniqueEmails = [...new Set(applications.map(app => app.email).filter(Boolean))].sort();
  const uniqueCreditTypes = [...new Set(applications.map(app => app.creditType).filter(Boolean))].sort();
  const uniqueStatuses = [...new Set(applications.map(app => app.status || 'Pendiente').filter(Boolean))].sort();

  // Calcular estadísticas
  const totalAmount = applications.reduce((sum, app) => sum + (Number(app.amount) || 0), 0);
  const averageAmount = applications.length > 0 ? totalAmount / applications.length : 0;
  const pendingCount = applications.filter(app => (app.status || 'Pendiente') === 'Pendiente').length;
  const approvedCount = applications.filter(app => (app.status || 'Pendiente') === 'Aprobado').length;
  const uniqueApplicants = new Set(applications.map(app => app.email)).size;

  // Recargar datos
  const refreshData = async () => {
    try {
      setLoading(true);
      const allApps = await applicationService.getAllApplications();
      setApplications(allApps);
      setError(null);
    } catch (err) {
      console.error("Error refreshing applications:", err);
      setError("Error al actualizar los datos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar modo de vista (todas/mías)
 

  return (
    <div className="my-applications-container">
      <header className="my-applications-header">
        <h1>Todas las Solicitudes de Crédito</h1>
        <p>Consulta y gestiona todas las solicitudes registradas en el sistema</p>
        
      </header>


      {/* Filtros avanzados */}
      <div className="filters-section">
        <div className="filters-header">
          <h3> Filtros Avanzados</h3>

        </div>
        
        <div className="filters-grid">
         

          <div className="filter-group">
            <label>Tipo de Crédito:</label>
            <select 
              name="creditType" 
              value={filters.creditType}
              onChange={handleFilterChange}
            >
              <option value="">Todos los tipos</option>
              {uniqueCreditTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Monto Mínimo:</label>
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              placeholder="Ej: 1000000"
              min="0"
            />
          </div>

          <div className="filter-group">
            <label>Monto Máximo:</label>
            <input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              placeholder="Ej: 50000000"
              min="0"
            />
          </div>

          
        </div>

        {/* Resumen de filtros activos */}
        <div className="active-filters">
          {filters.email && (
            <span className="filter-tag">
              Email: {filters.email}
              <button onClick={() => setFilters(prev => ({...prev, email: ''}))}>✕</button>
            </span>
          )}
          {filters.creditType && (
            <span className="filter-tag">
              Tipo: {filters.creditType}
              <button onClick={() => setFilters(prev => ({...prev, creditType: ''}))}>✕</button>
            </span>
          )}
          {filters.minAmount && (
            <span className="filter-tag">
              Mín: ${Number(filters.minAmount).toLocaleString()}
              <button onClick={() => setFilters(prev => ({...prev, minAmount: ''}))}>✕</button>
            </span>
          )}
          {filters.maxAmount && (
            <span className="filter-tag">
              Máx: ${Number(filters.maxAmount).toLocaleString()}
              <button onClick={() => setFilters(prev => ({...prev, maxAmount: ''}))}>✕</button>
            </span>
          )}
          {filters.status && (
            <span className="filter-tag">
              Estado: {filters.status}
              <button onClick={() => setFilters(prev => ({...prev, status: ''}))}>✕</button>
            </span>
          )}
          {searchQuery && (
            <span className="filter-tag">
              Buscando: "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>✕</button>
            </span>
          )}
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>🔄 Cargando todas las solicitudes...</p>
          <p className="loading-info">Conectando...</p>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !loading && (
        <div className="error-container">
          <div className="error-icon"></div>
          <h3>Error al cargar solicitudes</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={refreshData}> Reintentar</button>
          </div>
        </div>
      )}

      {/* Resultados */}
      {!loading && !error && (
        <div className="results-section">
          <div className="results-header">
            <h3>
              {filteredApplications.length === applications.length 
                ? `Todas las solicitudes (${applications.length})` 
                : `Solicitudes filtradas (${filteredApplications.length} de ${applications.length})`
              }
            </h3>
            
            <div className="results-summary">
              <span className="summary-item">
                <strong>Mostrando:</strong> {viewMode === 'all' ? 'Todas las solicitudes' : 'Mis solicitudes'}
              </span>
              <span className="summary-item">
                <strong>Última solicitud:</strong> {applications.length > 0 ? formatDate(applications[0].date) : 'N/A'}
              </span>
            </div>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="applications-list">
              {filteredApplications.map((app) => (
                <div key={app.id} className="application-card">
                  <div className="application-header">
                    <div className="application-id">
                      <span className="id-label">Solicitud #</span>
                      <span className="id-value">{app.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                   
                    <span className="application-date">
                      {formatDate(app.date)}
                    </span>
                  </div>
                  
                  <div className="application-body">
                    <div className="application-main-info">
                      <h4 className="applicant-name">{app.fullName}</h4>
                      <p className="applicant-email">Correo: {app.email}</p>
                      <div className="credit-type">
                        <span className="type-icon">Tipo Credito: </span>
                        <span className="type-name">{app.creditType}</span>
                      </div>
                    </div>
                    
                    <div className="application-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Monto solicitado:</span>
                        <span className="detail-value amount">${(app.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Plazo:</span>
                        <span className="detail-value">{app.term || 0} meses</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Cuota mensual:</span>
                        <span className="detail-value payment">${(app.monthlyPayment || 0).toFixed(2)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Ingreso mensual:</span>
                        <span className="detail-value income">${(app.monthlyIncome || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {app.purpose && (
                      <div className="application-purpose">
                        <span className="purpose-label">Destino:</span>
                        <span className="purpose-text">{app.purpose}</span>
                      </div>
                    )}
                    
                    <div className="application-extra-info">
                      <div className="extra-item">
                        <span className="extra-label"> Teléfono:</span>
                        <span className="extra-value">{app.phone || 'No registrado'}</span>
                      </div>
                      <div className="extra-item">
                        <span className="extra-label"> Empresa:</span>
                        <span className="extra-value">{app.company || 'No especificada'}</span>
                      </div>
                      <div className="extra-item">
                        <span className="extra-label"> Cargo:</span>
                        <span className="extra-value">{app.position || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="application-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => setSelectedApplication(app)}
                    >
                     Ver detalles
                    </button>
                    <button 
                      className="refresh-status-btn"
                      onClick={refreshData}
                      title="Actualizar datos"
                    >
                       Actualizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No se encontraron solicitudes</h3>
              <p>
                {applications.length === 0 
                  ? 'No hay solicitudes registradas en la base de datos.'
                  : 'No hay solicitudes que coincidan con los filtros aplicados.'
                }
              </p>
              <div className="no-results-actions">
                <button 
                  onClick={clearAllFilters}
                  className="clear-filters-btn"
                >
                   Limpiar filtros
                </button>
                <button 
                  onClick={refreshData}
                  className="refresh-btn"
                >
                  Recargar datos
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2> Detalles completos de la solicitud</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedApplication(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h3> Información personal</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <strong>Nombre completo:</strong> {selectedApplication.fullName}
                  </div>
                  <div className="modal-item">
                    <strong>Cédula:</strong> {selectedApplication.id}
                  </div>
                  <div className="modal-item">
                    <strong>Email:</strong> {selectedApplication.email}
                  </div>
                  <div className="modal-item">
                    <strong>Teléfono:</strong> {selectedApplication.phone}
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3> Información del crédito</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <strong>Tipo de crédito:</strong> {selectedApplication.creditType}
                  </div>
                  <div className="modal-item">
                    <strong>Monto solicitado:</strong> ${(selectedApplication.amount || 0).toLocaleString()}
                  </div>
                  <div className="modal-item">
                    <strong>Plazo:</strong> {selectedApplication.term} meses
                  </div>
                  <div className="modal-item">
                    <strong>Cuota mensual:</strong> ${(selectedApplication.monthlyPayment || 0).toFixed(2)}
                  </div>
                  <div className="modal-item full-width">
                    <strong>Destino del crédito:</strong> {selectedApplication.purpose || 'No especificado'}
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3> Información laboral</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <strong>Empresa:</strong> {selectedApplication.company}
                  </div>
                  <div className="modal-item">
                    <strong>Cargo:</strong> {selectedApplication.position}
                  </div>
                  <div className="modal-item">
                    <strong>Ingreso mensual:</strong> ${(selectedApplication.monthlyIncome || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Información del sistema</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <strong>ID de solicitud:</strong> {selectedApplication.id}
                  </div>
                  <div className="modal-item">
                    <strong>Estado:</strong> {selectedApplication.status || 'Pendiente'}
                  </div>
                  <div className="modal-item">
                    <strong>Fecha de solicitud:</strong> {formatDate(selectedApplication.date)}
                  </div>
                 
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-close-action"
                onClick={() => setSelectedApplication(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;