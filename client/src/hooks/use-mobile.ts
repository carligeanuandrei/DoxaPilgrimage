import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verifică inițial dacă este pe mobil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verifică la încărcare
    checkMobile();

    // Adaugă event listener pentru redimensionare
    window.addEventListener('resize', checkMobile);

    // Curăță la unmount
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}