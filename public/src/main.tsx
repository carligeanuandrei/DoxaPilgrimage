// Importuri pentru React și ReactDOM
import React from "react";
import { createRoot } from "react-dom/client";

// Importuri pentru componente și stiluri
import App from "./App";
import "./index.css";

// Folosim o implementare simplificată fără contexte complexe

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
    const root = createRoot(container);
    
    // Randăm aplicația simplificată
    root.render(<App />);
    
    console.log("Aplicația React a fost inițializată cu succes");
  } catch (error) {
    console.error("Eroare la inițializarea aplicației React:", error);
  }
}

// Pornim aplicația
initializeApp();