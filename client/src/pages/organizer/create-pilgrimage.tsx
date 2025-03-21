import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, Calendar, Tag, Clock, MapPin, Euro, Image, Info, FileText, Group, X as XIcon, Activity, Plus, Check } from 'lucide-react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { insertPilgrimageSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Extindem schema Zod pentru a include validări suplimentare pentru formular
const formSchema = z.object({
  title: z.string().min(5, "Titlul trebuie să aibă cel puțin 5 caractere"),
  description: z.string().min(20, "Descrierea trebuie să aibă cel puțin 20 caractere"),
  location: z.string().min(3, "Locația trebuie să aibă cel puțin 3 caractere"),
  month: z.string(),
  transportation: z.string(),
  startDate: z.coerce.date({
    required_error: "Data de început este obligatorie",
  }).refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Data de început trebuie să fie în viitor",
  }),
  endDate: z.coerce.date({
    required_error: "Data de sfârșit este obligatorie",
  }),
  price: z.coerce.number().min(0, "Prețul trebuie să fie pozitiv"),
  currency: z.string(),
  duration: z.coerce.number().min(1, "Durata trebuie să fie de cel puțin 1 zi"),
  guide: z.string().min(3, "Numele ghidului trebuie să aibă cel puțin 3 caractere"),
  availableSpots: z.coerce.number().min(1, "Trebuie să existe cel puțin 1 loc disponibil"),
  // Status-ul este setat automat de server la "draft" 
  // Nu includem câmpul status în schema formularului
  images: z.array(z.any()).optional().default([]),
  includedServices: z.array(z.string()).optional().default([]),
  excludedServices: z.array(z.string()).optional().default([]),
}).refine(data => data.endDate > data.startDate, {
  message: "Data de sfârșit trebuie să fie după data de început",
  path: ["endDate"],
});

// Luni disponibile pentru pelerinaje
const months = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", 
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
];

// Transporturi disponibile
const transportOptions = [
  "autocar", "avion", "tren", "vapor", "autocar și avion", "autocar și vapor", "mixt"
];

export default function CreatePilgrimagePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // State pentru servicii incluse și excluse
  const [newIncludedService, setNewIncludedService] = useState<string>("");
  const [newExcludedService, setNewExcludedService] = useState<string>("");
  
  // Inițializăm formularul
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      month: "ianuarie",
      transportation: "autocar",
      price: 0,
      currency: "EUR",
      duration: 1,
      availableSpots: 20,
      guide: "",
      images: [],
      includedServices: [],
      excludedServices: []
      // Statusul este setat pe server automat la "draft"
    }
  });
  
  // Funcții pentru gestionarea serviciilor incluse
  const addIncludedService = () => {
    if (!newIncludedService.trim()) return;
    
    const currentServices = form.getValues('includedServices') || [];
    if (!currentServices.includes(newIncludedService)) {
      form.setValue('includedServices', [...currentServices, newIncludedService]);
      setNewIncludedService("");
    } else {
      toast({
        title: "Serviciu deja adăugat",
        description: "Acest serviciu este deja inclus în listă",
        variant: "destructive"
      });
    }
  };
  
  const removeIncludedService = (service: string) => {
    const currentServices = form.getValues('includedServices') || [];
    form.setValue('includedServices', 
      currentServices.filter(s => s !== service)
    );
  };
  
  // Funcții pentru gestionarea serviciilor excluse
  const addExcludedService = () => {
    if (!newExcludedService.trim()) return;
    
    const currentServices = form.getValues('excludedServices') || [];
    if (!currentServices.includes(newExcludedService)) {
      form.setValue('excludedServices', [...currentServices, newExcludedService]);
      setNewExcludedService("");
    } else {
      toast({
        title: "Serviciu deja adăugat",
        description: "Acest serviciu este deja inclus în listă",
        variant: "destructive"
      });
    }
  };
  
  const removeExcludedService = (service: string) => {
    const currentServices = form.getValues('excludedServices') || [];
    form.setValue('excludedServices', 
      currentServices.filter(s => s !== service)
    );
  };

  // Mutație pentru adăugarea unui pelerinaj nou
  const createPilgrimageMutation = useMutation({
    mutationFn: async (pilgrimageData: z.infer<typeof formSchema>) => {
      console.log('Trimit date către server:', pilgrimageData); // debugging
      
      // Verificăm dacă user?.id există
      if (!user?.id) {
        console.error('User ID lipsește - utilizatorul nu este autentificat sau nu s-au încărcat datele utilizatorului');
        throw new Error("Trebuie să fiți autentificat ca organizator pentru a crea un pelerinaj");
      }
      
      // Asigurăm-ne că toate câmpurile sunt formatate corect pentru server
      const modifiedData = {
        ...pilgrimageData,
        organizerId: user.id, // Id-ul e garantat acum
        // Asigurăm-ne că toate numerele sunt parsate corect
        price: Number(pilgrimageData.price),
        duration: Number(pilgrimageData.duration),
        availableSpots: Number(pilgrimageData.availableSpots),
        // Ne asigurăm că imaginile sunt procesate corect
        images: Array.isArray(pilgrimageData.images) ? pilgrimageData.images : []
      };

      console.log('Date modificate pentru API:', modifiedData);

      try {
        console.log('Trimit cerere POST către /api/pilgrimages cu datele:', modifiedData);
        
        const res = await apiRequest('POST', '/api/pilgrimages', modifiedData);
        
        if (!res.ok) {
          // Captăm și afișăm detaliile erorilor de la server
          const errorResponse = await res.json();
          console.error('Eroare de la server:', errorResponse);
          throw new Error(errorResponse.message || 'Eroare de la server');
        }
        
        const responseData = await res.json();
        console.log('Răspuns de la server (succes):', responseData);
        return responseData;
      } catch (error) {
        console.error('Eroare detaliată la trimiterea datelor către server:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Pelerinaj creat cu succes:', data);
      // Invalidăm cache-ul pentru a reîncărca lista de pelerinaje
      queryClient.invalidateQueries({ queryKey: ['/api/pilgrimages'] });
      // Invalidăm și lista de pelerinaje a organizatorului
      queryClient.invalidateQueries({ queryKey: ['/api/organizer/pilgrimages'] });

      toast({
        title: "Pelerinaj creat",
        description: "Pelerinajul a fost creat cu succes și așteaptă verificare.",
      });

      // Redirecționăm către dashboard-ul organizatorului
      navigate('/organizer/dashboard');
    },
    onError: (error: Error) => {
      console.error('Eroare la crearea pelerinajului:', error);
      toast({
        title: "Eroare",
        description: `Nu s-a putut crea pelerinajul: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Funcția de submit a formularului
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('Date originale formular:', data);
    
    if (!user?.id) {
      toast({
        title: "Eroare",
        description: "Trebuie să fiți autentificat pentru a crea un pelerinaj",
        variant: "destructive",
      });
      return;
    }
    
    // Validăm manual datele
    const isValid = await form.trigger();
    if (!isValid) {
      console.log('Erori de validare la submit:', form.formState.errors);
      
      // Construim un mesaj de eroare detaliat
      let errorMessage = "Vă rugăm să corectați următoarele erori:";
      const errors = form.formState.errors;
      
      if (errors.title) errorMessage += "\n• Titlu: " + errors.title.message;
      if (errors.description) errorMessage += "\n• Descriere: " + errors.description.message; 
      if (errors.location) errorMessage += "\n• Locație: " + errors.location.message;
      if (errors.guide) errorMessage += "\n• Ghid: " + errors.guide.message;
      if (errors.startDate) errorMessage += "\n• Data început: " + errors.startDate.message;
      if (errors.endDate) errorMessage += "\n• Data sfârșit: " + errors.endDate.message;
      if (errors.price) errorMessage += "\n• Preț: " + errors.price.message;
      if (errors.availableSpots) errorMessage += "\n• Locuri disponibile: " + errors.availableSpots.message;
      if (errors.duration) errorMessage += "\n• Durată: " + errors.duration.message;
      
      toast({
        title: "Formularul conține erori",
        description: errorMessage,
        variant: "destructive",
      });
      
      return;
    }
    
    try {
      // Logică pentru convertirea datelor de formular
      const formattedData = {
        ...data,
        // Asigurăm-ne că numerele sunt parsate corect
        price: Number(data.price),
        duration: Number(data.duration),
        availableSpots: Number(data.availableSpots),
        // Asigurăm-ne că și imaginile sunt procesate corect
        images: Array.isArray(data.images) 
          ? data.images.filter((img: unknown) => img !== null && img !== undefined && img !== "") 
          : [],
        // Includerea obligatorie a organizatorului
        organizerId: user.id
      };
  
      console.log('Date formatate formular pentru trimitere:', formattedData);
      
      // Folosim toast pentru a indica că procesul a început
      toast({
        title: "Se creează pelerinajul",
        description: "Vă rugăm să așteptați...",
      });
      
      await createPilgrimageMutation.mutateAsync(formattedData);
    } catch (error) {
      console.error('Eroare la formatarea datelor:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la procesarea formularului. Verificați datele introduse.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Creează un nou pelerinaj</h1>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Detalii pelerinaj</CardTitle>
            <CardDescription>
              Completează informațiile necesare pentru a crea un nou pelerinaj. 
              După trimitere, acesta va fi analizat și verificat de către echipa noastră.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Titlu */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titlu</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                          <Info className="ml-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Pelerinaj la Mănăstirea Putna" 
                            className="border-0 focus-visible:ring-0" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Titlul pelerinajului care va fi afișat</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Locație */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locație</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                          <MapPin className="ml-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Mănăstirea Putna, Bucovina, România" 
                            className="border-0 focus-visible:ring-0" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Destinația principală a pelerinajului</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descriere */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descriere</FormLabel>
                      <FormControl>
                        <div className="flex border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                          <FileText className="ml-3 mt-3 h-4 w-4 text-muted-foreground" />
                          <Textarea 
                            placeholder="Descrieți detaliat traseul, obiectivele vizitate, condițiile de cazare, masă, etc." 
                            className="border-0 focus-visible:ring-0 min-h-[150px]" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>O descriere completă a pelerinajului</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rând cu date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data început */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de început</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <DatePicker
                              date={field.value}
                              setDate={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Data începerii pelerinajului</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Data sfârșit */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de sfârșit</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <DatePicker
                              date={field.value}
                              setDate={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Data încheierii pelerinajului</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Rând cu lună și tip transport */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Luna */}
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Luna</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Selectează luna" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month.charAt(0).toUpperCase() + month.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Luna în care are loc pelerinajul</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Transport */}
                  <FormField
                    control={form.control}
                    name="transportation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mijloc de transport</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Selectează transportul" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transportOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Transportul utilizat în pelerinaj</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Rând cu durata, preț și monedă */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Durata */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durata (zile)</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                            <Clock className="ml-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="3" 
                              className="border-0 focus-visible:ring-0" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Numărul de zile</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preț */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preț</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                            <Euro className="ml-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              placeholder="299.99" 
                              className="border-0 focus-visible:ring-0" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Prețul per persoană</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Moneda */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monedă</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <Euro className="mr-2 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Selectează moneda" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="RON">RON (Lei)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Moneda de plată</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Rând cu locuri disponibile și ghid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Notă: Status-ul este gestionat automat de server */}
                  
                  {/* Locuri disponibile */}
                  <FormField
                    control={form.control}
                    name="availableSpots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locuri disponibile</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                            <Group className="ml-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="20" 
                              className="border-0 focus-visible:ring-0" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Numărul de locuri disponibile</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ghid */}
                  <FormField
                    control={form.control}
                    name="guide"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghid / Însoțitor</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                            <Info className="ml-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Nume ghid sau însoțitor" 
                              className="border-0 focus-visible:ring-0" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Numele ghidului sau însoțitorului grupului</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Imagini */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagini</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {/* Afișarea imaginilor încărcate */}
                          {field.value && field.value.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {Array.isArray(field.value) && field.value.map((url: unknown, index: number) => (
                                <div key={index} className="relative group">
                                  <img 
                                    src={typeof url === 'string' ? url : String(url)} 
                                    alt={`Imagine ${index + 1}`} 
                                    className="h-20 w-20 object-cover rounded-md border" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = Array.isArray(field.value) ? [...field.value] : [];
                                      newImages.splice(index, 1);
                                      field.onChange(newImages);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Încărcarea de noi imagini */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const formData = new FormData();
                                    formData.append('image', file);

                                    try {
                                      const response = await fetch('/api/upload-image', {
                                        method: 'POST',
                                        body: formData,
                                        credentials: 'include'
                                      });

                                      if (response.ok) {
                                        const data = await response.json();
                                        const currentValues = Array.isArray(field.value) ? field.value : [];
                                        field.onChange([...currentValues, data.imageUrl]);
                                        // Reset input value
                                        e.target.value = '';
                                      } else {
                                        const errorData = await response.json();
                                        toast({
                                          title: "Eroare",
                                          description: errorData.message || "Eroare la încărcarea imaginii",
                                          variant: "destructive"
                                        });
                                      }
                                    } catch (error) {
                                      console.error("Eroare la încărcarea imaginii:", error);
                                      toast({
                                        title: "Eroare",
                                        description: "Nu s-a putut încărca imaginea",
                                        variant: "destructive"
                                      });
                                    }
                                  }
                                }}
                              />
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => {
                                  const fileInput = document.querySelector('input[type="file"]');
                                  if (fileInput instanceof HTMLElement) {
                                    fileInput.click();
                                  }
                                }}
                              >
                                <Image className="h-4 w-4 mr-2" />
                                Încarcă
                              </Button>
                            </div>
                            <FormDescription>Sau adaugă URL-uri de imagini separate prin virgulă</FormDescription>
                            <Input
                              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                              value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              onChange={(e) => {
                                const values = e.target.value.split(',').map(url => url.trim()).filter(Boolean);
                                field.onChange(values);
                              }}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Secțiune servicii incluse */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Servicii incluse</h3>
                    <span className="text-sm text-muted-foreground">Adăugați serviciile incluse în prețul pelerinajului</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="includedServices"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Ex: Transport cu autocar"
                            value={newIncludedService}
                            onChange={(e) => setNewIncludedService(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            onClick={addIncludedService}
                            size="sm"
                            className="px-3"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adaugă
                          </Button>
                        </div>
                        <div className="mt-3">
                          {field.value && field.value.length > 0 ? (
                            <div className="border rounded-md p-3">
                              <ul className="space-y-2">
                                {field.value.map((service, index) => (
                                  <li key={index} className="flex items-center justify-between bg-primary-50 p-2 rounded">
                                    <div className="flex items-center">
                                      <Check className="h-4 w-4 mr-2 text-green-600" />
                                      <span>{service}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive"
                                      onClick={() => removeIncludedService(service)}
                                    >
                                      <XIcon className="h-4 w-4" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                              <p>Nu există servicii incluse adăugate</p>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Secțiune servicii neincluse */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Servicii neincluse</h3>
                    <span className="text-sm text-muted-foreground">Adăugați serviciile care NU sunt incluse în preț</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="excludedServices"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Ex: Taxe de intrare la obiective"
                            value={newExcludedService}
                            onChange={(e) => setNewExcludedService(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            onClick={addExcludedService}
                            size="sm"
                            className="px-3"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adaugă
                          </Button>
                        </div>
                        <div className="mt-3">
                          {field.value && field.value.length > 0 ? (
                            <div className="border rounded-md p-3">
                              <ul className="space-y-2">
                                {field.value.map((service, index) => (
                                  <li key={index} className="flex items-center justify-between bg-rose-50 p-2 rounded">
                                    <div className="flex items-center">
                                      <XIcon className="h-4 w-4 mr-2 text-rose-600" />
                                      <span>{service}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive"
                                      onClick={() => removeExcludedService(service)}
                                    >
                                      <XIcon className="h-4 w-4" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                              <p>Nu există servicii neincluse adăugate</p>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={createPilgrimageMutation.isPending}
                    id="create-pilgrimage-button"
                  >
                    {createPilgrimageMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Creează pelerinaj
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6 pb-2">
            <Button variant="outline" onClick={() => navigate('/organizer/dashboard')}>
              Anulează
            </Button>

            <p className="text-sm text-muted-foreground">
              Pelerinajul va fi verificat de către echipa noastră înainte de a fi publicat.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}