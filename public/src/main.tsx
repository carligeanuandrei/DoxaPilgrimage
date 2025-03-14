// Importăm doar modulele esențiale pentru a-i permite browserului să încarce aplicația
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { CmsContentProvider } from "@/components/shared/cms-content";

// Inițializăm aplicația folosind createElement în loc de JSX
// pentru a evita erorile potențiale cu transformarea JSX
try {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    
    // Randăm aplicația folosind React.createElement în loc de JSX
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
  } else {
    console.error("Elementul root nu a fost găsit");
  }
} catch (error) {
  console.error("Eroare la inițializarea aplicației:", error);
  
  // Afișăm un mesaj de eroare user-friendly
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="max-width: 800px; margin: 50px auto; padding: 20px; background: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #e74c3c;">Eroare la inițializarea aplicației</h2>
        <p>A apărut o eroare la încărcarea aplicației. Detalii în consola browser-ului.</p>
        <div style="margin-top: 20px;">
          <button onclick="location.reload()" style="padding: 10px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Reîncarcă pagina</button>
        </div>
      </div>
    `;
  }
}
