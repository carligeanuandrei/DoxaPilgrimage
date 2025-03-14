import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import React from "react";

interface ProtectedRouteProps {
  path?: string;
  component?: () => React.JSX.Element;
  adminOnly?: boolean;
  children?: React.ReactNode;
}

export function ProtectedRoute({
  component: Component,
  path,
  adminOnly = false,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to={adminOnly ? "/admin/login" : "/auth"} />;
  }

  // Verificare pentru rute de admin
  if (adminOnly && user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  if (Component) {
    return <Component />;
  }

  return <>{children}</>;
}
