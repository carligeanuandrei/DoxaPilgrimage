import React from 'react';
import { useLocation } from 'wouter';
import { Loader2, Calendar, Tag, Clock, MapPin, Euro, Image, Info, FileText, Group, X as XIcon, Activity } from 'lucide-react';
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
const formSchema = insertPilgrimageSchema.extend({
  startDate: z.coerce.date({
    required_error: "Data de început este obligatorie",
  }),
  endDate: z.coerce.date({
    required_error: "Data de sfârșit este obligatorie",
  }),
  status: z.enum(["draft", "published", "unpublished", "cancelled"], {
    required_error: "Statusul pelerinajului este obligatoriu",
  }),
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
      status: "draft"
    }
  });

  // Mutație pentru adăugarea unui pelerinaj nou
  const createPilgrimageMutation = useMutation({
    mutationFn: async (pilgrimageData: z.infer<typeof formSchema>) => {
      console.log('Trimit date:', pilgrimageData); // debugging
      
      // Verificăm dacă user?.id există
      if (!user?.id) {
        throw new Error("Trebuie să fiți autentificat ca organizator pentru a crea un pelerinaj");
      }
      
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

      const res = await apiRequest('POST', '/api/pilgrimages', modifiedData);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidăm cache-ul pentru a reîncărca lista de pelerinaje
      queryClient.invalidateQueries({ queryKey: ['/api/pilgrimages'] });

      toast({
        title: "Pelerinaj creat",
        description: "Pelerinajul a fost creat cu succes și așteaptă verificare.",
      });

      // Redirecționăm către dashboard-ul organizatorului
      navigate('/organizer/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: `Nu s-a putut crea pelerinajul: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Funcția de submit a formularului
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('Date originale formular:', data); // debugging
    
    // Logică pentru convertirea datelor de formular
    const formattedData = {
      ...data,
      // Asigurăm-ne că numerele sunt parsate corect
      price: Number(data.price),
      duration: Number(data.duration),
      availableSpots: Number(data.availableSpots),
      // Asigurăm-ne că și imaginile sunt procesate corect
      images: Array.isArray(data.images) ? data.images : [],
      // Includerea organizatorului - verificăm dacă există
      ...(user?.id ? { organizerId: user.id } : {})
    };

    console.log('Date formatate formular:', formattedData); // debugging
    createPilgrimageMutation.mutate(formattedData);
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
                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status pelerinaj</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Selectează statusul" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Ciornă (doar pentru tine)</SelectItem>
                            <SelectItem value="published">Publicat (vizibil public)</SelectItem>
                            <SelectItem value="unpublished">Nepublicat (în așteptare)</SelectItem>
                            <SelectItem value="cancelled">Anulat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Statusul determină vizibilitatea</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={createPilgrimageMutation.isPending}
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