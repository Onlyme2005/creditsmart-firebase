import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Simulator from './pages/Simulator';
import ScrollToTop from './components/ScrollToTop';
import RequestCredit from './pages/RequestCredit';
import MyApplications from './pages/MyApplications'; // NUEVA
import './App.css';
import AddCredit from './components/AddCredit';

function App() {
  return (
    <Router>
        <ScrollToTop />
        <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/request" element={<RequestCredit />} />
            <Route path="/myapplications" element={<MyApplications />} /> {/* NUEVA */}
            <Route path="/AddCredit" element={<AddCredit />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© 2025 CreditSmart - Brislleily Carmona </p>
          <p>Desarrollado para Ingeniería Web I</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;