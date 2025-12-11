    import React from 'react';
    import './CreditCard.css';
    import { Link } from "react-router-dom";

    const CreditCard = ({ credit }) => {
    return (
        <div className="credit-card">
        <img src={credit.image} alt={credit.name} className="credit-image" />
        <div className="credit-content">
            <h3 className="credit-title">{credit.name}</h3>
            <p className="credit-description">{credit.description}</p>
            
            <div className="credit-details">
            <div className="details-grid">
            <div className="interest-rate">
                <span className="rate-label">Tasa de interés:</span>
                <span className="rate-value">{credit.interestRate}% anual</span>
            </div>
            
            <div className="amount-range">
                <span className="label">Monto</span>
                <span className="value" >
                    ${credit.minAmount?.toLocaleString()}
                </span>
            </div>

            <div className="amount-range">
                <span className="label">disponible:</span>
                <span className="value">
                    ${credit.maxAmount?.toLocaleString()}
                </span>
            </div>
                
            <div className="term">
                <span className="term-label">Plazo máximo:</span>
                <span className="term-value">{credit.maxTerm} meses</span>
            </div>
            </div>
            </div>
            
            <div className="requirements">
                <p><strong>Requisitos:</strong> {credit.requirements}</p>
            </div>
            <center>
            <Link to="/request" className='botones'>
                <button className="request-btn">Solicitar</button>
            </Link>
            </center>
        </div>
        </div>
    );
    };

    export default CreditCard;