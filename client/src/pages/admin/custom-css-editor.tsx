import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, Save, AlertTriangle, Code } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Badge } from '@/components/ui/badge';

/**
 * Pagină de administrare pentru editarea CSS-ului personalizat
 * Permite administratorilor să definească CSS global și pentru mobile
 */
export default function CustomCssEditor() {
  const [globalCSS, setGlobalCSS] = useState('');
  const [mobileCSS, setMobileCSS] = useState('');
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [isSavingMobile, setIsSavingMobile] = useState(false);
  const [globalCssError, setGlobalCssError] = useState('');
  const [mobileCssError, setMobileCssError] = useState('');
  const [previewTab, setPreviewTab] = useState('global');
  const { toast } = useToast();

  // Încărcarea CSS-ului existent
  useEffect(() => {
    const loadGlobalCss = async () => {
      try {
        const response = await fetch('/api/cms/custom_css_global');
        if (response.ok) {
          const content = await response.json();
          if (content && content.value) {
            setGlobalCSS(content.value);
          }
        }
      } catch (error) {
        console.error('Eroare la încărcarea CSS-ului global', error);
      }
    };

    const loadMobileCss = async () => {
      try {
        const response = await fetch('/api/cms/custom_css_mobile');
        if (response.ok) {
          const content = await response.json();
          if (content && content.value) {
            setMobileCSS(content.value);
          }
        }
      } catch (error) {
        console.error('Eroare la încărcarea CSS-ului pentru mobile', error);
      }
    };

    loadGlobalCss();
    loadMobileCss();
  }, []);

  // Salvarea CSS-ului global
  const saveGlobalCSS = async () => {
    if (!validateCSS(globalCSS)) {
      setGlobalCssError('CSS-ul conține erori de sintaxă. Verificați codul.');
      return;
    }

    setIsSavingGlobal(true);
    try {
      const response = await fetch('/api/cms/custom_css_global', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ css: globalCSS }),
      });

      if (response.ok) {
        const content = await response.json();
        if (content.success) {
          toast({
            title: 'CSS global salvat cu succes',
            description: 'Modificările au fost aplicate',
            variant: 'default',
          });
          setGlobalCssError('');
        }
      } else {
        toast({
          title: 'Eroare la salvarea CSS-ului global',
          description: 'Verificați conexiunea și încercați din nou',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Eroare la salvarea CSS-ului global', error);
      toast({
        title: 'Eroare la salvarea CSS-ului global',
        description: 'A apărut o eroare neașteptată',
        variant: 'destructive',
      });
    } finally {
      setIsSavingGlobal(false);
    }
  };

  // Salvarea CSS-ului pentru mobile
  const saveMobileCSS = async () => {
    if (!validateCSS(mobileCSS)) {
      setMobileCssError('CSS-ul conține erori de sintaxă. Verificați codul.');
      return;
    }

    setIsSavingMobile(true);
    try {
      const response = await fetch('/api/cms/custom_css_mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ css: mobileCSS }),
      });

      if (response.ok) {
        const content = await response.json();
        if (content.success) {
          toast({
            title: 'CSS pentru mobile salvat cu succes',
            description: 'Modificările au fost aplicate',
            variant: 'default',
          });
          setMobileCssError('');
        }
      } else {
        toast({
          title: 'Eroare la salvarea CSS-ului pentru mobile',
          description: 'Verificați conexiunea și încercați din nou',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Eroare la salvarea CSS-ului pentru mobile', error);
      toast({
        title: 'Eroare la salvarea CSS-ului pentru mobile',
        description: 'A apărut o eroare neașteptată',
        variant: 'destructive',
      });
    } finally {
      setIsSavingMobile(false);
    }
  };

  // Resetarea CSS-ului global
  const resetGlobalCSS = () => {
    setGlobalCSS('');
    setGlobalCssError('');
    toast({
      title: 'CSS global resetat',
      description: 'Modificările nu au fost salvate. Apăsați Salvează pentru a aplica.',
      variant: 'default',
    });
  };

  // Resetarea CSS-ului pentru mobile
  const resetMobileCSS = () => {
    setMobileCSS('');
    setMobileCssError('');
    toast({
      title: 'CSS pentru mobile resetat',
      description: 'Modificările nu au fost salvate. Apăsați Salvează pentru a aplica.',
      variant: 'default',
    });
  };

  // Validarea CSS-ului
  const validateCSS = (css: string): boolean => {
    try {
      // Verificăm dacă CSS-ul este valid
      const styleEl = document.createElement('style');
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
      document.head.removeChild(styleEl);
      return true;
    } catch (error) {
      console.error('CSS invalid', error);
      return false;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Editor CSS Personalizat</h1>
        <p className="text-gray-500">
          Modificați aspectul aplicației prin adăugarea de stiluri CSS personalizate. Aveți posibilitatea să definiți stiluri
          globale și pentru dispozitive mobile.
        </p>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="global">CSS Global</TabsTrigger>
          <TabsTrigger value="mobile">CSS Mobile</TabsTrigger>
          <TabsTrigger value="preview">Previzualizare</TabsTrigger>
          <TabsTrigger value="help">Ajutor</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle>CSS Global</CardTitle>
              <CardDescription>
                Stilurile definite aici se vor aplica pe toate dispozitivele. Folosiți cu moderație pentru a evita conflictele cu stilurile existente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {globalCssError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Eroare de validare</AlertTitle>
                  <AlertDescription>{globalCssError}</AlertDescription>
                </Alert>
              )}
              <Textarea
                value={globalCSS}
                onChange={(e) => setGlobalCSS(e.target.value)}
                placeholder="/* Adăugați CSS global aici */
body {
  /* Exemplu: */
  --custom-color: #3b5998;
}

.header {
  /* Exemplu: */
  background-color: var(--custom-color);
}"
                className="min-h-[400px] font-mono"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive" onClick={resetGlobalCSS}>
                Resetează
              </Button>
              <Button onClick={saveGlobalCSS} disabled={isSavingGlobal}>
                {isSavingGlobal ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se salvează...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Salvează
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="mobile">
          <Card>
            <CardHeader>
              <CardTitle>CSS pentru Mobile</CardTitle>
              <CardDescription>
                Aceste stiluri se vor aplica doar pe dispozitive mobile (sub 768px lățime). Sunt încapsulate automat într-un media query.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mobileCssError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Eroare de validare</AlertTitle>
                  <AlertDescription>{mobileCssError}</AlertDescription>
                </Alert>
              )}
              <Textarea
                value={mobileCSS}
                onChange={(e) => setMobileCSS(e.target.value)}
                placeholder="/* Adăugați CSS pentru mobile aici */
/* Acest cod va fi inclus automat într-un media query: @media (max-width: 768px) */

body {
  /* Exemplu: */
  font-size: 14px;
}

.header {
  /* Exemplu: */
  padding: 0.5rem;
}"
                className="min-h-[400px] font-mono"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive" onClick={resetMobileCSS}>
                Resetează
              </Button>
              <Button onClick={saveMobileCSS} disabled={isSavingMobile}>
                {isSavingMobile ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se salvează...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Salvează
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Previzualizare CSS</CardTitle>
              <CardDescription>
                Previzualizați codul CSS înainte de a-l aplica pe site.
              </CardDescription>
              <div className="flex mt-2">
                <Button variant="outline" onClick={() => setPreviewTab('global')} className={previewTab === 'global' ? 'bg-primary/10' : ''}>
                  Global
                </Button>
                <Button variant="outline" onClick={() => setPreviewTab('mobile')} className={`ml-2 ${previewTab === 'mobile' ? 'bg-primary/10' : ''}`}>
                  Mobile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-hidden">
                <SyntaxHighlighter 
                  language="css" 
                  style={tomorrow}
                  customStyle={{ 
                    borderRadius: '0.375rem', 
                    fontSize: '0.875rem', 
                    padding: '1rem', 
                    backgroundColor: '#1e293b' 
                  }}
                >
                  {previewTab === 'global' 
                    ? globalCSS || '/* Nu există CSS global definit */' 
                    : mobileCSS 
                      ? `@media (max-width: 768px) {\n${mobileCSS}\n}`
                      : '/* Nu există CSS pentru mobile definit */'}
                </SyntaxHighlighter>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Ghid de utilizare a editorului CSS</CardTitle>
              <CardDescription>
                Sfaturi și exemple pentru utilizarea eficientă a editorului CSS personalizat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recomandări generale</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Utilizați selectori specifici pentru a evita conflictele cu stilurile existente.</li>
                    <li>Testați schimbările pe mai multe dispozitive înainte de implementarea finală.</li>
                    <li>Folosiți variabile CSS (custom properties) pentru a menține consistența culorilor și spațierii.</li>
                    <li>Evitați utilizarea excesivă a regulii !important, deoarece poate cauza probleme dificil de remediat.</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Exemple utile</h3>
                  
                  <div className="bg-secondary/20 p-4 rounded-md mb-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Badge variant="outline" className="mr-2">Global</Badge>
                      Modificarea culorilor principale
                    </h4>
                    <SyntaxHighlighter 
                      language="css" 
                      style={tomorrow}
                      customStyle={{ 
                        borderRadius: '0.375rem', 
                        fontSize: '0.875rem', 
                        backgroundColor: '#1e293b' 
                      }}
                    >
{`:root {
  --primary: #3b5998;
  --primary-foreground: #ffffff;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
}`}
                    </SyntaxHighlighter>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-md mb-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Badge variant="outline" className="mr-2">Mobile</Badge>
                      Adaptarea fonturilor pentru dispozitive mobile
                    </h4>
                    <SyntaxHighlighter 
                      language="css" 
                      style={tomorrow}
                      customStyle={{ 
                        borderRadius: '0.375rem', 
                        fontSize: '0.875rem', 
                        backgroundColor: '#1e293b' 
                      }}
                    >
{`body {
  font-size: 14px;
}

h1 {
  font-size: 1.8rem;
}

h2 {
  font-size: 1.5rem;
}`}
                    </SyntaxHighlighter>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Badge variant="outline" className="mr-2">Global</Badge>
                      Personalizarea formularelor
                    </h4>
                    <SyntaxHighlighter 
                      language="css" 
                      style={tomorrow}
                      customStyle={{ 
                        borderRadius: '0.375rem', 
                        fontSize: '0.875rem',  
                        backgroundColor: '#1e293b' 
                      }}
                    >
{`.form-input {
  border: 2px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}

.form-input:focus {
  border-color: var(--primary, #3b5998);
  box-shadow: 0 0 0 3px rgba(59, 89, 152, 0.2);
  outline: none;
}`}
                    </SyntaxHighlighter>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Depanare probleme comune</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Stilurile nu se aplică</p>
                        <p className="text-sm text-gray-500">Verificați specificitatea selectorilor. Selectori mai specifici au prioritate mai mare. Adăugați clase sau ID-uri pentru a crește specificitatea.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Stilurile pentru mobile nu funcționează</p>
                        <p className="text-sm text-gray-500">Asigurați-vă că media query-ul este corect. Stilurile pentru mobile sunt incluse automat într-un media query pentru dispozitive sub 768px lățime.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Code className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Erori de sintaxă</p>
                        <p className="text-sm text-gray-500">Verificați pentru paranteze lipsă, punct și virgulă lipsă sau alte erori de sintaxă. Folosiți un validator CSS online pentru a verifica codul.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}