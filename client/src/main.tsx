// Importuri pentru React și ReactDOM
import React from "react";
import { createRoot } from "react-dom/client";

// Importuri pentru componente și stiluri
import App from "./App";
import "./index.css";

// Importuri pentru contexte
import { AuthProvider } from "@/hooks/use-auth";
import { CmsContentProvider } from "@/components/shared/cms-content";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

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
    
    // Randăm aplicația cu contextele necesare
    root.render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CmsContentProvider>
            <App />
          </CmsContentProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
    
    console.log("Aplicația a fost inițializată cu succes");
  } catch (error) {
    console.error("Eroare la inițializarea aplicației:", error);
  }
}

// Pornim aplicația
initializeApp();
