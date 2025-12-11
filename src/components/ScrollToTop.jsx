// src/components/ScrollToTop.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Obtiene el objeto de ubicación actual.
  const { pathname } = useLocation();

  // Se ejecuta cada vez que 'pathname' (la ruta) cambia
  useEffect(() => {
    // Forzar el desplazamiento al inicio de la ventana.
    // 'smooth' es opcional, puedes usar 'auto' para un salto instantáneo.
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]); // <--- La dependencia clave: se dispara con el cambio de ruta

  // Este componente no renderiza nada visible
  return null;
};

export default ScrollToTop;