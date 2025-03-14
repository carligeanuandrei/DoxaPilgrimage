import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { DoxaAI } from '@/components/doxa-ai';
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
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Map, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  HelpCircle,
  ArrowUpRight,
  UserCheck,
  Users,
  Calendar,
  Download,
  CheckCircle,
  Settings,
  Clock,
  Activity
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
    reservationsToday: 47,
    incompleteReservations: 12,
    feedbackReceived: 16,
    organizerIssues: 3,
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

  // Lista feedback-uri utilizatori
  const userFeedback = [
    {
      id: 1,
      issue: 'Lipsa de informații despre cum pot contacta direct organizatorii',
      count: 8,
      suggestion: 'Adăugarea unei funcții de chat rapid în platformă'
    },
    {
      id: 2,
      issue: 'Confirmarea rezervării nu ajunge pe email',
      count: 5,
      suggestion: 'Verificarea serverului de email și adăugarea unei notificări în aplicație'
    },
    {
      id: 3,
      issue: 'Procesul de plată prin transfer bancar este neclar',
      count: 3,
      suggestion: 'Adăugarea unui ghid pas cu pas pentru această metodă de plată'
    }
  ];

  // Lista feedback-uri organizatori
  const organizerFeedback = [
    {
      id: 1,
      issue: 'Nu pot actualiza lista de participanți în timp real',
      count: 2,
      suggestion: 'Oferirea unei funcții de editare live a listelor'
    },
    {
      id: 2,
      issue: 'Nu pot descărca toate documentele utilizatorilor simultan',
      count: 1,
      suggestion: 'Adăugarea unui buton „Descarcă toate documentele" pentru fiecare pachet'
    }
  ];

  // Recomandări de îmbunătățire
  const improvements = [
    'Integrarea unui sistem de chat între utilizatori și organizatori',
    'Optimizarea notificărilor prin email pentru confirmarea rezervărilor',
    'Crearea unui tutorial video despre metodele de plată'
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
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-500">+14%</span> față de luna anterioară
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rezervări astăzi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats.reservationsToday}</div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-red-500">{aiStats.incompleteReservations}</span> incomplete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilizatori activi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats.activeUsers}</div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-500">+8%</span> față de săptămâna trecută
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Feedback primit</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats.feedbackReceived}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {aiStats.organizerIssues} probleme de la organizatori
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="w-4 h-4" /> Prezentare generală
          </TabsTrigger>
          <TabsTrigger value="daily-report" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Raport zilnic
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="w-4 h-4" /> Hartă interactivă
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Asistent AI
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Setări
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
                <Button variant="outline" className="w-full justify-between" onClick={() => setActiveTab('daily-report')}>
                  <span>Raport zilnic complet</span>
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
              <CardTitle>Metrici de performanță - Ultimele 30 de zile</CardTitle>
              <CardDescription>
                Indicatori cheie pentru monitorizarea eficienței DOXA AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span>Conversii rezervări</span>
                  </div>
                  <span className="font-medium">28%</span>
                </div>
                <Progress value={28} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Procentul de conversații care duc la rezervări complete
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Timp mediu răspuns</span>
                  </div>
                  <span className="font-medium">3.2 sec</span>
                </div>
                <Progress value={80} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Timpul mediu de răspuns al sistemului AI
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Satisfacție utilizatori</span>
                  </div>
                  <span className="font-medium">82%</span>
                </div>
                <Progress value={82} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Procentul de interacțiuni evaluate pozitiv de utilizatori
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Testare DOXA AI (Administrator)</CardTitle>
              <CardDescription>
                Testați asistentul AI direct din panoul de administrare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DoxaAI userType="admin" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="daily-report" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Raport Zilnic – {new Date().toLocaleDateString('ro-RO', {day: 'numeric', month: 'long', year: 'numeric'})}</CardTitle>
                  <CardDescription>
                    Analiză generată automat de DOXA AI
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportă PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    Statistici utilizatori
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 p-4 border rounded-lg">
                      <span className="text-muted-foreground text-sm">Utilizatori activi azi</span>
                      <span className="text-2xl font-bold">{aiStats.activeUsers}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-4 border rounded-lg">
                      <span className="text-muted-foreground text-sm">Rezervări noi efectuate</span>
                      <span className="text-2xl font-bold">{aiStats.reservationsToday}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-4 border rounded-lg">
                      <span className="text-muted-foreground text-sm">Rezervări incomplete</span>
                      <span className="text-2xl font-bold">{aiStats.incompleteReservations}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Feedback Utilizatori
                  </h3>
                  
                  <div className="space-y-4">
                    {userFeedback.map(item => (
                      <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                        <div className="min-w-[24px] mt-0.5">
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{item.issue}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span className="text-primary">Sugestie:</span> {item.suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Feedback Organizatori
                  </h3>
                  
                  <div className="space-y-4">
                    {organizerFeedback.map(item => (
                      <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                        <div className="min-w-[24px] mt-0.5">
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{item.issue}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span className="text-primary">Sugestie:</span> {item.suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Recomandări de îmbunătățire
                  </h3>
                  
                  <div className="space-y-2">
                    {improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <p>{improvement}</p>
                      </div>
                    ))}
                  </div>
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
          
          <Card>
            <CardHeader>
              <CardTitle>Conversații recente</CardTitle>
              <CardDescription>
                Ultimele interacțiuni ale utilizatorilor cu DOXA AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between mb-2">
                  <Badge>Utilizator #12458</Badge>
                  <span className="text-xs text-muted-foreground">14 Mar 2025, 15:42</span>
                </div>
                <p className="text-sm mb-2">Întrebare: <span className="font-medium">Care sunt cele mai frumoase mănăstiri din Bucovina?</span></p>
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="font-medium mb-1">Răspuns DOXA AI:</p>
                  <p>Bucovina este renumită pentru mănăstirile sale pictate în exterior, adevărate bijuterii ale arhitecturii și picturii ortodoxe. Cele mai frumoase mănăstiri din Bucovina includ:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Mănăstirea Voroneț - cunoscută pentru "albastrul de Voroneț"</li>
                    <li>Mănăstirea Sucevița - celebră pentru "Scara Virtuților"</li>
                    <li>Mănăstirea Moldovița - cu fresce exterioare impresionante</li>
                    <li>Mănăstirea Humor - apreciată pentru scenele biblice detaliate</li>
                    <li>Mănăstirea Putna - ctitoria lui Ștefan cel Mare</li>
                  </ul>
                  <p className="mt-2">Toate aceste mănăstiri fac parte din patrimoniul UNESCO.</p>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="flex justify-between mb-2">
                  <Badge variant="outline">Organizator #485</Badge>
                  <span className="text-xs text-muted-foreground">14 Mar 2025, 14:18</span>
                </div>
                <p className="text-sm mb-2">Întrebare: <span className="font-medium">Cum pot descărca toate documentele pelerinilor pentru pelerinajul de la Putna?</span></p>
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="font-medium mb-1">Răspuns DOXA AI:</p>
                  <p>Pentru a descărca toate documentele pelerinilor pentru pelerinajul la Mănăstirea Putna, urmați acești pași:</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Accesați panoul de administrare pentru organizatori</li>
                    <li>Selectați "Pelerinajele mele" din meniul lateral</li>
                    <li>Identificați pelerinajul la Mănăstirea Putna în listă</li>
                    <li>Apăsați pe "Gestionare participanți"</li>
                    <li>În partea de sus a listei, veți găsi butonul "Descarcă toate documentele"</li>
                  </ol>
                  <p className="mt-2">Documentele vor fi arhivate și descărcate pe calculatorul dumneavoastră. Vă rugăm să rețineți că accesul la aceste documente este strict confidențial și trebuie tratat conform GDPR.</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Încarcă mai multe interacțiuni
              </Button>
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Setări generale</h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Model AI</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>GPT-4 Turbo (Recomandat)</option>
                        <option>GPT-3.5 Turbo (Economie)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Limbă primară</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Română</option>
                        <option>Engleză</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Parametri AI</h3>
                    <div className="space-y-1.5">
                      <div className="text-sm flex justify-between">
                        <span>Temperatură:</span>
                        <span className="font-medium">0.7</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Dimensiune maximă răspuns:</span>
                        <span className="font-medium">800 tokens</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Prag de încredere:</span>
                        <span className="font-medium">0.85</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Mod strict:</span>
                        <span className="font-medium">Activat</span>
                      </div>
                    </div>
                  </div>
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
                    <div className="text-sm flex justify-between">
                      <span>Calendar ortodox:</span>
                      <Badge variant="outline" className="text-green-500">Conectat</Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Notificări și rapoarte</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Raport zilnic automat</label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                        <span className="inline-block h-4 w-4 rounded-full bg-white translate-x-6"></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Alertă pentru probleme critice</label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                        <span className="inline-block h-4 w-4 rounded-full bg-white translate-x-6"></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Monitorizare 24/7</label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                        <span className="inline-block h-4 w-4 rounded-full bg-white translate-x-6"></span>
                      </div>
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
      
      <div className="text-xs text-center text-muted-foreground mt-8">
        Ultima actualizare: {aiStats.lastUpdated}
      </div>
    </div>
  );
}