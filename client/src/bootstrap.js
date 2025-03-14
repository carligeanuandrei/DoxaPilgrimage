// Acest fișier este utilizat pentru a inițializa aplicația într-un mod simplu,
// evitând probleme potențiale de sintaxă din fișierele TSX/JSX

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { CmsContentProvider } from "./components/shared/cms-content";

// Funcție pentru inițializarea aplicației
function initApp() {
  const container = document.getElementById("root");
  
  if (!container) {
    console.error("Nu s-a găsit elementul root în DOM");
    return;
  }
  
  try {
    const root = createRoot(container);
    
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
}

// Exportăm funcția pentru a fi apelată din main.tsx sau direct din HTML
export default initApp;