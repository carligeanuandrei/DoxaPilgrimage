import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CmsContent } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileTextIcon, Code2Icon, ImageIcon, PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { format } from 'date-fns';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);

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
    mutationFn: (data: CmsFormValues) => apiRequest('POST', '/api/cms', data),
    onSuccess: () => {
      // Invalidează toate interogările pentru a re-încărca datele în toate componentele
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
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
    mutationFn: (data: CmsFormValues) => apiRequest('PUT', `/api/cms/${data.key}`, data),
    onSuccess: () => {
      // Invalidează specific interogările CMS pentru a re-încărca datele
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
      
      // Forțează reîmprospătarea TUTUROR datelor pentru a actualiza și componentele care folosesc CMS
      queryClient.invalidateQueries();
      
      // Forțează reîmprospătarea imediată
      setTimeout(() => {
        refetch();
      }, 300);
      
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
  const onSubmit = (values: CmsFormValues) => {
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
                      <FormControl>
                        <Input 
                          placeholder="Introduceți cheia unică" 
                          {...field} 
                          disabled={isEditing}
                        />
                      </FormControl>
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
                            placeholder={form.watch('contentType') === 'image' 
                              ? 'Introduceți URL-ul imaginii' 
                              : 'Introduceți conținutul HTML'}
                            className="h-32"
                            {...field} 
                          />
                        ) : (
                          <Input 
                            placeholder={form.watch('contentType') === 'image' 
                              ? 'Introduceți URL-ul imaginii' 
                              : 'Introduceți textul'} 
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
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toate</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="image">Imagini</TabsTrigger>
        </TabsList>
        
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
                      {cmsContents.map((content: CmsContent) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">{content.key}</TableCell>
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
                            {new Date(content.updatedAt).toLocaleDateString()}
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
                              {new Date(content.updatedAt).toLocaleDateString()}
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
                              {new Date(content.updatedAt).toLocaleDateString()}
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
                                  {new Date(content.updatedAt).toLocaleDateString()}
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