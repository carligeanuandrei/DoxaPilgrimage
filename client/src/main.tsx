import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { CmsContentProvider } from "@/components/shared/cms-content";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Verifică dacă elementul cu id "root" există
const rootElement = document.getElementById("root");

// Dacă existe elementul root, randează aplicația
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CmsContentProvider>
          <App />
        </CmsContentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
