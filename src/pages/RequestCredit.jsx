import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creditService, applicationService } from '../services/firebaseServices';
import './RequestCredit.css';

const RequestCredit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    id: '',
    email: '',
    phone: '',
    creditType: '',
    amount: '',
    term: '',
    purpose: '',
    company: '',
    position: '',
    monthlyIncome: ''
  });
  
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [errors, setErrors] = useState({});
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);
  const [calculatedCredit, setCalculatedCredit] = useState(null);

  // Cargar créditos desde Firestore
  useEffect(() => {
    const loadCredits = async () => {
      try {
        setLoadingCredits(true);
        const creditsData = await creditService.getAllCredits();
        setCredits(creditsData);
      } catch (error) {
        console.error("Error loading credits:", error);
        setFirebaseError("Error al cargar los tipos de crédito");
      } finally {
        setLoadingCredits(false);
      }
    };
    loadCredits();
  }, []);

  // Calcular cuota mensual
  useEffect(() => {
    if (formData.amount && formData.term && formData.creditType) {
      const selectedCredit = credits.find(c => c.name === formData.creditType);
      if (selectedCredit) {
        setCalculatedCredit(selectedCredit);
        const rate = selectedCredit.interestRate / 100 / 12;
        const principal = Number(formData.amount);
        const months = Number(formData.term);
        
        if (rate === 0) {
          setMonthlyPayment(principal / months);
        } else {
          const payment = (principal * rate * Math.pow(1 + rate, months)) / 
            (Math.pow(1 + rate, months) - 1);
          setMonthlyPayment(payment);
        }
      }
    } else {
      setMonthlyPayment(0);
      setCalculatedCredit(null);
    }
  }, [formData.amount, formData.term, formData.creditType, credits]);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Email inválido';
      case 'phone':
        return /^\d{10}$/.test(value) ? '' : 'Teléfono inválido (10 dígitos)';
      case 'id':
        return /^\d{6,12}$/.test(value) ? '' : 'Cédula inválida';
      case 'amount':
        const numAmount = Number(value);
        const credit = credits.find(c => c.name === formData.creditType);
        if (credit && (numAmount < credit.minAmount || numAmount > credit.maxAmount)) {
          return `Monto debe estar entre $${credit.minAmount.toLocaleString()} y $${credit.maxAmount.toLocaleString()}`;
        }
        return numAmount > 0 ? '' : 'Monto inválido';
      case 'monthlyIncome':
        return Number(value) > 0 ? '' : 'Ingreso mensual debe ser mayor a 0';
      default:
        return value.trim() ? '' : 'Este campo es requerido';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    setFirebaseError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setShowSummary(true);
  };

  const confirmRequest = async () => {
    try {
      setLoading(true);
      setFirebaseError(null);
      
      const applicationData = {
        ...formData,
        amount: Number(formData.amount),
        term: Number(formData.term),
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        date: new Date().toISOString(),
        status: 'Pendiente'
      };
      
      await applicationService.createApplication(applicationData);
      
      setSubmitted(true);
      setShowSummary(false);
      
      // Limpiar formulario
      setFormData({
        fullName: '',
        id: '',
        email: '',
        phone: '',
        creditType: '',
        amount: '',
        term: '',
        purpose: '',
        company: '',
        position: '',
        monthlyIncome: ''
      });
      
      setCalculatedCredit(null);
      setMonthlyPayment(0);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/myapplications');
      }, 3000);
      
    } catch (error) {
      console.error("Error saving application:", error);
      setFirebaseError("Error al guardar la solicitud. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      fullName: '',
      id: '',
      email: '',
      phone: '',
      creditType: '',
      amount: '',
      term: '',
      purpose: '',
      company: '',
      position: '',
      monthlyIncome: ''
    });
    setErrors({});
    setMonthlyPayment(0);
    setCalculatedCredit(null);
    setFirebaseError(null);
  };

  const terms = [12, 24, 36, 48, 60];

  return (
    <div className="request-container">
      <header className="request-header">
        <h1>SOLICITAR CRÉDITO</h1>
        <p>Completa el formulario para solicitar tu crédito</p>
        
      </header>
      
      {submitted && (
        <div className="success-message">
          <div className="success-icon"></div>
          <h3>¡Solicitud enviada exitosamente!</h3>
          <p>Tu solicitud ha sido guardada.</p>
          <p>Redirigiendo a "Mis Solicitudes" en 3 segundos...</p>
          <button 
            onClick={() => navigate('/myapplications')}
            className="go-to-applications-btn"
          >
            Ir a Mis Solicitudes ahora
          </button>
        </div>
      )}
      
      {firebaseError && (
        <div className="error-message">
          <div className="error-icon"></div>
          <h3>Error</h3>
          <p>{firebaseError}</p>
        </div>
      )}
 
    {showSummary ? ( 
        <div className="summary-section">
          <h2>📄 Resumen de Solicitud</h2>
          <div className="summary-details">
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Nombre completo:</span>
                <span className="summary-value">{formData.fullName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Cédula:</span>
                <span className="summary-value">{formData.id}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Email:</span>
                <span className="summary-value">{formData.email}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Teléfono:</span>
                <span className="summary-value">{formData.phone}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tipo de crédito:</span>
                <span className="summary-value">{formData.creditType}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Monto solicitado:</span>
                <span className="summary-value">${Number(formData.amount).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Plazo:</span>
                <span className="summary-value">{formData.term} meses</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Destino del crédito:</span>
                <span className="summary-value">{formData.purpose || 'No especificado'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Empresa:</span>
                <span className="summary-value">{formData.company}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Cargo:</span>
                <span className="summary-value">{formData.position}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Ingreso mensual:</span>
                <span className="summary-value">${Number(formData.monthlyIncome).toLocaleString()}</span>
              </div>
            </div> 
            
            {monthlyPayment > 0 && (
              <div className="payment-summary">
                <h3>Cuota mensual estimada:</h3>
                <div className="payment-amount-display">
                  <span className="payment-value">${monthlyPayment.toFixed(2)}</span>
                  <span className="payment-period">/ mes</span>
                </div>
                <p className="payment-note">
                  * Basado en tasa de interés del {calculatedCredit?.interestRate || 0}%
                </p>
              </div>
            )}
          </div>
          
          <div className="summary-actions">
            <button 
              onClick={confirmRequest} 
              className="confirm-btn"
              disabled={loading}
            >
              {loading ? ' Guardando...' : 'Confirmar y Guardar'}
            </button>
            <button 
              onClick={() => setShowSummary(false)} 
              className="edit-btn"
            >
               Volver a editar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="request-form">
          {/* Sección 1: Datos Personales */}
          <fieldset className="form-section">
            <legend className="section-title">
              DATOS PERSONALES...
            </legend>
            
            <div className="form-group">
              <label htmlFor="fullName">
                Nombre completo *
                <span className="field-info">(Nombre y apellidos)</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez García"
                className={errors.fullName ? 'error-input' : ''}
                required
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="id">
                  Cédula / Identificación *
                  <span className="field-info">(Entre 6 y 12 dígitos)</span>
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="Ej: 123456789"
                  className={errors.id ? 'error-input' : ''}
                  required
                />
                {errors.id && <span className="error-message">{errors.id}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  Email *
                  <span className="field-info">(Para seguimiento de solicitud)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ej: juan.perez@email.com"
                  className={errors.email ? 'error-input' : ''}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">
                  Teléfono *
                  <span className="field-info">(10 dígitos)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej: 3001234567"
                  className={errors.phone ? 'error-input' : ''}
                  required
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
          </fieldset>

          {/* Sección 2: Datos del Crédito */}
          <fieldset className="form-section">
            <legend className="section-title">
              DATOS DEL CRÉDITO...
            </legend>
            
            <div className="form-group">
              <label htmlFor="creditType">
                Tipo de crédito *
                <span className="field-info">(Selecciona de la base de datos )</span>
              </label>
              {loadingCredits ? (
                <div className="loading-credits">
                  <div className="spinner-small"></div>
                  <span>Cargando tipos de crédito...</span>
                </div>
              ) : (
                <select
                  id="creditType"
                  name="creditType"
                  value={formData.creditType}
                  onChange={handleChange}
                  className={errors.creditType ? 'error-input' : ''}
                  required
                >
                  <option value="">Seleccione un tipo de crédito</option>
                  {credits.map(credit => (
                    <option key={credit.id} value={credit.name}>
                      {credit.name} - Tasa: {credit.interestRate}% - Monto: ${credit.minAmount.toLocaleString()} a ${credit.maxAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
              )}
              {errors.creditType && <span className="error-message">{errors.creditType}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">
                  Monto solicitado (COP) *
                  <span className="field-info">
                    {calculatedCredit ? 
                      `(Entre $${calculatedCredit.minAmount.toLocaleString()} y $${calculatedCredit.maxAmount.toLocaleString()})` : 
                      '(Ej: 10000000)'}
                  </span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Ej: 10000000"
                  min={calculatedCredit?.minAmount || 0}
                  max={calculatedCredit?.maxAmount || 999999999}
                  className={errors.amount ? 'error-input' : ''}
                  required
                />
                {errors.amount && <span className="error-message">{errors.amount}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="term">
                  Plazo en meses *
                  <span className="field-info">(Selecciona el plazo)</span>
                </label>
                <select
                  id="term"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className={errors.term ? 'error-input' : ''}
                  required
                >
                  <option value="">Seleccione plazo</option>
                  {terms.map(term => (
                    <option key={term} value={term}>
                      {term} meses
                    </option>
                  ))}
                </select>
                {errors.term && <span className="error-message">{errors.term}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="purpose">
                Destino del crédito
                <span className="field-info">(Describe para qué usarás el crédito)</span>
              </label>
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Ej: Compra de vehículo, remodelación de casa, capital de trabajo..."
                rows="3"
              />
            </div>
          </fieldset>

          {/* Sección 3: Datos Laborales */}
          <fieldset className="form-section">
            <legend className="section-title">
              DATOS LABORALES...
            </legend>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">
                  Empresa donde trabaja *
                  <span className="field-info">(Nombre de la empresa)</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Ej: Tech Solutions S.A.S"
                  className={errors.company ? 'error-input' : ''}
                  required
                />
                {errors.company && <span className="error-message">{errors.company}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="position">
                  Cargo / Posición *
                  <span className="field-info">(Tu puesto en la empresa)</span>
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Ej: Desarrollador Senior"
                  className={errors.position ? 'error-input' : ''}
                  required
                />
                {errors.position && <span className="error-message">{errors.position}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="monthlyIncome">
                  Ingresos mensuales (COP) *
                  <span className="field-info">(Ingreso neto mensual)</span>
                </label>
                <input
                  type="number"
                  id="monthlyIncome"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="Ej: 3500000"
                  min="0"
                  className={errors.monthlyIncome ? 'error-input' : ''}
                  required
                />
                {errors.monthlyIncome && <span className="error-message">{errors.monthlyIncome}</span>}
              </div>
            </div>
          </fieldset>

          {/* Cálculo de cuota mensual */}
          {monthlyPayment > 0 && calculatedCredit && (
            <div className="payment-calculator">
              <h3> Simulación de cuota mensual</h3>
              <div className="calculator-details">
                <div className="calculator-row">
                  <span>Crédito seleccionado:</span>
                  <span className="credit-name">{calculatedCredit.name}</span>
                </div>
                <div className="calculator-row">
                  <span>Tasa de interés anual:</span>
                  <span className="interest-rate">{calculatedCredit.interestRate}%</span>
                </div>
                <div className="calculator-row">
                  <span>Monto solicitado:</span>
                  <span className="loan-amount">${Number(formData.amount).toLocaleString()}</span>
                </div>
                <div className="calculator-row">
                  <span>Plazo:</span>
                  <span className="loan-term">{formData.term} meses</span>
                </div>
                <div className="calculator-divider"></div>
                <div className="calculator-result">
                  <span className="result-label">Cuota mensual estimada:</span>
                  <div className="result-amount">
                    <span className="payment-currency">$</span>
                    <span className="payment-value">{monthlyPayment.toFixed(2)}</span>
                    <span className="payment-period">/ mes</span>
                  </div>
                </div>
                <p className="calculator-note">
                  * Esta es una estimación. La cuota final puede variar según análisis crediticio.
                </p>
              </div>
            </div>
          )}

          {/* Botones del formulario */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || loadingCredits}
            >
              {loading ? 'Procesando...' : ' Enviar Solicitud'}
            </button>
            
            <button 
              type="button" 
              onClick={clearForm}
              className="clear-btn"
              disabled={loading}
            >
              Limpiar Formulario
            </button>
          </div>

          {/* Información adicional */}
          <div className="form-info">
            <p><strong> ¡INFORMACIÓN IMPORTANTE!</strong></p>
            <ul>
              <li>Los campos marcados con * son obligatorios</li>
              <li>Podrás consultar el estado de tu solicitud en "Mis Solicitudes"</li>
              <li>Nos pondremos en contacto contigo en un plazo máximo de 48 horas</li>
            </ul>
          </div>
        </form>
      )}
    </div>
  );
};

export default RequestCredit;