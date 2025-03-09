import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema, LoginData } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, "Numele de utilizator trebuie să aibă cel puțin 3 caractere"),
  password: z.string().min(6, "Parola trebuie să aibă cel puțin 6 caractere"),
});

// Registration schema
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Parola trebuie să aibă cel puțin 6 caractere"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "pilgrim"
    }
  });

  // Handle login submit
  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        // Reîmprospătăm pagina după autentificare
        window.location.href = '/';
      }
    });
  };

  // Handle register submit
  const onRegisterSubmit = (data: RegisterFormData) => {
    // Remove confirmPassword as it's not in our schema
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        // Redirecționăm către pagina principală cu refresh
        window.location.href = '/';
      }
    });
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <div className="w-full md:w-1/2">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Autentificare</TabsTrigger>
              <TabsTrigger value="register">Înregistrare</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Autentificare</CardTitle>
                  <CardDescription>
                    Intră în cont pentru a rezerva pelerinaje și a gestiona profilul tău.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nume de utilizator</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Introdu numele de utilizator" 
                        {...loginForm.register("username")}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Parolă</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Introdu parola" 
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        "Autentificare"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Înregistrare</CardTitle>
                  <CardDescription>
                    Creează un cont nou pentru a te alătura comunității Doxa.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prenume</Label>
                        <Input 
                          id="firstName" 
                          type="text" 
                          placeholder="Prenume" 
                          {...registerForm.register("firstName")}
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nume</Label>
                        <Input 
                          id="lastName" 
                          type="text" 
                          placeholder="Nume" 
                          {...registerForm.register("lastName")}
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Nume de utilizator</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Alege un nume de utilizator" 
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="exemplu@gmail.com" 
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Tip de cont</Label>
                      <select 
                        id="role"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        {...registerForm.register("role")}
                      >
                        <option value="pilgrim">Pelerin</option>
                        <option value="operator">Organizator de Pelerinaje</option>
                        <option value="monastery">Mănăstire / Loc Religios</option>
                      </select>
                      {registerForm.formState.errors.role && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.role.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Parolă</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Creează o parolă sigură" 
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmă parola</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Repetă parola" 
                        {...registerForm.register("confirmPassword")}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        "Înregistrare"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Hero Section */}
        <div className="w-full md:w-1/2 bg-primary rounded-lg p-8 text-white flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Bine ai venit la Doxa</h1>
          <p className="mb-6 text-lg">
            Platforma unde pelerinii găsesc experiențe spirituale autentice, iar organizatorii își pot promova pelerinajele.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">Pelerinaje Verificate</h3>
                <p className="text-white/80">Toate pachetele turistice sunt verificate de echipa noastră.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">Comunitate de Pelerini</h3>
                <p className="text-white/80">Împărtășește experiențe cu alți pelerini și lasă recenzii.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">Plăți Sigure</h3>
                <p className="text-white/80">Rezervă cu încredere prin sistemul nostru de plăți securizat.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
