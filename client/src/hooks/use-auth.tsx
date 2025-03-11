import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser, LoginData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Afișăm toast-ul de autentificare reușită
      toast({
        title: "Autentificare reușită",
        description: `Bine ai revenit, ${user.firstName}!`,
      });
      
      // Redirecționăm utilizatorul în funcție de rolul său
      if (user.role === "admin") {
        // Admin merge la pagina de administrare
        window.location.href = "/admin/pilgrimages";
      } else if (user.role === "operator" || user.role === "monastery") {
        // Organizatorii merg la dashboard-ul lor
        window.location.href = "/organizer/dashboard";
      } else {
        // Utilizatorii normali merg la profilul lor
        window.location.href = "/profile";
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Autentificare eșuată",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // După înregistrarea cu succes, redirecționăm către pagina de verificare email
      window.location.href = "/verify-account";
      
      toast({
        title: "Înregistrare reușită",
        description: `Bine ai venit în comunitatea Doxa, ${user.firstName}! Verifică-ți adresa de email pentru a-ți activa contul.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Înregistrare eșuată",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Deconectare reușită",
        description: "Te-ai deconectat cu succes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deconectare eșuată",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
