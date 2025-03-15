import { Helmet } from 'react-helmet';
import { CmsHtml } from '@/components/shared/cms-display';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Helmet>
        <title>Termeni și Condiții | Doxa Pelerinaje</title>
        <meta name="description" content="Termenii și condițiile de utilizare a platformei Doxa Pelerinaje. Informații despre utilizarea serviciilor, responsabilități și politici legale." />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la pagina principală
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-6 border-b pb-4">Termeni și Condiții</h1>
          
          <div className="prose prose-primary max-w-none">
            <CmsHtml 
              contentKey="terms_content" 
              fallback={`
                <h2>1. Introducere</h2>
                <p>Acești Termeni și Condiții guvernează utilizarea platformei Doxa Pelerinaje, inclusiv rezervarea și participarea la pelerinaje. Prin utilizarea platformei noastre și a serviciilor oferite, sunteți de acord cu acești termeni. Vă rugăm să îi citiți cu atenție.</p>
                
                <h2>2. Definiții</h2>
                <p>În acești Termeni și Condiții:</p>
                <ul>
                  <li>"Noi", "nouă", "Doxa Pelerinaje" se referă la platforma și organizatorii de pelerinaje.</li>
                  <li>"Utilizator", "dumneavoastră" se referă la persoana care utilizează platforma.</li>
                  <li>"Pelerinaj" se referă la călătoriile organizate prin intermediul platformei noastre.</li>
                </ul>
                
                <h2>3. Utilizarea Platformei</h2>
                <p>Platforma Doxa Pelerinaje este destinată utilizatorilor care doresc să rezerve și să participe la pelerinaje ortodoxe. Prin utilizarea platformei, vă angajați să furnizați informații corecte și complete.</p>
                
                <h2>4. Crearea Contului</h2>
                <p>Pentru a rezerva un pelerinaj, va trebui să creați un cont. Sunteți responsabil pentru păstrarea confidențialității informațiilor de autentificare și pentru toate activitățile desfășurate în contul dumneavoastră.</p>
                
                <h2>5. Rezervări și Plăți</h2>
                <p>Rezervările sunt confirmate doar după efectuarea plății. Prețurile afișate includ toate taxele și costurile, cu excepția cazului în care se specifică altfel. Modalitățile de plată acceptate sunt descrise în procesul de rezervare.</p>
                
                <h2>6. Anulări și Rambursări</h2>
                <p>Politica de anulare variază în funcție de pelerinaj. Condițiile specifice sunt indicate în descrierea fiecărui pelerinaj. În general, anulările cu 30 de zile înainte de plecare primesc o rambursare de 70%, iar cele cu 15-29 de zile înainte primesc o rambursare de 50%. Anulările cu mai puțin de 15 zile înainte nu sunt eligibile pentru rambursare.</p>
                
                <h2>7. Responsabilități</h2>
                <p>Doxa Pelerinaje se angajează să ofere servicii de calitate, dar nu este responsabilă pentru circumstanțe care depășesc controlul nostru (dezastre naturale, conflicte politice etc.). Participanții sunt responsabili pentru respectarea regulilor și programului pelerinajului.</p>
                
                <h2>8. Modificări ale Programului</h2>
                <p>Ne rezervăm dreptul de a face modificări în programul pelerinajului din motive logistice sau de siguranță. Participanții vor fi informați cât mai curând posibil despre aceste modificări.</p>
                
                <h2>9. Modificări ale Termenilor</h2>
                <p>Ne rezervăm dreptul de a modifica acești termeni în orice moment. Modificările vor fi comunicate prin intermediul platformei. Utilizarea continuă a platformei după publicarea modificărilor constituie acceptarea acestora.</p>
                
                <h2>10. Legislație Aplicabilă</h2>
                <p>Acești termeni sunt guvernați de legislația română. Orice dispute vor fi soluționate în instanțele judecătorești din România.</p>
                
                <h2>11. Contact</h2>
                <p>Pentru întrebări sau clarificări referitoare la acești termeni, vă rugăm să ne contactați la adresa de email indicată în secțiunea de contact.</p>
                
                <p class="text-sm text-muted-foreground mt-8">Ultima actualizare: 9 martie 2025</p>
              `}
              refreshInterval={5000}
            />
          </div>
        </div>
      </div>
    </div>
  );
}