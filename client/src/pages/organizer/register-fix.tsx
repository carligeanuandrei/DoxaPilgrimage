import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Registration schema pentru organizatori
const registerOrganizerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Parola trebuie să aibă cel puțin 6 caractere"),
  confirmPassword: z.string(),
  companyName: z.string().min(3, "Numele companiei trebuie să aibă cel puțin 3 caractere"),
  companyRegistrationNumber: z.string().min(3, "Codul de înregistrare trebuie să aibă cel puțin 3 caractere"),
  companyAddress: z.string().min(5, "Adresa companiei trebuie să aibă cel puțin 5 caractere"),
  description: z.string().optional(),
  website: z.string().url("Introduceți un URL valid").optional().or(z.literal('')),
  agencyLicense: z.string().min(3, "Licența de agenție trebuie să aibă cel puțin 3 caractere"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"]
});

type RegisterOrganizerFormData = z.infer<typeof registerOrganizerSchema>;

export default function RegisterOrganizerPage() {
  const { user, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { toast } = useToast();

  // Register form pentru organizatori
  const registerForm = useForm<RegisterOrganizerFormData>({
    resolver: zodResolver(registerOrganizerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      companyName: "",
      companyRegistrationNumber: "",
      companyAddress: "",
      description: "",
      website: "",
      agencyLicense: "",
      role: "operator",
    }
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/organizer/dashboard');
    }
  }, [user, setLocation]);

  const onRegisterSubmit = (data: RegisterOrganizerFormData) => {
    if (!agreeTerms) {
      toast({
        title: "Trebuie să acceptați termenii și condițiile",
        variant: "destructive"
      });
      return;
    }

    // Delete confirmPassword since it's not in the schema
    const { confirmPassword, ...registerData } = data;
    
    // Add additional organizer metadata in the bio field as JSON
    const organizerMetadata = {
      companyName: data.companyName,
      companyRegistrationNumber: data.companyRegistrationNumber,
      companyAddress: data.companyAddress,
      description: data.description,
      website: data.website,
      agencyLicense: data.agencyLicense
    };
    
    // Create the final registration data
    const finalRegisterData = {
      ...registerData,
      bio: JSON.stringify(organizerMetadata)
    };
    
    registerMutation.mutate(finalRegisterData, {
      onSuccess: () => {
        toast({
          title: "Înregistrare reușită",
          description: "Contul dumneavoastră de organizator a fost creat. Așteptați aprobarea administratorului."
        });
        // Redirect after successful registration
        setTimeout(() => {
          setLocation('/organizer/dashboard');
        }, 2000);
      }
    });
  };

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Coloana stângă - formular înregistrare */}
        <div className="lg:col-span-3">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Înregistrare Organizator Pelerinaje</CardTitle>
              <CardDescription>
                Completați formularul pentru a vă înregistra ca organizator de pelerinaje în platformă
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium mb-4">Informații personale</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prenume</Label>
                      <Input 
                        id="firstName" 
                        type="text" 
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
                        {...registerForm.register("lastName")} 
                      />
                      {registerForm.formState.errors.lastName && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Nume utilizator</Label>
                      <Input 
                        id="username" 
                        type="text" 
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
                        {...registerForm.register("email")} 
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        {...registerForm.register("phone")} 
                      />
                      {registerForm.formState.errors.phone && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.phone.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Parolă</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        {...registerForm.register("password")} 
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmare parolă</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        {...registerForm.register("confirmPassword")} 
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium mb-4">Informații companie</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="companyName">Denumire companie</Label>
                      <Input 
                        id="companyName" 
                        type="text" 
                        {...registerForm.register("companyName")} 
                      />
                      {registerForm.formState.errors.companyName && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.companyName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyRegistrationNumber">CUI / Nr. înregistrare</Label>
                      <Input 
                        id="companyRegistrationNumber" 
                        type="text" 
                        {...registerForm.register("companyRegistrationNumber")} 
                      />
                      {registerForm.formState.errors.companyRegistrationNumber && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.companyRegistrationNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="agencyLicense">Licență agenție (opțional)</Label>
                      <Input 
                        id="agencyLicense" 
                        type="text" 
                        {...registerForm.register("agencyLicense")} 
                      />
                      {registerForm.formState.errors.agencyLicense && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.agencyLicense.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="companyAddress">Adresa companiei</Label>
                      <Input 
                        id="companyAddress" 
                        type="text" 
                        {...registerForm.register("companyAddress")} 
                      />
                      {registerForm.formState.errors.companyAddress && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.companyAddress.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="website">Website (opțional)</Label>
                      <Input 
                        id="website" 
                        type="url" 
                        placeholder="https://example.com" 
                        {...registerForm.register("website")} 
                      />
                      {registerForm.formState.errors.website && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.website.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="description">Descriere companie (opțional)</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Scrieți câteva cuvinte despre compania dumneavoastră..." 
                        className="h-24" 
                        {...registerForm.register("description")} 
                      />
                      {registerForm.formState.errors.description && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.description.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="my-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="terms" className="text-sm">
                      Sunt de acord cu <a href="/termeni-si-conditii" className="text-primary hover:underline" target="_blank">Termenii și Condițiile</a> și <a href="/politica-de-confidentialitate" className="text-primary hover:underline" target="_blank">Politica de Confidențialitate</a>
                    </Label>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se procesează...
                    </>
                  ) : (
                    "Înregistrează-te ca organizator"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Coloana dreaptă - informații */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>De ce să deveniți organizator?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Creșteți vizibilitatea</h3>
                <p className="text-muted-foreground">Ajungeți la mii de pelerini care își doresc experiențe spirituale autentice.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Gestionare simplificată</h3>
                <p className="text-muted-foreground">Folosiți platformă noastră pentru a gestiona rezervările și a comunica cu participanții.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Comunitate de încredere</h3>
                <p className="text-muted-foreground">Faceți parte dintr-o rețea de organizatori verificați și apreciați de pelerini.</p>
              </div>
              
              <div className="border-t pt-4 mt-6">
                <h3 className="font-semibold mb-2">Procesul de înregistrare</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Completați formularul cu informațiile companiei</li>
                  <li>Așteptați verificarea și aprobarea contului</li>
                  <li>După aprobare, veți putea adăuga pelerinajele dumneavoastră</li>
                  <li>Începeți să primiți rezervări prin platformă</li>
                </ol>
              </div>
              
              <div className="border-t pt-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  Aveți deja un cont? <a href="/auth" className="text-primary hover:underline">Autentificați-vă aici</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}