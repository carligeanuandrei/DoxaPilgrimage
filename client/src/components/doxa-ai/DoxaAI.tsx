import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot, Upload, Download, Calendar, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type UserType = 'user' | 'organizer' | 'admin';

export function DoxaAI({ userType = 'user' }: { userType?: UserType }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<string>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scorulare automată la mesajele noi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Adăugăm un mesaj de bun venit la început
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(userType);
      setMessages([
        {
          id: 'welcome',
          content: welcomeMessage,
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [userType]);

  const getWelcomeMessage = (type: UserType): string => {
    switch (type) {
      case 'user':
        return 'Bun venit la DOXA AI! Sunt aici pentru a te ajuta să găsești cele mai potrivite pelerinaje, să-ți ofer informații despre pachete și organizatori, și să te asist în procesul de rezervare. Cu ce te pot ajuta astăzi?';
      case 'organizer':
        return 'Bun venit la DOXA AI pentru organizatori! Pot să te ajut cu gestionarea rezervărilor, listele de participanți, și actualizarea pachetelor disponibile. Cu ce te pot ajuta astăzi?';
      case 'admin':
        return 'Bun venit la DOXA AI pentru administratori! Pot să îți ofer rapoarte despre interacțiunile utilizatorilor, analiza problemelor recurente și sugestii de îmbunătățire a platformei. Cu ce te pot ajuta astăzi?';
      default:
        return 'Bun venit la DOXA AI! Cu ce te pot ajuta astăzi?';
    }
  };

  const aiMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch('/api/doxa-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          userType,
          messageHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          })).slice(-10) // Trimitem ultimele 10 mesaje pentru context
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Eroare la comunicarea cu DOXA AI');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Adăugăm răspunsul la lista de mesaje
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
        }
      ]);
      setInput('');
    },
    onError: (error: Error) => {
      console.error("Eroare la comunicarea cu DOXA AI:", error);
      toast({
        title: 'Eroare',
        description: `${error.message}. Vă rugăm încercați din nou sau contactați administratorul.`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Adăugăm mesajul utilizatorului
    const userMessage = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user' as const,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Trimitem mesajul la API
    aiMutation.mutate(input);
  };

  // Funcții fictive pentru alte tab-uri (vor fi implementate ulterior)
  const handleFileUpload = () => {
    toast({
      title: 'Funcționalitate în curs de dezvoltare',
      description: 'Încărcarea documentelor va fi disponibilă în curând.',
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: 'Funcționalitate în curs de dezvoltare',
      description: 'Descărcarea rapoartelor va fi disponibilă în curând.',
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>DOXA AI</CardTitle>
            <CardDescription>
              Asistentul tău inteligent pentru pelerinaje ortodoxe
            </CardDescription>
          </div>
          <Avatar className="h-10 w-10 bg-primary">
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>

      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="chat">Chat Asistent</TabsTrigger>
          {userType === 'user' && <TabsTrigger value="documents">Documente</TabsTrigger>}
          {userType === 'organizer' && <TabsTrigger value="management">Management</TabsTrigger>}
          {userType === 'admin' && <TabsTrigger value="reports">Rapoarte</TabsTrigger>}
          <TabsTrigger value="help">Ajutor</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'bg-blue-500' : 'bg-primary'}`}>
                    <AvatarFallback>{message.role === 'user' ? <User size={16} /> : <Bot size={16} />}</AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="pt-2">
            <form onSubmit={handleSubmit} className="w-full flex gap-2">
              <Textarea
                placeholder="Scrie mesajul tău aici..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="resize-none flex-1"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={aiMutation.isPending || !input.trim()}
              >
                {aiMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </TabsContent>

        <TabsContent value="documents" className="flex-1 flex flex-col space-y-4">
          <CardContent className="flex-1">
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Upload size={48} className="text-primary/50" />
              <h3 className="text-xl font-medium">Încărcare Documente</h3>
              <p className="text-center max-w-md text-muted-foreground">
                Încarcă documentele tale pentru verificare (CI, pașaport sau alte acte necesare pentru pelerinaj).
              </p>
              <Button onClick={handleFileUpload} className="mt-2">
                <Upload className="mr-2 h-4 w-4" /> Selectează fișiere
              </Button>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="management" className="flex-1">
          <CardContent className="flex-1 space-y-4">
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Calendar size={48} className="text-primary/50" />
              <h3 className="text-xl font-medium">Management Rezervări</h3>
              <p className="text-center max-w-md text-muted-foreground">
                Gestionează rezervările, listele de participanți și actualizează pachetele disponibile.
              </p>
              <Button onClick={() => toast({ title: 'În dezvoltare', description: 'Această funcționalitate va fi disponibilă în curând.' })}>
                Vezi Rezervările Active
              </Button>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="reports" className="flex-1">
          <CardContent className="flex-1 space-y-4">
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Download size={48} className="text-primary/50" />
              <h3 className="text-xl font-medium">Rapoarte Admin</h3>
              <p className="text-center max-w-md text-muted-foreground">
                Vizualizează statistici, interacțiuni și descarcă rapoarte detaliate despre activitatea platformei.
              </p>
              <Button onClick={handleDownloadReport}>
                Descarcă Raportul Zilnic
              </Button>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="help" className="flex-1">
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info size={20} className="text-primary" />
                <h3 className="text-lg font-medium">Ajutor și Informații</h3>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Ce este DOXA AI?</AccordionTrigger>
                  <AccordionContent>
                    DOXA AI este asistentul oficial al platformei DOXA pentru pelerinaje ortodoxe. Acest asistent inteligent te poate ajuta să găsești cele mai potrivite pelerinaje în funcție de preferințele tale, să te asiste în procesul de rezervare și să răspundă la întrebările tale despre locurile sfinte din România.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Cum pot rezerva un pelerinaj?</AccordionTrigger>
                  <AccordionContent>
                    Pentru a rezerva un pelerinaj, poți începe prin a spune asistentului DOXA AI ce tip de experiență cauți. După ce primești recomandări, poți selecta un pelerinaj și urma pașii pentru rezervare. Asigură-te că ai un cont creat pe platformă pentru a finaliza rezervarea.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Ce documente sunt necesare?</AccordionTrigger>
                  <AccordionContent>
                    Pentru pelerinajele în România, de obicei ai nevoie de cartea de identitate. Pentru pelerinajele internaționale, vei avea nevoie de pașaport valabil. Poți încărca documentele tale în secțiunea "Documente" pentru verificare înainte de călătorie.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Cum pot contacta un organizator?</AccordionTrigger>
                  <AccordionContent>
                    Poți contacta organizatorul direct din pagina pelerinajului, folosind butonul "Contactează organizatorul". Alternativ, poți cere asistentului DOXA AI să faciliteze comunicarea cu organizatorul pentru întrebări specifice.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Cum pot anula o rezervare?</AccordionTrigger>
                  <AccordionContent>
                    Pentru a anula o rezervare, accesează secțiunea "Rezervările mele" din contul tău, selectează rezervarea pe care dorești să o anulezi și urmează pașii indicați. Reține că fiecare organizator poate avea politici diferite de anulare și rambursare.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}