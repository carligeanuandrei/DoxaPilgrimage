import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { PilgrimageAssistant, InteractiveMap } from '@/components/pilgrimage-assistant';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Map, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

/**
 * Pagina de administrare pentru DOXA AI
 * Oferă acces la toate funcționalitățile sistemului inteligent:
 * - Asistentul de pelerinaje
 * - Harta interactivă
 * - Statistici și rapoarte
 * - Setări și configurare AI
 */
export default function DoxaAiDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) {
        throw new Error('Nu s-au putut încărca datele utilizatorului');
      }
      return res.json();
    }
  });

  // Verificăm dacă utilizatorul are rol de administrator
  const isAdmin = user && user.role === 'admin';

  // Redirecționăm utilizatorii non-admin
  if (user && !isAdmin) {
    toast({
      variant: 'destructive',
      title: 'Acces restricționat',
      description: 'Nu aveți permisiunile necesare pentru a accesa această pagină'
    });
    navigate('/');
    return null;
  }

  // Statistici sumarizate DOXA AI
  const aiStats = {
    totalInteractions: 2487,
    successfulRecommendations: 1865,
    activeUsers: 342,
    lastUpdated: new Date().toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  // Lista de alerte AI pentru administratori
  const aiAlerts = [
    {
      type: 'error',
      message: 'Multe rezervări incomplete la Mănăstirea Putna',
      details: '15 rezervări au fost abandonate din cauza lipsei documentelor',
      date: '14 Martie 2025'
    },
    {
      type: 'warning',
      message: 'Creștere semnificativă a interogărilor din Londra',
      details: 'Se recomandă adăugarea de conținut în limba engleză',
      date: '13 Martie 2025'
    },
    {
      type: 'info',
      message: 'Model AI actualizat la GPT-4 Turbo',
      details: 'Răspunsurile sunt acum mai precise și mai contextuale',
      date: '12 Martie 2025'
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">DOXA AI Dashboard</h1>
        <p className="text-muted-foreground">
          Centrul de comandă pentru monitorizarea și gestionarea inteligenței artificiale DOXA
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interacțiuni totale</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats.totalInteractions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recomandări reușite</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats.successfulRecommendations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilizatori activi</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ultima actualizare</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">{aiStats.lastUpdated}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="w-4 h-4" /> Prezentare generală
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="w-4 h-4" /> Hartă interactivă
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Asistent AI
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Setări & Ajutor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Alerte și notificări DOXA AI</CardTitle>
                <CardDescription>
                  Evenimente importante detectate de sistemul inteligent care necesită atenție
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 border rounded-md">
                    {alert.type === 'error' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{alert.message}</h4>
                        <Badge variant={
                          alert.type === 'error' ? 'destructive' : 
                          alert.type === 'warning' ? 'outline' : 
                          'secondary'
                        }>
                          {alert.date}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.details}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" size="sm" className="w-full md:w-auto">
                  Vezi toate alertele
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acțiuni rapide</CardTitle>
                <CardDescription>
                  Comenzi frecvent utilizate pentru gestionarea DOXA AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-between" onClick={() => setActiveTab('assistant')}>
                  <span>Testare asistent AI</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" onClick={() => setActiveTab('map')}>
                  <span>Vizualizare hartă interactivă</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Generare raport complet</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Verificare model AI</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Actualizare bază de cunoștințe</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performanța DOXA AI - Ultimele 30 de zile</CardTitle>
              <CardDescription>
                Metricile principale care arată eficiența sistemului inteligent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md">
                <div className="text-center p-4">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">Grafic de performanță AI</h3>
                  <p className="text-sm text-muted-foreground">
                    Aici va fi afișat graficul de performanță a AI-ului bazat pe datele reale.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4 mt-4">
          <InteractiveMap />
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Testare Asistent DOXA AI</CardTitle>
              <CardDescription>
                Utilizați acest panou pentru a testa răspunsurile asistentului inteligent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PilgrimageAssistant />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurare și ajustare AI</CardTitle>
              <CardDescription>
                Parametri și setări pentru comportamentul sistemului inteligent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Model AI utilizat</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">GPT-4 Turbo</Badge>
                    <span className="text-sm text-muted-foreground">Actualizat pe 12 Martie 2025</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Parametri AI</h3>
                  <ul className="space-y-1.5">
                    <li className="text-sm flex justify-between">
                      <span>Temperatură:</span>
                      <span className="font-medium">0.7</span>
                    </li>
                    <li className="text-sm flex justify-between">
                      <span>Dimensiune maximă răspuns:</span>
                      <span className="font-medium">800 tokens</span>
                    </li>
                    <li className="text-sm flex justify-between">
                      <span>Prag de încredere:</span>
                      <span className="font-medium">0.85</span>
                    </li>
                    <li className="text-sm flex justify-between">
                      <span>Mod strict:</span>
                      <span className="font-medium">Activat</span>
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Surse de date</h3>
                  <div className="space-y-1.5">
                    <div className="text-sm flex justify-between">
                      <span>Bază de date pelerinaje:</span>
                      <Badge variant="outline" className="text-green-500">Conectat</Badge>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span>Bază de date utilizatori:</span>
                      <Badge variant="outline" className="text-green-500">Conectat</Badge>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span>API extern mănăstiri:</span>
                      <Badge variant="outline" className="text-amber-500">Parțial</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline">Resetare la valorile implicite</Button>
              <Button>Salvare configurație</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}