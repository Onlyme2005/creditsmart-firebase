import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import './AddCredit.css';

const AddCredit = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    interestRate: '',
    maxTerm: '',
    requirements: '',
    image: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar mensajes de éxito/error al editar
    setSuccess(false);
    setError('');
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Nombre del producto es requerido');
    if (!formData.description.trim()) errors.push('Descripción es requerida');
    if (!formData.minAmount || Number(formData.minAmount) <= 0) errors.push('Monto mínimo debe ser mayor a 0');
    if (!formData.maxAmount || Number(formData.maxAmount) <= 0) errors.push('Monto máximo debe ser mayor a 0');
    if (Number(formData.maxAmount) <= Number(formData.minAmount)) errors.push('Monto máximo debe ser mayor al mínimo');
    if (!formData.interestRate || Number(formData.interestRate) <= 0) errors.push('Tasa de interés debe ser mayor a 0');
    if (!formData.maxTerm || Number(formData.maxTerm) <= 0) errors.push('Plazo máximo debe ser mayor a 0');
    if (!formData.requirements.trim()) errors.push('Requisitos son requeridos');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const creditData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        minAmount: Number(formData.minAmount),
        maxAmount: Number(formData.maxAmount),
        interestRate: Number(formData.interestRate),
        maxTerm: Number(formData.maxTerm),
        requirements: formData.requirements.trim(),
        image: formData.image.trim() || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      };

      const creditsRef = collection(db, 'credits');
      await addDoc(creditsRef, creditData);

      // Éxito
      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        minAmount: '',
        maxAmount: '',
        interestRate: '',
        maxTerm: '',
        requirements: '',
        image: ''
      });

      // Ocultar mensaje de éxito  después de 5 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error agregando crédito:', error);
      setError(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      minAmount: '',
      maxAmount: '',
      interestRate: '',
      maxTerm: '',
      requirements: '',
      image: ''
    });
    setSuccess(false);
    setError('');
  };

  return (
    <div className="add-credit-container">
      <header className="add-credit-header">
        <h1>➕ Agregar Nuevo Producto Crediticio</h1>
        <p>Complete el formulario para agregar un nuevo crédito</p>
       
      </header>

      <div className="form-wrapper">
        {/* Mensajes de éxito y error */}
        {success && (
          <div className="success-message">
            <h3>✅ ¡Crédito agregado exitosamente!</h3>
            <p>El producto crediticio ha sido guardado.</p>
            <p>Los usuarios podrán verlo inmediatamente en la página de inicio.</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="add-credit-form">
          <div className="form-section">
            <h3>📋 Información Básica</h3>
            
            <div className="form-group">
              <label htmlFor="name">
                Nombre del Producto *
                <span className="field-info">(Ej: Crédito Libre Inversión)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingrese el nombre del crédito"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Descripción *
                <span className="field-info">(Características y beneficios)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describa las características del crédito..."
                rows="3"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>💰 Montos del Crédito</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minAmount">
                  Monto Mínimo (COP) *
                  <span className="field-info">(Ej: 1000000)</span>
                </label>
                <input
                  type="number"
                  id="minAmount"
                  name="minAmount"
                  value={formData.minAmount}
                  onChange={handleChange}
                  placeholder="1000000"
                  min="0"
                  step="100000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxAmount">
                  Monto Máximo (COP) *
                  <span className="field-info">(Ej: 50000000)</span>
                </label>
                <input
                  type="number"
                  id="maxAmount"
                  name="maxAmount"
                  value={formData.maxAmount}
                  onChange={handleChange}
                  placeholder="50000000"
                  min="0"
                  step="100000"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>📈 Condiciones del Crédito</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="interestRate">
                  Tasa de Interés (%) *
                  <span className="field-info">(Anual)</span>
                </label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  placeholder="15"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxTerm">
                  Plazo Máximo (Meses) *
                  <span className="field-info">(Ej: 60 meses = 5 años)</span>
                </label>
                <input
                  type="number"
                  id="maxTerm"
                  name="maxTerm"
                  value={formData.maxTerm}
                  onChange={handleChange}
                  placeholder="60"
                  min="1"
                  max="360"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>📄 Requisitos y Documentación</h3>
            
            <div className="form-group">
              <label htmlFor="requirements">
                Requisitos *
                <span className="field-info">(Separados por comas)</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Ej: Edad mínima 18 años, ingresos mínimos $1.000.000, documento de identidad..."
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">
                URL de la Imagen
                <span className="field-info">(Opcional - URL de Unsplash recomendada)</span>
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
              />
              <div className="url-preview">
                {formData.image && (
                  <>
                    <p>Vista previa:</p>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="image-preview"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x300?text=Imagen+no+disponible';
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>📊 Vista Previa del Crédito</h3>
            <div className="credit-preview">
              <div className="preview-card">
                <h4>{formData.name || "Nombre del Crédito"}</h4>
                <p>{formData.description || "Descripción del crédito..."}</p>
                <div className="preview-details">
                  <div className="preview-row">
                    <span>Monto:</span>
                    <span>${formData.minAmount ? Number(formData.minAmount).toLocaleString() : '0'} - ${formData.maxAmount ? Number(formData.maxAmount).toLocaleString() : '0'}</span>
                  </div>
                  <div className="preview-row">
                    <span>Tasa:</span>
                    <span>{formData.interestRate || '0'}% anual</span>
                  </div>
                  <div className="preview-row">
                    <span>Plazo:</span>
                    <span>{formData.maxTerm || '0'} meses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '🔄 Guardando...' : '💾 Guardar'}
            </button>
            
            <button 
              type="button" 
              onClick={handleReset}
              className="reset-btn"
            >
              🗑️ Limpiar Formulario
            </button>

            <button 
              type="button" 
              onClick={() => window.location.reload()}
              className="refresh-btn"
            >
              🔄 Actualizar Vista
            </button>
          </div>

          <div className="form-info">
            <p><strong>💡 Notas:</strong></p>
            <ul>
              <li>Los campos marcados con * son obligatorios</li>
             
              <li>Los Timestamps (createdAt, updatedAt) se generan automáticamente</li>
              <li>Los usuarios podrán ver este crédito inmediatamente después de guardar</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCredit;