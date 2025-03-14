// Importuri necesare
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { CmsContentProvider } from "@/components/shared/cms-content";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import * as React from "react";

// Obține elementul root
const rootElement = document.getElementById("root");

// Verifică dacă elementul există
if (rootElement) {
  try {
    // Creează rădăcina React
    const root = createRoot(rootElement);
    
    // Randează aplicația cu toate contextele necesare
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
  }
} else {
  console.error("Nu s-a găsit elementul root în DOM");
}
