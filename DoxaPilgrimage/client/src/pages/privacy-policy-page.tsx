import { Helmet } from 'react-helmet';
import { CmsHtml } from '@/components/shared/cms-display';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Helmet>
        <title>Politica de Confidențialitate | Doxa Pelerinaje</title>
        <meta name="description" content="Politica de confidențialitate a platformei Doxa Pelerinaje. Informații despre colectarea, utilizarea și protejarea datelor dvs. personale." />
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
          <h1 className="text-3xl font-bold mb-6 border-b pb-4">Politica de Confidențialitate</h1>
          
          <div className="prose prose-primary max-w-none">
            <CmsHtml 
              contentKey="privacy_policy_content" 
              fallback={`
                <h2>1. Introducere</h2>
                <p>Confidențialitatea datelor dumneavoastră personale este o prioritate pentru Doxa Pelerinaje. Această politică de confidențialitate explică modul în care colectăm, utilizăm, stocăm și protejăm informațiile dumneavoastră când utilizați platforma noastră.</p>
                
                <h2>2. Date Colectate</h2>
                <p>Colectăm următoarele tipuri de informații:</p>
                <ul>
                  <li><strong>Date de identificare:</strong> nume, prenume, adresă de email, număr de telefon.</li>
                  <li><strong>Date de cont:</strong> numele de utilizator, parola (stocată criptat).</li>
                  <li><strong>Date de rezervare:</strong> detaliile pelerinajelor rezervate, preferințele de călătorie.</li>
                  <li><strong>Date de tranzacții:</strong> informații despre plățile efectuate (fără a stoca date complete ale cardului).</li>
                  <li><strong>Date tehnice:</strong> adresa IP, tipul de browser, dispozitivul utilizat, paginile vizitate.</li>
                </ul>
                
                <h2>3. Scopul Colectării Datelor</h2>
                <p>Utilizăm datele dumneavoastră pentru:</p>
                <ul>
                  <li>Administrarea contului dumneavoastră și oferirea serviciilor solicitate.</li>
                  <li>Procesarea și confirmarea rezervărilor de pelerinaje.</li>
                  <li>Comunicarea informațiilor importante despre rezervările dumneavoastră.</li>
                  <li>Îmbunătățirea serviciilor și experienței pe platformă.</li>
                  <li>Respectarea obligațiilor legale.</li>
                </ul>
                
                <h2>4. Baza Legală pentru Prelucrarea Datelor</h2>
                <p>Prelucrăm datele dumneavoastră pe baza:</p>
                <ul>
                  <li>Executării contractului pentru serviciile pe care le-ați solicitat.</li>
                  <li>Consimțământului dumneavoastră pentru comunicări de marketing.</li>
                  <li>Intereselor noastre legitime pentru îmbunătățirea serviciilor și securității.</li>
                  <li>Obligațiilor legale care ne revin conform legislației în vigoare.</li>
                </ul>
                
                <h2>5. Perioada de Păstrare a Datelor</h2>
                <p>Păstrăm datele dumneavoastră personale atât timp cât este necesar pentru scopurile pentru care au fost colectate, inclusiv pentru respectarea cerințelor legale, contabile sau de raportare.</p>
                
                <h2>6. Partajarea Datelor</h2>
                <p>Putem partaja datele dumneavoastră cu:</p>
                <ul>
                  <li>Furnizori de servicii implicați în organizarea pelerinajelor (hoteluri, transportatori).</li>
                  <li>Procesatori de plăți pentru tranzacțiile efectuate.</li>
                  <li>Autorități publice, când este cerut de lege.</li>
                </ul>
                <p>Nu vindem sau închiriem datele dumneavoastră personale către terți pentru scopuri de marketing.</p>
                
                <h2>7. Securitatea Datelor</h2>
                <p>Am implementat măsuri tehnice și organizatorice adecvate pentru a proteja datele dumneavoastră împotriva accesului neautorizat, pierderii sau deteriorării.</p>
                
                <h2>8. Drepturile Dumneavoastră</h2>
                <p>Conform legislației privind protecția datelor, aveți următoarele drepturi:</p>
                <ul>
                  <li>Dreptul de acces la datele dumneavoastră personale.</li>
                  <li>Dreptul de a solicita rectificarea datelor inexacte.</li>
                  <li>Dreptul de a solicita ștergerea datelor (dreptul de a fi uitat).</li>
                  <li>Dreptul la restricționarea prelucrării datelor.</li>
                  <li>Dreptul la portabilitatea datelor.</li>
                  <li>Dreptul de a vă opune prelucrării datelor pentru marketing direct.</li>
                  <li>Dreptul de a depune o plângere la autoritatea de supraveghere.</li>
                </ul>
                
                <h2>9. Cookie-uri și Tehnologii Similare</h2>
                <p>Utilizăm cookie-uri și tehnologii similare pentru a îmbunătăți experiența dumneavoastră pe platformă. Pentru detalii suplimentare, consultați Politica noastră privind Cookie-urile.</p>
                
                <h2>10. Modificări ale Politicii de Confidențialitate</h2>
                <p>Ne rezervăm dreptul de a actualiza această politică de confidențialitate în orice moment. Modificările vor fi publicate pe această pagină, iar în cazul unor modificări semnificative, vom furniza o notificare vizibilă pe platformă.</p>
                
                <h2>11. Contact</h2>
                <p>Pentru întrebări sau solicitări legate de această politică de confidențialitate sau de datele dumneavoastră personale, vă rugăm să ne contactați la adresa de email indicată în secțiunea de contact.</p>
                
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