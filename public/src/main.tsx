// Folosim variabilele globale React și ReactDOM definite în vite-react-compat.js
const React = window.React;
const ReactDOM = window.ReactDOM;

// Importăm componenta noastră principală
import App from "./App.js";

// Funcție pentru inițializarea aplicației
function initializeApp() {
  // Găsim elementul root
  const container = document.getElementById("root");
  
  // Verificăm dacă există
  if (!container) {
    console.error("Elementul root nu a fost găsit!");
    return;
  }
  
  try {
    // Creăm root-ul React
    const root = ReactDOM.createRoot(container);
    
    // Randăm aplicația simplificată
    root.render(<App />);
    
    console.log("Aplicația React a fost inițializată cu succes");
  } catch (error) {
    console.error("Eroare la inițializarea aplicației React:", error);
  }
}

// Pornim aplicația
initializeApp();