import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { CmsContentProvider } from "@/components/shared/cms-content";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CmsContentProvider>
        <App />
      </CmsContentProvider>
    </AuthProvider>
  </QueryClientProvider>
);
