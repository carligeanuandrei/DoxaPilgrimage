import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CmsContent } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileTextIcon, Code2Icon, ImageIcon, PlusIcon, PencilIcon, Trash2Icon, DownloadIcon, ListIcon, AlertTriangleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { CmsInitializers } from './cms-initializers';

// Define the form validation schema
const cmsFormSchema = z.object({
  key: z.string().min(2, { message: 'Cheia trebuie să aibă cel puțin 2 caractere' }),
  contentType: z.enum(['text', 'html', 'image']),
  value: z.string().min(1, { message: 'Conținutul nu poate fi gol' }),
  description: z.string().optional(),
});

type CmsFormValues = z.infer<typeof cmsFormSchema>;

export default function CmsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [location] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [filterPrefix, setFilterPrefix] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Extract filter from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    setFilterPrefix(filter);
  }, [location]);

  // Funcția pentru încărcarea directă a imaginilor
  const handleImageUpload = async (file: File): Promise<string> => {
    // Creează un obiect FormData pentru a trimite fișierul
    const formData = new FormData();
    formData.append('image', file);
    
    setUploadProgress(10);

    try {
      // Trimite imaginea la server
      const response = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      setUploadProgress(70);
      
      if (!response.ok) {
        throw new Error('Eroare la încărcarea imaginii');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      // Actualizează formularul cu URL-ul imaginii
      form.setValue('value', data.url);
      
      // Returnează URL-ul imaginii încărcate
      return data.url;
    } catch (error) {
      console.error('Eroare la încărcarea imaginii:', error);
      toast({
        title: 'Eroare la încărcarea imaginii',
        description: 'Nu s-a putut încărca imaginea pe server.',
        variant: 'destructive',
      });
      setUploadProgress(0);
      throw error;
    }
  };

  // Gestionează schimbarea fișierului
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadImage(file);
      
      // Creează o previzualizare pentru imagine
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Automat începe încărcarea și actualizează valoarea câmpului
      try {
        const imageUrl = await handleImageUpload(file);
        // URL-ul imaginii va fi setat în handleImageUpload
      } catch (error) {
        // Eroarea este deja tratată în handleImageUpload
        console.error("Eroare la încărcarea automată a imaginii:", error);
      }
    }
  };

  // Setup form
  const form = useForm<CmsFormValues>({
    resolver: zodResolver(cmsFormSchema),
    defaultValues: {
      key: '',
      contentType: 'text',
      value: '',
      description: '',
    },
  });

  // Fetch CMS content
  const { data: cmsContents, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/cms'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/cms');
      const data = await res.json();
      return data;
    },
    // Configurare pentru actualizare frecventă
    refetchOnWindowFocus: true,
    staleTime: 1000, // 1 secundă
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CmsFormValues) => {
      // Dacă avem o imagine pentru upload, mai întâi o încărcăm
      if (data.contentType === 'image' && uploadImage) {
        try {
          const imageUrl = await handleImageUpload(uploadImage);
          // Actualizăm valoarea cu URL-ul imaginii încărcate
          data.value = imageUrl;
        } catch (error) {
          // Eroarea este deja tratată în handleImageUpload
          throw new Error('Încărcarea imaginii a eșuat');
        }
      }
      
      return apiRequest('POST', '/api/cms', data);
    },
    onSuccess: () => {
      // Invalidează toate interogările pentru a re-încărca datele în toate componentele
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
      
      // Resetează starea formularului și a încărcării
      setUploadImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      // Forțează reîmprospătarea pentru alte componente care utilizează date CMS
      queryClient.invalidateQueries();
      toast({
        title: 'Succes!',
        description: 'Conținutul a fost adăugat cu succes.',
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Eroare!',
        description: `Nu s-a putut adăuga conținutul: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CmsFormValues) => {
      // Dacă avem o imagine pentru upload, mai întâi o încărcăm
      if (data.contentType === 'image' && uploadImage) {
        try {
          const imageUrl = await handleImageUpload(uploadImage);
          // Actualizăm valoarea cu URL-ul imaginii încărcate
          data.value = imageUrl;
        } catch (error) {
          // Eroarea este deja tratată în handleImageUpload
          throw new Error('Încărcarea imaginii a eșuat');
        }
      }
      
      return apiRequest('PUT', `/api/cms/${data.key}`, data);
    },
    onSuccess: () => {
      // Invalidează specific interogările CMS pentru a re-încărca datele
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
      
      // Forțează reîmprospătarea TUTUROR datelor pentru a actualiza și componentele care folosesc CMS
      queryClient.invalidateQueries();
      
      // Forțează reîmprospătarea imediată
      setTimeout(() => {
        refetch();
      }, 300);
      
      // Resetează starea formularului și a încărcării
      setUploadImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      
      toast({
        title: 'Succes!',
        description: 'Conținutul a fost actualizat cu succes.',
      });
      setDialogOpen(false);
      setIsEditing(false);
      setCurrentKey(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Eroare!',
        description: `Nu s-a putut actualiza conținutul: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (key: string) => apiRequest('DELETE', `/api/cms/${key}`),
    onSuccess: () => {
      // Invalidează specific interogările CMS pentru a re-încărca datele
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
      // Forțează reîmprospătarea pentru alte componente care utilizează date CMS
      queryClient.invalidateQueries();
      
      toast({
        title: 'Succes!',
        description: 'Conținutul a fost șters cu succes.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare!',
        description: `Nu s-a putut șterge conținutul: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = async (values: CmsFormValues) => {
    // Dacă avem o imagine încărcată, o procesăm întâi și actualizăm câmpul value
    if (values.contentType === 'image' && uploadImage) {
      try {
        form.setValue('value', 'Se încarcă imaginea...');
        // Încărcăm imaginea și obținem URL-ul
        const imageUrl = await handleImageUpload(uploadImage);
        // Actualizăm valoarea formularului cu URL-ul imaginii
        values.value = imageUrl;
      } catch (error) {
        console.error('Eroare la încărcarea imaginii:', error);
        toast({
          title: 'Eroare la încărcarea imaginii',
          description: 'A apărut o eroare la încărcarea imaginii. Încercați din nou.',
          variant: 'destructive',
        });
        return; // Nu continuăm cu trimiterea formularului
      }
    }

    // Acum trimitem formularul cu imaginea deja procesată
    if (isEditing && currentKey) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  // Handle edit action
  const handleEdit = (content: CmsContent) => {
    setIsEditing(true);
    setCurrentKey(content.key);
    form.reset({
      key: content.key,
      contentType: content.contentType as 'text' | 'html' | 'image',
      value: content.value,
      description: content.description || '',
    });
    setDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = (key: string) => {
    if (window.confirm(`Sigur doriți să ștergeți conținutul cu cheia "${key}"?`)) {
      deleteMutation.mutate(key);
    }
  };

  // Close dialog handler
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setCurrentKey(null);
    form.reset();
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acces interzis</CardTitle>
            <CardDescription>
              Nu aveți permisiunea de a accesa această pagină.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionare conținut CMS</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditing(false);
              form.reset({
                key: '',
                contentType: 'text',
                value: '',
                description: '',
              });
            }}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Adaugă conținut
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editează conținut' : 'Adaugă conținut nou'}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? 'Modificați informațiile conținutului existent.'
                  : 'Completați detaliile pentru adăugarea unui nou element de conținut.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cheie</FormLabel>
                      {isEditing ? (
                        <FormControl>
                          <Input 
                            placeholder="Cheia unică" 
                            {...field} 
                            disabled={true}
                          />
                        </FormControl>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <FormControl>
                            <Input 
                              placeholder="Introduceți cheia unică" 
                              {...field} 
                              className={field.value ? "border-green-300 bg-green-50" : ""}
                            />
                          </FormControl>
                          
                          {/* Dropdown cu chei predefinite */}
                          <div className="flex flex-wrap gap-1">
                            <Select
                              onValueChange={(value) => {
                                if (value && value !== "__placeholder") {
                                  form.setValue('key', value);
                                }
                              }}
                              value="__placeholder"
                            >
                              <FormControl>
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Selectați o cheie predefinită" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="__placeholder">Selectați o cheie predefinită</SelectItem>
                                {/* Bannere principale */}
                                <SelectItem value="homepage_banner_1">Banner Principal 1 (homepage_banner_1)</SelectItem>
                                <SelectItem value="homepage_banner_2">Banner Principal 2 (homepage_banner_2)</SelectItem>
                                <SelectItem value="homepage_banner_3">Banner Principal 3 (homepage_banner_3)</SelectItem>
                                <SelectItem value="homepage_banner_4">Banner Principal 4 (homepage_banner_4)</SelectItem>
                                
                                {/* Bannere secundare */}
                                <SelectItem value="promo_banner_1">Banner Promoțional 1 (promo_banner_1)</SelectItem>
                                <SelectItem value="promo_banner_2">Banner Promoțional 2 (promo_banner_2)</SelectItem>
                                <SelectItem value="promo_banner_3">Banner Promoțional 3 (promo_banner_3)</SelectItem>
                                <SelectItem value="promo_banner_4">Banner Promoțional 4 (promo_banner_4)</SelectItem>
                                <SelectItem value="promo_banner_section_title">Titlu Secțiune Promoții (promo_banner_section_title)</SelectItem>
                                
                                {/* Imagini destinații */}
                                <SelectItem value="destination_image_romania">Img România (destination_image_romania)</SelectItem>
                                <SelectItem value="destination_image_greece">Img Grecia (destination_image_greece)</SelectItem>
                                <SelectItem value="destination_image_israel">Img Israel (destination_image_israel)</SelectItem>
                                <SelectItem value="destination_image_italy">Img Italia (destination_image_italy)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      <FormDescription className="mt-1 text-xs">
                        Utilizați un format consistent pentru chei: <code>sectiune_element_detaliu</code>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tip conținut</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectați tipul de conținut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text simplu</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="image">URL imagine</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valoare</FormLabel>
                      <FormControl>
                        {form.watch('contentType') === 'html' ? (
                          <Textarea 
                            placeholder="Introduceți conținutul HTML"
                            className="h-32"
                            {...field} 
                          />
                        ) : form.watch('contentType') === 'image' ? (
                          <div className="space-y-4">
                            {/* Input pentru URL imagine existent */}
                            <Input 
                              placeholder="Introduceți URL-ul imaginii sau încărcați una nouă" 
                              {...field} 
                              className={uploadImage ? "border-green-300 bg-green-50" : ""}
                            />
                            
                            {/* Secțiunea pentru încărcare directă */}
                            <div className="border border-dashed border-gray-300 rounded-md p-4">
                              <p className="text-sm text-gray-500 mb-2">
                                Sau încărcați o imagine direct:
                              </p>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-primary file:text-white
                                  hover:file:bg-primary-dark"
                              />
                              
                              {/* Previzualizare imagine încărcată */}
                              {imagePreview && (
                                <div className="mt-4">
                                  <p className="text-sm text-gray-500 mb-2">Previzualizare:</p>
                                  <div className="relative border rounded-md overflow-hidden" style={{ maxWidth: '300px' }}>
                                    <img 
                                      src={imagePreview} 
                                      alt="Preview" 
                                      className="max-w-full h-auto"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUploadImage(null);
                                        setImagePreview(null);
                                      }}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                      title="Renunță la imagine"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {/* Indicator progres încărcare */}
                              {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-primary h-2.5 rounded-full" 
                                      style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Încărcare: {uploadProgress}%</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Input 
                            placeholder="Introduceți textul" 
                            {...field} 
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descriere (opțional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Adăugați o descriere scurtă" {...field} />
                      </FormControl>
                      <FormDescription className="mt-1 text-xs">
                        {form.watch('contentType') === 'image' && 
                          (form.watch('key')?.startsWith('homepage_banner_') || form.watch('key')?.startsWith('promo_banner_')) && 
                          "Pentru bannere, descrierea va fi folosită ca titlu afișat pe banner."
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">Anulează</Button>
                  </DialogClose>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {isEditing ? "Actualizează" : "Salvează"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="all">Toate</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="image">Imagini</TabsTrigger>
          </TabsList>
        
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative">
              <Input 
                placeholder="Filtrează conținut după cuvinte cheie..." 
                value={filterPrefix || ""}
                onChange={(e) => setFilterPrefix(e.target.value.trim() || null)}
                className="h-9 md:w-[300px]"
              />
              {filterPrefix && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => setFilterPrefix(null)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  <span className="sr-only">Șterge</span>
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilterPrefix("footer_")}
                className={filterPrefix === "footer_" ? "bg-amber-100" : ""}
              >
                Footer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilterPrefix("contact_")}
                className={filterPrefix === "contact_" ? "bg-blue-100" : ""}
              >
                Contact
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilterPrefix("homepage_")}
                className={filterPrefix === "homepage_" ? "bg-green-100" : ""}
              >
                Homepage
              </Button>
            </div>
            
            {/* Butoane pentru operațiuni avansate */}
            <div className="flex flex-wrap gap-1 mt-2">
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-blue-50 hover:bg-blue-100"
                onClick={async () => {
                  if(!window.confirm("Doriți să inițializați toate elementele CMS pentru footer? Această operațiune va crea toate cheile necesare.")) {
                    return;
                  }
                  
                  // Array cu toate cheile și valorile pentru footer
                  const footerItems = [
                    { key: "footer_brand_name", contentType: "text", value: "Doxa", description: "Numele brandului din footer" },
                    { key: "footer_brand_icon", contentType: "image", value: "/images/icons/icon-cross.svg", description: "Iconița brandului din footer" },
                    { key: "footer_description", contentType: "text", value: "Platformă de pelerinaje care conectează pelerini cu organizatori de încredere pentru experiențe spirituale autentice.", description: "Descriere scurtă despre platformă" },
                    
                    // Social media
                    { key: "footer_social_facebook_url", contentType: "text", value: "https://facebook.com", description: "Link către Facebook" },
                    { key: "footer_social_facebook", contentType: "image", value: "/images/icons/facebook.svg", description: "Iconița Facebook" },
                    { key: "footer_social_instagram_url", contentType: "text", value: "https://instagram.com", description: "Link către Instagram" },
                    { key: "footer_social_instagram", contentType: "image", value: "/images/icons/instagram.svg", description: "Iconița Instagram" },
                    { key: "footer_social_youtube_url", contentType: "text", value: "https://youtube.com", description: "Link către YouTube" },
                    { key: "footer_social_youtube", contentType: "image", value: "/images/icons/youtube.svg", description: "Iconița YouTube" },
                    
                    // Quicklinks
                    { key: "footer_quicklinks_title", contentType: "text", value: "Linkuri Rapide", description: "Titlul secțiunii de linkuri rapide" },
                    { key: "footer_link_home", contentType: "text", value: "Acasă", description: "Text pentru link-ul Acasă" },
                    { key: "footer_link_home_url", contentType: "text", value: "/", description: "URL pentru link-ul Acasă" },
                    { key: "footer_link_pilgrimages", contentType: "text", value: "Pelerinaje", description: "Text pentru link-ul Pelerinaje" },
                    { key: "footer_link_pilgrimages_url", contentType: "text", value: "/pilgrimages", description: "URL pentru link-ul Pelerinaje" },
                    { key: "footer_link_about", contentType: "text", value: "Despre Noi", description: "Text pentru link-ul Despre Noi" },
                    { key: "footer_link_about_url", contentType: "text", value: "/about", description: "URL pentru link-ul Despre Noi" },
                    { key: "footer_link_contact", contentType: "text", value: "Contact", description: "Text pentru link-ul Contact" },
                    { key: "footer_link_contact_url", contentType: "text", value: "/contact", description: "URL pentru link-ul Contact" },
                    { key: "footer_link_auth", contentType: "text", value: "Autentificare", description: "Text pentru link-ul Autentificare" },
                    { key: "footer_link_auth_url", contentType: "text", value: "/auth", description: "URL pentru link-ul Autentificare" },
                    
                    // Destinations
                    { key: "footer_destinations_title", contentType: "text", value: "Destinații Populare", description: "Titlul secțiunii de destinații populare" },
                    { key: "footer_destination_israel", contentType: "text", value: "Israel și Palestina", description: "Text pentru link-ul Israel și Palestina" },
                    { key: "footer_destination_israel_url", contentType: "text", value: "/pilgrimages?location=Israel", description: "URL pentru link-ul Israel și Palestina" },
                    { key: "footer_destination_athos", contentType: "text", value: "Muntele Athos", description: "Text pentru link-ul Muntele Athos" },
                    { key: "footer_destination_athos_url", contentType: "text", value: "/pilgrimages?location=Grecia", description: "URL pentru link-ul Muntele Athos" },
                    { key: "footer_destination_moldova", contentType: "text", value: "Mănăstirile din Moldova", description: "Text pentru link-ul Mănăstirile din Moldova" },
                    { key: "footer_destination_moldova_url", contentType: "text", value: "/pilgrimages?location=România", description: "URL pentru link-ul Mănăstirile din Moldova" },
                    { key: "footer_destination_vatican", contentType: "text", value: "Vatican", description: "Text pentru link-ul Vatican" },
                    { key: "footer_destination_vatican_url", contentType: "text", value: "/pilgrimages?location=Vatican", description: "URL pentru link-ul Vatican" },
                    { key: "footer_destination_lourdes", contentType: "text", value: "Lourdes", description: "Text pentru link-ul Lourdes" },
                    { key: "footer_destination_lourdes_url", contentType: "text", value: "/pilgrimages?location=Franța", description: "URL pentru link-ul Lourdes" },
                    
                    // Contact info
                    { key: "footer_contact_title", contentType: "text", value: "Contact", description: "Titlul secțiunii de contact" },
                    { key: "footer_contact_address_icon", contentType: "image", value: "/images/icons/map-pin.svg", description: "Iconița pentru adresă" },
                    { key: "footer_contact_address", contentType: "text", value: "Str. Biserica Amzei 19, București, România", description: "Adresa de contact" },
                    { key: "footer_contact_phone_icon", contentType: "image", value: "/images/icons/phone.svg", description: "Iconița pentru telefon" },
                    { key: "footer_contact_phone", contentType: "text", value: "+40 721 234 567", description: "Număr de telefon contact" },
                    { key: "footer_contact_email_icon", contentType: "image", value: "/images/icons/mail.svg", description: "Iconița pentru email" },
                    { key: "footer_contact_email", contentType: "text", value: "contact@doxa-pelerinaje.ro", description: "Email de contact" },
                    
                    // Copyright și linkuri juridice
                    { key: "footer_copyright", contentType: "text", value: "Doxa Pelerinaje. Toate drepturile rezervate.", description: "Text copyright" },
                    { key: "footer_terms", contentType: "text", value: "Termeni și Condiții", description: "Text pentru link-ul Termeni și Condiții" },
                    { key: "footer_terms_url", contentType: "text", value: "/termeni-si-conditii", description: "URL pentru link-ul Termeni și Condiții" },
                    { key: "footer_privacy", contentType: "text", value: "Politica de Confidențialitate", description: "Text pentru link-ul Politica de Confidențialitate" },
                    { key: "footer_privacy_url", contentType: "text", value: "/politica-de-confidentialitate", description: "URL pentru link-ul Politica de Confidențialitate" },
                    { key: "footer_cookies", contentType: "text", value: "Cookies", description: "Text pentru link-ul Cookies" },
                    { key: "footer_cookies_url", contentType: "text", value: "/cookies", description: "URL pentru link-ul Cookies" },
                  ];
                  
                  // Indicator de progres
                  let createdCount = 0;
                  let skippedCount = 0;
                  let errorCount = 0;
                  
                  // Funcție pentru a crea un element CMS
                  const createCmsItem = async (item: any) => {
                    try {
                      // Verificăm dacă elementul există deja pentru a evita duplicatele
                      try {
                        const checkResp = await apiRequest('GET', `/api/cms/${item.key}`);
                        
                        // Dacă există, sărim peste
                        if (checkResp.status === 200) {
                          console.log(`Elementul ${item.key} există deja.`);
                          skippedCount++;
                          return;
                        }
                        
                        // Dacă avem 404, înseamnă că elementul nu există și trebuie creat
                        if (checkResp.status === 404) {
                          // Verificăm dacă suntem autentificați ca admin
                          const userResp = await apiRequest('GET', '/api/user');
                          console.log('Autentificare user:', userResp.status);
                          
                          if (userResp.status !== 200) {
                            toast({
                              title: "Eroare de autentificare",
                              description: "Nu sunteți autentificat ca administrator. Vă rugăm să vă autentificați pentru a crea elemente CMS.",
                              variant: "destructive",
                            });
                            errorCount++;
                            return;
                          }
                          
                          const resp = await apiRequest('POST', '/api/cms', item);
                          
                          if (resp.status === 201 || resp.status === 200) {
                            console.log(`Creat element CMS: ${item.key}`);
                            createdCount++;
                          } else {
                            console.error(`Eroare la crearea elementului ${item.key}:`, resp.statusText);
                            errorCount++;
                          }
                        }
                      } catch (error) {
                        console.error(`Excepție la procesarea elementului ${item.key}:`, error);
                        errorCount++;
                      }
                    } catch (error) {
                      console.error(`Eroare la procesarea elementului ${item.key}:`, error);
                      errorCount++;
                    }
                  };
                  
                  // Procesăm fiecare element secvențial
                  toast({
                    title: "Inițializare CMS Footer",
                    description: "Procesare în curs... Vă rugăm așteptați.",
                  });
                  
                  try {
                    // Utilizăm noua rută pentru inițializare în masă
                    // Verificăm parametri API pentru depanare
                    console.log("Pregătire cerere API pentru inițializare CMS", { 
                      itemCount: footerItems.length,
                      firstItem: footerItems[0]
                    });
                    
                    // Trimitem cererea fără alte opțiuni (credentials deja setat în queryClient)
                    const response = await fetch('/api/cms/initialize', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(footerItems),
                      credentials: 'include'
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json();
                      console.error("Eroare la inițializare:", errorData);
                      toast({
                        title: "Eroare la inițializare",
                        description: errorData.message || "A apărut o eroare la inițializarea conținutului CMS.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    const result = await response.json();
                    console.log("Rezultat inițializare CMS:", result);
                    
                    // Invalidăm cache-ul pentru a reîncărca datele
                    queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
                    queryClient.invalidateQueries();
                    
                    // Facem un refetch imediat
                    await refetch();
                    
                    // Afișăm rezultatul final
                    toast({
                      title: "Inițializare completă",
                      description: `S-au creat ${result.stats?.created || 0} elemente noi, ${result.stats?.skipped || 0} elemente existente, ${result.stats?.errors || 0} erori.`,
                      variant: (result.stats?.errors || 0) > 0 ? "destructive" : "default",
                    });
                  } catch (error) {
                    console.error("Excepție la inițializarea CMS:", error);
                    toast({
                      title: "Eroare la inițializare",
                      description: "A apărut o excepție la inițializarea conținutului CMS.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <DownloadIcon className="h-4 w-4 mr-1" />
                Inițializează CMS Footer
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="bg-red-50 hover:bg-red-100"
                onClick={() => {
                  alert("Funcționalitate în curând disponibilă");
                }}
              >
                <AlertTriangleIcon className="h-4 w-4 mr-1" />
                Verifică elemente lipsă
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="bg-emerald-50 hover:bg-emerald-100"
                onClick={() => {
                  // Implementăm ulterior, dacă e nevoie
                  alert("Funcționalitate în curând disponibilă");
                }}
              >
                <ListIcon className="h-4 w-4 mr-1" />
                Exportă configurație
              </Button>
              
              {/* Componenta pentru inițializatorii de conținut */}
              <CmsInitializers refetch={refetch} />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            Eroare la încărcarea datelor. Vă rugăm să încercați din nou mai târziu.
          </div>
        ) : (
          <>
            {cmsContents && cmsContents.length > 0 ? (
              <>
                <TabsContent value="all">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cheie</TableHead>
                        <TableHead>Tip</TableHead>
                        <TableHead>Conținut</TableHead>
                        <TableHead>Ultima actualizare</TableHead>
                        <TableHead className="w-[100px]">Acțiuni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cmsContents
                        .filter((content: CmsContent) => filterPrefix ? content.key.includes(filterPrefix) : true)
                        .map((content: CmsContent) => (
                        <TableRow key={content.id} className={content.key.startsWith('footer_') ? 'bg-amber-50/50' : 
                                                              content.key.startsWith('contact_') ? 'bg-blue-50/50' : 
                                                              content.key.startsWith('homepage_') ? 'bg-green-50/50' : ''}>
                          <TableCell className="font-medium">
                            {content.key.startsWith('footer_') ? (
                              <span className="flex items-center">
                                {content.key}
                                <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Footer</span>
                              </span>
                            ) : content.key.startsWith('contact_') ? (
                              <span className="flex items-center">
                                {content.key}
                                <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Contact</span>
                              </span>
                            ) : content.key.startsWith('homepage_') ? (
                              <span className="flex items-center">
                                {content.key}
                                <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Homepage</span>
                              </span>
                            ) : content.key}
                          </TableCell>
                          <TableCell>
                            {content.contentType === "text" && <FileTextIcon className="h-4 w-4" />}
                            {content.contentType === "html" && <Code2Icon className="h-4 w-4" />}
                            {content.contentType === "image" && <ImageIcon className="h-4 w-4" />}
                            <span className="ml-2">{content.contentType}</span>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">
                              {content.contentType === "image" ? (
                                <img 
                                  src={content.value} 
                                  alt={content.key} 
                                  className="w-12 h-12 object-cover"
                                />
                              ) : (
                                content.value.length > 100 
                                  ? `${content.value.substring(0, 100)}...` 
                                  : content.value
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {content.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEdit(content)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(content.key)}
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="text">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cheie</TableHead>
                        <TableHead>Conținut</TableHead>
                        <TableHead>Ultima actualizare</TableHead>
                        <TableHead className="w-[100px]">Acțiuni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cmsContents
                        .filter((content: CmsContent) => content.contentType === "text")
                        .filter((content: CmsContent) => filterPrefix ? content.key.includes(filterPrefix) : true)
                        .map((content: CmsContent) => (
                          <TableRow key={content.id}>
                            <TableCell className="font-medium">{content.key}</TableCell>
                            <TableCell className="max-w-md">
                              <div className="truncate">
                                {content.value.length > 100 
                                  ? `${content.value.substring(0, 100)}...` 
                                  : content.value}
                              </div>
                            </TableCell>
                            <TableCell>
                              {content.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEdit(content)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDelete(content.key)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="html">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cheie</TableHead>
                        <TableHead>Preview</TableHead>
                        <TableHead>Ultima actualizare</TableHead>
                        <TableHead className="w-[100px]">Acțiuni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cmsContents
                        .filter((content: CmsContent) => content.contentType === "html")
                        .filter((content: CmsContent) => filterPrefix ? content.key.includes(filterPrefix) : true)
                        .map((content: CmsContent) => (
                          <TableRow key={content.id}>
                            <TableCell className="font-medium">{content.key}</TableCell>
                            <TableCell className="max-w-md">
                              <div className="truncate">
                                {content.value.length > 100 
                                  ? `${content.value.substring(0, 100)}...` 
                                  : content.value}
                              </div>
                            </TableCell>
                            <TableCell>
                              {content.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEdit(content)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDelete(content.key)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="image">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cmsContents
                      .filter((content: CmsContent) => content.contentType === "image")
                      .filter((content: CmsContent) => filterPrefix ? content.key.includes(filterPrefix) : true)
                      .map((content: CmsContent) => (
                        <Card key={content.id}>
                          <CardContent className="p-4">
                            <div className="aspect-square relative mb-2">
                              <img 
                                src={content.value} 
                                alt={content.key} 
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{content.key}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {content.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEdit(content)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDelete(content.key)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <h3 className="font-medium text-xl mb-2">Nu există conținut CMS</h3>
                <p className="text-muted-foreground mb-4">
                  Adăugați primul element de conținut pentru a începe.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Adaugă conținut
                </Button>
              </div>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}