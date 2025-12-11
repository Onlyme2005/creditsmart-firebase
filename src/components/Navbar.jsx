import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { FaPiggyBank, FaHome, FaSearch, FaFileSignature, FaClipboardList } from "react-icons/fa";




const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <FaPiggyBank className="brand-icon" />
          <span className="brand-text">CreditSmart</span>
        </Link>
      </div>
      
          <ul className="navbar-menu">
      <li className="nav-item">
        <Link to="/" className="nav-link">
          <FaHome className="nav-icon" /> Inicio
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/simulator" className="nav-link">
          <FaSearch className="nav-icon" /> Simulador
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/request" className="nav-link">
          <FaFileSignature className="nav-icon" /> Solicitar Crédito
        </Link>
      </li>

      <li className="nav-item">
        <Link to="/myapplications" className="nav-link">
          <FaClipboardList className="nav-icon" /> Mis Solicitudes
        </Link>
      </li>
    </ul>
      
     
    </nav>
  );
};

export default Navbar;