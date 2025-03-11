
import React, { useEffect, createContext, useContext, useState } from 'react';

interface ThemeContextType {
  applyTheme: (theme: any) => void;
  resetTheme: () => void;
  currentTheme: any;
}

const ThemeContext = createContext<ThemeContextType>({
  applyTheme: () => {},
  resetTheme: () => {},
  currentTheme: null
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<any>(null);

  // Încarcă tema salvată la încărcarea componentei
  useEffect(() => {
    const savedTheme = localStorage.getItem('doxa-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        applyTheme(theme);
        setCurrentTheme(theme);
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    }
  }, []);

  // Funcție pentru aplicarea temei
  const applyTheme = (theme: any) => {
    if (!theme) return;

    const root = document.documentElement;
    
    // Aplică culorile
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value as string);
      });
    }
    
    // Aplică spațierile
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, `${value}px`);
      });
    }
    
    // Aplică tipografia
    if (theme.typography) {
      root.style.setProperty(`--font-family`, theme.typography.fontFamily);
      
      if (theme.typography.fontSize) {
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
          root.style.setProperty(`--font-size-${key}`, `${value}px`);
        });
      }
    }
    
    // Aplică border radius
    if (theme.borderRadius !== undefined) {
      root.style.setProperty(`--border-radius`, `${theme.borderRadius}px`);
    }
    
    setCurrentTheme(theme);
  };

  // Funcție pentru resetarea temei
  const resetTheme = () => {
    localStorage.removeItem('doxa-theme');
    document.documentElement.removeAttribute('style');
    setCurrentTheme(null);
  };

  return (
    <ThemeContext.Provider value={{ applyTheme, resetTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
