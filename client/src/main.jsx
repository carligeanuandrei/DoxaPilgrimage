// Versiune simplificată a main.jsx pentru a evita probleme de sintaxă TSX
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { CmsContentProvider } from "@/components/shared/cms-content";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Găsim elementul root
const container = document.getElementById("root");

// Verificăm dacă există
if (container) {
  try {
    // Creăm root-ul React
    const root = createRoot(container);
    
    // Randăm aplicația cu contextele necesare
    root.render(
      React.createElement(
        QueryClientProvider, 
        { client: queryClient },
        React.createElement(
          AuthProvider,
          null,
          React.createElement(
            CmsContentProvider,
            null,
            React.createElement(App, null)
          )
        )
      )
    );
    
    console.log("Aplicația a fost inițializată cu succes");
  } catch (error) {
    console.error("Eroare la inițializarea aplicației:", error);
    
    if (container) {
      container.innerHTML = `
        <div style="max-width: 800px; margin: 50px auto; padding: 20px; background: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #e74c3c;">Eroare la inițializarea aplicației</h2>
          <p>A apărut o eroare la încărcarea aplicației. Detalii în consola browser-ului.</p>
          <pre style="background: #f1f1f1; padding: 10px; border-radius: 4px; overflow: auto;">${error}</pre>
        </div>
      `;
    }
  }
} else {
  console.error("Elementul root nu a fost găsit");
}