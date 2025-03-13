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
import { Loader2, AlertCircle, CheckCircle, X, Upload, Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { apiRequest } from "@/lib/queryClient";

// Schema pentru validarea CUI-ului
const cuiSchema = z.string()
  .min(1, "CUI-ul este obligatoriu")
  .regex(/^(RO)?[0-9]{6,10}$/, "CUI-ul trebuie să conțină între 6 și 10 cifre, opțional prefixat cu RO");

// Registration schema pentru organizatori - îmbunătățit cu validări stricte
const registerOrganizerSchema = insertUserSchema.extend({
  password: z.string()
    .min(8, "Parola trebuie să aibă cel puțin 8 caractere")
    .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
    .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
    .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special"),
  confirmPassword: z.string(),
  
  // Validare strictă pentru datele companiei
  companyName: z.string().min(3, "Numele companiei trebuie să aibă cel puțin 3 caractere"),
  companyRegistrationNumber: cuiSchema,
  companyAddress: z.string().min(5, "Adresa companiei trebuie să aibă cel puțin 5 caractere"),
  
  // Câmpuri adiționale și opționale
  companyCity: z.string().optional(),
  companyCounty: z.string().optional(),
  companyLogo: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Introduceți un URL valid").optional().or(z.literal('')),
  agencyLicense: z.string().optional(),
  
  // Tipuri de pelerinaje oferite
  pilgrimageTypes: z.array(z.string()).optional(),
  
  // Cod verificare email
  verificationCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"]
});

// Tipuri de pelerinaje disponibile
const pilgrimageTypes = [
  { id: "manastiri", label: "Pelerinaje la mănăstiri" },
  { id: "icoane", label: "Pelerinaje la icoane făcătoare de minuni" },
  { id: "moaste", label: "Pelerinaje la moaște de sfinți" },
  { id: "athos", label: "Pelerinaje la Muntele Athos" },
  { id: "israel", label: "Pelerinaje în Israel" },
  { id: "grecia", label: "Pelerinaje în Grecia" },
  { id: "international", label: "Pelerinaje internaționale" },
  { id: "grupuri", label: "Pelerinaje pentru grupuri organizate" }
];

type RegisterOrganizerFormData = z.infer<typeof registerOrganizerSchema>;

export default function RegisterOrganizerPage() {
  const { user, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { toast } = useToast();
  
  // State-uri pentru validarea CUI și manipularea logo-ului
  const [cuiValidationStatus, setCuiValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [companyInfoFound, setCompanyInfoFound] = useState(false);
  const [cuiValidationMessage, setCuiValidationMessage] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [selectedPilgrimageTypes, setSelectedPilgrimageTypes] = useState<string[]>([]);
  const [verificationStep, setVerificationStep] = useState<'email' | 'code' | 'completed'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
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
      companyCity: "",
      companyCounty: "",
      description: "",
      website: "",
      agencyLicense: "",
      role: "operator",
      pilgrimageTypes: [],
      companyLogo: "",
      verificationCode: ""
    }
  });
  
  // Funcția de validare a CUI-ului
  const validateCUI = async () => {
    const cui = registerForm.getValues("companyRegistrationNumber");
    
    if (!cui) {
      setCuiValidationStatus('invalid');
      setCuiValidationMessage('CUI-ul este obligatoriu');
      return;
    }
    
    setCuiValidationStatus('validating');
    
    try {
      const response = await apiRequest('GET', `/api/company/validate?cui=${cui}`);
      const data = await response.json();
      
      if (data.valid) {
        setCuiValidationStatus('valid');
        setCuiValidationMessage(data.foundInfo ? 'CUI valid! Informații completate automat.' : 'CUI valid!');
        setCompanyInfoFound(data.foundInfo);
        
        // Dacă au fost găsite informații despre companie, completăm automat formularele
        if (data.foundInfo && data.company) {
          registerForm.setValue("companyName", data.company.name);
          registerForm.setValue("companyAddress", data.company.address);
          
          if (data.company.city) {
            registerForm.setValue("companyCity", data.company.city);
          }
          
          if (data.company.county) {
            registerForm.setValue("companyCounty", data.company.county);
          }
        }
      } else {
        setCuiValidationStatus('invalid');
        setCuiValidationMessage(data.message || 'CUI invalid');
      }
    } catch (error) {
      setCuiValidationStatus('invalid');
      setCuiValidationMessage('Eroare la validarea CUI-ului. Încercați din nou.');
      console.error('Error validating CUI:', error);
    }
  };
  
  // Handler pentru încărcarea logo-ului
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validăm fișierul (tip, dimensiune)
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tip de fișier neacceptat",
        description: "Vă rugăm să încărcați o imagine în format JPG, PNG, SVG sau WebP.",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "Fișier prea mare",
        description: "Dimensiunea maximă permisă este de 2MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Setăm fișierul și generăm previzualizarea
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setLogoPreview(result);
        registerForm.setValue("companyLogo", result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Funcție pentru a trimite codul de verificare
  const sendVerificationCode = async () => {
    const email = registerForm.getValues("email");
    
    if (!email) {
      toast({
        title: "Email lipsă",
        description: "Introduceți o adresă de email pentru a primi codul de verificare.",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: Implementa API-ul pentru trimiterea codului de verificare
    // Deocamdată simulăm trimiterea
    setVerificationSent(true);
    setVerificationStep('code');
    toast({
      title: "Cod de verificare trimis",
      description: "Un cod de verificare a fost trimis la adresa de email specificată. Introduceți codul pentru a continua.",
    });
    
    // În mod normal, serverul ar trimite codul prin email, dar pentru demo
    // folosim un cod fix pentru testare
    setVerificationCode("123456");
  };
  
  // Funcție pentru a verifica codul introdus
  const verifyCode = () => {
    const code = registerForm.getValues("verificationCode");
    
    if (code === verificationCode) {
      setVerificationStep('completed');
      toast({
        title: "Email verificat cu succes",
        description: "Adresa de email a fost verificată cu succes.",
      });
    } else {
      toast({
        title: "Cod incorect",
        description: "Codul introdus este incorect. Încercați din nou.",
        variant: "destructive"
      });
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/organizer/dashboard');
    }
  }, [user, setLocation]);

  // Handler pentru selectarea/deselectarea tipurilor de pelerinaje
  const handlePilgrimageTypeChange = (typeId: string) => {
    setSelectedPilgrimageTypes(prev => {
      if (prev.includes(typeId)) {
        // Dacă tipul este deja selectat, îl eliminăm
        const newTypes = prev.filter(id => id !== typeId);
        registerForm.setValue("pilgrimageTypes", newTypes);
        return newTypes;
      } else {
        // Altfel, îl adăugăm
        const newTypes = [...prev, typeId];
        registerForm.setValue("pilgrimageTypes", newTypes);
        return newTypes;
      }
    });
  };

  const onRegisterSubmit = (data: RegisterOrganizerFormData) => {
    // Verificăm dacă termenii au fost acceptați
    if (!agreeTerms) {
      toast({
        title: "Trebuie să acceptați termenii și condițiile",
        variant: "destructive"
      });
      return;
    }
    
    // Verificăm dacă email-ul a fost verificat (în cazul implementării complete)
    if (verificationStep !== 'completed') {
      toast({
        title: "Email neverificat",
        description: "Trebuie să verificați adresa de email înainte de a continua.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificăm dacă CUI-ul a fost validat
    if (cuiValidationStatus !== 'valid') {
      toast({
        title: "CUI nevalidat",
        description: "Trebuie să validați CUI-ul companiei înainte de a continua.",
        variant: "destructive"
      });
      return;
    }

    // Eliminăm câmpurile care nu trebuie trimise la server
    const { 
      confirmPassword, 
      verificationCode,
      pilgrimageTypes,
      companyCity,
      companyCounty,
      ...registerData 
    } = data;
    
    // Adăugăm metadate suplimentare ale organizatorului în câmpul bio ca JSON
    const organizerMetadata = {
      companyName: data.companyName,
      companyRegistrationNumber: data.companyRegistrationNumber,
      companyAddress: data.companyAddress,
      companyCity: data.companyCity || '',
      companyCounty: data.companyCounty || '',
      description: data.description || '',
      website: data.website || '',
      agencyLicense: data.agencyLicense || '',
      pilgrimageTypes: data.pilgrimageTypes || [],
      companyLogo: data.companyLogo || ''
    };
    
    // Creăm datele finale pentru înregistrare
    const finalRegisterData = {
      ...registerData,
      bio: JSON.stringify(organizerMetadata),
      verified: false // Organizatorii trebuie verificați de admin
    };
    
    // Apelăm mutația pentru înregistrare
    registerMutation.mutate(finalRegisterData, {
      onSuccess: () => {
        toast({
          title: "Înregistrare reușită",
          description: "Contul dumneavoastră de organizator a fost creat. Așteptați aprobarea administratorului."
        });
        // Redirecționăm după înregistrarea cu succes
        setTimeout(() => {
          setLocation('/organizer/dashboard');
        }, 2000);
      },
      onError: (error) => {
        toast({
          title: "Eroare la înregistrare",
          description: error.message || "A apărut o eroare la înregistrare. Vă rugăm să încercați din nou.",
          variant: "destructive"
        });
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
                      <div className="flex space-x-2">
                        <Input 
                          id="companyRegistrationNumber" 
                          type="text" 
                          placeholder="ex: RO12345678"
                          className={`flex-grow ${cuiValidationStatus === 'valid' ? 'border-green-500' : cuiValidationStatus === 'invalid' ? 'border-red-500' : ''}`}
                          {...registerForm.register("companyRegistrationNumber")} 
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          className="shrink-0"
                          onClick={validateCUI}
                          disabled={cuiValidationStatus === 'validating'}
                        >
                          {cuiValidationStatus === 'validating' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                          <span className="ml-2">Verifică</span>
                        </Button>
                      </div>
                      
                      {cuiValidationStatus !== 'idle' && (
                        <div className={`text-sm mt-1 flex items-center ${
                          cuiValidationStatus === 'valid' ? 'text-green-600' : 
                          cuiValidationStatus === 'invalid' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {cuiValidationStatus === 'valid' ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : cuiValidationStatus === 'invalid' ? (
                            <AlertCircle className="h-4 w-4 mr-1" />
                          ) : null}
                          {cuiValidationMessage}
                        </div>
                      )}
                      
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
                    
                    {/* Logo upload section */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="companyLogo">Logo companie</Label>
                      <div className="flex items-center space-x-4">
                        <div 
                          className={`w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden ${
                            logoPreview ? 'border-green-500' : 'border-dashed border-gray-300'
                          }`}
                        >
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="object-contain w-full h-full" />
                          ) : (
                            <div className="text-center p-2">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                              <span className="text-xs text-gray-500 block mt-1">Logo</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            id="logoFileInput"
                            className="hidden"
                            accept="image/jpeg,image/png,image/svg+xml,image/webp"
                            onChange={handleLogoUpload}
                            ref={logoInputRef}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="mb-2"
                            onClick={() => logoInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {logoFile ? 'Schimbă logo' : 'Încarcă logo'}
                          </Button>
                          {logoFile && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              className="h-8 px-2 text-red-500 hover:text-red-700"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview('');
                                registerForm.setValue("companyLogo", "");
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Șterge
                            </Button>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Format: JPG, PNG, SVG, WebP. Dimensiune maximă: 2MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tipuri de pelerinaje */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium mb-4">Tipuri de pelerinaje oferite</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pilgrimageTypes.map(type => (
                      <div 
                        key={type.id} 
                        className={`border rounded-md p-3 cursor-pointer transition-colors ${
                          selectedPilgrimageTypes.includes(type.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePilgrimageTypeChange(type.id)}
                      >
                        <div className="flex items-center">
                          <Checkbox 
                            id={`pilgrimageType-${type.id}`}
                            checked={selectedPilgrimageTypes.includes(type.id)}
                            onCheckedChange={() => handlePilgrimageTypeChange(type.id)}
                          />
                          <Label 
                            htmlFor={`pilgrimageType-${type.id}`}
                            className="ml-2 cursor-pointer font-medium"
                          >
                            {type.label}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Verificare email */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium mb-4">Verificare email</h3>
                  {verificationStep === 'email' ? (
                    <div className="space-y-3">
                      <Alert variant={verificationSent ? "success" : "default"}>
                        <div className="flex items-center">
                          {verificationSent ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                          <AlertTitle>
                            {verificationSent 
                              ? "Cod de verificare trimis!" 
                              : "Verificarea adresei de email este necesară"}
                          </AlertTitle>
                        </div>
                        <AlertDescription className="mt-2">
                          {verificationSent
                            ? "Un cod de verificare a fost trimis la adresa de email specificată."
                            : "Pentru a finaliza înregistrarea, trebuie să verificați adresa de email."}
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        type="button" 
                        className="w-full"
                        onClick={sendVerificationCode}
                        disabled={verificationSent}
                      >
                        {verificationSent ? "Cod trimis" : "Trimite cod de verificare"}
                      </Button>
                    </div>
                  ) : verificationStep === 'code' ? (
                    <div className="space-y-3">
                      <Alert>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertTitle>Introduceți codul de verificare</AlertTitle>
                        <AlertDescription className="mt-2">
                          Am trimis un cod de verificare la adresa de email {registerForm.getValues("email")}. 
                          Introduceți codul primit pentru a continua.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex space-x-2">
                        <Input 
                          id="verificationCode" 
                          type="text" 
                          placeholder="Cod verificare" 
                          className="flex-1"
                          {...registerForm.register("verificationCode")} 
                        />
                        <Button 
                          type="button" 
                          className="shrink-0" 
                          onClick={verifyCode}
                        >
                          Verifică
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Nu ați primit codul? <Button 
                          type="button" 
                          variant="link" 
                          className="p-0 h-auto" 
                          onClick={sendVerificationCode}
                        >
                          Retrimite codul
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Alert variant="success">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <AlertTitle>Adresa de email verificată cu succes!</AlertTitle>
                      <AlertDescription className="mt-2">
                        Adresa de email {registerForm.getValues("email")} a fost verificată cu succes.
                      </AlertDescription>
                    </Alert>
                  )}
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