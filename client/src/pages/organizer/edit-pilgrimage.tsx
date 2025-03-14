import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Loader2, Calendar, MapPin, Euro, FileText, Upload, X, Info, Plus, Check } from 'lucide-react';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Pilgrimage } from '@shared/schema';

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Folosim aceeași schemă de validare ca la crearea pelerinajului
const formSchema = z.object({
  title: z.string().min(5, "Titlul trebuie să aibă cel puțin 5 caractere"),
  description: z.string().min(20, "Descrierea trebuie să aibă cel puțin 20 caractere"),
  location: z.string().min(3, "Locația trebuie să aibă cel puțin 3 caractere"),
  month: z.string(),
  transportation: z.string(),
  startDate: z.date({
    required_error: "Data de început este obligatorie",
  }),
  endDate: z.date({
    required_error: "Data de sfârșit este obligatorie",
  }),
  price: z.number().min(0, "Prețul trebuie să fie pozitiv"),
  currency: z.string(),
  duration: z.number().min(1, "Durata trebuie să fie de cel puțin 1 zi"),
  guide: z.string().min(3, "Numele ghidului trebuie să aibă cel puțin 3 caractere"),
  availableSpots: z.number().min(1, "Trebuie să existe cel puțin 1 loc disponibil"),
  image: z.string().optional(),
  includedServices: z.array(z.string()).optional(),
  excludedServices: z.array(z.string()).optional(),
}).refine(data => {
  // Verificăm că endDate este după startDate
  const start = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
  const end = data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
  return end > start;
}, {
  message: "Data de sfârșit trebuie să fie după data de început",
  path: ["endDate"],
});

// Type pentru formular
type FormValues = z.infer<typeof formSchema>;

// Luni disponibile pentru pelerinaje
const months = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", 
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
];

// Transporturi disponibile
const transportOptions = [
  "autocar", "avion", "tren", "vapor", "autocar și avion", "autocar și vapor", "mixt"
];

// Valute disponibile
const currencyOptions = ["RON", "EUR", "USD"];

interface EditPilgrimagePageProps {
  id?: string;
}

export default function EditPilgrimagePage({ id: propId }: EditPilgrimagePageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const paramId = params?.id;
  const pilgrimageId = parseInt(propId || paramId || '0');
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State pentru servicii incluse și excluse
  const [newIncludedService, setNewIncludedService] = useState<string>("");
  const [newExcludedService, setNewExcludedService] = useState<string>("");
  
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

  // Inițializăm formularul cu valori implicite sigure
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      month: "ianuarie",
      transportation: "autocar",
      startDate: new Date(), 
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      price: 0,
      currency: "EUR",
      duration: 7,
      availableSpots: 20,
      guide: "",
      image: "",
      includedServices: [],
      excludedServices: [],
    }
  });

  // Obținem datele pelerinajului
  const { data: pilgrimage, isLoading, error } = useQuery<Pilgrimage>({
    queryKey: [`/api/pilgrimages/${pilgrimageId}`],
    enabled: !!pilgrimageId,
  });

  // Setăm valorile inițiale ale formularului când datele sunt disponibile
  useEffect(() => {
    if (pilgrimage) {
      const startDate = pilgrimage.startDate instanceof Date 
        ? pilgrimage.startDate 
        : new Date(pilgrimage.startDate);
      
      const endDate = pilgrimage.endDate instanceof Date 
        ? pilgrimage.endDate 
        : new Date(pilgrimage.endDate);
      
      // Verificăm dacă datele sunt valide
      const validStartDate = !isNaN(startDate.getTime()) ? startDate : new Date();
      const validEndDate = !isNaN(endDate.getTime()) ? endDate : new Date(new Date().setDate(new Date().getDate() + 7));
      
      form.reset({
        title: pilgrimage.title,
        description: pilgrimage.description,
        location: pilgrimage.location,
        month: pilgrimage.month,
        transportation: pilgrimage.transportation,
        startDate: validStartDate,
        endDate: validEndDate,
        price: pilgrimage.price,
        currency: pilgrimage.currency,
        duration: pilgrimage.duration,
        guide: pilgrimage.guide,
        availableSpots: pilgrimage.availableSpots,
        image: pilgrimage.images && pilgrimage.images.length > 0 ? pilgrimage.images[0] : "",
        includedServices: pilgrimage.includedServices || [],
        excludedServices: pilgrimage.excludedServices || [],
      });

      // Setăm previzualizarea imaginii
      if (pilgrimage.images && pilgrimage.images.length > 0) {
        setImagePreview(pilgrimage.images[0]);
      }
    }
  }, [pilgrimage, form]);

  // Mutație pentru actualizarea pelerinajului
  const updatePilgrimageMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      console.log("Date primite pentru actualizare:", data);
      
      // Construim obiectul de date pentru API cu conversii explicite
      const pilgrimageData = {
        title: data.title,
        description: data.description,
        location: data.location,
        month: data.month,
        transportation: data.transportation,
        // Convertim explicit Date în string ISO pentru backend, cu verificări suplimentare pentru a preveni erorile
        startDate: (() => {
          console.log("startDate tip:", typeof data.startDate, "valoare:", data.startDate);
          if (data.startDate instanceof Date && !isNaN(data.startDate.getTime())) {
            return data.startDate.toISOString();
          } else if (typeof data.startDate === 'string') {
            try {
              // Încercăm să validăm string-ul
              const testDate = new Date(data.startDate);
              if (!isNaN(testDate.getTime())) {
                return testDate.toISOString();
              } else {
                console.error("String de dată invalid pentru startDate:", data.startDate);
                return new Date().toISOString(); // Folosim data curentă ca ultimă soluție
              }
            } catch (e) {
              console.error("Eroare la conversia startDate:", e);
              return new Date().toISOString();
            }
          } else {
            console.error("Tip de dată neprevăzut pentru startDate:", typeof data.startDate);
            return new Date().toISOString();
          }
        })(),
        
        endDate: (() => {
          console.log("endDate tip:", typeof data.endDate, "valoare:", data.endDate);
          if (data.endDate instanceof Date && !isNaN(data.endDate.getTime())) {
            return data.endDate.toISOString();
          } else if (typeof data.endDate === 'string') {
            try {
              const testDate = new Date(data.endDate);
              if (!isNaN(testDate.getTime())) {
                return testDate.toISOString();
              } else {
                console.error("String de dată invalid pentru endDate:", data.endDate);
                // Folosim data curentă + 7 zile ca ultimă soluție
                return new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
              }
            } catch (e) {
              console.error("Eroare la conversia endDate:", e);
              return new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            }
          } else {
            console.error("Tip de dată neprevăzut pentru endDate:", typeof data.endDate);
            return new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          }
        })(),
        
        // Asigurăm valori numerice cu verificări robuste
        price: typeof data.price === 'string' ? parseFloat(data.price) || 0 : (data.price || 0),
        currency: data.currency,
        duration: typeof data.duration === 'string' ? parseInt(data.duration) || 1 : (data.duration || 1),
        guide: data.guide,
        availableSpots: typeof data.availableSpots === 'string' ? parseInt(data.availableSpots) || 1 : (data.availableSpots || 1),
        // Pentru servicii incluse/excluse
        includedServices: data.includedServices || [],
        excludedServices: data.excludedServices || [],
        // Pentru simplificare, folosim doar o singură imagine pentru început
        images: data.image ? [data.image] : [],
      };

      // Trimitem cererea către server
      const res = await apiRequest('PUT', `/api/pilgrimages/${pilgrimageId}`, pilgrimageData);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Nu s-a putut actualiza pelerinajul");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidăm cache-ul pentru a reîncărca lista de pelerinaje
      queryClient.invalidateQueries({ queryKey: ['/api/pilgrimages'] });
      queryClient.invalidateQueries({ queryKey: [`/api/pilgrimages/${pilgrimageId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizer/pilgrimages'] });

      toast({
        title: "Pelerinaj actualizat cu succes",
        description: "Modificările au fost salvate cu succes.",
      });

      // Redirecționăm către dashboard
      navigate('/organizer/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la actualizarea pelerinajului",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Funcție pentru încărcarea imaginii - implementare simplificată
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificăm tipul fișierului
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Eroare",
        description: "Vă rugăm să încărcați doar fișiere imagine (jpg, png, etc)",
        variant: "destructive",
      });
      return;
    }

    // Verificăm dimensiunea fișierului (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Eroare",
        description: "Imaginea trebuie să fie mai mică de 2MB",
        variant: "destructive",
      });
      return;
    }

    // Simulăm încărcarea imaginii (în implementarea reală ar trebui să folosești un FormData și să faci upload)
    // Pentru simplificare, pretindem că imaginea a fost încărcată și folosim URL-ul local
    const imageUrl = URL.createObjectURL(file);
    form.setValue('image', imageUrl);
    setImagePreview(imageUrl);
    toast({
      title: "Imagine încărcată",
      description: "Imaginea a fost încărcată cu succes (simulare)",
    });
  };

  // Funcție pentru ștergerea imaginii
  const handleImageRemove = () => {
    form.setValue('image', '');
    setImagePreview(null);
  };

  // Funcția de submit a formularului
  const onSubmit = (data: FormValues) => {
    // Setăm starea de trimitere
    setIsSubmitting(true);

    // Verificăm dacă utilizatorul este autentificat
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fiți autentificat pentru a edita un pelerinaj",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Verificăm dacă utilizatorul are permisiuni de editare
    if (pilgrimage && pilgrimage.organizerId !== user.id && user.role !== 'admin') {
      toast({
        title: "Eroare",
        description: "Nu aveți permisiunea de a edita acest pelerinaj",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Ne asigurăm că datele sunt formatate corect
    updatePilgrimageMutation.mutate(data);
  };

  // Afișăm un loader în timp ce datele se încarcă
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Dacă există o eroare, o afișăm
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTitle>Eroare</AlertTitle>
          <AlertDescription>
            Nu s-a putut încărca pelerinajul pentru editare. Vă rugăm să încercați din nou.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/organizer/dashboard')}>Înapoi la Dashboard</Button>
        </div>
      </div>
    );
  }

  // Afișăm un mesaj dacă pelerinajul nu a fost găsit
  if (!pilgrimage) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTitle>Pelerinaj negăsit</AlertTitle>
          <AlertDescription>
            Pelerinajul pe care încercați să îl editați nu a fost găsit.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/organizer/dashboard')}>Înapoi la Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Editare pelerinaj: {pilgrimage.title}</h1>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Informații importante</AlertTitle>
          <AlertDescription>
            Editați informațiile pelerinajului. Toate câmpurile marcate cu * sunt obligatorii.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Detalii pelerinaj</CardTitle>
            <CardDescription>
              Actualizați informațiile despre pelerinaj
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Informații de bază */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informații de bază</h3>
                  
                  {/* Titlu */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titlu *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Pelerinaj la Muntele Athos" {...field} />
                        </FormControl>
                        <FormDescription>Titlul care va fi afișat pentru pelerinaj</FormDescription>
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
                        <FormLabel>Locație *</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ex: Muntele Athos, Grecia" {...field} />
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
                        <FormLabel>Descriere *</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Textarea 
                              placeholder="Descrieți detaliat pelerinajul, obiectivele vizitate, programul zilnic, etc." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Includeți toate detaliile importante</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Perioada și durata */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Perioada și durata</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Data de început */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de început *</FormLabel>
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

                    {/* Data de sfârșit */}
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de sfârșit *</FormLabel>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Luna */}
                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Luna *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selectați luna" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month} value={month}>{month}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Luna în care are loc pelerinajul</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Durata */}
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durata (zile) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                              value={field.value}
                            />
                          </FormControl>
                          <FormDescription>Numărul total de zile</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Detalii cost și transport */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Cost și transport</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Preț */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preț *</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Euro className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                min={0} 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                value={field.value}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>Prețul per persoană</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Monedă */}
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monedă *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selectați moneda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencyOptions.map((currency) => (
                                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Moneda în care este exprimat prețul</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mijloc de transport */}
                    <FormField
                      control={form.control}
                      name="transportation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mijloc de transport *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selectați mijlocul de transport" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {transportOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Modul de deplasare principal</FormDescription>
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
                          <FormLabel>Ghid *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Pr. Gheorghe Popescu" {...field} />
                          </FormControl>
                          <FormDescription>Numele ghidului care va însoți grupul</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Număr de locuri disponibile */}
                  <FormField
                    control={form.control}
                    name="availableSpots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locuri disponibile *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>Numărul total de locuri disponibile</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Servicii incluse și excluse */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Servicii</h3>
                  
                  {/* Servicii incluse */}
                  <div>
                    <h4 className="text-base font-medium mb-2">Servicii incluse</h4>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {form.watch('includedServices')?.map((service, index) => (
                        <div key={index} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          {service}
                          <button
                            type="button"
                            onClick={() => removeIncludedService(service)}
                            className="ml-2 text-primary/70 hover:text-primary"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newIncludedService}
                        onChange={e => setNewIncludedService(e.target.value)}
                        placeholder="Ex: Transport cu autocar"
                        className="max-w-sm"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addIncludedService}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adaugă
                      </Button>
                    </div>
                    <FormDescription>
                      Adăugați serviciile care sunt incluse în prețul pelerinajului
                    </FormDescription>
                  </div>
                  
                  {/* Servicii excluse */}
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Servicii neincluse</h4>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {form.watch('excludedServices')?.map((service, index) => (
                        <div key={index} className="bg-destructive/10 text-destructive rounded-full px-3 py-1 text-sm flex items-center">
                          <X className="h-3 w-3 mr-1" />
                          {service}
                          <button
                            type="button"
                            onClick={() => removeExcludedService(service)}
                            className="ml-2 text-destructive/70 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newExcludedService}
                        onChange={e => setNewExcludedService(e.target.value)}
                        placeholder="Ex: Masa de prânz"
                        className="max-w-sm"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addExcludedService}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adaugă
                      </Button>
                    </div>
                    <FormDescription>
                      Specificați serviciile care NU sunt incluse în preț și se plătesc separat
                    </FormDescription>
                  </div>
                </div>
                
                {/* Imagine */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Imagine</h3>
                  
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Previzualizare imagine" 
                          className="w-full max-w-md rounded-md object-cover h-auto max-h-64" 
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/30 backdrop-blur-sm hover:bg-white/50"
                          onClick={handleImageRemove}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md h-40 max-w-md">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Nicio imagine selectată
                          </p>
                          <label 
                            htmlFor="image-upload" 
                            className="mt-2 cursor-pointer inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                          >
                            Încărcați imagine
                          </label>
                          <input 
                            id="image-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Butoane pentru acțiuni */}
                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-end">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => navigate('/organizer/dashboard')}
                  >
                    Anulează
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Se salvează...
                      </>
                    ) : (
                      "Salvează modificările"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}