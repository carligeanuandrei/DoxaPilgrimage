import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, Calendar, MapPin, Euro, FileText, Upload, X, Info } from 'lucide-react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Simplificăm schema pentru a reduce riscul de erori
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
}).refine(data => data.endDate > data.startDate, {
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

export default function CreatePilgrimageNewPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Inițializăm formularul cu valori implicite sigure
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      month: "ianuarie",
      transportation: "autocar",
      startDate: new Date(new Date().setDate(new Date().getDate() + 7)), // data de început implicită: peste o săptămână
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)), // data de sfârșit implicită: peste două săptămâni
      price: 0,
      currency: "EUR",
      duration: 7,
      availableSpots: 20,
      guide: "",
      image: "",
    }
  });

  // Mutație pentru adăugarea unui pelerinaj nou
  const createPilgrimageMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Construim obiectul de date pentru API
      const pilgrimageData = {
        title: data.title,
        description: data.description,
        location: data.location,
        month: data.month,
        transportation: data.transportation,
        startDate: data.startDate,
        endDate: data.endDate,
        price: data.price,
        currency: data.currency,
        duration: data.duration,
        guide: data.guide,
        availableSpots: data.availableSpots,
        // Pentru simplificare, folosim doar o singură imagine pentru început
        images: data.image ? [data.image] : [],
        // Organizatorul este utilizatorul curent
        organizerId: user?.id
      };

      // Trimitem cererea către server
      const res = await apiRequest('POST', '/api/pilgrimages', pilgrimageData);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Nu s-a putut crea pelerinajul");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidăm cache-ul pentru a reîncărca lista de pelerinaje
      queryClient.invalidateQueries({ queryKey: ['/api/pilgrimages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizer/pilgrimages'] });

      toast({
        title: "Pelerinaj creat cu succes",
        description: "Pelerinajul a fost adăugat și așteaptă verificare din partea administratorilor.",
      });

      // Redirecționăm către dashboard
      navigate('/organizer/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la crearea pelerinajului",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Funcție pentru încărcarea imaginii
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

    // Creăm un FormData pentru încărcarea imaginii
    const formData = new FormData();
    formData.append('image', file);

    // Trimitem cererea de încărcare
    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error("Eroare la încărcarea imaginii");
        return res.json();
      })
      .then(data => {
        // Actualizăm câmpul image din formular
        form.setValue('image', data.url);
        // Afișăm previzualizarea imaginii
        setImagePreview(data.url);
        toast({
          title: "Imagine încărcată",
          description: "Imaginea a fost încărcată cu succes",
        });
      })
      .catch(err => {
        toast({
          title: "Eroare",
          description: err.message || "Nu s-a putut încărca imaginea",
          variant: "destructive",
        });
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
        description: "Trebuie să fiți autentificat pentru a crea un pelerinaj",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Trimitem datele la server
    createPilgrimageMutation.mutate(data);
  };

  // Verificăm dacă utilizatorul este autentificat
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Adaugă un nou pelerinaj</h1>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Informații importante</AlertTitle>
          <AlertDescription>
            Completați toate câmpurile obligatorii marcate cu *. După trimitere, pelerinajul va intra în starea "draft" și va fi vizibil doar în dashboard-ul dvs. până la verificare.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Detalii pelerinaj</CardTitle>
            <CardDescription>
              Introduceți informațiile despre noul pelerinaj
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
                            />
                          </FormControl>
                          <FormDescription>Numărul total de locuri disponibile</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Informații suplimentare */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Informații suplimentare</h3>
                  
                  {/* Ghid */}
                  <FormField
                    control={form.control}
                    name="guide"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghid spiritual *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Părintele Ioan, Mănăstirea Putna" {...field} />
                        </FormControl>
                        <FormDescription>Persoana care va ghida grupul</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Imagine */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagine reprezentativă</FormLabel>
                        <FormControl>
                          <div>
                            {!imagePreview ? (
                              <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => document.getElementById('image-upload')?.click()}>
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p>Faceți click pentru a încărca o imagine</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG sau WEBP (max. 2MB)</p>
                                <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                />
                              </div>
                            ) : (
                              <div className="relative">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="w-full h-auto rounded-md max-h-[200px] object-cover" 
                                />
                                <Button 
                                  type="button" 
                                  variant="destructive" 
                                  size="sm" 
                                  className="absolute top-2 right-2"
                                  onClick={handleImageRemove}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <input 
                                  type="hidden" 
                                  {...field}
                                  // Sincronizăm valoarea câmpului cu state-ul
                                  value={imagePreview || ''}
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>Imaginea principală ce va reprezenta pelerinajul</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Butoane acțiuni */}
                <div className="pt-6 flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/organizer/dashboard')}
                    disabled={isSubmitting}
                  >
                    Anulează
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Se salvează...
                      </>
                    ) : (
                      <>Salvează pelerinaj</>
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