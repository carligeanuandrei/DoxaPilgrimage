import { FC, ComponentType, Suspense, startTransition } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  component: ComponentType;
  path: string;
  adminOnly?: boolean;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  adminOnly = false,
}) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    startTransition(() => {
      setLocation("/login");
    });
    return null;
  }

  if (adminOnly && user.role !== "admin") {
    startTransition(() => {
      setLocation("/");
    });
    return null;
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <Component />
    </Suspense>
  );
};