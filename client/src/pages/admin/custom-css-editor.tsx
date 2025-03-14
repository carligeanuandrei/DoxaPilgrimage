import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Save, PlusCircle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';

export default function CustomCssEditor() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [customCssValue, setCustomCssValue] = useState('');
  const [mobileCssValue, setMobileCssValue] = useState('');
  const [rawPreview, setRawPreview] = useState(false);
  const [activePreview, setActivePreview] = useState(false);
  const { toast } = useToast();

  // Fetch CSS from CMS 
  const { data: globalCssData, isLoading: isGlobalCssLoading, isError: isGlobalCssError, refetch: refetchGlobalCss } = useQuery({
    queryKey: ['/api/cms/custom_css_global'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cms/custom_css_global');
      return response.data;
    },
    retry: 1,
    // We handle error case separately so we don't need to throw
    throwOnError: false
  });

  // Fetch Mobile CSS from CMS
  const { data: mobileCssData, isLoading: isMobileCssLoading, isError: isMobileCssError, refetch: refetchMobileCss } = useQuery({
    queryKey: ['/api/cms/custom_css_mobile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cms/custom_css_mobile');
      return response.data;
    },
    retry: 1,
    throwOnError: false
  });

  // Update CSS mutation
  const updateGlobalCssMutation = useMutation({
    mutationFn: async (cssData: { value: string }) => {
      const response = await apiRequest('PUT', `/api/cms/custom_css_global`, cssData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/custom_css_global'] });
      toast({
        title: "CSS Global actualizat cu succes",
        description: "Modificările au fost salvate și aplicate.",
      });
      setTimeout(() => {
        applyCSS(customCssValue, 'global-custom-css');
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare la actualizarea CSS",
        description: `A apărut o eroare la salvarea CSS-ului: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update Mobile CSS mutation
  const updateMobileCssMutation = useMutation({
    mutationFn: async (cssData: { value: string }) => {
      const response = await apiRequest('PUT', `/api/cms/custom_css_mobile`, cssData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/custom_css_mobile'] });
      toast({
        title: "CSS Mobile actualizat cu succes",
        description: "Modificările pentru dispozitive mobile au fost salvate și aplicate.",
      });
      setTimeout(() => {
        applyCSS(mobileCssValue, 'mobile-custom-css');
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare la actualizarea CSS mobile",
        description: `A apărut o eroare la salvarea CSS-ului pentru mobile: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Create CSS if not exists
  const createGlobalCssMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/cms`, {
        key: 'custom_css_global',
        value: '/* CSS global personalizat */\n\n/* Exemplu: */\n/*\nbody {\n  --primary-color: #3b82f6;\n}\n*/\n',
        contentType: 'css'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/custom_css_global'] });
      toast({
        title: "CSS Global inițializat",
        description: "Structura CSS a fost creată. Puteți începe personalizarea.",
      });
      refetchGlobalCss();
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare la crearea CSS",
        description: `Nu s-a putut crea structura CSS: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Create Mobile CSS if not exists
  const createMobileCssMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/cms`, {
        key: 'custom_css_mobile',
        value: '/* CSS pentru dispozitive mobile */\n\n/* Aceste stiluri se aplică doar pentru ecrane mici */\n/* Exemplu: */\n/*\n@media (max-width: 768px) {\n  .hero-section h1 {\n    font-size: 1.8rem;\n  }\n}\n*/\n',
        contentType: 'css'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/custom_css_mobile'] });
      toast({
        title: "CSS Mobile inițializat",
        description: "Structura CSS pentru dispozitive mobile a fost creată.",
      });
      refetchMobileCss();
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare la crearea CSS mobile",
        description: `Nu s-a putut crea structura CSS mobile: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (globalCssData) {
      setCustomCssValue(globalCssData.value || '');
      if (!activePreview) {
        applyCSS(globalCssData.value, 'global-custom-css');
      }
    }
  }, [globalCssData]);

  useEffect(() => {
    if (mobileCssData) {
      setMobileCssValue(mobileCssData.value || '');
      if (!activePreview) {
        applyCSS(mobileCssData.value, 'mobile-custom-css');
      }
    }
  }, [mobileCssData]);

  // Funcție pentru a aplica CSS-ul într-un element style
  const applyCSS = (css: string, id: string) => {
    // Eliminăm elementul style anterior dacă există
    const existingStyle = document.getElementById(id);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Creăm un nou element style și îl adăugăm la head
    if (css && css.trim() !== '') {
      const styleElement = document.createElement('style');
      styleElement.id = id;
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
    }
  };

  // Aplică CSS-ul pentru previzualizare
  const handlePreview = () => {
    setActivePreview(true);
    if (activeTab === 'global') {
      applyCSS(customCssValue, 'global-custom-css');
    } else {
      applyCSS(mobileCssValue, 'mobile-custom-css');
    }
    
    toast({
      title: "Previzualizare activată",
      description: "CSS-ul a fost aplicat pentru previzualizare. Salvați pentru a păstra modificările.",
    });
  };

  // Salvare CSS
  const handleSave = () => {
    setActivePreview(false);
    if (activeTab === 'global') {
      updateGlobalCssMutation.mutate({ value: customCssValue });
    } else {
      updateMobileCssMutation.mutate({ value: mobileCssValue });
    }
  };

  const handleCreate = () => {
    if (activeTab === 'global') {
      createGlobalCssMutation.mutate();
    } else {
      createMobileCssMutation.mutate();
    }
  };

  // Verifică dacă utilizatorul este admin
  if (authLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-1/2" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-3/4" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verifică dacă utilizatorul este admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acces restricționat</AlertTitle>
          <AlertDescription>
            Doar administratorii au acces la editorul de CSS personalizat.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Editor CSS Personalizat</CardTitle>
          <CardDescription>
            Personalizați aspectul aplicației prin adăugarea de CSS. Modificările sunt aplicate imediat ce salvați.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="global">CSS Global</TabsTrigger>
              <TabsTrigger value="mobile">CSS Mobile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="global" className="space-y-4">
              {isGlobalCssLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : isGlobalCssError || !globalCssData ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>CSS global negăsit</AlertTitle>
                    <AlertDescription>
                      Fișierul CSS global nu a fost configurat încă. Apăsați butonul de mai jos pentru a-l inițializa.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleCreate} disabled={createGlobalCssMutation.isPending}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Inițializare CSS Global
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="globalCss">CSS Global</Label>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handlePreview}
                        disabled={updateGlobalCssMutation.isPending}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Previzualizare
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={updateGlobalCssMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salvează
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="globalCss"
                    value={customCssValue}
                    onChange={(e) => setCustomCssValue(e.target.value)}
                    placeholder="/* Adăugați CSS global personalizat aici */"
                    className="font-mono h-[400px] resize-none"
                    spellCheck="false"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="mobile" className="space-y-4">
              {isMobileCssLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : isMobileCssError || !mobileCssData ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>CSS mobile negăsit</AlertTitle>
                    <AlertDescription>
                      Fișierul CSS pentru dispozitive mobile nu a fost configurat încă. Apăsați butonul de mai jos pentru a-l inițializa.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleCreate} disabled={createMobileCssMutation.isPending}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Inițializare CSS Mobile
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="mobileCss">CSS pentru Mobile</Label>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handlePreview}
                        disabled={updateMobileCssMutation.isPending}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Previzualizare
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={updateMobileCssMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salvează
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="mobileCss"
                    value={mobileCssValue}
                    onChange={(e) => setMobileCssValue(e.target.value)}
                    placeholder="/* Adăugați CSS pentru dispozitive mobile aici */"
                    className="font-mono h-[400px] resize-none"
                    spellCheck="false"
                  />
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Sfat</AlertTitle>
                    <AlertDescription>
                      Pentru CSS mobil, încapsulați codul în @media queries pentru a viza anumite dimensiuni de ecran.
                      <code className="block mt-2 p-2 bg-slate-100 rounded text-xs">
                        @media (max-width: 768px) {'{'}<br />
                        &nbsp;&nbsp;/* Stilurile tale pentru ecrane mobile */<br />
                        {'}'}
                      </code>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">Exemple și Ajutor</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Culori și Fonturi Personalizate</h4>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto">
{`:root {
  --primary-color: #3b82f6;  /* Albastru */
  --secondary-color: #10b981; /* Verde */
}

.hero-section h1 {
  color: var(--primary-color);
  font-weight: 700;
}

.section-title {
  font-size: 1.5rem;
  border-bottom: 2px solid var(--secondary-color);
}`}
                </pre>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Stiluri pentru Mobile</h4>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto">
{`@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 1.8rem;
  }
  
  .header-nav {
    padding: 0.5rem;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}`}
                </pre>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}