import { DoxaAI } from '@/components/doxa-ai';
import { Helmet } from 'react-helmet';
import { useAuth } from "@/hooks/use-auth";
import { Bot, Calendar, MapPin, Shield, BookOpen } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function DoxaAIPage() {
  // Folosim hook-ul de autentificare pentru a obține rolul utilizatorului
  const { user } = useAuth();
  const userRole = user?.role || 'user';
  
  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>DOXA AI - Asistent Inteligent pentru Pelerinaje Ortodoxe</title>
        <meta name="description" content="DOXA AI este asistentul inteligent care te ajută să descoperi cele mai potrivite pelerinaje ortodoxe și îți oferă suport personalizat." />
      </Helmet>
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-primary/10 p-2 rounded-full mb-4">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">DOXA AI</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Asistentul inteligent care te ajută să descoperi cele mai potrivite pelerinaje ortodoxe 
          și îți oferă suport personalizat în procesul de rezervare și pregătire.
        </p>
      </div>
      
      <DoxaAI userType={userRole as 'user' | 'organizer' | 'admin'} />
      
      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Cum te poate ajuta DOXA AI?</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Găsește pelerinajul perfect</h3>
                <p className="text-muted-foreground text-sm">
                  Recomandări personalizate de pelerinaje în funcție de preferințele, bugetul și perioada ta disponibilă.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Calendar și sărbători</h3>
                <p className="text-muted-foreground text-sm">
                  Informații despre sărbătorile ortodoxe, hramuri și perioadele optime pentru vizitarea mănăstirilor.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Asistență completă</h3>
                <p className="text-muted-foreground text-sm">
                  Suport pentru rezervări, informații despre documente necesare și răspunsuri la întrebările tale.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Pregătire spirituală</h3>
                <p className="text-muted-foreground text-sm">
                  Sfaturi pentru pregătirea spirituală înainte de pelerinaj și informații despre tradițiile ortodoxe.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-center">Întrebări pe care le poți adresa asistentului DOXA AI</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <span>"Care sunt cele mai populare mănăstiri din Bucovina?"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <span>"Recomandă-mi un pelerinaj pentru weekend în Moldova"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <span>"Ce documente îmi trebuie pentru un pelerinaj la Muntele Athos?"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <span>"Care sunt cele mai importante sărbători ortodoxe din vara aceasta?"</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <span>"Ce mănăstiri au cazare pentru pelerini?"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <span>"Cum ajung la Mănăstirea Putna cu transportul în comun?"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <span>"Ce ar trebui să știu înainte de a vizita o mănăstire?"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-semibold mr-2">•</span>
                <span>"Care sunt regulile de comportament într-o mănăstire ortodoxă?"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}